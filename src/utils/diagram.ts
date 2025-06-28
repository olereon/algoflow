import { ParsedLine, DiagramBlock, Connection, BlockPosition } from '../types';
import { BLOCK_DIMENSIONS } from '../constants';

interface ControlFlowContext {
  type: 'if' | 'else' | 'loop';
  startIndex: number;
  elseIndex?: number;
  endIndex?: number;
  parentContext?: ControlFlowContext;
}

export function layoutBlocks(parsedLines: ParsedLine[]): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  const { width, height, paddingY } = BLOCK_DIMENSIONS;
  
  let currentY = paddingY;
  const indentWidth = 250; // Reduced for better nested loop visibility
  const centerX = 400; // Center alignment for main flow
  
  // First pass: create blocks with positions
  let startBlockX: number | null = null;
  
  parsedLines.forEach((line, index) => {
    // Calculate x position for better alignment
    let x: number;
    
    // Special handling for START and END blocks
    if (line.blockType === 'start') {
      x = centerX - width / 2;
      startBlockX = x; // Remember START block position
    } else if (line.blockType === 'end') {
      // END block should align with START block
      x = startBlockX !== null ? startBlockX : centerX - width / 2;
    } else if (line.indentLevel === 0) {
      // Other main flow blocks centered
      x = centerX - width / 2;
    } else {
      // Nested blocks offset to the right
      x = centerX + (line.indentLevel * indentWidth) - width / 2;
    }
    
    const position: BlockPosition = {
      x,
      y: currentY,
      width,
      height
    };
    
    blocks.push({
      ...line,
      index,
      position,
      connections: []
    });
    
    
    // Add extra spacing for better visual separation
    currentY += height + paddingY + (line.blockType === 'end' ? paddingY * 2 : 0);
  });
  
  // Second pass: Place END block below the lowest non-END block
  const endBlocks = blocks.filter(block => block.blockType === 'end');
  const nonEndBlocks = blocks.filter(block => block.blockType !== 'end');
  
  if (endBlocks.length > 0 && nonEndBlocks.length > 0) {
    // Find the lowest Y position among non-END blocks
    const lowestY = Math.max(...nonEndBlocks.map(block => block.position.y + block.position.height));
    
    // Place END blocks just below the lowest block
    endBlocks.forEach(endBlock => {
      endBlock.position.y = lowestY + paddingY;
    });
  }
  
  // Third pass: analyze control flow structure
  const analyzeControlFlow = (): Map<number, ControlFlowContext> => {
    const contextMap = new Map<number, ControlFlowContext>();
    const contextStack: ControlFlowContext[] = [];
    
    blocks.forEach((block, index) => {
      if (block.blockType === 'condition' && !block.isClosing) {
        // Start of IF block
        const context: ControlFlowContext = {
          type: 'if',
          startIndex: index,
          parentContext: contextStack[contextStack.length - 1]
        };
        
        // Find corresponding ELSE and END
        let nestLevel = 0;
        for (let i = index + 1; i < blocks.length; i++) {
          const currentBlock = blocks[i];
          
          if (currentBlock.blockType === 'condition') {
            if (!currentBlock.isClosing) {
              nestLevel++;
            } else if (nestLevel === 0) {
              if (currentBlock.content.toLowerCase().startsWith('else')) {
                context.elseIndex = i;
              }
            } else {
              nestLevel--;
            }
          }
        }
        
        // Find the END block (first block with lower or equal indentation after the IF/ELSE structure)
        for (let i = index + 1; i < blocks.length; i++) {
          if (blocks[i].indentLevel < block.indentLevel || 
              (blocks[i].indentLevel === 0 && blocks[i].blockType === 'end')) {
            context.endIndex = i;
            break;
          }
        }
        
        contextMap.set(index, context);
        contextStack.push(context);
        
      } else if (block.blockType === 'condition' && block.isClosing && block.content.toLowerCase().startsWith('else')) {
        // ELSE block
        if (contextStack.length > 0) {
          const ifContext = contextStack[contextStack.length - 1];
          const elseContext: ControlFlowContext = {
            type: 'else',
            startIndex: index,
            endIndex: ifContext.endIndex,
            parentContext: ifContext.parentContext
          };
          contextMap.set(index, elseContext);
        }
        
      } else if (block.blockType === 'loop') {
        // Loop block
        const context: ControlFlowContext = {
          type: 'loop',
          startIndex: index,
          parentContext: contextStack[contextStack.length - 1]
        };
        
        // Find end of loop - look for decrease in indentation
        let loopEndIndex = index;
        let currentIndent = block.indentLevel;
        
        for (let i = index + 1; i < blocks.length; i++) {
          // Check if we've exited the loop (lower indentation)
          if (blocks[i].indentLevel < currentIndent) {
            loopEndIndex = i - 1;
            break;
          }
          // If we reach the end, the last block at same or higher indent is the end
          if (i === blocks.length - 1 && blocks[i].indentLevel >= currentIndent) {
            loopEndIndex = i;
          }
        }
        
        context.endIndex = loopEndIndex;
        contextMap.set(index, context);
        contextStack.push(context);
      }
      
      // Pop context when we exit its scope
      while (contextStack.length > 0) {
        const currentContext = contextStack[contextStack.length - 1];
        if (currentContext.elseIndex !== undefined && index >= currentContext.elseIndex) {
          contextStack.pop();
          break;
        } else if (currentContext.endIndex !== undefined && index >= currentContext.endIndex) {
          contextStack.pop();
        } else {
          break;
        }
      }
    });
    
    return contextMap;
  };
  
  const contextMap = analyzeControlFlow();
  
  // Helper function to find which IF/ELSE context a block belongs to
  const findBlockContext = (blockIndex: number): { ifContext?: ControlFlowContext, inIfBranch?: boolean, inElseBranch?: boolean } => {
    for (const [contextIndex, context] of contextMap.entries()) {
      if (context.type === 'if') {
        // Check if block is in IF branch
        if (blockIndex > contextIndex && context.elseIndex !== undefined && blockIndex < context.elseIndex) {
          return { ifContext: context, inIfBranch: true };
        }
        // Check if block is in ELSE branch
        if (context.elseIndex !== undefined && blockIndex > context.elseIndex && 
            context.endIndex !== undefined && blockIndex < context.endIndex) {
          return { ifContext: context, inElseBranch: true };
        }
      }
    }
    return {};
  };
  
  // Fourth pass: create connections based on control flow
  blocks.forEach((block, index) => {
    const connections: Connection[] = [];
    const context = contextMap.get(index);
    
    if (block.blockType === 'condition' && !block.isClosing) {
      // IF block
      if (context) {
        // YES arrow: goes to next block (first block inside IF)
        if (index < blocks.length - 1) {
          connections.push({ from: index, to: index + 1, type: 'yes' });
        }
        
        // NO arrow: goes to ELSE or to end of IF/ELSE structure
        if (context.elseIndex !== undefined) {
          connections.push({ from: index, to: context.elseIndex, type: 'no' });
        } else if (context.endIndex !== undefined && context.endIndex < blocks.length) {
          connections.push({ from: index, to: context.endIndex, type: 'no' });
        }
      }
      
    } else if (block.blockType === 'condition' && block.isClosing && block.content.toLowerCase().startsWith('else')) {
      // ELSE block: connect to next block
      if (index < blocks.length - 1) {
        connections.push({ from: index, to: index + 1, type: 'default' });
      }
      
    } else if (block.blockType === 'loop') {
      // Loop block
      if (index < blocks.length - 1) {
        connections.push({ from: index, to: index + 1, type: 'default' });
      }
      
      // Add loop-back connection with depth information
      if (context && context.endIndex !== undefined && context.endIndex > index) {
        // Calculate loop nesting depth
        let depth = 0;
        let currentContext = context.parentContext;
        while (currentContext) {
          if (currentContext.type === 'loop') {
            depth++;
          }
          currentContext = currentContext.parentContext;
        }
        
        blocks[context.endIndex].connections.push({ 
          from: context.endIndex, 
          to: index, 
          type: 'loop-back',
          depth: depth
        });
      }
      
    } else if (block.blockType !== 'end') {
      // Regular block - need to determine where it should connect
      const blockContext = findBlockContext(index);
      
      if (blockContext.inIfBranch && blockContext.ifContext) {
        // We're in an IF branch
        // Check if this is the last block before ELSE
        const nextBlockIndex = index + 1;
        if (blockContext.ifContext.elseIndex !== undefined && nextBlockIndex >= blockContext.ifContext.elseIndex) {
          // This is the last block in IF branch, jump to END
          if (blockContext.ifContext.endIndex !== undefined && blockContext.ifContext.endIndex < blocks.length) {
            connections.push({ from: index, to: blockContext.ifContext.endIndex, type: 'default' });
          }
        } else {
          // Not the last block, connect to next
          if (nextBlockIndex < blocks.length) {
            connections.push({ from: index, to: nextBlockIndex, type: 'default' });
          }
        }
      } else if (blockContext.inElseBranch && blockContext.ifContext) {
        // We're in an ELSE branch
        const nextBlockIndex = index + 1;
        if (blockContext.ifContext.endIndex !== undefined && nextBlockIndex >= blockContext.ifContext.endIndex) {
          // This is the last block in ELSE branch, connect to END
          if (blockContext.ifContext.endIndex < blocks.length) {
            connections.push({ from: index, to: blockContext.ifContext.endIndex, type: 'default' });
          }
        } else {
          // Not the last block, connect to next
          if (nextBlockIndex < blocks.length) {
            connections.push({ from: index, to: nextBlockIndex, type: 'default' });
          }
        }
      } else {
        // Regular flow - connect to next block
        if (index + 1 < blocks.length) {
          connections.push({ from: index, to: index + 1, type: 'default' });
        }
      }
    }
    
    // Assign connections to block
    block.connections = connections;
  });
  
  return blocks;
}

export function calculateSvgDimensions(blocks: DiagramBlock[]): { width: number; height: number } {
  if (blocks.length === 0) {
    return { width: 800, height: 600 };
  }
  
  const maxX = Math.max(...blocks.map(b => b.position.x + b.position.width));
  const maxY = Math.max(...blocks.map(b => b.position.y + b.position.height));
  
  return {
    width: maxX + BLOCK_DIMENSIONS.svgPadding * 2,
    height: maxY + BLOCK_DIMENSIONS.svgPadding * 2
  };
}