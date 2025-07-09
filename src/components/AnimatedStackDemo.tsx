import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack } from 'lucide-react';
import { StackFrame, AnimationConfig } from '../types';
import { StackFrames } from './StackFrames';
import { DEFAULT_ANIMATION_CONFIG } from '../utils/animation';

interface AnimationStep {
  id: string;
  name: string;
  description: string;
  frames: StackFrame[];
  duration: number;
}

// Create sample animation sequence
const createAnimationSequence = (): AnimationStep[] => {
  const baseTime = Date.now();
  
  return [
    {
      id: 'step1',
      name: 'Initial Call',
      description: 'Main function calls factorial(5)',
      frames: [
        {
          id: 'main',
          functionName: 'main',
          parameters: [],
          localVariables: [
            { name: 'n', value: 5, type: 'number' },
            { name: 'result', value: undefined, type: 'undefined' }
          ],
          depth: 0,
          isActive: true,
          timestamp: baseTime,
          currentLine: 2
        }
      ],
      duration: 1000
    },
    {
      id: 'step2',
      name: 'First Recursive Call',
      description: 'factorial(5) is called, creating first stack frame',
      frames: [
        {
          id: 'main',
          functionName: 'main',
          parameters: [],
          localVariables: [
            { name: 'n', value: 5, type: 'number' },
            { name: 'result', value: undefined, type: 'undefined' }
          ],
          depth: 0,
          isActive: false,
          timestamp: baseTime
        },
        {
          id: 'factorial_5',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 5, type: 'number', isParameter: true }
          ],
          localVariables: [],
          depth: 1,
          isActive: true,
          timestamp: baseTime + 100,
          currentLine: 2,
          callSite: 'main:2'
        }
      ],
      duration: 800
    },
    {
      id: 'step3',
      name: 'Deep Recursion',
      description: 'Multiple recursive calls create a deep stack',
      frames: [
        {
          id: 'main',
          functionName: 'main',
          parameters: [],
          localVariables: [
            { name: 'n', value: 5, type: 'number' },
            { name: 'result', value: undefined, type: 'undefined' }
          ],
          depth: 0,
          isActive: false,
          timestamp: baseTime
        },
        {
          id: 'factorial_5',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 5, type: 'number', isParameter: true }
          ],
          localVariables: [],
          depth: 1,
          isActive: false,
          timestamp: baseTime + 100,
          callSite: 'main:2'
        },
        {
          id: 'factorial_4',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 4, type: 'number', isParameter: true }
          ],
          localVariables: [],
          depth: 2,
          isActive: false,
          timestamp: baseTime + 200,
          callSite: 'factorial:4'
        },
        {
          id: 'factorial_3',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 3, type: 'number', isParameter: true }
          ],
          localVariables: [],
          depth: 3,
          isActive: false,
          timestamp: baseTime + 300,
          callSite: 'factorial:4'
        },
        {
          id: 'factorial_2',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 2, type: 'number', isParameter: true }
          ],
          localVariables: [],
          depth: 4,
          isActive: false,
          timestamp: baseTime + 400,
          callSite: 'factorial:4'
        },
        {
          id: 'factorial_1',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 1, type: 'number', isParameter: true }
          ],
          localVariables: [],
          depth: 5,
          isActive: true,
          timestamp: baseTime + 500,
          currentLine: 2,
          callSite: 'factorial:4'
        }
      ],
      duration: 1200
    },
    {
      id: 'step4',
      name: 'Base Case Reached',
      description: 'Base case returns 1, starting the unwinding process',
      frames: [
        {
          id: 'main',
          functionName: 'main',
          parameters: [],
          localVariables: [
            { name: 'n', value: 5, type: 'number' },
            { name: 'result', value: undefined, type: 'undefined' }
          ],
          depth: 0,
          isActive: false,
          timestamp: baseTime
        },
        {
          id: 'factorial_5',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 5, type: 'number', isParameter: true }
          ],
          localVariables: [
            { name: 'temp', value: 24, type: 'number' }
          ],
          depth: 1,
          isActive: false,
          timestamp: baseTime + 100,
          callSite: 'main:2'
        },
        {
          id: 'factorial_4',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 4, type: 'number', isParameter: true }
          ],
          localVariables: [
            { name: 'temp', value: 6, type: 'number' }
          ],
          depth: 2,
          isActive: false,
          timestamp: baseTime + 200,
          callSite: 'factorial:4'
        },
        {
          id: 'factorial_3',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 3, type: 'number', isParameter: true }
          ],
          localVariables: [
            { name: 'temp', value: 2, type: 'number' }
          ],
          depth: 3,
          isActive: false,
          timestamp: baseTime + 300,
          callSite: 'factorial:4'
        },
        {
          id: 'factorial_2',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 2, type: 'number', isParameter: true }
          ],
          localVariables: [
            { name: 'temp', value: 1, type: 'number' }
          ],
          depth: 4,
          isActive: true,
          timestamp: baseTime + 400,
          currentLine: 4,
          callSite: 'factorial:4'
        }
      ],
      duration: 1000
    },
    {
      id: 'step5',
      name: 'Stack Unwinding',
      description: 'Functions return in reverse order, stack shrinks',
      frames: [
        {
          id: 'main',
          functionName: 'main',
          parameters: [],
          localVariables: [
            { name: 'n', value: 5, type: 'number' },
            { name: 'result', value: undefined, type: 'undefined' }
          ],
          depth: 0,
          isActive: false,
          timestamp: baseTime
        },
        {
          id: 'factorial_5',
          functionName: 'factorial',
          parameters: [
            { name: 'n', value: 5, type: 'number', isParameter: true }
          ],
          localVariables: [
            { name: 'temp', value: 24, type: 'number' }
          ],
          depth: 1,
          isActive: true,
          timestamp: baseTime + 100,
          currentLine: 4,
          callSite: 'main:2'
        }
      ],
      duration: 800
    },
    {
      id: 'step6',
      name: 'Final Result',
      description: 'Main function receives final result',
      frames: [
        {
          id: 'main',
          functionName: 'main',
          parameters: [],
          localVariables: [
            { name: 'n', value: 5, type: 'number' },
            { name: 'result', value: 120, type: 'number', isChanged: true }
          ],
          depth: 0,
          isActive: true,
          timestamp: baseTime,
          currentLine: 3
        }
      ],
      duration: 1000
    }
  ];
};

