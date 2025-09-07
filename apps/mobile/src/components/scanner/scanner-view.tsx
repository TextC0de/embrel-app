import { useFocusEffect } from '@react-navigation/native';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { Flashlight, FlashlightOff, RotateCcw } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Pressable } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { useAddPassenger, useSessionPassengers } from '../../hooks/use-passengers';
import { useScanning } from '../../hooks/use-scanning';
import { useSession } from '../../hooks/use-sessions';
import { audioService } from '../../services/audio-service';
import type { PassengerData } from '../../types/app-state';
import { parseQRCode } from '../../utils/qr-parser';
import { BodyText, Button } from '../ui';
import { ConfirmationModal } from './confirmation-modal';
import { useAnalytics } from '../../hooks/use-analytics';
import { desktopConnection } from '../../services/desktop-connection';
import { useSettings } from '../../hooks/use-settings';

interface ScannerViewProps {
  sessionId: string;
}

/**
 * Scanner View - Simplified according to Expo Camera docs
 * "Only one Camera preview can be active at any given time"
 */
export const ScannerView: React.FC<ScannerViewProps> = ({ sessionId }) => {
  console.log('🔍 [ScannerView] sessionId prop:', sessionId);
  const { data: sessions } = useSession(sessionId);
  const { data: passengers } = useSessionPassengers(sessionId);
  const addPassengerMutation = useAddPassenger();
  const { startScanning } = useScanning();
  const analytics = useAnalytics();
  const { data: settings } = useSettings();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = React.useState(false);
  const [torchEnabled, setTorchEnabled] = React.useState(false);
  const [scannedPassenger, setScannedPassenger] = React.useState<PassengerData | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showError, setShowError] = React.useState(false);
  const [isScreenFocused, setIsScreenFocused] = React.useState(false);
  const [scanStatus, setScanStatus] = React.useState<string>('Listo para escanear');
  const [isFocusing, setIsFocusing] = React.useState(false);
  const [scanStartTime, setScanStartTime] = React.useState<number>(0);
  const [isDesktopConnected, setIsDesktopConnected] = React.useState(false);
  const [lastSentToDesktop, setLastSentToDesktop] = React.useState<string | null>(null);
  const cameraRef = React.useRef<CameraView>(null);

  // Find current session
  const currentSession = sessions;
  const currentFlight = currentSession?.flight;

  // Simple focus management - mount/unmount camera based on screen focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[ScannerView] Screen focused - Mounting camera');
      setIsScreenFocused(true);
      
      // Only reset scan state if not showing any modal
      if (!showConfirmation && !showError) {
        setScanned(false);
      }
      
      // Activate the session when scanner mounts (only once)
      if (sessionId) {
        console.log('🔍 [ScannerView] Calling startScanning() on mount');
        startScanning();
      }
      
      // Subscribe to desktop connection status
      const unsubscribe = desktopConnection.addConnectionListener((connected) => {
        setIsDesktopConnected(connected);
      });
      
      // Set initial status
      setIsDesktopConnected(desktopConnection.getConnectionStatus());
      
      return () => {
        console.log('[ScannerView] Screen unfocused - Unmounting camera');
        setIsScreenFocused(false);
        unsubscribe();
      };
    }, [startScanning, sessionId])
  );

  const showErrorMessage = (message: string) => {
    console.log('🚨 Showing error modal:', message);
    setErrorMessage(message);
    setShowError(true);
  };

  const hideError = () => {
    console.log('✅ Hiding error modal - resuming scanning');
    setShowError(false);
    setScanned(false);
    setScanStatus('Listo para escanear');
  };

  const handleBarCodeScanned = (params: BarcodeScanningResult) => {
    console.log('📱 Barcode scanned:', params);
    setScanStatus('Procesando código...');
    setScanStartTime(Date.now()); // Set scan start time for analytics
    
    // Use raw data if available (contains complete barcode), otherwise fall back to data
    const barcodeData = params.raw || params.data;

    console.log('📋 Raw data:', barcodeData);
    console.log('📋 Data length:', barcodeData?.length);

    if (!barcodeData) {
      setScanStatus('❌ El código QR está vacío');
      return;
    }
    if (scanned) return;

    setScanned(true);
    
    // Add a delay to ensure we're getting the complete scan
    const timeoutId = setTimeout(() => {
      try {
        const parseResult = parseQRCode(
          barcodeData, 
          [currentFlight?.flightNumber || ''],
          params.type // Pass the barcode type for better validation
        );
        
        if (!parseResult.isValid || !parseResult.parsed) {
          setScanStatus(`❌ ${parseResult.error}`);
          throw new Error(parseResult.error || 'Código QR inválido para tarjeta de embarque');
        }
        
        setScanStatus('✅ Código válido! Verificando...');
        const parsedPassenger = parseResult.parsed;
        
        // Flight validation
        if (!currentFlight) {
          setScanStatus('❌ Sin vuelo activo');
          showErrorMessage('❌ No hay vuelo activo\n\nDebes iniciar una sesión de embarque primero');
          audioService.playSound('error');
          analytics.trackAudioPlayed('error');
          return;
        }
        
        if (parsedPassenger.flight !== currentFlight.flightNumber) {
          setScanStatus(`❌ Vuelo incorrecto: ${parsedPassenger.flight}`);
          showErrorMessage(`❌ Vuelo incorrecto\n\nEsperado: Vuelo ${currentFlight.flightNumber}\nEscaneado: Vuelo ${parsedPassenger.flight}\n\nVerifica que sea la tarjeta correcta`);
          audioService.playSound('error');
          analytics.trackAudioPlayed('error');
          analytics.trackQRScanError('wrong_flight');
          analytics.trackAudioPlayed('error');
          return;
        }
        
        // Duplicate validation
        const existingPassenger = passengers?.find((p: any) => p.seq === parsedPassenger.seq && p.passenger === parsedPassenger.passenger);
        
        if (existingPassenger) {
          setScanStatus(`❌ Pasajero duplicado: SEQ ${parsedPassenger.seq}`);
          showErrorMessage(`❌ Pasajero ya embarcado\n\nNombre: ${existingPassenger.passenger}\nSecuencia: ${parsedPassenger.seq}\n\nEste pasajero ya fue registrado`);
          audioService.playSound('error');
          analytics.trackAudioPlayed('error');
          analytics.trackQRScanError('duplicate');
          analytics.trackAudioPlayed('error');
          return;
        }
        
        // Success - prepare passenger data
        const passengerData: PassengerData = {
          ...parsedPassenger,
          id: `pax_${Date.now()}`,
          timestamp: Date.now(),
          rawData: barcodeData,
          sessionId: sessionId
        };
        
        setScanStatus(`✅ ${parsedPassenger.passenger} - SEQ ${parsedPassenger.seq}`);
        setScannedPassenger(passengerData);
        setShowConfirmation(true);
        console.log('✅ Showing confirmation modal for passenger:', parsedPassenger.passenger);
        
        // Send to desktop immediately if enabled (don't wait for confirmation)
        // But check if we haven't already sent this exact passenger
        const passengerKey = `${passengerData.seq}-${passengerData.pnr}`;
        if (settings?.desktopModeEnabled && 
            desktopConnection.getConnectionStatus() && 
            lastSentToDesktop !== passengerKey) {
          
          setLastSentToDesktop(passengerKey); // Mark as sent to prevent duplicates
          
          desktopConnection.sendScanData({
            sequenceNumber: passengerData.seq,
            passengerName: passengerData.passenger,
            flightNumber: passengerData.flight,
            seatNumber: passengerData.seat
          }).then(sent => {
            if (sent) {
              console.log('✅ Data sent to desktop immediately on scan');
            } else {
              console.log('❌ Failed to send to desktop');
              setLastSentToDesktop(null); // Reset on failure so it can retry
            }
          }).catch(error => {
            console.error('Error sending to desktop:', error);
            setLastSentToDesktop(null); // Reset on error so it can retry
          });
        }
        
        // Track successful scan validation
        const timeToConfirm = Date.now() - scanStartTime;
        analytics.trackQRScanSuccess(timeToConfirm);
        audioService.playSound('success');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Código QR inválido';
        
        // Check if error might be focus-related
        const isFocusRelated = errorMessage.includes('muy corto') || 
                              errorMessage.includes('vacío') || 
                              barcodeData.length < 20;
        
        if (isFocusRelated) {
          handleScanFailure('Error de lectura - Intenta enfocar mejor');
        } else {
          setScanStatus(`❌ ${errorMessage}`);
          showErrorMessage(`❌ Código QR inválido\n\n${errorMessage}\n\nIntenta escanear nuevamente`);
        }
        
        audioService.playSound('error');
        analytics.trackAudioPlayed('error');
      }
    }, 200);

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  };

  const handleConfirmPassenger = async () => {
    if (!scannedPassenger) return;
    
    try {
      console.log('✅ Confirming passenger:', scannedPassenger.passenger);
      await addPassengerMutation.mutateAsync({
        passenger: scannedPassenger,
        sessionId: sessionId
      });
      
      // Track boarding confirmation (anonymous)
      const totalTime = Date.now() - scanStartTime;
      analytics.trackBoardingConfirmed(totalTime);
      analytics.trackAudioPlayed('success');
      
      // Note: Data already sent to desktop on scan (not on confirmation)
      
      setShowConfirmation(false);
      setScannedPassenger(null);
      setScanned(false); // Allow scanning again
      setScanStatus('Listo para escanear');
      
      // Reset lastSentToDesktop after a delay to prevent immediate re-scan of same passenger
      setTimeout(() => {
        setLastSentToDesktop(null);
      }, 2000); // 2 second delay before allowing same passenger to be sent again
      console.log('✅ Passenger confirmed - resuming scanning');
    } catch (error) {
      console.error('Error adding passenger:', error);
      showErrorMessage('❌ Error al guardar\n\nNo se pudo registrar al pasajero en la base de datos\n\nIntenta nuevamente');
    }
  };

  const handleCancelPassenger = () => {
    console.log('❌ Cancelling passenger confirmation - resuming scanning');
    setShowConfirmation(false);
    setScannedPassenger(null);
    setScanned(false); // Allow scanning again
    setScanStatus('Listo para escanear');
    
    // Reset after a reasonable delay so they can re-scan the same passenger later
    setTimeout(() => {
      setLastSentToDesktop(null);
    }, 3000); // 3 seconds - enough time to move away from the QR
  };

  const toggleTorch = () => {
    setTorchEnabled(!torchEnabled);
  };

  const handleTapToFocus = () => {
    console.log('📸 [Scanner] Tap to focus triggered');
    setIsFocusing(true);
    setScanStatus('Enfocando...');
    
    // Reset focus state after a short delay
    setTimeout(() => {
      setIsFocusing(false);
      if (!scanned) {
        setScanStatus('Listo para escanear');
      }
    }, 1500);
  };

  const handleManualRefocus = () => {
    console.log('🔄 [Scanner] Manual refocus triggered');
    handleTapToFocus();
    // Reset scan state to allow new attempts
    setScanned(false);
  };

  const handleScanFailure = (reason: string) => {
    console.log('❌ [Scanner] Scan failure:', reason);
    setScanStatus(`❌ ${reason}`);
    
    // Suggest torch if lighting might be an issue
    if (!torchEnabled && (reason.includes('enfoque') || reason.includes('lectura'))) {
      setTimeout(() => {
        setScanStatus('💡 Intenta activar la linterna');
      }, 2000);
    }
    
    // Auto-retry after a delay
    setTimeout(() => {
      if (!showConfirmation && !showError) {
        setScanned(false);
        setScanStatus('Listo para escanear');
      }
    }, 3000);
  };

  console.log('🔄 showConfirmation:', showConfirmation);
  console.log('🔄 scannedPassenger:', scannedPassenger);
  console.log('🔄 scanned:', scanned);
  console.log('🔄 showError:', showError);
  console.log('🔄 errorMessage:', errorMessage);

  // Check permissions
  if (!permission) {
    return (
      <View style={styles.container}>
        <BodyText style={styles.loadingText}>Verificando permisos de cámara...</BodyText>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <BodyText style={styles.permissionText}>
          📷 Necesitamos acceso a la cámara para escanear las tarjetas de embarque
        </BodyText>
        <Button onPress={requestPermission} variant="primary">
          Permitir acceso a la cámara
        </Button>
      </View>
    );
  }

  // Only render camera when screen is focused (according to Expo docs)
  if (!isScreenFocused) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <BodyText style={styles.placeholderText}>Preparando cámara...</BodyText>
        </View>
      </View>
    );
  }

  // Determine if scanning should be disabled
  const shouldDisableScanning = scanned || showConfirmation || showError;

  return (
    <View style={styles.container}>
      <Pressable style={styles.camera} onPress={handleTapToFocus}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          enableTorch={torchEnabled}
          autofocus="on"
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'pdf417'],
          }}
          onBarcodeScanned={shouldDisableScanning ? undefined : handleBarCodeScanned}
        />
      </Pressable>
       
       {/* Control buttons */}
       {/* Top Controls */}
       <View style={styles.topControls}>
         <TouchableOpacity onPress={toggleTorch} style={styles.controlButton}>
           {torchEnabled ? (
             <Flashlight size={24} color="#fff" />
           ) : (
             <FlashlightOff size={24} color="#fff" />
           )}
         </TouchableOpacity>
       </View>
       
       {/* Bottom Controls */}
       <View style={styles.bottomControls}>
         <TouchableOpacity onPress={handleManualRefocus} style={styles.refocusButton}>
           <RotateCcw size={20} color="#fff" />
           <BodyText style={styles.refocusText}>Reenfocar</BodyText>
         </TouchableOpacity>
       </View>

       {/* Scan Status Overlay */}
       <View style={styles.statusOverlay}>
         {/* Desktop Connection Status */}
         {settings?.desktopModeEnabled && (
           <View style={[
             styles.connectionIndicator,
             isDesktopConnected ? styles.connectedIndicator : styles.disconnectedIndicator
           ]}>
             <View style={[
               styles.connectionDot,
               isDesktopConnected ? styles.connectedDot : styles.disconnectedDot
             ]} />
             <BodyText style={styles.connectionText}>
               {isDesktopConnected ? 'Desktop Conectado' : 'Desktop Desconectado'}
             </BodyText>
           </View>
         )}
         
         <View style={styles.statusContainer}>
           <BodyText style={styles.statusText}>{scanStatus}</BodyText>
           {scanned && (
             <View style={styles.scanningIndicator}>
               <BodyText style={styles.scanningText}>Procesando...</BodyText>
             </View>
           )}
         </View>
       </View>

       {/* Viewfinder Overlay */}
       <View style={styles.viewfinderContainer}>
         <View style={[styles.viewfinder, isFocusing && styles.viewfinderFocusing]}>
           <View style={[styles.corner, styles.topLeft]} />
           <View style={[styles.corner, styles.topRight]} />
           <View style={[styles.corner, styles.bottomLeft]} />
           <View style={[styles.corner, styles.bottomRight]} />
           
         </View>
         
         <BodyText style={styles.instructionText}>
           Escanea el código QR de la tarjeta de embarque
         </BodyText>
         
         {isFocusing && (
           <BodyText style={styles.focusText}>Enfocando...</BodyText>
         )}
       </View>

      {/* Error Modal */}
      {showError && (
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <BodyText style={styles.errorText}>{errorMessage}</BodyText>
            <Button 
              onPress={hideError}
              variant="danger"
              style={styles.errorButton}
            >
              Continuar
            </Button>
          </View>
        </View>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && scannedPassenger && (
        <ConfirmationModal
          passenger={scannedPassenger}
          visible={showConfirmation}
          onConfirm={handleConfirmPassenger}
          onCancel={handleCancelPassenger}
          loading={addPassengerMutation.isPending}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.text.primary,
  },
  camera: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f2937',
  },
  placeholderText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.size.base,
  },
  loadingText: {
    color: COLORS.text.inverse,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background.light,
  },
  permissionText: {
    fontSize: TYPOGRAPHY.size.base,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    color: COLORS.text.secondary,
  },
  topControls: {
    position: 'absolute',
    top: 60,
    right: SPACING.xl,
    zIndex: 10,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: SPACING.base,
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  refocusButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backdropFilter: 'blur(10px)',
  },
  refocusText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModal: {
    backgroundColor: COLORS.background.white,
    margin: SPACING.xl,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    maxWidth: 300,
    alignItems: 'center',
  },
  errorText: {
    fontSize: TYPOGRAPHY.size.base,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.base,
  },
  errorButton: {
    alignSelf: 'stretch',
  },
  // Status overlay styles
  statusOverlay: {
    position: 'absolute',
    top: 100,
    left: SPACING.xl,
    right: SPACING.xl,
    alignItems: 'center',
  },
  connectionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.sm,
  },
  connectedIndicator: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)', // green with opacity
  },
  disconnectedIndicator: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)', // red with opacity
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  connectedDot: {
    backgroundColor: '#10b981', // green
  },
  disconnectedDot: {
    backgroundColor: '#ef4444', // red
  },
  connectionText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  statusContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
  },
  statusText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.semibold,
    textAlign: 'center',
  },
  scanningIndicator: {
    marginTop: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  scanningText: {
    color: '#fbbf24',
    fontSize: TYPOGRAPHY.size.xs,
    textAlign: 'center',
  },
  // Viewfinder styles
  viewfinderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinder: {
    width: 280,
    height: 280,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: BORDER_RADIUS.lg,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderWidth: 4,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: BORDER_RADIUS.lg,
  },
  topRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: BORDER_RADIUS.lg,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  viewfinderFocusing: {
    borderColor: COLORS.primary.main,
    shadowColor: COLORS.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  instructionText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.size.base,
    textAlign: 'center',
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: SPACING.base,
    borderRadius: BORDER_RADIUS.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    backdropFilter: 'blur(10px)',
  },
  focusText: {
    color: COLORS.primary.main,
    fontSize: TYPOGRAPHY.size.sm,
    textAlign: 'center',
    marginTop: SPACING.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
}); 