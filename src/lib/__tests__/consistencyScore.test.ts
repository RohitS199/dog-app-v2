import { calculateConsistencyScore } from '../consistencyScore';
import type { DailyCheckIn } from '../../types/checkIn';

function makeCheckIn(overrides: Partial<DailyCheckIn> = {}): DailyCheckIn {
  return {
    id: 'test-id',
    user_id: 'user-1',
    dog_id: 'dog-1',
    check_in_date: '2026-02-21',
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
    created_at: '2026-02-21T10:00:00Z',
    updated_at: '2026-02-21T10:00:00Z',
    ...overrides,
  };
}

describe('calculateConsistencyScore', () => {
  it('returns null when fewer than 5 days of data', () => {
    const checkIns = [makeCheckIn(), makeCheckIn(), makeCheckIn(), makeCheckIn()];
    expect(calculateConsistencyScore(checkIns)).toBeNull();
  });

  it('returns null for empty array', () => {
    expect(calculateConsistencyScore([])).toBeNull();
  });

  it('returns score 5 when all 7 fields match across 7 days', () => {
    const checkIns = Array.from({ length: 7 }, (_, i) =>
      makeCheckIn({ check_in_date: `2026-02-${21 - i}` })
    );
    const result = calculateConsistencyScore(checkIns);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(5);
    expect(result!.matchCount).toBe(7);
    expect(result!.totalFields).toBe(7);
  });

  it('returns score 1 when 0 fields match the mode', () => {
    // Most recent day is all abnormal, previous 6 days are all normal
    const checkIns = [
      makeCheckIn({
        check_in_date: '2026-02-21',
        appetite: 'less',
        water_intake: 'less',
        energy_level: 'low',
        stool_quality: 'soft',
        vomiting: 'once',
        mobility: 'stiff',
        mood: 'quiet',
      }),
      ...Array.from({ length: 6 }, (_, i) =>
        makeCheckIn({ check_in_date: `2026-02-${20 - i}` })
      ),
    ];
    const result = calculateConsistencyScore(checkIns);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(1);
    expect(result!.matchCount).toBe(0);
  });

  it('returns correct score for partial matches (4 of 7 = score 3)', () => {
    const checkIns = [
      makeCheckIn({
        check_in_date: '2026-02-21',
        appetite: 'less',
        water_intake: 'less',
        energy_level: 'low',
        // stool, vomiting, mobility, mood all normal -> 4 matches
      }),
      ...Array.from({ length: 6 }, (_, i) =>
        makeCheckIn({ check_in_date: `2026-02-${20 - i}` })
      ),
    ];
    const result = calculateConsistencyScore(checkIns);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(3);
    expect(result!.matchCount).toBe(4);
  });

  it('returns score 4 for 5-6 matches', () => {
    const checkIns = [
      makeCheckIn({
        check_in_date: '2026-02-21',
        appetite: 'less',
        water_intake: 'less',
        // 5 fields match
      }),
      ...Array.from({ length: 6 }, (_, i) =>
        makeCheckIn({ check_in_date: `2026-02-${20 - i}` })
      ),
    ];
    const result = calculateConsistencyScore(checkIns);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(4);
    expect(result!.matchCount).toBe(5);
  });

  it('returns score 2 for 2-3 matches', () => {
    const checkIns = [
      makeCheckIn({
        check_in_date: '2026-02-21',
        appetite: 'less',
        water_intake: 'less',
        energy_level: 'low',
        stool_quality: 'soft',
        vomiting: 'once',
        // mobility and mood normal -> 2 matches
      }),
      ...Array.from({ length: 6 }, (_, i) =>
        makeCheckIn({ check_in_date: `2026-02-${20 - i}` })
      ),
    ];
    const result = calculateConsistencyScore(checkIns);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(2);
    expect(result!.matchCount).toBe(2);
  });

  it('works with exactly 5 days (minimum)', () => {
    const checkIns = Array.from({ length: 5 }, (_, i) =>
      makeCheckIn({ check_in_date: `2026-02-${21 - i}` })
    );
    const result = calculateConsistencyScore(checkIns);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(5);
  });

  it('breaks ties with most recent check-in value', () => {
    // 3 days normal appetite, 3 days less appetite, today is less
    // Mode is tied -> should use most recent (less), so today matches -> counts as match
    const checkIns = [
      makeCheckIn({ check_in_date: '2026-02-21', appetite: 'less' }),
      makeCheckIn({ check_in_date: '2026-02-20', appetite: 'less' }),
      makeCheckIn({ check_in_date: '2026-02-19', appetite: 'less' }),
      makeCheckIn({ check_in_date: '2026-02-18', appetite: 'normal' }),
      makeCheckIn({ check_in_date: '2026-02-17', appetite: 'normal' }),
      makeCheckIn({ check_in_date: '2026-02-16', appetite: 'normal' }),
    ];
    const result = calculateConsistencyScore(checkIns);
    expect(result).not.toBeNull();
    // 'less' appears 3 times, 'normal' appears 3 times
    // computeMode iterates and 'less' is encountered first with count 3, then 'normal' also 3
    // But 'normal' doesn't beat the max, so 'less' wins -> today matches
    expect(result!.matchCount).toBe(7); // all other fields are normal and match
  });
});
