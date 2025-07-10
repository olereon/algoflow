import React, { useEffect, useRef, useState } from 'react';
import { Clock, Play, Pause, SkipForward, RotateCcw, Settings, X, ChevronUp, ChevronDown } from 'lucide-react';
import { ExecutionLogEntry, ExecutionState } from '../utils/executionEngine';

interface ExecutionPanelProps {
  executionLog: ExecutionLogEntry[];
  executionState: ExecutionState;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onClose?: () => void;
  isVisible: boolean;
  className?: string;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({
  executionLog,
  executionState,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  onClose,
  isVisible,
  className = ''
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when execution starts and auto-scroll to latest log entry
  useEffect(() => {
    if (executionLog.length > 0 && !executionState.isPaused) {
      setIsExpanded(true);
    }
    
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [executionLog, executionState.isPaused]);

  const formatTimestamp = (timestamp: number) => {
    const diff = timestamp - executionState.startTime;
    const seconds = Math.floor(diff / 1000);
    const milliseconds = diff % 1000;
    return `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
  };

  const getActionIcon = (action: ExecutionLogEntry['action']) => {
    switch (action) {
      case 'enter': return '→';
      case 'exit': return '✓';
      case 'branch': return '↗';
      case 'loop': return '↻';
      case 'call': return '📞';
      case 'return': return '↩';
      default: return '•';
    }
  };

  const getActionColor = (action: ExecutionLogEntry['action']) => {
    switch (action) {
      case 'enter': return 'text-blue-600';
      case 'exit': return 'text-green-600';
      case 'branch': return 'text-orange-600';
      case 'loop': return 'text-purple-600';
      case 'call': return 'text-indigo-600';
      case 'return': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30 transition-all duration-300 ${isExpanded ? 'h-80' : 'h-16'} ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-200 rounded transition-colors"
            title={isExpanded ? "Collapse panel" : "Expand panel"}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            <Clock className="w-4 h-4 text-gray-600" />
            <h3 className="font-semibold text-sm">Execution Log</h3>
            <span className="text-xs text-gray-500">
              ({executionLog.length} entries)
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <Settings className="w-3 h-3 text-gray-400" />
            <label className="text-xs text-gray-600">Speed:</label>
            <select
              value={executionState.speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="text-xs border border-gray-300 rounded px-1 py-0.5"
            >
              <option value={100}>Fast (100ms)</option>
              <option value={500}>Normal (500ms)</option>
              <option value={1000}>Slow (1s)</option>
              <option value={2000}>Very Slow (2s)</option>
            </select>
          </div>

          {/* Execution Controls */}
          <div className="flex items-center gap-1 border-l pl-2 ml-2">
            {executionState.isPaused ? (
              <button
                onClick={onPlay}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Play"
                disabled={executionState.isComplete}
              >
                <Play className="w-3 h-3 text-green-600" />
              </button>
            ) : (
              <button
                onClick={onPause}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Pause"
              >
                <Pause className="w-3 h-3 text-orange-600" />
              </button>
            )}
            
            <button
              onClick={onStep}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Step"
              disabled={executionState.isComplete || !executionState.isPaused}
            >
              <SkipForward className="w-3 h-3 text-blue-600" />
            </button>
            
            <button
              onClick={onReset}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3 h-3 text-gray-600" />
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2 border-l pl-2 ml-2">
            <div className={`w-2 h-2 rounded-full ${
              executionState.isComplete ? 'bg-green-500' :
              executionState.isPaused ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />
            <span className="text-xs text-gray-600">
              {executionState.isComplete ? 'Complete' :
               executionState.isPaused ? 'Paused' : 'Running'}
            </span>
          </div>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors ml-2"
              title="Close execution panel"
            >
              <X className="w-3 h-3 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Log Display - Only visible when expanded */}
      {isExpanded && (
        <>
          <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto p-2"
          >
            {executionLog.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="text-sm">Press Play to start execution</p>
              </div>
            ) : (
              <div className="space-y-1">
                {executionLog.map((entry, index) => (
                  <div 
                    key={index}
                    className={`flex items-start gap-2 text-xs p-1 rounded ${
                      index === executionLog.length - 1 ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                  >
                    <span className="text-gray-400 font-mono text-xs min-w-12">
                      [{formatTimestamp(entry.timestamp)}]
                    </span>
                    <span className={`min-w-4 ${getActionColor(entry.action)}`}>
                      {getActionIcon(entry.action)}
                    </span>
                    <span className="text-gray-600 min-w-8">
                      Block {entry.blockIndex}:
                    </span>
                    <span className="text-gray-800 font-medium">
                      "{entry.blockContent}"
                    </span>
                    {entry.details && (
                      <span className="text-gray-500 italic">
                        - {entry.details}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Current State Summary - Only when expanded */}
          {executionState.currentBlockIndex !== null && (
            <div className="border-t border-gray-200 p-2 bg-blue-50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700 font-medium">
                  Current: Block {executionState.currentBlockIndex}
                </span>
                <span className="text-blue-600">
                  Visited: {executionState.visitedBlocks.size} blocks
                </span>
                <span className="text-blue-600">
                  Call Stack: {executionState.callStack.length}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};