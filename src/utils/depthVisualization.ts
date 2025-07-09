/**
 * Depth Visualization System
 * Provides color gradients, accessibility compliance, and visual mapping for stack depths
 */

export interface DepthColorConfig {
  background: string;
  border: string;
  text: string;
  accent: string;
  gradient: string;
  intensity: number; // 0-1 scale
  contrastRatio: number;
}

export interface DepthVisualizationOptions {
  maxDepth?: number;
  colorScheme?: 'blue' | 'warm' | 'cool' | 'rainbow' | 'monochrome';
  highContrast?: boolean;
  reducedMotion?: boolean;
}

// WCAG AA compliance requires 4.5:1 contrast ratio for normal text
// WCAG AAA compliance requires 7:1 contrast ratio for normal text
const MIN_CONTRAST_RATIO = 4.5;
const PREFERRED_CONTRAST_RATIO = 7.0;

// Color schemes with accessibility-compliant gradients
export const DEPTH_COLOR_SCHEMES = {
  blue: {
    name: 'Blue Gradient',
    colors: [
      '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8',
      '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'
    ],
    textColors: [
      '#1e293b', '#1e293b', '#1e293b', '#1e293b', '#f8fafc',
      '#f8fafc', '#f8fafc', '#f8fafc', '#f8fafc', '#f8fafc'
    ]
  },
  warm: {
    name: 'Warm Gradient',
    colors: [
      '#fefcbf', '#fef3cd', '#fde68a', '#fcd34d', '#f59e0b',
      '#d97706', '#b45309', '#92400e', '#78350f', '#451a03'
    ],
    textColors: [
      '#451a03', '#451a03', '#451a03', '#451a03', '#451a03',
      '#fefcbf', '#fefcbf', '#fefcbf', '#fefcbf', '#fefcbf'
    ]
  },
  cool: {
    name: 'Cool Gradient',
    colors: [
      '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399',
      '#10b981', '#059669', '#047857', '#065f46', '#064e3b'
    ],
    textColors: [
      '#064e3b', '#064e3b', '#064e3b', '#064e3b', '#064e3b',
      '#ecfdf5', '#ecfdf5', '#ecfdf5', '#ecfdf5', '#ecfdf5'
    ]
  },
  rainbow: {
    name: 'Rainbow Gradient',
    colors: [
      '#fef2f2', '#fef3c7', '#ecfdf5', '#eff6ff', '#f3e8ff',
      '#fce7f3', '#fed7d7', '#fde047', '#34d399', '#3b82f6'
    ],
    textColors: [
      '#7f1d1d', '#78350f', '#064e3b', '#1e3a8a', '#581c87',
      '#86198f', '#991b1b', '#365314', '#064e3b', '#1e3a8a'
    ]
  },
  monochrome: {
    name: 'High Contrast Monochrome',
    colors: [
      '#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#d1d5db',
      '#9ca3af', '#6b7280', '#4b5563', '#374151', '#111827'
    ],
    textColors: [
      '#111827', '#111827', '#111827', '#111827', '#111827',
      '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'
    ]
  }
};

/**
 * Calculates relative luminance for contrast ratio computation
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converts hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculates contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Gets depth-based color configuration with accessibility compliance
 */
export function getDepthColorConfig(
  depth: number,
  options: DepthVisualizationOptions = {}
): DepthColorConfig {
  const {
    maxDepth = 10,
    colorScheme = 'blue',
    highContrast = false
  } = options;

  const scheme = DEPTH_COLOR_SCHEMES[colorScheme];
  const normalizedDepth = Math.min(depth, maxDepth - 1);
  const colorIndex = Math.min(normalizedDepth, scheme.colors.length - 1);
  
  const backgroundColor = scheme.colors[colorIndex];
  const textColor = scheme.textColors[colorIndex];
  
  // Calculate intensity (0 = lightest, 1 = darkest)
  const intensity = normalizedDepth / (maxDepth - 1);
  
  // Calculate contrast ratio
  const contrastRatio = getContrastRatio(backgroundColor, textColor);
  
  // Adjust for high contrast mode if needed
  const finalTextColor = highContrast && contrastRatio < PREFERRED_CONTRAST_RATIO
    ? (intensity > 0.5 ? '#ffffff' : '#000000')
    : textColor;
  
  const finalContrastRatio = getContrastRatio(backgroundColor, finalTextColor);
  
  return {
    background: backgroundColor,
    border: adjustColorBrightness(backgroundColor, -0.1),
    text: finalTextColor,
    accent: adjustColorBrightness(backgroundColor, intensity > 0.5 ? 0.2 : -0.2),
    gradient: createGradient(backgroundColor),
    intensity,
    contrastRatio: finalContrastRatio
  };
}

/**
 * Adjusts color brightness by a factor (-1 to 1)
 */
function adjustColorBrightness(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (value: number) => {
    if (factor > 0) {
      return Math.round(value + (255 - value) * factor);
    } else {
      return Math.round(value * (1 + factor));
    }
  };
  
  const r = adjust(rgb.r).toString(16).padStart(2, '0');
  const g = adjust(rgb.g).toString(16).padStart(2, '0');
  const b = adjust(rgb.b).toString(16).padStart(2, '0');
  
  return `#${r}${g}${b}`;
}

