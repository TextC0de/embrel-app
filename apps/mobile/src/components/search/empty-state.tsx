import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { BodyText, Heading2 } from '../ui';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = memo(({
  icon,
  title,
  message,
  children,
}) => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}

      {/* Title */}
      <Heading2 style={styles.title}>
        {title}
      </Heading2>

      {/* Message */}
      <BodyText style={styles.message}>
        {message}
      </BodyText>

      {/* Action Area */}
      {children}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING['4xl'],
    backgroundColor: COLORS.background.light,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: SPACING.base,
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text.primary,
  },
  message: {
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.base,
    marginBottom: SPACING.xl,
    color: COLORS.text.secondary,
  },
}); 