import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NavBar } from '../../../../src/components/profile/NavBar';
import { ToggleRow } from '../../../../src/components/profile/ToggleRow';
import { useNotificationsStore } from '../../../../src/stores/notificationsStore';
import { COPY } from '../../../../src/constants/profileCopy';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
  OB_SPACING,
} from '../../../../src/constants/onboardingTheme';

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Converts a 24-hour time string ("22:00") to a 12-hour string ("10:00 PM").
 * Exported for unit-testing convenience.
 */
export function formatTime24to12(t: string): string {
  const [hourStr, minuteStr] = t.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? '00';
  const period = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const router = useRouter();
  const { prefs, isLoading, toggle } = useNotificationsStore();

  useEffect(() => {
    useNotificationsStore.getState().fetch();
  }, []);

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (isLoading && !prefs) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title={COPY.SETTINGS_NOTIFICATIONS_TITLE} onBackPress={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={OB_COLORS.cta} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleQuietHoursTimePress() {
    Alert.alert(
      COPY.SETTINGS_NOTIFICATIONS_QUIET_HOURS_COMING_SOON_TITLE,
      COPY.SETTINGS_NOTIFICATIONS_QUIET_HOURS_COMING_SOON_BODY,
    );
  }

  const startLabel = prefs?.notify_quiet_hours_start
    ? formatTime24to12(prefs.notify_quiet_hours_start)
    : '10:00 PM';
  const endLabel = prefs?.notify_quiet_hours_end
    ? formatTime24to12(prefs.notify_quiet_hours_end)
    : '7:00 AM';

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={COPY.SETTINGS_NOTIFICATIONS_TITLE} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ALERTS section */}
        <Text style={styles.sectionLabel}>
          {COPY.SETTINGS_NOTIFICATIONS_ALERTS_LABEL}
        </Text>
        <View style={styles.rows}>
          <ToggleRow
            label={COPY.SETTINGS_NOTIFICATIONS_DAILY_LOG}
            value={prefs?.notify_daily_log_reminder ?? false}
            onValueChange={() => toggle('notify_daily_log_reminder')}
          />
          <ToggleRow
            label={COPY.SETTINGS_NOTIFICATIONS_WEEKLY_INSIGHT}
            value={prefs?.notify_weekly_insight ?? false}
            onValueChange={() => toggle('notify_weekly_insight')}
          />
          <ToggleRow
            label={COPY.SETTINGS_NOTIFICATIONS_VET_APPOINTMENTS}
            value={prefs?.notify_vet_appointments ?? false}
            onValueChange={() => toggle('notify_vet_appointments')}
          />
          <ToggleRow
            label={COPY.SETTINGS_NOTIFICATIONS_GARDEN_MILESTONES}
            value={prefs?.notify_garden_milestones ?? false}
            onValueChange={() => toggle('notify_garden_milestones')}
          />
        </View>

        {/* QUIET HOURS section */}
        <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>
          {COPY.SETTINGS_NOTIFICATIONS_QUIET_HOURS_LABEL}
        </Text>
        <View style={styles.quietCard}>
          <Pressable
            onPress={handleQuietHoursTimePress}
            accessibilityRole="button"
            accessibilityLabel={`Quiet hours: ${startLabel} to ${endLabel}`}
            hitSlop={8}
          >
            <Text style={styles.quietTime}>
              {`${startLabel} → ${endLabel}`}
            </Text>
          </Pressable>
          <ToggleRow
            label=""
            value={prefs?.notify_quiet_hours_enabled ?? false}
            onValueChange={() => toggle('notify_quiet_hours_enabled')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  flex: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt4,
    paddingBottom: OB_SPACING.screenPaddingBottom + 24,
  },
  sectionLabel: {
    fontFamily: OB_FONTS.body,
    fontSize: 11,
    color: OB_COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: OB_SPACING.mt2,
  },
  sectionLabelTop: {
    marginTop: OB_SPACING.gap4,
  },
  rows: {
    gap: OB_SPACING.gap3,
  },
  // Quiet hours card
  quietCard: {
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: 18,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: OB_SPACING.mt2,
    ...OB_SHADOWS.card,
  },
  quietTime: {
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    color: OB_COLORS.cta,
    textDecorationLine: 'underline',
  },
});
