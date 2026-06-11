import { getWeekStart, addDaysStr, groupCheckInsByWeek } from '../weekGrouping';
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

describe('getWeekStart (Sunday start)', () => {
  it('returns the Sunday on/before a midweek date', () => {
    // 2026-06-03 is a Wednesday; the Sunday before is 2026-05-31
    expect(getWeekStart('2026-06-03')).toBe('2026-05-31');
  });

  it('returns the same date when it is already Sunday', () => {
    expect(getWeekStart('2026-05-31')).toBe('2026-05-31');
  });
});

describe('addDaysStr', () => {
  it('adds days across a month boundary', () => {
    expect(addDaysStr('2026-05-31', 6)).toBe('2026-06-06');
  });
});

describe('groupCheckInsByWeek', () => {
  it('groups check-ins in the same week into one summary', () => {
    const weeks = groupCheckInsByWeek([
      makeCheckIn('2026-06-01'),
      makeCheckIn('2026-06-03'),
    ]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].weekStartDate).toBe('2026-05-31');
    expect(weeks[0].weekEndDate).toBe('2026-06-06');
    expect(weeks[0].loggedCount).toBe(2);
  });

  it('marks an all-normal week as thriving', () => {
    const weeks = groupCheckInsByWeek([makeCheckIn('2026-06-01')]);
    expect(weeks[0].tone).toBe('thriving');
  });

  it('sorts weeks most-recent first', () => {
    const weeks = groupCheckInsByWeek([
      makeCheckIn('2026-05-20'),
      makeCheckIn('2026-06-03'),
    ]);
    expect(weeks).toHaveLength(2);
    expect(weeks[0].weekStartDate).toBe('2026-05-31');
    expect(weeks[1].weekStartDate).toBe('2026-05-17');
  });

  it('builds a human-readable label', () => {
    const weeks = groupCheckInsByWeek([makeCheckIn('2026-06-03')]);
    expect(weeks[0].label).toBe('May 31 – Jun 6');
  });
});
