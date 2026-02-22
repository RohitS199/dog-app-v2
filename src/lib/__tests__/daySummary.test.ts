import { generateDaySummary } from '../daySummary';
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

describe('generateDaySummary', () => {
  it('returns all_normal when all fields are baseline', () => {
    const result = generateDaySummary(makeCheckIn());
    expect(result.type).toBe('all_normal');
    expect(result.abnormalities).toHaveLength(0);
    expect(result.message).toContain('normal');
  });

  it('returns minor_notes for only mild abnormalities', () => {
    const result = generateDaySummary(makeCheckIn({
      appetite: 'less',
      mood: 'quiet',
    }));
    expect(result.type).toBe('minor_notes');
    expect(result.abnormalities).toHaveLength(2);
    expect(result.abnormalities).toContain('Eating less than usual');
    expect(result.abnormalities).toContain('Quieter than usual');
  });

  it('returns attention_needed for significant abnormalities', () => {
    const result = generateDaySummary(makeCheckIn({
      stool_quality: 'diarrhea',
    }));
    expect(result.type).toBe('attention_needed');
    expect(result.abnormalities).toContain('Diarrhea');
  });

  it('returns vet_recommended for blood in stool', () => {
    const result = generateDaySummary(makeCheckIn({
      stool_quality: 'blood',
    }));
    expect(result.type).toBe('vet_recommended');
    expect(result.message).toContain('Blood in stool');
    expect(result.abnormalities).toContain('Blood in stool');
  });

  it('returns vet_recommended for dry heaving', () => {
    const result = generateDaySummary(makeCheckIn({
      vomiting: 'dry_heaving',
    }));
    expect(result.type).toBe('vet_recommended');
    expect(result.message).toContain('bloat');
    expect(result.message).toContain('emergency');
  });

  it('returns vet_recommended for 3+ significant abnormalities', () => {
    const result = generateDaySummary(makeCheckIn({
      appetite: 'refusing',
      energy_level: 'lethargic',
      stool_quality: 'diarrhea',
    }));
    expect(result.type).toBe('vet_recommended');
    expect(result.abnormalities).toHaveLength(3);
    expect(result.message).toContain('Multiple concerning symptoms');
  });

  it('classifies increased appetite as a flag', () => {
    const result = generateDaySummary(makeCheckIn({
      appetite: 'more',
    }));
    expect(result.abnormalities).toContain('Eating more than usual (polyphagia)');
  });

  it('classifies multiple mobility issues as significant', () => {
    const result = generateDaySummary(makeCheckIn({
      mobility: 'difficulty_rising',
    }));
    expect(result.type).toBe('attention_needed');
    expect(result.abnormalities).toContain('Difficulty getting up');
  });

  it('handles combination of mild and significant', () => {
    const result = generateDaySummary(makeCheckIn({
      appetite: 'less',      // mild
      vomiting: 'multiple',  // significant
      mood: 'quiet',         // mild
    }));
    expect(result.type).toBe('attention_needed');
    expect(result.abnormalities).toHaveLength(3);
  });

  it('classifies aggressive mood as significant', () => {
    const result = generateDaySummary(makeCheckIn({
      mood: 'aggressive',
    }));
    expect(result.type).toBe('attention_needed');
    expect(result.abnormalities).toContain('Unusually aggressive');
  });
});
