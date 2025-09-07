import { Header } from './components/Header';
import { ConnectionControl } from './components/ConnectionControl';
import { RecentScans } from './components/RecentScans';
import { useBluetooth } from './hooks/useBluetooth';
import { useScans } from './hooks/useScans';

function App() {
  const { recentScans, handleIncomingData, clearHistory } = useScans();
  const bluetoothState = useBluetooth(handleIncomingData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header 
        isConnected={bluetoothState.isConnected}
        connectionStatus={bluetoothState.connectionStatus}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Control */}
        <ConnectionControl
          isConnected={bluetoothState.isConnected}
          isEnabled={bluetoothState.isEnabled}
          connectionStatus={bluetoothState.connectionStatus}
          serverInfo={bluetoothState.serverInfo}
          onToggle={bluetoothState.toggleEnabled}
          onConnect={bluetoothState.startServer}
          onDisconnect={bluetoothState.stopServer}
        />
        
        {/* Recent Scans */}
        <RecentScans 
          scans={recentScans}
          onClear={clearHistory}
          totalCount={recentScans.length}
        />
      </main>
    </div>
  );
}

export default App;