interface HeaderProps {
  isConnected: boolean;
  connectionStatus: string;
}

export function Header({ isConnected }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">EMBREL Desktop</h1>
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isConnected ? 'Conectado' : 'Sin conexión'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}