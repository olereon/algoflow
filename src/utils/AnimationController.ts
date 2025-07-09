/**
 * Centralized Animation Controller
 * Manages requestAnimationFrame loops, animation queues, easing functions, and playback control
 */

import { EasingFunction, AnimationState, AnimationQueueItem, AnimationOptions, PlaybackState } from '../types/animation';

export type AnimationCallback = (progress: number, elapsed: number, data?: any) => void;
export type AnimationCompleteCallback = (id: string, data?: any) => void;

export interface AnimationItem {
  id: string;
  startTime: number;
  duration: number;
  easing: EasingFunction;
  callback: AnimationCallback;
  onComplete?: AnimationCompleteCallback;
  priority: number;
  data?: any;
  state: AnimationState;
  pausedAt?: number;
  pauseDuration: number;
}

export interface AnimationControllerOptions {
  maxFPS?: number;
  enableProfiling?: boolean;
  defaultEasing?: keyof typeof EasingFunctions;
  autoStart?: boolean;
}

// Comprehensive easing functions library
export const EasingFunctions = {
  // Linear
  linear: (t: number): number => t,
  
  // Quadratic
  easeInQuad: (t: number): number => t * t,
  easeOutQuad: (t: number): number => t * (2 - t),
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // Cubic
  easeInCubic: (t: number): number => t * t * t,
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  easeInOutCubic: (t: number): number => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  // Quartic
  easeInQuart: (t: number): number => t * t * t * t,
  easeOutQuart: (t: number): number => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number): number => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  
  // Quintic
  easeInQuint: (t: number): number => t * t * t * t * t,
  easeOutQuint: (t: number): number => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number): number => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  
  // Sine
  easeInSine: (t: number): number => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t: number): number => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t: number): number => (1 - Math.cos(Math.PI * t)) / 2,
  
  // Exponential
  easeInExpo: (t: number): number => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number): number => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number): number => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  
  // Circular
  easeInCirc: (t: number): number => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number): number => Math.sqrt(1 - (t - 1) * (t - 1)),
  easeInOutCirc: (t: number): number => {
    if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    return (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
  },
  
  // Elastic
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number): number => {
    const c5 = (2 * Math.PI) / 4.5;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  },
  
  // Bounce
  easeInBounce: (t: number): number => 1 - EasingFunctions.easeOutBounce(1 - t),
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
  easeInOutBounce: (t: number): number => {
    return t < 0.5
      ? (1 - EasingFunctions.easeOutBounce(1 - 2 * t)) / 2
      : (1 + EasingFunctions.easeOutBounce(2 * t - 1)) / 2;
  },
  
  // Back
  easeInBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    if (t < 0.5) return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
    return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  }
} as const;

export class AnimationController {
  private animations = new Map<string, AnimationItem>();
  private animationQueue: AnimationQueueItem[] = [];
  private isRunning = false;
  private playbackState: PlaybackState = 'stopped';
  private playbackSpeed = 1.0;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fps = 0;
  private fpsUpdateTime = 0;
  private maxFPS: number;
  private enableProfiling: boolean;
  private defaultEasing: EasingFunction;
  private rafId: number | null = null;
  private pausedTime = 0;
  private globalStartTime = 0;

  // Event listeners
  private onPlaybackStateChange?: (state: PlaybackState) => void;
  private onFPSUpdate?: (fps: number) => void;
  private onAnimationStart?: (id: string) => void;
  private onAnimationComplete?: (id: string) => void;

  constructor(options: AnimationControllerOptions = {}) {
    this.maxFPS = options.maxFPS || 60;
    this.enableProfiling = options.enableProfiling || false;
    this.defaultEasing = EasingFunctions[options.defaultEasing || 'easeOutQuad'];
    
    if (options.autoStart) {
      this.play();
    }
  }

  /**
   * Start the animation loop
   */
  play(): void {
    if (this.playbackState === 'playing') return;
    
    this.playbackState = 'playing';
    this.globalStartTime = performance.now() - this.pausedTime;
    this.startAnimationLoop();
    this.onPlaybackStateChange?.(this.playbackState);
  }

