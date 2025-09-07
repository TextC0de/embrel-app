import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';

interface ConnectionControlProps {
  isConnected: boolean;
  isEnabled: boolean;
  connectionStatus: string;
  serverInfo?: {
    port: number;
    addresses: string[];
    connected: number;
  } | undefined;
  onToggle: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectionControl({ 
  isConnected, 
  isEnabled,
  serverInfo,
  onToggle,
}: ConnectionControlProps) {
  const [showQR, setShowQR] = useState(true);
  
  // Detect if running in browser mode
  const isBrowserMode = !window.electronAPI?.bluetooth;
  
  // Debug logging (development only)
  if (import.meta.env?.DEV) {
    console.log('🔍 ConnectionControl props:', { 
      isConnected, 
      isEnabled, 
      hasServerInfo: !!serverInfo,
      isBrowserMode,
    });
  }

  // Development error - should not reach users
  if (isBrowserMode) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-red-400 flex items-center justify-center">
                <span className="text-white text-sm">🚫</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                💻 ERROR DE DESARROLLO
              </h3>
              <p className="text-red-700 mb-4">
                Esta app DEBE ejecutarse en Electron, no en navegador.
              </p>
              
              <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red-800 mb-2">
                  🔧 Ejecutar correctamente:
                </h4>
                <div className="text-sm text-red-700">
                  <code className="bg-red-200 px-2 py-1 rounded font-mono">npm run dev:electron</code>
                </div>
              </div>
              
              <div className="text-xs text-red-600 font-mono">
                Electron API missing - This should never happen in production
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Enhanced Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className={`relative w-4 h-4 rounded-full ${
              isConnected ? 'bg-green-500' : 
              isEnabled ? 'bg-yellow-500' : 'bg-gray-300'
            }`}>
              {isConnected && (
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
              )}
              {isEnabled && !isConnected && (
                <div className="absolute inset-0 rounded-full bg-yellow-500 animate-pulse opacity-50"></div>
              )}
            </div>
            
            <div className="flex flex-col">
              <h2 className={`text-lg font-semibold ${
                isConnected ? 'text-green-700' : 
                isEnabled ? 'text-yellow-700' : 'text-gray-500'
              }`}>
                {isConnected ? '✅ Conectado' : 
                 isEnabled ? '⏳ Servidor activo' : '⏹️ Servidor apagado'}
              </h2>
              <p className="text-sm text-gray-500">
                {isConnected ? '¡Móvil conectado y listo!' : 
                 isEnabled ? 'Copia la URL de abajo para conectar tu móvil' : 
                 'Haz clic en "🚀 Iniciar Servidor" para comenzar'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        {!isEnabled ? (
          <button
            onClick={onToggle}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <span>🚀</span>
            <span className="font-medium">Iniciar Servidor</span>
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="px-8 py-3 bg-red-100 text-red-700 border border-red-200 rounded-lg hover:bg-red-200 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
          >
            <span>⏹️</span>
            <span className="font-medium">Detener Servidor</span>
          </button>
        )}
      </div>

      {/* Server Connection Info - ALWAYS VISIBLE when server is running */}
      {isEnabled && serverInfo && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                  <span className="text-white text-xs">📱</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  Conecta tu móvil escaneando el QR o copiando la URL:
                </h3>
                
                {/* Toggle between QR and URL view */}
                <div className="flex space-x-2 mb-3">
                  <button
                    onClick={() => setShowQR(true)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      showQR 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    Código QR
                  </button>
                  <button
                    onClick={() => setShowQR(false)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      !showQR 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    URL Manual
                  </button>
                </div>

                {/* QR Code View */}
                {showQR ? (
                  <div className="bg-white p-4 rounded-lg border border-blue-200 flex flex-col items-center">
                    <QRCodeCanvas
                      value={`EMBREL_CONNECT:http://${serverInfo.addresses[0]}:${serverInfo.port}`}
                      size={200}
                      level="M"
                      marginSize={2}
                      className="border-4 border-white shadow-lg"
                    />
                    <p className="mt-3 text-xs text-blue-700 text-center">
                      Escanea con la app móvil EMBREL
                    </p>
                  </div>
                ) : (
                  /* URL List View */
                  <div className="space-y-2">
                    {serverInfo.addresses.map((addr, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-2 bg-white rounded border border-blue-200">
                        <code className="text-base font-mono text-blue-900 flex-1 select-all">
                          http://{addr}:{serverInfo.port}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`http://${addr}:${serverInfo.port}`);
                            // Could add toast notification here
                          }}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          title="Copiar URL"
                        >
                          Copiar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800 flex items-center">
                    <span className="mr-1">⚠️</span>
                    Ambos dispositivos deben estar en la misma red WiFi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}