// Style Helper Functions - EMBREL App
// Common style patterns and utilities following React Native best practices

import { ImageStyle, Platform, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '../constants/theme';

// Type for all possible style objects
type Style = ViewStyle | TextStyle | ImageStyle;

// Common layout patterns
export const layoutStyles = StyleSheet.create({
  // Flex patterns
  flex1: { flex: 1 },
  flexRow: { flexDirection: 'row' },
  flexColumn: { flexDirection: 'column' },
  
  // Alignment
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  spaceBetween: { 
    justifyContent: 'space-between' 
  },
  spaceAround: { 
    justifyContent: 'space-around' 
  },
  alignStart: { 
    alignItems: 'flex-start' 
  },
  alignEnd: { 
    alignItems: 'flex-end' 
  },
  alignCenter: { 
    alignItems: 'center' 
  },
  justifyStart: { 
    justifyContent: 'flex-start' 
  },
  justifyEnd: { 
    justifyContent: 'flex-end' 
  },
  justifyCenter: { 
    justifyContent: 'center' 
  },
  
  // Common containers
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  paddedContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    padding: SPACING.md,
  },
  
  // Card layouts
  card: {
    backgroundColor: COLORS.background.white,
    borderRadius: BORDER_RADIUS.base,
    padding: SPACING.base,
    ...SHADOWS.sm,
  },
  cardElevated: {
    backgroundColor: COLORS.background.white,
    borderRadius: BORDER_RADIUS.base,
    padding: SPACING.base,
    ...SHADOWS.base,
  },
});

// Text styles
export const textStyles = StyleSheet.create({
  // Base text styles
  body: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22.4, // 1.4 ratio
  },
  bodySecondary: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 22.4,
  },
  caption: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    lineHeight: 19.6,
  },
  
  // Headers
  h1: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 28.8,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text.primary,
    lineHeight: 21.6,
  },
  
  // Special text styles
  bold: { fontWeight: '700' },
  semibold: { fontWeight: '600' },
  medium: { fontWeight: '500' },
  
  // Text alignment
  textCenter: { textAlign: 'center' },
  textLeft: { textAlign: 'left' },
  textRight: { textAlign: 'right' },
});

// Platform-specific shadow helper
export const createShadow = (
  elevation: number = 2,
  shadowColor: string = COLORS.text.primary,
  shadowOpacity: number = 0.15,
  shadowRadius?: number,
  shadowOffset?: { width: number; height: number }
): ViewStyle => {
  const defaultShadowRadius = elevation * 0.8;
  const defaultShadowOffset = { width: 0, height: elevation * 0.5 };
  
  return Platform.select({
    ios: {
      shadowColor,
      shadowOpacity,
      shadowRadius: shadowRadius ?? defaultShadowRadius,
      shadowOffset: shadowOffset ?? defaultShadowOffset,
    },
    android: {
      elevation,
    },
    default: {}, // for web
  }) as ViewStyle;
};

// Spacing helpers
export const spacing = {
  // Margin helpers
  m: (value: keyof typeof SPACING) => ({ margin: SPACING[value] }),
  mt: (value: keyof typeof SPACING) => ({ marginTop: SPACING[value] }),
  mb: (value: keyof typeof SPACING) => ({ marginBottom: SPACING[value] }),
  ml: (value: keyof typeof SPACING) => ({ marginLeft: SPACING[value] }),
  mr: (value: keyof typeof SPACING) => ({ marginRight: SPACING[value] }),
  mx: (value: keyof typeof SPACING) => ({ 
    marginLeft: SPACING[value], 
    marginRight: SPACING[value] 
  }),
  my: (value: keyof typeof SPACING) => ({ 
    marginTop: SPACING[value], 
    marginBottom: SPACING[value] 
  }),
  
  // Padding helpers
  p: (value: keyof typeof SPACING) => ({ padding: SPACING[value] }),
  pt: (value: keyof typeof SPACING) => ({ paddingTop: SPACING[value] }),
  pb: (value: keyof typeof SPACING) => ({ paddingBottom: SPACING[value] }),
  pl: (value: keyof typeof SPACING) => ({ paddingLeft: SPACING[value] }),
  pr: (value: keyof typeof SPACING) => ({ paddingRight: SPACING[value] }),
  px: (value: keyof typeof SPACING) => ({ 
    paddingLeft: SPACING[value], 
    paddingRight: SPACING[value] 
  }),
  py: (value: keyof typeof SPACING) => ({ 
    paddingTop: SPACING[value], 
    paddingBottom: SPACING[value] 
  }),
};

// Border helpers
export const borders = {
  radius: (value: keyof typeof BORDER_RADIUS) => ({ 
    borderRadius: BORDER_RADIUS[value] 
  }),
  width: (width: number, color: string = COLORS.border.default) => ({
    borderWidth: width,
    borderColor: color,
  }),
  top: (width: number, color: string = COLORS.border.default) => ({
    borderTopWidth: width,
    borderTopColor: color,
  }),
  bottom: (width: number, color: string = COLORS.border.default) => ({
    borderBottomWidth: width,
    borderBottomColor: color,
  }),
  left: (width: number, color: string = COLORS.border.default) => ({
    borderLeftWidth: width,
    borderLeftColor: color,
  }),
  right: (width: number, color: string = COLORS.border.default) => ({
    borderRightWidth: width,
    borderRightColor: color,
  }),
};

// Position helpers
export const positions = StyleSheet.create({
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  absoluteFill: { ...StyleSheet.absoluteFillObject },
  
  // Common absolute positions
  topLeft: { position: 'absolute', top: 0, left: 0 },
  topRight: { position: 'absolute', top: 0, right: 0 },
  bottomLeft: { position: 'absolute', bottom: 0, left: 0 },
  bottomRight: { position: 'absolute', bottom: 0, right: 0 },
  
  // Center positioning
  absoluteCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
});

// Helper to merge styles safely
export const mergeStyles = (...styles: any[]): any => {
  return StyleSheet.flatten(styles.filter(Boolean));
};

// Helper for conditional styles
export const conditionalStyle = (condition: boolean, trueStyle: Style, falseStyle?: Style): Style => {
  return condition ? trueStyle : (falseStyle || {});
};

// Color helper for dynamic colors
export const withOpacity = (color: string, opacity: number): string => {
  // Simple implementation - for more complex use, consider a color manipulation library
  if (color.startsWith('#') && color.length === 7) {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `${color}${alpha}`;
  }
  return color;
}; 