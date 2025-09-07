import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { BodyText } from './Text';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  return (
    <View style={[
      styles.badge,
      styles[variant],
      styles[size],
      style
    ]}>
      <BodyText style={[
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`]
      ]}>
        {children}
      </BodyText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Variants
  primary: {
    backgroundColor: COLORS.primary.main,
  },
  secondary: {
    backgroundColor: COLORS.secondary.main,
  },
  success: {
    backgroundColor: COLORS.status.success,
  },
  warning: {
    backgroundColor: COLORS.status.warning,
  },
  error: {
    backgroundColor: COLORS.status.error,
  },
  info: {
    backgroundColor: '#3B82F6', // blue-500
  },
  
  // Sizes
  sm: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  md: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  lg: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
  },
  
  // Text styles
  text: {
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  primaryText: {
    color: COLORS.primary.contrast,
  },
  secondaryText: {
    color: COLORS.secondary.contrast,
  },
  successText: {
    color: COLORS.text.inverse,
  },
  warningText: {
    color: COLORS.text.inverse,
  },
  errorText: {
    color: COLORS.text.inverse,
  },
  infoText: {
    color: COLORS.text.inverse,
  },
  
  // Text sizes
  smText: {
    fontSize: TYPOGRAPHY.size.xs,
  },
  mdText: {
    fontSize: TYPOGRAPHY.size.sm,
  },
  lgText: {
    fontSize: TYPOGRAPHY.size.base,
  },
}); 