/**
 * Creates a subtle gradient for depth visualization
 */
function createGradient(baseColor: string): string {
  const lighterColor = adjustColorBrightness(baseColor, 0.1);
  const darkerColor = adjustColorBrightness(baseColor, -0.1);
  
  return `linear-gradient(135deg, ${lighterColor} 0%, ${baseColor} 50%, ${darkerColor} 100%)`;
}

/**
 * Gets depth indicator configuration
 */
export function getDepthIndicator(depth: number): {
  label: string;
  icon: string;
  size: 'sm' | 'md' | 'lg';
  urgency: 'safe' | 'warning' | 'danger';
} {
  if (depth === 0) {
    return {
      label: 'ROOT',
      icon: '●',
      size: 'md',
      urgency: 'safe'
    };
  }
  
  if (depth <= 5) {
    return {
      label: `L${depth}`,
      icon: '◉',
      size: 'sm',
      urgency: 'safe'
    };
  }
  
  if (depth <= 15) {
    return {
      label: `L${depth}`,
      icon: '◎',
      size: 'md',
      urgency: 'warning'
    };
  }
  
  return {
    label: `L${depth}`,
    icon: '⚠',
    size: 'lg',
    urgency: 'danger'
  };
}

/**
 * Determines if a depth level should be collapsed by default
 */
export function shouldAutoCollapse(depth: number, totalFrames: number): boolean {
  // Auto-collapse if:
  // - Depth > 10 OR
  // - Total frames > 20 AND depth > 5 OR
  // - Total frames > 50 AND depth > 3
  
  if (depth > 10) return true;
  if (totalFrames > 50 && depth > 3) return true;
  if (totalFrames > 20 && depth > 5) return true;
  
  return false;
}

/**
 * Gets CSS classes for depth visualization
 */
export function getDepthClasses(
  depth: number,
  options: DepthVisualizationOptions = {}
): string[] {
  const indicator = getDepthIndicator(depth);
  const classes = [
    'stack-depth',
    `stack-depth-${depth}`,
    `stack-depth-${indicator.urgency}`,
    `stack-depth-size-${indicator.size}`
  ];
  
  if (options.highContrast) {
    classes.push('stack-depth-high-contrast');
  }
  
  if (options.reducedMotion) {
    classes.push('stack-depth-reduced-motion');
  }
  
  return classes;
}

/**
 * Validates accessibility compliance
 */
export function validateAccessibility(config: DepthColorConfig): {
  isCompliant: boolean;
  level: 'AA' | 'AAA' | 'FAIL';
  recommendations: string[];
} {
  const recommendations: string[] = [];
  
  if (config.contrastRatio < MIN_CONTRAST_RATIO) {
    recommendations.push('Increase text contrast - current ratio below WCAG AA standards');
    return {
      isCompliant: false,
      level: 'FAIL',
      recommendations
    };
  }
  
  if (config.contrastRatio < PREFERRED_CONTRAST_RATIO) {
    recommendations.push('Consider increasing contrast for AAA compliance');
    return {
      isCompliant: true,
      level: 'AA',
      recommendations
    };
  }
  
  return {
    isCompliant: true,
    level: 'AAA',
    recommendations: ['Excellent contrast ratio - fully accessible']
  };
}

/**
 * Generates CSS custom properties for depth theming
 */
export function generateDepthCSS(
  maxDepth: number = 20,
  options: DepthVisualizationOptions = {}
): string {
  let css = ':root {\n';
  
  for (let depth = 0; depth < maxDepth; depth++) {
    const config = getDepthColorConfig(depth, options);
    css += `  --depth-${depth}-bg: ${config.background};\n`;
    css += `  --depth-${depth}-text: ${config.text};\n`;
    css += `  --depth-${depth}-border: ${config.border};\n`;
    css += `  --depth-${depth}-accent: ${config.accent};\n`;
    css += `  --depth-${depth}-gradient: ${config.gradient};\n`;
    css += `  --depth-${depth}-intensity: ${config.intensity};\n`;
  }
  
  css += '}\n\n';
  css += generateDepthAnimationCSS();
  
  return css;
}

/**
 * Generates CSS animations for depth transitions
 */
function generateDepthAnimationCSS(): string {
  return `
/* Depth-based animations */
.stack-depth {
  transition: all 0.3s ease-in-out;
}

.stack-depth-reduced-motion {
  transition: none;
}

.stack-depth-safe {
  border-left: 3px solid #10b981;
}

.stack-depth-warning {
  border-left: 3px solid #f59e0b;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2);
}

.stack-depth-danger {
  border-left: 3px solid #ef4444;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.3);
  animation: pulse-danger 2s infinite;
}

@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.3); }
  50% { box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1); }
}

.stack-depth-high-contrast {
  border-width: 2px;
  border-style: solid;
}

.stack-depth-size-sm .depth-indicator {
  font-size: 0.75rem;
}

.stack-depth-size-md .depth-indicator {
  font-size: 0.875rem;
}

.stack-depth-size-lg .depth-indicator {
  font-size: 1rem;
  font-weight: bold;
}
`;
}