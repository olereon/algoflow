import { AnimationSpeed, AnimationConfig, FrameAnimation } from '../types';

// Animation duration mappings in milliseconds
export const ANIMATION_DURATIONS: Record<AnimationSpeed, number> = {
  slow: 800,
  normal: 400,
  fast: 200,
  instant: 0
};

// Easing functions for CSS transitions
export const EASING_FUNCTIONS = {
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
  'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
  linear: 'linear'
};

// Default animation configuration
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  speed: 'normal',
  enableAnimations: true,
  reducedMotion: false,
  maxConcurrentAnimations: 8,
  easing: 'ease-out'
};

// Animation CSS classes
export const ANIMATION_CLASSES = {
  frameEnter: 'stack-frame-enter',
  frameEnterActive: 'stack-frame-enter-active',
  frameExit: 'stack-frame-exit',
  frameExitActive: 'stack-frame-exit-active',
  frameUpdate: 'stack-frame-update',
  frameUpdateActive: 'stack-frame-update-active',
  variableChange: 'variable-change',
  variableChangeActive: 'variable-change-active'
};

/**
 * Generates a unique animation ID
 */
export function generateAnimationId(): string {
  return `anim_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculates animation duration based on speed and context
 */
export function getAnimationDuration(
  speed: AnimationSpeed,
  baseMultiplier: number = 1,
  complexityFactor: number = 1
): number {
  if (speed === 'instant') return 0;
  
  const baseDuration = ANIMATION_DURATIONS[speed];
  return Math.max(100, baseDuration * baseMultiplier * complexityFactor);
}

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Creates optimized CSS transition string
 */
export function createTransition(
  properties: string[],
  duration: number,
  easing: string = 'ease-out',
  delay: number = 0
): string {
  if (duration === 0) return 'none';
  
  return properties
    .map(prop => `${prop} ${duration}ms ${easing} ${delay}ms`)
    .join(', ');
}

/**
 * Stagger animations for multiple frames
 */
export function calculateStaggerDelay(
  index: number,
  total: number,
  maxStagger: number = 100,
  direction: 'forward' | 'reverse' = 'forward'
): number {
  if (total <= 1) return 0;
  
  const actualIndex = direction === 'reverse' ? total - 1 - index : index;
  const staggerPerItem = Math.min(maxStagger / total, 50); // Max 50ms per item
  
  return actualIndex * staggerPerItem;
}

/**
 * Optimizes animation performance for large stacks
 */
export function optimizeForStackSize(
  stackSize: number,
  config: AnimationConfig
): Partial<AnimationConfig> {
  // For very large stacks, reduce animation complexity
  if (stackSize > 50) {
    return {
      ...config,
      speed: stackSize > 100 ? 'fast' : config.speed,
      maxConcurrentAnimations: Math.max(3, Math.min(config.maxConcurrentAnimations, 6))
    };
  }
  
  // For medium stacks, slight optimization
  if (stackSize > 20) {
    return {
      ...config,
      maxConcurrentAnimations: Math.min(config.maxConcurrentAnimations, 8)
    };
  }
  
  return config;
}

/**
 * Batches similar animations to improve performance
 */
export function batchSimilarAnimations(animations: FrameAnimation[]): FrameAnimation[][] {
  const batches: FrameAnimation[][] = [];
  const typeGroups = new Map<string, FrameAnimation[]>();
  
  // Group by animation type
  animations.forEach(animation => {
    const key = animation.type;
    if (!typeGroups.has(key)) {
      typeGroups.set(key, []);
    }
    typeGroups.get(key)!.push(animation);
  });
  
  // Create batches from groups
  typeGroups.forEach(group => {
    // Split large groups into smaller batches for performance
    const batchSize = 8;
    for (let i = 0; i < group.length; i += batchSize) {
      batches.push(group.slice(i, i + batchSize));
    }
  });
  
  return batches;
}

/**
 * Calculates optimal frame rate for smooth animations
 */
export function getOptimalFrameRate(animationCount: number): number {
  // Reduce frame rate for many concurrent animations
  if (animationCount > 20) return 30; // 30fps
  if (animationCount > 10) return 45; // 45fps
  return 60; // 60fps for smooth animations
}

/**
 * Creates CSS keyframes for complex animations
 */
export function createKeyframes(name: string, keyframes: Record<string, Record<string, string>>): string {
  const keyframeRules = Object.entries(keyframes)
    .map(([percentage, styles]) => {
      const styleRules = Object.entries(styles)
        .map(([prop, value]) => `${prop}: ${value}`)
        .join('; ');
      return `${percentage} { ${styleRules} }`;
    })
    .join('\n  ');
  
  return `@keyframes ${name} {\n  ${keyframeRules}\n}`;
}

/**
 * Injects CSS for stack frame animations
 */
export function injectStackFrameCSS(config: AnimationConfig): void {
  const styleId = 'stack-frame-animations';
  
  // Remove existing styles
  const existingStyle = document.getElementById(styleId);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const duration = getAnimationDuration(config.speed);
  const easing = EASING_FUNCTIONS[config.easing];
  
  const css = `
    /* Stack Frame Enter Animation */
    .${ANIMATION_CLASSES.frameEnter} {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    
    .${ANIMATION_CLASSES.frameEnterActive} {
      opacity: 1;
      transform: translateY(0) scale(1);
      transition: ${createTransition(['opacity', 'transform'], duration, easing)};
    }
    
    /* Stack Frame Exit Animation */
    .${ANIMATION_CLASSES.frameExit} {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    
    .${ANIMATION_CLASSES.frameExitActive} {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
      transition: ${createTransition(['opacity', 'transform'], duration, easing)};
    }
    
    /* Stack Frame Update Animation */
    .${ANIMATION_CLASSES.frameUpdate} {
      transform: scale(1);
    }
    
    .${ANIMATION_CLASSES.frameUpdateActive} {
      transform: scale(1.02);
      transition: ${createTransition(['transform'], duration * 0.5, easing)};
    }
    
    /* Variable Change Animation */
    .${ANIMATION_CLASSES.variableChange} {
      background-color: transparent;
    }
    
    .${ANIMATION_CLASSES.variableChangeActive} {
      background-color: rgba(255, 235, 59, 0.3);
      transition: ${createTransition(['background-color'], duration * 0.3, easing)};
    }
    
    /* Performance optimizations */
    .stack-frame-animated {
      will-change: transform, opacity;
      backface-visibility: hidden;
      perspective: 1000px;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .${ANIMATION_CLASSES.frameEnterActive},
      .${ANIMATION_CLASSES.frameExitActive},
      .${ANIMATION_CLASSES.frameUpdateActive},
      .${ANIMATION_CLASSES.variableChangeActive} {
        transition: none !important;
        transform: none !important;
      }
    }
  `;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = css;
  document.head.appendChild(style);
}