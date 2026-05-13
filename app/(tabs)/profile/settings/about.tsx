import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import * as StoreReview from 'expo-store-review';

import { NavBar } from '../../../../src/components/profile/NavBar';
import { RowItem } from '../../../../src/components/profile/RowItem';
import { HeartGlyph, EnvelopeIcon, CardGlyph } from '../../../../src/components/profile/glyphs';
import { COPY } from '../../../../src/constants/profileCopy';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
  OB_SPACING,
} from '../../../../src/constants/onboardingTheme';

// ─── Version helpers ──────────────────────────────────────────────────────────

const version = Constants.expoConfig?.version ?? '0.0.0';
const build =
  Platform.OS === 'ios'
    ? Constants.expoConfig?.ios?.buildNumber ?? '—'
    : Constants.expoConfig?.android?.versionCode?.toString() ?? '—';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AboutScreen() {
  const router = useRouter();

  // ─── Handlers ──────────────────────────────────────────────────────────────

  async function handleRate() {
    if (Platform.OS === 'ios') {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
      }
    } else {
      // TODO: replace with real Play Store listing URL once the app is published
      Linking.openURL('https://play.google.com/store/apps/details?id=app.puplog').catch(
        () => {},
      );
    }
  }

  function handleShare() {
    Share.share({ message: COPY.SETTINGS_ABOUT_TELL_FRIEND_MESSAGE }).catch(() => {});
  }

  function handleFollow() {
    Alert.alert(
      COPY.SETTINGS_ABOUT_FOLLOW_COMING_SOON_TITLE,
      COPY.SETTINGS_ABOUT_FOLLOW_COMING_SOON_BODY,
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={COPY.SETTINGS_ABOUT_TITLE} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App icon tile */}
        <View style={styles.iconTile} accessibilityElementsHidden>
          <Text style={styles.iconChar}>{'P'}</Text>
        </View>

        {/* App name */}
        <Text style={styles.appName}>{COPY.SETTINGS_ABOUT_APP_NAME}</Text>

        {/* Version line */}
        <Text style={styles.versionLine}>
          {`v ${version} · build ${build}`}
        </Text>

        {/* Mission card */}
        <View style={styles.missionCard}>
          <Text style={styles.missionText}>{COPY.SETTINGS_ABOUT_MISSION}</Text>
        </View>

        {/* Action rows */}
        <View style={styles.rows}>
          <RowItem
            label={COPY.SETTINGS_ABOUT_RATE}
            icon={<HeartGlyph size={22} />}
            onPress={handleRate}
          />
          <RowItem
            label={COPY.SETTINGS_ABOUT_TELL_FRIEND}
            icon={<EnvelopeIcon size={22} />}
            onPress={handleShare}
          />
          <RowItem
            label={COPY.SETTINGS_ABOUT_FOLLOW}
            icon={<CardGlyph size={22} />}
            onPress={handleFollow}
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
  scrollContent: {
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt4,
    paddingBottom: OB_SPACING.screenPaddingBottom + 24,
    alignItems: 'center',
  },

  // App icon tile — 72x72 peach rounded square
  iconTile: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: OB_COLORS.peach,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    alignItems: 'center',
    justifyContent: 'center',
    ...OB_SHADOWS.card,
  },
  iconChar: {
    fontFamily: OB_FONTS.h1,
    fontSize: 40,
    color: OB_COLORS.ink,
    lineHeight: 48,
  },

  // App name
  appName: {
    fontFamily: OB_FONTS.h1,
    fontSize: 28,
    color: OB_COLORS.ink,
    textAlign: 'center',
    marginTop: 12,
  },

  // Version line
  versionLine: {
    fontFamily: OB_FONTS.body,
    fontSize: 12,
    color: OB_COLORS.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: OB_SPACING.gap4,
  },

  // Mission card — cream bg, sketch border, italic text
  missionCard: {
    alignSelf: 'stretch',
    backgroundColor: OB_COLORS.cream2,
    borderRadius: 18,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    padding: OB_SPACING.cardPadding,
    marginBottom: OB_SPACING.gap4,
    ...OB_SHADOWS.card,
  },
  missionText: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.ink2,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
  },

  // Action rows
  rows: {
    alignSelf: 'stretch',
    gap: OB_SPACING.gap3,
  },
});
