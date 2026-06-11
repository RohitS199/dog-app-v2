import { calculateConsistencyScore } from './consistencyScore';
import type { DailyCheckIn } from '../types/checkIn';
import type { CalendarDayStatus } from '../types/health';

/**
 * Per-day calendar status for a given month. Future days are 'future', logged
 * days are scored against their trailing 7-day window (null score => 'new'),
 * and past days with no check-in are 'missed'. Shared by the Health calendar
 * and the My Dogs calendar so both render identically.
 */
export function computeDayStatuses(
  calendarData: Record<string, DailyCheckIn>,
  year: number,
  month: number,
  todayString: string
): Record<string, CalendarDayStatus> {
  const statuses: Record<string, CalendarDayStatus> = {};
  const today = new Date(todayString);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Get all check-ins sorted by date for consistency scoring
  const sortedCheckIns = Object.values(calendarData).sort(
    (a, b) => b.check_in_date.localeCompare(a.check_in_date)
  );

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
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
    const trailingCheckIns = sortedCheckIns
      .filter((c) => c.check_in_date <= dateStr)
      .slice(0, 7);

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
}
