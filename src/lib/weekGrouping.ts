import { generateDaySummary } from './daySummary';
import type { DailyCheckIn } from '../types/checkIn';

export type WeekTone = 'thriving' | 'okay' | 'attention' | 'concern' | 'empty';

export interface WeekSummary {
  weekStartDate: string; // YYYY-MM-DD (Sunday)
  weekEndDate: string;   // YYYY-MM-DD (Saturday)
  label: string;         // e.g. "May 31 – Jun 6"
  loggedCount: number;   // 0-7
  tone: WeekTone;
}

function toUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fmt(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

/** YYYY-MM-DD of the week's start (Sunday by default) on/before dateStr. */
export function getWeekStart(dateStr: string, weekStartsOn: number = 0): string {
  const date = toUTC(dateStr);
  const day = date.getUTCDay();
  const diff = (day - weekStartsOn + 7) % 7;
  date.setUTCDate(date.getUTCDate() - diff);
  return fmt(date);
}

/** YYYY-MM-DD n days after dateStr. */
export function addDaysStr(dateStr: string, n: number): string {
  const date = toUTC(dateStr);
  date.setUTCDate(date.getUTCDate() + n);
  return fmt(date);
}

const TIER_ORDER: Record<string, number> = {
  all_normal: 0,
  minor_notes: 1,
  attention_needed: 2,
  vet_recommended: 3,
};

const TONE_BY_TIER: WeekTone[] = ['thriving', 'okay', 'attention', 'concern'];

function rangeLabel(startStr: string, endStr: string): string {
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  const start = toUTC(startStr).toLocaleDateString('en-US', opts);
  const end = toUTC(endStr).toLocaleDateString('en-US', opts);
  return `${start} – ${end}`;
}

function summarizeWeek(weekCheckIns: DailyCheckIn[], weekStartDate: string): WeekSummary {
  const weekEndDate = addDaysStr(weekStartDate, 6);
  const loggedCount = weekCheckIns.length;

  let worst = 0;
  for (const c of weekCheckIns) {
    const tier = TIER_ORDER[generateDaySummary(c).type] ?? 0;
    if (tier > worst) worst = tier;
  }

  const tone: WeekTone = loggedCount === 0 ? 'empty' : TONE_BY_TIER[worst];

  return {
    weekStartDate,
    weekEndDate,
    label: rangeLabel(weekStartDate, weekEndDate),
    loggedCount,
    tone,
  };
}

/**
 * Group check-ins into Sun-Sat weeks, one WeekSummary per week that has data,
 * sorted most-recent week first.
 */
export function groupCheckInsByWeek(
  checkIns: DailyCheckIn[],
  weekStartsOn: number = 0
): WeekSummary[] {
  const buckets = new Map<string, DailyCheckIn[]>();

  for (const c of checkIns) {
    const key = getWeekStart(c.check_in_date, weekStartsOn);
    const list = buckets.get(key) ?? [];
    list.push(c);
    buckets.set(key, list);
  }

  return Array.from(buckets.entries())
    .map(([weekStart, list]) => summarizeWeek(list, weekStart))
    .sort((a, b) => b.weekStartDate.localeCompare(a.weekStartDate));
}
