import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';

// Define types for Bluetooth data
interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  connected: boolean;
}

interface ScanData {
  sequenceNumber: string;
  passengerName?: string;
  flightNumber?: string;
  seatNumber?: string;
  timestamp: string;
  rawData?: string;
}

// Log that preload script is loading
console.log('🔌 Preload script loading...');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  bluetooth: {
    startServer: () => ipcRenderer.invoke('bluetooth:start-server'),
    stopServer: () => ipcRenderer.invoke('bluetooth:stop-server'),
    getServerInfo: () => ipcRenderer.invoke('bluetooth:get-server-info'),
    onDeviceConnected: (callback: (device: BluetoothDevice) => void) => {
      const listener = (_event: IpcRendererEvent, device: BluetoothDevice) => callback(device);
      ipcRenderer.on('device-connected', listener);
      return () => ipcRenderer.removeListener('device-connected', listener);
    },
    onDataReceived: (callback: (data: ScanData) => void) => {
      const listener = (_event: IpcRendererEvent, data: ScanData) => callback(data);
      ipcRenderer.on('scan-received', listener);
      return () => ipcRenderer.removeListener('scan-received', listener);
    },
    onDeviceDisconnected: (callback: () => void) => {
      const listener = () => callback();
      ipcRenderer.on('device-disconnected', listener);
      return () => ipcRenderer.removeListener('device-disconnected', listener);
    },
  },
  
  keyboard: {
    type: (text: string) => ipcRenderer.invoke('keyboard:type', text),
    typeAndEnter: (text: string) => ipcRenderer.invoke('keyboard:type-and-enter', text),
  },
  
  system: {
    minimize: () => ipcRenderer.send('window:minimize'),
    close: () => ipcRenderer.send('window:close'),
  }
});

console.log('✅ ElectronAPI exposed to window object');

// Export types for use in other files
export type { BluetoothDevice, ScanData };