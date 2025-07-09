import React from 'react';
import { AlertTriangle, Layers, Activity } from 'lucide-react';
import { 
  getDepthIndicator, 
  getDepthColorConfig, 
  validateAccessibility,
  DepthVisualizationOptions 
} from '../utils/depthVisualization';

interface DepthCounterProps {
  depth: number;
  totalFrames: number;
  maxDepth?: number;
  showAccessibilityInfo?: boolean;
  options?: DepthVisualizationOptions;
  compact?: boolean;
  onClick?: () => void;
}

export const DepthCounter: React.FC<DepthCounterProps> = ({
  depth,
  totalFrames,
  maxDepth = 20,
  showAccessibilityInfo = false,
  options = {},
  compact = false,
  onClick
}) => {
  const indicator = getDepthIndicator(depth);
  const colorConfig = getDepthColorConfig(depth, { ...options, maxDepth });
  const accessibility = validateAccessibility(colorConfig);

  const getUrgencyIcon = () => {
    switch (indicator.urgency) {
      case 'warning':
        return <AlertTriangle size={compact ? 12 : 14} className="text-yellow-600" />;
      case 'danger':
        return <AlertTriangle size={compact ? 12 : 14} className="text-red-600 animate-pulse" />;
      default:
        return <Layers size={compact ? 12 : 14} className="text-green-600" />;
    }
  };

  const getDepthMessage = () => {
    if (depth === 0) return 'Root level';
    if (depth <= 5) return 'Normal recursion depth';
    if (depth <= 15) return 'Deep recursion - monitor performance';
    return 'Very deep recursion - risk of stack overflow';
  };

  const containerClasses = [
    'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200',
    onClick ? 'cursor-pointer hover:shadow-md' : '',
    compact ? 'text-xs' : 'text-sm',
    indicator.urgency === 'danger' ? 'animate-pulse' : ''
  ].filter(Boolean).join(' ');

  const style = {
    backgroundColor: colorConfig.background,
    borderColor: colorConfig.border,
    color: colorConfig.text
  };

  return (
    <div
      className={containerClasses}
      style={style}
      onClick={onClick}
      title={getDepthMessage()}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {/* Urgency Icon */}
      <div className="flex-shrink-0">
        {getUrgencyIcon()}
      </div>

      {/* Depth Indicator */}
      <div className="flex items-center gap-1">
        <span 
          className="font-mono font-bold depth-indicator"
          style={{ color: colorConfig.accent }}
        >
          {indicator.icon}
        </span>
        <span className="font-medium">
          {indicator.label}
        </span>
      </div>

      {/* Progress Bar for Deep Stacks */}
      {!compact && depth > 3 && (
        <div className="flex items-center gap-1">
          <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${Math.min(100, (depth / maxDepth) * 100)}%`,
                backgroundColor: indicator.urgency === 'danger' 
                  ? '#ef4444' 
                  : indicator.urgency === 'warning' 
                    ? '#f59e0b' 
                    : '#10b981'
              }}
            />
          </div>
          <span className="text-xs opacity-75">
            {Math.round((depth / maxDepth) * 100)}%
          </span>
        </div>
      )}

      {/* Frame Count */}
      {!compact && (
        <div className="flex items-center gap-1 text-xs opacity-75">
          <Activity size={12} />
          <span>{totalFrames} frame{totalFrames !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Accessibility Indicator */}
      {showAccessibilityInfo && (
        <div 
          className="flex items-center gap-1 text-xs px-1 py-0.5 rounded"
          style={{ 
            backgroundColor: accessibility.level === 'AAA' 
              ? '#10b981' 
              : accessibility.level === 'AA' 
                ? '#f59e0b' 
                : '#ef4444',
            color: 'white'
          }}
          title={`Contrast ratio: ${colorConfig.contrastRatio.toFixed(1)}:1 (${accessibility.level})`}
        >
          <span>{accessibility.level}</span>
        </div>
      )}
    </div>
  );
};

interface DepthLegendProps {
  maxDepth?: number;
  options?: DepthVisualizationOptions;
  showAccessibilityInfo?: boolean;
}

export const DepthLegend: React.FC<DepthLegendProps> = ({
  maxDepth = 20,
  options = {},
  showAccessibilityInfo = false
}) => {
  const sampleDepths = [0, 1, 3, 5, 8, 12, 16, 20];
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Layers size={16} />
        Depth Legend
      </h3>
      
      <div className="space-y-2">
        {sampleDepths.map(depth => (
          <div key={depth} className="flex items-center justify-between">
            <DepthCounter
              depth={depth}
              totalFrames={depth + 1}
              maxDepth={maxDepth}
              options={options}
              compact={true}
              showAccessibilityInfo={showAccessibilityInfo}
            />
            <span className="text-xs text-gray-500 ml-2">
              {depth === 0 && 'Root level'}
              {depth > 0 && depth <= 5 && 'Safe'}
              {depth > 5 && depth <= 15 && 'Warning'}
              {depth > 15 && 'Danger'}
            </span>
          </div>
        ))}
      </div>
      
      {showAccessibilityInfo && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <div className="font-medium mb-1">Accessibility Levels:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>AAA - Enhanced contrast (7:1 ratio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                <span>AA - Standard contrast (4.5:1 ratio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span>FAIL - Below accessibility standards</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};