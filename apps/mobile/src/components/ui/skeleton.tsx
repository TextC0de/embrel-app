import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING } from '../../constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Skeleton loading component with shimmer animation
 */
export function Skeleton({ width = '100%', height = 20, borderRadius = BORDER_RADIUS.sm, style }: SkeletonProps) {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerValue]);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

/**
 * Skeleton for flight cards
 */
export function FlightCardSkeleton() {
  return (
    <View style={styles.flightCardSkeleton}>
      <View style={styles.flightCardContent}>
        <View style={styles.flightInfo}>
          <Skeleton width="60%" height={18} style={{ marginBottom: SPACING.xs }} />
          <Skeleton width="40%" height={14} />
        </View>
        <View style={styles.flightAction}>
          <Skeleton width={100} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border.light,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    position: 'absolute',
  },
  flightCardSkeleton: {
    backgroundColor: COLORS.background.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  flightCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  flightInfo: {
    flex: 1,
  },
  flightAction: {
    alignItems: 'flex-end',
  },
});