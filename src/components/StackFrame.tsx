import React from 'react';
import { ChevronDown, ChevronRight, Play, Pause, ArrowLeft, Code2 } from 'lucide-react';
import { FrameVariable, FrameComponentProps } from '../types';

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

export const StackFrameComponent: React.FC<FrameComponentProps> = ({
  frame,
  isActive,
  isCollapsed = false,
  onToggleCollapse,
  onFrameClick,
  showVariables = true,
  compact = false
}) => {
  const getFrameBackgroundColor = (): string => {
    if (isActive) return 'bg-blue-50 border-blue-200';
    if (frame.depth === 0) return 'bg-gray-50 border-gray-200';
    return 'bg-white border-gray-200';
  };

  const getFrameHeaderColor = (): string => {
    if (isActive) return 'bg-blue-100 text-blue-800';
    if (frame.depth === 0) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-50 text-gray-700';
  };

  const getDepthIndicator = (): React.ReactNode => {
    if (frame.depth === 0) return null;
    
    const depthColors = [
      'bg-blue-400',
      'bg-green-400', 
      'bg-yellow-400',
      'bg-red-400',
      'bg-purple-400',
      'bg-pink-400',
      'bg-indigo-400'
    ];
    
    const colorIndex = (frame.depth - 1) % depthColors.length;
    
    return (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${depthColors[colorIndex]}`} />
        <span className="text-xs text-gray-500">L{frame.depth}</span>
      </div>
    );
  };

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

  return (
    <div 
      className={`border rounded-lg transition-all duration-200 hover:shadow-md ${getFrameBackgroundColor()} ${
        onFrameClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleFrameClick}
    >
      {/* Frame Header */}
      <div className={`px-3 py-2 rounded-t-lg ${getFrameHeaderColor()}`}>
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
            {getDepthIndicator()}
            
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