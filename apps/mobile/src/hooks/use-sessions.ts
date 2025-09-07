import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '../services/database-service';
import { Flight } from '../types';

// Query keys
export const sessionKeys = {
  all: ['sessions'] as const,
  session: (sessionId: string) => ['sessions', sessionId] as const,
  active: () => ['sessions', 'active'] as const,
};

// Get all sessions
export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.all,
    queryFn: () => DatabaseService.getAllSessions(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get specific session
export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: sessionKeys.session(sessionId || ''),
    queryFn: () => sessionId ? DatabaseService.getSession(sessionId) : null,
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get active session
export function useActiveSession() {
  return useQuery({
    queryKey: sessionKeys.active(),
    queryFn: () => DatabaseService.getActiveSession(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Create session mutation
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flight: Flight) => DatabaseService.createSession(flight),
    onSuccess: () => {
      // Invalidate sessions list
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

// Update session status mutation
export function useUpdateSessionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: 'ready' | 'active' | 'completed' | 'archived' }) =>
      DatabaseService.updateSessionStatus(sessionId, status),
    onSuccess: (_, { sessionId }) => {
      // Invalidate specific session and all sessions
      queryClient.invalidateQueries({ queryKey: sessionKeys.session(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
    },
  });
}

// Delete session mutation
export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => DatabaseService.deleteSession(sessionId),
    onSuccess: () => {
      // Invalidate all sessions
      queryClient.invalidateQueries({ queryKey: sessionKeys.all });
      // Also invalidate passengers since they were deleted too
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
    },
  });
} 