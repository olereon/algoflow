export type BlockType = 'start' | 'end' | 'process' | 'condition' | 'else-if' | 'switch' | 'case' | 'loop' | 'input' | 'output' | 'function' | 'function-def' | 'return' | 'comment' | 'connector' | 'implicit-else';

export interface ParsedLine {
  content: string;
  indentLevel: number;
  blockType: BlockType;
  isClosing?: boolean;
  isRecursiveCall?: boolean; // Indicates if this is a call to a recursive function
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
  recursiveCallInfo?: RecursiveCallPoint; // For blocks that are recursive calls
}

export interface RecursiveCallPoint {
  lineIndex: number;
  content: string;
  parameters: string[];
  isBaseCase: boolean;
  parameterTransformations?: ParameterTransformation[];
}

export interface ParameterTransformation {
  parameterName: string;
  originalValue: string;
  transformedValue: string;
  transformationType: 'decrement' | 'increment' | 'divide' | 'multiply' | 'property-access' | 'other';
  description?: string; // e.g., "n-1", "n/2", "node.left"
}

export interface BaseCase {
  condition: string;
  returnValue?: string;
  exitType: 'return' | 'break' | 'continue' | 'empty';
  comparisonOperator?: '==' | '<=' | '>=' | '<' | '>' | '!=' | 'is' | 'is not';
  comparisonValue?: string;
}

export interface RecursiveCase {
  callExpression: string;
  parameters: string[];
  transformations: ParameterTransformation[];
  operation?: 'single' | 'add' | 'multiply' | 'combine' | 'other';
  operationDescription?: string; // e.g., "n * factorial(n-1)"
}

export type RecursionType = 'linear' | 'tree' | 'tail' | 'mutual' | 'nested' | 'multiple';

export interface RecursionPattern {
  type: 'factorial' | 'fibonacci' | 'tree-traversal' | 'binary-search' | 'merge-sort' | 'quick-sort' | 'generic';
  confidence: number; // 0-1 score for pattern match
  baseCase?: string; // Deprecated - use baseCases array
  recursiveCase?: string; // Deprecated - use recursiveCases array
}

export interface RecursionMetadata {
  isRecursive: boolean;
  recursionType: RecursionType;
  callPoints: RecursiveCallPoint[];
  pattern?: RecursionPattern;
  baseCases: BaseCase[];
  recursiveCases: RecursiveCase[];
  maxDepthHint?: number;
  depthCalculation?: string; // e.g., "log(n)", "n", "2^n"
  parameterFlow?: Map<string, string[]>; // Maps parameter names to their transformation chain
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

export interface FrameVariable {
  name: string;
  value: any;
  type: string;
  isParameter?: boolean;
  isChanged?: boolean; // Highlight if value changed in current step
}

export interface StackFrame {
  id: string;
  functionName: string;
  parameters: FrameVariable[];
  localVariables: FrameVariable[];
  returnValue?: any;
  currentLine?: number;
  callSite?: string; // Where this function was called from
  depth: number; // Stack depth (0 = main, 1 = first call, etc.)
  isActive: boolean; // Currently executing frame
  isCollapsed?: boolean; // For deep stacks
  timestamp: number; // When frame was created
}

export interface StackFrameState {
  frames: StackFrame[];
  maxVisibleFrames: number;
  showCollapsedIndicator: boolean;
  totalFrames: number;
}

export interface FrameComponentProps {
  frame: StackFrame;
  isActive: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: (frameId: string) => void;
  onFrameClick?: (frameId: string) => void;
  showVariables?: boolean;
  compact?: boolean;
  animationState?: FrameAnimationState;
  animationSpeed?: AnimationSpeed;
}

export type AnimationSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export type FrameAnimationState = 
  | 'entering' 
  | 'entered' 
  | 'exiting' 
  | 'exited' 
  | 'updating' 
  | 'idle';

export interface AnimationConfig {
  speed: AnimationSpeed;
  enableAnimations: boolean;
  reducedMotion: boolean;
  maxConcurrentAnimations: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
}

export interface FrameAnimation {
  id: string;
  frameId: string;
  type: 'enter' | 'exit' | 'update' | 'activate' | 'deactivate';
  startTime: number;
  duration: number;
  easing: string;
  fromState: Partial<StackFrame>;
  toState: Partial<StackFrame>;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'cancelled';
}

export interface AnimationQueue {
  animations: FrameAnimation[];
  running: Map<string, FrameAnimation>;
  completed: FrameAnimation[];
  maxConcurrent: number;
  paused: boolean;
}

export interface UseStackAnimationOptions {
  config: AnimationConfig;
  onAnimationStart?: (animation: FrameAnimation) => void;
  onAnimationEnd?: (animation: FrameAnimation) => void;
  onQueueEmpty?: () => void;
}

// Re-export animation types
export * from './animation';