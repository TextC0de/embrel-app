import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';
import { PassengerData } from '../../types';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';
import { BodyText, Caption } from '../ui/Text';

interface PassengerCardProps {
  passenger: PassengerData;
  onPress?: () => void;
  showFullDetails?: boolean;
}

export const PassengerCard: React.FC<PassengerCardProps> = memo(({
  passenger,
  onPress,
  showFullDetails = false,
}) => {
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
  const seatVariant = isEmergencyExitRow ? 'warning' : 'info';

  const CardWrapper = onPress ? TouchableOpacity : View;
  
  return (
    <CardWrapper onPress={onPress} style={styles.cardWrapper}>
      <Card
        variant="outlined"
        style={styles.card}
      >
        <CardContent>
        <View style={styles.cardContent}>
          <View style={styles.contentContainer}>
            {/* SEQ Number - MUCH BIGGER for airport use */}
            <View style={styles.seqAndSeatContainer}>
              <View style={styles.seqContainer}>
                <Caption style={styles.seqLabel}>SEQ</Caption>
                <BodyText style={styles.seqNumber}>
                  {passenger.seq}
                </BodyText>
              </View>
              
              <Badge variant={seatVariant} size="md" style={styles.seatBadge}>
                {passenger.seat}
              </Badge>
            </View>

            {/* Passenger Name */}
            <BodyText style={styles.passengerName}>
              {formatPassengerName(passenger.passenger)}
            </BodyText>

            {/* Additional Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Caption style={styles.detailLabel}>
                  PNR
                </Caption>
                <BodyText style={styles.detailValue}>
                  {passenger.pnr}
                </BodyText>
              </View>
              <View style={styles.detailItem}>
                <Caption style={styles.detailLabel}>
                  Vuelo
                </Caption>
                <BodyText style={styles.detailValue}>
                  JA {passenger.flight}
                </BodyText>
              </View>
            </View>

            {/* Full Details - shown in confirmation modal */}
            {showFullDetails && (
              <View style={styles.fullDetailsContainer}>
                <Caption style={styles.fullDetailsTitle}>
                  Información de Embarque
                </Caption>
                <View style={styles.fullDetailsContent}>
                  <View style={styles.fullDetailRow}>
                    <BodyText style={styles.fullDetailLabel}>
                      Secuencia:
                    </BodyText>
                    <BodyText style={styles.fullDetailValue}>{passenger.seq}</BodyText>
                  </View>
                  <View style={styles.fullDetailRow}>
                    <BodyText style={styles.fullDetailLabel}>
                      Asiento:
                    </BodyText>
                    <BodyText style={styles.fullDetailValue}>{passenger.seat}</BodyText>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </CardContent>
    </Card>
    </CardWrapper>
  );
});

PassengerCard.displayName = 'PassengerCard';

const styles = StyleSheet.create({
  cardWrapper: {
    // Container for touchable functionality
  },
  card: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentContainer: {
    flex: 1,
  },
  seqAndSeatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  seqContainer: {
    backgroundColor: COLORS.primary.main,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.base,
  },
  seqLabel: {
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.xs,
  },
  seqNumber: {
    fontSize: TYPOGRAPHY.size['3xl'],
    fontWeight: TYPOGRAPHY.weight.bold,
    color: COLORS.text.inverse,
  },
  seatBadge: {
    marginLeft: SPACING.base,
  },
  passengerName: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.base,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    marginRight: SPACING.md,
  },
  detailLabel: {
    color: COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text.secondary,
  },
  fullDetailsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  fullDetailsTitle: {
    color: COLORS.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: TYPOGRAPHY.weight.medium,
    marginBottom: SPACING.base,
  },
  fullDetailsContent: {
    // Additional styling for full details
  },
  fullDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  fullDetailLabel: {
    color: COLORS.text.secondary,
  },
  fullDetailValue: {
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text.primary,
  },
}); 