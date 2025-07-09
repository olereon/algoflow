import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { StackFrame } from '../types';
import { StackFrameComponent } from './StackFrame';

// Simple demo with basic stack frames to test animations
const createSampleFrames = (): StackFrame[] => {
  const baseTime = Date.now();
  
  return [
    {
      id: 'main',
      functionName: 'main',
      parameters: [],
      localVariables: [
        { name: 'n', value: 3, type: 'number' }
      ],
      depth: 0,
      isActive: false,
      timestamp: baseTime
    },
    {
      id: 'factorial_3',
      functionName: 'factorial',
      parameters: [
        { name: 'n', value: 3, type: 'number', isParameter: true }
      ],
      localVariables: [],
      depth: 1,
      isActive: false,
      timestamp: baseTime + 100,
      callSite: 'main:2'
    },
    {
      id: 'factorial_2',
      functionName: 'factorial', 
      parameters: [
        { name: 'n', value: 2, type: 'number', isParameter: true }
      ],
      localVariables: [],
      depth: 2,
      isActive: false,
      timestamp: baseTime + 200,
      callSite: 'factorial:4'
    },
    {
      id: 'factorial_1',
      functionName: 'factorial',
      parameters: [
        { name: 'n', value: 1, type: 'number', isParameter: true }
      ],
      localVariables: [],
      depth: 3,
      isActive: true,
      timestamp: baseTime + 300,
      currentLine: 2,
      callSite: 'factorial:4'
    }
  ];
};

export const BasicAnimationDemo: React.FC = () => {
  const [frames, setFrames] = useState<StackFrame[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [step, setStep] = useState(0);

  const allFrames = createSampleFrames();
  const maxSteps = allFrames.length;

  const handlePlay = () => {
    setIsAnimating(true);
  };

  const handlePause = () => {
    setIsAnimating(false);
  };

  const handleReset = () => {
    setIsAnimating(false);
    setStep(0);
    setFrames([]);
  };

  // Animation effect
  useEffect(() => {
    if (!isAnimating) return;

    const timer = setTimeout(() => {
      if (step < maxSteps) {
        setFrames(allFrames.slice(0, step + 1));
        setStep(prev => prev + 1);
      } else {
        setIsAnimating(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAnimating, step, maxSteps, allFrames]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Basic Animation Demo</h1>
          <p className="text-gray-600">
            Simple demonstration of stack frame animations
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Controls</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={isAnimating ? handlePause : handlePlay}
              disabled={step >= maxSteps && !isAnimating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnimating ? <Pause size={16} /> : <Play size={16} />}
              {isAnimating ? 'Pause' : 'Play'}
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <div className="text-sm text-gray-600">
              Step {step} of {maxSteps}
            </div>
          </div>
        </div>

        {/* Stack Frames Display */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            Call Stack ({frames.length} frame{frames.length !== 1 ? 's' : ''})
          </h3>
          
          {frames.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No frames yet. Click Play to start the animation.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {frames.map((frame) => (
                <StackFrameComponent
                  key={frame.id}
                  frame={frame}
                  isActive={frame.isActive}
                  animationState="idle"
                  animationSpeed="normal"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Animation Features</h3>
          <div className="text-sm text-gray-600">
            <p>• Frame entry animations as stack grows</p>
            <p>• Visual depth indicators (L1, L2, etc.)</p>
            <p>• Parameter and variable display</p>
            <p>• Active frame highlighting</p>
          </div>
        </div>
      </div>
    </div>
  );
};