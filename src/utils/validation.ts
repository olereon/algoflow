import { ParsedLine, ValidationResult } from '../types';

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