import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';

import { NavBar } from '../../../../src/components/profile/NavBar';
import { RowItem } from '../../../../src/components/profile/RowItem';
import { ToggleRow } from '../../../../src/components/profile/ToggleRow';
import { LockGlyph, GearGlyph, HeartGlyph } from '../../../../src/components/profile/glyphs';
import { useNotificationsStore } from '../../../../src/stores/notificationsStore';
import { COPY } from '../../../../src/constants/profileCopy';
import {
  OB_COLORS,
  OB_SPACING,
} from '../../../../src/constants/onboardingTheme';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SecurityScreen() {
  const router = useRouter();
  const { prefs, isLoading, toggle } = useNotificationsStore();

  // Guard against double-tap while Face ID prompt is open
  const [faceIdPending, setFaceIdPending] = useState(false);

  useEffect(() => {
    useNotificationsStore.getState().fetch();
  }, []);

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (isLoading && !prefs) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title={COPY.SETTINGS_SECURITY_TITLE} onBackPress={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={OB_COLORS.cta} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleFaceIdToggle(next: boolean) {
    if (faceIdPending) return;

    if (!next) {
      // Disabling — no auth required
      toggle('face_id_enabled');
      return;
    }

    // Enabling — gate with hardware + enrollment check + auth prompt
    setFaceIdPending(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        Alert.alert(
          COPY.SETTINGS_SECURITY_FACE_ID_UNAVAILABLE_TITLE,
          COPY.SETTINGS_SECURITY_FACE_ID_UNAVAILABLE_BODY,
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: COPY.SETTINGS_SECURITY_FACE_ID_PROMPT,
      });

      if (result.success) {
        toggle('face_id_enabled');
      }
      // If cancelled / failed — just leave the toggle at false. No alert needed.
    } finally {
      setFaceIdPending(false);
    }
  }

  function handleTwoFactorToggle(next: boolean) {
    if (next) {
      // Turning ON — show coming soon, do not persist
      Alert.alert(
        COPY.SETTINGS_SECURITY_TWO_FACTOR_COMING_SOON_TITLE,
        COPY.SETTINGS_SECURITY_TWO_FACTOR_COMING_SOON_BODY,
      );
      // Do NOT call toggle — leave it off
    } else {
      // Turning OFF — immediate
      toggle('two_factor_enabled');
    }
  }

  function handleComingSoon() {
    Alert.alert(
      COPY.SETTINGS_SECURITY_COMING_SOON_TITLE,
      COPY.SETTINGS_SECURITY_COMING_SOON_BODY,
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={COPY.SETTINGS_SECURITY_TITLE} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rows}>
          <RowItem
            label={COPY.SETTINGS_SECURITY_CHANGE_PASSWORD}
            icon={<LockGlyph size={22} />}
            onPress={() => router.push('/change-password')}
          />

          <ToggleRow
            label={COPY.SETTINGS_SECURITY_FACE_ID}
            sub={COPY.SETTINGS_SECURITY_FACE_ID_SUB}
            value={prefs?.face_id_enabled ?? false}
            onValueChange={handleFaceIdToggle}
            disabled={faceIdPending}
          />

          <ToggleRow
            label={COPY.SETTINGS_SECURITY_TWO_FACTOR}
            sub={COPY.SETTINGS_SECURITY_TWO_FACTOR_SUB}
            value={prefs?.two_factor_enabled ?? false}
            onValueChange={handleTwoFactorToggle}
          />

          <RowItem
            label={COPY.SETTINGS_SECURITY_ACTIVE_DEVICES}
            icon={<GearGlyph size={22} />}
            onPress={handleComingSoon}
          />

          <RowItem
            label={COPY.SETTINGS_SECURITY_DOWNLOAD_DATA}
            icon={<HeartGlyph size={22} />}
            onPress={handleComingSoon}
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
  rows: {
    gap: OB_SPACING.gap3,
  },
});
