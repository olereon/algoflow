import { ParsedLine, ValidationResult, FunctionDefinition } from '../types';

export function validatePseudocode(parsedLines: ParsedLine[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for start block
  const hasStart = parsedLines.some(line => line.blockType === 'start');
  if (!hasStart) {
    errors.push('Missing START block');
  }
  
  // Check for end block
  const hasEnd = parsedLines.some(line => line.blockType === 'end');
  if (!hasEnd) {
    errors.push('Missing END block');
  }
  
  // Check for unclosed conditions
  let openConditions = 0;
  let openLoops = 0;
  
  parsedLines.forEach((line, index) => {
    if (line.blockType === 'condition' && !line.isClosing) {
      openConditions++;
    } else if (line.blockType === 'condition' && line.isClosing) {
      openConditions--;
    }
    
    if (line.blockType === 'loop') {
      openLoops++;
      
      // Check for potential infinite loops
      const nextLines = parsedLines.slice(index + 1, index + 10);
      const hasLoopControl = nextLines.some(l => 
        l.content.toLowerCase().includes('break') ||
        l.content.toLowerCase().includes('continue') ||
        l.content.toLowerCase().includes('increment') ||
        l.content.toLowerCase().includes('decrement')
      );
      
      if (!hasLoopControl) {
        warnings.push(`Potential infinite loop detected at line ${index + 1}`);
      }
    }
  });
  
  if (openConditions > 0) {
    errors.push(`${openConditions} unclosed condition block(s)`);
  }
  
  if (openLoops > 0) {
    warnings.push(`${openLoops} unclosed loop(s) - ensure proper loop termination`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates recursive function structure
 */
export function validateRecursiveFunction(func: FunctionDefinition): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!func.recursion?.isRecursive) {
    return { isValid: true, errors: [], warnings: [] };
  }
  
  const recursion = func.recursion;
  
  // Check for base cases
  if (recursion.baseCases.length === 0) {
    errors.push(`Recursive function '${func.name}' is missing base case(s)`);
  }
  
  // Check for recursive calls
  if (recursion.callPoints.length === 0) {
    errors.push(`Function '${func.name}' is marked as recursive but has no recursive calls`);
  }
  
  // Validate base case structure
  recursion.baseCases.forEach((baseCase, index) => {
    if (!baseCase.condition) {
      warnings.push(`Base case ${index + 1} in '${func.name}' has no condition`);
    }
    
    if (baseCase.exitType === 'empty' && !baseCase.returnValue) {
      warnings.push(`Base case ${index + 1} in '${func.name}' has no return value`);
    }
  });
  
  // Check for potential stack overflow
  if (recursion.recursionType === 'tree' || recursion.recursionType === 'multiple') {
    if (!recursion.maxDepthHint || recursion.maxDepthHint > 100) {
      warnings.push(`Recursive function '${func.name}' may cause stack overflow with deep recursion`);
    }
  }
  
  // Validate parameter transformations
  recursion.recursiveCases.forEach((recCase, index) => {
    if (recCase.transformations.length === 0) {
      warnings.push(`Recursive case ${index + 1} in '${func.name}' has no parameter transformations - potential infinite recursion`);
    }
    
    // Check for proper decrement/increment
    const hasProperTransform = recCase.transformations.some(t => 
      t.transformationType === 'decrement' || 
      t.transformationType === 'increment' ||
      t.transformationType === 'divide' ||
      t.transformationType === 'property-access'
    );
    
    if (!hasProperTransform) {
      warnings.push(`Recursive case ${index + 1} in '${func.name}' may not converge to base case`);
    }
  });
  
  // Check for tail recursion optimization hint
  if (recursion.recursionType === 'tail') {
    warnings.push(`Function '${func.name}' uses tail recursion - consider iterative approach for better performance`);
  }
  
  // Validate mutual recursion
  if (recursion.recursionType === 'mutual') {
    warnings.push(`Function '${func.name}' uses mutual recursion - ensure all mutually recursive functions are defined`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates function structure (without START/END requirements)
 */
export function validateFunctionStructure(parsedLines: ParsedLine[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for unclosed conditions
  let openConditions = 0;
  let openLoops = 0;
  
  parsedLines.forEach((line, index) => {
    if (line.blockType === 'condition' && !line.isClosing) {
      openConditions++;
    } else if (line.blockType === 'condition' && line.isClosing) {
      openConditions--;
    }
    
    if (line.blockType === 'loop') {
      openLoops++;
      
      // Check for potential infinite loops
      const nextLines = parsedLines.slice(index + 1, index + 10);
      const hasLoopControl = nextLines.some(l => 
        l.content.toLowerCase().includes('break') ||
        l.content.toLowerCase().includes('continue') ||
        l.content.toLowerCase().includes('increment') ||
        l.content.toLowerCase().includes('decrement')
      );
      
      if (!hasLoopControl) {
        warnings.push(`Potential infinite loop detected at line ${index + 1}`);
      }
    }
  });
  
  if (openConditions > 0) {
    errors.push(`${openConditions} unclosed condition block(s)`);
  }
  
  if (openLoops > 0) {
    warnings.push(`${openLoops} unclosed loop(s) - ensure proper loop termination`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates all functions including recursive ones
 */
export function validateFunctions(functions: FunctionDefinition[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  
  functions.forEach(func => {
    // Validate function structure (without START/END requirements)
    const funcValidation = validateFunctionStructure(func.blocks);
    allErrors.push(...funcValidation.errors.map(e => `In function '${func.name}': ${e}`));
    allWarnings.push(...funcValidation.warnings.map(w => `In function '${func.name}': ${w}`));
    
    // Validate recursive structure if applicable
    if (func.recursion?.isRecursive) {
      const recValidation = validateRecursiveFunction(func);
      allErrors.push(...recValidation.errors);
      allWarnings.push(...recValidation.warnings);
    }
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}