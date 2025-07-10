import { DiagramBlock } from '../types';

export interface ExecutionState {
  currentBlockIndex: number | null;
  visitedBlocks: Set<number>;
  executionPath: number[];
  callStack: CallStackFrame[];
  loopCounters: Map<number, number>;
  isPaused: boolean;
  isComplete: boolean;
  speed: number; // milliseconds per step
  startTime: number;
  currentTime: number;
}

export interface CallStackFrame {
  functionName: string;
  returnBlockIndex: number;
  localContext: Map<string, any>;
}

export interface ExecutionLogEntry {
  timestamp: number;
  blockIndex: number;
  blockContent: string;
  blockType: string;
  action: 'enter' | 'exit' | 'branch' | 'loop' | 'call' | 'return';
  details?: string;
}

export class ExecutionEngine {
  private blocks: DiagramBlock[];
  private state: ExecutionState;
  private executionLog: ExecutionLogEntry[] = [];
  private intervalId: number | null = null;
  private onStateChange?: (state: ExecutionState) => void;
  private onLogEntry?: (entry: ExecutionLogEntry) => void;

  constructor(blocks: DiagramBlock[]) {
    this.blocks = blocks;
    this.state = this.createInitialState();
  }

  private createInitialState(): ExecutionState {
    return {
      currentBlockIndex: null,
      visitedBlocks: new Set(),
      executionPath: [],
      callStack: [],
      loopCounters: new Map(),
      isPaused: true,
      isComplete: false,
      speed: 500,
      startTime: Date.now(),
      currentTime: Date.now()
    };
  }

  public setOnStateChange(callback: (state: ExecutionState) => void) {
    this.onStateChange = callback;
  }

  public setOnLogEntry(callback: (entry: ExecutionLogEntry) => void) {
    this.onLogEntry = callback;
  }

  public start() {
    if (this.state.isComplete) {
      this.reset();
    }

    // Find the start block
    const startIndex = this.blocks.findIndex(b => b.blockType === 'start');
    if (startIndex === -1) {
      console.error('No start block found');
      return;
    }

    this.state.currentBlockIndex = startIndex;
    this.state.isPaused = false;
    this.state.startTime = Date.now();
    
    this.logEntry(startIndex, 'enter');
    this.notifyStateChange();
    
    this.scheduleNextStep();
  }

  public pause() {
    this.state.isPaused = true;
    if (this.intervalId !== null) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.notifyStateChange();
  }

  public resume() {
    if (!this.state.isComplete && this.state.currentBlockIndex !== null) {
      this.state.isPaused = false;
      this.notifyStateChange();
      this.scheduleNextStep();
    }
  }

  public step() {
    if (!this.state.isComplete && this.state.currentBlockIndex !== null) {
      this.executeCurrentBlock();
    }
  }

  public reset() {
    this.pause();
    this.state = this.createInitialState();
    this.executionLog = [];
    this.notifyStateChange();
  }

  public setSpeed(speed: number) {
    this.state.speed = Math.max(100, Math.min(2000, speed));
    this.notifyStateChange();
  }

  public getState(): ExecutionState {
    return { ...this.state };
  }

  public getLog(): ExecutionLogEntry[] {
    return [...this.executionLog];
  }

  private scheduleNextStep() {
    if (!this.state.isPaused && !this.state.isComplete) {
      this.intervalId = window.setTimeout(() => {
        this.executeCurrentBlock();
      }, this.state.speed);
    }
  }

  private executeCurrentBlock() {
    if (this.state.currentBlockIndex === null || this.state.isComplete) {
      return;
    }

    const currentBlock = this.blocks[this.state.currentBlockIndex];
    if (!currentBlock) {
      this.state.isComplete = true;
      this.notifyStateChange();
      return;
    }

    // Mark block as visited
    this.state.visitedBlocks.add(this.state.currentBlockIndex);
    this.state.executionPath.push(this.state.currentBlockIndex);
    this.state.currentTime = Date.now();

    // Handle different block types
    switch (currentBlock.blockType) {
      case 'end':
        this.handleEndBlock();
        break;
      
      case 'condition':
        this.handleConditionBlock(currentBlock);
        break;
      
      case 'loop':
        this.handleLoopBlock(currentBlock);
        break;
      
      case 'function':
        this.handleFunctionCallBlock(currentBlock);
        break;
      
      case 'return':
        this.handleReturnBlock();
        break;
      
      default:
        this.handleSequentialBlock();
        break;
    }

    this.notifyStateChange();
    
    if (!this.state.isPaused && !this.state.isComplete) {
      this.scheduleNextStep();
    }
  }

