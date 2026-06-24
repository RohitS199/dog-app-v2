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
