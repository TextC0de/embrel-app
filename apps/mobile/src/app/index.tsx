import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrivacyNotice } from "../components/privacy";
import { BodyText, BodyTextSecondary, Button, Card, CardContent, FlightCardSkeleton, Heading1 } from "../components/ui";
import { COLORS, SPACING, TYPOGRAPHY } from "../constants/theme";
import { useFlightSelection } from "../hooks/use-flight-selection";
import { useDeleteUserFlight, useUserFlights, useSettings } from "../hooks/use-settings";
import { debug } from "../utils/debug";
import { desktopConnection } from "../services/desktop-connection";
import { Settings } from 'lucide-react-native';

const embrelLogo = require('../../assets/logos/embrel-full.png');

/**
 * Flight Selector - Main entry point
 * Shows available flights for boarding
 */
export default function FlightSelector() {
  debug.app('FlightSelector: Component render started');
  const router = useRouter();
  const { selectFlight, isCreatingSession } = useFlightSelection();
  const { data: userFlights, isLoading: flightsLoading } = useUserFlights();
  const { data: settings } = useSettings();
  const deleteFlightMutation = useDeleteUserFlight();
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [isDesktopConnected, setIsDesktopConnected] = useState(false);
  
  // Check if it's the first time user opens the app
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const hasSeenPrivacy = await AsyncStorage.getItem('hasSeenPrivacyNotice1');
        if (!hasSeenPrivacy) {
          setShowPrivacyNotice(true);
        }
      } catch (error) {
        console.error('Error checking privacy notice status:', error);
      }
    };
    checkFirstTime();
  }, []);

  // Check desktop connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsDesktopConnected(desktopConnection.getConnectionStatus());
    };
    
    checkConnection();
    const interval = setInterval(checkConnection, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const handleAcceptPrivacy = async () => {
    try {
      await AsyncStorage.setItem('hasSeenPrivacyNotice1', 'true');
      setShowPrivacyNotice(false);
    } catch (error) {
      console.error('Error saving privacy notice status:', error);
    }
  };
  
  debug.app('FlightSelector: State', { 
    isCreatingSession, 
    flightsLoading, 
    hasFlights: userFlights?.length || 0 
  });

  const handleFlightSelect = async (flight: any) => {
    try {
      debug.flight('FlightSelector: Starting flight selection', { flight: flight.flightNumber });
      await selectFlight(flight);
      debug.flight('FlightSelector: Flight selection completed');
    } catch (error) {
      debug.error("FlightSelector: Error selecting flight", error);
    }
  };

  const handleCreateFlight = () => {
    router.push("/create-flight");
  };

  const handleDeleteFlight = async (flightId: string) => {
    try {
      await deleteFlightMutation.mutateAsync(flightId);
      setConfirmingDelete(null);
      debug.flight('FlightSelector: Flight deleted successfully', { flightId });
    } catch (error) {
      debug.error("FlightSelector: Error deleting flight", error);
    }
  };

  const hasFlights = userFlights && userFlights.length > 0;

  if (flightsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.logoContainer}>
                <Image
                  source={embrelLogo}
                  style={styles.logo}
                  contentFit="contain"
                />
              </View>
              <View style={styles.headerRight}>
                {/* Desktop Connection Status */}
                {settings?.desktopModeEnabled && (
                  <View style={[styles.connectionStatus, isDesktopConnected && styles.connected]}>
                    <View style={[styles.connectionDot, isDesktopConnected && styles.connectedDot]} />
                    <BodyTextSecondary style={styles.connectionText}>
                      {isDesktopConnected ? 'Desktop' : 'Sin conexión'}
                    </BodyTextSecondary>
                  </View>
                )}
                
                {/* Settings Button */}
                <TouchableOpacity 
                  onPress={() => router.push('/settings')}
                  style={styles.settingsButton}
                >
                  <Settings size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </View>
            </View>
            <BodyTextSecondary style={styles.headerSubtitle}>
              Cargando tus vuelos...
            </BodyTextSecondary>
          </View>

          {/* Loading Skeleton */}
          <View style={styles.flightsContainer}>
            <View style={styles.flightsHeader}>
              <Heading1 style={styles.flightsTitle}>
                Mis Rutas de Vuelo
              </Heading1>
              <Button
                variant="primary"
                size="sm"
                disabled
              >
                Nuevo
              </Button>
            </View>
            
            <View style={styles.flightsList}>
              <FlightCardSkeleton />
              <FlightCardSkeleton />
              <FlightCardSkeleton />
            </View>
          </View>

          <View style={styles.spacer} />
        </ScrollView>

        {/* Credits Footer */}
        <View style={styles.footer}>
          <BodyTextSecondary style={styles.creditsText}>
            Visión: Adrián Zacarías Chiquichano • Desarrollo: Ignacio Guzmán
          </BodyTextSecondary>
          <BodyTextSecondary style={styles.appText}>
            EMBREL • Embarque Rápido y Eficiente
          </BodyTextSecondary>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image
                source={embrelLogo}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
            <View style={styles.headerRight}>
              {/* Desktop Connection Status */}
              {settings?.desktopModeEnabled && (
                <View style={[styles.connectionStatus, isDesktopConnected && styles.connected]}>
                  <View style={[styles.connectionDot, isDesktopConnected && styles.connectedDot]} />
                  <BodyTextSecondary style={styles.connectionText}>
                    {isDesktopConnected ? 'Desktop' : 'Sin conexión'}
                  </BodyTextSecondary>
                </View>
              )}
              
              {/* Settings Button */}
              <TouchableOpacity 
                onPress={() => router.push('/settings')}
                style={styles.settingsButton}
              >
                <Settings size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
          <BodyTextSecondary style={styles.headerSubtitle}>
            {hasFlights ? "Selecciona un vuelo para comenzar" : "Crea tu primer vuelo para comenzar"}
          </BodyTextSecondary>
        </View>

        {/* Empty State or User Flights */}
        {!hasFlights ? (
          <View style={styles.emptyStateContainer}>
            <Card variant="default" style={styles.emptyStateCard}>
              <CardContent>
                <View style={styles.emptyStateContent}>
                  <View style={styles.emptyStateIcon}>
                    <BodyText style={styles.planeIcon}>✈️</BodyText>
                  </View>
                  <Heading1 style={styles.welcomeTitle}>
                    ¡Bienvenido a EMBREL!
                  </Heading1>
                  <BodyText style={styles.welcomeText}>
                    Para comenzar a escanear tarjetas de embarque, crea tu primera ruta de vuelo. Solo necesitas hacerlo una vez por cada vuelo que manejes.
                  </BodyText>
                  <Button
                    onPress={handleCreateFlight}
                    variant="primary"
                    size="lg"
                    style={styles.createFlightButton}
                  >
                    Crear Mi Primera Ruta
                  </Button>
                </View>
              </CardContent>
            </Card>
          </View>
        ) : (
          <View style={styles.flightsContainer}>
            <View style={styles.flightsHeader}>
              <Heading1 style={styles.flightsTitle}>
                Mis Rutas de Vuelo
              </Heading1>
              <Button
                onPress={handleCreateFlight}
                variant="primary"
                size="sm"
              >
                Nuevo
              </Button>
            </View>
            
            <View style={styles.flightsList}>
              {userFlights.map((flight: any) => (
                <Card key={flight.id} style={styles.flightCard}>
                  <CardContent>
                    <TouchableOpacity
                      onPress={() => handleFlightSelect(flight)}
                      onLongPress={() => setConfirmingDelete(flight.id)}
                      disabled={isCreatingSession}
                      style={styles.flightTouchable}
                      activeOpacity={0.7}
                    >
                      <View style={styles.flightContent}>
                        <View style={styles.flightInfo}>
                          <BodyText style={styles.flightNumber} numberOfLines={1}>
                            Vuelo {flight.flightNumber}
                          </BodyText>
                          {flight.description && (
                            <BodyTextSecondary 
                              style={styles.flightDescription}
                              numberOfLines={2}
                              ellipsizeMode="tail"
                            >
                              {flight.description}
                            </BodyTextSecondary>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </CardContent>
                </Card>
              ))}
            </View>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* Credits Footer */}
      <View style={styles.footer}>
        <BodyTextSecondary style={styles.creditsText}>
          Visión: Adrián Zacarías Chiquichano • Desarrollo: Ignacio Guzmán
        </BodyTextSecondary>
        <BodyTextSecondary style={styles.appText}>
          EMBREL • Embarque Rápido y Eficiente
        </BodyTextSecondary>
      </View>

      {/* Delete Confirmation Modal */}
      {confirmingDelete && (
        <SafeAreaView style={styles.loadingOverlay} pointerEvents="box-none">
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            activeOpacity={1}
            onPress={() => setConfirmingDelete(null)}
          />
          <Card style={styles.confirmCard} padding="lg">
            <View style={styles.confirmContent}>
              <BodyText style={styles.confirmTitle}>¿Eliminar vuelo?</BodyText>
              <BodyText style={styles.confirmText}>
                Esta acción no se puede deshacer. Se eliminará el vuelo permanentemente.
              </BodyText>
              <View style={styles.confirmButtons}>
                <Button
                  onPress={() => setConfirmingDelete(null)}
                  variant="outline"
                  size="md"
                  style={styles.cancelConfirmButton}
                >
                  Cancelar
                </Button>
                <Button
                  onPress={() => handleDeleteFlight(confirmingDelete)}
                  variant="danger"
                  size="md"
                  loading={deleteFlightMutation.isPending}
                  style={styles.deleteConfirmButton}
                >
                  Eliminar
                </Button>
              </View>
            </View>
          </Card>
        </SafeAreaView>
      )}

      {/* Loading Overlay */}
      {isCreatingSession && (
        <View style={styles.loadingOverlay}>
          <Card style={styles.loadingCard}>
            <CardContent>
              <BodyText>Preparando sesión...</BodyText>
            </CardContent>
          </Card>
        </View>
      )}
      
      {/* Privacy Notice Modal */}
      <PrivacyNotice
        visible={showPrivacyNotice}
        onAccept={handleAcceptPrivacy}
        isFirstTime={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: COLORS.background.white,
    flexDirection: 'column',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: SPACING.sm,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.sm,
    backgroundColor: COLORS.background.light,
  },
  connected: {
    backgroundColor: '#dcfce7',
  },
  connectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.text.secondary,
  },
  connectedDot: {
    backgroundColor: '#10b981',
  },
  connectionText: {
    fontSize: TYPOGRAPHY.size.xs,
  },
  settingsButton: {
    padding: SPACING.xs,
    borderRadius: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
  },
  logoContainer: {
    width: 32,
    height: 32,
    marginRight: SPACING.base,
  },
  logo: {
    width: 32,
    height: 32,
  },
  emptyStateContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  emptyStateCard: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  emptyStateContent: {
    alignItems: 'center',
  },
  emptyStateIcon: {
    marginBottom: SPACING.base,
  },
  planeIcon: {
    fontSize: 32,
    lineHeight: 50,
  },
  welcomeTitle: {
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  welcomeText: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  createFlightButton: {
    alignSelf: 'stretch',
  },
  flightsContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
  },
  flightsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  flightsTitle: {
    flex: 1,
  },
  flightsList: {
    gap: SPACING.base,
  },
  flightCard: {
  },
  flightTouchable: {
    paddingVertical: SPACING.xs,
  },
  flightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  flightInfo: {
    flex: 1,
  },
  flightNumber: {
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.xs,
  },
  flightDescription: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
  },
  spacer: {
    height: SPACING['6xl'],
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    backgroundColor: COLORS.background.light,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  creditsText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.xs,
  },
  appText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.xs,
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  loadingCard: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 360,
  },
  confirmContent: {
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.bold,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  confirmText: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
    color: COLORS.text.secondary,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  cancelConfirmButton: {
    flex: 1,
  },
  deleteConfirmButton: {
    flex: 1,
  },
  privacyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary.light,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.xl,
    marginTop: SPACING.md,
  },
  privacyText: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.primary.dark,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
}); 