import { BlockType, ParsedLine, FunctionDefinition } from '../types';
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

export function extractFunctions(pseudocode: string): { mainFlow: string; functions: FunctionDefinition[] } {
  const lines = pseudocode.split('\n');
  const functions: FunctionDefinition[] = [];
  const mainFlowLines: string[] = [];
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if this is a function definition
    if (/^function\s+/i.test(line) && line.endsWith('::')) {
      // Extract function name and parameters
      const match = line.match(/^function\s+(\w+)\s*\(([^)]*)\)/i);
      if (match) {
        const functionName = match[1];
        const paramString = match[2];
        const parameters = paramString ? paramString.split(',').map(p => p.trim()) : [];
        
        // Collect function body lines
        const functionLines: string[] = [];
        const functionStartIndex = i;
        i++; // Skip the function definition line
        
        // Find the base indentation of the function
        let baseIndent = -1;
        
        // Collect all lines that belong to this function
        while (i < lines.length) {
          const currentLine = lines[i];
          const currentIndent = (currentLine.match(/^(\s*)/)?.[1]?.length || 0);
          
          // Skip empty lines
          if (!currentLine.trim()) {
            i++;
            continue;
          }
          
          // Set base indentation from first non-empty line
          if (baseIndent === -1) {
            baseIndent = currentIndent;
          }
          
          // If indentation is less than base, we've exited the function
          if (currentIndent < baseIndent) {
            break;
          }
          
          functionLines.push(currentLine);
          i++;
        }
        
        // Parse the function body
        const functionPseudocode = functionLines.join('\n');
        const parsedFunctionLines = parsePseudocode(functionPseudocode);
        
        // Add parameter blocks at the beginning
        const parameterBlocks: ParsedLine[] = parameters.map(param => ({
          content: `Parameter: ${param}`,
          indentLevel: 0,
          blockType: 'input' as BlockType,
          isClosing: false
        }));
        
        // Combine parameters with function body
        const allFunctionBlocks = [...parameterBlocks, ...parsedFunctionLines];
        
        functions.push({
          name: functionName,
          parameters,
          blocks: allFunctionBlocks.map((block, index) => ({
            ...block,
            index,
            position: { x: 0, y: 0, width: 0, height: 0 },
            connections: []
          })),
          originalStartIndex: functionStartIndex
        });
        
        continue; // Don't increment i, it's already at the right position
      }
    }
    
    // This is a main flow line
    mainFlowLines.push(lines[i]);
    i++;
  }
  
  return {
    mainFlow: mainFlowLines.join('\n'),
    functions
  };
}