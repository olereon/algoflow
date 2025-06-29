import { ParsedLine, DiagramBlock, Connection, BlockPosition } from '../types';
import { BLOCK_DIMENSIONS } from '../constants';

export function layoutBlocks(parsedLines: ParsedLine[]): DiagramBlock[] {
  const blocks: DiagramBlock[] = [];
  const { width, height, paddingY } = BLOCK_DIMENSIONS;
  
  let currentY = paddingY;
  const indentWidth = 250;
  const centerX = 400;
  
  // First pass: create blocks with positions
  let startBlockX: number | null = null;
  
  parsedLines.forEach((line, index) => {
    let x: number;
    
    if (line.blockType === 'start') {
      x = centerX - width / 2;
      startBlockX = x;
    } else if (line.blockType === 'end') {
      x = startBlockX !== null ? startBlockX : centerX - width / 2;
    } else if (line.indentLevel === 0) {
      x = centerX - width / 2;
    } else {
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
    
    currentY += height + paddingY + (line.blockType === 'end' ? paddingY * 2 : 0);
  });
  
  // Second pass: Place END block below the lowest non-END block
  const endBlocks = blocks.filter(block => block.blockType === 'end');
  const nonEndBlocks = blocks.filter(block => block.blockType !== 'end');
  
  if (endBlocks.length > 0 && nonEndBlocks.length > 0) {
    const lowestY = Math.max(...nonEndBlocks.map(block => block.position.y + block.position.height));
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
      
      // Or look for block with lower indentation
      if (currentBlock.indentLevel < startBlock.indentLevel) {
        return i;
      }
    }
    
    return null;
  };
  
  // Simple function to check if a block is inside a conditional structure
  const isInsideConditional = (blockIndex: number): number | null => {
    // Walk backwards to find the nearest conditional start
    for (let i = blockIndex - 1; i >= 0; i--) {
      const checkBlock = blocks[i];
      
      // Found a conditional block
      if (checkBlock.blockType === 'condition' || checkBlock.blockType === 'else-if' || 
          checkBlock.blockType === 'switch') {
        
        // Check if current block is within this conditional's scope
        const endIndex = findConditionalEnd(i);
        if (endIndex !== null && blockIndex < endIndex) {
          return endIndex; // Return the end index of the conditional
        }
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
      for (let i = index + 1; i < blocks.length; i++) {
        if (blocks[i].blockType === 'else-if' || 
            (blocks[i].blockType === 'condition' && blocks[i].isClosing) ||
            blocks[i].content.toLowerCase().match(/^end\s+(if|condition)/)) {
          connections.push({ from: index, to: i, type: 'no' });
          break;
        }
      }
      
    } else if (block.blockType === 'else-if') {
      // ELSE IF block: YES to next, NO to next condition/else/end  
      if (index < blocks.length - 1) {
        connections.push({ from: index, to: index + 1, type: 'yes' });
      }
      
      // Find the next condition/else/end block for NO arrow
      for (let i = index + 1; i < blocks.length; i++) {
        if (blocks[i].blockType === 'else-if' || 
            (blocks[i].blockType === 'condition' && blocks[i].isClosing) ||
            blocks[i].content.toLowerCase().match(/^end\s+(if|condition)/)) {
          connections.push({ from: index, to: i, type: 'no' });
          break;
        }
      }
      
    } else if (block.blockType === 'condition' && block.isClosing) {
      // ELSE block: connect to next
      if (index < blocks.length - 1) {
        connections.push({ from: index, to: index + 1, type: 'default' });
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