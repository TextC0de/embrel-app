import { Search, Trash2, Users, CheckCircle } from 'lucide-react-native';
import React, { memo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useRemovePassenger, useSessionPassengers } from '../../hooks/use-passengers';
import { useSession, useDeleteSession } from '../../hooks/use-sessions';
import { audioService } from '../../services/audio-service';
import { PassengerData } from '../../types/app-state';
import { PassengerCard } from '../passenger/passenger-card';
import { EmptyState } from '../search/empty-state';
import { BodyText, Button, Caption, Heading3, Input } from '../ui';

interface PassengerListViewProps {
  sessionId: string;
}

export const PassengerListView: React.FC<PassengerListViewProps> = memo(({ sessionId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  
  console.log('📋 [PassengerListView] Received sessionId:', sessionId, 'Type:', typeof sessionId);
  
  if (!sessionId) {
    throw new Error('Session ID is required');
  }
  
  const { data: session } = useSession(sessionId);
  const { data: passengers, isLoading, refetch } = useSessionPassengers(sessionId);
  const removePassengerMutation = useRemovePassenger();
  const deleteSessionMutation = useDeleteSession();

  console.log('📋 [PassengerListView] sessionId:', sessionId);
  console.log('📋 [PassengerListView] passengers count:', passengers?.length || 0);

  // Filter passengers based on search query
  const filteredPassengers = React.useMemo(() => {
    if (!passengers) return [];
    if (!searchQuery.trim()) return passengers;

    const query = searchQuery.toLowerCase().trim();
    return passengers.filter((passenger: PassengerData) => {
      const name = passenger.passenger.toLowerCase();
      const seat = passenger.seat.toLowerCase();
      const seq = passenger.seq.toString();
      const pnr = passenger.pnr.toLowerCase();
      
      return (
        name.includes(query) ||
        seat.includes(query) ||
        seq.includes(query) ||
        pnr.includes(query)
      );
    });
  }, [passengers, searchQuery]);

  // Stats
  const totalPassengers = passengers?.length || 0;

  const handleRemovePassenger = async (passenger: PassengerData) => {
    try {
      console.log('🗑️ Removing passenger:', passenger.passenger);
      await removePassengerMutation.mutateAsync(passenger.id);
    } catch (error) {
      console.error('Error removing passenger:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleCompleteSession = () => {
    const passengerCount = passengers?.length || 0;
    
    Alert.alert(
      "¿Desea borrar todos los datos?",
      `Se borrarán todos los datos del embarque:\n\n• ${passengerCount} pasajeros embarcados\n• Vuelo ${session?.flight.flightNumber}\n• Esta acción no se puede deshacer`,
      [
        {
          text: "❌ Cancelar",
          style: "cancel"
        },
        {
          text: "✅ Sí, Borrar Todo",
          style: "destructive",
          onPress: async () => {
            try {
              // Play confirmation sound
              audioService.playSound('success');
              
              // Delete entire session and all passengers
              await deleteSessionMutation.mutateAsync(sessionId);
              
              // Navigate back to main screen
              router.push('/');
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'No se pudo borrar la sesión');
            }
          }
        }
      ],
      {
        // Red-tinted background to indicate deletion
        userInterfaceStyle: 'dark'
      }
    );
  };

  const renderSearchHeader = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchRow}>
        <Input
          placeholder="Buscar por nombre, asiento, SEQ o PNR..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          icon={<Search size={20} color={COLORS.text.tertiary} />}
          iconPosition="left"
          style={styles.searchInput}
        />
        <TouchableOpacity
          onPress={handleCompleteSession}
          style={styles.completeButton}
        >
          <CheckCircle size={20} color={COLORS.text.inverse} />
          <BodyText style={styles.completeButtonText}>Finalizar</BodyText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatsHeader = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Users size={24} color={COLORS.primary.main} />
          <View style={styles.statContent}>
            <BodyText style={styles.statValue}>{totalPassengers}</BodyText>
            <Caption style={styles.statLabel}>Pasajeros embarcados</Caption>
          </View>
        </View>
      </View>
    </View>
  );

  const renderPassengerItem = (passenger: PassengerData) => (
    <View key={passenger.id} style={styles.passengerItem}>
      <PassengerCard
        passenger={passenger}
        onPress={() => {
          // Could navigate to passenger detail or show options
          console.log('Passenger pressed:', passenger.passenger);
        }}
      />
      
      {/* Quick Actions */}
      <View style={styles.actionButtonsContainer}>
        <Button
          variant="danger"
          size="sm"
          onPress={() => handleRemovePassenger(passenger)}
          loading={removePassengerMutation.isPending}
          style={styles.removeButton}
        >
          <View style={styles.buttonContent}>
            <Trash2 size={16} color="white" />
            <BodyText style={styles.buttonText}>Eliminar</BodyText>
          </View>
        </Button>
      </View>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <BodyText style={styles.loadingText}>Cargando pasajeros...</BodyText>
      </View>
    );
  }

  // Empty state - no passengers at all
  if (!passengers || passengers.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {renderStatsHeader()}
        <EmptyState
          icon={<Users size={64} color={COLORS.text.tertiary} />}
          title="Sin pasajeros embarcados"
          message="Comienza escaneando códigos QR en la pestaña Scanner para ver los pasajeros aquí."
        >
          <Button
            variant="primary"
            onPress={handleRefresh}
            style={styles.refreshButton}
          >
            Actualizar lista
          </Button>
        </EmptyState>
      </ScrollView>
    );
  }

  // Filtered empty state - passengers exist but none match search
  if (filteredPassengers.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {renderStatsHeader()}
        {renderSearchHeader()}
        
        <EmptyState
          icon={<Search size={64} color={COLORS.text.tertiary} />}
          title="Sin resultados"
          message={`No se encontraron pasajeros que coincidan con "${searchQuery}".`}
        >
          <Button
            variant="outline"
            onPress={() => setSearchQuery('')}
            style={styles.clearSearchButton}
          >
            Limpiar búsqueda
          </Button>
        </EmptyState>
      </ScrollView>
    );
  }

  // Main list with passengers
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
        }
      >
        {renderStatsHeader()}
        {renderSearchHeader()}
        
        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Heading3 style={styles.resultsTitle}>
            {searchQuery 
              ? `Resultados (${filteredPassengers.length})`
              : `Todos los pasajeros (${totalPassengers})`
            }
          </Heading3>
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              Limpiar
            </Button>
          )}
        </View>

        {/* Passenger List */}
        <View style={styles.passengerList}>
          {filteredPassengers.map(renderPassengerItem)}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
});

