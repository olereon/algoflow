import { useState } from 'react';
import { DiagramBlock, FunctionDefinition } from '../types';

interface ExecutionDemoProps {
  blocks: DiagramBlock[];
  functions: FunctionDefinition[];
  className?: string;
}

export function ExecutionDemo({
  blocks,
  functions,
  className = ''
}: ExecutionDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [activeBlocks, setActiveBlocks] = useState<Set<number>>(new Set());
  const [visitedBlocks, setVisitedBlocks] = useState<Set<number>>(new Set());

  const executeStep = () => {
    if (currentStep < blocks.length) {
      const newActiveBlocks = new Set<number>();
      newActiveBlocks.add(currentStep);
      setActiveBlocks(newActiveBlocks);
      
      const newVisitedBlocks = new Set(visitedBlocks);
      newVisitedBlocks.add(currentStep);
      setVisitedBlocks(newVisitedBlocks);
      
      setCurrentStep(currentStep + 1);
    } else {
      setIsRunning(false);
    }
  };

  const startExecution = () => {
    setIsRunning(true);
    const interval = setInterval(() => {
      executeStep();
      if (currentStep >= blocks.length - 1) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, speed);
    
    setTimeout(() => clearInterval(interval), speed * blocks.length);
  };

  const resetExecution = () => {
    setCurrentStep(0);
    setIsRunning(false);
    setActiveBlocks(new Set());
    setVisitedBlocks(new Set());
  };

  return (
    <div className={`execution-demo ${className} bg-white rounded-lg shadow-lg p-6`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Algorithm Execution Path Tracking
        </h3>
        
        {/* Controls */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={startExecution}
            disabled={isRunning}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Start'}
          </button>
          
          <button
            onClick={executeStep}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Step
          </button>
          
          <button
            onClick={resetExecution}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Speed:</label>
            <input
              type="range"
              min="100"
              max="2000"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600">{speed}ms</span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <span>Step: {currentStep} / {blocks.length}</span>
          <span>•</span>
          <span>Active Blocks: {activeBlocks.size}</span>
          <span>•</span>
          <span>Visited Blocks: {visitedBlocks.size}</span>
          {functions.length > 0 && (
            <>
              <span>•</span>
              <span>Functions: {functions.length}</span>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Visited</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>

      {/* Block List */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Algorithm Steps:</h4>
        <div className="max-h-64 overflow-y-auto space-y-1">
          {blocks.map((block, index) => (
            <div
              key={block.index}
              className={`flex items-center space-x-3 p-2 rounded transition-colors ${
                activeBlocks.has(index)
                  ? 'bg-blue-100 border border-blue-300'
                  : visitedBlocks.has(index)
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-gray-500">
                  {index.toString().padStart(2, '0')}
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    activeBlocks.has(index)
                      ? 'bg-blue-500'
                      : visitedBlocks.has(index)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    block.blockType === 'start' ? 'bg-green-100 text-green-800' :
                    block.blockType === 'end' ? 'bg-red-100 text-red-800' :
                    block.blockType === 'condition' ? 'bg-yellow-100 text-yellow-800' :
                    block.blockType === 'loop' ? 'bg-purple-100 text-purple-800' :
                    block.blockType === 'function' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {block.blockType}
                  </span>
                  <span className="text-sm text-gray-800">{block.content}</span>
                </div>
              </div>
              
              {block.connections.length > 0 && (
                <div className="text-xs text-gray-500">
                  {block.connections.length} connection{block.connections.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Functions Info */}
      {functions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-2">Functions:</h4>
          <div className="grid grid-cols-1 gap-2">
            {functions.map((func, index) => (
              <div key={index} className="p-2 bg-indigo-50 border border-indigo-200 rounded">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-indigo-800">{func.name}()</span>
                  <span className="text-xs text-indigo-600">
                    {func.blocks.length} blocks
                  </span>
                </div>
                {func.parameters.length > 0 && (
                  <div className="text-xs text-indigo-600 mt-1">
                    Parameters: {func.parameters.join(', ')}
                  </div>
                )}
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

      {/* Execution Features */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-2">Path Tracking Features:</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Block highlighting</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Execution state tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Step-by-step execution</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Variable speed control</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Connection flow visualization</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Function call tracking</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Loop iteration counters</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span>Branching logic support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExecutionDemo;