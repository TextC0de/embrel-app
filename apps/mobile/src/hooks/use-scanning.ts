import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useSession, useUpdateSessionStatus } from './use-sessions';
import { useAddPassenger } from './use-passengers';
import { PassengerData } from '../types';

/**
 * Hook for scanning operations
 */
export function useScanning() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [isScanning, setIsScanning] = useState(false);
  const { data: currentSession } = useSession(sessionId);
  const updateSessionStatusMutation = useUpdateSessionStatus();
  const addPassengerMutation = useAddPassenger();

  const startScanning = async () => {
    if (currentSession && currentSession.status === 'ready') {
      try {
        await updateSessionStatusMutation.mutateAsync({
          sessionId: currentSession.id,
          status: 'active'
        });
        setIsScanning(true);
      } catch (error) {
        console.error('Error starting scanning:', error);
        throw error;
      }
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const addPassenger = async (passenger: PassengerData) => {
    if (currentSession) {
      try {
        await addPassengerMutation.mutateAsync({
          passenger,
          sessionId: currentSession.id
        });
      } catch (error) {
        console.error('Error adding passenger:', error);
        throw error;
      }
    }
  };

  const canStartScanning = currentSession && currentSession.status === 'ready';

  return {
    startScanning,
    stopScanning,
    addPassenger,
    canStartScanning,
    isScanning,
    currentSession,
    isStarting: updateSessionStatusMutation.isPending,
    isAddingPassenger: addPassengerMutation.isPending,
  };
} 