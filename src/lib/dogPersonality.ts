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

function noDataSentence(name: string): string {
  return `Tell us about ${name} as you log.`;
}

/** One friendly, data-derived sentence about the dog. Fallback when no data. */
export function describeDog(dog: Dog): string {
  const baseline = dog.health_summary?.baseline_profile;
  if (!baseline) {
    return noDataSentence(dog.name);
  }
  // Widen to string index so out-of-union JSONB values produce undefined rather
  // than a TypeScript error or a silent "undefined" in the rendered sentence.
  const mood = (MOOD_WORD as Record<string, string | undefined>)[baseline.typical_mood];
  const energy = (ENERGY_WORD as Record<string, string | undefined>)[baseline.typical_energy];
  if (!mood || !energy) {
    return noDataSentence(dog.name);
  }
  return `${dog.name} is usually ${mood} and ${energy}.`;
}
