import type { Dog, BaselineProfile } from '../types/api';

const MOOD_WORD: Record<BaselineProfile['typical_mood'], string> = {
  normal: 'easygoing',
  anxious: 'a worrier at heart',
  quiet: 'a calm soul',
};

const ENERGY_WORD: Record<BaselineProfile['typical_energy'], string> = {
  normal: 'nicely energetic',
  below_normal: 'on the mellow side',
  above_normal: 'a bundle of energy',
};

/** One friendly, data-derived sentence about the dog. Fallback when no data. */
export function describeDog(dog: Dog): string {
  const baseline = dog.health_summary?.baseline_profile;
  if (!baseline) {
    return `Tell us about ${dog.name} as you log.`;
  }
  const mood = MOOD_WORD[baseline.typical_mood];
  const energy = ENERGY_WORD[baseline.typical_energy];
  return `${dog.name} is usually ${mood} and ${energy}.`;
}
