import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimationConfig, StackFrame } from '../types';

interface PerformanceMetrics {
  fps: number;
  frameDrops: number;
  averageFrameTime: number;
  memoryUsage: number;
  cpuUsage: number;
  animationLoad: number;
  recommendations: PerformanceRecommendation[];
}

interface PerformanceRecommendation {
  type: 'warning' | 'error' | 'info';
  message: string;
  action?: () => void;
  actionLabel?: string;
}

interface PerformanceOptions {
  enableMonitoring: boolean;
  sampleInterval: number;
  frameDropThreshold: number;
  memoryThreshold: number; // MB
  autoOptimize: boolean;
}

/**
 * Hook for monitoring and optimizing animation performance
 */
export function useAnimationPerformance(
  stackFrames: StackFrame[],
  animationConfig: AnimationConfig,
  options: Partial<PerformanceOptions> = {}
) {
  const {
    enableMonitoring = true,
    sampleInterval = 1000, // 1 second
    frameDropThreshold = 5,
    memoryThreshold = 100, // 100MB
    autoOptimize = true
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameDrops: 0,
    averageFrameTime: 16.67, // 60fps = 16.67ms per frame
    memoryUsage: 0,
    cpuUsage: 0,
    animationLoad: 0,
    recommendations: []
  });

  const [optimizedConfig, setOptimizedConfig] = useState<AnimationConfig>(animationConfig);

  // Performance monitoring refs
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());
  const frameDropsRef = useRef<number>(0);
  const monitoringIntervalRef = useRef<number>();
  const rafRef = useRef<number>();

  /**
   * Measures frame performance
   */
  const measureFrame = useCallback(() => {
    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;

    // Track frame times
    frameTimesRef.current.push(frameTime);
    if (frameTimesRef.current.length > 60) { // Keep last 60 frames
      frameTimesRef.current.shift();
    }

    // Detect frame drops (frames taking longer than 20ms = 50fps)
    if (frameTime > 20) {
      frameDropsRef.current++;
    }

    if (enableMonitoring) {
      rafRef.current = requestAnimationFrame(measureFrame);
    }
  }, [enableMonitoring]);

  /**
   * Gets memory usage (when available)
   */
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // Convert to MB
    }
    return 0;
  }, []);

  /**
   * Calculates animation load factor
   */
  const calculateAnimationLoad = useCallback((): number => {
    const stackSize = stackFrames.length;
    const baseLoad = Math.min(stackSize / 50, 1); // 50+ frames = 100% base load
    
    // Adjust for animation settings
    let multiplier = 1;
    switch (animationConfig.speed) {
      case 'slow': multiplier = 0.7; break;
      case 'fast': multiplier = 1.3; break;
      case 'instant': multiplier = 0; break;
    }

    if (!animationConfig.enableAnimations) multiplier = 0;
    if (animationConfig.reducedMotion) multiplier *= 0.5;

    return Math.min(baseLoad * multiplier, 1);
  }, [stackFrames.length, animationConfig]);

  /**
   * Optimizes animation config for better performance
   */
  const optimizeForPerformance = useCallback((level: 'conservative' | 'moderate' | 'aggressive') => {
    const baseConfig = { ...animationConfig };
    
    switch (level) {
      case 'conservative':
        setOptimizedConfig({
          ...baseConfig,
          maxConcurrentAnimations: Math.max(4, baseConfig.maxConcurrentAnimations - 2)
        });
        break;
        
      case 'moderate':
        setOptimizedConfig({
          ...baseConfig,
          speed: baseConfig.speed === 'slow' ? 'normal' : 'fast',
          maxConcurrentAnimations: Math.max(3, Math.floor(baseConfig.maxConcurrentAnimations * 0.7))
        });
        break;
        
      case 'aggressive':
        setOptimizedConfig({
          ...baseConfig,
          speed: 'fast',
          maxConcurrentAnimations: 3,
          easing: 'linear' // Faster to compute
        });
        break;
    }
  }, [animationConfig]);

  /**
   * Enables reduced motion mode
   */
  const enableReducedMotion = useCallback(() => {
    setOptimizedConfig({
      ...animationConfig,
      reducedMotion: true,
      speed: 'fast',
      maxConcurrentAnimations: 2
    });
  }, [animationConfig]);

  /**
   * Generates performance recommendations
   */
  const generateRecommendations = useCallback((
    fps: number,
    frameDrops: number,
    memoryUsage: number,
    animationLoad: number
  ): PerformanceRecommendation[] => {
    const recommendations: PerformanceRecommendation[] = [];

    // FPS recommendations
    if (fps < 45) {
      recommendations.push({
        type: 'error',
        message: `Low frame rate detected (${fps.toFixed(1)} FPS). Consider reducing animation complexity.`,
        action: () => optimizeForPerformance('aggressive'),
        actionLabel: 'Auto-optimize'
      });
    } else if (fps < 55) {
      recommendations.push({
        type: 'warning',
        message: `Frame rate could be improved (${fps.toFixed(1)} FPS).`,
        action: () => optimizeForPerformance('moderate'),
        actionLabel: 'Optimize'
      });
    }

    // Frame drops
    if (frameDrops > frameDropThreshold) {
      recommendations.push({
        type: 'warning',
        message: `${frameDrops} frame drops detected. Consider reducing concurrent animations.`
      });
    }

    // Memory usage
    if (memoryUsage > memoryThreshold) {
      recommendations.push({
        type: 'warning',
        message: `High memory usage detected (${memoryUsage} MB). Consider clearing animation history.`
      });
    }

    // Animation load
    if (animationLoad > 0.8) {
      recommendations.push({
        type: 'info',
        message: 'High animation load. Performance optimizations are active.',
        action: () => optimizeForPerformance('conservative'),
        actionLabel: 'Further optimize'
      });
    }

    // Stack size recommendations
    if (stackFrames.length > 100) {
      recommendations.push({
        type: 'warning',
        message: `Large stack size (${stackFrames.length} frames). Consider using reduced animations.`,
        action: () => enableReducedMotion(),
        actionLabel: 'Enable reduced motion'
      });
    }

    return recommendations;
  }, [frameDropThreshold, memoryThreshold, stackFrames.length, optimizeForPerformance, enableReducedMotion]);

  /**
   * Calculates performance metrics
   */
  const calculateMetrics = useCallback((): PerformanceMetrics => {
    const frameTimes = frameTimesRef.current;
    const frameDrops = frameDropsRef.current;

    // Calculate FPS and average frame time
    let fps = 60;
    let averageFrameTime = 16.67;
    
    if (frameTimes.length > 0) {
      averageFrameTime = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length;
      fps = Math.min(60, 1000 / averageFrameTime);
    }

    // Estimate memory usage (simplified)
    const memoryUsage = getMemoryUsage();

    // Calculate animation load based on stack size and active animations
    const animationLoad = calculateAnimationLoad();

    // Generate recommendations
    const recommendations = generateRecommendations(fps, frameDrops, memoryUsage, animationLoad);

    return {
      fps: Math.round(fps * 10) / 10,
      frameDrops,
      averageFrameTime: Math.round(averageFrameTime * 100) / 100,
      memoryUsage,
      cpuUsage: Math.max(0, (30 - fps) / 30 * 100), // Simplified CPU usage estimate
      animationLoad,
      recommendations
    };
  }, [getMemoryUsage, calculateAnimationLoad, generateRecommendations]);

  /**
   * Resets optimization to original config
   */
  const resetOptimization = useCallback(() => {
    setOptimizedConfig(animationConfig);
  }, [animationConfig]);

  /**
   * Force garbage collection (when available)
   */
  const forceGarbageCollection = useCallback(() => {
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }, []);

  // Start performance monitoring
  useEffect(() => {
    if (!enableMonitoring) return;

    // Start frame measurement
    rafRef.current = requestAnimationFrame(measureFrame);

    // Start periodic metrics calculation
    monitoringIntervalRef.current = setInterval(() => {
      const newMetrics = calculateMetrics();
      setMetrics(newMetrics);

      // Auto-optimize if enabled
      if (autoOptimize) {
        if (newMetrics.fps < 45 || newMetrics.frameDrops > frameDropThreshold * 2) {
          optimizeForPerformance('aggressive');
        } else if (newMetrics.fps < 55 || newMetrics.frameDrops > frameDropThreshold) {
          optimizeForPerformance('moderate');
        }
      }

      // Reset frame drops counter
      frameDropsRef.current = 0;
    }, sampleInterval);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [enableMonitoring, measureFrame, calculateMetrics, autoOptimize, sampleInterval, frameDropThreshold, optimizeForPerformance]);

  // Update config when animation config changes
  useEffect(() => {
    setOptimizedConfig(animationConfig);
  }, [animationConfig]);

  return {
    metrics,
    optimizedConfig,
    optimizeForPerformance,
    enableReducedMotion,
    resetOptimization,
    forceGarbageCollection,
    isOptimized: optimizedConfig !== animationConfig
  };
}

