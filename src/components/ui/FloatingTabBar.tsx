import { useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useDogStore } from '../../stores/dogStore';
import { useProfileStore } from '../../stores/profileStore';
import { useArticleTransitionStore } from '../../stores/articleTransitionStore';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import { ProfileTabGlyph } from '../profile/glyphs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  index: 'home',
  dogs: 'paw',
  learn: 'book-open-variant',
  profile: 'account-outline',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Journey',
  dogs: 'My Dogs',
  learn: 'Discovery',
  profile: 'Profile',
};

function Tab({
  route,
  isFocused,
  icon,
  label,
  isProfile,
  avatarUrl,
  onPress,
}: {
  route: { key: string };
  isFocused: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  isProfile: boolean;
  avatarUrl: string | undefined;
  onPress: () => void;
}) {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  const color = isFocused ? COLORS.accent : 'rgba(215, 204, 200, 0.6)';

  return (
    <Pressable
      key={route.key}
      onPress={handlePress}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      {isProfile ? (
        avatarUrl ? (
          <View style={[styles.tabAvatar, isFocused && styles.tabAvatarActive]}>
            <Image source={{ uri: avatarUrl }} style={styles.tabAvatarImage} testID="profile-tab-avatar" />
          </View>
        ) : (
          <ProfileTabGlyph active={isFocused} />
        )
      ) : (
        <MaterialCommunityIcons name={icon} size={27} color={color} />
      )}
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const { dogs, selectedDogId, selectDog } = useDogStore();
  const avatarUrl = useProfileStore((s) => s.loaded?.avatar_url) ?? undefined;
  const isArticleExpanded = useArticleTransitionStore((s) => s.isExpanded);

  // TODO: Remove FAB once Journey redesign delivers an alternative check-in CTA.
  // Gated on project_journey_redesign.md (TBD). Until then, the FAB stays even
  // though the May 2026 mockup tab bar does not show it.
  const handleFAB = useCallback(() => {
    if (dogs.length > 0) {
      if (!selectedDogId && dogs[0]) {
        selectDog(dogs[0].id);
      }
      router.push('/check-in');
    } else {
      router.push('/add-dog');
    }
  }, [dogs, selectedDogId, selectDog, router]);

  const handleFABPress = useCallback(() => {
    handleFAB();
  }, [handleFAB]);

  // Hide triage (legacy) and health (reached via My Dogs > Ask Biscuit until Discovery ships).
  const visibleRoutes = state.routes.filter(
    (route) => route.name !== 'triage' && route.name !== 'health'
  );

  // Insert FAB placeholder at center position (after 2nd tab)
  const leftTabs = visibleRoutes.slice(0, 2);
  const rightTabs = visibleRoutes.slice(2);

  const renderTab = (route: typeof state.routes[0]) => {
    const routeIndex = state.routes.indexOf(route);
    const isFocused = state.index === routeIndex;
    const icon = TAB_ICONS[route.name] ?? 'help-circle-outline';
    const label = TAB_LABELS[route.name] ?? route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Tab
        key={route.key}
        route={route}
        isFocused={isFocused}
        icon={icon}
        label={label}
        isProfile={route.name === 'profile'}
        avatarUrl={avatarUrl}
        onPress={onPress}
      />
    );
  };

  if (isArticleExpanded) return null;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bar, SHADOWS.tab]}>
        {leftTabs.map((route) => renderTab(route))}
        {/* FAB spacer */}
        <View style={styles.fabSpacer} />
        {rightTabs.map((route) => renderTab(route))}
      </View>

      {/* FAB — positioned above the tab bar */}
      <View style={styles.fabWrapper}>
        <Pressable
          onPress={handleFABPress}
          style={({ pressed }) => [styles.fab, SHADOWS.elevated, pressed && styles.fabPressed]}
          accessibilityRole="button"
          accessibilityLabel={dogs.length > 0 ? 'Start daily check-in' : 'Add your first dog'}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    height: 64,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
  },
  tabPressed: {
    opacity: 0.7,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  fabSpacer: {
    width: 64,
  },
  fabWrapper: {
    position: 'absolute',
    top: 4,
    zIndex: 1,
    alignSelf: 'center',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabPressed: {
    opacity: 0.85,
  },
  tabAvatar: {
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: COLORS.textDisabled,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabAvatarActive: {
    borderColor: COLORS.accent,
  },
  tabAvatarImage: {
    width: 27,
    height: 27,
    borderRadius: 14,
  },
});