PassengerListView.displayName = 'PassengerListView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.light,
  },
  loadingText: {
    color: COLORS.text.secondary,
  },
  
  // Stats Section
  statsContainer: {
    backgroundColor: COLORS.background.white,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.base,
    marginBottom: SPACING.base,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statContent: {
    marginLeft: SPACING.md,
  },
  statValue: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text.primary,
  },
  statLabel: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.size.sm,
  },
  
  // Search Section
  searchSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.base,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.background.white,
    flex: 1,
  },
  completeButton: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  completeButtonText: {
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  
  // Results Header
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.base,
  },
  resultsTitle: {
    color: COLORS.text.primary,
  },
  clearButton: {
    // Clear button styles
  },
  
  // Passenger List
  passengerList: {
    // Passenger list container
  },
  passengerItem: {
    marginBottom: SPACING.base,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  removeButton: {
    paddingHorizontal: SPACING.base,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.text.inverse,
    marginLeft: SPACING.xs,
    fontSize: TYPOGRAPHY.size.sm,
  },
  
  // Action Buttons
  refreshButton: {
    marginTop: SPACING.md,
  },
  clearSearchButton: {
    marginTop: SPACING.md,
  },
  
  // Spacing
  bottomSpacing: {
    height: SPACING.xl,
  },
}); 