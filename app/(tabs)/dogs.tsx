import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigation, useRouter } from 'expo-router';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — @expo/vector-icons type resolution is broken repo-wide (24 pre-existing tsc errors); suppressed so new files stay out of the error baseline
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDogStore } from '../../src/stores/dogStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { computeDayStatuses, getTodayString } from '../../src/lib/calendarStatus';
import { groupCheckInsByWeek, addDaysStr } from '../../src/lib/weekGrouping';
import { CalendarGrid } from '../../src/components/ui/CalendarGrid';
import { DayDetailSheet } from '../../src/components/ui/DayDetailSheet';
import { DogSwitcher } from '../../src/components/dogs/DogSwitcher';
import { DogIdentityHero } from '../../src/components/dogs/DogIdentityHero';
import { WeekLookBack } from '../../src/components/dogs/WeekLookBack';
import { DogStickerShelf } from '../../src/components/dogs/DogStickerShelf';
import { AskBiscuitCard } from '../../src/components/dogs/AskBiscuitCard';
import { DogCareDetails } from '../../src/components/dogs/DogCareDetails';
import {
  OB_BORDERS,
  OB_BUTTON_PRESS_TRANSLATE,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
} from '../../src/constants/onboardingTheme';
import { MIN_TOUCH_TARGET } from '../../src/constants/theme';
import type { DailyCheckIn } from '../../src/types/checkIn';

// Floating tab bar clearance (mirrors health.tsx's TAB_BAR_HEIGHT pattern).
const TAB_BAR_HEIGHT = 120;

export default function MyDogsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { dogs, selectedDogId, selectDog } = useDogStore();
  const selectedDog = dogs.find((d) => d.id === selectedDogId);
  const { calendarData, isLoading, fetchMonthData } = useHealthStore();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12
  const todayString = getTodayString();

  useEffect(() => {
    if (selectedDogId) {
      fetchMonthData(selectedDogId, year, month);
    }
  }, [selectedDogId, year, month]);

  // Re-fetch on tab focus (same pattern as health.tsx — covers check-ins
  // submitted while this tab was unfocused).
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (selectedDogId) {
        fetchMonthData(selectedDogId, year, month);
      }
    });
    return unsubscribe;
  }, [navigation, selectedDogId, year, month]);

  const dayStatuses = useMemo(
    () => computeDayStatuses(calendarData, year, month, todayString),
    [calendarData, year, month, todayString]
  );

  const weeks = useMemo(
    () => groupCheckInsByWeek(Object.values(calendarData)),
    [calendarData]
  );

  const todayCheckIn = calendarData[todayString] ?? null;

  // UTC-safe previous-day lookup (addDaysStr, NOT toISOString).
  const getPreviousCheckIn = (dateStr: string): DailyCheckIn | null =>
    calendarData[addDaysStr(dateStr, -1)] ?? null;

  if (!selectedDog) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyState}>
          <View
            style={styles.emptyPolaroid}
            accessibilityElementsHidden
            importantForAccessibility="no"
          >
            <MaterialCommunityIcons name="paw" size={40} color={OB_COLORS.muted} />
          </View>
          <Text style={styles.emptyText}>Add a dog to start their scrapbook.</Text>
          <Pressable
            onPress={() => router.push('/add-dog')}
            accessibilityRole="button"
            accessibilityLabel="Add your first dog"
            style={({ pressed }) => [
              styles.emptyCta,
              pressed
                ? { ...OB_SHADOWS.buttonPressed, transform: [{ translateY: OB_BUTTON_PRESS_TRANSLATE }] }
                : OB_SHADOWS.button,
            ]}
          >
            <Text style={styles.emptyCtaText}>Add a dog</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.title}>My Dogs</Text>
            <Pressable
              onPress={() => router.push('/profile' as any)}
              accessibilityRole="button"
              accessibilityLabel="Settings"
              style={styles.gearButton}
            >
              <MaterialCommunityIcons name="cog-outline" size={24} color={OB_COLORS.ink} />
            </Pressable>
          </View>

          {/* Dog switcher */}
          <DogSwitcher
            dogs={dogs}
            selectedDogId={selectedDogId}
            onSelectDog={selectDog}
            onAddDog={() => router.push('/add-dog')}
          />

          {/* Identity hero */}
          <DogIdentityHero
            dog={selectedDog}
            todayCheckIn={todayCheckIn}
            onStartCheckIn={() => router.push('/check-in')}
          />

          {/* Calendar */}
          <View style={styles.calendarSection}>
            <Text style={styles.sectionHeading}>What you logged</Text>
            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={OB_COLORS.wood} />
              </View>
            )}
            <View style={styles.calendarCard}>
              <CalendarGrid
                year={year}
                month={month}
                dayStatuses={dayStatuses}
                onDayPress={(date) => setSelectedDate(date)}
                todayString={todayString}
                accentColor={OB_COLORS.cta}
                todayTextColor={OB_COLORS.ink}
                flat
              />
            </View>
          </View>

          {/* Week look-back (carries its own marginTop 24) */}
          <WeekLookBack
            weeks={weeks}
            dogName={selectedDog.name}
            onSeeMore={() => router.push('/dog-weeks' as any)}
          />

          {/* Sticker shelf (carries its own marginTop 24) */}
          <DogStickerShelf dogName={selectedDog.name} />

          {/* Ask Biscuit bridge — interim Discovery destination is /health */}
          <AskBiscuitCard
            dogName={selectedDog.name}
            onPress={() => router.push('/health' as any)}
          />

          {/* Care details (carries its own marginTop 24) */}
          <DogCareDetails
            dog={selectedDog}
            onEdit={() => router.push(`/edit-dog?id=${selectedDog.id}` as any)}
          />
        </ScrollView>

        {/* Day detail sheet */}
        <DayDetailSheet
          visible={selectedDate !== null}
          onClose={() => setSelectedDate(null)}
          checkIn={selectedDate ? calendarData[selectedDate] ?? null : null}
          previousCheckIn={selectedDate ? getPreviousCheckIn(selectedDate) : null}
          dateString={selectedDate ?? ''}
          backgroundColor={OB_COLORS.cream}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  scroll: {
    padding: 16,
    paddingBottom: TAB_BAR_HEIGHT,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: OB_FONTS.h1,
    fontSize: 30,
    color: OB_COLORS.ink,
  },
  gearButton: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarSection: {
    marginTop: 24,
  },
  sectionHeading: {
    fontFamily: OB_FONTS.h2,
    fontSize: 19,
    color: OB_COLORS.ink,
    marginBottom: 8,
  },
  calendarCard: {
    backgroundColor: OB_COLORS.cardWhite,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.rowItem,
    padding: 12,
    ...OB_SHADOWS.card,
  },
  loadingRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyPolaroid: {
    width: 120,
    height: 140,
    backgroundColor: OB_COLORS.washNeutral,
    borderWidth: OB_BORDERS.standard,
    borderStyle: 'dashed',
    borderColor: OB_COLORS.sketch,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-2deg' }],
  },
  emptyText: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 15,
    color: OB_COLORS.ink2,
    textAlign: 'center',
    marginTop: 16,
  },
  emptyCta: {
    backgroundColor: OB_COLORS.cta,
    borderRadius: OB_RADII.pillBtn,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 24,
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyCtaText: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 15,
    color: OB_COLORS.ink,
  },
});
