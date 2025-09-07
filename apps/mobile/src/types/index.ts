// Re-export all types from app-state.ts (single source of truth)
export type {
    AppError, AppSettings, DataSession, Flight, PassengerData,
    ScanEvent
} from './app-state';

// QR parsing types
export interface QRParseResult {
  isValid: boolean;
  parsed: import('./app-state').PassengerData | null;
  error?: string;
}

// Audio feedback types
export type SoundType = 'success' | 'error' | 'warning'; 