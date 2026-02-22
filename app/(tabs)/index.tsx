import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../../src/stores/dogStore';
import { DisclaimerFooter } from '../../src/components/legal';
import { GettingStartedCard } from '../../src/components/ui/GettingStartedCard';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import type { Dog } from '../../src/types/api';

function formatTriageDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Last checked today';
  if (diffDays === 1) return 'Last checked yesterday';
  if (diffDays < 7) return `Last checked ${diffDays} days ago`;
  return `Last checked ${date.toLocaleDateString()}`;
}

export default function HomeScreen() {
  const { dogs, isLoading, lastTriageDates, fetchDogs, fetchLastTriageDates, selectDog } = useDogStore();
  const router = useRouter();
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    fetchDogs().then(() => fetchLastTriageDates());
  }, []);

  const onRefresh = useCallback(() => {
    fetchDogs().then(() => fetchLastTriageDates());
  }, []);

  const handleDogPress = (dog: Dog) => {
    selectDog(dog.id);
    router.push('/(tabs)/triage');
  };

  const handleEditDog = (dog: Dog) => {
    router.push({ pathname: '/edit-dog', params: { id: dog.id } });
  };

  const handleCheckIn = (dog: Dog) => {
    selectDog(dog.id);
    router.push('/check-in');
  };

  const renderDogCard = ({ item }: { item: Dog }) => {
    const lastTriage = lastTriageDates[item.id];

    return (
      <View style={styles.dogCard}>
        <Pressable
          style={({ pressed }) => [styles.cardMain, pressed && styles.cardPressed]}
          onPress={() => handleDogPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.breed}, ${item.age_years} years old. Tap to check symptoms.`}
        >
          <View style={styles.dogInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.dogName}>{item.name}</Text>
              {(item.checkin_streak ?? 0) > 0 && (
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>{item.checkin_streak}d</Text>
                </View>
              )}
            </View>
            <Text style={styles.dogDetails}>
              {item.breed} · {item.age_years}y · {item.weight_lbs} lbs
            </Text>
            {lastTriage && (
              <Text style={styles.lastTriage}>
                {formatTriageDate(lastTriage)}
              </Text>
            )}
          </View>
          <Text style={styles.arrow} accessibilityElementsHidden>{'→'}</Text>
        </Pressable>

        {/* Check-In CTA */}
        <Pressable
          style={({ pressed }) => [styles.checkInButton, pressed && styles.cardPressed]}
          onPress={() => handleCheckIn(item)}
          accessibilityRole="button"
          accessibilityLabel={`Start daily check-in for ${item.name}`}
        >
          <Text style={styles.checkInText}>Check In Now</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.editButton, pressed && styles.cardPressed]}
          onPress={() => handleEditDog(item)}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${item.name}'s profile`}
        >
          <Text style={styles.editText}>Edit</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {showTooltip && dogs.length > 0 && (
          <Pressable
            style={styles.tooltip}
            onPress={() => setShowTooltip(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss tooltip"
          >
            <Text style={styles.tooltipText}>
              Describe your dog's symptoms and I'll help you understand how
              urgently you should see a vet.
            </Text>
            <Text style={styles.tooltipDismiss}>Tap to dismiss</Text>
          </Pressable>
        )}

        {dogs.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Welcome to PawCheck!</Text>
            <Text style={styles.emptyText}>
              Add your first dog to get started with symptom checking.
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.addButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/add-dog')}
              accessibilityRole="button"
              accessibilityLabel="Add your first dog"
            >
              <Text style={styles.addButtonText}>Add Your Dog</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={dogs}
            renderItem={renderDogCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={onRefresh}
                tintColor={COLORS.primary}
              />
            }
            ListHeaderComponent={
              <GettingStartedCard
                streak={Math.max(0, ...dogs.map((d) => d.checkin_streak ?? 0))}
                onCheckIn={() => {
                  if (dogs.length > 0) {
                    selectDog(dogs[0].id);
                    router.push('/check-in');
                  }
                }}
              />
            }
            ListFooterComponent={<DisclaimerFooter />}
          />
        )}

        {dogs.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/add-dog')}
            accessibilityRole="button"
            accessibilityLabel="Add another dog"
          >
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  tooltip: {
    backgroundColor: COLORS.primaryLight,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  tooltipDismiss: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  list: {
    padding: SPACING.md,
  },
  dogCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  cardPressed: {
    backgroundColor: COLORS.divider,
  },
  dogInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dogName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  streakBadge: {
    backgroundColor: '#E8F0E1',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BORDER_RADIUS.full,
  },
  streakText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  dogDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lastTriage: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    marginTop: 4,
  },
  arrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  checkInButton: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.divider,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
  },
  checkInText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
  editButton: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.divider,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  editText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
  },
});
