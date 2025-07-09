import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, Layers, AlertTriangle } from 'lucide-react';
import { StackFrame, AnimationConfig } from '../types';
import { StackFrameComponent } from './StackFrame';
import { useStackAnimations } from '../hooks/useStackAnimations';
import { useAnimationPerformance } from '../hooks/useAnimationPerformance';
import { AnimationSettings } from './AnimationSettings';
import { DEFAULT_ANIMATION_CONFIG } from '../utils/animation';

interface StackFramesProps {
  frames: StackFrame[];
  maxVisibleFrames?: number;
  onFrameClick?: (frameId: string) => void;
  showVariables?: boolean;
  compact?: boolean;
  title?: string;
  animationConfig?: AnimationConfig;
  onAnimationConfigChange?: (config: AnimationConfig) => void;
  showAnimationSettings?: boolean;
}

export const StackFrames: React.FC<StackFramesProps> = ({
  frames,
  maxVisibleFrames = 8,
  onFrameClick,
  showVariables = true,
  compact = false,
  title = 'Call Stack',
  animationConfig = DEFAULT_ANIMATION_CONFIG,
  onAnimationConfigChange,
  showAnimationSettings = true
}) => {
  const [collapsedFrames, setCollapsedFrames] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [prevFrames, setPrevFrames] = useState<StackFrame[]>([]);

  // Animation hooks
  const {
    animateFrameEntry,
    animateFrameExit,
    animateFrameUpdate,
    animateFrameActivation,
    animateBatchEntry,
    animateBatchExit,
    frameStates,
  } = useStackAnimations(frames, {
    config: animationConfig,
    onAnimationStart: (animation) => {
      console.debug('Animation started:', animation.type, animation.frameId);
    },
    onAnimationEnd: (animation) => {
      console.debug('Animation completed:', animation.type, animation.frameId);
    }
  });

  // Performance monitoring
  const {
    metrics,
    optimizedConfig: performanceConfig,
    optimizeForPerformance,
    resetOptimization,
    isOptimized
  } = useAnimationPerformance(frames, animationConfig, {
    enableMonitoring: animationConfig.enableAnimations,
    autoOptimize: true
  });

  // Detect frame changes and trigger animations
  const sortedFrames = useMemo(() => {
    const sorted = [...frames].sort((a, b) => a.depth - b.depth);
    
    // Detect changes and trigger animations
    if (animationConfig.enableAnimations && !animationConfig.reducedMotion) {
      const prevFrameIds = new Set(prevFrames.map(f => f.id));
      const currentFrameIds = new Set(sorted.map(f => f.id));
      
      // New frames (entries)
      const newFrames = sorted.filter(frame => !prevFrameIds.has(frame.id));
      if (newFrames.length > 0) {
        if (newFrames.length === 1) {
          animateFrameEntry(newFrames[0]);
        } else {
          animateBatchEntry(newFrames);
        }
      }
      
      // Removed frames (exits)
      const removedFrameIds = prevFrames
        .filter(frame => !currentFrameIds.has(frame.id))
        .map(frame => frame.id);
      if (removedFrameIds.length > 0) {
        if (removedFrameIds.length === 1) {
          animateFrameExit(removedFrameIds[0]);
        } else {
          animateBatchExit(removedFrameIds);
        }
      }
      
      // Updated frames
      sorted.forEach(frame => {
        const prevFrame = prevFrames.find(f => f.id === frame.id);
        if (prevFrame) {
          // Check for changes that warrant animation
          if (frame.isActive !== prevFrame.isActive) {
            animateFrameActivation(frame.id, frame.isActive);
          } else if (
            frame.parameters !== prevFrame.parameters ||
            frame.localVariables !== prevFrame.localVariables ||
            frame.currentLine !== prevFrame.currentLine
          ) {
            animateFrameUpdate(frame);
          }
        }
      });
    }
    
    setPrevFrames(sorted);
    return sorted;
  }, [frames, prevFrames, animationConfig, animateFrameEntry, animateFrameExit, animateFrameUpdate, animateFrameActivation, animateBatchEntry, animateBatchExit]);

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
    <div className="space-y-4">
      {/* Animation Settings */}
      {showAnimationSettings && onAnimationConfigChange && (
        <AnimationSettings
          config={performanceConfig}
          onChange={onAnimationConfigChange}
          performanceMetrics={metrics}
          onOptimize={() => optimizeForPerformance('moderate')}
          isOptimized={isOptimized}
          onReset={resetOptimization}
        />
      )}

      {/* Stack Frames Container */}
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
                animationState={frameStates.get(frame.id)}
                animationSpeed={performanceConfig.speed}
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
    </div>
  );
};