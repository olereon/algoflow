import { useState, useEffect } from 'react';
import { DiagramBlock, FunctionDefinition } from '../types';
import { useSimpleExecution } from '../hooks/useSimpleExecution';

interface PathTrackingDemoProps {
  blocks: DiagramBlock[];
  functions: FunctionDefinition[];
  onBlockStateChange?: (blockIndex: number, state: 'active' | 'visited' | 'pending') => void;
  className?: string;
}

export function PathTrackingDemo({
  blocks,
  functions,
  onBlockStateChange,
  className = ''
}: PathTrackingDemoProps) {
  const {
    state,
    controls,
    stats,
    executeStep,
    getBlockState
  } = useSimpleExecution(blocks, functions);

  const [autoExecute, setAutoExecute] = useState(false);

  // Auto-execution effect
  useEffect(() => {
    if (autoExecute && state.isRunning && !stats.isCompleted) {
      const timer = setTimeout(() => {
        executeStep();
      }, state.speed);

      return () => clearTimeout(timer);
    }
  }, [autoExecute, state.isRunning, state.speed, stats.isCompleted, executeStep]);

  // Notify parent of block state changes
  useEffect(() => {
    if (onBlockStateChange) {
      blocks.forEach((_, index) => {
        const blockState = getBlockState(index);
        onBlockStateChange(index, blockState);
      });
    }
  }, [blocks, onBlockStateChange, getBlockState]);

  const handleStart = () => {
    controls.start();
    setAutoExecute(true);
  };

  const handlePause = () => {
    controls.pause();
    setAutoExecute(false);
  };

  const handleStep = () => {
    setAutoExecute(false);
    controls.step();
  };

  const handleReset = () => {
    setAutoExecute(false);
    controls.reset();
  };

  return (
    <div className={`path-tracking-demo ${className}`}>
      {/* Main Control Panel */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Path Tracking & Execution Visualizer
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              state.isRunning ? 'bg-green-500 animate-pulse' :
              stats.isCompleted ? 'bg-blue-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              {state.isRunning ? 'Running' : 
               stats.isCompleted ? 'Completed' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={handleStart}
            disabled={state.isRunning || stats.isCompleted}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>▶️</span>
            <span>Start</span>
          </button>
          
          <button
            onClick={handlePause}
            disabled={!state.isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>⏸️</span>
            <span>Pause</span>
          </button>
          
          <button
            onClick={handleStep}
            disabled={state.isRunning || stats.isCompleted}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>⏭️</span>
            <span>Step</span>
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <span>⏹️</span>
            <span>Reset</span>
          </button>

          <div className="flex items-center space-x-2 ml-6">
            <label className="text-sm font-medium text-gray-700">Speed:</label>
            <input
              type="range"
              min="100"
              max="2000"
              value={state.speed}
              onChange={(e) => controls.setSpeed(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600 w-12">{state.speed}ms</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">
              {state.currentStep} / {stats.totalBlocks} steps ({stats.progress.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progress}%` }}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.visitedBlocks}</div>
            <div className="text-xs text-blue-600">Visited Blocks</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.callStackDepth}</div>
            <div className="text-xs text-green-600">Call Stack</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.branchDecisions}</div>
            <div className="text-xs text-yellow-600">Branch Decisions</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.loopIterations}</div>
            <div className="text-xs text-purple-600">Loop Iterations</div>
          </div>
        </div>
      </div>

      {/* Block States Visualization */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h4 className="font-semibold text-gray-800 mb-4">Block Execution States</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Execution Position */}
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Current Position</h5>
            {state.currentStep < blocks.length ? (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-blue-800">
                    Block {state.currentStep}: {blocks[state.currentStep]?.blockType}
                  </span>
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {blocks[state.currentStep]?.content}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                Execution completed
              </div>
            )}
          </div>

          {/* Active Function Calls */}
          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Call Stack</h5>
            {state.callStack.length > 0 ? (
              <div className="space-y-1">
                {state.callStack.map((call, index) => (
                  <div 
                    key={index}
                    className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg"
                    style={{ marginLeft: `${call.depth * 12}px` }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <span className="text-sm font-medium text-indigo-800">
                        {call.functionName}()
                      </span>
                      <span className="text-xs text-indigo-600">
                        Depth {call.depth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-500">
                No active function calls
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Path Tracking Features */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Path Tracking Capabilities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-3">✅ Implemented Features</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Current execution position tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Block state highlighting (active/visited/pending)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Function call stack visualization</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Branch decision tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Loop iteration counters</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Variable speed execution control</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Step-by-step execution</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Execution path persistence</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-700 mb-3">🔄 Advanced Features Available</h5>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">📊</span>
                <span>Real-time execution statistics</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">🎯</span>
                <span>Breakpoint support (in advanced mode)</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">🔍</span>
                <span>Variable state tracking</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">📈</span>
                <span>Performance metrics monitoring</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">🎨</span>
                <span>Visual connection flow animation</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">⚡</span>
                <span>Recursive function depth visualization</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">💾</span>
                <span>Execution replay and state saving</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-blue-600">🔄</span>
                <span>Nested loop iteration tracking</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h5 className="font-medium text-gray-700 mb-3">Visual Legend</h5>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Currently Executing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              <span>Function Call</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PathTrackingDemo;