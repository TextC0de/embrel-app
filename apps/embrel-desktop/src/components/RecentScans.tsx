import type { ScanData } from '../types/bluetooth';

interface RecentScansProps {
  scans: ScanData[];
  onClear: () => void;
  totalCount: number;
}

export function RecentScans({ scans, onClear, totalCount }: RecentScansProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Códigos escaneados</h2>
            {totalCount > 0 && (
              <p className="text-sm text-gray-500">Total: {totalCount}</p>
            )}
          </div>
          {scans.length > 0 && (
            <button
              onClick={onClear}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {scans.length === 0 ? (
          <EmptyState />
        ) : (
          scans.map((scan, index) => (
            <ScanItem key={`${scan.timestamp}-${index}`} scan={scan} />
          ))
        )}
      </div>
    </div>
  );
}

function ScanItem({ scan }: { scan: ScanData }) {
  return (
    <div className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="text-2xl font-bold text-blue-600">
          {scan.sequenceNumber}
        </div>
        <div>
          {scan.passengerName && (
            <p className="text-sm font-medium text-gray-900">{scan.passengerName}</p>
          )}
          <p className="text-xs text-gray-500">
            {new Date(scan.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
      <span className="text-green-600">
        ✓
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-6 py-12 text-center">
      <svg 
        className="w-12 h-12 text-gray-300 mx-auto mb-3" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
        />
      </svg>
      <p className="text-gray-500">No hay escaneos recientes</p>
      <p className="text-sm text-gray-400 mt-1">Los códigos escaneados aparecerán aquí</p>
    </div>
  );
}