import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DesktopConnection {
  url: string;
  lastConnected: string;
  name?: string;
}

type ConnectionListener = (connected: boolean) => void;

class DesktopConnectionService {
  private wsConnection: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connectionListeners: Set<ConnectionListener> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private currentUrl: string | null = null;
  
  async getStoredConnection(): Promise<DesktopConnection | null> {
    try {
      const stored = await AsyncStorage.getItem('desktop_connection');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  
  async saveConnection(url: string, name?: string): Promise<void> {
    const connection: DesktopConnection = {
      url,
      lastConnected: new Date().toISOString(),
      ...(name && { name })
    };
    await AsyncStorage.setItem('desktop_connection', JSON.stringify(connection));
  }
  
  async clearConnection(): Promise<void> {
    await AsyncStorage.removeItem('desktop_connection');
    this.disconnect();
  }
  
  // Add listener for connection state changes
  addConnectionListener(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.connectionListeners.delete(listener);
    };
  }
  
  private notifyListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }
  
  connectWebSocket(url: string, onConnect?: () => void, onError?: (error: string) => void): void {
    try {
      // Store current URL for reconnection
      this.currentUrl = url;
      
      // Clean up existing connection
      if (this.wsConnection) {
        this.wsConnection.close();
        this.wsConnection = null;
      }
      
      // Convert HTTP URL to WebSocket URL
      const wsUrl = url.replace('http://', 'ws://').replace('https://', 'wss://');
      
      this.wsConnection = new WebSocket(wsUrl);
      
      this.wsConnection.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0; // Reset attempts on successful connection
        console.log('Connected to desktop');
        this.notifyListeners(true);
        onConnect?.();
      };
      
      this.wsConnection.onclose = () => {
        this.isConnected = false;
        console.log('Disconnected from desktop');
        this.notifyListeners(false);
        
        // Auto-reconnect with backoff
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentUrl) {
          this.reconnectAttempts++;
          const delay = Math.min(5000 * this.reconnectAttempts, 30000); // Max 30 seconds
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
          
          this.reconnectTimeout = setTimeout(() => {
            if (!this.isConnected && this.currentUrl) {
              this.connectWebSocket(this.currentUrl);
            }
          }, delay);
        }
      };
      
      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        // Only call onError for initial connection, not reconnects
        if (this.reconnectAttempts === 0) {
          onError?.('Error de conexión');
        }
      };
      
      this.wsConnection.onmessage = (event) => {
        console.log('Message from desktop:', event.data);
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      this.notifyListeners(false);
      onError?.('No se pudo conectar');
    }
  }
  
  async sendScanData(data: {
    sequenceNumber: string;
    passengerName?: string;
    flightNumber?: string;
    seatNumber?: string;
  }): Promise<boolean> {
    const scanData = {
      ...data,
      timestamp: new Date().toISOString(),
      source: 'mobile'
    };
    
    // Try WebSocket first
    if (this.wsConnection && this.isConnected) {
      try {
        this.wsConnection.send(JSON.stringify(scanData));
        return true;
      } catch (error) {
        console.error('WebSocket send failed:', error);
      }
    }
    
    // Fallback to HTTP POST
    const connection = await this.getStoredConnection();
    if (connection) {
      try {
        const response = await fetch(`${connection.url}/scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(scanData),
        });
        
        return response.ok;
      } catch (error) {
        console.error('HTTP send failed:', error);
        return false;
      }
    }
    
    return false;
  }
  
  disconnect(): void {
    // Clear current URL to prevent reconnection
    this.currentUrl = null;
    this.reconnectAttempts = 0;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.wsConnection) {
      this.isConnected = false;
      this.wsConnection.close();
      this.wsConnection = null;
      this.notifyListeners(false);
    }
  }
  
  // Reconnect manually (resets attempt counter)
  reconnect(): void {
    if (this.currentUrl) {
      this.reconnectAttempts = 0;
      this.connectWebSocket(this.currentUrl);
    }
  }
  
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
  
  async testConnection(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const desktopConnection = new DesktopConnectionService();