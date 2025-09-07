import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { BodyText, ErrorText } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  disabled = false,
  style,
  ...textInputProps
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <BodyText style={styles.label}>{label}</BodyText>
      )}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError,
        disabled && styles.inputContainerDisabled
      ]}>
        {icon && iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        
        <TextInput
          style={[
            styles.input,
            textInputProps.multiline && styles.inputMultiline,
            style
          ]}
          placeholderTextColor={COLORS.text.tertiary}
          editable={!disabled}
          {...textInputProps}
        />
        
        {icon && iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
      
      {error && (
        <ErrorText style={styles.errorText}>{error}</ErrorText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.sm,
    color: COLORS.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.white,
    borderRadius: BORDER_RADIUS.base,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  inputContainerError: {
    borderColor: COLORS.status.error,
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.size.base,
    padding: 0, // Remove default padding
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  iconLeft: {
    marginRight: SPACING.base,
  },
  iconRight: {
    marginLeft: SPACING.base,
  },
  errorText: {
    marginTop: SPACING.xs,
  },
}); 