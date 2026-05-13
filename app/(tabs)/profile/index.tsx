import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAuthStore } from '../../../src/stores/authStore';
import { useProfileStore } from '../../../src/stores/profileStore';
import { WoodPortrait } from '../../../src/components/profile/WoodPortrait';
import { NavButton } from '../../../src/components/profile/NavButton';
import { PillButton } from '../../../src/components/profile/PillButton';
import { LogOutModal } from '../../../src/components/profile/LogOutModal';
import {
  PersonIcon,
  CardGlyph,
  GearGlyph,
} from '../../../src/components/profile/glyphs';
import { COPY } from '../../../src/constants/profileCopy';
import {
  OB_COLORS,
  OB_FONTS,
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
  const loaded = useProfileStore((s) => s.loaded);
  const loadProfile = useProfileStore((s) => s.loadFromAuthAndProfile);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Fetch profile (avatar + saved fields) once on mount.
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const firstName =
    (user?.user_metadata as { first_name?: string } | undefined)?.first_name ?? null;
  const lastName =
    (user?.user_metadata as { last_name?: string } | undefined)?.last_name ?? null;
  const displayName = computeDisplayName(firstName, lastName);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar + name */}
        <View style={styles.headerBlock}>
          <WoodPortrait
            size={68}
            avatar={loaded?.avatar_url ?? null}
            testID="profile-avatar"
          />
          <Text style={styles.displayName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>

        {/* PR 5 will render <StickerCollection variant="profile-row" /> here */}

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

      {/* Log Out modal — PR 6 wires confirm to authStore.signOut */}
      <LogOutModal
        visible={logoutModalOpen}
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={() => {
          // PR 6: replace with authStore.signOut() + store cleanup + router.replace
          setLogoutModalOpen(false);
        }}
      />
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
    marginBottom: OB_SPACING.sectionGap,
  },
  displayName: {
    fontFamily: OB_FONTS.dataLabel,
    fontWeight: '600',
    fontSize: 17,
    color: OB_COLORS.ink,
    marginTop: 10,
  },
  navStack: {
    gap: 6, // Profile root nav-row spacing — handoff one-off, not a scale value
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
});
