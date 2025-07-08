import { BlockType, ParsedLine, FunctionDefinition, RecursiveCallPoint, RecursionPattern, RecursionMetadata } from '../types';
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
    
    // Check if it's a closing statement (ELSE, ELSE IF should be at same level as IF)
    const isClosing = /^(else|end|case|default)/i.test(content);
    
    // Handle indentation
    if (isClosing && (content.toLowerCase().startsWith('else') || /^(case|default)/i.test(content))) {
      // ELSE/ELSE IF/CASE should be at the same level as their corresponding IF/SWITCH
      // Pop one level before processing for ELSE, but not for ELSE IF
      if (content.toLowerCase().startsWith('else') && !content.toLowerCase().includes('if') && currentIndentLevel > 0) {
        currentIndentLevel--;
      } else if (/^(case|default)/i.test(content) && currentIndentLevel > 0) {
        // CASE blocks should align with SWITCH
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

  return processImplicitElse(parsedLines);
}

/**
 * Processes parsed lines and inserts implicit-else blocks for IF statements without explicit ELSE
 */
function processImplicitElse(parsedLines: ParsedLine[]): ParsedLine[] {
  const result: ParsedLine[] = [];
  
  for (let i = 0; i < parsedLines.length; i++) {
    const currentLine = parsedLines[i];
    result.push(currentLine);
    
    // Check if this is an IF block (condition, not closing)
    if (currentLine.blockType === 'condition' && !currentLine.isClosing) {
      // Look ahead to see if there's an explicit ELSE or ELSE IF
      let hasExplicitElse = false;
      let endIfIndex = -1;
      
      for (let j = i + 1; j < parsedLines.length; j++) {
        const nextLine = parsedLines[j];
        
        // Found ELSE or ELSE IF
        if (nextLine.blockType === 'else-if' || 
            (nextLine.blockType === 'condition' && nextLine.isClosing)) {
          hasExplicitElse = true;
          break;
        }
        
        // Found END IF
        if (nextLine.content.toLowerCase().match(/^end\s+(if|condition)/)) {
          endIfIndex = j;
          break;
        }
      }
      
      // If no explicit ELSE and we found END IF, insert implicit-else
      if (!hasExplicitElse && endIfIndex !== -1) {
        // We'll insert the implicit-else block when we reach the END IF
        // Mark this for later processing
        (currentLine as any)._needsImplicitElse = true;
      }
    }
    
    // If this is an END IF and the previous IF needs implicit else
    if (currentLine.content.toLowerCase().match(/^end\s+(if|condition)/)) {
      // Look backwards to find the IF that needs implicit else
      for (let k = result.length - 2; k >= 0; k--) {
        const prevLine = result[k];
        if (prevLine.blockType === 'condition' && !prevLine.isClosing && (prevLine as any)._needsImplicitElse) {
          // Insert implicit-else block before END IF
          const implicitElse: ParsedLine = {
            content: 'NO',
            indentLevel: currentLine.indentLevel,
            blockType: 'implicit-else',
            isClosing: true
          };
          
          // Insert before the current END IF
          result.splice(result.length - 1, 0, implicitElse);
          
          // Clean up the marker
          delete (prevLine as any)._needsImplicitElse;
          break;
        }
      }
    }
  }
  
  return result;
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Detects if a function calls itself recursively by analyzing function body
 */
function detectRecursiveCalls(functionName: string, functionLines: string[]): RecursiveCallPoint[] {
  const callPoints: RecursiveCallPoint[] = [];
  
  functionLines.forEach((line, index) => {
    const trimmedLine = line.trim().toLowerCase();
    
    // Check for function calls - patterns like "call functionName" or "functionName(...)"
    const callPatterns = [
      new RegExp(`\\bcall\\s+${functionName.toLowerCase()}\\b`, 'i'),
      new RegExp(`\\b${functionName.toLowerCase()}\\s*\\(`, 'i'),
      new RegExp(`\\binvoke\\s+${functionName.toLowerCase()}\\b`, 'i'),
      new RegExp(`\\bexecute\\s+${functionName.toLowerCase()}\\b`, 'i')
    ];
    
    for (const pattern of callPatterns) {
      if (pattern.test(trimmedLine)) {
        // Extract parameters if present
        const paramMatch = trimmedLine.match(/\(([^)]*)\)/);
        const parameters = paramMatch ? 
          paramMatch[1].split(',').map(p => p.trim()).filter(p => p) : [];
        
        // Check if this appears to be in a base case (within conditional)
        const isBaseCase = /^(if|else\s*if|else|case|default)/i.test(trimmedLine) ||
                          functionLines.slice(Math.max(0, index - 3), index)
                            .some(prevLine => /^(if|else\s*if|else|case|default)/i.test(prevLine.trim()));
        
        callPoints.push({
          lineIndex: index,
          content: line.trim(),
          parameters,
          isBaseCase
        });
        
        break; // Found a match, no need to check other patterns
      }
    }
  });
  
  return callPoints;
}

/**
 * Analyzes recursion pattern based on function content and structure
 */
function analyzeRecursionPattern(_functionName: string, functionLines: string[], callPoints: RecursiveCallPoint[]): RecursionPattern | undefined {
  if (callPoints.length === 0) return undefined;
  
  const bodyText = functionLines.join(' ').toLowerCase();
  const patterns: { type: RecursionPattern['type'], keywords: string[], confidence: number }[] = [
    {
      type: 'factorial',
      keywords: ['factorial', 'fact', 'n!', 'multiply', 'product', 'n-1', 'n - 1'],
      confidence: 0
    },
    {
      type: 'fibonacci',
      keywords: ['fibonacci', 'fib', 'n-1', 'n-2', 'n - 1', 'n - 2', 'add', 'sum'],
      confidence: 0
    },
    {
      type: 'tree-traversal',
      keywords: ['tree', 'node', 'left', 'right', 'child', 'parent', 'traverse', 'visit'],
      confidence: 0
    }
  ];
  
  // Calculate confidence scores based on keyword matches
  for (const pattern of patterns) {
    let matches = 0;
    for (const keyword of pattern.keywords) {
      if (bodyText.includes(keyword)) {
        matches++;
      }
    }
    pattern.confidence = matches / pattern.keywords.length;
  }
  
  // Find the best matching pattern
  const bestPattern = patterns.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  );
  
  if (bestPattern.confidence > 0.3) { // Threshold for pattern recognition
    return {
      type: bestPattern.type,
      confidence: bestPattern.confidence,
      baseCase: extractBaseCase(functionLines),
      recursiveCase: extractRecursiveCase(functionLines, callPoints)
    };
  }
  
  // Default to generic pattern if no specific pattern detected
  return {
    type: 'generic',
    confidence: 0.5,
    baseCase: extractBaseCase(functionLines),
    recursiveCase: extractRecursiveCase(functionLines, callPoints)
  };
}

