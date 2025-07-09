import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { StackFrame, FrameAnimationState, AnimationSpeed } from '../types';
import { animationController, EasingFunctions } from '../utils/AnimationController';
import { prefersReducedMotion } from '../utils/animation';

export interface UseStackAnimationsV2Options {
  enableAnimations?: boolean;
  speed?: AnimationSpeed;
  staggerDelay?: number;
  maxConcurrent?: number;
  onAnimationStart?: (frameId: string, type: string) => void;
  onAnimationEnd?: (frameId: string, type: string) => void;
  onQueueEmpty?: () => void;
}

/**
 * Updated stack animations hook using the centralized controller
 */
export function useStackAnimationsV2(
  _frames: StackFrame[],
  options: UseStackAnimationsV2Options = {}
) {
  const {
    enableAnimations = true,
    speed = 'normal',
    staggerDelay = 100,
    maxConcurrent = 8,
    onAnimationStart,
    onAnimationEnd,
    onQueueEmpty
  } = options;

  // Frame animation states
  const [frameStates, setFrameStates] = useState<Map<string, FrameAnimationState>>(new Map());
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  
  // Track animation IDs for cleanup
  const animationIds = useRef<Map<string, string>>(new Map());
  const reducedMotion = useMemo(() => prefersReducedMotion(), []);

  // Speed mappings
  const speedToDuration = useMemo(() => ({
    slow: 800,
    normal: 400,
    fast: 200,
    instant: 50
  }), []);

  const baseDuration = speedToDuration[speed];

  /**
   * Creates frame animation with centralized controller
   */
  const createFrameAnimation = useCallback((
    frameId: string,
    type: 'enter' | 'exit' | 'update' | 'activate' | 'deactivate',
    delay: number = 0
  ) => {
    if (!enableAnimations || reducedMotion) {
      // Immediate state change for reduced motion
      setFrameStates(prev => {
        const next = new Map(prev);
        next.set(frameId, 'idle');
        return next;
      });
      return;
    }

    // Remove any existing animation for this frame
    const existingAnimationId = animationIds.current.get(frameId);
    if (existingAnimationId) {
      animationController.removeAnimation(existingAnimationId);
    }

    // Set initial animation state
    setFrameStates(prev => {
      const next = new Map(prev);
      next.set(frameId, getAnimationStateFromType(type));
      return next;
    });

    setActiveAnimations(prev => new Set(prev).add(frameId));

    // Calculate animation properties
    const duration = type === 'update' ? baseDuration * 0.6 : baseDuration;
    const easing = type === 'enter' ? EasingFunctions.easeOutBack :
                   type === 'exit' ? EasingFunctions.easeInBack :
                   type === 'activate' ? EasingFunctions.easeOutElastic :
                   EasingFunctions.easeOutQuad;

    // Add animation to controller
    const animationId = animationController.addAnimation({
      duration,
      delay,
      easing,
      callback: () => {
        // Update animation progress if needed
        // The visual updates are handled by CSS classes
      },
      onComplete: () => {
        // Reset to idle state
        setFrameStates(prev => {
          const next = new Map(prev);
          next.set(frameId, 'idle');
          return next;
        });

        setActiveAnimations(prev => {
          const next = new Set(prev);
          next.delete(frameId);
          return next;
        });

        animationIds.current.delete(frameId);
        onAnimationEnd?.(frameId, type);

        // Check if all animations complete
        if (activeAnimations.size === 1) { // Will be 0 after this completes
          onQueueEmpty?.();
        }
      },
      data: { frameId, type }
    });

    animationIds.current.set(frameId, animationId);
    onAnimationStart?.(frameId, type);

    return animationId;
  }, [enableAnimations, reducedMotion, baseDuration, onAnimationStart, onAnimationEnd, onQueueEmpty, activeAnimations.size]);

  /**
   * Individual animation functions
   */
  const animateFrameEntry = useCallback((frame: StackFrame, delay: number = 0) => {
    return createFrameAnimation(frame.id, 'enter', delay);
  }, [createFrameAnimation]);

  const animateFrameExit = useCallback((frameId: string, delay: number = 0) => {
    return createFrameAnimation(frameId, 'exit', delay);
  }, [createFrameAnimation]);

  const animateFrameUpdate = useCallback((frame: StackFrame, delay: number = 0) => {
    return createFrameAnimation(frame.id, 'update', delay);
  }, [createFrameAnimation]);

  const animateFrameActivation = useCallback((frameId: string, isActive: boolean, delay: number = 0) => {
    return createFrameAnimation(frameId, isActive ? 'activate' : 'deactivate', delay);
  }, [createFrameAnimation]);

  /**
   * Batch animations with staggering
   */
  const animateBatchEntry = useCallback((newFrames: StackFrame[]) => {
    if (newFrames.length <= maxConcurrent) {
      // Animate all with stagger
      newFrames.forEach((frame, index) => {
        const delay = index * staggerDelay;
        animateFrameEntry(frame, delay);
      });
    } else {
      // Batch in groups to respect maxConcurrent
      const batchSize = Math.ceil(newFrames.length / maxConcurrent);
      newFrames.forEach((frame, index) => {
        const batchIndex = Math.floor(index / batchSize);
        const delay = batchIndex * staggerDelay;
        animateFrameEntry(frame, delay);
      });
    }
  }, [animateFrameEntry, maxConcurrent, staggerDelay]);

  const animateBatchExit = useCallback((frameIds: string[]) => {
    if (frameIds.length <= maxConcurrent) {
      // Animate all with stagger (reverse order for exit)
      frameIds.reverse().forEach((frameId, index) => {
        const delay = index * (staggerDelay * 0.7); // Faster exit
        animateFrameExit(frameId, delay);
      });
    } else {
      // Batch in groups
      const batchSize = Math.ceil(frameIds.length / maxConcurrent);
      frameIds.reverse().forEach((frameId, index) => {
        const batchIndex = Math.floor(index / batchSize);
        const delay = batchIndex * (staggerDelay * 0.7);
        animateFrameExit(frameId, delay);
      });
    }
  }, [animateFrameExit, maxConcurrent, staggerDelay]);

  /**
   * Animation control functions
   */
  const pauseAnimations = useCallback(() => {
    animationController.pause();
  }, []);

  const resumeAnimations = useCallback(() => {
    animationController.play();
  }, []);

  const clearAllAnimations = useCallback(() => {
    // Remove all frame animations
    animationIds.current.forEach((animationId) => {
      animationController.removeAnimation(animationId);
    });
    animationIds.current.clear();
    
    // Reset states
    setFrameStates(new Map());
    setActiveAnimations(new Set());
  }, []);

  /**
   * Performance metrics
   */
  const getPerformanceMetrics = useCallback(() => {
    const controllerMetrics = animationController.getMetrics();
    return {
      ...controllerMetrics,
      frameAnimations: activeAnimations.size,
      queueLength: controllerMetrics.queuedAnimations
    };
  }, [activeAnimations.size]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllAnimations();
    };
  }, [clearAllAnimations]);

  return {
    // Animation functions
    animateFrameEntry,
    animateFrameExit,
    animateFrameUpdate,
    animateFrameActivation,
    animateBatchEntry,
    animateBatchExit,
    
    // Control functions
    pauseAnimations,
    resumeAnimations,
    clearQueue: clearAllAnimations,
    
    // State
    frameStates,
    activeAnimations: activeAnimations.size,
    
    // Metrics
    getPerformanceMetrics
  };
}

