import { useRouter } from 'expo-router';
import { useSessions, useCreateSession } from './use-sessions';
import { Flight } from '../types';

/**
 * Hook for flight selection logic
 */
export function useFlightSelection() {
  const router = useRouter();
  const { data: sessions } = useSessions();
  const createSessionMutation = useCreateSession();

  const selectFlight = async (flight: Flight) => {
    try {
      // Check if there's an existing session for this flight
      const existingSession = sessions?.find(
        session => session.flight.flightNumber === flight.flightNumber && 
                   session.status !== 'archived'
      );
      
      if (existingSession) {
        console.log('🔍 [Flight] Restoring existing session:', flight.flightNumber);
        router.push(`/session/${existingSession.id}/scan`);
      } else {
        console.log('🔍 [Flight] Creating new session:', flight.flightNumber);
        const sessionId = await createSessionMutation.mutateAsync(flight);
        router.push(`/session/${sessionId}/scan`);
      }
      
    } catch (error) {
      console.error('Error selecting flight:', error);
      throw error;
    }
  };

  return {
    selectFlight,
    isCreatingSession: createSessionMutation.isPending,
  };
} 