/**
 * Extracts base case conditions from function
 */
function extractBaseCase(functionLines: string[]): string | undefined {
  for (const line of functionLines) {
    const trimmed = line.trim().toLowerCase();
    
    // Look for return statements without recursive calls
    if (trimmed.startsWith('return') && !trimmed.includes('call')) {
      return line.trim();
    }
    
    // Look for conditional blocks that might contain base cases
    if (/^if\s+.*(=|==|<=|>=|<|>)/.test(trimmed)) {
      return line.trim();
    }
  }
  
  return undefined;
}

/**
 * Extracts recursive case logic
 */
function extractRecursiveCase(functionLines: string[], callPoints: RecursiveCallPoint[]): string | undefined {
  if (callPoints.length === 0) return undefined;
  
  // Find the line with the recursive call
  const recursiveCallLine = callPoints[0];
  
  // Look for the context around the recursive call
  const contextLines = functionLines.slice(
    Math.max(0, recursiveCallLine.lineIndex - 1),
    Math.min(functionLines.length, recursiveCallLine.lineIndex + 2)
  );
  
  return contextLines.join(' ').trim();
}

/**
 * Extracts base and recursive cases from function body
 */
function extractCases(functionLines: string[], callPoints: RecursiveCallPoint[]): { baseCases: string[], recursiveCases: string[] } {
  const baseCases: string[] = [];
  const recursiveCases: string[] = [];
  
  let inConditional = false;
  let currentCase: string[] = [];
  
  for (let i = 0; i < functionLines.length; i++) {
    const line = functionLines[i];
    const trimmed = line.trim().toLowerCase();
    
    // Start of conditional block
    if (/^(if|else\s*if|else)/i.test(trimmed)) {
      inConditional = true;
      currentCase = [line.trim()];
      continue;
    }
    
    // End of conditional block
    if (/^end\s+(if|condition)/i.test(trimmed)) {
      if (currentCase.length > 0) {
        const caseContent = currentCase.join(' ');
        const hasRecursiveCall = callPoints.some(cp => 
          currentCase.some(caseLine => caseLine.includes(cp.content))
        );
        
        if (hasRecursiveCall) {
          recursiveCases.push(caseContent);
        } else if (caseContent.toLowerCase().includes('return')) {
          baseCases.push(caseContent);
        }
      }
      inConditional = false;
      currentCase = [];
      continue;
    }
    
    // Collect lines within conditional
    if (inConditional) {
      currentCase.push(line.trim());
    }
    
    // Standalone return statements (base cases)
    if (trimmed.startsWith('return') && !inConditional) {
      const hasRecursiveCall = callPoints.some(cp => cp.lineIndex === i);
      if (!hasRecursiveCall) {
        baseCases.push(line.trim());
      }
    }
  }
  
  return { baseCases, recursiveCases };
}

/**
 * Analyzes function for recursive patterns and metadata
 */
function analyzeRecursion(functionName: string, functionLines: string[]): RecursionMetadata {
  const callPoints = detectRecursiveCalls(functionName, functionLines);
  const isRecursive = callPoints.length > 0;
  
  if (!isRecursive) {
    return {
      isRecursive: false,
      callPoints: [],
      baseCases: [],
      recursiveCases: []
    };
  }
  
  const pattern = analyzeRecursionPattern(functionName, functionLines, callPoints);
  const { baseCases, recursiveCases } = extractCases(functionLines, callPoints);
  
  // Estimate maximum depth based on pattern
  let maxDepthHint: number | undefined;
  if (pattern?.type === 'factorial' || pattern?.type === 'fibonacci') {
    // Look for parameter hints in base cases
    const depthMatch = baseCases.join(' ').match(/(\d+)/);
    maxDepthHint = depthMatch ? parseInt(depthMatch[1]) + 5 : 10;
  } else if (pattern?.type === 'tree-traversal') {
    maxDepthHint = 20; // Typical tree depth
  }
  
  return {
    isRecursive,
    callPoints,
    pattern,
    baseCases,
    recursiveCases,
    maxDepthHint
  };
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
        
        // Analyze recursion
        const recursionMetadata = analyzeRecursion(functionName, functionLines);
        
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
          originalStartIndex: functionStartIndex,
          recursion: recursionMetadata.isRecursive ? recursionMetadata : undefined
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