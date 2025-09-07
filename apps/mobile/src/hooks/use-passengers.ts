import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '../services/database-service';
import { PassengerData } from '../types';

// Query keys
export const passengerKeys = {
  all: ['passengers'] as const,
  session: (sessionId: string) => ['passengers', sessionId] as const,
  allPassengers: () => ['passengers', 'all'] as const,
};

// Get passengers for a specific session
export function useSessionPassengers(sessionId: string | null) {
  return useQuery({
    queryKey: passengerKeys.session(sessionId || ''),
    queryFn: () => sessionId ? DatabaseService.getPassengersForSession(sessionId) : [],
    enabled: !!sessionId,
    staleTime: 1000 * 30, // 30 seconds - passengers change frequently during scanning
  });
}

// Get all passengers
export function useAllPassengers() {
  return useQuery({
    queryKey: passengerKeys.allPassengers(),
    queryFn: () => DatabaseService.getAllPassengers(),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Add passenger mutation
export function useAddPassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ passenger, sessionId }: { passenger: PassengerData; sessionId: string }) =>
      DatabaseService.addPassenger(passenger, sessionId),
    onSuccess: (_, { sessionId }) => {
      // Invalidate passengers for this session
      queryClient.invalidateQueries({ queryKey: passengerKeys.session(sessionId) });
      // Also invalidate all passengers
      queryClient.invalidateQueries({ queryKey: passengerKeys.allPassengers() });
      // Invalidate sessions to update passenger count
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// Remove passenger mutation
export function useRemovePassenger() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passengerId: string) => DatabaseService.removePassenger(passengerId),
    onSuccess: () => {
      // Invalidate all passenger queries since we don't know which session it was from
      queryClient.invalidateQueries({ queryKey: passengerKeys.all });
      // Invalidate sessions to update passenger count
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
} 