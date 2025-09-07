import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { db } from '@/db';
import { PostHogProvider } from 'posthog-react-native';
import migrations from '../../drizzle/migrations';
import { SplashScreen } from '../components/splash';

// PostHog configuration - disable linting for optional analytics
// eslint-disable-next-line expo/no-dynamic-env-var
const postHogApiKey = process.env['EXPO_PUBLIC_POSTHOG_API_KEY'];
// eslint-disable-next-line expo/no-dynamic-env-var
const postHogHost = process.env['EXPO_PUBLIC_POSTHOG_HOST'] || 'https://us.i.posthog.com';

/**
 * Root layout component for EMBREL app
 * Handles database migrations, React Query, and navigation
 * Following Expo Router and Drizzle best practices
 * No dark/light mode - using simple light theme only
 */
export default function RootLayout() {
  // Use the official Drizzle useMigrations hook - this is the recommended approach
  const { success, error } = useMigrations(db, migrations);
  
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);

  // Stable query client to prevent recreation loops
  const queryClient = useMemo(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 10, // 10 minutes instead of Infinity
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          retry: false,
          gcTime: 1000 * 60 * 30, // 30 minutes
          refetchInterval: false, // Disable automatic refetching
          refetchIntervalInBackground: false,
        },
        mutations: {
          retry: false,
          networkMode: 'offlineFirst', // Prevent network-related re-renders
        },
      },
    });
  }, []);

  // Handle migration or font loading errors
  useEffect(() => {
    if (error) {
      console.error('Database migration failed:', error);
    }
  }, [error]);

  // Show migration error
  if (error) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
          <Text style={{ fontSize: 16, color: '#ef4444', textAlign: 'center' }}>
            Error de migración de base de datos: {error.message}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }}>
            Por favor reinicia la app
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show loading until migration is complete
  if (!success) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
          <Text style={{ fontSize: 16, color: '#6b7280' }}>Inicializando EMBREL...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Show splash screen on first load
  if (showSplash && success) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  // Conditionally render PostHog to prevent initialization issues
  if (!postHogApiKey) {
    return  <SafeAreaProvider>
    <QueryClientProvider client={queryClient}>
      {/* Simple navigation without theme provider - light theme only */}
      <Stack
        screenOptions={{
          headerShown: false,
          animationTypeForReplace: 'push',
          animation: 'default',
          gestureEnabled: true,
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="create-flight" options={{ title: "Crear Vuelo" }} />
        <Stack.Screen name="session/[sessionId]" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="dark" />
    </QueryClientProvider>
  </SafeAreaProvider>
  }

  return (
    <PostHogProvider 
      apiKey={postHogApiKey} 
      options={{
        host: postHogHost,
        enableSessionReplay: false,
        captureAppLifecycleEvents: false,
        disabled: false,
      }}
    >
       <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        {/* Simple navigation without theme provider - light theme only */}
        <Stack
          screenOptions={{
            headerShown: false,
            animationTypeForReplace: 'push',
            animation: 'default',
            gestureEnabled: true,
            animationDuration: 300,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="create-flight" options={{ title: "Crear Vuelo" }} />
          <Stack.Screen name="session/[sessionId]" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </QueryClientProvider>
    </SafeAreaProvider>
    </PostHogProvider>
  );
}
