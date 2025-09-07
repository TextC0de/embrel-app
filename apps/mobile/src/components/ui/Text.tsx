import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';

// Base text component props
interface BaseTextProps extends RNTextProps {
  children: React.ReactNode;
  color?: string;
  weight?: keyof typeof TYPOGRAPHY.weight;
  align?: 'left' | 'center' | 'right';
  style?: any;
}

// Base Text component
export const Text: React.FC<BaseTextProps> = ({
  children,
  color = COLORS.text.primary,
  weight = 'normal',
  align = 'left',
  style,
  ...props
}) => {
  const textStyles = StyleSheet.flatten([
    styles.base,
    { color: color || COLORS.text.primary },
    { fontWeight: TYPOGRAPHY.weight[weight] },
    align === 'center' && styles.center,
    align === 'right' && styles.right,
    style
  ].filter(Boolean)) as TextStyle;

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
};

// Heading components
interface HeadingProps extends Omit<BaseTextProps, 'style'> {
  style?: any;
}

export const Heading1: React.FC<HeadingProps> = ({ style, ...props }) => (
  <Text style={StyleSheet.flatten([styles.h1, style])} {...props} />
);

export const Heading2: React.FC<HeadingProps> = ({ style, ...props }) => (
  <Text style={StyleSheet.flatten([styles.h2, style])} {...props} />
);

export const Heading3: React.FC<HeadingProps> = ({ style, ...props }) => (
  <Text style={StyleSheet.flatten([styles.h3, style])} {...props} />
);

export const Heading4: React.FC<HeadingProps> = ({ style, ...props }) => (
  <Text style={StyleSheet.flatten([styles.h4, style])} {...props} />
);

// Body text components
export const BodyText: React.FC<BaseTextProps> = ({ style, ...props }) => (
  <Text style={StyleSheet.flatten([styles.body, style])} {...props} />
);

export const BodyTextSecondary: React.FC<BaseTextProps> = ({ 
  style, 
  color = COLORS.text.secondary,
  ...props 
}) => (
  <Text style={StyleSheet.flatten([styles.body, style])} color={color} {...props} />
);

export const Caption: React.FC<BaseTextProps> = ({ 
  style, 
  color = COLORS.text.tertiary,
  ...props 
}) => (
  <Text style={StyleSheet.flatten([styles.caption, style])} color={color} {...props} />
);

// Specialized text components
export const Label: React.FC<BaseTextProps> = ({ 
  style, 
  weight = 'medium',
  ...props 
}) => (
  <Text style={StyleSheet.flatten([styles.label, style])} weight={weight} {...props} />
);

export const Link: React.FC<BaseTextProps> = ({ 
  style, 
  color = COLORS.primary.main,
  ...props 
}) => (
  <Text 
    style={StyleSheet.flatten([styles.link, style])} 
    color={color} 
    {...props} 
  />
);

export const ErrorText: React.FC<BaseTextProps> = ({ 
  style, 
  color = COLORS.status.error,
  ...props 
}) => (
  <Text style={StyleSheet.flatten([styles.error, style])} color={color} {...props} />
);

export const SuccessText: React.FC<BaseTextProps> = ({ 
  style, 
  color = COLORS.status.success,
  ...props 
}) => (
  <Text style={StyleSheet.flatten([styles.success, style])} color={color} {...props} />
);

const styles = StyleSheet.create({
  // Base styles
  base: {
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.text.primary,
    lineHeight: TYPOGRAPHY.size.base * TYPOGRAPHY.lineHeight.normal,
  },

  // Alignment
  center: {
    textAlign: 'center',
  },
  right: {
    textAlign: 'right',
  },

  // Heading styles (mobile-optimized)
  h1: {
    fontSize: TYPOGRAPHY.size['lg'],
    fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: TYPOGRAPHY.size['lg'] * TYPOGRAPHY.lineHeight.tight,
    color: COLORS.text.primary,
  },
  h2: {
    fontSize: TYPOGRAPHY.size['base'],
    fontWeight: TYPOGRAPHY.weight.semibold,
    lineHeight: TYPOGRAPHY.size['base'] * TYPOGRAPHY.lineHeight.tight,
    color: COLORS.text.primary,
  },
  h3: {
    fontSize: TYPOGRAPHY.size['base'],
    fontWeight: TYPOGRAPHY.weight.medium,
    lineHeight: TYPOGRAPHY.size['base'] * TYPOGRAPHY.lineHeight.normal,
    color: COLORS.text.primary,
  },
  h4: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    lineHeight: TYPOGRAPHY.size.sm * TYPOGRAPHY.lineHeight.normal,
    color: COLORS.text.primary,
  },

  // Body text styles
  body: {
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: TYPOGRAPHY.size.base * TYPOGRAPHY.lineHeight.normal,
    color: COLORS.text.primary,
  },

  // Caption style
  caption: {
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: TYPOGRAPHY.size.xs * TYPOGRAPHY.lineHeight.normal,
    color: COLORS.text.secondary,
  },

  // Label style
  label: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    lineHeight: TYPOGRAPHY.size.xs * TYPOGRAPHY.lineHeight.normal,
    color: COLORS.text.primary,
  },

  // Link style
  link: {
    fontSize: TYPOGRAPHY.size.base,
    textDecorationLine: 'underline',
    color: COLORS.primary.main,
  },

  // Status text styles
  error: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.status.error,
  },
  success: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.status.success,
  },
});

// Export type for external use
export type { BaseTextProps };
