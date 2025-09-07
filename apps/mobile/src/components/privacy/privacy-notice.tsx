import { Database, Eye, Lock, Shield } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { BodyText, Button, Heading1, Heading2, Modal } from '../ui';

interface PrivacyNoticeProps {
  visible: boolean;
  onAccept: () => void;
  isFirstTime?: boolean;
}

export function PrivacyNotice({ visible, onAccept, isFirstTime = true }: PrivacyNoticeProps) {
  return (
    <Modal
      visible={visible}
      onClose={onAccept}
      closeOnBackdrop={false}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.container}>
          {/* Header with Shield Icon */}
          <View style={styles.header}>
            <Shield size={48} color={COLORS.primary.main} />
            <Heading1 style={styles.title}>
              Tu Privacidad es Nuestra Prioridad
            </Heading1>
          </View>

          {/* Privacy Features */}
          <View style={styles.featuresContainer}>
            {/* Local Storage */}
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Database size={24} color={COLORS.status.success} />
              </View>
              <View style={styles.featureText}>
                <Heading2 style={styles.featureTitle}>
                  100% Local
                </Heading2>
                <BodyText style={styles.featureDescription}>
                  Todos los datos de pasajeros se almacenan únicamente en tu dispositivo. 
                  No hay servidores externos ni bases de datos en la nube.
                </BodyText>
              </View>
            </View>

            {/* No Personal Data Sharing */}
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Lock size={24} color={COLORS.status.success} />
              </View>
              <View style={styles.featureText}>
                <Heading2 style={styles.featureTitle}>
                  Sin Compartir Datos Personales
                </Heading2>
                <BodyText style={styles.featureDescription}>
                  Nunca compartimos nombres, números de asiento, PNR o cualquier 
                  información personal de los pasajeros.
                </BodyText>
              </View>
            </View>

            {/* Anonymous Analytics */}
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Eye size={24} color={COLORS.status.info} />
              </View>
              <View style={styles.featureText}>
                <Heading2 style={styles.featureTitle}>
                  Estadísticas Anónimas
                </Heading2>
                <BodyText style={styles.featureDescription}>
                  Solo recopilamos métricas básicas: cantidad de escaneos, 
                  tiempo de uso y número de vuelos creados. Sin datos personales.
                </BodyText>
              </View>
            </View>
          </View>

          {/* Accept Button */}
          <Button
            variant="primary"
            onPress={onAccept}
            style={styles.acceptButton}
          >
            {isFirstTime ? 'Entendido, Comenzar' : 'Cerrar'}
          </Button>

          {/* Footer Note */}
          <BodyText style={styles.footerNote}>
            Puedes revisar esta información en cualquier momento 
            desde Configuración → Privacidad
          </BodyText>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    alignItems: 'center',
    padding:16
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    marginTop: SPACING.md,
    textAlign: 'center',
    color: COLORS.text.primary,
    fontSize: TYPOGRAPHY.size.xl,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.sm,
  },
  commitment: {
    backgroundColor: COLORS.primary.light,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.base,
    width: '100%',
    marginBottom: SPACING.lg,
  },
  commitmentText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.primary.dark,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.sm,
  },
  trackingInfo: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  trackingTitle: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  trackingList: {
    gap: SPACING.sm,
  },
  trackingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  trackingItemText: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
    flex: 1,
  },
  acceptButton: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  footerNote: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});