/**
 * Enhanced frame animation hook using centralized controller
 */
export function useFrameAnimationV2(
  frameId: string,
  animationType: 'enter' | 'exit' | 'update' | 'activate' | 'deactivate' | null,
  options: {
    duration?: number;
    easing?: keyof typeof EasingFunctions;
    onComplete?: () => void;
  } = {}
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentState, setCurrentState] = useState<FrameAnimationState>('idle');
  const animationIdRef = useRef<string | null>(null);

  const {
    duration = 400,
    easing = 'easeOutQuad',
    onComplete
  } = options;

  useEffect(() => {
    if (!animationType) {
      setIsAnimating(false);
      setCurrentState('idle');
      return;
    }

    // Remove existing animation
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
    }

    // Set initial state
    setIsAnimating(true);
    setCurrentState(getAnimationStateFromType(animationType));

    // Create new animation
    animationIdRef.current = animationController.addAnimation({
      duration,
      easing: EasingFunctions[easing],
      callback: () => {
        // Progress updates handled by CSS
      },
      onComplete: () => {
        setIsAnimating(false);
        setCurrentState('idle');
        animationIdRef.current = null;
        onComplete?.();
      },
      data: { frameId, type: animationType }
    });

    return () => {
      if (animationIdRef.current) {
        animationController.removeAnimation(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [frameId, animationType, duration, easing, onComplete]);

  return {
    isAnimating,
    currentState,
    animationClasses: getAnimationClasses(currentState)
  };
}

/**
 * Hook for smooth value transitions using centralized controller
 */
export function useValueTransition(
  targetValue: number,
  options: {
    duration?: number;
    easing?: keyof typeof EasingFunctions;
    onUpdate?: (value: number) => void;
  } = {}
) {
  const [currentValue, setCurrentValue] = useState(targetValue);
  const animationIdRef = useRef<string | null>(null);

  const {
    duration = 300,
    easing = 'easeOutQuad',
    onUpdate
  } = options;

  useEffect(() => {
    const startValue = currentValue;
    const endValue = targetValue;
    
    if (Math.abs(endValue - startValue) < 0.001) {
      return; // No significant change
    }

    // Remove existing animation
    if (animationIdRef.current) {
      animationController.removeAnimation(animationIdRef.current);
    }

    // Create transition animation
    animationIdRef.current = animationController.addAnimation({
      duration,
      easing: EasingFunctions[easing],
      callback: (progress) => {
        const value = startValue + (endValue - startValue) * progress;
        setCurrentValue(value);
        onUpdate?.(value);
      },
      onComplete: () => {
        setCurrentValue(endValue);
        onUpdate?.(endValue);
        animationIdRef.current = null;
      }
    });

    return () => {
      if (animationIdRef.current) {
        animationController.removeAnimation(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, [targetValue, duration, easing, onUpdate, currentValue]);

  return currentValue;
}

// Utility functions
function getAnimationStateFromType(type: string): FrameAnimationState {
  switch (type) {
    case 'enter': return 'entering';
    case 'exit': return 'exiting';
    case 'update': return 'updating';
    case 'activate':
    case 'deactivate': return 'updating';
    default: return 'idle';
  }
}

function getAnimationClasses(state: FrameAnimationState): string[] {
  switch (state) {
    case 'entering':
      return ['stack-frame-enter', 'stack-frame-enter-active'];
    case 'exiting':
      return ['stack-frame-exit', 'stack-frame-exit-active'];
    case 'updating':
      return ['stack-frame-update', 'stack-frame-update-active'];
    default:
      return [];
  }
}