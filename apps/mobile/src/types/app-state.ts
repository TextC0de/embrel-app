/**
 * EMBREL - Core Type Definitions
 * Clean and simple type system for the migrated app
 */

// Base types
export interface Flight {
  id?: string; 
  flightNumber: string;
  route: string;
  date: string;
  time: string;
  description?: string;
}

export interface PassengerData {
  id: string;
  passenger: string;
  pnr: string;
  route: string;
  flight: string;
  seat: string;
  seq: string;
  timestamp: number;
  rawData?: string;
  sessionId?: string;
}

export interface ScanEvent {
  id: string;
  timestamp: number;
  type: 'success' | 'error' | 'duplicate';
  passengerSeq?: string;
  errorMessage?: string;
  scanDuration: number;
  sessionId: string;
}

export interface AppError {
  id: string;
  timestamp: number;
  type: 'scan' | 'database' | 'camera' | 'audio' | 'network' | 'system';
  message: string;
  context?: string;
  resolved: boolean;
}

export interface DataSession {
  id: string;
  flight: Flight;
  status: 'ready' | 'active' | 'completed' | 'archived';
  createdAt: number;
  updatedAt: number;
  totalPassengers?: number;
  flightNumber?: string;
  flightRoute?: string;
  flightDate?: string;
  flightTime?: string;
  passengers?: PassengerData[];
  scanEvents?: ScanEvent[];
  startTime?: Date;
  endTime?: Date;
  metadata?: {
    totalScans: number;
    successfulScans: number;
    errorCount: number;
    averageScanTime: number;
    lastActivity: Date;
  };
}

// App settings - simplified from original
export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  keepScreenOn: boolean;
  autoBackup: boolean;
  debugMode: boolean;
  desktopModeEnabled: boolean;
} 