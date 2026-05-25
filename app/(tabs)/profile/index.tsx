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
import { StickerCollection } from '../../../src/components/profile/stickers/StickerCollection';
import { TrophyDetailView } from '../../../src/components/profile/stickers/TrophyDetailView';
import { StickerEarnCelebration } from '../../../src/components/profile/stickers/StickerEarnCelebration';
import { STICKER_IDS, STICKERS, type StickerId } from '../../../src/constants/achievements';
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

// Pattern E modal state machine. Discriminated union — see HANDOFF section 4.1
// for the navigation flow rules. picker(slot) and browse share the grid sheet
// chrome; trophy is the full-screen Pressed Flower Specimen overlay.
type ModalMode =
  | { kind: 'closed' }
  | { kind: 'browse' }
  | { kind: 'picker'; slotIndex: 0 | 1 | 2 }
  | { kind: 'trophy'; stickerId: StickerId; source: 'row' | 'browse' | 'picker' };

const SLOT_INDICES: readonly (0 | 1 | 2)[] = [0, 1, 2] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const loaded = useProfileStore((s) => s.loaded);
  const loadProfile = useProfileStore((s) => s.loadFromAuthAndProfile);
  const earnedIds = useUserAchievementsStore((s) => s.earnedIds);
  const earnedRecords = useUserAchievementsStore((s) => s.earnedRecords);
  const featuredIds = useUserAchievementsStore((s) => s.featuredIds);
  const setFeatured = useUserAchievementsStore((s) => s.setFeatured);

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>({ kind: 'closed' });

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

  // ---- modal handlers ----

  function handleRowFilledPress(id: StickerId) {
    setModalMode({ kind: 'trophy', stickerId: id, source: 'row' });
  }

  function handleRowEmptyPress(slotIndex: 0 | 1 | 2) {
    setModalMode({ kind: 'picker', slotIndex });
  }

  function handleViewAllPress() {
    setModalMode({ kind: 'browse' });
  }

  function handleBrowseStickerPress(id: StickerId) {
    setModalMode({ kind: 'trophy', stickerId: id, source: 'browse' });
  }

  async function handlePickerStickerPress(id: StickerId) {
    if (modalMode.kind !== 'picker') return;
    // Optimistic: setFeatured handles local + remote
    await setFeatured(modalMode.slotIndex, id);
    setModalMode({ kind: 'closed' });
  }

  function handleTrophyDismiss() {
    if (modalMode.kind !== 'trophy') return;
    switch (modalMode.source) {
      case 'browse':
        setModalMode({ kind: 'browse' });
        break;
      case 'picker':
        // Returning to picker — preserve the slot index by deriving from featuredIds nulls
        // (since picker source doesn't carry the original slotIndex through trophy)
        const firstEmpty = featuredIds.findIndex((x) => x === null);
        if (firstEmpty === -1) {
          setModalMode({ kind: 'closed' });
        } else {
          setModalMode({ kind: 'picker', slotIndex: firstEmpty as 0 | 1 | 2 });
        }
        break;
      case 'row':
      default:
        setModalMode({ kind: 'closed' });
        break;
    }
  }

  function handleModalClose() {
    setModalMode({ kind: 'closed' });
  }

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
    router.replace(__DEV__ ? '/onboarding' : '/(auth)/sign-in');
  }

  // ---- derived state ----

  const trophyStickerId = modalMode.kind === 'trophy' ? modalMode.stickerId : null;
  const trophySticker = trophyStickerId ? STICKERS[trophyStickerId] : null;
  const trophyEarnedRecord =
    trophyStickerId != null
      ? earnedRecords.find((r) => r.id === trophyStickerId)
      : null;
  const trophyEarnedAt = trophyEarnedRecord?.earned_at ?? null;
  const trophyEarned = !!trophyEarnedRecord;
  const trophyFeatured =
    trophyStickerId != null && featuredIds.includes(trophyStickerId);

  const totalStickers = STICKER_IDS.length;
  const earnedCount = earnedIds.size;
  const modalSubtitleText = COPY.STICKER_MY_STICKERS_SUBTITLE_TEMPLATE(earnedCount, totalStickers);

  const sheetGridVariant: 'browse' | 'picker' = modalMode.kind === 'picker' ? 'picker' : 'browse';
  const sheetVisible = modalMode.kind === 'browse' || modalMode.kind === 'picker';
  const trophyVisible = modalMode.kind === 'trophy';
  const modalVisible = modalMode.kind !== 'closed';

  // Adaptive picker copy
  let pickerHeader: string = COPY.STICKER_MY_STICKERS_TITLE;
  if (modalMode.kind === 'picker') {
    const earnedNotFeatured = Array.from(earnedIds).filter(
      (id) => !featuredIds.includes(id),
    );
    if (earnedNotFeatured.length === 0 && earnedIds.size === 0) {
      pickerHeader = COPY.STICKER_PICKER_HEADER_EMPTY;
    } else if (earnedNotFeatured.length === 0) {
      pickerHeader = COPY.STICKER_PICKER_HEADER_FULL;
    } else {
      pickerHeader = COPY.STICKER_PICKER_HEADER_DEFAULT;
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar + name */}
        <View style={styles.headerBlock}>
          <WoodPortrait
            size={104}
            avatar={loaded?.avatar_url ?? null}
            testID="profile-avatar"
          />
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        {/* Pattern E sticker row — 3 fixed slots, empty mounts, View all link */}
        <View style={styles.stickerRow}>
          <StickerCollection
            variant="profile-row"
            featuredIds={featuredIds}
            earnedIds={earnedIds}
            onPressFilledSlot={handleRowFilledPress}
            onPressEmptySlot={handleRowEmptyPress}
            onPressViewAll={handleViewAllPress}
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
      </ScrollView>

      {/* Log Out modal */}
      <LogOutModal
        visible={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Single Modal — content switches between browse/picker/trophy.
          iOS only supports one Modal at a time. */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleModalClose}
            accessibilityLabel="Close sticker collection"
            accessibilityRole="button"
          />
          {trophyVisible && trophySticker ? (
            <TrophyDetailView
              sticker={trophySticker}
              earned={trophyEarned}
              featured={trophyFeatured}
              earnedAt={trophyEarnedAt}
              onDismiss={handleTrophyDismiss}
            />
          ) : sheetVisible ? (
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>
                    {modalMode.kind === 'picker' ? pickerHeader : COPY.STICKER_MY_STICKERS_TITLE}
                  </Text>
                  <Text style={styles.modalSubtitle}>{modalSubtitleText}</Text>
                </View>
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
                  variant={sheetGridVariant}
                  featuredIds={featuredIds}
                  earnedIds={earnedIds}
                  onPressSticker={
                    modalMode.kind === 'picker' ? handlePickerStickerPress : handleBrowseStickerPress
                  }
                />
              </ScrollView>
            </View>
          ) : null}
        </View>
      </Modal>

      {/* Earn celebration */}
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
    marginBottom: OB_SPACING.sectionGap,
  },
  navStack: {
    gap: 6,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: OB_SPACING.mt3,
  },
  modalTitle: {
    fontFamily: OB_FONTS.h1,
    fontSize: 30,
    color: OB_COLORS.ink,
  },
  modalSubtitle: {
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.muted,
    marginTop: 2,
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
