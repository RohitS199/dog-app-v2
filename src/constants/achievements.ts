// ─── Sticker IDs (single source of truth) ────────────────────────────────────
// The Edge Function mirrors this list in _shared/achievements.ts for drift
// safety, but this file is canonical.

export const STICKER_IDS = [
  'welcome',
  'seasonal_fall',
  'seasonal_winter',
  'seasonal_spring',
  'seasonal_summer',
  'pattern_spotter',
  'tender_caretaker',
  'first_peony',
  'bouquet_of_joy',
  'multi_pup_parent',
  'full_spectrum',
  'bloom_master',
] as const;

export type StickerId = (typeof STICKER_IDS)[number];

export type StickerCategory = 'milestone' | 'mastery' | 'engagement' | 'seasonal';

export type StickerDef = {
  id: StickerId;
  title: string;
  description: string;
  unlockCriteria: string;   // shown on ghost detail sheet
  category: StickerCategory;
  heroWeight: number;        // ranking on Profile root (0-100)
  rotation: number;          // -7..7 deg, deterministic per id
  enabledWhen?: 'always' | 'flowers_shipped';
};

// ─── Sticker definitions ──────────────────────────────────────────────────────

export const STICKERS: Record<StickerId, StickerDef> = {
  welcome: {
    id: 'welcome',
    title: 'Welcome to PupLog',
    description: "You're here. Your dog is lucky.",
    unlockCriteria: 'Awarded the moment you create your PupLog account.',
    category: 'milestone',
    heroWeight: 30,
    rotation: -3,
    enabledWhen: 'always',
  },
  seasonal_fall: {
    id: 'seasonal_fall',
    title: 'Fall Collection',
    description: 'A crisp first log of the season.',
    unlockCriteria:
      "Log your dog's health any day during September, October, or November.",
    category: 'seasonal',
    heroWeight: 50,
    rotation: 5,
    enabledWhen: 'always',
  },
  seasonal_winter: {
    id: 'seasonal_winter',
    title: 'Winter Collection',
    description: 'Cozy logs, warm hearts.',
    unlockCriteria:
      "Log your dog's health any day during December, January, or February.",
    category: 'seasonal',
    heroWeight: 50,
    rotation: -5,
    enabledWhen: 'always',
  },
  seasonal_spring: {
    id: 'seasonal_spring',
    title: 'Spring Collection',
    description: 'Buds, breezes, and bright check-ins.',
    unlockCriteria:
      "Log your dog's health any day during March, April, or May.",
    category: 'seasonal',
    heroWeight: 50,
    rotation: 3,
    enabledWhen: 'always',
  },
  seasonal_summer: {
    id: 'seasonal_summer',
    title: 'Summer Collection',
    description: 'Long days, healthy stays.',
    unlockCriteria:
      "Log your dog's health any day during June, July, or August.",
    category: 'seasonal',
    heroWeight: 50,
    rotation: -7,
    enabledWhen: 'always',
  },
  pattern_spotter: {
    id: 'pattern_spotter',
    title: 'Pattern Spotter',
    description: 'You spotted what we spotted.',
    unlockCriteria: 'Review your first AI health insight.',
    category: 'engagement',
    heroWeight: 55,
    rotation: 7,
    enabledWhen: 'always',
  },
  tender_caretaker: {
    id: 'tender_caretaker',
    title: 'Tender Caretaker',
    description: 'Present when it mattered most.',
    unlockCriteria: "Log check-ins on 3 days when your dog isn't feeling well.",
    category: 'engagement',
    heroWeight: 62,
    rotation: -2,
    enabledWhen: 'always',
  },
  first_peony: {
    id: 'first_peony',
    title: 'First Peony',
    description: 'Your first bloom in the garden.',
    unlockCriteria:
      "Earn your first flower in the dog's garden (requires flower system).",
    category: 'mastery',
    heroWeight: 60,
    rotation: -3,
    enabledWhen: 'flowers_shipped',
  },
  bouquet_of_joy: {
    id: 'bouquet_of_joy',
    title: 'Bouquet of Joy',
    description: 'A bouquet of healthy days.',
    unlockCriteria:
      "Collect 5 flowers in the dog's garden (requires flower system).",
    category: 'mastery',
    heroWeight: 65,
    rotation: 5,
    enabledWhen: 'flowers_shipped',
  },
  multi_pup_parent: {
    id: 'multi_pup_parent',
    title: 'Multi-Pup Parent',
    description: 'Two pups, one heart.',
    unlockCriteria: 'Add a second dog to your PupLog account.',
    category: 'engagement',
    heroWeight: 70,
    rotation: -5,
    enabledWhen: 'always',
  },
  full_spectrum: {
    id: 'full_spectrum',
    title: 'Full Spectrum',
    description: 'Every mood, every petal.',
    unlockCriteria:
      "Earn at least one flower of each color in the garden (requires flower system).",
    category: 'mastery',
    heroWeight: 75,
    rotation: 3,
    enabledWhen: 'flowers_shipped',
  },
  bloom_master: {
    id: 'bloom_master',
    title: 'Bloom Master',
    description: 'The full garden is yours.',
    unlockCriteria:
      "Earn all 24 flowers in a single dog's garden (requires flower system).",
    category: 'mastery',
    heroWeight: 80,
    rotation: 0,
    enabledWhen: 'flowers_shipped',
  },
};

// ─── Season helper ────────────────────────────────────────────────────────────

export function getCurrentSeasonStickerId(date: Date = new Date()): StickerId {
  const m = date.getMonth(); // 0-11
  if (m >= 8 && m <= 10) return 'seasonal_fall';   // Sep-Nov
  if (m === 11 || m <= 1) return 'seasonal_winter'; // Dec-Feb
  if (m >= 2 && m <= 4) return 'seasonal_spring';   // Mar-May
  return 'seasonal_summer';                          // Jun-Aug
}

// ─── Hero-row ranking helpers (spec section 7.5) ──────────────────────────────

export function sortKey(s: StickerDef, earned: boolean): number {
  return s.heroWeight + (earned ? 100 : 0);
}

export function topThreeForRow(
  earnedSet: Set<StickerId>,
  flowersEnabled: boolean,
): StickerDef[] {
  const eligible = Object.values(STICKERS).filter(
    (s) => s.enabledWhen === 'always' || flowersEnabled,
  );
  return [...eligible]
    .sort((a, b) => sortKey(b, earnedSet.has(b.id)) - sortKey(a, earnedSet.has(a.id)))
    .slice(0, 3);
}
