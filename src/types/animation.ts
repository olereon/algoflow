/**
 * Animation system type definitions
 */

export type EasingFunction = (t: number) => number;

export type AnimationState = 'pending' | 'running' | 'paused' | 'completed' | 'cancelled';

export type PlaybackState = 'playing' | 'paused' | 'stopped';

export interface AnimationOptions {
  id?: string;
  duration: number;
  easing?: EasingFunction;
  callback: (progress: number, elapsed: number, data?: any) => void;
  onComplete?: (id: string, data?: any) => void;
  delay?: number;
  priority?: number;
  data?: any;
}

export interface AnimationQueueItem {
  id: string;
  options: AnimationOptions;
  priority: number;
  timestamp: number;
}

export interface SpringConfig {
  tension: number;
  friction: number;
  mass: number;
}

export interface AnimationGroup {
  id: string;
  animations: string[];
  mode: 'parallel' | 'sequential';
  onComplete?: () => void;
}

export interface KeyframeAnimation {
  keyframes: Array<{
    time: number; // 0-1
    values: Record<string, any>;
    easing?: EasingFunction;
  }>;
  duration: number;
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
}

export interface TweenOptions {
  from: Record<string, number>;
  to: Record<string, number>;
  duration: number;
  easing?: EasingFunction;
  onUpdate: (values: Record<string, number>) => void;
  onComplete?: () => void;
}

export interface SpringOptions {
  from: number;
  to: number;
  config: SpringConfig;
  onUpdate: (value: number, velocity: number) => void;
  onComplete?: () => void;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  activeAnimations: number;
  droppedFrames: number;
}

export interface AnimationHookOptions {
  autoStart?: boolean;
  loop?: boolean | number;
  onStart?: () => void;
  onComplete?: () => void;
  onLoop?: (iteration: number) => void;
}

export interface TimingFunction {
  name: string;
  fn: EasingFunction;
  description: string;
  category: 'linear' | 'ease' | 'bounce' | 'elastic' | 'back' | 'custom';
}

export interface AnimationSequence {
  id: string;
  steps: Array<{
    animations: AnimationOptions[];
    mode: 'parallel' | 'sequential';
    delay?: number;
  }>;
  loop?: boolean | number;
  onComplete?: () => void;
}

export interface ValueInterpolator<T = any> {
  interpolate: (from: T, to: T, progress: number) => T;
  type: string;
}

export interface AnimationPreset {
  name: string;
  duration: number;
  easing: EasingFunction;
  keyframes?: KeyframeAnimation['keyframes'];
  description: string;
}

// Common animation presets
export const AnimationPresets: Record<string, AnimationPreset> = {
  fadeIn: {
    name: 'Fade In',
    duration: 300,
    easing: (t: number) => t * t,
    description: 'Smooth fade in animation'
  },
  fadeOut: {
    name: 'Fade Out',
    duration: 300,
    easing: (t: number) => 1 - (1 - t) * (1 - t),
    description: 'Smooth fade out animation'
  },
  slideInLeft: {
    name: 'Slide In Left',
    duration: 400,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    description: 'Slide in from left animation'
  },
  slideInRight: {
    name: 'Slide In Right',
    duration: 400,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    description: 'Slide in from right animation'
  },
  slideUp: {
    name: 'Slide Up',
    duration: 350,
    easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    description: 'Slide up animation'
  },
  slideDown: {
    name: 'Slide Down',
    duration: 350,
    easing: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    description: 'Slide down animation'
  },
  bounceIn: {
    name: 'Bounce In',
    duration: 600,
    easing: (t: number) => {
      const n1 = 7.5625;
      const d1 = 2.75;
      if (t < 1 / d1) return n1 * t * t;
      if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
      if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    },
    description: 'Bouncy entrance animation'
  },
  scaleIn: {
    name: 'Scale In',
    duration: 300,
    easing: (t: number) => 1 - Math.pow(1 - t, 3),
    description: 'Scale up animation'
  },
  scaleOut: {
    name: 'Scale Out',
    duration: 300,
    easing: (t: number) => t * t * t,
    description: 'Scale down animation'
  },
  elastic: {
    name: 'Elastic',
    duration: 800,
    easing: (t: number) => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    },
    description: 'Elastic animation with overshoot'
  }
};

// Common spring configurations
export const SpringConfigs: Record<string, SpringConfig> = {
  default: { tension: 170, friction: 26, mass: 1 },
  gentle: { tension: 120, friction: 14, mass: 1 },
  wobbly: { tension: 180, friction: 12, mass: 1 },
  stiff: { tension: 210, friction: 20, mass: 1 },
  slow: { tension: 280, friction: 60, mass: 1 },
  molasses: { tension: 280, friction: 120, mass: 1 }
};