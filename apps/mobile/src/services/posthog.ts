/**
 * PostHog Analytics Configuration for EMBREL
 * Official React Native integration with Session Replay
 */

// Export configuration for PostHogProvider
export const posthogConfig = {
  apiKey: process.env['EXPO_PUBLIC_POSTHOG_API_KEY'] || 'phc_4ZVBf2nXfkyz8Ut58DOZeBCI1KqK4mrRYQSqg6iVlUx',
  options: {
    host: process.env['EXPO_PUBLIC_POSTHOG_HOST'] || 'https://us.i.posthog.com',
    
    // Disable session replay for privacy (no screen recording)
    enableSessionReplay: false,
    
    // Capture app lifecycle events automatically
    captureAppLifecycleEvents: true,
    
    // Enable in both dev and production for testing
    disabled: false,
    
    // Personalization
    personProfiles: 'always',
    
    // Debug mode for initial testing
    debug: __DEV__,
  }
};

/**
 * Manual event tracking functions for consistent usage across the app
 * These complement the auto-captured events
 */
export const trackingEvents = {
  // App lifecycle
  appLaunched: () => ({ event: 'app_launched', properties: { timestamp: Date.now() } }),
  
  // Navigation
  navigatedToScanner: () => ({ event: 'navigated_to_scanner', properties: {} }),
  navigatedToSearch: () => ({ event: 'navigated_to_search', properties: {} }),
  
  // Scanner events - NO PERSONAL DATA
  scannerOpened: () => ({ event: 'scanner_opened', properties: { timestamp: Date.now() } }),
  qrScanned: (data: { passenger: string; flight: string; seat: string; seq: string; scanDuration: number }) => ({
    event: 'qr_scanned',
    properties: {
      // NO passenger data, NO seat, NO seq - only anonymous metrics
      scan_duration_ms: data.scanDuration,
      scan_count: 1,
    }
  }),
  qrScanSuccess: (data: { passenger: string; flight: string; seq: string; timeToConfirm: number }) => ({
    event: 'qr_scan_success',
    properties: {
      // Only timing metrics, no identifying information
      time_to_confirm_ms: data.timeToConfirm,
      success_count: 1,
    }
  }),
  qrScanError: (data: { error: string; rawData?: string; flight?: string }) => ({
    event: 'qr_scan_error',
    properties: {
      // Generic error type without personal data
      error_type: data.error.includes('QR') ? 'invalid_qr' : 'scan_error',
      error_count: 1,
    }
  }),
  
  // Boarding events - ANONYMOUS
  boardingConfirmed: (data: { passenger: string; flight: string; seq: string; totalTimeFromScan: number }) => ({
    event: 'boarding_confirmed',
    properties: {
      // Only metrics, no personal or flight data
      total_time_from_scan_ms: data.totalTimeFromScan,
      boarding_count: 1,
    }
  }),
  boardingCancelled: () => ({
    event: 'boarding_cancelled',
    properties: {
      // Generic reason without details
      cancelled_count: 1,
    }
  }),
  
  // Audio events
  audioPlayed: (type: 'success' | 'error' | 'warning') => ({
    event: 'audio_played',
    properties: { type }
  }),
  
  // Search events - ANONYMOUS
  searchPerformed: (resultCount: number) => ({
    event: 'search_performed',
    properties: {
      // No query content, just metrics
      result_count: resultCount,
      search_count: 1,
    }
  }),
  
  // System events
  cameraError: (error: string) => ({
    event: 'camera_error',
    properties: { error }
  }),
  databaseError: (error: string) => ({
    event: 'database_error',
    properties: { error }
  }),
  
  // Performance tracking for 33-minute boarding window
  sessionStats: (data: { totalPassengers: number; sessionDuration: number; averageScanTime: number }) => ({
    event: 'session_stats',
    properties: {
      total_passengers: data.totalPassengers,
      session_duration_ms: data.sessionDuration,
      average_scan_time_ms: data.averageScanTime,
    }
  }),
};

/**
 * User identification for session replay
 * Uses anonymous but consistent ID
 */
export const identifyUser = (userId?: string) => {
  const id = userId || `agent_${Date.now()}`;
  return {
    distinctId: id,
    properties: {
      role: 'traffic_agent',
      location: 'REL_Airport',
      app_version: process.env['EXPO_PUBLIC_APP_VERSION'] || '2.0',
      session_start: new Date().toISOString(),
    }
  };
}; 