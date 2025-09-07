import { useRouter } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BodyText,
  BodyTextSecondary,
  Button,
  Card,
  CardContent,
  Heading1,
  Heading2,
  Input
} from '../components/ui';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import { useAddUserFlight } from '../hooks/use-settings';
import { Flight } from '../types';
import { debug } from '../utils/debug';

/**
 * Create Flight Screen - Allows users to create flight routes
 * 
 * DEBUG: Watch for navigation and state issues
 */
export default function CreateFlightScreen() {
  debug.app('CreateFlightScreen: Component render started');
  const router = useRouter();
  const addUserFlightMutation = useAddUserFlight();
  
  const [flightNumber, setFlightNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    // Validation
    if (!flightNumber.trim()) {
      Alert.alert('Error', 'El número de vuelo es obligatorio');
      return;
    }

    const newFlight: Omit<Flight, 'id'> = {
      flightNumber: flightNumber.trim().toUpperCase(),
      route: `${flightNumber.trim().toUpperCase()} Route`, // Auto-generate a simple route
      date: new Date().toISOString().split('T')[0] || '', // Default to today
      time: '00:00', // Default time, not important for route definition
      ...(description.trim() ? { description: description.trim() } : {}),
    };

    try {
      await addUserFlightMutation.mutateAsync(newFlight);
      Alert.alert(
        'Vuelo Creado',
        `El vuelo ${newFlight.flightNumber} ha sido creado exitosamente.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating flight:', error);
      Alert.alert('Error', 'No se pudo crear el vuelo. Intenta nuevamente.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Heading1 style={styles.headerTitle}>
                Crear Nuevo Vuelo
              </Heading1>
              <BodyTextSecondary>
                Solo necesitas el número de vuelo
              </BodyTextSecondary>
            </View>
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Flight Number */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>
              Número de Vuelo
            </Heading2>
            <Input
              placeholder="Ej: 3192, 3191"
              value={flightNumber}
              onChangeText={setFlightNumber}
              autoCapitalize="characters"
              maxLength={10}
            />
            <BodyTextSecondary style={styles.helperText}>
              Este es el número que aparecerá en las tarjetas de embarque
            </BodyTextSecondary>
            
            {/* Quick suggestions for flight numbers */}
            <View style={styles.suggestionsContainer}>
              {['3192', '3191', '3193'].map((suggestion) => (
                <TouchableOpacity
                  key={suggestion}
                  onPress={() => setFlightNumber(suggestion)}
                  style={styles.suggestionButton}
                >
                  <BodyText style={styles.suggestionText}>{suggestion}</BodyText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description (Optional) */}
          <View style={styles.section}>
            <Heading2 style={styles.sectionTitle}>
              Descripción (Opcional)
            </Heading2>
            <Input
              placeholder="Ej: Vuelo matutino, Vuelo principal Trelew"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
              maxLength={100}
            />
            <BodyTextSecondary style={styles.helperText}>
              Descripción opcional para identificar mejor el vuelo
            </BodyTextSecondary>
          </View>

          {/* Info Box */}
          <Card variant="default" style={styles.infoCard}>
            <CardContent>
              <BodyText style={styles.infoTitle}>
                💡 ¿Cómo funciona?
              </BodyText>
              <BodyText style={styles.infoText}>
                • Creas el vuelo una sola vez{'\n'}
                • Cada vez que trabajas, seleccionas este vuelo{'\n'}
                • La app crea automáticamente una nueva sesión de embarque{'\n'}
                • Al finalizar, borras los datos y puedes usar el vuelo nuevamente
              </BodyText>
            </CardContent>
          </Card>

          {/* Save Button */}
          <View style={styles.footer}>
          <Button
            onPress={handleSave}
            disabled={addUserFlightMutation.isPending || !flightNumber}
            variant="primary"
            size="lg"
            style={styles.saveButton}
          >
            <View style={styles.saveButtonContent}>
              <Save 
                size={20} 
                color={addUserFlightMutation.isPending || !flightNumber ? COLORS.text.secondary : "white"} 
              />
              <BodyText style={styles.saveButtonText}>
                {addUserFlightMutation.isPending ? 'Guardando...' : 'Crear Vuelo'}
              </BodyText>
            </View>
          </Button>

          {/* Credits */}
          <BodyTextSecondary style={styles.creditsText}>
            Visión: Adrián Zacarías Chiquichano • Desarrollo: Ignacio Guzmán
          </BodyTextSecondary>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    backgroundColor: COLORS.background.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.base,
    padding: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    marginBottom: SPACING.base,
  },

  helperText: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.base,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
  },
  suggestionButton: {
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.sm,
  },
  suggestionText: {
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.size.sm,
  },
  infoCard: {
    backgroundColor: '#EBF8FF', // blue-50
    borderColor: '#90CDF4', // blue-200
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  infoTitle: {
    color: '#1E3A8A', // blue-900
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
  },
  infoText: {
    color: '#1E40AF', // blue-800
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed * TYPOGRAPHY.size.sm,
  },
  previewCard: {
    backgroundColor: '#F0FDF4', // green-50
    borderColor: '#86EFAC', // green-200
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  previewTitle: {
    color: '#14532D', // green-900
    fontWeight: TYPOGRAPHY.weight.semibold,
    marginBottom: SPACING.sm,
  },
  previewFlightNumber: {
    color: '#15803D', // green-800
    fontSize: TYPOGRAPHY.size.base,
    fontWeight: TYPOGRAPHY.weight.semibold,
  },
  previewDescription: {
    color: '#16A34A', // green-600
    fontStyle: 'italic',
    marginTop: SPACING.xs,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.base,
    marginTop: SPACING.xl,
    marginBottom: SPACING['2xl'],
  },
  saveButton: {
    marginBottom: SPACING.base,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weight.semibold,
    fontSize: TYPOGRAPHY.size.sm,
    marginLeft: SPACING.sm,
  },
  creditsText: {
    textAlign: 'center',
    fontSize: TYPOGRAPHY.size.xs,
  },
}); 