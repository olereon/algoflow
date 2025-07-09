import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StackFrame,
  FrameAnimation,
  AnimationQueue,
  UseStackAnimationOptions,
  FrameAnimationState,
  AnimationSpeed
} from '../types';
import {
  generateAnimationId,
  getAnimationDuration,
  prefersReducedMotion,
  optimizeForStackSize,
  getOptimalFrameRate,
  injectStackFrameCSS,
  calculateStaggerDelay,
  DEFAULT_ANIMATION_CONFIG
} from '../utils/animation';

/**
 * Main hook for managing stack frame animations
 */
export function useStackAnimations(
  frames: StackFrame[],
  options: Partial<UseStackAnimationOptions> = {}
) {
  const {
    config = DEFAULT_ANIMATION_CONFIG,
    onAnimationStart,
    onAnimationEnd,
    onQueueEmpty
  } = options;

  // Optimize config based on stack size
  const optimizedConfig = useMemo(() => {
    const baseConfig = {
      ...config,
      reducedMotion: prefersReducedMotion()
    };
    return optimizeForStackSize(frames.length, baseConfig);
  }, [config, frames.length]);

  // Animation queue state
  const [queue, setQueue] = useState<AnimationQueue>({
    animations: [],
    running: new Map(),
    completed: [],
    maxConcurrent: optimizedConfig.maxConcurrentAnimations || 8,
    paused: false
  });

  // Frame animation states
  const [frameStates, setFrameStates] = useState<Map<string, FrameAnimationState>>(new Map());
  
  // Animation loop refs
  const animationFrameRef = useRef<number>();
  const lastUpdateTime = useRef<number>(0);

  // Inject CSS styles on mount
  useEffect(() => {
    if (optimizedConfig.enableAnimations && !optimizedConfig.reducedMotion) {
      injectStackFrameCSS({
        ...DEFAULT_ANIMATION_CONFIG,
        ...optimizedConfig
      });
    }
  }, [optimizedConfig]);

  /**
   * Creates a new animation
   */
  const createAnimation = useCallback((
    frameId: string,
    type: FrameAnimation['type'],
    fromState?: Partial<StackFrame>,
    toState?: Partial<StackFrame>,
    customDuration?: number
  ): FrameAnimation => {
    const duration = customDuration ?? getAnimationDuration(
      optimizedConfig.speed || 'normal',
      1,
      type === 'enter' || type === 'exit' ? 1.2 : 1
    );

    return {
      id: generateAnimationId(),
      frameId,
      type,
      startTime: 0,
      duration,
      easing: optimizedConfig.easing || 'ease-out',
      fromState: fromState || {},
      toState: toState || {},
      progress: 0,
      status: 'pending'
    };
  }, [optimizedConfig]);

  /**
   * Adds animation to queue
   */
  const enqueueAnimation = useCallback((animation: FrameAnimation) => {
    if (!optimizedConfig.enableAnimations || optimizedConfig.reducedMotion) {
      // Skip animation, immediately set final state
      setFrameStates(prev => {
        const next = new Map(prev);
        next.set(animation.frameId, 'idle');
        return next;
      });
      return;
    }

    setQueue(prev => ({
      ...prev,
      animations: [...prev.animations, animation]
    }));
  }, [optimizedConfig]);

  /**
   * Processes animation queue
   */
  const processQueue = useCallback(() => {
    const now = performance.now();
    
    setQueue(prev => {
      const newQueue = { ...prev };
      const running = new Map(prev.running);
      const completed = [...prev.completed];
      const animations = [...prev.animations];
      const remainingAnimations = [...animations];

      // Start new animations if possible
      while (
        remainingAnimations.length > 0 && 
        running.size < newQueue.maxConcurrent &&
        !newQueue.paused
      ) {
        const animation = remainingAnimations.shift()!;
        animation.startTime = now;
        animation.status = 'running';
        running.set(animation.id, animation);

        // Update frame state
        setFrameStates(prev => {
          const next = new Map(prev);
          next.set(animation.frameId, getAnimationStateFromType(animation.type));
          return next;
        });

        onAnimationStart?.(animation);
      }

      // Update running animations
      const toComplete: string[] = [];
      running.forEach((animation, id) => {
        const elapsed = now - animation.startTime;
        const progress = animation.duration > 0 ? Math.min(elapsed / animation.duration, 1) : 1;
        
        animation.progress = progress;

        if (progress >= 1) {
          animation.status = 'completed';
          completed.push(animation);
          toComplete.push(id);
          
          // Update frame state to final state
          setFrameStates(prev => {
            const next = new Map(prev);
            next.set(animation.frameId, 'idle');
            return next;
          });

          onAnimationEnd?.(animation);
        }
      });

      // Remove completed animations
      toComplete.forEach(id => running.delete(id));

      // Check if queue is empty
      if (remainingAnimations.length === 0 && running.size === 0 && toComplete.length > 0) {
        onQueueEmpty?.();
      }

      return {
        ...newQueue,
        animations: remainingAnimations,
        running,
        completed
      };
    });
  }, [onAnimationStart, onAnimationEnd, onQueueEmpty]);

  /**
   * Animation loop
   */
  const animationLoop = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastUpdateTime.current;
    const targetFrameTime = 1000 / getOptimalFrameRate(queue.running.size);

    if (deltaTime >= targetFrameTime) {
      processQueue();
      lastUpdateTime.current = now;
    }

    if (queue.running.size > 0 || queue.animations.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [processQueue, queue.running.size, queue.animations.length]);

  // Start/stop animation loop
  useEffect(() => {
    if (queue.running.size > 0 || queue.animations.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationLoop, queue.running.size, queue.animations.length]);

  /**
   * Animation control functions
   */
  const animateFrameEntry = useCallback((frame: StackFrame, delay: number = 0) => {
    const animation = createAnimation(frame.id, 'enter');
    if (delay > 0) {
      setTimeout(() => enqueueAnimation(animation), delay);
    } else {
      enqueueAnimation(animation);
    }
  }, [createAnimation, enqueueAnimation]);

  const animateFrameExit = useCallback((frameId: string, delay: number = 0) => {
    const animation = createAnimation(frameId, 'exit');
    if (delay > 0) {
      setTimeout(() => enqueueAnimation(animation), delay);
    } else {
      enqueueAnimation(animation);
    }
  }, [createAnimation, enqueueAnimation]);

  const animateFrameUpdate = useCallback((frame: StackFrame) => {
    const animation = createAnimation(frame.id, 'update');
    enqueueAnimation(animation);
  }, [createAnimation, enqueueAnimation]);

  const animateFrameActivation = useCallback((frameId: string, isActive: boolean) => {
    const animation = createAnimation(frameId, isActive ? 'activate' : 'deactivate');
    enqueueAnimation(animation);
  }, [createAnimation, enqueueAnimation]);

  /**
   * Batch operations with staggered animations
   */
  const animateBatchEntry = useCallback((newFrames: StackFrame[]) => {
    newFrames.forEach((frame, index) => {
      const delay = calculateStaggerDelay(index, newFrames.length, 200);
      animateFrameEntry(frame, delay);
    });
  }, [animateFrameEntry]);

  const animateBatchExit = useCallback((frameIds: string[]) => {
    frameIds.forEach((frameId, index) => {
      const delay = calculateStaggerDelay(index, frameIds.length, 150, 'reverse');
      animateFrameExit(frameId, delay);
    });
  }, [animateFrameExit]);

  /**
   * Queue control functions
   */
  const pauseAnimations = useCallback(() => {
    setQueue(prev => ({ ...prev, paused: true }));
  }, []);

  const resumeAnimations = useCallback(() => {
    setQueue(prev => ({ ...prev, paused: false }));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue(prev => ({
      ...prev,
      animations: [],
      running: new Map(),
      completed: []
    }));
    setFrameStates(new Map());
  }, []);

  /**
   * Performance monitoring
   */
  const getPerformanceMetrics = useCallback(() => ({
    queueLength: queue.animations.length,
    runningCount: queue.running.size,
    completedCount: queue.completed.length,
    frameRate: getOptimalFrameRate(queue.running.size),
    maxConcurrent: queue.maxConcurrent
  }), [queue]);

  return {
    // Animation functions
    animateFrameEntry,
    animateFrameExit,
    animateFrameUpdate,
    animateFrameActivation,
    animateBatchEntry,
    animateBatchExit,
    
    // Queue control
    pauseAnimations,
    resumeAnimations,
    clearQueue,
    
    // State
    frameStates,
    queue,
    config: optimizedConfig,
    
    // Metrics
    getPerformanceMetrics
  };
}

/**
 * Hook for individual frame animations
 */
export function useFrameAnimation(
  _frameId: string,
  animationState: FrameAnimationState = 'idle',
  speed: AnimationSpeed = 'normal'
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentState, setCurrentState] = useState<FrameAnimationState>(animationState);
  
  useEffect(() => {
    setCurrentState(animationState);
    setIsAnimating(animationState !== 'idle');
    
    if (animationState !== 'idle') {
      const duration = getAnimationDuration(speed);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setCurrentState('idle');
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [animationState, speed]);

  return {
    isAnimating,
    currentState,
    animationClasses: getAnimationClasses(currentState)
  };
}

/**
 * Utility functions
 */
function getAnimationStateFromType(type: FrameAnimation['type']): FrameAnimationState {
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