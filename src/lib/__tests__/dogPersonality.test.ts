import { describeDog } from '../dogPersonality';
import type { Dog } from '../../types/api';

function makeDog(overrides: Partial<Dog> = {}): Dog {
  return {
    id: 'd1',
    user_id: 'u1',
    name: 'Luna',
    breed: 'Golden Retriever',
    age_years: 4,
    weight_lbs: 60,
    photo_url: null,
    vet_phone: null,
    spayed_neutered: true,
    known_conditions: [],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    last_checkin_date: null,
    checkin_streak: 0,
    health_summary: null,
    ...overrides,
  };
}

describe('describeDog', () => {
  it('falls back when there is no baseline profile', () => {
    expect(describeDog(makeDog())).toBe('Tell us about Luna as you log.');
  });

  it('builds a sentence from the baseline profile', () => {
    const dog = makeDog({
      health_summary: {
        summary_text: '',
        notable_events: [],
        annotations: [],
        last_updated: '2026-06-01T00:00:00Z',
        baseline_profile: {
          typical_appetite: 'normal',
          typical_water_intake: 'normal',
          typical_energy: 'above_normal',
          typical_stool: 'normal',
          typical_mobility: 'normal',
          typical_mood: 'normal',
          vomiting_history_note: null,
          known_sensitivities: [],
        },
      },
    });
    expect(describeDog(dog)).toBe('Luna is usually easygoing and a bundle of energy.');
  });
});
