import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { createShadow } from '../../utils/styleHelpers';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (!isDisabled && onPress) {
      onPress();
    }
  };

  const containerStyles = StyleSheet.flatten([
    styles.button,
    !isDisabled && styles[`${variant}Button`],
    isDisabled && styles.disabledButton,
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    style
  ].filter(Boolean)) as ViewStyle;

  const textStyles = StyleSheet.flatten([
    styles.buttonText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText
  ].filter(Boolean)) as TextStyle;

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={getActivityIndicatorColor(variant)}
        />
      );
    }

    return (
      <View style={styles.contentContainer}>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        <Text style={textStyles}>{children}</Text>
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={containerStyles}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const getActivityIndicatorColor = (variant: string): string => {
  switch (variant) {
    case 'outline':
    case 'ghost':
      return COLORS.text.secondary;
    default:
      return COLORS.text.inverse;
  }
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: BORDER_RADIUS.base,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  // Content container
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Icon positioning
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },

  // Variant styles
  primaryButton: {
    backgroundColor: COLORS.primary.main,
    ...createShadow(2, COLORS.primary.main, 0.3),
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary.main,
    ...createShadow(2, COLORS.secondary.main, 0.3),
  },
  successButton: {
    backgroundColor: COLORS.status.success,
    ...createShadow(2, COLORS.status.success, 0.3),
  },
  dangerButton: {
    backgroundColor: COLORS.status.error,
    ...createShadow(2, COLORS.status.error, 0.3),
  },
  warningButton: {
    backgroundColor: COLORS.status.warning,
    ...createShadow(2, COLORS.status.warning, 0.3),
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.border.default,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },

  // Size styles
  smButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 32,
  },
  mdButton: {
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.lg,
    minHeight: 40,
  },
  lgButton: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    minHeight: 48,
  },

  // Text styles
  buttonText: {
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },

  // Text variant styles
  primaryText: {
    color: COLORS.text.inverse,
  },
  secondaryText: {
    color: COLORS.text.inverse,
  },
  successText: {
    color: COLORS.text.inverse,
  },
  dangerText: {
    color: COLORS.text.inverse,
  },
  warningText: {
    color: COLORS.text.inverse,
  },
  outlineText: {
    color: COLORS.text.primary,
  },
  ghostText: {
    color: COLORS.text.primary,
  },

  // Text size styles
  smText: {
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: TYPOGRAPHY.size.xs * 1.4,
  },
  mdText: {
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: TYPOGRAPHY.size.sm * 1.4,
  },
  lgText: {
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: TYPOGRAPHY.size.base * 1.4,
  },

  // Disabled button style
  disabledButton: {
    backgroundColor: COLORS.border.dark,
  },

  // State styles
  fullWidth: {
    width: '100%',
  },
  disabledText: {
    color: COLORS.text.secondary,
  },
}); 