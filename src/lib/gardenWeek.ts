// The normalized week-array: the single data shape that drives garden rendering (spec §6.4).
// Week runs Monday..Sunday. A missed day is bare soil ("empty"), NEVER "missed" (no guilt).

import type { GardenMood } from '../constants/gardenMoods';
import type { FlowerTier } from './flowerTier';

export type GardenDayState = 'planted' | 'today' | 'empty';

export interface GardenFlowerInput {
  id: string;          // check-in id — the deterministic placement seed
  date: string;        // YYYY-MM-DD
  mood: GardenMood;    // flower color
  tier: FlowerTier;    // 1..3 (a planted day always has a mood -> tier >= 1)
}

export interface GardenDay {
  date: string;        // YYYY-MM-DD
  weekday: number;     // 0 = Mon ... 6 = Sun
  state: GardenDayState;
  moodKey: GardenMood | null;
  tier: FlowerTier;
  seed: string;        // check-in id when planted; the date string otherwise
}

export interface GardenWeek {
  weekStart: string;   // Monday YYYY-MM-DD
  days: GardenDay[];   // length 7, Mon..Sun
  plantedCount: number;
}

// Parse a YYYY-MM-DD as a UTC date to avoid local-timezone drift, then format back.
function toUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function fmt(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function addDaysStr(dateStr: string, days: number): string {
  const d = toUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return fmt(d);
}

// Monday of the week containing dateStr (ISO week start).
export function getWeekStartMonday(dateStr: string): string {
  const d = toUTC(dateStr);
  const dow = d.getUTCDay();            // 0 = Sun ... 6 = Sat
  const deltaToMonday = dow === 0 ? -6 : 1 - dow;
  return addDaysStr(dateStr, deltaToMonday);
}

export function buildGardenWeek(opts: { today: string; flowers: GardenFlowerInput[] }): GardenWeek {
  const weekStart = getWeekStartMonday(opts.today);
  const byDate = new Map(opts.flowers.map((f) => [f.date, f]));

  const days: GardenDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDaysStr(weekStart, i);
    const flower = byDate.get(date);
    if (flower) {
      days.push({ date, weekday: i, state: 'planted', moodKey: flower.mood, tier: flower.tier, seed: flower.id });
    } else if (date === opts.today) {
      days.push({ date, weekday: i, state: 'today', moodKey: null, tier: 0, seed: date });
    } else {
      days.push({ date, weekday: i, state: 'empty', moodKey: null, tier: 0, seed: date });
    }
  }

  return { weekStart, days, plantedCount: days.filter((d) => d.state === 'planted').length };
}
