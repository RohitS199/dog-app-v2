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

  // Week tone mapping: one concerning day among all-normal days
  //
  // Fixture verification (against daySummary.ts classifyAbnormalities):
  //   vet_recommended: stool_quality='blood' triggers the blood-in-stool branch
  //     (hasDryHeaving || hasBloodInStool || significantCount>=3 → vet_recommended)
  //   attention_needed: stool_quality='diarrhea' is 'significant' severity;
  //     one significant → attention_needed (significantCount>0, no vet trigger)
  //   minor_notes: appetite='less' is 'mild' severity; mood='quiet' is 'mild';
  //     only mild abnormalities → minor_notes
  it('maps a week with a vet_recommended day to concern tone', () => {
    const weeks = groupCheckInsByWeek([
      makeCheckIn('2026-06-01'),
      // stool_quality='blood' → generateDaySummary returns type:'vet_recommended'
      makeCheckIn('2026-06-02', { stool_quality: 'blood' }),
      makeCheckIn('2026-06-03'),
    ]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].tone).toBe('concern');
  });

  it('maps a week with an attention_needed day to attention tone', () => {
    const weeks = groupCheckInsByWeek([
      makeCheckIn('2026-06-01'),
      // stool_quality='diarrhea' → significant severity → type:'attention_needed'
      makeCheckIn('2026-06-02', { stool_quality: 'diarrhea' }),
      makeCheckIn('2026-06-03'),
    ]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].tone).toBe('attention');
  });

  it('maps a week with only minor_notes days to okay tone', () => {
    const weeks = groupCheckInsByWeek([
      makeCheckIn('2026-06-01'),
      // appetite='less' and mood='quiet' are both mild → type:'minor_notes'
      makeCheckIn('2026-06-02', { appetite: 'less', mood: 'quiet' }),
      makeCheckIn('2026-06-03'),
    ]);
    expect(weeks).toHaveLength(1);
    expect(weeks[0].tone).toBe('okay');
  });
});