export const AnimatedStackDemo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig>(DEFAULT_ANIMATION_CONFIG);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  const steps = createAnimationSequence();
  const currentStepData = steps[currentStep];

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const duration = currentStepData.duration / playbackSpeed;
    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        setIsPlaying(false);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, currentStepData.duration, playbackSpeed, steps.length]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepIndex: number) => {
    setCurrentStep(stepIndex);
    setIsPlaying(false);
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Animated Stack Frame Demo</h1>
          <p className="text-gray-600">
            Watch how stack frames animate during recursive function execution
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-4">Playback Controls</h3>
              
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipBack size={20} />
                </button>
                
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="p-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={currentStep === steps.length - 1}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SkipForward size={20} />
                </button>
                
                <button
                  onClick={handleReset}
                  className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Playback Speed: {playbackSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.5"
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            {/* Step Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Timeline</h3>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(index)}
                    className={`w-full text-left p-3 rounded text-sm transition-colors ${
                      index === currentStep
                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{step.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stack Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                {currentStepData.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {currentStepData.description}
              </p>
              
              <div className="bg-gray-50 rounded p-3 text-sm font-mono">
                <div className="text-blue-600">// Current state:</div>
                <div>Stack depth: {currentStepData.frames.length}</div>
                <div>Active frame: {currentStepData.frames.find(f => f.isActive)?.functionName || 'none'}</div>
                <div>Animation: {animationConfig.enableAnimations ? 'enabled' : 'disabled'}</div>
              </div>
            </div>

            <StackFrames
              frames={currentStepData.frames}
              maxVisibleFrames={10}
              animationConfig={animationConfig}
              onAnimationConfigChange={setAnimationConfig}
              showAnimationSettings={true}
              title="Recursive Function Call Stack"
            />
          </div>
        </div>

        {/* Features Info */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Animation Features Demonstrated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Entry/Exit Animations</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Smooth frame appearance</li>
                <li>• Staggered batch animations</li>
                <li>• Depth-based delays</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Performance Optimization</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Adaptive frame rates</li>
                <li>• Animation queuing</li>
                <li>• Large stack handling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Configurable Settings</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Speed control</li>
                <li>• Easing functions</li>
                <li>• Reduced motion support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};