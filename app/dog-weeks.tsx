// Phase 1: this screen reads the currently-loaded healthStore month window
// (the selected month plus 7 trailing days), so "all weeks" only covers weeks
// present in that window. True multi-month history (paginated fetch across
// months) is a documented follow-up.
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — @expo/vector-icons type resolution is broken repo-wide (24 pre-existing tsc errors); suppressed so new files stay out of the error baseline
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../src/stores/dogStore';
import { useHealthStore } from '../src/stores/healthStore';
import { groupCheckInsByWeek } from '../src/lib/weekGrouping';
import { WeekSceneCard } from '../src/components/dogs/WeekSceneCard';
import { OB_COLORS, OB_FONTS, OB_SPACING } from '../src/constants/onboardingTheme';
import { MIN_TOUCH_TARGET } from '../src/constants/theme';

const CARD_ROTATIONS = [-2, 1.5, -1, 2];

export default function DogWeeksScreen() {
  const router = useRouter();
  const { dogs, selectedDogId } = useDogStore();
  const calendarData = useHealthStore((s) => s.calendarData);
  const isLoading = useHealthStore((s) => s.isLoading);

  const selectedDog = dogs.find((d) => d.id === selectedDogId);
  const title = selectedDog ? selectedDog.name + "'s weeks" : 'Weeks';

  // Ownership guard: calendarData is a shared store slice that can briefly
  // hold the PREVIOUS dog's rows while a switch-triggered fetch is in flight —
  // never render another dog's weeks under this dog's title.
  const weeks = useMemo(() => {
    const ownCheckIns = Object.values(calendarData).filter(
      (c) => c.dog_id === selectedDogId
    );
    return groupCheckInsByWeek(ownCheckIns);
  }, [calendarData, selectedDogId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={OB_COLORS.ink}
          />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {/* Spacer mirrors the back button width so the title stays centered */}
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <ActivityIndicator size="small" color={OB_COLORS.wood} style={styles.loading} />
        ) : weeks.length === 0 ? (
          <Text style={styles.emptyText}>No weeks logged yet.</Text>
        ) : (
          <View style={styles.grid}>
            {weeks.map((week, index) => (
              <WeekSceneCard
                key={week.weekStartDate}
                summary={week}
                rotation={CARD_ROTATIONS[index % CARD_ROTATIONS.length]}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: OB_FONTS.h1,
    fontSize: 26,
    color: OB_COLORS.ink,
    textAlign: 'center',
  },
  headerSpacer: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
  },
  scrollContent: {
    padding: OB_SPACING.screenPaddingH,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    justifyContent: 'space-between',
  },
  emptyText: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 14,
    color: OB_COLORS.ink2,
    textAlign: 'center',
    marginTop: 32,
  },
  loading: {
    marginTop: 32,
  },
});
