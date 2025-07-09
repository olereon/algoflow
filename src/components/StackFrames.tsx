import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, Layers, AlertTriangle } from 'lucide-react';
import { StackFrame } from '../types';
import { StackFrameComponent } from './StackFrame';

interface StackFramesProps {
  frames: StackFrame[];
  maxVisibleFrames?: number;
  onFrameClick?: (frameId: string) => void;
  showVariables?: boolean;
  compact?: boolean;
  title?: string;
}

export const StackFrames: React.FC<StackFramesProps> = ({
  frames,
  maxVisibleFrames = 8,
  onFrameClick,
  showVariables = true,
  compact = false,
  title = 'Call Stack'
}) => {
  const [collapsedFrames, setCollapsedFrames] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const sortedFrames = [...frames].sort((a, b) => a.depth - b.depth);
  const totalFrames = sortedFrames.length;
  const hasOverflow = totalFrames > maxVisibleFrames;
  
  // Calculate visible frames based on showAll state
  const visibleFrames = showAll ? sortedFrames : sortedFrames.slice(0, maxVisibleFrames);
  const hiddenFramesCount = totalFrames - visibleFrames.length;

  const handleToggleCollapse = useCallback((frameId: string) => {
    setCollapsedFrames(prev => {
      const newSet = new Set(prev);
      if (newSet.has(frameId)) {
        newSet.delete(frameId);
      } else {
        newSet.add(frameId);
      }
      return newSet;
    });
  }, []);

  const handleToggleShowAll = () => {
    setShowAll(prev => !prev);
  };

  const handleCollapseAll = () => {
    setCollapsedFrames(new Set(sortedFrames.map(f => f.id)));
  };

  const handleExpandAll = () => {
    setCollapsedFrames(new Set());
  };

  const getStackDepthIndicator = () => {
    if (totalFrames <= 3) return 'text-green-600';
    if (totalFrames <= 8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStackWarning = () => {
    if (totalFrames > 100) {
      return (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertTriangle size={16} />
          <span>Stack depth is very high ({totalFrames}). Risk of stack overflow.</span>
        </div>
      );
    }
    if (totalFrames > 20) {
      return (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          <AlertTriangle size={16} />
          <span>Deep recursion detected ({totalFrames} frames)</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <span className={`text-sm font-medium ${getStackDepthIndicator()}`}>
              ({totalFrames} frame{totalFrames !== 1 ? 's' : ''})
            </span>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2">
            {totalFrames > 0 && (
              <>
                <button
                  onClick={handleCollapseAll}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Collapse All
                </button>
                <button
                  onClick={handleExpandAll}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
                >
                  Expand All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stack Warning */}
      {getStackWarning() && (
        <div className="px-4 py-2">
          {getStackWarning()}
        </div>
      )}

      {/* Frames Container */}
      <div className="p-4">
        {totalFrames === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layers size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No active function calls</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visible Frames */}
            {visibleFrames.map((frame) => (
              <StackFrameComponent
                key={frame.id}
                frame={frame}
                isActive={frame.isActive}
                isCollapsed={collapsedFrames.has(frame.id)}
                onToggleCollapse={handleToggleCollapse}
                onFrameClick={onFrameClick}
                showVariables={showVariables}
                compact={compact}
              />
            ))}

            {/* Overflow Indicator */}
            {hasOverflow && !showAll && (
              <div className="flex items-center justify-center py-3">
                <button
                  onClick={handleToggleShowAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-600"
                >
                  <MoreHorizontal size={16} />
                  <span>Show {hiddenFramesCount} more frame{hiddenFramesCount !== 1 ? 's' : ''}</span>
                  <ChevronDown size={16} />
                </button>
              </div>
            )}

            {/* Show Less Button */}
            {showAll && hasOverflow && (
              <div className="flex items-center justify-center py-3">
                <button
                  onClick={handleToggleShowAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-600"
                >
                  <span>Show less</span>
                  <ChevronUp size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stack Statistics */}
      {totalFrames > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-4">
              <span>Active: {frames.filter(f => f.isActive).length}</span>
              <span>Max Depth: {Math.max(...frames.map(f => f.depth))}</span>
              <span>Collapsed: {collapsedFrames.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Last Update: {new Date(Math.max(...frames.map(f => f.timestamp))).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};