import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeftRight, Maximize2, Minimize2, X } from 'lucide-react';
import { StackFrame, FunctionDefinition, AnimationConfig, DiagramBlock } from '../types';
import { StackFrames } from './StackFrames';
import { InfiniteCanvas } from './InfiniteCanvas';
import { FunctionPopup } from './FunctionPopup';
import { DEFAULT_ANIMATION_CONFIG } from '../utils/animation';

interface IntegratedStackVisualizerProps {
  blocks: DiagramBlock[];
  functions: FunctionDefinition[];
  selectedBlock?: number;
  onBlockClick: (index: number) => void;
  showStackPanel?: boolean;
  stackPanelPosition?: 'left' | 'right';
  className?: string;
}

export const IntegratedStackVisualizer: React.FC<IntegratedStackVisualizerProps> = ({
  blocks,
  functions,
  selectedBlock,
  onBlockClick,
  showStackPanel = false,
  stackPanelPosition = 'right',
  className = ''
}) => {
  const [stackFrames, setStackFrames] = useState<StackFrame[]>([]);
  const [showStack, setShowStack] = useState(showStackPanel);
  const [stackPosition, setStackPosition] = useState<'left' | 'right'>(stackPanelPosition);
  const [isStackCollapsed, setIsStackCollapsed] = useState(false);
  const [selectedFunction, setSelectedFunction] = useState<FunctionDefinition | null>(null);
  const [showFunctionPopup, setShowFunctionPopup] = useState(false);
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>(DEFAULT_ANIMATION_CONFIG);
  
  const canvasRef = useRef<any>(null);
  const stackPanelRef = useRef<HTMLDivElement>(null);
  
  // Simulate stack frame generation based on function execution
  const simulateStackFrames = useCallback((functionName: string, depth: number = 0): StackFrame[] => {
    const baseTime = Date.now();
    const frames: StackFrame[] = [];
    
    // Find the function definition
    const funcDef = functions.find(f => f.name.toLowerCase() === functionName.toLowerCase());
    if (!funcDef) return frames;
    
    // Determine sample values based on function type
    const getSampleValue = (param: string, depth: number): any => {
      // Check for common parameter patterns
      if (param.toLowerCase() === 'n' || param.toLowerCase().includes('num')) {
        return Math.max(1, 10 - depth);
      }
      if (param.toLowerCase().includes('arr') || param.toLowerCase().includes('list')) {
        return [1, 2, 3, 4, 5].slice(0, Math.max(1, 5 - depth));
      }
      if (param.toLowerCase().includes('str') || param.toLowerCase().includes('text')) {
        return `"text${depth}"`;
      }
      if (param.toLowerCase().includes('node')) {
        return { value: 10 - depth, left: depth < 4 ? {} : null, right: depth < 3 ? {} : null };
      }
      return `value${depth}`;
    };
    
    // Create stack frame for the function
    const frame: StackFrame = {
      id: `${functionName}_${depth}_${baseTime}`,
      functionName: functionName,
      parameters: funcDef.parameters.map((param) => ({
        name: param,
        value: getSampleValue(param, depth),
        type: typeof getSampleValue(param, depth) === 'number' ? 'number' : 
              Array.isArray(getSampleValue(param, depth)) ? 'array' : 
              typeof getSampleValue(param, depth) === 'object' ? 'object' : 'string',
        isParameter: true
      })),
      localVariables: depth > 0 ? [
        { name: 'result', value: undefined, type: 'undefined' }
      ] : [],
      depth: depth,
      isActive: depth === 0,
      timestamp: baseTime + (depth * 100),
      callSite: depth === 0 ? 'main' : `${functionName}:recursive`
    };
    
    frames.push(frame);
    
    // If it's a recursive function, simulate recursive calls based on recursion metadata
    if (funcDef.recursion?.isRecursive) {
      const maxDepth = funcDef.recursion.baseCases.length > 0 ? 6 : 4;
      
      if (depth < maxDepth) {
        // For tree recursion, create multiple branches
        if (funcDef.recursion.recursiveCases.length > 1 && depth < 3) {
          frames.push(...simulateStackFrames(functionName, depth + 1));
          frames.push(...simulateStackFrames(functionName, depth + 1));
        } else {
          frames.push(...simulateStackFrames(functionName, depth + 1));
        }
      }
    }
    
    return frames;
  }, [functions]);
  
  // Handle block click with stack frame synchronization
  const handleEnhancedBlockClick = useCallback((index: number) => {
    const block = blocks[index];
    
    if (block && block.blockType === 'function') {
      // Extract function name from the content
      const match = block.content.match(/call\s+(\w+)/i);
      if (match) {
        const functionName = match[1];
        const functionDef = functions.find(f => f.name.toLowerCase() === functionName.toLowerCase());
        
        if (functionDef) {
          // Update selected function for popup
          setSelectedFunction(functionDef);
          setShowFunctionPopup(true);
          
          // Generate and display stack frames
          if (showStack) {
            const frames = simulateStackFrames(functionName);
            setStackFrames(frames);
          }
        }
      }
    }
    
    // Call original click handler
    onBlockClick(index);
  }, [blocks, functions, onBlockClick, showStack, simulateStackFrames]);
  
  // Toggle stack panel visibility
  const toggleStackPanel = useCallback(() => {
    setShowStack(prev => !prev);
  }, []);
  
  // Toggle stack position
  const toggleStackPosition = useCallback(() => {
    setStackPosition(prev => prev === 'left' ? 'right' : 'left');
  }, []);
  
  // Toggle stack collapse state
  const toggleStackCollapse = useCallback(() => {
    setIsStackCollapsed(prev => !prev);
  }, []);
  
  // Handle responsive layout adjustments
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Auto-collapse stack panel on small screens
      if (width < 1024 && showStack && !isStackCollapsed) {
        setIsStackCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, [showStack, isStackCollapsed]);
  
  // Stack panel width based on collapse state
  const stackPanelWidth = isStackCollapsed ? 'w-12' : 'w-80 lg:w-96';
  
  return (
    <div className={`relative flex h-full ${className}`}>
      {/* Stack Panel - Left Position */}
      {showStack && stackPosition === 'left' && (
        <div
          ref={stackPanelRef}
          className={`${stackPanelWidth} transition-all duration-300 bg-gray-50 border-r border-gray-200 flex flex-col z-20`}
        >
          {isStackCollapsed ? (
            <button
              onClick={toggleStackCollapse}
              className="h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Expand stack panel"
            >
              <Maximize2 size={20} className="text-gray-600" />
            </button>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Call Stack</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleStackPosition}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Move to right"
                    >
                      <ArrowLeftRight size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={toggleStackCollapse}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Collapse"
                    >
                      <Minimize2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={toggleStackPanel}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Close"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {stackFrames.length > 0 ? (
                  <StackFrames
                    frames={stackFrames}
                    onFrameClick={(frameId) => console.log('Frame clicked:', frameId)}
                    animationConfig={animationConfig}
                    onAnimationConfigChange={setAnimationConfig}
                    showAnimationSettings={false}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Click on a function call block to see the stack frames</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Main Canvas */}
      <div className="flex-1 relative">
        <InfiniteCanvas
          ref={canvasRef}
          blocks={blocks}
          onBlockClick={handleEnhancedBlockClick}
          selectedBlock={selectedBlock}
        />
        
        {/* Stack Toggle Button (when hidden) */}
        {!showStack && (
          <button
            onClick={toggleStackPanel}
            className="absolute top-4 right-4 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow z-10"
          >
            Show Call Stack
          </button>
        )}
      </div>
      
      {/* Stack Panel - Right Position */}
      {showStack && stackPosition === 'right' && (
        <div
          ref={stackPanelRef}
          className={`${stackPanelWidth} transition-all duration-300 bg-gray-50 border-l border-gray-200 flex flex-col z-20`}
        >
          {isStackCollapsed ? (
            <button
              onClick={toggleStackCollapse}
              className="h-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Expand stack panel"
            >
              <Maximize2 size={20} className="text-gray-600" />
            </button>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Call Stack</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleStackPosition}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Move to left"
                    >
                      <ArrowLeftRight size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={toggleStackCollapse}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Collapse"
                    >
                      <Minimize2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={toggleStackPanel}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Close"
                    >
                      <X size={16} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {stackFrames.length > 0 ? (
                  <StackFrames
                    frames={stackFrames}
                    onFrameClick={(frameId) => console.log('Frame clicked:', frameId)}
                    animationConfig={animationConfig}
                    onAnimationConfigChange={setAnimationConfig}
                    showAnimationSettings={false}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Click on a function call block to see the stack frames</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Function Popup */}
      {showFunctionPopup && selectedFunction && (
        <FunctionPopup
          functionDef={selectedFunction}
          onClose={() => setShowFunctionPopup(false)}
          zIndex={30} // Ensure popup is above stack panel
        />
      )}
    </div>
  );
};