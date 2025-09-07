import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DatabaseService } from '../services/database-service';
import { AppSettings, Flight } from '../types';

// Query keys
export const settingsKeys = {
  all: ['settings'] as const,
  userFlights: () => ['settings', 'userFlights'] as const,
};

// Get settings
export function useSettings() {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: () => DatabaseService.getSettings(),
    staleTime: 1000 * 60 * 10, // 10 minutes - settings don't change often
  });
}

// Get user flights
export function useUserFlights() {
  return useQuery({
    queryKey: settingsKeys.userFlights(),
    queryFn: () => DatabaseService.getUserFlights(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Update settings mutation
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: Partial<AppSettings>) => DatabaseService.updateSettings(settings),
    onSuccess: () => {
      // Invalidate settings
      queryClient.invalidateQueries({ queryKey: settingsKeys.all });
    },
  });
}

// Add user flight mutation
export function useAddUserFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flight: Omit<Flight, 'id'>) => DatabaseService.addUserFlight(flight),
    onSuccess: () => {
      // Invalidate user flights
      queryClient.invalidateQueries({ queryKey: settingsKeys.userFlights() });
    },
  });
}

// Update user flight mutation
export function useUpdateUserFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flightId, flight }: { flightId: string; flight: Partial<Omit<Flight, 'id'>> }) =>
      DatabaseService.updateUserFlight(flightId, flight),
    onSuccess: () => {
      // Invalidate user flights
      queryClient.invalidateQueries({ queryKey: settingsKeys.userFlights() });
    },
  });
}

// Delete user flight mutation
export function useDeleteUserFlight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flightId: string) => DatabaseService.deleteUserFlight(flightId),
    onSuccess: () => {
      // Invalidate user flights
      queryClient.invalidateQueries({ queryKey: settingsKeys.userFlights() });
    },
  });
} 