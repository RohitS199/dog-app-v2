import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { NavBar } from '../../../src/components/profile/NavBar';
import { PerkRow } from '../../../src/components/profile/PerkRow';
import { RowItem } from '../../../src/components/profile/RowItem';
import { CardGlyph } from '../../../src/components/profile/glyphs';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { COPY } from '../../../src/constants/profileCopy';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
  OB_SPACING,
} from '../../../src/constants/onboardingTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_CARD_BG = '#475E3D'; // forest green per spec §9.3
const BILLING_URL_IOS = 'itms-apps://apps.apple.com/account/subscriptions';
const BILLING_URL_ANDROID = 'https://play.google.com/store/account/subscriptions';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function MySubscriptionScreen() {
  const router = useRouter();
  const { details, isLoadingDetails, detailsError, fetchSubscription } =
    useSubscriptionStore();

  useEffect(() => {
    useSubscriptionStore.getState().fetchSubscription();
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleManageBilling() {
    const url = Platform.OS === 'ios' ? BILLING_URL_IOS : BILLING_URL_ANDROID;
    Linking.openURL(url).catch(() => {});
  }

  function handleCancelSubscription() {
    Alert.alert(
      COPY.MY_SUBSCRIPTION_CANCEL_COMING_SOON_TITLE,
      COPY.MY_SUBSCRIPTION_CANCEL_COMING_SOON_BODY,
    );
  }

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (isLoadingDetails) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title={COPY.MY_SUBSCRIPTION_TITLE} onBackPress={() => router.back()} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={OB_COLORS.cta} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── Error state ───────────────────────────────────────────────────────────

  if (detailsError || !details) {
    return (
      <SafeAreaView style={styles.safe}>
        <NavBar title={COPY.MY_SUBSCRIPTION_TITLE} onBackPress={() => router.back()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>{COPY.MY_SUBSCRIPTION_ERROR_TITLE}</Text>
          <Pressable
            onPress={fetchSubscription}
            accessibilityRole="button"
            accessibilityLabel={COPY.MY_SUBSCRIPTION_ERROR_RETRY}
            style={styles.retryBtn}
          >
            <Text style={styles.retryBtnText}>{COPY.MY_SUBSCRIPTION_ERROR_RETRY}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Loaded state ──────────────────────────────────────────────────────────

  const renewalLabel = details.isActive
    ? COPY.MY_SUBSCRIPTION_RENEWS_PREFIX + details.renewalDate
    : COPY.MY_SUBSCRIPTION_EXPIRED_PREFIX + details.renewalDate;

  const badgeLabel = details.isActive
    ? COPY.MY_SUBSCRIPTION_BADGE_ACTIVE
    : COPY.MY_SUBSCRIPTION_BADGE_INACTIVE;

  return (
    <SafeAreaView style={styles.safe}>
      <NavBar title={COPY.MY_SUBSCRIPTION_TITLE} onBackPress={() => router.back()} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Plan card */}
        <View style={styles.planCard}>
          {/* Top row: plan name + badge */}
          <View style={styles.planCardTopRow}>
            <Text style={styles.planName}>{details.plan}</Text>
            <View style={[styles.badge, !details.isActive && styles.badgeInactive]}>
              <Text style={[styles.badgeText, !details.isActive && styles.badgeTextInactive]}>
                {badgeLabel}
              </Text>
            </View>
          </View>

          {/* Bottom row: renewal date + price */}
          <View style={styles.planCardBottomRow}>
            <Text style={styles.renewalText}>{renewalLabel}</Text>
            <Text style={styles.priceText}>{details.price}</Text>
          </View>
        </View>

        {/* "what's included" section */}
        <Text style={styles.sectionLabel}>
          {COPY.MY_SUBSCRIPTION_PLAN_INCLUDED_LABEL.toUpperCase()}
        </Text>

        <View style={styles.perksContainer}>
          {details.perks.map((perk) => (
            <PerkRow key={perk} text={perk} />
          ))}
        </View>

        {/* Manage Billing row */}
        <View style={styles.billingRow}>
          <RowItem
            label={COPY.MY_SUBSCRIPTION_MANAGE_BILLING}
            icon={<CardGlyph size={22} />}
            onPress={handleManageBilling}
          />
        </View>

        {/* Cancel Subscription link */}
        <Pressable
          onPress={handleCancelSubscription}
          accessibilityRole="button"
          accessibilityLabel={COPY.MY_SUBSCRIPTION_CANCEL}
          style={styles.cancelPressable}
        >
          <Text style={styles.cancelText}>{COPY.MY_SUBSCRIPTION_CANCEL}</Text>
        </Pressable>
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
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: OB_SPACING.screenPaddingH,
  },
  scrollContent: {
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt4,
    paddingBottom: OB_SPACING.screenPaddingBottom + 24,
  },

  // Plan card
  planCard: {
    backgroundColor: PLAN_CARD_BG,
    borderRadius: 18,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    padding: OB_SPACING.cardPadding,
    marginBottom: OB_SPACING.gap4,
    ...OB_SHADOWS.card,
  },
  planCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: OB_SPACING.mt3,
  },
  planCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  planName: {
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.cream,
  },
  renewalText: {
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.cream,
    opacity: 0.85,
  },
  priceText: {
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.cream,
    textAlign: 'right',
  },

  // Active/inactive badge
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: OB_COLORS.cream,
  },
  badgeInactive: {
    backgroundColor: OB_COLORS.muted,
  },
  badgeText: {
    fontFamily: OB_FONTS.body,
    fontSize: 11,
    color: OB_COLORS.ink,
    textTransform: 'lowercase',
  },
  badgeTextInactive: {
    color: OB_COLORS.cream,
  },

  // Section label
  sectionLabel: {
    fontFamily: OB_FONTS.body,
    fontSize: 11,
    color: OB_COLORS.muted,
    letterSpacing: 0.8,
    marginBottom: OB_SPACING.mt2,
  },

  // Perks list
  perksContainer: {
    marginBottom: OB_SPACING.gap4,
  },

  // Manage Billing row
  billingRow: {
    marginBottom: OB_SPACING.gap4,
  },

  // Cancel link
  cancelPressable: {
    alignItems: 'center',
    paddingVertical: OB_SPACING.mt3,
  },
  cancelText: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.red,
    textDecorationLine: 'underline',
  },

  // Error state
  errorText: {
    fontFamily: OB_FONTS.h2,
    fontSize: 16,
    color: OB_COLORS.ink,
    textAlign: 'center',
    marginBottom: OB_SPACING.gap4,
  },
  retryBtn: {
    paddingHorizontal: OB_SPACING.cardPadding,
    paddingVertical: OB_SPACING.mt3,
    backgroundColor: OB_COLORS.cta,
    borderRadius: OB_RADII.button,
  },
  retryBtnText: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.ctaText,
  },
});
