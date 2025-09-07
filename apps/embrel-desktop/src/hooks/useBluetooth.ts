import { useState, useEffect, useCallback } from 'react';
import type { BluetoothDevice, ScanData } from '../types/bluetooth';

export interface BluetoothState {
  isConnected: boolean;
  isListening: boolean;
  isEnabled: boolean;
  connectionStatus: string;
  activeDevices: number;
  serverInfo?: {
    port: number;
    addresses: string[];
    connected: number;
  };
}

export function useBluetooth(onDataReceived: (data: ScanData) => void) {
  const [state, setState] = useState<BluetoothState>({
    isConnected: false,
    isListening: false,
    isEnabled: false,
    connectionStatus: 'Modo Desktop desactivado',
    activeDevices: 0,
  });

  const startServer = useCallback(async () => {
    if (!window.electronAPI?.bluetooth) {
      setState(prev => ({ ...prev, connectionStatus: 'API no disponible' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, connectionStatus: 'Iniciando servidor Bluetooth...' }));
      const result = await window.electronAPI.bluetooth.startServer();
      
      if (result.success) {
        const serverInfo = result.serverInfo || await window.electronAPI.bluetooth.getServerInfo?.();
        setState(prev => ({ 
          ...prev, 
          isListening: true, 
          connectionStatus: `Servidor activo en puerto ${serverInfo?.port || 8080}`,
          ...(serverInfo && { serverInfo })
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          connectionStatus: 'Error al iniciar Bluetooth' 
        }));
      }
    } catch (error) {
      console.error('Error starting Bluetooth:', error);
      setState(prev => ({ 
        ...prev, 
        connectionStatus: 'Error al iniciar Bluetooth' 
      }));
    }
  }, []);

  const stopServer = useCallback(async () => {
    if (!window.electronAPI?.bluetooth) return;
    
    try {
      await window.electronAPI.bluetooth.stopServer();
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        isListening: false,
        connectionStatus: 'Desconectado',
        activeDevices: 0
      }));
    } catch (error) {
      console.error('Error stopping Bluetooth:', error);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    setState(prev => {
      const newEnabled = !prev.isEnabled;
      if (!newEnabled) {
        // Si desactivamos, desconectar
        void stopServer();
        return {
          ...prev,
          isEnabled: false,
          isConnected: false,
          isListening: false,
          connectionStatus: 'Modo Desktop desactivado',
          activeDevices: 0
        };
      } else {
        // Si activamos, preparar para conexión
        void startServer();
        return {
          ...prev,
          isEnabled: true,
          connectionStatus: 'Preparando conexión...'
        };
      }
    });
  }, [startServer, stopServer]);

  useEffect(() => {
    if (!window.electronAPI?.bluetooth) {
      console.warn('Electron API not available - running in browser mode');
      return;
    }

    // Set up device connection listener
    const unsubscribeDevice = window.electronAPI.bluetooth.onDeviceConnected((device: BluetoothDevice) => {
      console.log('Device connected:', device);
      setState(prev => ({ 
        ...prev, 
        isConnected: true,
        connectionStatus: `Conectado desde móvil`,
        activeDevices: prev.activeDevices + 1 
      }));
    });
    
    // Set up disconnection listener
    const unsubscribeDisconnect = window.electronAPI.bluetooth.onDeviceDisconnected?.(() => {
      setState(prev => ({ 
        ...prev, 
        isConnected: false,
        connectionStatus: prev.isListening ? 'Esperando conexión...' : 'Desconectado',
        activeDevices: Math.max(0, prev.activeDevices - 1)
      }));
    });

    // Set up data received listener
    const unsubscribeData = window.electronAPI.bluetooth.onDataReceived((data: ScanData) => {
      console.log('Data received:', data);
      onDataReceived(data);
    });

    // No auto-start - wait for user to enable
    // Cleanup on unmount
    return () => {
      unsubscribeDevice();
      unsubscribeData();
      unsubscribeDisconnect?.();
      void stopServer();
    };
  }, [onDataReceived, stopServer]);

  return {
    ...state,
    startServer,
    stopServer,
    toggleEnabled
  };
}