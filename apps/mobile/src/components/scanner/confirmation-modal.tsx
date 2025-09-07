import { Check, X } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { PassengerData } from '../../types/app-state';
import { BodyText, Button, Heading2, Modal } from '../ui';

interface ConfirmationModalProps {
  visible: boolean;
  passenger: PassengerData | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  passenger,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  console.log('🔄 ConfirmationModal visible:', visible);
  console.log('🔄 Passenger:', passenger);
  if (!passenger) return null;

  const formatPassengerName = (name: string): string => {
    return name.replace('/', ' ').replace(/([A-Z])/g, ' $1').trim();
  };

  // Check if passenger is in emergency exit row (12 or 14)
  const getRowNumber = (seat: string): number => {
    const rowMatch = seat.match(/^(\d+)/);
    return rowMatch?.[1] ? parseInt(rowMatch[1], 10) : 0;
  };

  const rowNumber = getRowNumber(passenger.seat);
  const isEmergencyExitRow = rowNumber === 12 || rowNumber === 14;

  return (
    <Modal
      visible={visible}
      onClose={onCancel}
      closeOnBackdrop={false}
    >
      <View style={styles.modalContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Check size={64} color={COLORS.status.success} />
          </View>
          
          <Heading2 style={styles.title}>
            QR Escaneado Exitosamente
          </Heading2>

          {/* Emergency Exit Row Warning */}
          {isEmergencyExitRow && (
            <View style={styles.emergencyWarning}>
              <View style={styles.emergencyHeader}>
                <BodyText style={styles.emergencyIcon}>⚠️</BodyText>
                <BodyText style={styles.emergencyTitle}>
                  FILA DE SALIDA DE EMERGENCIA
                </BodyText>
              </View>
              <BodyText style={styles.emergencySeat}>
                Asiento {passenger.seat} - Fila {rowNumber}
              </BodyText>
              <BodyText style={styles.emergencyText}>
                • Verificar que el pasajero sea mayor de 18 años{'\n'}
                • Sin discapacidades o servicios especiales{'\n'}
                • Capaz de asistir en caso de emergencia
              </BodyText>
            </View>
          )}

          {/* SEQ Number Display - HUGE for quick verification */}
          <View style={[
            styles.seqContainer,
            isEmergencyExitRow ? styles.seqContainerEmergency : styles.seqContainerNormal
          ]}>
            <BodyText style={styles.seqLabel}>
              SECUENCIA
            </BodyText>
            <BodyText style={styles.seqNumber}>
              {passenger.seq}
            </BodyText>
          </View>

          {/* Quick passenger info */}
          <View style={styles.passengerInfo}>
            <BodyText style={styles.passengerName}>
              {formatPassengerName(passenger.passenger)}
            </BodyText>
            <View style={styles.passengerDetails}>
              <BodyText style={[
                styles.seatInfo,
                isEmergencyExitRow && styles.seatInfoEmergency
              ]}>
                Asiento: <BodyText style={styles.seatValue}>{passenger.seat}</BodyText>
                {isEmergencyExitRow && (
                  <BodyText style={styles.emergencyLabel}> (EMERGENCIA)</BodyText>
                )}
              </BodyText>
              <BodyText style={styles.pnrInfo}>
                PNR: <BodyText style={styles.pnrValue}>{passenger.pnr}</BodyText>
              </BodyText>
            </View>
          </View>

          {/* Instructions */}
          <BodyText style={styles.instructions}>
            {isEmergencyExitRow 
              ? "⚠️ VERIFICAR REQUISITOS DE EMERGENCIA antes de confirmar."
              : "Verifica que los datos coincidan con el documento del pasajero."
            }
          </BodyText>

          {/* Action Buttons - Now inside ScrollView */}
          <View style={styles.buttonContainer}>
            <Button
              variant="outline"
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <View style={styles.buttonContent}>
                <X size={20} color={COLORS.text.secondary} />
                <BodyText style={styles.cancelButtonText}>Cancelar</BodyText>
              </View>
            </Button>
            
            <Button
              variant={isEmergencyExitRow ? "warning" : "primary"}
              onPress={onConfirm}
              loading={loading}
              style={styles.confirmButton}
            >
              <View style={styles.buttonContent}>
                <Check size={20} color="white" />
                <BodyText style={styles.confirmButtonText}>
                  {isEmergencyExitRow ? "Verificado" : "Confirmar"}
                </BodyText>
              </View>
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    maxHeight: '90%',
    minHeight: 400,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    color: COLORS.text.primary,
    marginBottom: SPACING.xl,
  },
  emergencyWarning: {
    backgroundColor: '#FEF3C7', // amber-50
    borderWidth: 2,
    borderColor: '#F59E0B', // amber-400
    borderRadius: BORDER_RADIUS.base,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    width: '100%',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  emergencyIcon: {
    fontSize: TYPOGRAPHY.size.xl,
    marginRight: SPACING.sm,
  },
  emergencyTitle: {
    color: '#92400E', // amber-800
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
  },
  emergencySeat: {
    color: '#92400E', // amber-800
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.sm,
  },
  emergencyText: {
    color: '#D97706', // amber-600
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.sm,
  },
  seqContainer: {
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.xl,
    minHeight: 80, // Altura mínima del contenedor para números grandes
  },
  seqContainerNormal: {
    backgroundColor: COLORS.primary.main,
  },
  seqContainerEmergency: {
    backgroundColor: COLORS.status.warning,
  },
  seqLabel: {
    color: COLORS.text.inverse,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.sm,
  },
  seqNumber: {
    color: COLORS.text.inverse,
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size['5xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    lineHeight: TYPOGRAPHY.size['5xl'] * 1.2, // Asegurar suficiente altura de línea
    minHeight: TYPOGRAPHY.size['5xl'] * 1.3, // Altura mínima para evitar cortes
  },
  passengerInfo: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  passengerName: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  passengerDetails: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatInfo: {
    marginRight: SPACING.md,
    color: COLORS.text.secondary,
  },
  seatInfoEmergency: {
    color: '#92400E', // amber-700
    fontWeight: TYPOGRAPHY.weight.bold,
  },
  seatValue: {
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  emergencyLabel: {
    color: '#D97706', // amber-600
  },
  pnrInfo: {
    color: COLORS.text.secondary,
  },
  pnrValue: {
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  instructions: {
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    fontSize: TYPOGRAPHY.size.sm,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: SPACING.md,
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },
  cancelButton: {
    minHeight: 56,
    paddingVertical: SPACING.lg,
  },
  confirmButton: {
    minHeight: 64,
    paddingVertical: SPACING.xl,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  confirmButtonText: {
    color: COLORS.text.inverse,
    marginLeft: SPACING.sm,
  },
}); 