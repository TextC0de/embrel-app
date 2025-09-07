import { View, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/use-settings';
import { ChevronLeft, Monitor, Settings as SettingsIcon, Volume2, Vibrate, Sun, ChevronRight } from 'lucide-react-native';
import { BodyText, BodyTextSecondary, Heading1, Card, CardContent } from '@/components/ui';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@/constants/theme';

export default function SettingsScreen() {
  const { data: settings } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = async (key: keyof NonNullable<typeof settings>, value: boolean) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    setLocalSettings(newSettings);
    
    try {
      await updateSettingsMutation.mutateAsync(newSettings);
    } catch (error) {
      // Revert on error
      setLocalSettings(settings);
      console.error('Error updating settings:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Configuración',
          headerBackTitle: 'Atrás',
          headerTintColor: COLORS.text.primary,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Heading1 style={styles.headerTitle}>Configuración</Heading1>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Desktop Mode Section */}
        <Card style={styles.sectionCard}>
          <TouchableOpacity
            onPress={() => router.push('/settings/desktop-mode')}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <Monitor size={20} color={COLORS.status.info} />
              </View>
              <View style={styles.menuItemContent}>
                <BodyText style={styles.menuItemTitle}>Modo Desktop</BodyText>
                <BodyTextSecondary style={styles.menuItemSubtitle}>
                  Conecta con EMBREL Desktop
                </BodyTextSecondary>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              {(localSettings || settings)?.desktopModeEnabled && (
                <View style={styles.activeIndicator} />
              )}
              <ChevronRight size={20} color={COLORS.text.secondary} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* General Settings */}
        <Card style={styles.sectionCard}>
          <CardContent style={styles.cardContent}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <SettingsIcon size={20} color={COLORS.text.secondary} />
              <BodyText style={styles.sectionTitle}>General</BodyText>
            </View>

            {/* Sound Setting */}
            <View style={[styles.settingItem, styles.settingItemBorder]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Volume2 size={18} color={COLORS.text.secondary} />
                </View>
                <View>
                  <BodyText style={styles.settingTitle}>Sonidos</BodyText>
                  <BodyTextSecondary style={styles.settingSubtitle}>
                    Reproducir sonidos de confirmación
                  </BodyTextSecondary>
                </View>
              </View>
              <Switch
                value={(localSettings || settings)?.soundEnabled || false}
                onValueChange={(value) => handleSettingChange('soundEnabled', value)}
                trackColor={{ false: COLORS.border.light, true: COLORS.status.info }}
                thumbColor={COLORS.background.white}
                ios_backgroundColor={COLORS.border.light}
              />
            </View>

            {/* Vibration Setting */}
            <View style={[styles.settingItem, styles.settingItemBorder]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Vibrate size={18} color={COLORS.text.secondary} />
                </View>
                <View>
                  <BodyText style={styles.settingTitle}>Vibración</BodyText>
                  <BodyTextSecondary style={styles.settingSubtitle}>
                    Vibrar al escanear códigos
                  </BodyTextSecondary>
                </View>
              </View>
              <Switch
                value={(localSettings || settings)?.vibrationEnabled || false}
                onValueChange={(value) => handleSettingChange('vibrationEnabled', value)}
                trackColor={{ false: COLORS.border.light, true: COLORS.status.info }}
                thumbColor={COLORS.background.white}
                ios_backgroundColor={COLORS.border.light}
              />
            </View>

            {/* Keep Screen On Setting */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Sun size={18} color={COLORS.text.secondary} />
                </View>
                <View>
                  <BodyText style={styles.settingTitle}>Mantener pantalla activa</BodyText>
                  <BodyTextSecondary style={styles.settingSubtitle}>
                    Evitar que la pantalla se apague
                  </BodyTextSecondary>
                </View>
              </View>
              <Switch
                value={(localSettings || settings)?.keepScreenOn || false}
                onValueChange={(value) => handleSettingChange('keepScreenOn', value)}
                trackColor={{ false: COLORS.border.light, true: COLORS.status.info }}
                thumbColor={COLORS.background.white}
                ios_backgroundColor={COLORS.border.light}
              />
            </View>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card variant="outlined" style={styles.appInfoCard}>
          <CardContent style={styles.appInfoContent}>
            <BodyTextSecondary style={styles.appVersion}>EMBREL v1.0.0</BodyTextSecondary>
            <BodyTextSecondary style={styles.appDescription}>Sistema de embarque</BodyTextSecondary>
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
  cardContent: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 60,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.base,
    backgroundColor: COLORS.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  menuItemSubtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.status.success,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    minHeight: 72,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconContainer: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.normal,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  settingSubtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
  },
  appInfoCard: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.background.light,
  },
  appInfoContent: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  appVersion: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  appDescription: {
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    opacity: 0.8,
  },
});