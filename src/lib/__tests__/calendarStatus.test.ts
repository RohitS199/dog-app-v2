import { computeDayStatuses, getTodayString } from '../calendarStatus';
import type { DailyCheckIn } from '../../types/checkIn';

function makeCheckIn(date: string, overrides: Partial<DailyCheckIn> = {}): DailyCheckIn {
  return {
    id: `id-${date}`,
    user_id: 'u1',
    dog_id: 'd1',
    check_in_date: date,
    appetite: 'normal',
    water_intake: 'normal',
    energy_level: 'normal',
    stool_quality: 'normal',
    vomiting: 'none',
    mobility: 'normal',
    mood: 'normal',
    additional_symptoms: [],
    free_text: null,
    emergency_flagged: false,
    revision_history: [],
    created_at: `${date}T00:00:00Z`,
    updated_at: `${date}T00:00:00Z`,
    ...overrides,
  };
}

describe('computeDayStatuses', () => {
  const today = '2026-06-15';

  it('marks days after today as future', () => {
    const statuses = computeDayStatuses({}, 2026, 6, today);
    expect(statuses['2026-06-16']).toBe('future');
    expect(statuses['2026-06-30']).toBe('future');
  });

  it('marks past days with no check-in as missed', () => {
    const statuses = computeDayStatuses({}, 2026, 6, today);
    expect(statuses['2026-06-10']).toBe('missed');
  });

  it('marks a logged day with fewer than 5 trailing days as new', () => {
    const data: Record<string, DailyCheckIn> = {
      '2026-06-10': makeCheckIn('2026-06-10'),
    };
    const statuses = computeDayStatuses(data, 2026, 6, today);
    expect(statuses['2026-06-10']).toBe('new');
  });

  it('marks a logged day with 5+ consistent trailing days as good', () => {
    const data: Record<string, DailyCheckIn> = {};
    for (const d of ['06', '07', '08', '09', '10']) {
      data[`2026-06-${d}`] = makeCheckIn(`2026-06-${d}`);
    }
    const statuses = computeDayStatuses(data, 2026, 6, today);
    expect(statuses['2026-06-10']).toBe('good');
  });

  // Today-boundary: dateObj > today is false when equal, so the day is NOT
  // 'future'. Without a check-in it must be 'missed'.
  it('marks today with no check-in as missed (strict > boundary, not >=)', () => {
    const statuses = computeDayStatuses({}, 2026, 6, today);
    expect(statuses['2026-06-15']).toBe('missed');
  });

  // 'fair' branch: consistency score 2-3.
  //
  // Fixture reasoning (against consistencyScore.ts):
  //   5 check-ins supplied (meets MIN_HISTORY_DAYS=5).
  //   Previous 4 days all-normal → mode for every field is 'normal'/'none'.
  //   Most recent day (Jun 10) has 5 fields changed to abnormal values:
  //     appetite='less', water_intake='less', energy_level='low',
  //     stool_quality='soft', vomiting='once'
  //   → 5 mismatches, 2 matches (mobility='normal', mood='normal') → matchCount=2
  //   → score=2 (2-3 range) → CalendarDayStatus='fair'
  it('marks a day whose trailing window scores 2 as fair', () => {
    const data: Record<string, DailyCheckIn> = {
      '2026-06-06': makeCheckIn('2026-06-06'),
      '2026-06-07': makeCheckIn('2026-06-07'),
      '2026-06-08': makeCheckIn('2026-06-08'),
      '2026-06-09': makeCheckIn('2026-06-09'),
      '2026-06-10': makeCheckIn('2026-06-10', {
        appetite: 'less',        // mild — mode is 'normal' → mismatch
        water_intake: 'less',    // mild — mode is 'normal' → mismatch
        energy_level: 'low',     // mild — mode is 'normal' → mismatch
        stool_quality: 'soft',   // mild — mode is 'normal' → mismatch
        vomiting: 'once',        // mild — mode is 'none'   → mismatch
        // mobility='normal', mood='normal' both match their mode → 2 matches
      }),
    };
    const statuses = computeDayStatuses(data, 2026, 6, today);
    // matchCount=2 → score=2 → 'fair'
    expect(statuses['2026-06-10']).toBe('fair');
  });

  // 'poor' branch: consistency score 1 (0-1 matches).
  //
  // Fixture reasoning:
  //   5 check-ins, previous 4 all-normal → mode is 'normal'/'none' for all 7 fields.
  //   Most recent day has all 7 fields set to abnormal values → 0 matches.
  //   matchCount=0 → score=1 → CalendarDayStatus='poor'
  it('marks a day whose trailing window scores 1 as poor', () => {
    const data: Record<string, DailyCheckIn> = {
      '2026-06-06': makeCheckIn('2026-06-06'),
      '2026-06-07': makeCheckIn('2026-06-07'),
      '2026-06-08': makeCheckIn('2026-06-08'),
      '2026-06-09': makeCheckIn('2026-06-09'),
      '2026-06-10': makeCheckIn('2026-06-10', {
        appetite: 'less',        // mode 'normal' → mismatch
        water_intake: 'less',    // mode 'normal' → mismatch
        energy_level: 'low',     // mode 'normal' → mismatch
        stool_quality: 'soft',   // mode 'normal' → mismatch
        vomiting: 'once',        // mode 'none'   → mismatch
        mobility: 'stiff',       // mode 'normal' → mismatch
        mood: 'quiet',           // mode 'normal' → mismatch
        // 0 matches → score=1 → 'poor'
      }),
    };
    const statuses = computeDayStatuses(data, 2026, 6, today);
    expect(statuses['2026-06-10']).toBe('poor');
  });
});

describe('getTodayString', () => {
  it('returns a device-local YYYY-MM-DD string', () => {
    const result = getTodayString();
    // Should be a valid date string in YYYY-MM-DD format
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Should match the local date constructed the same way
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(result).toBe(expected);
  });
});
