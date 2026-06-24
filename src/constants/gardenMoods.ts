// SINGLE SOURCE OF TRUTH for the 8 Journey-garden moods (flower color).
// Distinct from the CLINICAL mood enum in src/types/checkIn.ts — do not merge them.
// Hex values are from puplog_flower_tier_logic.md §2 (the locked palette).

export const GARDEN_MOODS = [
  'joyful', 'playful', 'affectionate', 'calm', 'curious', 'tired', 'anxious', 'unwell',
] as const;

export type GardenMood = (typeof GARDEN_MOODS)[number];

export const GARDEN_MOOD_COLORS: Record<GardenMood, string> = {
  joyful: '#F4C430',        // Sunny Yellow
  playful: '#FF8C61',       // Coral Orange
  affectionate: '#F4A6B8',  // Rose Pink
  calm: '#A8C9A0',          // Sage Green
  curious: '#9BB5DD',       // Periwinkle Blue
  tired: '#C8B4D8',         // Soft Lavender
  anxious: '#A89AA8',       // Muted Plum
  unwell: '#C5CDD2',        // Pale Ash Blue
};

export const GARDEN_MOOD_LABELS: Record<GardenMood, string> = {
  joyful: 'Joyful',
  playful: 'Playful',
  affectionate: 'Affectionate',
  calm: 'Calm',
  curious: 'Curious',
  tired: 'Tired',
  anxious: 'Anxious',
  unwell: 'Unwell',
};

export function isGardenMood(value: unknown): value is GardenMood {
  return typeof value === 'string' && (GARDEN_MOODS as readonly string[]).includes(value);
}

// The garden's OWN simple health-chip vocabulary (the tier-2 driver). DISTINCT from the
// clinical AdditionalSymptom enum in src/types/checkIn.ts — the garden never couples to
// clinical symptom values, keeping the garden/clinical separation intact. "All normal" is
// exclusive (selecting it clears the others). Placeholder set per spec §5.3; refine with
// the clinical-flow redesign.
export const GARDEN_HEALTH_CHIPS = [
  'All normal', 'Eating less', 'Low energy', 'Tummy trouble', 'Stiff or limping', 'Itchy skin', 'Threw up',
] as const;

export type GardenHealthChip = (typeof GARDEN_HEALTH_CHIPS)[number];

export const GARDEN_HEALTH_CHIP_ALL_NORMAL = 'All normal' as const;
