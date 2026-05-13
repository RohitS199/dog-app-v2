import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NavBar } from '../../../../src/components/profile/NavBar';
import { RowItem } from '../../../../src/components/profile/RowItem';
import { ToggleRow } from '../../../../src/components/profile/ToggleRow';
import { useNotificationsStore } from '../../../../src/stores/notificationsStore';
import { COPY } from '../../../../src/constants/profileCopy';
import {
  OB_COLORS,
  OB_FONTS,
  OB_SPACING,
} from '../../../../src/constants/onboardingTheme';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PrivacyScreen() {
  const router = useRouter();
  const { prefs, isLoading, toggle } = useNotificationsStore();

  useEffect(() => {
    useNotificationsStore.getState().fetch();
  }, []);

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (isLoading && !prefs) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title={COPY.SETTINGS_PRIVACY_TITLE} onBackPress={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={OB_COLORS.cta} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handlePrivacyPolicy() {
    Alert.alert(
      COPY.SETTINGS_PRIVACY_POLICY_COMING_SOON_TITLE,
      COPY.SETTINGS_PRIVACY_POLICY_COMING_SOON_BODY,
    );
  }

  function handleCookiePolicy() {
    Alert.alert(
      COPY.SETTINGS_PRIVACY_COOKIE_COMING_SOON_TITLE,
      COPY.SETTINGS_PRIVACY_COOKIE_COMING_SOON_BODY,
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={COPY.SETTINGS_PRIVACY_TITLE} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* DOCUMENTS section */}
        <Text style={styles.sectionLabel}>
          {COPY.SETTINGS_PRIVACY_DOCUMENTS_LABEL}
        </Text>
        <View style={styles.rows}>
          <RowItem
            label={COPY.SETTINGS_PRIVACY_POLICY}
            onPress={handlePrivacyPolicy}
          />
          <RowItem
            label={COPY.SETTINGS_PRIVACY_TERMS}
            onPress={() => router.push('/terms?mode=view' as Parameters<typeof router.push>[0])}
          />
          <RowItem
            label={COPY.SETTINGS_PRIVACY_COOKIE}
            onPress={handleCookiePolicy}
          />
        </View>

        {/* YOUR DATA section */}
        <Text style={[styles.sectionLabel, styles.sectionLabelTop]}>
          {COPY.SETTINGS_PRIVACY_YOUR_DATA_LABEL}
        </Text>
        <View style={styles.rows}>
          <ToggleRow
            label={COPY.SETTINGS_PRIVACY_ANALYTICS}
            sub={COPY.SETTINGS_PRIVACY_ANALYTICS_SUB}
            value={prefs?.privacy_anonymous_analytics ?? false}
            onValueChange={() => toggle('privacy_anonymous_analytics')}
          />
          <ToggleRow
            label={COPY.SETTINGS_PRIVACY_PERSONALIZED}
            sub={COPY.SETTINGS_PRIVACY_PERSONALIZED_SUB}
            value={prefs?.privacy_personalized_tips ?? false}
            onValueChange={() => toggle('privacy_personalized_tips')}
          />
          <ToggleRow
            label={COPY.SETTINGS_PRIVACY_MARKETING}
            sub={COPY.SETTINGS_PRIVACY_MARKETING_SUB}
            value={prefs?.privacy_marketing_emails ?? false}
            onValueChange={() => toggle('privacy_marketing_emails')}
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
});
