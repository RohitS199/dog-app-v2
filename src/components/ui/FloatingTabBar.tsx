import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDogStore } from '../../stores/dogStore';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, FONT_SIZES } from '../../constants/theme';
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

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const { dogs, selectedDogId, selectDog } = useDogStore();

  const handleFAB = () => {
    if (dogs.length > 0) {
      if (!selectedDogId && dogs[0]) {
        selectDog(dogs[0].id);
      }
      router.push('/check-in');
    } else {
      router.push('/add-dog');
    }
  };

  // Filter to only the tabs we want to show (exclude triage)
  const visibleRoutes = state.routes.filter(
    (route) => route.name !== 'triage'
  );

  // Insert FAB placeholder at center position (after 2nd tab)
  const leftTabs = visibleRoutes.slice(0, 2);
  const rightTabs = visibleRoutes.slice(2);

  const renderTab = (route: typeof state.routes[0], index: number) => {
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
      <Pressable
        key={route.key}
        onPress={onPress}
        style={styles.tab}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={isFocused ? COLORS.accent : 'rgba(215, 204, 200, 0.6)'}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: isFocused ? COLORS.accent : 'rgba(215, 204, 200, 0.6)' },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.wrapper}>
      {/* FAB — positioned above the tab bar */}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleFAB}
        accessibilityRole="button"
        accessibilityLabel={dogs.length > 0 ? 'Start daily check-in' : 'Add your first dog'}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </Pressable>

      <View style={[styles.bar, SHADOWS.tab]}>
        {leftTabs.map((route, i) => renderTab(route, i))}
        {/* FAB spacer */}
        <View style={styles.fabSpacer} />
        {rightTabs.map((route, i) => renderTab(route, i + 2))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 34,
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
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  fabSpacer: {
    width: 64,
  },
  fab: {
    position: 'absolute',
    top: -20,
    zIndex: 1,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.elevated,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
});
