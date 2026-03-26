import { useCallback } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useDogStore } from '../../stores/dogStore';
import { useAuthStore } from '../../stores/authStore';
import { useArticleTransitionStore } from '../../stores/articleTransitionStore';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  index: 'home',
  health: 'calendar-heart',
  learn: 'book-open-variant',
  settings: 'cog-outline',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  health: 'Health',
  learn: 'Learn',
  settings: 'Settings',
};

function Tab({
  route,
  isFocused,
  icon,
  label,
  isSettings,
  avatarUrl,
  userInitial,
  onPress,
}: {
  route: { key: string };
  isFocused: boolean;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  isSettings: boolean;
  avatarUrl: string | undefined;
  userInitial: string;
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
      {isSettings ? (
        <View style={[styles.tabAvatar, isFocused && styles.tabAvatarActive]}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.tabAvatarImage} />
          ) : (
            <Text style={styles.tabAvatarText}>{userInitial}</Text>
          )}
        </View>
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
  const user = useAuthStore((s) => s.user);
  const isArticleExpanded = useArticleTransitionStore((s) => s.isExpanded);
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const userInitial = user?.email?.[0]?.toUpperCase() ?? '?';

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

  // Filter to only the tabs we want to show (exclude triage)
  const visibleRoutes = state.routes.filter((route) => route.name !== 'triage');

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
        isSettings={route.name === 'settings'}
        avatarUrl={avatarUrl}
        userInitial={userInitial}
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
  tabAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
