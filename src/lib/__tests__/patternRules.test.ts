import { detectPatterns } from '../patternRules';
import type { DailyCheckIn } from '../../types/checkIn';

function makeCheckIn(overrides: Partial<DailyCheckIn> = {}, dateOffset = 0): DailyCheckIn {
  const d = new Date('2026-02-21');
  d.setDate(d.getDate() - dateOffset);
  const dateStr = d.toISOString().split('T')[0];

  return {
    id: `id-${dateOffset}`,
    user_id: 'user-1',
    dog_id: 'dog-1',
    check_in_date: dateStr,
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
    created_at: `${dateStr}T10:00:00Z`,
    updated_at: `${dateStr}T10:00:00Z`,
    ...overrides,
  };
}

function makeWindow(count: number, overrides: Partial<DailyCheckIn> = {}): DailyCheckIn[] {
  return Array.from({ length: count }, (_, i) => makeCheckIn(overrides, i));
}

describe('patternRules — Single-day rules', () => {
  it('detects blood in stool', () => {
    const checkIns = [makeCheckIn({ stool_quality: 'blood' })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'blood_in_stool',
      alertLevel: 'vet_recommended',
    }));
  });

  it('detects dry heaving emergency', () => {
    const checkIns = [makeCheckIn({ vomiting: 'dry_heaving' })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'dry_heaving_emergency',
      alertLevel: 'vet_recommended',
    }));
  });

  it('detects sudden aggression', () => {
    const checkIns = [makeCheckIn({ mood: 'aggressive' })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'sudden_aggression',
      alertLevel: 'concern',
    }));
  });

  it('detects vomiting plus other symptoms', () => {
    const checkIns = [makeCheckIn({
      vomiting: 'multiple',
      energy_level: 'lethargic',
      appetite: 'refusing',
    })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'vomiting_plus_other',
      alertLevel: 'concern',
    }));
  });

  it('does NOT detect vomiting_plus_other for single vomiting without other significant symptoms', () => {
    const checkIns = [makeCheckIn({ vomiting: 'once' })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns.find(p => p.patternType === 'vomiting_plus_other')).toBeUndefined();
  });

  it('detects multi-symptom acute (3+ abnormal fields)', () => {
    const checkIns = [makeCheckIn({
      appetite: 'less',
      energy_level: 'low',
      mood: 'quiet',
    })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'multi_symptom_acute',
      alertLevel: 'concern',
    }));
  });

  it('does NOT detect multi-symptom acute for 2 abnormal fields', () => {
    const checkIns = [makeCheckIn({
      appetite: 'less',
      energy_level: 'low',
    })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns.find(p => p.patternType === 'multi_symptom_acute')).toBeUndefined();
  });

  it('single-day rules fire even without density', () => {
    const checkIns = [makeCheckIn({ stool_quality: 'blood' })];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns.length).toBeGreaterThan(0);
  });

  it('returns no patterns for all-normal day', () => {
    const checkIns = [makeCheckIn()];
    const patterns = detectPatterns(checkIns, false);
    expect(patterns).toEqual([]);
  });
});

describe('patternRules — Trend rules', () => {
  it('detects appetite decline (3 consecutive days)', () => {
    const checkIns = makeWindow(3, { appetite: 'less' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'appetite_decline',
      alertLevel: 'watch',
    }));
  });

  it('detects appetite increase', () => {
    const checkIns = makeWindow(3, { appetite: 'more' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'appetite_increase',
      alertLevel: 'watch',
    }));
  });

  it('detects appetite + thirst increase (composite)', () => {
    const checkIns = makeWindow(3, { appetite: 'more', water_intake: 'excessive' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'appetite_thirst_increase',
      alertLevel: 'concern',
    }));
    // Composite should suppress standalone appetite_increase
    expect(patterns.find(p => p.patternType === 'appetite_increase')).toBeUndefined();
  });

  it('detects energy decline', () => {
    const checkIns = makeWindow(3, { energy_level: 'low' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'energy_decline',
      alertLevel: 'watch',
    }));
  });

  it('detects excessive energy (hyperactive 3+ days)', () => {
    const checkIns = makeWindow(3, { energy_level: 'hyperactive' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'excessive_energy',
      alertLevel: 'watch',
    }));
  });

  it('detects digestive issues', () => {
    const checkIns = makeWindow(3, { stool_quality: 'soft' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'digestive_issues',
      alertLevel: 'watch',
    }));
  });

  it('detects recurring vomiting (2+ of 3 days)', () => {
    const checkIns = [
      makeCheckIn({ vomiting: 'once' }, 0),
      makeCheckIn({ vomiting: 'none' }, 1),
      makeCheckIn({ vomiting: 'multiple' }, 2),
    ];
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'recurring_vomiting',
      alertLevel: 'concern',
    }));
  });

  it('detects abnormal water intake', () => {
    const checkIns = makeWindow(3, { water_intake: 'excessive' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'abnormal_water',
      alertLevel: 'watch',
    }));
  });

  it('detects mobility issues', () => {
    const checkIns = makeWindow(3, { mobility: 'limping' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'mobility_issues',
      alertLevel: 'watch',
    }));
  });

  it('detects behavioral change', () => {
    const checkIns = makeWindow(3, { mood: 'anxious' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'behavioral_change',
      alertLevel: 'watch',
    }));
  });

  it('detects multi-symptom trend (2+ fields abnormal for 3+ days)', () => {
    const checkIns = makeWindow(3, { appetite: 'less', energy_level: 'low' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'multi_symptom_trend',
      alertLevel: 'concern',
    }));
  });

  it('detects persistent decline (5+ of 7 days with 2+ abnormal fields)', () => {
    const checkIns = Array.from({ length: 7 }, (_, i) =>
      makeCheckIn(
        i < 6
          ? { appetite: 'less', energy_level: 'low' }  // 2+ abnormal on 6 of 7 days
          : {},
        i
      )
    );
    const patterns = detectPatterns(checkIns, true);
    expect(patterns).toContainEqual(expect.objectContaining({
      patternType: 'persistent_decline',
      alertLevel: 'vet_recommended',
    }));
  });

  it('does NOT fire trend rules without density', () => {
    const checkIns = makeWindow(3, { appetite: 'less' });
    const patterns = detectPatterns(checkIns, false);
    expect(patterns.find(p => p.patternType === 'appetite_decline')).toBeUndefined();
  });

  it('does NOT fire trend rules with fewer than 3 check-ins', () => {
    const checkIns = makeWindow(2, { appetite: 'less' });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns.find(p => p.patternType === 'appetite_decline')).toBeUndefined();
  });
});

describe('patternRules — Edge cases', () => {
  it('returns empty array for empty input', () => {
    expect(detectPatterns([], false)).toEqual([]);
    expect(detectPatterns([], true)).toEqual([]);
  });

  it('can detect both single-day and trend patterns simultaneously', () => {
    const checkIns = makeWindow(3, {
      stool_quality: 'blood',
      appetite: 'less',
    });
    const patterns = detectPatterns(checkIns, true);
    expect(patterns.find(p => p.patternType === 'blood_in_stool')).toBeDefined();
    expect(patterns.find(p => p.patternType === 'appetite_decline')).toBeDefined();
  });
});
