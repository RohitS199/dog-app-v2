import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuthStore } from '../../../src/stores/authStore';
import { useProfileStore } from '../../../src/stores/profileStore';
import { useDogStore } from '../../../src/stores/dogStore';
import { useCheckInStore } from '../../../src/stores/checkInStore';
import { useHealthStore } from '../../../src/stores/healthStore';
import { useLearnStore } from '../../../src/stores/learnStore';
import { useArticleTransitionStore } from '../../../src/stores/articleTransitionStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { useOnboardingStore } from '../../../src/stores/onboardingStore';
import { useNotificationsStore } from '../../../src/stores/notificationsStore';
import { useUserAchievementsStore } from '../../../src/stores/userAchievementsStore';

import { WoodPortrait } from '../../../src/components/profile/WoodPortrait';
import { NavButton } from '../../../src/components/profile/NavButton';
import { PillButton } from '../../../src/components/profile/PillButton';
import { LogOutModal } from '../../../src/components/profile/LogOutModal';
import { PawPrintMotif } from '../../../src/components/profile/PawPrintMotif';
import { StickerCollection } from '../../../src/components/profile/stickers/StickerCollection';
import { StickerDetailContent } from '../../../src/components/profile/stickers/StickerDetailContent';
import { StickerEarnCelebration } from '../../../src/components/profile/stickers/StickerEarnCelebration';
import { STICKERS, type StickerId } from '../../../src/constants/achievements';
import {
  PersonIcon,
  CardGlyph,
  GearGlyph,
} from '../../../src/components/profile/glyphs';
import { COPY } from '../../../src/constants/profileCopy';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
  OB_SPACING,
} from '../../../src/constants/onboardingTheme';

