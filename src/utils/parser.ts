import { BlockType, ParsedLine } from '../types';
import { KEYWORD_PATTERNS } from '../constants';

export function detectBlockType(line: string): BlockType {
  const trimmedLine = line.trim().toLowerCase();
  
  for (const [blockType, patterns] of Object.entries(KEYWORD_PATTERNS) as [BlockType, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(trimmedLine)) {
        return blockType;
      }
    }
  }
  
  return 'process'; // Default block type
}

export function parsePseudocode(pseudocode: string): ParsedLine[] {
  const lines = pseudocode.split('\n').filter(line => line.trim());
  const parsedLines: ParsedLine[] = [];
  let currentIndentLevel = 0;
  const indentStack: number[] = [0];

  for (const line of lines) {
    const leadingSpaces = line.match(/^(\s*)/)?.[1]?.length || 0;
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;

    // Check if line ends with ::
    const hasDoubleColon = trimmedLine.endsWith('::');
    const content = hasDoubleColon ? trimmedLine.slice(0, -2).trim() : trimmedLine;
    
    // Determine block type
    const blockType = detectBlockType(content);
    
    // Check if it's a closing statement (ELSE should be at same level as IF)
    const isClosing = /^(else|end)/i.test(content);
    
    // Handle indentation
    if (isClosing && content.toLowerCase().startsWith('else')) {
      // ELSE should be at the same level as its corresponding IF
      // Pop one level before processing
      if (currentIndentLevel > 0) {
        currentIndentLevel--;
      }
    } else if (leadingSpaces > indentStack[indentStack.length - 1]) {
      indentStack.push(leadingSpaces);
      currentIndentLevel++;
    } else if (leadingSpaces < indentStack[indentStack.length - 1]) {
      while (indentStack.length > 1 && leadingSpaces <= indentStack[indentStack.length - 1]) {
        indentStack.pop();
        currentIndentLevel--;
      }
    }
    
    
    parsedLines.push({
      content,
      indentLevel: currentIndentLevel,
      blockType,
      isClosing
    });
  }

  return parsedLines;
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}