/**
 * Hook for adaptive performance based on device capabilities
 */
export function useAdaptivePerformance() {
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    cores: 1,
    memory: 1024, // MB
    isLowEnd: false,
    supportsHardwareAcceleration: true
  });

  useEffect(() => {
    // Detect device capabilities
    const detectCapabilities = () => {
      // CPU cores
      const cores = navigator.hardwareConcurrency || 1;
      
      // Memory (when available)
      let memory = 1024;
      if ('deviceMemory' in navigator) {
        memory = (navigator as any).deviceMemory * 1024; // GB to MB
      }

      // Simple performance test for low-end detection
      const start = performance.now();
      let iterations = 0;
      while (performance.now() - start < 10) { // 10ms test
        iterations++;
      }
      const isLowEnd = iterations < 100000; // Arbitrary threshold

      // Hardware acceleration support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      const supportsHardwareAcceleration = !!gl;

      setDeviceCapabilities({
        cores,
        memory,
        isLowEnd,
        supportsHardwareAcceleration
      });
    };

    detectCapabilities();
  }, []);

  const getRecommendedConfig = useCallback((baseConfig: AnimationConfig): AnimationConfig => {
    const { cores, memory, isLowEnd, supportsHardwareAcceleration } = deviceCapabilities;

    if (isLowEnd || cores < 2 || memory < 2048) {
      // Low-end device configuration
      return {
        ...baseConfig,
        speed: 'fast',
        maxConcurrentAnimations: 2,
        easing: 'linear',
        reducedMotion: true
      };
    }

    if (cores >= 4 && memory >= 4096 && supportsHardwareAcceleration) {
      // High-end device configuration
      return {
        ...baseConfig,
        maxConcurrentAnimations: Math.min(12, baseConfig.maxConcurrentAnimations * 1.5)
      };
    }

    // Medium-end device configuration
    return baseConfig;
  }, [deviceCapabilities]);

  return {
    deviceCapabilities,
    getRecommendedConfig
  };
}