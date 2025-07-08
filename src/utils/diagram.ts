import { ParsedLine, DiagramBlock, Connection, BlockPosition } from '../types';
import { BLOCK_DIMENSIONS } from '../constants';

export function layoutBlocks(parsedLines: ParsedLine[]): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  const { width, height, paddingY } = BLOCK_DIMENSIONS;
  
  let currentY = paddingY;
  const indentWidth = 250; // Reduced for better nested loop visibility
  const centerX = 400; // Center alignment for main flow
  
  // First pass: create blocks with positions
  let startBlockX: number | null = null;
  
  // Track conditional blocks and their positions
  let conditionalCounter = 0; // Counter for ELSE IF positioning
  let lastConditionalX = centerX - width / 2; // Track the last conditional's X position
  
  parsedLines.forEach((line, index) => {
    // Calculate x position for correct flowchart layout
    let x: number;
    
    const isElse = line.content.toLowerCase() === 'else' && line.blockType === 'condition' && line.isClosing;
    const isElseIf = line.blockType === 'else-if';
    const isMainIf = line.blockType === 'condition' && !line.isClosing;
    const isImplicitElse = line.blockType === 'implicit-else';
    
    if (line.blockType === 'start') {
      x = centerX - width / 2;
      startBlockX = x;
    } else if (line.blockType === 'end') {
      x = startBlockX !== null ? startBlockX : centerX - width / 2;
    } else if (isMainIf) {
      // Main IF block - center column
      x = centerX - width / 2;
      lastConditionalX = x;
      conditionalCounter = 0;
    } else if (isElseIf) {
      // ELSE IF blocks - progressive positioning based on previous ELSE IF blocks
      // Count the number of ELSE IF blocks before this ELSE IF
      let previousElseIfCount = 0;
      for (let j = 0; j < index; j++) {
        if (parsedLines[j].blockType === 'else-if') {
          previousElseIfCount++;
        }
      }
      conditionalCounter = 1 + previousElseIfCount;
      x = centerX + (conditionalCounter * indentWidth) - width / 2;
      lastConditionalX = x;
    } else if (isElse) {
      // ELSE blocks - positioned after all ELSE IF blocks
      // Count the number of ELSE IF blocks before this ELSE
      let elseIfCount = 0;
      for (let j = 0; j < index; j++) {
        if (parsedLines[j].blockType === 'else-if') {
          elseIfCount++;
        }
      }
      conditionalCounter = 1 + elseIfCount;
      x = centerX + (conditionalCounter * indentWidth) - width / 2;
      lastConditionalX = x;
    } else if (isImplicitElse) {
      // Implicit ELSE blocks - positioned in first column to the right
      conditionalCounter = 1;
      x = centerX + (conditionalCounter * indentWidth) - width / 2;
      lastConditionalX = x;
    } else if (line.content.toLowerCase().match(/^end\s+(if|condition)/)) {
      // END IF block - back to center
      x = centerX - width / 2;
      conditionalCounter = 0;
    } else {
      // Content blocks - determine if they're inside a conditional
      const isInsideConditional = index > 0 && 
        (parsedLines[index - 1].blockType === 'condition' || 
         parsedLines[index - 1].blockType === 'else-if' ||
         (parsedLines[index - 1].blockType === 'condition' && parsedLines[index - 1].isClosing));
      
      if (isInsideConditional) {
        // Inside conditionals - use last conditional's position
        x = lastConditionalX;
      } else {
        // Main flow - center
        x = centerX - width / 2;
      }
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
  
  // Simple function to find the end of a conditional structure
  const findConditionalEnd = (startIndex: number): number | null => {
    const startBlock = blocks[startIndex];
    
    for (let i = startIndex + 1; i < blocks.length; i++) {
      const currentBlock = blocks[i];
      
      // Look for "End if" or "End switch" block
      if (currentBlock.content.toLowerCase().match(/^end\s+(if|condition|switch|select)/)) {
        return i;
      }
      
      // For IF/ELSE IF/ELSE structures, skip intermediate conditions
      if (currentBlock.blockType === 'else-if' || 
          (currentBlock.blockType === 'condition' && currentBlock.isClosing) ||
          currentBlock.blockType === 'implicit-else') {
        continue; // Skip ELSE IF, ELSE, and IMPLICIT-ELSE blocks, keep looking for END IF
      }
      
      // Or look for block with lower indentation (fallback)
      if (currentBlock.indentLevel < startBlock.indentLevel) {
        return i;
      }
    }
    
    return null;
  };
  
  // Simple function to check if a block is inside a conditional structure
  const isInsideConditional = (blockIndex: number): number | null => {
    // Walk backwards to find the main IF block (not ELSE/ELSE-IF)
    let mainIfIndex = null;
    
    for (let i = blockIndex - 1; i >= 0; i--) {
      const checkBlock = blocks[i];
      
      // Found a main IF block (not closing, not else-if)
      if (checkBlock.blockType === 'condition' && !checkBlock.isClosing) {
        mainIfIndex = i;
        break;
      }
      // Found an ELSE IF block, keep looking for the main IF
      else if (checkBlock.blockType === 'else-if') {
        continue; // Keep looking backwards
      }
      // Found an ELSE block, keep looking for the main IF
      else if (checkBlock.blockType === 'condition' && checkBlock.isClosing) {
        continue; // Keep looking backwards
      }
      // Found an IMPLICIT-ELSE block, keep looking for the main IF
      else if (checkBlock.blockType === 'implicit-else') {
        continue; // Keep looking backwards
      }
    }
    
    if (mainIfIndex !== null) {
      // Find the end of the main IF conditional structure
      const endIndex = findConditionalEnd(mainIfIndex);
      if (endIndex !== null && blockIndex < endIndex) {
        return endIndex; // Return the end index of the main conditional
      }
    }
    
    return null;
  };
  
  // Third pass: create connections with simple logic
  blocks.forEach((block, index) => {
    const connections: Connection[] = [];
    
    // SIMPLE RULE-BASED CONNECTION LOGIC
    
    if (block.blockType === 'condition' && !block.isClosing) {
      // IF block: YES to next, NO to next condition/else/end
      if (index < blocks.length - 1) {
        connections.push({ from: index, to: index + 1, type: 'yes' });
      }
      
      // Find the next condition/else/end block for NO arrow
      // Priority: 1) ELSE/ELSE-IF/IMPLICIT-ELSE blocks, 2) Block AFTER END IF
      let noTarget = null;
      for (let i = index + 1; i < blocks.length; i++) {
        if (blocks[i].blockType === 'else-if' || 
            (blocks[i].blockType === 'condition' && blocks[i].isClosing) ||
            blocks[i].blockType === 'implicit-else') {
          noTarget = i;
          break;
        } else if (blocks[i].content.toLowerCase().match(/^end\s+(if|condition)/)) {
          // If no ELSE found, go to the block AFTER END IF
          if (i + 1 < blocks.length) {
            noTarget = i + 1;
          } else {
            noTarget = i; // Fallback to END IF if no block after
          }
          break;
        }
      }
      
      if (noTarget !== null) {
        connections.push({ from: index, to: noTarget, type: 'no' });
      }
      
    } else if (block.blockType === 'else-if') {
      // ELSE IF block: YES to next, NO to next condition/else/end  
      if (index < blocks.length - 1) {
        connections.push({ from: index, to: index + 1, type: 'yes' });
      }
      
      // Find the next condition/else/end block for NO arrow
      // Priority: 1) ELSE/ELSE-IF blocks, 2) Block AFTER END IF
      let noTarget = null;
      for (let i = index + 1; i < blocks.length; i++) {
        if (blocks[i].blockType === 'else-if' || 
            (blocks[i].blockType === 'condition' && blocks[i].isClosing)) {
          noTarget = i;
          break;
        } else if (blocks[i].content.toLowerCase().match(/^end\s+(if|condition)/)) {
          // If no ELSE found, go to the block AFTER END IF
          if (i + 1 < blocks.length) {
            noTarget = i + 1;
          } else {
            noTarget = i; // Fallback to END IF if no block after
          }
          break;
        }
      }
      
      if (noTarget !== null) {
        connections.push({ from: index, to: noTarget, type: 'no' });
      }
      
    } else if (block.blockType === 'condition' && block.isClosing) {
      // ELSE block: connect to next
      if (index < blocks.length - 1) {
        connections.push({ from: index, to: index + 1, type: 'default' });
      }
      
    } else if (block.blockType === 'implicit-else') {
      // Implicit ELSE block: connect directly to END IF with red arrow
      for (let i = index + 1; i < blocks.length; i++) {
        if (blocks[i].content.toLowerCase().match(/^end\s+(if|condition)/)) {
          connections.push({ from: index, to: i, type: 'no' });
          break;
        }
      }
      
    } else if (block.blockType === 'return') {
      // Return blocks with recursive calls
      const isRecursiveCall = block.content.toLowerCase().includes('call') || 
                              block.content.toLowerCase().includes('factorial') ||
                              block.content.toLowerCase().includes('fibonacci');
      
      if (isRecursiveCall) {
        // Find the first condition block (usually the function's conditional logic)
        for (let i = 0; i < blocks.length; i++) {
          if (blocks[i].blockType === 'condition' && !blocks[i].isClosing) {
            connections.push({ from: index, to: i, type: 'recursive' });
            break;
          }
        }
      }
      
      // Return blocks inside conditionals should connect to the conditional end
      const conditionalEnd = isInsideConditional(index);
      if (conditionalEnd !== null) {
        // Inside a conditional: connect directly to the end
        connections.push({ from: index, to: conditionalEnd, type: 'default' });
      } else {
        // Outside conditionals: connect to next block if not at end
        if (index < blocks.length - 1) {
          connections.push({ from: index, to: index + 1, type: 'default' });
        }
      }
      
    } else {
      // CONTENT BLOCKS (Output, Process, etc.)
      const conditionalEnd = isInsideConditional(index);
      
      if (conditionalEnd !== null) {
        // Inside a conditional: connect directly to the end
        connections.push({ from: index, to: conditionalEnd, type: 'default' });
      } else {
        // Outside conditionals: connect to next block
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