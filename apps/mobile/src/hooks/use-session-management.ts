import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSession, useUpdateSessionStatus, useDeleteSession, useCreateSession } from './use-sessions';

/**
 * Hook for session management operations
 */
export function useSessionManagement() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: currentSession } = useSession(sessionId);
  const updateSessionStatusMutation = useUpdateSessionStatus();
  const deleteSessionMutation = useDeleteSession();
  const createSessionMutation = useCreateSession();

  const completeSession = async () => {
    if (currentSession) {
      try {
        await updateSessionStatusMutation.mutateAsync({
          sessionId: currentSession.id,
          status: 'completed'
        });
        router.push('/');
      } catch (error) {
        console.error('Error completing session:', error);
        throw error;
      }
    }
  };

  const resetSession = async () => {
    if (currentSession) {
      try {
        await deleteSessionMutation.mutateAsync(currentSession.id);
        const newSessionId = await createSessionMutation.mutateAsync(currentSession.flight);
        router.replace(`/session/${newSessionId}/scan`);
      } catch (error) {
        console.error('Error resetting session:', error);
        throw error;
      }
    }
  };

  const archiveSession = async (targetSessionId: string) => {
    try {
      await updateSessionStatusMutation.mutateAsync({
        sessionId: targetSessionId,
        status: 'archived'
      });
    } catch (error) {
      console.error('Error archiving session:', error);
      throw error;
    }
  };

  return {
    completeSession,
    resetSession,
    archiveSession,
    currentSession,
    isUpdating: updateSessionStatusMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
    isCreating: createSessionMutation.isPending,
  };
} 