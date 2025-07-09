import React, { useState, useCallback } from 'react';
import { Settings, Play, Pause, RotateCcw, Zap, Clock, Gauge } from 'lucide-react';
import { AnimationConfig, AnimationSpeed } from '../types';
import { DEFAULT_ANIMATION_CONFIG } from '../utils/animation';

interface AnimationSettingsProps {
  config: AnimationConfig;
  onChange: (config: AnimationConfig) => void;
  performanceMetrics?: {
    fps: number;
    frameDrops: number;
    animationLoad: number;
  };
  onOptimize?: () => void;
  isOptimized?: boolean;
  onReset?: () => void;
}

export const AnimationSettings: React.FC<AnimationSettingsProps> = ({
  config,
  onChange,
  performanceMetrics,
  onOptimize,
  isOptimized = false,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSpeedChange = useCallback((speed: AnimationSpeed) => {
    onChange({ ...config, speed });
  }, [config, onChange]);

  const handleToggleAnimations = useCallback(() => {
    onChange({ ...config, enableAnimations: !config.enableAnimations });
  }, [config, onChange]);

  const handleToggleReducedMotion = useCallback(() => {
    onChange({ ...config, reducedMotion: !config.reducedMotion });
  }, [config, onChange]);

  const handleMaxConcurrentChange = useCallback((value: number) => {
    onChange({ ...config, maxConcurrentAnimations: Math.max(1, Math.min(20, value)) });
  }, [config, onChange]);

  const handleEasingChange = useCallback((easing: AnimationConfig['easing']) => {
    onChange({ ...config, easing });
  }, [config, onChange]);

  const getSpeedIcon = (speed: AnimationSpeed) => {
    switch (speed) {
      case 'slow': return <Clock size={16} />;
      case 'normal': return <Play size={16} />;
      case 'fast': return <Zap size={16} />;
      case 'instant': return <Gauge size={16} />;
    }
  };

  const getPerformanceColor = () => {
    if (!performanceMetrics) return 'text-gray-500';
    const { fps, frameDrops } = performanceMetrics;
    
    if (fps < 45 || frameDrops > 5) return 'text-red-500';
    if (fps < 55 || frameDrops > 2) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div 
        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Animation Settings</h3>
            {isOptimized && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Optimized
              </span>
            )}
          </div>
          
          {/* Quick Controls */}
          <div className="flex items-center gap-2">
            {performanceMetrics && (
              <div className={`text-sm ${getPerformanceColor()}`}>
                {performanceMetrics.fps.toFixed(0)} FPS
              </div>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleAnimations();
              }}
              className={`p-1 rounded transition-colors ${
                config.enableAnimations 
                  ? 'text-green-600 hover:bg-green-100' 
                  : 'text-gray-400 hover:bg-gray-100'
              }`}
              title={config.enableAnimations ? 'Disable animations' : 'Enable animations'}
            >
              {config.enableAnimations ? <Play size={16} /> : <Pause size={16} />}
            </button>
            
            <div className="text-gray-400">
              {isExpanded ? '▼' : '▶'}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Settings */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Animation Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation Speed
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['slow', 'normal', 'fast', 'instant'] as AnimationSpeed[]).map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`flex items-center justify-center gap-1 px-3 py-2 text-sm rounded border transition-colors ${
                    config.speed === speed
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={!config.enableAnimations}
                >
                  {getSpeedIcon(speed)}
                  <span className="capitalize">{speed}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Easing Function */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Easing Function
            </label>
            <select
              value={config.easing}
              onChange={(e) => handleEasingChange(e.target.value as AnimationConfig['easing'])}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
              disabled={!config.enableAnimations}
            >
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
              <option value="linear">Linear</option>
            </select>
          </div>

          {/* Max Concurrent Animations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Concurrent Animations: {config.maxConcurrentAnimations}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">1</span>
              <input
                type="range"
                min="1"
                max="20"
                value={config.maxConcurrentAnimations}
                onChange={(e) => handleMaxConcurrentChange(parseInt(e.target.value))}
                className="flex-1"
                disabled={!config.enableAnimations}
              />
              <span className="text-xs text-gray-500">20</span>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Higher values may impact performance on slower devices
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.enableAnimations}
                onChange={handleToggleAnimations}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Enable animations</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.reducedMotion}
                onChange={handleToggleReducedMotion}
                className="rounded border-gray-300"
                disabled={!config.enableAnimations}
              />
              <span className="text-sm text-gray-700">Reduced motion (accessibility)</span>
            </label>
          </div>

          {/* Performance Section */}
          {performanceMetrics && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Performance</h4>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <div className={`font-medium ${getPerformanceColor()}`}>
                    {performanceMetrics.fps.toFixed(1)}
                  </div>
                  <div className="text-gray-500">FPS</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${performanceMetrics.frameDrops > 5 ? 'text-red-500' : 'text-green-500'}`}>
                    {performanceMetrics.frameDrops}
                  </div>
                  <div className="text-gray-500">Drops</div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${performanceMetrics.animationLoad > 0.8 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {(performanceMetrics.animationLoad * 100).toFixed(0)}%
                  </div>
                  <div className="text-gray-500">Load</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                {onOptimize && (
                  <button
                    onClick={onOptimize}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                  >
                    <Zap size={12} />
                    Optimize
                  </button>
                )}
                
                {onReset && (
                  <button
                    onClick={onReset}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Preset Configurations */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Presets</h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChange({
                  ...DEFAULT_ANIMATION_CONFIG,
                  speed: 'slow',
                  maxConcurrentAnimations: 4
                })}
                className="px-3 py-2 text-xs bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
              >
                Smooth
              </button>
              
              <button
                onClick={() => onChange(DEFAULT_ANIMATION_CONFIG)}
                className="px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
              >
                Balanced
              </button>
              
              <button
                onClick={() => onChange({
                  ...DEFAULT_ANIMATION_CONFIG,
                  speed: 'fast',
                  maxConcurrentAnimations: 12,
                  easing: 'linear'
                })}
                className="px-3 py-2 text-xs bg-orange-50 text-orange-700 rounded hover:bg-orange-100 transition-colors"
              >
                Performance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};