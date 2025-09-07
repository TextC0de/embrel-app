import { Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, QrCode, Search } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BodyText, BodyTextSecondary } from '../../../components/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '../../../constants/theme';
import { useSessionPassengers } from '../../../hooks/use-passengers';
import { useSession } from '../../../hooks/use-sessions';

/**
 * Session Tab Layout - Provides tab navigation within a session
 * Contains Scanner, Search tabs and session completion functionality
 */
export default function SessionLayout() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { data: session } = useSession(sessionId);
  const { data: passengers } = useSessionPassengers(sessionId);

  const handleGoBack = () => {
    // Simply go back - session data persists
    router.push('/');
  };


  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
      <View style={styles.wrapper}>
        {/* Header with EMBREL branding and session info */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {/* Back Arrow */}
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.backButton}
              >
                <ArrowLeft size={24} color={COLORS.text.secondary} />
              </TouchableOpacity>
              
              <View style={styles.headerText}>
                <BodyText style={styles.flightNumber}>
                  Vuelo {session?.flight.flightNumber}
                </BodyText>
                <BodyTextSecondary>
                  {passengers?.length || 0} pasajeros embarcados
                </BodyTextSecondary>
              </View>
            </View>
            
            {/* Botón Finalizar removido del header - ahora solo aparece en la pestaña de búsqueda */}
          </View>
        </View>

        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary.main,
            tabBarInactiveTintColor: COLORS.text.secondary,
            tabBarStyle: {
              backgroundColor: COLORS.background.white,
              borderTopWidth: 1,
              borderTopColor: COLORS.border.default,
              paddingBottom: 0,
              paddingTop: 0,
              height: 60,
            },
            tabBarLabelStyle: {
              fontSize: TYPOGRAPHY.size.xs,
              fontWeight: TYPOGRAPHY.weight.bold,
              marginTop: 4,
            },
          }}
        >
          <Tabs.Screen
            name="scan"
            options={{
              title: 'Escanear',
              tabBarIcon: ({ color, size }) => (
                <QrCode size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Buscar',
              tabBarIcon: ({ color, size }) => (
                <Search size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.background.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary.main,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: SPACING.base,
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  flightNumber: {
    fontWeight: TYPOGRAPHY.weight.bold,
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text.primary,
  },
  completeButton: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButtonText: {
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginLeft: SPACING.sm,
  },
}); 