import { useGlobalSearchParams } from 'expo-router';
import React from 'react';
import { ScannerView } from '../../../components/scanner/scanner-view';

/**
 * Session Scan Screen - Scanner within a specific session
 * TODO: Migrate ScannerView component from bin/src/components
 */
export default function ScanPage() {
  const { sessionId } = useGlobalSearchParams<{ sessionId: string }>();
  
  console.log('📷 [ScanPage] sessionId from params:', sessionId);
  
  if (!sessionId || typeof sessionId !== 'string') {
    console.error('❌ [ScanPage] Invalid sessionId:', sessionId);
    
    return null;
  }

  return (
    <ScannerView sessionId={sessionId} />
  );
} 