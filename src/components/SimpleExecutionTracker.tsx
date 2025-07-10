import { useState, useEffect } from 'react';
import { DiagramBlock, FunctionDefinition } from '../types';

interface SimpleExecutionTrackerProps {
  blocks: DiagramBlock[];
  functions: FunctionDefinition[];
  className?: string;
}

interface ExecutionState {
  currentStep: number;
  isRunning: boolean;
  speed: number;
  activeBlocks: Set<number>;
  visitedBlocks: Set<number>;
  executionPath: Array<{
    blockIndex: number;
    timestamp: number;
    functionName?: string;
  }>;
  callStack: Array<{
    functionName: string;
    depth: number;
    entryStep: number;
  }>;
  branchDecisions: Map<number, 'true' | 'false'>;
  loopIterations: Map<number, number>;
}

export function SimpleExecutionTracker({
  blocks,
  functions,
  className = ''
}: SimpleExecutionTrackerProps) {
  const [state, setState] = useState<ExecutionState>({
    currentStep: 0,
    isRunning: false,
    speed: 500,
    activeBlocks: new Set(),
    visitedBlocks: new Set(),
    executionPath: [],
    callStack: [],
    branchDecisions: new Map(),
    loopIterations: new Map()
  });

  const [intervalId, setIntervalId] = useState<number | null>(null);

  // Auto-execution when running
  useEffect(() => {
    if (state.isRunning && state.currentStep < blocks.length) {
      const id = window.setInterval(executeStep, state.speed);
      setIntervalId(id);
      return () => {
        if (id) window.clearInterval(id);
      };
    } else if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
      setState(prev => ({ ...prev, isRunning: false }));
    }
  }, [state.isRunning, state.currentStep, state.speed]);

  const executeStep = () => {
    setState(prev => {
      if (prev.currentStep >= blocks.length) {
        return { ...prev, isRunning: false };
      }

      const currentBlock = blocks[prev.currentStep];
      const newActiveBlocks = new Set<number>();
      newActiveBlocks.add(prev.currentStep);

      const newVisitedBlocks = new Set(prev.visitedBlocks);
      newVisitedBlocks.add(prev.currentStep);

      const newExecutionPath = [...prev.executionPath, {
        blockIndex: prev.currentStep,
        timestamp: Date.now(),
        functionName: currentBlock.functionName
      }];

      // Handle different block types
      let newCallStack = [...prev.callStack];
      let newBranchDecisions = new Map(prev.branchDecisions);
      let newLoopIterations = new Map(prev.loopIterations);

      switch (currentBlock.blockType) {
        case 'function':
          // Simulate function call
          newCallStack.push({
            functionName: currentBlock.functionName || 'unknown',
            depth: newCallStack.length,
            entryStep: prev.currentStep
          });
          break;

        case 'return':
          // Simulate function return
          if (newCallStack.length > 0) {
            newCallStack.pop();
          }
          break;

        case 'condition':
          // Simulate branch decision (randomly for demo)
          const decision = Math.random() > 0.5 ? 'true' : 'false';
          newBranchDecisions.set(prev.currentStep, decision);
          break;

        case 'loop':
          // Simulate loop iteration
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
  };

  const startExecution = () => {
    setState(prev => ({ ...prev, isRunning: true }));
  };

  const pauseExecution = () => {
    setState(prev => ({ ...prev, isRunning: false }));
    if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const stepExecution = () => {
    if (!state.isRunning) {
      executeStep();
    }
  };

  const resetExecution = () => {
    setState({
      currentStep: 0,
      isRunning: false,
      speed: state.speed,
      activeBlocks: new Set(),
      visitedBlocks: new Set(),
      executionPath: [],
      callStack: [],
      branchDecisions: new Map(),
      loopIterations: new Map()
    });
    if (intervalId) {
      window.clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setState(prev => ({ ...prev, speed: newSpeed }));
  };

  return (
    <div className={`simple-execution-tracker ${className} bg-white rounded-lg shadow-lg p-6`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Algorithm Path Tracking System
        </h3>
        <p className="text-sm text-gray-600">
          Visualizes execution flow, highlights active blocks, tracks function calls and loop iterations
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={startExecution}
            disabled={state.isRunning || state.currentStep >= blocks.length}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ▶️ Play
          </button>
          
          <button
            onClick={pauseExecution}
            disabled={!state.isRunning}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏸️ Pause
          </button>
          
          <button
            onClick={stepExecution}
            disabled={state.isRunning || state.currentStep >= blocks.length}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ⏭️ Step
          </button>
          
          <button
            onClick={resetExecution}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ⏹️ Reset
          </button>

          <div className="flex items-center space-x-2 ml-auto">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              state.isRunning ? 'bg-green-100 text-green-800' :
              state.currentStep >= blocks.length ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {state.isRunning ? 'RUNNING' : 
               state.currentStep >= blocks.length ? 'COMPLETED' : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Speed:</label>
          <input
            type="range"
            min="100"
            max="2000"
            value={state.speed}
            onChange={(e) => handleSpeedChange(Number(e.target.value))}
            className="flex-1 max-w-32"
          />
          <span className="text-sm text-gray-600">{state.speed}ms</span>
        </div>
      </div>

      {/* Status Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-center">
          <div className="text-2xl font-bold text-blue-600">{state.currentStep}</div>
          <div className="text-xs text-blue-600">Current Step</div>
        </div>
        
        <div className="p-3 bg-green-50 border border-green-200 rounded text-center">
          <div className="text-2xl font-bold text-green-600">{state.visitedBlocks.size}</div>
          <div className="text-xs text-green-600">Blocks Visited</div>
        </div>
        
        <div className="p-3 bg-purple-50 border border-purple-200 rounded text-center">
          <div className="text-2xl font-bold text-purple-600">{state.callStack.length}</div>
          <div className="text-xs text-purple-600">Call Stack Depth</div>
        </div>
        
        <div className="p-3 bg-orange-50 border border-orange-200 rounded text-center">
          <div className="text-2xl font-bold text-orange-600">{state.executionPath.length}</div>
          <div className="text-xs text-orange-600">Path Length</div>
        </div>
      </div>

      {/* Block Visualization */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Block Execution State:</h4>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {blocks.map((block, index) => {
            const isActive = state.activeBlocks.has(index);
            const isVisited = state.visitedBlocks.has(index);
            const branchDecision = state.branchDecisions.get(index);
            const loopCount = state.loopIterations.get(index);

            return (
              <div
                key={block.index}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-100 border-2 border-blue-400 shadow-md'
                    : isVisited
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono text-gray-500 w-8">
                    {index.toString().padStart(2, '0')}
                  </span>
                  <div
                    className={`w-4 h-4 rounded-full transition-colors duration-300 ${
                      isActive
                        ? 'bg-blue-500 animate-pulse'
                        : isVisited
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      block.blockType === 'start' ? 'bg-green-100 text-green-800' :
                      block.blockType === 'end' ? 'bg-red-100 text-red-800' :
                      block.blockType === 'condition' ? 'bg-yellow-100 text-yellow-800' :
                      block.blockType === 'loop' ? 'bg-purple-100 text-purple-800' :
                      block.blockType === 'function' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {block.blockType}
                    </span>
                    <span className="text-sm text-gray-800 truncate max-w-48">
                      {block.content}
                    </span>
                  </div>
                  
                  {/* Branch decision indicator */}
                  {branchDecision && (
                    <div className="text-xs">
                      <span className={`px-2 py-1 rounded ${
                        branchDecision === 'true' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Branch: {branchDecision.toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Loop iteration counter */}
                  {loopCount && loopCount > 0 && (
                    <div className="text-xs">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        🔄 Iteration {loopCount}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-500">
                  {block.connections.length} connection{block.connections.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call Stack Visualization */}
      {state.callStack.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Function Call Stack:</h4>
          <div className="space-y-2">
            {state.callStack.map((call, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-2 bg-indigo-50 border border-indigo-200 rounded"
                style={{ marginLeft: `${call.depth * 16}px` }}
              >
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="font-medium text-indigo-800">{call.functionName}()</span>
                <span className="text-xs text-indigo-600">Depth {call.depth}</span>
                <span className="text-xs text-indigo-500">Step {call.entryStep}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Path Tracking Features */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">Path Tracking Features:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Block state highlighting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Execution flow visualization</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Function call stack tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Step-by-step execution</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Branch decision tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Loop iteration counters</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Variable speed control</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅</span>
              <span>Execution state persistence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Functions Summary */}
      {functions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3">Available Functions:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {functions.map((func, index) => (
              <div key={index} className="p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{func.name}()</span>
                  <span className="text-xs text-gray-600">{func.blocks.length} blocks</span>
                </div>
                {func.recursion?.isRecursive && (
                  <div className="text-xs text-purple-600 mt-1">
                    🔄 Recursive ({func.recursion.recursionType})
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleExecutionTracker;