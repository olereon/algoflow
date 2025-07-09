/**
 * React hooks for animation integration with the centralized controller
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { animationController, EasingFunctions } from '../utils/AnimationController';
import {
  AnimationHookOptions,
  TweenOptions,
  SpringOptions,
  KeyframeAnimation,
  AnimationSequence,
  PlaybackState,
  PerformanceMetrics,
  SpringConfigs
} from '../types/animation';

/**
 * Basic animation hook for simple animations
 */
export function useAnimation(
  duration: number = 1000,
  options: AnimationHookOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const animationIdRef = useRef<string | null>(null);
  const iterationRef = useRef(0);

  const start = useCallback((fromProgress = 0) => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
    }

    setProgress(fromProgress);
    setIsRunning(true);
    setIsComplete(false);
    options.onStart?.();

    animationIdRef.current = animationController.addAnimation({
      duration,
      callback: (p) => setProgress(p),
      onComplete: () => {
        setIsRunning(false);
        setIsComplete(true);
        iterationRef.current++;
        
        if (options.loop) {
          const shouldContinue = typeof options.loop === 'number' 
            ? iterationRef.current < options.loop 
            : true;
            
          if (shouldContinue) {
            options.onLoop?.(iterationRef.current);
            start(0);
          } else {
            options.onComplete?.();
          }
        } else {
          options.onComplete?.();
        }
      }
    });
  }, [duration, options]);

  const pause = useCallback(() => {
    if (animationIdRef.current) {
      animationController.pauseAnimation(animationIdRef.current);
      setIsRunning(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (animationIdRef.current) {
      animationController.resumeAnimation(animationIdRef.current);
      setIsRunning(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
      animationIdRef.current = null;
    }
    setProgress(0);
    setIsRunning(false);
    setIsComplete(false);
    iterationRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    stop();
    setProgress(0);
  }, [stop]);

  useEffect(() => {
    if (options.autoStart) {
      start();
    }
    
    return () => {
      if (animationIdRef.current) {
        animationController.removeAnimation(animationIdRef.current);
      }
    };
  }, [options.autoStart, start]);

  return {
    progress,
    isRunning,
    isComplete,
    start,
    pause,
    resume,
    stop,
    reset
  };
}

/**
 * Tween hook for animating between numeric values
 */
export function useTween(options: TweenOptions) {
  const [values, setValues] = useState(options.from);
  const [isRunning, setIsRunning] = useState(false);
  const animationIdRef = useRef<string | null>(null);

  const start = useCallback(() => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
    }

    setIsRunning(true);
    setValues(options.from);

    animationIdRef.current = animationController.addAnimation({
      duration: options.duration,
      easing: options.easing || EasingFunctions.easeOutQuad,
      callback: (progress) => {
        const newValues: Record<string, number> = {};
        Object.keys(options.from).forEach(key => {
          const from = options.from[key];
          const to = options.to[key];
          newValues[key] = from + (to - from) * progress;
        });
        setValues(newValues);
        options.onUpdate(newValues);
      },
      onComplete: () => {
        setIsRunning(false);
        options.onComplete?.();
      }
    });
  }, [options]);

  const stop = useCallback(() => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        animationController.removeAnimation(animationIdRef.current);
      }
    };
  }, []);

  return { values, isRunning, start, stop };
}

/**
 * Spring animation hook for physics-based animations
 */
export function useSpring(options: SpringOptions) {
  const [value, setValue] = useState(options.from);
  const [velocity, setVelocity] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const animationIdRef = useRef<string | null>(null);

  const start = useCallback(() => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
    }

    setIsRunning(true);
    setValue(options.from);
    setVelocity(0);

    let currentValue = options.from;
    let currentVelocity = 0;
    const { tension, friction, mass } = options.config;

    animationIdRef.current = animationController.addAnimation({
      duration: 2000, // Max duration for spring
      callback: (progress) => {
        const deltaTime = 16.67; // ~60fps
        const force = tension * (options.to - currentValue);
        const dampingForce = friction * currentVelocity;
        const acceleration = (force - dampingForce) / mass;
        
        currentVelocity += acceleration * (deltaTime / 1000);
        currentValue += currentVelocity * (deltaTime / 1000);
        
        setValue(currentValue);
        setVelocity(currentVelocity);
        options.onUpdate(currentValue, currentVelocity);

        // Check if spring has settled
        const threshold = 0.01;
        if (Math.abs(currentValue - options.to) < threshold && Math.abs(currentVelocity) < threshold) {
          setValue(options.to);
          setVelocity(0);
          options.onUpdate(options.to, 0);
          return 1; // Force completion
        }

        return progress;
      },
      onComplete: () => {
        setIsRunning(false);
        options.onComplete?.();
      }
    });
  }, [options]);

  const stop = useCallback(() => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  return { value, velocity, isRunning, start, stop };
}

/**
 * Keyframe animation hook for complex animations
 */
export function useKeyframes(animation: KeyframeAnimation) {
  const [currentValues, setCurrentValues] = useState<Record<string, any>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const animationIdRef = useRef<string | null>(null);

  const start = useCallback(() => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
    }

    setIsRunning(true);
    setIteration(0);

    const runAnimation = (currentIteration: number) => {
      animationIdRef.current = animationController.addAnimation({
        duration: animation.duration,
        callback: (progress) => {
          // Find current keyframe segment
          let fromKeyframe = animation.keyframes[0];
          let toKeyframe = animation.keyframes[1];
          let segmentProgress = progress;

          for (let i = 0; i < animation.keyframes.length - 1; i++) {
            const current = animation.keyframes[i];
            const next = animation.keyframes[i + 1];
            
            if (progress >= current.time && progress <= next.time) {
              fromKeyframe = current;
              toKeyframe = next;
              segmentProgress = (progress - current.time) / (next.time - current.time);
              break;
            }
          }

          // Apply easing to segment
          const easing = toKeyframe.easing || EasingFunctions.linear;
          const easedProgress = easing(segmentProgress);

          // Interpolate values
          const values: Record<string, any> = {};
          Object.keys(fromKeyframe.values).forEach(key => {
            const from = fromKeyframe.values[key];
            const to = toKeyframe.values[key];
            
            if (typeof from === 'number' && typeof to === 'number') {
              values[key] = from + (to - from) * easedProgress;
            } else {
              values[key] = easedProgress < 0.5 ? from : to;
            }
          });

          setCurrentValues(values);
        },
        onComplete: () => {
          const nextIteration = currentIteration + 1;
          setIteration(nextIteration);

          if (animation.repeat === 'infinite' || 
              (typeof animation.repeat === 'number' && nextIteration < animation.repeat)) {
            
            if (animation.direction === 'alternate') {
              // For alternate direction, we would reverse keyframes
              runAnimation(nextIteration);
            } else {
              runAnimation(nextIteration);
            }
          } else {
            setIsRunning(false);
          }
        }
      });
    };

    runAnimation(0);
  }, [animation]);

  const stop = useCallback(() => {
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
      animationIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  return { values: currentValues, isRunning, iteration, start, stop };
}

/**
 * Animation sequence hook for chaining animations
 */
export function useAnimationSequence(sequence: AnimationSequence) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [iteration, setIteration] = useState(0);
  const activeAnimationsRef = useRef<string[]>([]);

  const start = useCallback(() => {
    setIsRunning(true);
    setCurrentStep(0);
    setIteration(0);

    const runSequence = (currentIteration: number) => {
      const runStep = (stepIndex: number) => {
        if (stepIndex >= sequence.steps.length) {
          // Sequence complete
          const nextIteration = currentIteration + 1;
          setIteration(nextIteration);

          if (sequence.loop === true || 
              (typeof sequence.loop === 'number' && nextIteration < sequence.loop)) {
            runSequence(nextIteration);
          } else {
            setIsRunning(false);
            sequence.onComplete?.();
          }
          return;
        }

        const step = sequence.steps[stepIndex];
        setCurrentStep(stepIndex);

        if (step.delay) {
          setTimeout(() => runStep(stepIndex), step.delay);
          return;
        }

        if (step.mode === 'parallel') {
          // Run all animations in parallel
          let completedCount = 0;
          const totalAnimations = step.animations.length;

          step.animations.forEach(animOptions => {
            const id = animationController.addAnimation({
              ...animOptions,
              onComplete: () => {
                completedCount++;
                animOptions.onComplete?.(id);
                if (completedCount === totalAnimations) {
                  runStep(stepIndex + 1);
                }
              }
            });
            activeAnimationsRef.current.push(id);
          });
        } else {
          // Run animations sequentially
          let animationIndex = 0;

          const runNextAnimation = () => {
            if (animationIndex >= step.animations.length) {
              runStep(stepIndex + 1);
              return;
            }

            const animOptions = step.animations[animationIndex];
            const id = animationController.addAnimation({
              ...animOptions,
              onComplete: () => {
                animOptions.onComplete?.(id);
                animationIndex++;
                runNextAnimation();
              }
            });
            activeAnimationsRef.current.push(id);
          };

          runNextAnimation();
        }
      };

      runStep(0);
    };

    runSequence(0);
  }, [sequence]);

  const stop = useCallback(() => {
    activeAnimationsRef.current.forEach(id => {
      animationController.removeAnimation(id);
    });
    activeAnimationsRef.current = [];
    setIsRunning(false);
  }, []);

  return { isRunning, currentStep, iteration, start, stop };
}

/**
 * Global animation controller hook
 */
export function useAnimationController() {
  const [playbackState, setPlaybackState] = useState<PlaybackState>('stopped');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    activeAnimations: 0,
    droppedFrames: 0
  });

  useEffect(() => {
    animationController.setEventListeners({
      onPlaybackStateChange: setPlaybackState,
      onFPSUpdate: (fps) => {
        setMetrics(prev => ({ ...prev, fps }));
      }
    });

    const updateMetrics = () => {
      const controllerMetrics = animationController.getMetrics();
      setMetrics(prev => ({
        ...prev,
        activeAnimations: controllerMetrics.activeAnimations,
        frameTime: 1000 / controllerMetrics.fps
      }));
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  const play = useCallback(() => animationController.play(), []);
  const pause = useCallback(() => animationController.pause(), []);
  const stop = useCallback(() => animationController.stop(), []);
  
  const setPlaybackSpeed = useCallback((speed: number) => {
    animationController.setPlaybackSpeed(speed);
  }, []);

  return {
    playbackState,
    metrics,
    playbackSpeed: animationController.getPlaybackSpeed(),
    play,
    pause,
    stop,
    setPlaybackSpeed
  };
}

/**
 * Preset animation hook for common animations
 */
export function usePresetAnimation(
  _presetName: string,
  options: AnimationHookOptions = {}
) {
  // Simplified preset animation - would need proper preset lookup
  return useAnimation(400, {
    ...options
  });
}

/**
 * Spring preset hook
 */
export function useSpringPreset(
  configName: keyof typeof SpringConfigs,
  from: number,
  to: number,
  onUpdate: (value: number, velocity: number) => void
) {
  const config = SpringConfigs[configName];
  
  return useSpring({
    from,
    to,
    config,
    onUpdate
  });
}