import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { desktopConnection } from '@/services/desktop-connection';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { ChevronLeft, Monitor, Wifi, CheckCircle, XCircle, QrCode } from 'lucide-react-native';
import { BodyText, BodyTextSecondary, Heading1, Button, Card, CardContent } from '@/components/ui';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

export default function DesktopModeScreen() {
  const { data: settings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [desktopUrl, setDesktopUrl] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasStoredConnection, setHasStoredConnection] = useState(false);

  useEffect(() => {
    // Load saved connection
    loadSavedConnection();
    
    // Listen for connection changes
    const unsubscribe = desktopConnection.addConnectionListener((connected) => {
      setIsConnected(connected);
      // If disconnected and we have enabled desktop mode, show alert
      if (!connected && isEnabled && hasStoredConnection) {
        Alert.alert(
          'Conexión Perdida',
          'Se perdió la conexión con el desktop. Intentando reconectar...',
          [
            {
              text: 'Reintentar Ahora',
              onPress: () => desktopConnection.reconnect()
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      }
    });
    
    return () => unsubscribe();
  }, [isEnabled, hasStoredConnection]);

  const loadSavedConnection = async () => {
    const saved = await desktopConnection.getStoredConnection();
    if (saved) {
      setDesktopUrl(saved.url);
      setHasStoredConnection(true);
      setIsConnected(desktopConnection.getConnectionStatus());
      // Only enable desktop mode if we have a connection saved AND are connected
      setIsEnabled((settings?.desktopModeEnabled || false) && desktopConnection.getConnectionStatus());
    } else {
      setHasStoredConnection(false);
      setIsEnabled(false);
    }
  };

  const handleToggleDesktopMode = async (value: boolean) => {
    if (!settings) return;
    
    // Can only enable if we're connected
    if (value && !isConnected) {
      Alert.alert(
        'Sin Conexión',
        'Primero debes conectarte al desktop antes de activar el modo desktop'
      );
      return;
    }
    
    setIsEnabled(value);
    await updateSettingsMutation.mutateAsync({ ...settings, desktopModeEnabled: value });
    
    if (!value) {
      // Don't disconnect, just disable sending
      // This way we keep the connection alive but don't send data
    }
  };

  const handleConnect = async () => {
    if (!desktopUrl) {
      Alert.alert('Error', 'Ingresa la URL del servidor desktop');
      return;
    }

    // Validate URL format
    if (!desktopUrl.startsWith('http://') && !desktopUrl.startsWith('https://')) {
      Alert.alert('Error', 'La URL debe comenzar con http:// o https://');
      return;
    }

    setIsConnecting(true);

    // Test connection first
    const isValid = await desktopConnection.testConnection(desktopUrl);
    
    if (isValid) {
      await desktopConnection.saveConnection(desktopUrl);
      setHasStoredConnection(true);
      desktopConnection.connectWebSocket(
        desktopUrl,
        () => {
          setIsConnected(true);
          Alert.alert('Éxito', '✅ Conectado al desktop');
        },
        (error) => {
          setIsConnected(false);
          Alert.alert('Error', error);
        }
      );
    } else {
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar al servidor desktop. Verifica:\n\n1. Que el servidor esté activo\n2. Que estés en la misma red WiFi\n3. Que la URL sea correcta'
      );
    }

    setIsConnecting(false);
  };

  const handleDisconnect = () => {
    desktopConnection.disconnect();
    setIsConnected(false);
    Alert.alert('Desconectado', 'Se ha desconectado del desktop');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Modo Desktop',
          headerBackTitle: 'Configuración',
          headerTintColor: COLORS.text.primary,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Heading1 style={styles.headerTitle}>Modo Desktop</Heading1>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Connection Status - Always visible */}
        <Card style={styles.sectionCard}>
          <CardContent>
            <View style={styles.sectionHeader}>
              <Monitor size={20} color={COLORS.text.secondary} />
              <BodyText style={styles.sectionTitle}>Estado de Conexión</BodyText>
            </View>
            
            <View style={styles.statusContainer}>
              {isConnected ? (
                <>
                  <CheckCircle size={20} color={COLORS.status.success} />
                  <BodyText style={[styles.statusText, styles.connectedText]}>
                    Conectado al desktop
                  </BodyText>
                </>
              ) : hasStoredConnection ? (
                <>
                  <XCircle size={20} color={COLORS.status.warning} />
                  <BodyText style={[styles.statusText, styles.reconnectingText]}>
                    Reconectando...
                  </BodyText>
                </>
              ) : (
                <>
                  <XCircle size={20} color={COLORS.status.error} />
                  <BodyText style={[styles.statusText, styles.disconnectedText]}>
                    Sin conexión configurada
                  </BodyText>
                </>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Enable/Disable Toggle - Only show if connected */}
        {isConnected && (
          <Card style={styles.sectionCard}>
            <CardContent style={styles.toggleCardContent}>
              <View style={styles.toggleContainer}>
                <View style={styles.toggleLeft}>
                  <BodyText style={styles.toggleTitle}>Activar Envío Automático</BodyText>
                  <BodyTextSecondary style={styles.toggleSubtitle}>
                    Envía códigos escaneados al desktop automáticamente
                  </BodyTextSecondary>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={handleToggleDesktopMode}
                  trackColor={{ false: COLORS.border.light, true: COLORS.status.info }}
                  thumbColor={COLORS.background.white}
                  ios_backgroundColor={COLORS.border.light}
                />
              </View>
            </CardContent>
          </Card>
        )}


        {/* Connection Form */}
        <Card style={styles.sectionCard}>
          <CardContent>
                <View style={styles.sectionHeader}>
                  <Wifi size={20} color={COLORS.text.secondary} />
                  <BodyText style={styles.sectionTitle}>Servidor Desktop</BodyText>
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={desktopUrl}
                      onChangeText={setDesktopUrl}
                      placeholder="http://192.168.1.100:8080"
                      keyboardType="url"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={[styles.textInput, styles.textInputWithButton]}
                      placeholderTextColor={COLORS.text.secondary}
                    />
                    <TouchableOpacity
                      onPress={() => router.push('/settings/scan-connection')}
                      style={styles.scanButton}
                    >
                      <QrCode size={24} color={COLORS.primary.main} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  {!isConnected ? (
                    <Button
                      onPress={handleConnect}
                      disabled={isConnecting}
                      variant="primary"
                      size="lg"
                      loading={isConnecting}
                      style={styles.actionButton}
                    >
                      {isConnecting ? 'Conectando...' : 'Conectar'}
                    </Button>
                  ) : (
                    <Button
                      onPress={handleDisconnect}
                      variant="danger"
                      size="lg"
                      style={styles.actionButton}
                    >
                      Desconectar
                    </Button>
                  )}
                </View>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card variant="elevated" style={styles.instructionsCard}>
          <CardContent style={styles.instructionsContent}>
                <BodyText style={styles.instructionsTitle}>
                  Cómo conectar:
                </BodyText>
                <View style={styles.instructionsList}>
                  <BodyTextSecondary style={styles.instructionItem}>
                    1. Abre EMBREL Desktop en tu computadora
                  </BodyTextSecondary>
                  <BodyTextSecondary style={styles.instructionItem}>
                    2. Haz clic en &quot;Iniciar Servidor&quot;
                  </BodyTextSecondary>
                  <BodyTextSecondary style={styles.instructionItem}>
                    3. Copia la URL que aparece en pantalla
                  </BodyTextSecondary>
                  <BodyTextSecondary style={styles.instructionItem}>
                    4. Pégala aquí y presiona &quot;Conectar&quot;
                  </BodyTextSecondary>
                </View>
                <BodyTextSecondary style={styles.warningText}>
                  ⚠️ Ambos dispositivos deben estar en la misma red WiFi
                </BodyTextSecondary>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size['2xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['6xl'],
  },
  sectionCard: {
    marginBottom: SPACING.lg,
  },
  toggleCardContent: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  toggleLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  toggleTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  toggleSubtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.size.sm * 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  statusText: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginLeft: SPACING.sm,
  },
  connectedText: {
    color: COLORS.status.success,
  },
  disconnectedText: {
    color: COLORS.status.error,
  },
  reconnectingText: {
    color: COLORS.status.warning,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: BORDER_RADIUS.base,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.white,
    minHeight: 44,
  },
  textInputWithButton: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  scanButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.base,
    backgroundColor: COLORS.background.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginTop: SPACING.sm,
  },
  actionButton: {
    alignSelf: 'stretch',
  },
  instructionsCard: {
    marginTop: SPACING.base,
    backgroundColor: '#eff6ff', // blue-50 equivalent
    borderColor: '#dbeafe', // blue-100 equivalent
  },
  instructionsContent: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  instructionsTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.status.info,
    marginBottom: SPACING.md,
  },
  instructionsList: {
    marginBottom: SPACING.lg,
  },
  instructionItem: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.status.info,
    opacity: 0.8,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.size.sm * 1.4,
  },
  warningText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.status.info,
    fontWeight: TYPOGRAPHY.weight.medium,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});