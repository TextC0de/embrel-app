import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { desktopConnection } from '@/services/desktop-connection';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { BodyText, Heading2, Button } from '@/components/ui';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

export default function ScanConnectionScreen() {
  const { data: settings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const handleBarCodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (hasScanned || isConnecting) return;
    
    // Check if it's an EMBREL connection QR
    if (!data.startsWith('EMBREL_CONNECT:')) {
      Alert.alert('QR Inválido', 'Este no es un código QR de conexión EMBREL');
      return;
    }

    setHasScanned(true);
    setIsConnecting(true);

    // Extract URL from QR code
    const url = data.replace('EMBREL_CONNECT:', '');
    
    // Test connection
    const isValid = await desktopConnection.testConnection(url);
    
    if (isValid) {
      // Save connection
      await desktopConnection.saveConnection(url);
      
      // Enable desktop mode if not already enabled
      if (settings && !settings.desktopModeEnabled) {
        await updateSettingsMutation.mutateAsync({ ...settings, desktopModeEnabled: true });
      }
      
      // Connect WebSocket
      desktopConnection.connectWebSocket(
        url,
        () => {
          Alert.alert(
            'Conexión Exitosa',
            '✅ Conectado al desktop',
            [
              {
                text: 'OK',
                onPress: () => {
                  router.back();
                  router.back(); // Go back to settings
                }
              }
            ]
          );
        },
        (error) => {
          Alert.alert('Error', error);
          setHasScanned(false);
          setIsConnecting(false);
        }
      );
    } else {
      Alert.alert(
        'Error de conexión',
        'No se pudo conectar al servidor desktop. Verifica que esté activo.',
        [
          {
            text: 'Reintentar',
            onPress: () => {
              setHasScanned(false);
              setIsConnecting(false);
            }
          }
        ]
      );
    }
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <BodyText>Solicitando permisos de cámara...</BodyText>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Escanear QR de Conexión',
            headerBackTitle: 'Atrás',
          }}
        />
        <View style={styles.centerContainer}>
          <Heading2 style={styles.title}>Permisos de Cámara</Heading2>
          <BodyText style={styles.message}>
            Necesitamos acceso a la cámara para escanear el código QR del desktop
          </BodyText>
          <Button onPress={requestPermission} variant="primary" size="lg">
            Permitir Acceso
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Escanear QR de Conexión',
          headerBackTitle: 'Atrás',
        }}
      />
      
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        >
          <View style={styles.overlay}>
            <View style={styles.overlayTop}>
              <BodyText style={styles.instructionText}>
                Apunta la cámara al código QR{'\n'}en la pantalla del desktop
              </BodyText>
            </View>
            
            <View style={styles.middleRow}>
              <View style={styles.sideOverlay} />
              <View style={styles.scanArea}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
              <View style={styles.sideOverlay} />
            </View>
            
            <View style={styles.overlayBottom}>
              {isConnecting && (
                <View style={styles.connectingContainer}>
                  <BodyText style={styles.connectingText}>
                    Conectando...
                  </BodyText>
                </View>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  message: {
    marginBottom: SPACING.xl,
    textAlign: 'center',
    color: COLORS.text.secondary,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  middleRow: {
    flexDirection: 'row',
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: COLORS.primary.main,
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },
  instructionText: {
    color: COLORS.text.inverse,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  connectingContainer: {
    backgroundColor: COLORS.primary.main,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 100,
  },
  connectingText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
});