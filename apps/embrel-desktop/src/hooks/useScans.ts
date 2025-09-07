import { useState, useCallback } from 'react';
import type { ScanData } from '../types/bluetooth';

const MAX_RECENT_SCANS = 20; // Mostrar más en pantalla

export function useScans() {
  const [recentScans, setRecentScans] = useState<ScanData[]>([]);

  const handleIncomingData = useCallback(async (data: ScanData) => {
    // Add to recent scans (keep last 20)
    setRecentScans(prev => [data, ...prev].slice(0, MAX_RECENT_SCANS));
    
    // Type the SEQ number automatically
    if (data.sequenceNumber && window.electronAPI?.keyboard) {
      try {
        await window.electronAPI.keyboard.typeAndEnter(data.sequenceNumber);
        console.log(`✅ Typed SEQ: ${data.sequenceNumber}`);
      } catch (error) {
        console.error('Error typing SEQ:', error);
      }
    }
  }, []);

  const clearHistory = useCallback(() => {
    setRecentScans([]);
  }, []);

  return {
    recentScans,
    handleIncomingData,
    clearHistory,
  };
}