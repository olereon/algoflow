import { useState, useCallback } from 'react';
import { DiagramBlock, FunctionDefinition } from '../types';

interface ExecutionState {
  currentStep: number;
  isRunning: boolean;
  speed: number;
  activeBlocks: Set<number>;
  visitedBlocks: Set<number>;
  branchDecisions: Map<number, 'true' | 'false'>;
  loopIterations: Map<number, number>;
  executionPath: Array<{
    blockIndex: number;
    timestamp: number;
    blockType: string;
    content: string;
  }>;
  callStack: Array<{
    functionName: string;
    depth: number;
    blockIndex: number;
  }>;
}

interface ExecutionControls {
  start: () => void;
  pause: () => void;
  step: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  jumpToStep: (step: number) => void;
}

export function useSimpleExecution(
  blocks: DiagramBlock[],
  functions: FunctionDefinition[] = []
) {
  const [state, setState] = useState<ExecutionState>({
    currentStep: 0,
    isRunning: false,
    speed: 500,
    activeBlocks: new Set(),
    visitedBlocks: new Set(),
    branchDecisions: new Map(),
    loopIterations: new Map(),
    executionPath: [],
    callStack: []
  });

  const executeStep = useCallback(() => {
    setState(prev => {
      if (prev.currentStep >= blocks.length) {
        return { ...prev, isRunning: false };
      }

      const currentBlock = blocks[prev.currentStep];
      const newActiveBlocks = new Set<number>([prev.currentStep]);
      const newVisitedBlocks = new Set(prev.visitedBlocks);
      newVisitedBlocks.add(prev.currentStep);

      // Add to execution path
      const newExecutionPath = [...prev.executionPath, {
        blockIndex: prev.currentStep,
        timestamp: Date.now(),
        blockType: currentBlock.blockType,
        content: currentBlock.content
      }];

      // Handle different block types
      let newCallStack = [...prev.callStack];
      let newBranchDecisions = new Map(prev.branchDecisions);
      let newLoopIterations = new Map(prev.loopIterations);

      switch (currentBlock.blockType) {
        case 'function':
          // Add function call to stack
          newCallStack.push({
            functionName: currentBlock.functionName || 'unknown',
            depth: newCallStack.length,
            blockIndex: prev.currentStep
          });
          break;

        case 'return':
          // Remove function from stack
          if (newCallStack.length > 0) {
            newCallStack.pop();
          }
          break;

        case 'condition':
          // Simulate branch decision
          const decision = Math.random() > 0.5 ? 'true' : 'false';
          newBranchDecisions.set(prev.currentStep, decision);
          break;

        case 'loop':
          // Increment loop iteration
          const currentIterations = newLoopIterations.get(prev.currentStep) || 0;
          newLoopIterations.set(prev.currentStep, currentIterations + 1);
          break;
      }

      return {
        ...prev,
        currentStep: prev.currentStep + 1,
        activeBlocks: newActiveBlocks,
        visitedBlocks: newVisitedBlocks,
        executionPath: newExecutionPath,
        callStack: newCallStack,
        branchDecisions: newBranchDecisions,
        loopIterations: newLoopIterations
      };
    });
  }, [blocks]);

  const controls: ExecutionControls = {
    start: useCallback(() => {
      setState(prev => ({ ...prev, isRunning: true }));
    }, []),

    pause: useCallback(() => {
      setState(prev => ({ ...prev, isRunning: false }));
    }, []),

    step: useCallback(() => {
      if (!state.isRunning) {
        executeStep();
      }
    }, [state.isRunning, executeStep]),

    reset: useCallback(() => {
      setState(prev => ({
        ...prev,
        currentStep: 0,
        isRunning: false,
        activeBlocks: new Set(),
        visitedBlocks: new Set(),
        branchDecisions: new Map(),
        loopIterations: new Map(),
        executionPath: [],
        callStack: []
      }));
    }, []),

    setSpeed: useCallback((speed: number) => {
      setState(prev => ({ ...prev, speed }));
    }, []),

    jumpToStep: useCallback((step: number) => {
      if (step >= 0 && step < blocks.length) {
        setState(prev => ({ ...prev, currentStep: step }));
      }
    }, [blocks.length])
  };

  // Auto-execution logic
  const isCompleted = state.currentStep >= blocks.length;
  const progress = blocks.length > 0 ? (state.currentStep / blocks.length) * 100 : 0;

  return {
    state,
    controls,
    stats: {
      totalBlocks: blocks.length,
      visitedBlocks: state.visitedBlocks.size,
      activeBlocks: state.activeBlocks.size,
      callStackDepth: state.callStack.length,
      executionPathLength: state.executionPath.length,
      branchDecisions: state.branchDecisions.size,
      loopIterations: Array.from(state.loopIterations.values()).reduce((sum, count) => sum + count, 0),
      progress,
      isCompleted
    },
    executeStep,
    // Helper functions for UI
    getBlockState: (blockIndex: number) => {
      if (state.activeBlocks.has(blockIndex)) return 'active';
      if (state.visitedBlocks.has(blockIndex)) return 'visited';
      return 'pending';
    },
    getBranchDecision: (blockIndex: number) => state.branchDecisions.get(blockIndex),
    getLoopIteration: (blockIndex: number) => state.loopIterations.get(blockIndex) || 0,
    isInCallStack: (functionName: string) => 
      state.callStack.some(call => call.functionName === functionName)
  };
}

export default useSimpleExecution;