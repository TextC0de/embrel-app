import { app, BrowserWindow, ipcMain, shell } from 'electron';
import isDev from 'electron-is-dev';
import path from 'node:path';
import { startWebSocketServer, stopWebSocketServer, getServerInfo } from './websocket-server';

let mainWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// Using dynamic import for optional dependency
const checkSquirrelStartup = async () => {
  if (process.platform === 'win32') {
    try {
      // @ts-expect-error - Optional dependency that may not be installed
      const squirrelStartup = await import('electron-squirrel-startup');
      if (squirrelStartup.default) {
        app.quit();
      }
    } catch {
      // Squirrel not installed, continue normally
    }
  }
};

void checkSquirrelStartup();

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../public/icon.png'),
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
  });

  // Load the app
  console.log('🔍 isDev:', isDev);
  if (isDev) {
    console.log('🌐 Loading development URL: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
    console.log('🔧 DevTools opened');
  } else {
    console.log('📦 Loading production file');
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Add more debugging for page load events
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('📄 Started loading page');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Finished loading page');
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.log('❌ Failed to load page:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('🏗️ DOM ready');
  });

  // Open URLs in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });
};

// Create system tray
const createTray = () => {
  // TODO: Add icon.png to public/ folder
  // For now, skip tray creation to avoid errors
  console.log('Tray creation skipped - add icon.png to public/ folder');
  return;
  
  // tray = new Tray(path.join(__dirname, '../public/icon.png'));
  // 
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Mostrar', click: () => mainWindow?.show() },
  //   { label: 'Ocultar', click: () => mainWindow?.hide() },
  //   { type: 'separator' },
  //   { label: 'Salir', click: () => app.quit() }
  // ]);
  // 
  // tray.setToolTip('EMBREL Desktop');
  // tray.setContextMenu(contextMenu);
  // 
  // tray.on('click', () => {
  //   mainWindow?.show();
  // });
};

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  console.log('🚀 Electron app ready');
  console.log('🖥️ Creating main window');
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for communication with renderer
ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// WebSocket server handlers
ipcMain.handle('bluetooth:start-server', async () => {
  if (!mainWindow) return { success: false, message: 'Window not ready' };
  
  try {
    const result = await startWebSocketServer(mainWindow, 8080);
    if (result.success && result.port) {
      const info = getServerInfo();
      return { 
        success: true, 
        message: `✅ Servidor activo en puerto ${result.port}`,
        serverInfo: info
      };
    } else {
      return { 
        success: false, 
        message: result.error || 'Error desconocido al iniciar servidor'
      };
    }
  } catch (error: any) {
    console.error('Error starting WebSocket server:', error);
    return { 
      success: false, 
      message: `❌ Error: ${error.message || 'No se pudo iniciar el servidor'}`
    };
  }
});

ipcMain.handle('bluetooth:stop-server', async () => {
  return stopWebSocketServer();
});

ipcMain.handle('bluetooth:get-server-info', async () => {
  return getServerInfo();
});

// Keyboard typing handlers using robotjs
ipcMain.handle('keyboard:type', async (_event, text: string) => {
  try {
    const robot = require('robotjs');
    console.log('⌨️ Typing:', text);
    
    // Type the text
    robot.typeString(text);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error typing:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

ipcMain.handle('keyboard:type-and-enter', async (_event, text: string) => {
  try {
    const robot = require('robotjs');
    console.log('⌨️ Typing and Enter:', text);
    
    // Type the text
    robot.typeString(text);
    
    // Small delay before pressing Enter
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Press Enter
    robot.keyTap('enter');
    
    console.log('✅ Typed and pressed Enter');
    return { success: true };
  } catch (error) {
    console.error('❌ Error typing and entering:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
});

export {};