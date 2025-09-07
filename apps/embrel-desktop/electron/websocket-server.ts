import { WebSocketServer } from 'ws';
import type { Server } from 'http';
import express from 'express';
import cors from 'cors';
import { BrowserWindow } from 'electron';

let wss: WebSocketServer | null = null;
let httpServer: Server | null = null;
let actualPort: number = 8080;

export async function startWebSocketServer(mainWindow: BrowserWindow, startPort = 8080): Promise<{ success: boolean; port?: number; error?: string }> {
  if (wss) {
    console.log('WebSocket server already running');
    return { success: true, port: getServerInfo().port };
  }

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', connected: wss?.clients.size || 0 });
  });

  // HTTP endpoint for simple POST
  app.post('/scan', (req, res) => {
    const data = req.body;
    console.log('Received scan via HTTP:', data);
    
    // Send to renderer
    mainWindow.webContents.send('scan-received', data);
    
    res.json({ success: true });
  });

  // Try multiple ports if the preferred one is occupied
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentPort = startPort + attempt;
    
    try {
      await new Promise<void>((resolve, reject) => {
        httpServer = app.listen(currentPort, () => {
          console.log(`✅ HTTP server started successfully on port ${currentPort}`);
          resolve();
        });
        
        httpServer?.on('error', (err: any) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`❌ Port ${currentPort} is busy, trying next port...`);
            httpServer = null;
            reject(new Error(`Port ${currentPort} busy`));
          } else {
            reject(err);
          }
        });
      });

      // If we get here, the server started successfully
      actualPort = currentPort;
      break;
      
    } catch (error: any) {
      if (error.message.includes('busy') && attempt < maxAttempts - 1) {
        continue; // Try next port
      } else {
        console.error('❌ Failed to start server after all attempts:', error);
        return { success: false, error: `Could not find available port (tried ${startPort}-${startPort + maxAttempts - 1})` };
      }
    }
  }

  if (!httpServer) {
    return { success: false, error: 'Could not start HTTP server' };
  }

  // WebSocket server
  wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    // Notify renderer about connection
    mainWindow.webContents.send('device-connected', { 
      type: 'websocket',
      timestamp: new Date().toISOString()
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received WebSocket message:', data);
        
        // Send to renderer
        mainWindow.webContents.send('scan-received', data);
        
        // Send acknowledgment
        ws.send(JSON.stringify({ success: true, received: data.sequenceNumber }));
      } catch (error) {
        console.error('Error processing message:', error);
        ws.send(JSON.stringify({ success: false, error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      mainWindow.webContents.send('device-disconnected');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({ 
      type: 'welcome', 
      message: 'Connected to EMBREL Desktop' 
    }));
  });

  console.log(`🚀 EMBREL Desktop server ready on port ${actualPort}`);
  return { success: true, port: actualPort };
}

export function stopWebSocketServer() {
  if (wss) {
    wss.clients.forEach(client => client.close());
    wss.close();
    wss = null;
  }
  
  if (httpServer) {
    httpServer.close();
    httpServer = null;
  }
  
  console.log('WebSocket server stopped');
  return { success: true };
}

export function getServerInfo() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  Object.keys(interfaces).forEach(name => {
    interfaces[name]?.forEach((iface: any) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    });
  });

  return {
    port: actualPort,
    addresses,
    connected: wss?.clients.size || 0
  };
}