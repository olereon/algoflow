import React, { useState } from 'react';
import { Play, Pause, Square, Shuffle, Zap, RotateCcw } from 'lucide-react';
import {
  useAnimation,
  useTween,
  useKeyframes,
  useAnimationController,
  usePresetAnimation,
  useSpringPreset
} from '../hooks/useAnimation';
import { SpringConfigs } from '../types/animation';

export const AnimationShowcase: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('basic');
  const { playbackState, metrics, playbackSpeed, setPlaybackSpeed, play, pause, stop } = useAnimationController();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Animation Controller Showcase
          </h1>
          <p className="text-gray-600">
            Comprehensive demonstration of the centralized animation system
          </p>
        </div>

        {/* Global Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Global Animation Control</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {playbackState.toUpperCase()} - {playbackSpeed.toFixed(1)}x
              </span>
              <div className="flex gap-1">
                <button
                  onClick={play}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Play size={16} />
                </button>
                <button
                  onClick={pause}
                  className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  <Pause size={16} />
                </button>
                <button
                  onClick={stop}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Square size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium text-gray-700">FPS</div>
              <div className="text-2xl font-mono text-blue-600">{metrics.fps}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium text-gray-700">Active</div>
              <div className="text-2xl font-mono text-green-600">{metrics.activeAnimations}</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium text-gray-700">Frame Time</div>
              <div className="text-2xl font-mono text-purple-600">{metrics.frameTime.toFixed(1)}ms</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="font-medium text-gray-700">Speed</div>
              <div className="text-2xl font-mono text-orange-600">{playbackSpeed.toFixed(1)}x</div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Playback Speed
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

        {/* Demo Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Animation Demos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { id: 'basic', name: 'Basic Animation', icon: <Play size={16} /> },
              { id: 'tween', name: 'Tween Values', icon: <Zap size={16} /> },
              { id: 'spring', name: 'Spring Physics', icon: <RotateCcw size={16} /> },
              { id: 'keyframes', name: 'Keyframes', icon: <Shuffle size={16} /> }
            ].map(demo => (
              <button
                key={demo.id}
                onClick={() => setSelectedDemo(demo.id)}
                className={`flex items-center gap-2 p-3 rounded text-sm transition-colors ${
                  selectedDemo === demo.id
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {demo.icon}
                {demo.name}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {selectedDemo === 'basic' && <BasicAnimationDemo />}
          {selectedDemo === 'tween' && <TweenAnimationDemo />}
          {selectedDemo === 'spring' && <SpringAnimationDemo />}
          {selectedDemo === 'keyframes' && <KeyframesAnimationDemo />}
        </div>
      </div>
    </div>
  );
};

const BasicAnimationDemo: React.FC = () => {
  const animation = useAnimation(2000, {
    autoStart: false,
    loop: false
  });

  const presetAnimation = usePresetAnimation('bounceIn', {
    autoStart: false
  });

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Basic Animation Hook</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 className="font-medium mb-3">Custom Animation</h5>
          <div className="bg-gray-100 h-32 rounded-lg relative overflow-hidden mb-4">
            <div
              className="absolute top-1/2 w-8 h-8 bg-blue-500 rounded-full shadow-lg transition-transform"
              style={{
                left: `${20 + animation.progress * 70}%`,
                transform: `translateY(-50%) scale(${0.5 + animation.progress * 0.5})`,
              }}
            />
          </div>
          
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => animation.start()}
              disabled={animation.isRunning}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              Start
            </button>
            <button
              onClick={animation.pause}
              disabled={!animation.isRunning}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
            >
              Pause
            </button>
            <button
              onClick={animation.resume}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Resume
            </button>
            <button
              onClick={animation.reset}
              className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Progress: {(animation.progress * 100).toFixed(1)}%
            {animation.isRunning && ' (Running)'}
            {animation.isComplete && ' (Complete)'}
          </div>
        </div>

        <div>
          <h5 className="font-medium mb-3">Preset Animation</h5>
          <div className="bg-gray-100 h-32 rounded-lg relative overflow-hidden mb-4 flex items-center justify-center">
            <div
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg"
              style={{
                opacity: presetAnimation.progress,
                transform: `scale(${presetAnimation.progress})`,
              }}
            />
          </div>
          
          <button
            onClick={() => presetAnimation.start()}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 mr-2"
          >
            Bounce In
          </button>
          
          <div className="text-sm text-gray-600 mt-2">
            Using preset: bounceIn
          </div>
        </div>
      </div>
    </div>
  );
};

const TweenAnimationDemo: React.FC = () => {
  const [tweenTarget, setTweenTarget] = useState({ x: 0, y: 0, scale: 1, rotation: 0 });
  
  const tween = useTween({
    from: { x: 0, y: 0, scale: 1, rotation: 0 },
    to: tweenTarget,
    duration: 1000,
    onUpdate: () => {
      // Values automatically update via state
    }
  });

  const randomTarget = () => {
    setTweenTarget({
      x: Math.random() * 200,
      y: Math.random() * 100,
      scale: 0.5 + Math.random(),
      rotation: Math.random() * 360
    });
    tween.start();
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Tween Animation Hook</h4>
      
      <div className="bg-gray-100 h-48 rounded-lg relative overflow-hidden mb-4">
        <div
          className="absolute w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg"
          style={{
            left: `${20 + tween.values.x}px`,
            top: `${20 + tween.values.y}px`,
            transform: `scale(${tween.values.scale}) rotate(${tween.values.rotation}deg)`,
          }}
        />
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={randomTarget}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Random Position
        </button>
        <button
          onClick={tween.stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-2 text-sm">
        <div>
          <span className="text-gray-600">X:</span>
          <span className="ml-1 font-mono">{tween.values.x.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-gray-600">Y:</span>
          <span className="ml-1 font-mono">{tween.values.y.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-gray-600">Scale:</span>
          <span className="ml-1 font-mono">{tween.values.scale.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">Rotation:</span>
          <span className="ml-1 font-mono">{tween.values.rotation.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
};

const SpringAnimationDemo: React.FC = () => {
  const [springTarget, setSpringTarget] = useState(0);
  const [selectedConfig, setSelectedConfig] = useState<keyof typeof SpringConfigs>('default');
  
  const spring = useSpringPreset(
    selectedConfig,
    0,
    springTarget,
    () => {
      // Spring updates automatically
    }
  );

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Spring Physics Animation</h4>
      
      <div className="bg-gray-100 h-32 rounded-lg relative overflow-hidden mb-4">
        <div
          className="absolute top-1/2 w-8 h-8 bg-red-500 rounded-full shadow-lg"
          style={{
            left: `${20 + (spring.value / 100) * 70}%`,
            transform: 'translateY(-50%)',
          }}
        />
        <div className="absolute top-1/2 left-2 w-1 h-8 bg-gray-400 transform -translate-y-1/2" />
        <div
          className="absolute top-1/2 w-1 h-8 bg-green-500 transform -translate-y-1/2"
          style={{ left: `${20 + (springTarget / 100) * 70}%` }}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Spring Configuration
        </label>
        <select
          value={selectedConfig}
          onChange={(e) => setSelectedConfig(e.target.value as keyof typeof SpringConfigs)}
          className="px-3 py-1 border border-gray-300 rounded text-sm"
        >
          {Object.keys(SpringConfigs).map(config => (
            <option key={config} value={config}>
              {config.charAt(0).toUpperCase() + config.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Position: {springTarget}
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={springTarget}
          onChange={(e) => {
            setSpringTarget(parseInt(e.target.value));
            spring.start();
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Current:</span>
          <span className="ml-1 font-mono">{spring.value.toFixed(1)}</span>
        </div>
        <div>
          <span className="text-gray-600">Velocity:</span>
          <span className="ml-1 font-mono">{spring.velocity.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">Running:</span>
          <span className="ml-1">{spring.isRunning ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
};

const KeyframesAnimationDemo: React.FC = () => {
  const keyframes = useKeyframes({
    duration: 3000,
    keyframes: [
      { time: 0, values: { x: 0, y: 0, scale: 1, color: '#3b82f6' } },
      { time: 0.25, values: { x: 100, y: 0, scale: 1.2, color: '#ef4444' } },
      { time: 0.5, values: { x: 100, y: 50, scale: 0.8, color: '#10b981' } },
      { time: 0.75, values: { x: 0, y: 50, scale: 1.5, color: '#f59e0b' } },
      { time: 1, values: { x: 0, y: 0, scale: 1, color: '#8b5cf6' } }
    ],
    repeat: 'infinite',
    direction: 'alternate'
  });

  return (
    <div>
      <h4 className="text-lg font-semibold mb-4">Keyframe Animation</h4>
      
      <div className="bg-gray-100 h-40 rounded-lg relative overflow-hidden mb-4">
        <div
          className="absolute w-8 h-8 rounded-full shadow-lg transition-colors"
          style={{
            left: `${20 + (keyframes.values.x || 0)}px`,
            top: `${20 + (keyframes.values.y || 0)}px`,
            transform: `scale(${keyframes.values.scale || 1})`,
            backgroundColor: keyframes.values.color || '#3b82f6',
          }}
        />
        
        {/* Keyframe markers */}
        {[0, 25, 50, 75, 100].map((_percent, index) => (
          <div
            key={index}
            className="absolute w-2 h-2 bg-gray-400 rounded-full"
            style={{
              left: `${20 + (index * 25)}px`,
              top: `${20 + (index % 2 === 0 ? 0 : 50)}px`,
            }}
          />
        ))}
      </div>
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={keyframes.start}
          disabled={keyframes.isRunning}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Start Keyframes
        </button>
        <button
          onClick={keyframes.stop}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stop
        </button>
      </div>
      
      <div className="text-sm text-gray-600">
        Iteration: {keyframes.iteration} | Running: {keyframes.isRunning ? 'Yes' : 'No'}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Gray dots show keyframe positions. Animation alternates between forward and reverse.
      </div>
    </div>
  );
};