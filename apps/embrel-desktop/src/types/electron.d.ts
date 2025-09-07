import type { BluetoothDevice, ScanData, BluetoothServerResponse, KeyboardResponse } from './bluetooth';

export interface ElectronAPI {
  getVersion: () => Promise<string>;
  bluetooth: {
    startServer: () => Promise<BluetoothServerResponse>;
    stopServer: () => Promise<{ success: boolean }>;
    getServerInfo?: () => Promise<{ port: number; addresses: string[]; connected: number }>;
    onDeviceConnected: (callback: (device: BluetoothDevice) => void) => () => void;
    onDataReceived: (callback: (data: ScanData) => void) => () => void;
    onDeviceDisconnected?: (callback: () => void) => () => void;
  };
  keyboard: {
    type: (text: string) => Promise<KeyboardResponse>;
    typeAndEnter: (text: string) => Promise<KeyboardResponse>;
  };
  system: {
    minimize: () => void;
    close: () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};