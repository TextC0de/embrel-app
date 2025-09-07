export interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  connected: boolean;
}

export interface ScanData {
  sequenceNumber: string;
  passengerName?: string;
  flightNumber?: string;
  seatNumber?: string;
  timestamp: string;
  rawData?: string;
}

export interface BluetoothServerResponse {
  success: boolean;
  message?: string;
  error?: string;
  serverInfo?: {
    port: number;
    addresses: string[];
    connected: number;
  };
}

export interface KeyboardResponse {
  success: boolean;
  error?: string;
}