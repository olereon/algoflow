import React, { useState } from 'react';
import { Play, Pause, Square, Settings, Activity, BarChart3, Clock, Zap } from 'lucide-react';
import { useAnimationController } from '../hooks/useAnimation';
import { animationController, EasingFunctions } from '../utils/AnimationController';
import { PlaybackState } from '../types/animation';

interface AnimationDebuggerProps {
  isOpen?: boolean;
  onClose?: () => void;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const AnimationDebugger: React.FC<AnimationDebuggerProps> = ({
  isOpen = false,
  onClose,
  position = 'bottom-right'
}) => {
  const { playbackState, metrics, playbackSpeed, play, pause, stop, setPlaybackSpeed } = useAnimationController();
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEasing, setSelectedEasing] = useState<keyof typeof EasingFunctions>('easeOutQuad');
  const [testDuration, setTestDuration] = useState(1000);

  const getPositionClasses = () => {
    const base = 'fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg';
    switch (position) {
      case 'top-left':
        return `${base} top-4 left-4`;
      case 'top-right':
        return `${base} top-4 right-4`;
      case 'bottom-left':
        return `${base} bottom-4 left-4`;
      case 'bottom-right':
      default:
        return `${base} bottom-4 right-4`;
    }
  };

  const getStateColor = (state: PlaybackState) => {
    switch (state) {
      case 'playing':
        return 'text-green-600';
      case 'paused':
        return 'text-yellow-600';
      case 'stopped':
      default:
        return 'text-gray-600';
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600';
    if (fps >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const runTestAnimation = () => {
    const easingFn = EasingFunctions[selectedEasing];
    let testElement: HTMLElement | null = null;

    animationController.addAnimation({
      duration: testDuration,
      easing: easingFn,
      callback: (progress) => {
        if (!testElement) {
          testElement = document.createElement('div');
          testElement.style.cssText = `
            position: fixed;
            top: 50%;
            left: 10px;
            width: 40px;
            height: 40px;
            background: linear-gradient(45deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            transform: translateY(-50%);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            z-index: 9999;
            pointer-events: none;
          `;
          document.body.appendChild(testElement);
        }

        const x = 10 + (window.innerWidth - 100) * progress;
        const scale = 0.5 + 0.5 * progress;
        const rotation = 360 * progress;
        
        testElement.style.transform = `
          translateY(-50%) 
          translateX(${x - 10}px) 
          scale(${scale}) 
          rotate(${rotation}deg)
        `;
      },
      onComplete: () => {
        if (testElement) {
          setTimeout(() => {
            document.body.removeChild(testElement!);
          }, 500);
        }
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setShowDetails(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        title="Open Animation Debugger"
      >
        <Activity size={20} />
      </button>
    );
  }

  return (
    <div className={getPositionClasses()}>
      <div className="p-4 w-80">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            <h3 className="font-semibold text-gray-800">Animation Debugger</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded"
          >
            ×
          </button>
        </div>

        {/* Playback Controls */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Playback Control</span>
            <span className={`text-sm font-medium ${getStateColor(playbackState)}`}>
              {playbackState.toUpperCase()}
            </span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={play}
              disabled={playbackState === 'playing'}
              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={14} />
              Play
            </button>
            <button
              onClick={pause}
              disabled={playbackState !== 'playing'}
              className="flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pause size={14} />
              Pause
            </button>
            <button
              onClick={stop}
              className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              <Square size={14} />
              Stop
            </button>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Speed: {playbackSpeed.toFixed(1)}x</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="4.0"
              step="0.1"
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={16} className="text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Performance</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-1">
                <Zap size={12} className={getFPSColor(metrics.fps)} />
                <span className="text-gray-600">FPS</span>
              </div>
              <div className={`font-mono ${getFPSColor(metrics.fps)}`}>
                {metrics.fps}
              </div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-blue-500" />
                <span className="text-gray-600">Frame</span>
              </div>
              <div className="font-mono text-blue-600">
                {metrics.frameTime.toFixed(1)}ms
              </div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-1">
                <Activity size={12} className="text-green-500" />
                <span className="text-gray-600">Active</span>
              </div>
              <div className="font-mono text-green-600">
                {metrics.activeAnimations}
              </div>
            </div>
            
            <div className="bg-gray-50 p-2 rounded">
              <div className="flex items-center gap-1">
                <Settings size={12} className="text-gray-500" />
                <span className="text-gray-600">Memory</span>
              </div>
              <div className="font-mono text-gray-600">
                {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
              </div>
            </div>
          </div>
        </div>

        {/* Test Animation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Play size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-700">Test Animation</span>
          </div>
          
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Easing Function</label>
              <select
                value={selectedEasing}
                onChange={(e) => setSelectedEasing(e.target.value as keyof typeof EasingFunctions)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {Object.keys(EasingFunctions).map(name => (
                  <option key={name} value={name}>
                    {name.replace(/([A-Z])/g, ' $1').trim()}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Duration: {testDuration}ms
              </label>
              <input
                type="range"
                min="200"
                max="3000"
                step="100"
                value={testDuration}
                onChange={(e) => setTestDuration(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <button
              onClick={runTestAnimation}
              className="w-full px-3 py-2 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors"
            >
              Run Test Animation
            </button>
          </div>
        </div>

        {/* Advanced Details Toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} Advanced Details
        </button>

        {/* Advanced Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-medium text-gray-700">Queue Length:</span>
                <span className="ml-2 font-mono">{metrics.activeAnimations}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Dropped Frames:</span>
                <span className="ml-2 font-mono">{metrics.droppedFrames}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Memory Usage:</span>
                <span className="ml-2 font-mono">{metrics.memoryUsage} bytes</span>
              </div>
              
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium text-gray-700 mb-1">Controller Status:</div>
                <div className="space-y-1 text-xs font-mono text-gray-600">
                  <div>State: {playbackState}</div>
                  <div>Speed: {playbackSpeed}x</div>
                  <div>Active: {metrics.activeAnimations}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};