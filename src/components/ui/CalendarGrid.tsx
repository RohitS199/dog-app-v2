import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, CALENDAR_STATUS_CONFIG, MIN_TOUCH_TARGET } from '../../constants/theme';
import type { CalendarDayStatus } from '../../types/health';

interface CalendarGridProps {
  year: number;
  month: number; // 1-12
  dayStatuses: Record<string, CalendarDayStatus>; // date string -> status
  onDayPress: (date: string) => void;
  todayString: string;
}

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL_HEIGHT = 56;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
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

  // Build rows of 7 cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  // Pad last row to 7 cells
  const lastRow = rows[rows.length - 1];
  while (lastRow.length < 7) lastRow.push(null);

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

      {/* Calendar rows with grid lines */}
      {rows.map((row, rowIndex) => (
        <View
          key={`row-${rowIndex}`}
          style={[
            styles.row,
            rowIndex < rows.length - 1 && styles.rowBorder,
          ]}
        >
          {row.map((day, colIndex) => {
            if (day === null) {
              return <View key={`empty-${rowIndex}-${colIndex}`} style={styles.cell} />;
            }

            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const status = dayStatuses[dateStr] ?? 'future';
            const isToday = dateStr === todayString;
            const dotColor = status !== 'future' ? CALENDAR_STATUS_CONFIG[status].color : null;

            return (
              <Pressable
                key={dateStr}
                style={styles.cell}
                onPress={() => onDayPress(dateStr)}
                accessibilityRole="button"
                accessibilityLabel={`${dateStr}, status: ${status}`}
              >
                <View style={[styles.dayCircle, isToday && styles.todayCircle]}>
                  <Text style={[styles.dayNumber, isToday && styles.todayText]}>
                    {day}
                  </Text>
                </View>
                {dotColor ? (
                  <View style={[styles.dot, { backgroundColor: dotColor }]} />
                ) : (
                  <View style={styles.dotSpacer} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.sm,
    ...SHADOWS.elevated,
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
    color: COLORS.textDisabled,
  },
  row: {
    flexDirection: 'row',
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  cell: {
    flex: 1,
    height: CELL_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    backgroundColor: COLORS.accent,
  },
  dayNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  todayText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  dotSpacer: {
    height: 6,
    marginTop: 3,
  },
});
