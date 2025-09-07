import { usePostHog } from 'posthog-react-native';
import { trackingEvents } from '../services/posthog';

/**
 * Custom hook for anonymous analytics tracking
 * Wraps PostHog with our privacy-focused event definitions
 */
export function useAnalytics() {
  const posthog = usePostHog();

  return {
    // App lifecycle
    trackAppLaunched: () => {
      const event = trackingEvents.appLaunched();
      posthog?.capture(event.event, event.properties);
    },

    // Navigation
    trackNavigatedToScanner: () => {
      const event = trackingEvents.navigatedToScanner();
      posthog?.capture(event.event, event.properties);
    },

    trackNavigatedToSearch: () => {
      const event = trackingEvents.navigatedToSearch();
      posthog?.capture(event.event, event.properties);
    },

    // Scanner events - ANONYMOUS
    trackScannerOpened: () => {
      const event = trackingEvents.scannerOpened();
      posthog?.capture(event.event, event.properties);
    },

    trackQRScanned: (scanDuration: number) => {
      // Note: We don't pass passenger data anymore
      const event = trackingEvents.qrScanned({
        passenger: '', // Not used
        flight: '', // Not used
        seat: '', // Not used
        seq: '', // Not used
        scanDuration
      });
      posthog?.capture(event.event, event.properties);
    },

    trackQRScanSuccess: (timeToConfirm: number) => {
      const event = trackingEvents.qrScanSuccess({
        passenger: '', // Not used
        flight: '', // Not used
        seq: '', // Not used
        timeToConfirm
      });
      posthog?.capture(event.event, event.properties);
    },

    trackQRScanError: (errorType: string) => {
      const event = trackingEvents.qrScanError({
        error: errorType
      });
      posthog?.capture(event.event, event.properties);
    },

    // Boarding events - ANONYMOUS
    trackBoardingConfirmed: (totalTimeFromScan: number) => {
      const event = trackingEvents.boardingConfirmed({
        passenger: '', // Not used
        flight: '', // Not used
        seq: '', // Not used
        totalTimeFromScan
      });
      posthog?.capture(event.event, event.properties);
    },

    trackBoardingCancelled: () => {
      const event = trackingEvents.boardingCancelled();
      posthog?.capture(event.event, event.properties);
    },

    // Audio events
    trackAudioPlayed: (type: 'success' | 'error' | 'warning') => {
      const event = trackingEvents.audioPlayed(type);
      posthog?.capture(event.event, event.properties);
    },

    // Search events - ANONYMOUS
    trackSearchPerformed: (resultCount: number) => {
      const event = trackingEvents.searchPerformed(resultCount);
      posthog?.capture(event.event, event.properties);
    },

    // System events
    trackCameraError: (error: string) => {
      const event = trackingEvents.cameraError(error);
      posthog?.capture(event.event, event.properties);
    },

    trackDatabaseError: (error: string) => {
      const event = trackingEvents.databaseError(error);
      posthog?.capture(event.event, event.properties);
    },

    // Session stats - ANONYMOUS
    trackSessionStats: (totalPassengers: number, sessionDuration: number, averageScanTime: number) => {
      const event = trackingEvents.sessionStats({
        totalPassengers,
        sessionDuration,
        averageScanTime
      });
      posthog?.capture(event.event, event.properties);
    },

    // Generic event capture for custom events
    capture: (eventName: string, properties?: Record<string, any>) => {
      // Filter out any personal data if accidentally included
      const safeProperties = properties ? {
        ...properties,
        // Remove common personal data fields
        passenger: undefined,
        name: undefined,
        pnr: undefined,
        seat: undefined,
        seq: undefined,
        email: undefined,
        phone: undefined,
      } : {};
      
      posthog?.capture(eventName, safeProperties);
    }
  };
}