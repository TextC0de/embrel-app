import { Video, ResizeMode } from 'expo-av';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { BodyText, Heading1 } from '../ui';
import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

const videoSource = require('../../../assets/video/video-emberl-caminando.mp4');

interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * Splash Screen with EMBREL logo and walking animation
 * Shows for 3-4 seconds with fade transitions
 */
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // Start visible immediately - no fade in delay
    fadeAnim.setValue(1);

    // Fallback timer in case video doesn't load
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 2500);

    return () => clearTimeout(fallbackTimer);
  }, []);

  const handleVideoEnd = () => {
    // Wait a bit after video ends, then fade out
    setTimeout(() => {
      handleFinish();
    }, 500);
  };

  const handleFinish = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Logo and Title */}
        <View style={styles.logoContainer}>
          <Video
            ref={videoRef}
            source={videoSource}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping={false}
            isMuted
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinish) {
                handleVideoEnd();
              }
            }}
          />
          <Heading1 style={styles.title}>EMBREL</Heading1>
          <BodyText style={styles.subtitle}>
            Embarque Rápido y Eficiente
          </BodyText>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  video: {
    width: 80,
    height: 80,
    marginBottom: SPACING.base,
  },
  title: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.primary.main,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});