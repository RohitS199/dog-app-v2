import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../../src/stores/dogStore';
import { useHealthStore } from '../../src/stores/healthStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import { calculateConsistencyScore } from '../../src/lib/consistencyScore';
import { CalendarGrid } from '../../src/components/ui/CalendarGrid';
import { DayDetailSheet } from '../../src/components/ui/DayDetailSheet';
import { StreakCounter } from '../../src/components/ui/StreakCounter';
import { ConsistencyCard } from '../../src/components/ui/ConsistencyCard';
import { PatternAlertCard } from '../../src/components/ui/PatternAlertCard';
import { DogSelector } from '../../src/components/ui/DogSelector';
import type { CalendarDayStatus } from '../../src/types/health';
import type { DailyCheckIn } from '../../src/types/checkIn';

function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function HealthScreen() {
  const { dogs, selectedDogId } = useDogStore();
  const selectedDog = dogs.find((d) => d.id === selectedDogId);
  const [showDogSelector, setShowDogSelector] = useState(false);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const {
    calendarData,
    activeAlerts,
    isLoading,
    error: healthError,
    fetchMonthData,
    fetchActiveAlerts,
    dismissAlert,
  } = useHealthStore();

  useEffect(() => {
    if (selectedDogId) {
      fetchMonthData(selectedDogId, viewYear, viewMonth);
      fetchActiveAlerts(selectedDogId);
    }
  }, [selectedDogId, viewYear, viewMonth]);

  const todayString = getTodayString();

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const monthLabel = new Date(viewYear, viewMonth - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Compute day statuses for calendar
  const dayStatuses = useMemo(() => {
    const statuses: Record<string, CalendarDayStatus> = {};
    const today = new Date(todayString);
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();

    // Get all check-ins sorted by date for consistency scoring
    const sortedCheckIns = Object.values(calendarData).sort(
      (a, b) => b.check_in_date.localeCompare(a.check_in_date)
    );

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(dateStr);

      if (dateObj > today) {
        statuses[dateStr] = 'future';
        continue;
      }

      const checkIn = calendarData[dateStr];
      if (!checkIn) {
        statuses[dateStr] = 'missed';
        continue;
      }

      // Get trailing window from this date
      const trailingCheckIns = sortedCheckIns.filter(
        (c) => c.check_in_date <= dateStr
      ).slice(0, 7);

      const score = calculateConsistencyScore(trailingCheckIns);
      if (!score) {
        statuses[dateStr] = 'new';
      } else if (score.score >= 4) {
        statuses[dateStr] = 'good';
      } else if (score.score >= 2) {
        statuses[dateStr] = 'fair';
      } else {
        statuses[dateStr] = 'poor';
      }
    }

    return statuses;
  }, [calendarData, viewYear, viewMonth, todayString]);

  // Consistency score for display
  const consistencyScore = useMemo(() => {
    const sortedCheckIns = Object.values(calendarData)
      .sort((a, b) => b.check_in_date.localeCompare(a.check_in_date))
      .slice(0, 7);
    return calculateConsistencyScore(sortedCheckIns);
  }, [calendarData]);

  // Get previous day's check-in for comparison in detail sheet
  const getPreviousCheckIn = (dateStr: string): DailyCheckIn | null => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    const prevStr = d.toISOString().split('T')[0];
    return calendarData[prevStr] ?? null;
  };

  if (!selectedDog) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Add a dog to start tracking health.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Dog selector */}
        {dogs.length > 1 && (
          <Pressable
            style={styles.dogRow}
            onPress={() => setShowDogSelector(true)}
            accessibilityRole="button"
            accessibilityLabel={`Viewing health for ${selectedDog.name}. Tap to switch.`}
          >
            <Text style={styles.dogName}>{selectedDog.name}</Text>
            <Text style={styles.switchText}>Switch</Text>
          </Pressable>
        )}

        {/* Streak counter */}
        <StreakCounter streak={selectedDog.checkin_streak ?? 0} />

        {/* Month navigation */}
        <View style={styles.monthNav}>
          <Pressable
            style={styles.navButton}
            onPress={handlePrevMonth}
            accessibilityRole="button"
            accessibilityLabel="Previous month"
          >
            <Text style={styles.navArrow} accessibilityElementsHidden>{'<'}</Text>
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable
            style={styles.navButton}
            onPress={handleNextMonth}
            accessibilityRole="button"
            accessibilityLabel="Next month"
          >
            <Text style={styles.navArrow} accessibilityElementsHidden>{'>'}</Text>
          </Pressable>
        </View>

        {/* Loading / Error */}
        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
        {healthError && (
          <Text style={styles.errorText} accessibilityRole="alert">{healthError}</Text>
        )}

        {/* Calendar */}
        <CalendarGrid
          year={viewYear}
          month={viewMonth}
          dayStatuses={dayStatuses}
          onDayPress={(date) => setSelectedDate(date)}
          todayString={todayString}
        />

        {/* Consistency score */}
        {consistencyScore && (
          <View style={styles.section}>
            <ConsistencyCard score={consistencyScore} />
          </View>
        )}

        {/* Active alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {activeAlerts.map((alert) => (
              <PatternAlertCard
                key={alert.id}
                alert={alert}
                onDismiss={dismissAlert}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Day detail sheet */}
      <DayDetailSheet
        visible={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        checkIn={selectedDate ? calendarData[selectedDate] ?? null : null}
        previousCheckIn={selectedDate ? getPreviousCheckIn(selectedDate) : null}
        dateString={selectedDate ?? ''}
      />

      <DogSelector
        visible={showDogSelector}
        onClose={() => setShowDogSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  dogRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  dogName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  switchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  navButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '700',
  },
  monthLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  loadingRow: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
});
