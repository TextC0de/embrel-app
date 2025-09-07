import { useGlobalSearchParams } from 'expo-router';
import React from 'react';
import { PassengerListView } from '../../../components/passengers/passenger-list-view';

/**
 * Session Search Screen - Passenger search within a specific session
 * TODO: Migrate PassengerListView component from bin/src/components
 */
export default function SearchPage() {
  const { sessionId } = useGlobalSearchParams<{ sessionId: string }>();
  
  console.log('🔍 [SearchPage] sessionId from params:', sessionId);
  
  if (!sessionId || typeof sessionId !== 'string') {
    console.error('❌ [SearchPage] Invalid sessionId:', sessionId);
    return null;
  }

  return (
    <PassengerListView sessionId={sessionId} />
  );
} 