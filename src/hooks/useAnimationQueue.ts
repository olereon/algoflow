import { useState, useCallback, useRef, useEffect } from 'react';
import {
  FrameAnimation,
  AnimationQueue,
  AnimationConfig,
  StackFrame
} from '../types';
import {
  generateAnimationId,
  getAnimationDuration,
  batchSimilarAnimations
} from '../utils/animation';

interface AnimationQueueManager {
  enqueue: (animation: FrameAnimation) => void;
  enqueueBatch: (animations: FrameAnimation[]) => void;
  dequeue: () => FrameAnimation | undefined;
  clear: () => void;
  pause: () => void;
  resume: () => void;
  skip: (animationId: string) => void;
  prioritize: (animationId: string) => void;
  getQueue: () => AnimationQueue;
  getMetrics: () => QueueMetrics;
}

interface QueueMetrics {
  totalQueued: number;
  currentlyRunning: number;
  averageWaitTime: number;
  throughput: number; // animations per second
  efficiency: number; // percentage of time spent running vs waiting
}

interface QueueOptions {
  maxConcurrent: number;
  batchSimilar: boolean;
  priorityLevels: boolean;
  throttleRapidOperations: boolean;
  maxQueueSize: number;
}

/**
 * Advanced animation queue manager with performance optimization
 */
export function useAnimationQueue(
  config: AnimationConfig,
  options: Partial<QueueOptions> = {}
): AnimationQueueManager {
  const {
    maxConcurrent = config.maxConcurrentAnimations,
    batchSimilar = true,
    priorityLevels = true,
    throttleRapidOperations = true,
    maxQueueSize = 100
  } = options;

  const [queue, setQueue] = useState<AnimationQueue>({
    animations: [],
    running: new Map(),
    completed: [],
    maxConcurrent,
    paused: false
  });

  // Performance tracking
  const metricsRef = useRef({
    startTimes: new Map<string, number>(),
    completionTimes: new Map<string, number>(),
    totalProcessed: 0,
    sessionStartTime: Date.now()
  });

  // Rapid operation detection
  const rapidOperationRef = useRef({
    recentOperations: [] as number[],
    threshold: 10, // operations per second
    windowSize: 1000 // 1 second window
  });

  /**
   * Detects if operations are happening too rapidly
   */
  const isRapidOperation = useCallback((): boolean => {
    if (!throttleRapidOperations) return false;

    const now = Date.now();
    const { recentOperations, threshold, windowSize } = rapidOperationRef.current;

    // Remove old operations outside the window
    const cutoff = now - windowSize;
    rapidOperationRef.current.recentOperations = recentOperations.filter(time => time > cutoff);

    // Add current operation
    rapidOperationRef.current.recentOperations.push(now);

    // Check if we exceed threshold
    return rapidOperationRef.current.recentOperations.length > threshold;
  }, [throttleRapidOperations]);

  /**
   * Calculates priority score for animation
   */
  const calculatePriority = useCallback((animation: FrameAnimation): number => {
    if (!priorityLevels) return 0;

    let priority = 0;

    // Type-based priority
    switch (animation.type) {
      case 'exit': priority += 10; break; // Exit animations first
      case 'enter': priority += 8; break;
      case 'activate': priority += 6; break;
      case 'deactivate': priority += 4; break;
      case 'update': priority += 2; break;
    }

    // Age-based priority (older animations get higher priority)
    const age = Date.now() - (animation.startTime || Date.now());
    priority += Math.min(age / 1000, 10); // Max 10 points for age

    return priority;
  }, [priorityLevels]);

  /**
   * Sorts animations by priority
   */
  const sortByPriority = useCallback((animations: FrameAnimation[]): FrameAnimation[] => {
    return [...animations].sort((a, b) => calculatePriority(b) - calculatePriority(a));
  }, [calculatePriority]);

  /**
   * Optimizes animation batch for performance
   */
  const optimizeBatch = useCallback((animations: FrameAnimation[]): FrameAnimation[] => {
    let optimized = [...animations];

    // Batch similar animations if enabled
    if (batchSimilar && animations.length > 3) {
      const batches = batchSimilarAnimations(animations);
      optimized = batches.flat();
    }

    // Apply priority sorting
    if (priorityLevels) {
      optimized = sortByPriority(optimized);
    }

    // Limit queue size
    if (optimized.length > maxQueueSize) {
      console.warn(`Animation queue exceeded maximum size (${maxQueueSize}). Dropping ${optimized.length - maxQueueSize} animations.`);
      optimized = optimized.slice(0, maxQueueSize);
    }

    return optimized;
  }, [batchSimilar, priorityLevels, sortByPriority, maxQueueSize]);

  /**
   * Adds single animation to queue
   */
  const enqueue = useCallback((animation: FrameAnimation) => {
    // Check for rapid operations
    if (isRapidOperation()) {
      // Throttle by skipping some animations or batching them
      console.debug('Rapid operations detected, throttling animations');
      return;
    }

    setQueue(prev => {
      const newAnimations = optimizeBatch([...prev.animations, animation]);
      return {
        ...prev,
        animations: newAnimations
      };
    });

    // Track metrics
    metricsRef.current.startTimes.set(animation.id, Date.now());
  }, [isRapidOperation, optimizeBatch]);

  /**
   * Adds multiple animations to queue as a batch
   */
  const enqueueBatch = useCallback((animations: FrameAnimation[]) => {
    if (animations.length === 0) return;

    setQueue(prev => {
      const newAnimations = optimizeBatch([...prev.animations, ...animations]);
      return {
        ...prev,
        animations: newAnimations
      };
    });

    // Track metrics for all animations
    const now = Date.now();
    animations.forEach(animation => {
      metricsRef.current.startTimes.set(animation.id, now);
    });
  }, [optimizeBatch]);

  /**
   * Removes and returns next animation from queue
   */
  const dequeue = useCallback((): FrameAnimation | undefined => {
    let nextAnimation: FrameAnimation | undefined;

    setQueue(prev => {
      if (prev.animations.length === 0) return prev;

      const [first, ...rest] = prev.animations;
      nextAnimation = first;

      return {
        ...prev,
        animations: rest
      };
    });

    return nextAnimation;
  }, []);

  /**
   * Clears entire queue
   */
  const clear = useCallback(() => {
    setQueue(prev => ({
      ...prev,
      animations: [],
      running: new Map(),
      completed: []
    }));

    // Reset metrics
    metricsRef.current = {
      startTimes: new Map(),
      completionTimes: new Map(),
      totalProcessed: 0,
      sessionStartTime: Date.now()
    };
  }, []);

  /**
   * Pauses queue processing
   */
  const pause = useCallback(() => {
    setQueue(prev => ({ ...prev, paused: true }));
  }, []);

  /**
   * Resumes queue processing
   */
  const resume = useCallback(() => {
    setQueue(prev => ({ ...prev, paused: false }));
  }, []);

  /**
   * Skips specific animation
   */
  const skip = useCallback((animationId: string) => {
    setQueue(prev => {
      // Remove from queue
      const animations = prev.animations.filter(anim => anim.id !== animationId);
      
      // Remove from running
      const running = new Map(prev.running);
      running.delete(animationId);

      return {
        ...prev,
        animations,
        running
      };
    });
  }, []);

  /**
   * Moves animation to front of queue
   */
  const prioritize = useCallback((animationId: string) => {
    setQueue(prev => {
      const targetIndex = prev.animations.findIndex(anim => anim.id === animationId);
      if (targetIndex === -1) return prev;

      const animations = [...prev.animations];
      const [prioritizedAnimation] = animations.splice(targetIndex, 1);
      animations.unshift(prioritizedAnimation);

      return {
        ...prev,
        animations
      };
    });
  }, []);

  /**
   * Returns current queue state
   */
  const getQueue = useCallback((): AnimationQueue => queue, [queue]);

  /**
   * Calculates performance metrics
   */
  const getMetrics = useCallback((): QueueMetrics => {
    const { startTimes, completionTimes, totalProcessed, sessionStartTime } = metricsRef.current;
    const now = Date.now();
    const sessionDuration = (now - sessionStartTime) / 1000; // seconds

    // Calculate average wait time
    let totalWaitTime = 0;
    let waitTimeCount = 0;
    
    completionTimes.forEach((completionTime, animationId) => {
      const startTime = startTimes.get(animationId);
      if (startTime) {
        totalWaitTime += completionTime - startTime;
        waitTimeCount++;
      }
    });

    const averageWaitTime = waitTimeCount > 0 ? totalWaitTime / waitTimeCount : 0;

    // Calculate throughput
    const throughput = sessionDuration > 0 ? totalProcessed / sessionDuration : 0;

    // Calculate efficiency (simplified)
    const runningTime = queue.running.size > 0 ? 1 : 0;
    const efficiency = sessionDuration > 0 ? runningTime / sessionDuration : 0;

    return {
      totalQueued: queue.animations.length,
      currentlyRunning: queue.running.size,
      averageWaitTime,
      throughput,
      efficiency: Math.min(efficiency * 100, 100) // percentage
    };
  }, [queue]);

  // Track animation completions
  useEffect(() => {
    const completedIds = queue.completed.map(anim => anim.id);
    const now = Date.now();
    
    completedIds.forEach(id => {
      if (!metricsRef.current.completionTimes.has(id)) {
        metricsRef.current.completionTimes.set(id, now);
        metricsRef.current.totalProcessed++;
      }
    });
  }, [queue.completed]);

  return {
    enqueue,
    enqueueBatch,
    dequeue,
    clear,
    pause,
    resume,
    skip,
    prioritize,
    getQueue,
    getMetrics
  };
}

