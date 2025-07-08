export type BlockType = 'start' | 'end' | 'process' | 'condition' | 'else-if' | 'switch' | 'case' | 'loop' | 'input' | 'output' | 'function' | 'function-def' | 'return' | 'comment' | 'connector' | 'implicit-else';

export interface ParsedLine {
  content: string;
  indentLevel: number;
  blockType: BlockType;
  isClosing?: boolean;
}

export interface BlockPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Connection {
  from: number;
  to: number;
  type: 'default' | 'yes' | 'no' | 'loop-back' | 'case' | 'recursive';
  depth?: number; // For nested loop visualization
  label?: string; // For case labels (e.g., "Case 1", "Case A", "Default")
}

export interface DiagramBlock extends ParsedLine {
  index: number;
  position: BlockPosition;
  connections: Connection[];
  functionName?: string; // For function call blocks
}

export interface RecursiveCallPoint {
  lineIndex: number;
  content: string;
  parameters: string[];
  isBaseCase: boolean;
}

export interface RecursionPattern {
  type: 'factorial' | 'fibonacci' | 'tree-traversal' | 'generic';
  confidence: number; // 0-1 score for pattern match
  baseCase?: string;
  recursiveCase?: string;
}

export interface RecursionMetadata {
  isRecursive: boolean;
  callPoints: RecursiveCallPoint[];
  pattern?: RecursionPattern;
  baseCases: string[];
  recursiveCases: string[];
  maxDepthHint?: number;
}

export interface FunctionDefinition {
  name: string;
  parameters: string[];
  blocks: DiagramBlock[];
  originalStartIndex: number;
  recursion?: RecursionMetadata;
}

export interface Project {
  id: string;
  name: string;
  pseudocode: string;
  createdAt: number;
  updatedAt: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf';
  scale?: number;
  backgroundColor?: string;
}