// Display name format per spec section 9.1:
//   "Aman R." when both names set; "Aman" first-only; "PupLog User" neither.
export function computeDisplayName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
): string {
  const first = firstName?.trim() ?? '';
  const last = lastName?.trim() ?? '';
  if (!first && !last) return COPY.PROFILE_DEFAULT_DISPLAY_NAME;
  if (first && !last) return first;
  return `${first} ${last[0]}.`;
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const loaded = useProfileStore((s) => s.loaded);
  const loadProfile = useProfileStore((s) => s.loadFromAuthAndProfile);
  const earnedIds = useUserAchievementsStore((s) => s.earnedIds);
  const earnedRecords = useUserAchievementsStore((s) => s.earnedRecords);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [stickerSheetOpen, setStickerSheetOpen] = useState(false);
  const [selectedStickerId, setSelectedStickerId] = useState<StickerId | null>(null);

  // Fetch profile (avatar + saved fields) on mount. Achievement state is
  // hydrated by the post-auth fetch in app/(tabs)/_layout.tsx.
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const firstName =
    (user?.user_metadata as { first_name?: string } | undefined)?.first_name ?? null;
  const lastName =
    (user?.user_metadata as { last_name?: string } | undefined)?.last_name ?? null;
  const displayName = computeDisplayName(firstName, lastName);

  // Single Modal with content switching:
  //   - Tap row sticker → opens the Modal showing the grid (all 11)
  //   - Tap a sticker in the grid → swaps content to the detail card
  //     (no second Modal — iOS only supports one at a time)
  //   - Close detail → swaps content back to the grid
  //   - Close (X button on grid, backdrop tap, hardware back) → closes Modal entirely
  function handleRowStickerPress() {
    setStickerSheetOpen(true);
    setSelectedStickerId(null);
  }
  function handleSheetStickerPress(id: StickerId) {
    setSelectedStickerId(id);
  }
  function handleDetailClose() {
    // Return to the grid view; Modal stays open
    setSelectedStickerId(null);
  }
  function handleModalClose() {
    // Tear down both layers
    setSelectedStickerId(null);
    setStickerSheetOpen(false);
  }

  const selectedSticker = selectedStickerId ? STICKERS[selectedStickerId] : null;
  const selectedEarnedRecord =
    selectedStickerId != null
      ? earnedRecords.find((r) => r.id === selectedStickerId)
      : null;
  const selectedEarnedAt = selectedEarnedRecord?.earned_at ?? null;
  const selectedEarned = !!selectedEarnedRecord;

  async function handleConfirmLogout() {
    setLogoutModalOpen(false);

    // Clear all per-user store state before flipping the auth session.
    // Order doesn't matter — none of these depend on each other.
    useProfileStore.getState().clearProfile();
    useNotificationsStore.getState().clearNotifications();
    useUserAchievementsStore.getState().clearAchievements();
    useDogStore.getState().clearDogs();
    useSubscriptionStore.getState().clearSubscription();
    useCheckInStore.getState().clearAll();
    useHealthStore.getState().clearHealth();
    useLearnStore.getState().clearLearn();
    useOnboardingStore.getState().clearOnboarding();
    useArticleTransitionStore.getState().reset();

    try {
      await signOut();
    } catch {
      // Even if Supabase sign-out errors, the auth state listener picks up
      // the cleared session locally and the router guard re-routes to /(auth)/sign-in.
    }
    // In __DEV__, the routing guard treats `hasSeenOnboarding` as false (see
    // app/_layout.tsx) AND no longer auto-redirects from /(auth) back to
    // /onboarding (that would loop the Welcome/Paywall navigations). So we
    // navigate to /onboarding explicitly in dev to preserve the "iterate on
    // onboarding every time you sign out" workflow. Production returning
    // users still land on sign-in.
    router.replace(__DEV__ ? '/onboarding' : '/(auth)/sign-in');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar + name */}
        <View style={styles.headerBlock}>
          <WoodPortrait
            size={96}
            avatar={loaded?.avatar_url ?? null}
            testID="profile-avatar"
          />
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        {/* Sticker row (top 3 by hero rank) */}
        <View style={styles.stickerRow}>
          <StickerCollection
            variant="profile-row"
            earnedIds={earnedIds}
            onPressSticker={handleRowStickerPress}
          />
        </View>

        {/* Nav row stack */}
        <View style={styles.navStack}>
          <NavButton
            label={COPY.PROFILE_NAV_MY_INFO}
            icon={<PersonIcon size={22} />}
            onPress={() => router.push('/profile/my-information')}
          />
          <NavButton
            label={COPY.PROFILE_NAV_MY_SUBSCRIPTION}
            icon={<CardGlyph size={22} />}
            onPress={() => router.push('/profile/my-subscription')}
          />
          <NavButton
            label={COPY.PROFILE_NAV_SETTINGS}
            icon={<GearGlyph size={22} />}
            onPress={() => router.push('/profile/settings')}
          />
        </View>

        {/* Log Out CTA */}
        <View style={styles.logoutBlock}>
          <PillButton
            label={COPY.PROFILE_LOGOUT_BUTTON}
            variant="logout"
            onPress={() => setLogoutModalOpen(true)}
          />
        </View>

        {/* Delete account */}
        <Pressable
          onPress={() => router.push('/delete-account')}
          accessibilityRole="button"
          accessibilityLabel={COPY.PROFILE_DELETE_ACCOUNT_LABEL}
          hitSlop={8}
          style={styles.deleteAccountWrap}
        >
          <Text style={styles.deleteAccountText}>
            {COPY.PROFILE_DELETE_ACCOUNT_LABEL}
          </Text>
        </Pressable>

        {/* Decorative paw print motif — anchors the bottom rest area so the
            empty space below the destructive zone reads as intentional. */}
        <PawPrintMotif />
      </ScrollView>

      {/* Log Out modal — full sign-out flow (PR 6) */}
      <LogOutModal
        visible={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Single Modal — content switches between grid and detail.
          iOS only supports one Modal at a time, so we use ONE here. */}
      <Modal
        visible={stickerSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleModalClose}
            accessibilityLabel="Close sticker collection"
            accessibilityRole="button"
          />
          {selectedSticker ? (
            <View style={styles.detailWrap} pointerEvents="box-none">
              <StickerDetailContent
                sticker={selectedSticker}
                earned={selectedEarned}
                earnedAt={selectedEarnedAt}
                onClose={handleDetailClose}
              />
            </View>
          ) : (
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>My Stickers</Text>
                <Pressable
                  onPress={handleModalClose}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                  hitSlop={12}
                >
                  <Text style={styles.modalClose}>{'×'}</Text>
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={styles.stickerGridContent}>
                <StickerCollection
                  variant="sheet"
                  earnedIds={earnedIds}
                  onPressSticker={handleSheetStickerPress}
                />
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>

      {/* Earn celebration — reads lastEarned from the store internally */}
      <StickerEarnCelebration />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  scrollContent: {
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt4,
    paddingBottom: OB_SPACING.screenPaddingBottom + 24,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: OB_SPACING.mt3,
  },
  displayName: {
    fontFamily: OB_FONTS.dataLabel,
    fontWeight: '600',
    fontSize: 17,
    color: OB_COLORS.ink,
    marginTop: 10,
  },
  stickerRow: {
    alignItems: 'center',
    // Hero → list boundary: bigger than sectionGap so the eye registers
    // "header block ends, list begins" instead of reading the screen as one
    // evenly-spaced run.
    marginBottom: OB_SPACING.heroGap,
  },
  navStack: {
    // Floating rounded-rectangle buttons (not a continuous list with dividers),
    // so they need a real gap. 14dp aligns with playful-app spacing benchmarks
    // — see Material 3 list specs and Refactoring UI's spacing scale.
    gap: 14,
    marginBottom: OB_SPACING.sectionGap,
  },
  logoutBlock: {
    marginBottom: OB_SPACING.mt4,
  },
  deleteAccountWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  deleteAccountText: {
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.muted,
    textDecorationLine: 'underline',
  },
  // Sticker collection sheet modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailWrap: {
    // Center the detail card in the lower half (matches StickerDetailSheet's
    // standalone presentation feel — bottom-pinned but slightly inset).
    paddingHorizontal: 0,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 20, 15, 0.45)',
  },
  modalSheet: {
    backgroundColor: OB_COLORS.cream,
    borderTopLeftRadius: OB_RADII.modal,
    borderTopRightRadius: OB_RADII.modal,
    borderTopWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingTop: OB_SPACING.mt2,
    paddingBottom: OB_SPACING.screenPaddingBottom + 16,
    maxHeight: '85%',
    ...OB_SHADOWS.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: OB_SPACING.mt3,
  },
  modalTitle: {
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.ink,
  },
  modalClose: {
    fontFamily: OB_FONTS.body,
    fontSize: 24,
    color: OB_COLORS.muted,
    paddingHorizontal: 6,
  },
  stickerGridContent: {
    paddingBottom: 16,
  },
});
