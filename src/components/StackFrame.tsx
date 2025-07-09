import React, { useMemo, useCallback } from 'react';
import { ChevronDown, ChevronRight, Play, Pause, ArrowLeft, Code2 } from 'lucide-react';
import { FrameVariable, FrameComponentProps } from '../types';
import { useFrameAnimation } from '../hooks/useStackAnimations';
import { DepthCounter } from './DepthCounter';
import { 
  getDepthColorConfig, 
  getDepthClasses,
  DepthVisualizationOptions 
} from '../utils/depthVisualization';

interface VariableDisplayProps {
  variable: FrameVariable;
  compact?: boolean;
}

const VariableDisplay: React.FC<VariableDisplayProps> = ({ variable, compact }) => {
  const getValueString = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'number': return 'text-blue-600';
      case 'string': return 'text-green-600';
      case 'boolean': return 'text-purple-600';
      case 'object': return 'text-orange-600';
      case 'array': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'} ${variable.isChanged ? 'bg-yellow-50 px-1 rounded' : ''}`}>
      <span className={`font-medium ${variable.isParameter ? 'text-blue-700' : 'text-gray-700'}`}>
        {variable.name}
      </span>
      <span className="text-gray-400">:</span>
      <span className={`font-mono ${getTypeColor(variable.type)}`}>
        {getValueString(variable.value)}
      </span>
      {variable.isParameter && (
        <span className="text-xs text-blue-500 bg-blue-100 px-1 rounded">param</span>
      )}
      {variable.isChanged && (
        <span className="text-xs text-yellow-600 bg-yellow-100 px-1 rounded">changed</span>
      )}
    </div>
  );
};

export const StackFrameComponent: React.FC<FrameComponentProps & {
  visualizationOptions?: DepthVisualizationOptions;
  showDepthCounter?: boolean;
}> = ({
  frame,
  isActive,
  isCollapsed = false,
  onToggleCollapse,
  onFrameClick,
  showVariables = true,
  compact = false,
  animationState = 'idle',
  animationSpeed = 'normal',
  visualizationOptions = {},
  showDepthCounter = true
}) => {
  // Animation hook
  const { isAnimating, currentState, animationClasses } = useFrameAnimation(
    frame.id,
    animationState,
    animationSpeed
  );

  // Depth visualization
  const depthConfig = getDepthColorConfig(frame.depth, visualizationOptions);
  const depthClasses = getDepthClasses(frame.depth, visualizationOptions);
  const getFrameStyle = useCallback(() => {
    const baseStyle = {
      backgroundColor: depthConfig.background,
      borderColor: depthConfig.border,
      color: depthConfig.text
    };

    if (isActive) {
      return {
        ...baseStyle,
        backgroundColor: depthConfig.accent,
        boxShadow: `0 0 0 2px ${depthConfig.border}`,
        borderColor: depthConfig.accent
      };
    }

    return baseStyle;
  }, [depthConfig, isActive]);

  const getFrameHeaderStyle = useCallback(() => {
    return {
      background: depthConfig.gradient,
      color: depthConfig.text
    };
  }, [depthConfig]);

  const handleFrameClick = () => {
    if (onFrameClick) {
      onFrameClick(frame.id);
    }
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleCollapse) {
      onToggleCollapse(frame.id);
    }
  };

  // Combine animation classes with base classes
  const frameClasses = useMemo(() => {
    const baseClasses = [
      'border-2',
      'rounded-lg',
      'transition-all',
      'duration-200',
      'hover:shadow-lg',
      onFrameClick ? 'cursor-pointer' : '',
      ...depthClasses
    ];

    // Add animation classes
    if (isAnimating) {
      baseClasses.push('stack-frame-animated', ...animationClasses);
    }

    // Add state-based classes
    if (isActive) {
      baseClasses.push('stack-frame-active');
    }

    if (currentState === 'updating') {
      baseClasses.push('stack-frame-updating');
    }

    return baseClasses.filter(Boolean).join(' ');
  }, [onFrameClick, isAnimating, animationClasses, isActive, currentState, depthClasses]);

  return (
    <div 
      className={frameClasses}
      onClick={handleFrameClick}
      style={{
        ...getFrameStyle(),
        willChange: isAnimating ? 'transform, opacity' : 'auto'
      }}
    >
      {/* Frame Header */}
      <div 
        className="px-3 py-2 rounded-t-lg"
        style={getFrameHeaderStyle()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Collapse/Expand Button */}
            {showVariables && (frame.parameters.length > 0 || frame.localVariables.length > 0) && (
              <button
                onClick={handleToggleCollapse}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
            
            {/* Active/Inactive Indicator */}
            <div className="flex items-center gap-1">
              {isActive ? (
                <Play size={14} className="text-green-600" />
              ) : (
                <Pause size={14} className="text-gray-400" />
              )}
            </div>
            
            {/* Depth Indicator */}
            {showDepthCounter && (
              <DepthCounter
                depth={frame.depth}
                totalFrames={1}
                compact={compact}
                options={visualizationOptions}
              />
            )}
            
            {/* Function Name */}
            <div className="flex items-center gap-1">
              <Code2 size={14} />
              <span className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                {frame.functionName}
              </span>
            </div>
          </div>
          
          {/* Call Site */}
          {frame.callSite && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ArrowLeft size={12} />
              <span>{frame.callSite}</span>
            </div>
          )}
        </div>
        
        {/* Current Line Indicator */}
        {frame.currentLine && (
          <div className="mt-1 text-xs text-gray-600">
            Line {frame.currentLine}
          </div>
        )}
      </div>

      {/* Frame Body */}
      {!isCollapsed && showVariables && (
        <div className="px-3 py-2">
          {/* Parameters */}
          {frame.parameters.length > 0 && (
            <div className="mb-3">
              <h4 className={`font-medium text-gray-700 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                Parameters
              </h4>
              <div className="space-y-1">
                {frame.parameters.map((param, index) => (
                  <VariableDisplay key={index} variable={param} compact={compact} />
                ))}
              </div>
            </div>
          )}
          
          {/* Local Variables */}
          {frame.localVariables.length > 0 && (
            <div className="mb-3">
              <h4 className={`font-medium text-gray-700 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                Local Variables
              </h4>
              <div className="space-y-1">
                {frame.localVariables.map((variable, index) => (
                  <VariableDisplay key={index} variable={variable} compact={compact} />
                ))}
              </div>
            </div>
          )}
          
          {/* Return Value */}
          {frame.returnValue !== undefined && (
            <div className="border-t pt-2">
              <h4 className={`font-medium text-gray-700 mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                Return Value
              </h4>
              <div className={`font-mono text-green-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                {typeof frame.returnValue === 'string' ? `"${frame.returnValue}"` : String(frame.returnValue)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};