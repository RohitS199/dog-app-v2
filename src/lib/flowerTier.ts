// Color = mood; tier (complexity) = how detailed the log was. "Rewarded for specifics."
// Order is load-bearing and matches preview-journey-hero-option-a-v2.html tier() ~L1209,
// with the locked video term added (spec §5.1 — the mockup had no video branch).

import type { GardenMood } from '../constants/gardenMoods';

export type FlowerTier = 0 | 1 | 2 | 3;

export interface FlowerTierInput {
  mood: GardenMood | null;
  hasHealthChip: boolean; // >=1 health/symptom chip selected (incl. "All normal")
  hasPhoto: boolean;
  hasVideo: boolean;
  hasNote: boolean;
}

export function computeFlowerTier(input: FlowerTierInput): FlowerTier {
  if (!input.mood) return 0;                                       // nothing chosen -> sprout
  if (input.hasPhoto || input.hasVideo || input.hasNote) return 3; // evidence -> full bloom
  if (input.hasHealthChip) return 2;                              // breadth -> fuller bloom
  return 1;                                                        // mood only -> simple bloom
}
