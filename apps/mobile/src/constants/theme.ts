// Design System Constants - EMBREL App
// Following React Native StyleSheet best practices

import { Platform } from 'react-native';

// Color System
export const COLORS = {
  // Primary brand colors
  primary: {
    main: '#dc2626',      // red-600
    light: '#fca5a5',     // red-300  
    dark: '#991b1b',      // red-800
    contrast: '#ffffff',
  },
  
  // Secondary colors
  secondary: {
    main: '#6b7280',      // gray-500
    light: '#d1d5db',     // gray-300
    dark: '#374151',      // gray-700
    contrast: '#ffffff',
  },
  
  // Status colors
  status: {
    success: '#10b981',   // emerald-500
    warning: '#f59e0b',   // amber-500
    error: '#ef4444',     // red-500
    info: '#3b82f6',      // blue-500
  },
  
  // Accent colors
  accent: {
    blue: '#3b82f6',      // blue-500
    green: '#10b981',     // emerald-500
    purple: '#8b5cf6',    // violet-500
    orange: '#f97316',    // orange-500
  },
  
  // Background colors
  background: {
    primary: '#ffffff',
    secondary: '#f8f9fa',
    light: '#f8f9fa',
    white: '#ffffff',
    dark: '#1f2937',
  },
  
  // Text colors
  text: {
    primary: '#111827',   // gray-900
    secondary: '#6b7280', // gray-500
    tertiary: '#9ca3af',  // gray-400
    inverse: '#ffffff',
    muted: '#6b7280',
  },
  
  // Border colors
  border: {
    default: '#dee2e6',
    light: '#f3f4f6',     // gray-100
    dark: '#d1d5db',      // gray-300
  },
} as const;

// Typography Scale (iOS/Android standard)
export const TYPOGRAPHY = {
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 22,
    '4xl': 24,
    '5xl': 28,
  },
  
  weight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Spacing Scale (tighter, mobile-first)
export const SPACING = {
  xs: 2,      // 2px
  sm: 4,      // 4px
  base: 8,    // 8px
  md: 12,     // 12px
  lg: 16,     // 16px
  xl: 20,     // 20px
  '2xl': 24,  // 24px
  '3xl': 32,  // 32px
  '4xl': 40,  // 40px
  '5xl': 48,  // 48px
  '6xl': 64,  // 64px
  '7xl': 80,  // 80px
} as const;

// Border Radius Scale
export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Shadow System (cross-platform)
export const SHADOWS = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),
  
  base: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
    },
    android: {
      elevation: 16,
    },
  }),
} as const;

// Layout Constants
export const LAYOUT = {
  headerHeight: 60,
  tabBarHeight: 84,
  borderWidth: 1,
  borderWidthLarge: 2,
  
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

// Helper Functions

/**
 * Creates cross-platform shadow styles
 * @param level - Shadow intensity level (1-4)
 */
export const createShadow = (level: 1 | 2 | 3 | 4) => {
  const shadowLevels = {
    1: SHADOWS.sm,
    2: SHADOWS.base,
    3: SHADOWS.md,
    4: SHADOWS.lg,
  };
  
  return shadowLevels[level] || SHADOWS.base;
};

/**
 * Get spacing value safely
 * @param size - Spacing key or number
 */
export const getSpacing = (size: keyof typeof SPACING | number): number => {
  if (typeof size === 'number') {
    return size;
  }
  return SPACING[size] || SPACING.base;
};

// Helper function to create responsive styles
export const createResponsiveValue = <T>(
  mobile: T
): T => {
  // For now, return mobile value
  // Can be enhanced with useWindowDimensions later
  return mobile;
};

// Type exports for TypeScript
export type Colors = typeof COLORS;
export type Typography = typeof TYPOGRAPHY;
export type Spacing = typeof SPACING;
export type BorderRadius = typeof BORDER_RADIUS;
export type Shadows = typeof SHADOWS;
export type Layout = typeof LAYOUT; 