  private handleEndBlock() {
    // Check if we're in a function
    if (this.state.callStack.length > 0) {
      // This is a function end, return to caller
      const frame = this.state.callStack.pop()!;
      this.logEntry(this.state.currentBlockIndex!, 'return', `Returning from ${frame.functionName}`);
      this.state.currentBlockIndex = frame.returnBlockIndex;
    } else {
      // Main program end
      this.logEntry(this.state.currentBlockIndex!, 'exit', 'Program complete');
      this.state.isComplete = true;
      this.state.currentBlockIndex = null;
    }
  }

  private handleConditionBlock(block: DiagramBlock) {
    // For demo purposes, randomly choose true/false path
    const takeTruePath = Math.random() > 0.5;
    const details = takeTruePath ? 'Taking YES path' : 'Taking NO path';
    
    this.logEntry(this.state.currentBlockIndex!, 'branch', details);
    
    // Find the appropriate connection
    const connections = block.connections.filter(c => c.from === this.state.currentBlockIndex);
    const nextConnection = connections.find(c => 
      takeTruePath ? c.label === 'YES' : c.label === 'NO'
    ) || connections[0];
    
    if (nextConnection) {
      this.state.currentBlockIndex = nextConnection.to;
    } else {
      this.moveToNextBlock();
    }
  }

  private handleLoopBlock(block: DiagramBlock) {
    const loopCount = this.state.loopCounters.get(this.state.currentBlockIndex!) || 0;
    
    if (loopCount < 3) { // Demo: loop 3 times
      this.state.loopCounters.set(this.state.currentBlockIndex!, loopCount + 1);
      this.logEntry(this.state.currentBlockIndex!, 'loop', `Iteration ${loopCount + 1}`);
      this.moveToNextBlock();
    } else {
      // Exit loop
      this.state.loopCounters.delete(this.state.currentBlockIndex!);
      this.logEntry(this.state.currentBlockIndex!, 'loop', 'Loop complete');
      
      // Find loop exit connection (simple logic for demo)
      const exitConnection = block.connections.find(c => 
        c.from === this.state.currentBlockIndex
      );
      
      if (exitConnection) {
        this.state.currentBlockIndex = exitConnection.to;
      } else {
        this.moveToNextBlock();
      }
    }
  }

  private handleFunctionCallBlock(block: DiagramBlock) {
    // Extract function name
    const match = block.content.match(/call\s+(\w+)/i);
    if (match) {
      const functionName = match[1];
      
      // Save current context
      this.state.callStack.push({
        functionName,
        returnBlockIndex: this.getNextBlockIndex(),
        localContext: new Map()
      });
      
      this.logEntry(this.state.currentBlockIndex!, 'call', `Calling ${functionName}`);
      
      // For demo, just move to next block (in real implementation, would jump to function)
      this.moveToNextBlock();
    } else {
      this.moveToNextBlock();
    }
  }

  private handleReturnBlock() {
    if (this.state.callStack.length > 0) {
      const frame = this.state.callStack.pop()!;
      this.logEntry(this.state.currentBlockIndex!, 'return', `Returning from ${frame.functionName}`);
      this.state.currentBlockIndex = frame.returnBlockIndex;
    } else {
      // No call stack, treat as program end
      this.state.isComplete = true;
      this.state.currentBlockIndex = null;
    }
  }

  private handleSequentialBlock() {
    this.logEntry(this.state.currentBlockIndex!, 'enter');
    this.moveToNextBlock();
  }

  private moveToNextBlock() {
    const nextIndex = this.getNextBlockIndex();
    if (nextIndex !== -1) {
      this.state.currentBlockIndex = nextIndex;
    } else {
      this.state.isComplete = true;
      this.state.currentBlockIndex = null;
    }
  }

  private getNextBlockIndex(): number {
    if (this.state.currentBlockIndex === null) return -1;
    
    const currentBlock = this.blocks[this.state.currentBlockIndex];
    const connection = currentBlock.connections.find(c => 
      c.from === this.state.currentBlockIndex
    );
    
    return connection ? connection.to : -1;
  }

  private logEntry(blockIndex: number, action: ExecutionLogEntry['action'], details?: string) {
    const block = this.blocks[blockIndex];
    const entry: ExecutionLogEntry = {
      timestamp: Date.now(),
      blockIndex,
      blockContent: block.content,
      blockType: block.blockType,
      action,
      details
    };
    
    this.executionLog.push(entry);
    
    if (this.onLogEntry) {
      this.onLogEntry(entry);
    }
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }
}