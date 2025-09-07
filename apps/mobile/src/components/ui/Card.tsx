import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING } from '../../constants/theme';
import { createShadow } from '../../utils/styleHelpers';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof SPACING;
  style?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'base',
  style,
  ...props
}) => {
  const cardStyles = StyleSheet.flatten([
    styles.card,
    styles[`${variant}Card`],
    { padding: SPACING[padding] },
    style
  ].filter(Boolean)) as ViewStyle;

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
};

// Card header component
interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  style,
  ...props
}) => (
  <View style={StyleSheet.flatten([styles.header, style])} {...props}>
    {children}
  </View>
);

// Card content component
interface CardContentProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  style,
  ...props
}) => (
  <View style={StyleSheet.flatten([styles.content, style])} {...props}>
    {children}
  </View>
);

// Card footer component
interface CardFooterProps extends ViewProps {
  children: React.ReactNode;
  style?: any;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  style,
  ...props
}) => (
  <View style={StyleSheet.flatten([styles.footer, style])} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  // Base card styles
  card: {
    backgroundColor: COLORS.background.white,
    borderRadius: BORDER_RADIUS.base,
  },

  // Card variants
  defaultCard: {
    ...createShadow(1),
  },
  elevatedCard: {
    ...createShadow(4),
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowOpacity: 0, // Remove shadow for outlined cards
    elevation: 0,
  },

  // Card sections
  header: {
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
}); 