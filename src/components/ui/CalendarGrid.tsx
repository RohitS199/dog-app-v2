import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, CALENDAR_STATUS_CONFIG, MIN_TOUCH_TARGET } from '../../constants/theme';
import type { CalendarDayStatus } from '../../types/health';

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  dayStatuses: Record<string, CalendarDayStatus>; // date string -> status
  onDayPress: (date: string) => void;
  todayString: string;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function StatusIndicator({ status }: { status: CalendarDayStatus }) {
  const config = CALENDAR_STATUS_CONFIG[status];

  if (status === 'future' || config.shape === 'none') return null;

  if (config.shape === 'dash') {
    return (
      <View style={[indicatorStyles.dash, { backgroundColor: config.color }]} />
    );
  }

  if (config.shape === 'circle') {
    return (
      <View style={[indicatorStyles.circle, { backgroundColor: config.color }]} />
    );
  }

  if (config.shape === 'circle_outlined') {
    return (
      <View style={[indicatorStyles.circleOutlined, { borderColor: config.color }]} />
    );
  }

  if (config.shape === 'triangle') {
    return (
      <View style={[indicatorStyles.triangle, { borderBottomColor: config.color }]} />
    );
  }

  if (config.shape === 'diamond') {
    return (
      <View style={[indicatorStyles.diamond, { backgroundColor: config.color }]} />
    );
  }

  return null;
}

export function CalendarGrid({
  year,
  month,
  dayStatuses,
  onDayPress,
  todayString,
}: CalendarGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_HEADERS.map((day) => (
          <View key={day} style={styles.headerCell}>
            <Text style={styles.headerText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.cell} />;
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = dayStatuses[dateStr] ?? 'future';
          const isToday = dateStr === todayString;

          return (
            <Pressable
              key={dateStr}
              style={[styles.cell, isToday && styles.todayCell]}
              onPress={() => onDayPress(dateStr)}
              accessibilityRole="button"
              accessibilityLabel={`${dateStr}, status: ${status}`}
            >
              <Text style={[styles.dayNumber, isToday && styles.todayText]}>
                {day}
              </Text>
              <StatusIndicator status={status} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  headerCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  headerText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  todayCell: {
    backgroundColor: '#E8F0E1',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  todayText: {
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
});

const indicatorStyles = StyleSheet.create({
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  circleOutlined: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    marginTop: 2,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: 2,
  },
  diamond: {
    width: 7,
    height: 7,
    transform: [{ rotate: '45deg' }],
    marginTop: 2,
  },
  dash: {
    width: 12,
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
});