  /**
   * Pause the animation loop
   */
  pause(): void {
    if (this.playbackState !== 'playing') return;
    
    this.playbackState = 'paused';
    this.pausedTime = performance.now() - this.globalStartTime;
    this.stopAnimationLoop();
    this.onPlaybackStateChange?.(this.playbackState);
  }

  /**
   * Stop and reset the animation loop
   */
  stop(): void {
    this.playbackState = 'stopped';
    this.pausedTime = 0;
    this.globalStartTime = 0;
    this.stopAnimationLoop();
    this.clearAllAnimations();
    this.onPlaybackStateChange?.(this.playbackState);
  }

  /**
   * Set playback speed (0.1 to 4.0)
   */
  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0.1, Math.min(4.0, speed));
    
    // Adjust all active animations
    const currentTime = this.getCurrentTime();
    this.animations.forEach(animation => {
      if (animation.state === 'running') {
        const elapsed = currentTime - animation.startTime;
        const newDuration = animation.duration / this.playbackSpeed;
        animation.duration = newDuration;
        animation.startTime = currentTime - (elapsed * this.playbackSpeed);
      }
    });
  }

  /**
   * Add animation to the system
   */
  addAnimation(options: AnimationOptions): string {
    const id = options.id || this.generateId();
    const currentTime = this.getCurrentTime();
    
    const animation: AnimationItem = {
      id,
      startTime: options.delay ? currentTime + options.delay : currentTime,
      duration: options.duration / this.playbackSpeed,
      easing: options.easing || this.defaultEasing,
      callback: options.callback,
      onComplete: options.onComplete,
      priority: options.priority || 0,
      data: options.data,
      state: options.delay ? 'pending' : 'running',
      pauseDuration: 0
    };

    this.animations.set(id, animation);
    
    if (animation.state === 'running') {
      this.onAnimationStart?.(id);
    }

    // Auto-start if not already running
    if (!this.isRunning && this.playbackState === 'stopped') {
      this.play();
    }

    return id;
  }

  /**
   * Remove animation by ID
   */
  removeAnimation(id: string): boolean {
    const animation = this.animations.get(id);
    if (animation) {
      animation.state = 'cancelled';
      this.animations.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Pause specific animation
   */
  pauseAnimation(id: string): boolean {
    const animation = this.animations.get(id);
    if (animation && animation.state === 'running') {
      animation.state = 'paused';
      animation.pausedAt = this.getCurrentTime();
      return true;
    }
    return false;
  }

  /**
   * Resume specific animation
   */
  resumeAnimation(id: string): boolean {
    const animation = this.animations.get(id);
    if (animation && animation.state === 'paused' && animation.pausedAt) {
      const pauseDuration = this.getCurrentTime() - animation.pausedAt;
      animation.pauseDuration += pauseDuration;
      animation.startTime += pauseDuration;
      animation.state = 'running';
      animation.pausedAt = undefined;
      return true;
    }
    return false;
  }

  /**
   * Get animation by ID
   */
  getAnimation(id: string): AnimationItem | undefined {
    return this.animations.get(id);
  }

  /**
   * Get all active animations
   */
  getActiveAnimations(): AnimationItem[] {
    return Array.from(this.animations.values()).filter(
      anim => anim.state === 'running' || anim.state === 'pending'
    );
  }

  /**
   * Clear all animations
   */
  clearAllAnimations(): void {
    this.animations.clear();
    this.animationQueue = [];
  }

  /**
   * Add animation to queue (for batched execution)
   */
  queueAnimation(options: AnimationOptions): string {
    const id = options.id || this.generateId();
    this.animationQueue.push({
      id,
      options,
      priority: options.priority || 0,
      timestamp: performance.now()
    });
    
    // Sort by priority (higher first)
    this.animationQueue.sort((a, b) => b.priority - a.priority);
    
    return id;
  }

  /**
   * Process animation queue
   */
  processQueue(): void {
    const itemsToProcess = this.animationQueue.splice(0, 10); // Process 10 at a time
    itemsToProcess.forEach(item => {
      this.addAnimation(item.options);
    });
  }

  /**
   * Get current playback state
   */
  getPlaybackState(): PlaybackState {
    return this.playbackState;
  }

  /**
   * Get current playback speed
   */
  getPlaybackSpeed(): number {
    return this.playbackSpeed;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps;
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      fps: this.fps,
      activeAnimations: this.animations.size,
      queuedAnimations: this.animationQueue.length,
      playbackState: this.playbackState,
      playbackSpeed: this.playbackSpeed
    };
  }

  /**
   * Set event listeners
   */
  setEventListeners(listeners: {
    onPlaybackStateChange?: (state: PlaybackState) => void;
    onFPSUpdate?: (fps: number) => void;
    onAnimationStart?: (id: string) => void;
    onAnimationComplete?: (id: string) => void;
  }): void {
    this.onPlaybackStateChange = listeners.onPlaybackStateChange;
    this.onFPSUpdate = listeners.onFPSUpdate;
    this.onAnimationStart = listeners.onAnimationStart;
    this.onAnimationComplete = listeners.onAnimationComplete;
  }

  /**
   * Dispose of the controller
   */
  dispose(): void {
    this.stop();
    this.clearAllAnimations();
    this.onPlaybackStateChange = undefined;
    this.onFPSUpdate = undefined;
    this.onAnimationStart = undefined;
    this.onAnimationComplete = undefined;
  }

  // Private methods

  private startAnimationLoop(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  private stopAnimationLoop(): void {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    const currentTime = this.getCurrentTime();
    
    // FPS calculation
    if (this.enableProfiling) {
      this.updateFPS(currentTime);
    }

    // Frame rate limiting
    if (this.maxFPS > 0) {
      const targetFrameTime = 1000 / this.maxFPS;
      if (currentTime - this.lastFrameTime < targetFrameTime) {
        this.rafId = requestAnimationFrame(this.animate);
        return;
      }
    }

    this.lastFrameTime = currentTime;

    // Process queued animations
    if (this.animationQueue.length > 0) {
      this.processQueue();
    }

    // Update all animations
    const animationsToRemove: string[] = [];
    
    this.animations.forEach((animation, id) => {
      if (animation.state === 'paused' || animation.state === 'cancelled') {
        return;
      }

      if (animation.state === 'pending' && currentTime >= animation.startTime) {
        animation.state = 'running';
        this.onAnimationStart?.(id);
      }

      if (animation.state === 'running') {
        const elapsed = currentTime - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        const easedProgress = animation.easing(progress);

        animation.callback(easedProgress, elapsed, animation.data);

        if (progress >= 1) {
          animation.state = 'completed';
          animationsToRemove.push(id);
          animation.onComplete?.(id, animation.data);
          this.onAnimationComplete?.(id);
        }
      }
    });

    // Remove completed animations
    animationsToRemove.forEach(id => {
      this.animations.delete(id);
    });

    // Continue loop if there are active animations
    if (this.animations.size > 0 || this.animationQueue.length > 0) {
      this.rafId = requestAnimationFrame(this.animate);
    } else {
      this.isRunning = false;
      this.playbackState = 'stopped';
      this.onPlaybackStateChange?.(this.playbackState);
    }
  };

  private updateFPS(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.fpsUpdateTime));
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
      this.onFPSUpdate?.(this.fps);
    }
  }

  private getCurrentTime(): number {
    if (this.playbackState === 'playing') {
      return (performance.now() - this.globalStartTime) * this.playbackSpeed;
    } else if (this.playbackState === 'paused') {
      return this.pausedTime * this.playbackSpeed;
    }
    return 0;
  }

  private generateId(): string {
    return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const animationController = new AnimationController({
  maxFPS: 60,
  enableProfiling: true,
  defaultEasing: 'easeOutQuad',
  autoStart: false
});