/**
 * Hook for creating optimized animation sequences
 */
export function useAnimationSequence() {
  const sequenceRef = useRef<FrameAnimation[]>([]);

  const addToSequence = useCallback((animation: FrameAnimation) => {
    sequenceRef.current.push(animation);
  }, []);

  const buildSequence = useCallback((
    frames: StackFrame[],
    type: FrameAnimation['type'],
    staggerDelay: number = 0
  ): FrameAnimation[] => {
    return frames.map((frame, index) => ({
      id: generateAnimationId(),
      frameId: frame.id,
      type,
      startTime: index * staggerDelay,
      duration: getAnimationDuration('normal'),
      easing: 'ease-out',
      fromState: {},
      toState: {},
      progress: 0,
      status: 'pending' as const
    }));
  }, []);

  const createStaggeredEntry = useCallback((frames: StackFrame[]): FrameAnimation[] => {
    return buildSequence(frames, 'enter', 100); // 100ms stagger
  }, [buildSequence]);

  const createStaggeredExit = useCallback((frames: StackFrame[]): FrameAnimation[] => {
    return buildSequence(frames.reverse(), 'exit', 50); // 50ms stagger, reverse order
  }, [buildSequence]);

  const getSequence = useCallback((): FrameAnimation[] => {
    return [...sequenceRef.current];
  }, []);

  const clearSequence = useCallback(() => {
    sequenceRef.current = [];
  }, []);

  return {
    addToSequence,
    buildSequence,
    createStaggeredEntry,
    createStaggeredExit,
    getSequence,
    clearSequence
  };
}