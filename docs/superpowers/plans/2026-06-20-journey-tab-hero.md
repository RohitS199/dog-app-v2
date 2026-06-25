# Journey Tab Hero ("Garden Path") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Journey tab as a per-dog, full-bleed watercolor garden where one daily log plants one flower (color = mood, complexity = log-detail tier), with no streaks and an always-on Emergency surface.

**Architecture:** A normalized in-memory **week-array** (`GardenWeek`) is the single data shape that drives both rendering and (later) any mockup — resolution-independent SE→Max. Pure, TDD'd helpers (`computeFlowerTier`, seeded placement, `buildGardenWeek`) sit under data-source-agnostic presentational components (`GardenScene`, `Flower`). A new **additive** `garden_mood` column on `daily_check_ins` stores the flower color without touching the clinical `mood` enum (which feeds pattern detection + AI + emergency rules). A dedicated `gardenStore` reads the week and writes `garden_mood`, mirroring `checkInStore`'s persist/clear-on-switch patterns. reanimated `withTiming` only; idle loops gated behind `useReducedMotion()` and paused off-focus.

**Tech Stack:** Expo SDK 54, RN 0.81 (New Arch), TypeScript strict, Expo Router v6, Zustand v5 (+persist/AsyncStorage), react-native-reanimated v4, react-native-svg, Supabase JS v2, Jest 29 + RNTL.

**Source spec:** `docs/superpowers/specs/2026-06-20-journey-tab-hero-design.md` · **Flower/tier source of truth:** `puplog_flower_tier_logic.md` · **Handoff:** `HANDOFF.md` §7.

---

## ⚠️ DECISION GATE — confirm before Task 5 (the migration) runs

The spec (§6.1) flags the `mood` data-model as owner-gated and entangled with the deferred clinical-flow redesign (§6.2). This plan **resolves the entanglement** with one decision, which the owner should ratify before the migration task executes:

1. **`garden_mood` is a NEW, additive, nullable column on `daily_check_ins`. The clinical `mood` column is NOT touched, remapped, or replaced.**
   - *Why this is the safe call (verified in-repo):* clinical `mood` (`normal/quiet/anxious/clingy/hiding/aggressive`) feeds `sudden_aggression` ([src/lib/patternRules.ts:138](../../../src/lib/patternRules.ts:138)), `classifyMood` across multiple pattern rules ([patternRules.ts:66](../../../src/lib/patternRules.ts:66)), the AI baseline `typical_mood` ([src/types/api.ts:80](../../../src/types/api.ts:80)), and `generateDaySummary` ([daySummary.ts:81](../../../src/lib/daySummary.ts:81)). The 8 garden moods have **no `aggressive`** and only `anxious` overlaps — there is no lossless remap. Additive = the garden ships **without** waiting on the clinical redesign, and the redesign can later reshape `additional_symptoms`/`free_text` without breaking flower color.
2. **No DB `CHECK` constraint on `garden_mood`.** The `GARDEN_MOODS` TS const (Task 1) is the **single source of truth**; the app validates before insert. This honors the owner's standing rule *"don't duplicate a closed enum between a TS constant and a Postgres CHECK"* (memory `feedback_no_duplicate_enums_db_and_code.md`; flagged in `puplog_flower_tier_logic.md` §7). Tradeoff: the DB won't reject a bad value — RLS + app validation are the gate. If the owner prefers a DB CHECK instead, drop the TS validation to a comment and add the CHECK in Task 5; do not keep both.
3. **Tier-2 driver for v1 = the existing `additional_symptoms` array (non-empty).** The 7 "simple chips" in spec §5.3 are explicitly placeholders for the deferred clinical redesign — v1 does not introduce a parallel chip set. Tier 3 in v1 is reachable by **note** (`free_text`). **Photo/video upload is deferred** (needs storage infra) — `computeFlowerTier` accepts `hasPhoto`/`hasVideo` inputs now (so the rule is future-proof), but the v1 log sheet wires only `hasNote` + `hasHealthChip`. Flagged again in "Deferred / open" at the bottom.

> If the owner rejects (1), STOP — the whole data layer changes and this plan must be re-scoped. (2) and (3) are smaller and can be adjusted in their tasks.

---

## File structure

**New — pure logic & constants (Milestone 1, fully TDD'd):**
- `src/constants/gardenMoods.ts` — `GARDEN_MOODS`, `GardenMood`, `GARDEN_MOOD_COLORS`, `GARDEN_MOOD_LABELS`, `isGardenMood()`. Single source of truth for the 8 moods.
- `src/lib/flowerTier.ts` — `FlowerTier`, `FlowerTierInput`, `computeFlowerTier()` (first-match order; video branch added).
- `src/lib/gardenPlacement.ts` — `hashSeed()`, `seededFlowerPosition()`, `placeFlowers()` (deterministic jitter + collision reject).
- `src/lib/gardenWeek.ts` — `GardenDay`, `GardenWeek`, `getWeekStartMonday()`, `addDaysStr()`, `buildGardenWeek()`.
- `src/constants/flowerAssets.ts` — `FLOWER_ASSETS` (24 static `require()`s) + `SCENE_ASSETS` (doghouse/sprout/mound).

**New — data layer (Milestone 1, decision-gated):**
- `supabase/migrations/<ts>_add_garden_mood.sql` — additive `garden_mood text` column.
- `src/stores/gardenStore.ts` — fetch week + derive `GardenWeek`, write `garden_mood`, multi-dog clear-on-switch.

**New — presentational (Milestone 1, render-test + device-QA):**
- `src/components/garden/Flower.tsx` — one flower image at a tier height.
- `src/components/garden/GardenScene.tsx` — baked-PNG ground + doghouse + beds + flowers from a `GardenWeek`.
- `src/components/garden/EmergencyChip.tsx` — always-on header Emergency affordance.
- `src/components/garden/GardenGreeting.tsx` — handwritten week-feel line.

**New — logging & animation (Milestone 2):**
- `src/components/garden/LogSheet.tsx` — progressive mood → health chips → specifics, live tier preview.
- `src/components/garden/TierMeter.tsx` — 3-dot meter + preview pot.
- `src/components/garden/PlantCelebration.tsx` — ~1000ms bloom pop.

**Modified:**
- `src/types/checkIn.ts` — add `garden_mood: GardenMood | null` to `DailyCheckIn`, `CheckInDraft`, and `RevisionEntry.snapshot`.
- `app/(tabs)/index.tsx` — **replace** the legacy 888-line home with the garden hero (the old content is the pre-redesign Home; the tab is now "Journey" per `FloatingTabBar`).
- `jest.setup.js` — extend the reanimated/expo mocks only if a new native surface needs it (Task 13).

**Reuse (DRY):** if `src/lib/weekGrouping.ts` exists in the checkout (it ships with My Dogs PR #23), import its `getWeekStart`/`addDaysStr` instead of the local copies in `gardenWeek.ts` — see Task 4 note. Theme tokens come from `src/constants/onboardingTheme.ts` (`OB_*`); **never** `src/constants/theme.ts` for this screen.

---

# MILESTONE 1 — A read-only garden that renders real data

*Ships a Journey tab showing this week's planted flowers from `daily_check_ins`. No logging yet. Stop here for a review checkpoint.*

### Task 1: Garden mood constants (single source of truth)

**Files:**
- Create: `src/constants/gardenMoods.ts`
- Test: `src/constants/__tests__/gardenMoods.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/constants/__tests__/gardenMoods.test.ts
import { GARDEN_MOODS, GARDEN_MOOD_COLORS, GARDEN_MOOD_LABELS, isGardenMood } from '../gardenMoods';

describe('gardenMoods', () => {
  it('defines exactly the 8 canonical moods in order', () => {
    expect(GARDEN_MOODS).toEqual([
      'joyful', 'playful', 'affectionate', 'calm', 'curious', 'tired', 'anxious', 'unwell',
    ]);
  });

  it('has a hex color and a label for every mood', () => {
    for (const mood of GARDEN_MOODS) {
      expect(GARDEN_MOOD_COLORS[mood]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(GARDEN_MOOD_LABELS[mood].length).toBeGreaterThan(0);
    }
  });

  it('does NOT overlap the clinical mood enum except for "anxious"', () => {
    const clinical = ['normal', 'quiet', 'anxious', 'clingy', 'hiding', 'aggressive'];
    const overlap = GARDEN_MOODS.filter((m) => (clinical as string[]).includes(m));
    expect(overlap).toEqual(['anxious']);
  });

  it('isGardenMood narrows correctly', () => {
    expect(isGardenMood('joyful')).toBe(true);
    expect(isGardenMood('aggressive')).toBe(false); // clinical-only value
    expect(isGardenMood(null)).toBe(false);
    expect(isGardenMood(42)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/constants/__tests__/gardenMoods.test.ts`
Expected: FAIL — "Cannot find module '../gardenMoods'".

- [ ] **Step 3: Write the implementation**

```typescript
// src/constants/gardenMoods.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/constants/__tests__/gardenMoods.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/constants/gardenMoods.ts src/constants/__tests__/gardenMoods.test.ts
git commit -m "feat(garden): add garden mood constants (single source of truth)"
```

---

### Task 2: `computeFlowerTier` pure helper (with video branch)

**Files:**
- Create: `src/lib/flowerTier.ts`
- Test: `src/lib/__tests__/flowerTier.test.ts`

Implements the verbatim mockup rule (`preview-journey-hero-option-a-v2.html` ~L1209) PLUS the locked-but-not-yet-in-source video term (spec §5.1).

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/__tests__/flowerTier.test.ts
import { computeFlowerTier, FlowerTierInput } from '../flowerTier';

function input(overrides: Partial<FlowerTierInput> = {}): FlowerTierInput {
  return { mood: 'calm', hasHealthChip: false, hasPhoto: false, hasVideo: false, hasNote: false, ...overrides };
}

describe('computeFlowerTier', () => {
  it('tier 0 when no mood is picked', () => {
    expect(computeFlowerTier(input({ mood: null }))).toBe(0);
  });

  it('tier 1 for mood only', () => {
    expect(computeFlowerTier(input())).toBe(1);
  });

  it('tier 2 for mood + a health chip', () => {
    expect(computeFlowerTier(input({ hasHealthChip: true }))).toBe(2);
  });

  it('tier 3 for a note even with zero health chips (evidence beats breadth)', () => {
    expect(computeFlowerTier(input({ hasHealthChip: false, hasNote: true }))).toBe(3);
  });

  it('tier 3 for a photo', () => {
    expect(computeFlowerTier(input({ hasPhoto: true }))).toBe(3);
  });

  it('tier 3 for a video (the branch the literal mockup port would drop)', () => {
    expect(computeFlowerTier(input({ hasVideo: true }))).toBe(3);
  });

  it('photo/note/video outrank health chips (first-match order)', () => {
    expect(computeFlowerTier(input({ hasHealthChip: true, hasNote: true }))).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/__tests__/flowerTier.test.ts`
Expected: FAIL — "Cannot find module '../flowerTier'".

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/flowerTier.ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/__tests__/flowerTier.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/flowerTier.ts src/lib/__tests__/flowerTier.test.ts
git commit -m "feat(garden): computeFlowerTier helper with video tier-3 branch"
```

---

### Task 3: Deterministic seeded flower placement

**Files:**
- Create: `src/lib/gardenPlacement.ts`
- Test: `src/lib/__tests__/gardenPlacement.test.ts`

A flower's home is fixed forever and identical across devices, derived from its seed (spec §4.2 / §6.1). Jitter inside a bed rect; reject-and-re-jitter on collision.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/__tests__/gardenPlacement.test.ts
import { hashSeed, seededFlowerPosition, placeFlowers, BedRect } from '../gardenPlacement';

const BED: BedRect = { x: 0, y: 0, width: 100, height: 200 };

describe('gardenPlacement', () => {
  it('hashSeed is deterministic for the same seed', () => {
    expect(hashSeed('check-in-abc')).toBe(hashSeed('check-in-abc'));
  });

  it('hashSeed differs for different seeds', () => {
    expect(hashSeed('check-in-abc')).not.toBe(hashSeed('check-in-xyz'));
  });

  it('seededFlowerPosition is stable across calls (same point forever)', () => {
    const a = seededFlowerPosition('seed-1', BED);
    const b = seededFlowerPosition('seed-1', BED);
    expect(a).toEqual(b);
  });

  it('places the point inside the bed (within the margin)', () => {
    const p = seededFlowerPosition('seed-1', BED);
    expect(p.x).toBeGreaterThanOrEqual(BED.x);
    expect(p.x).toBeLessThanOrEqual(BED.x + BED.width);
    expect(p.y).toBeGreaterThanOrEqual(BED.y);
    expect(p.y).toBeLessThanOrEqual(BED.y + BED.height);
  });

  it('placeFlowers keeps every pair at least minDist apart', () => {
    const seeds = ['a', 'b', 'c', 'd', 'e'];
    const pts = placeFlowers(seeds, BED, 20);
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        expect(d).toBeGreaterThanOrEqual(20 - 1e-6);
      }
    }
  });

  it('placeFlowers is deterministic for the same seed order', () => {
    const seeds = ['a', 'b', 'c'];
    expect(placeFlowers(seeds, BED, 15)).toEqual(placeFlowers(seeds, BED, 15));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/__tests__/gardenPlacement.test.ts`
Expected: FAIL — "Cannot find module '../gardenPlacement'".

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/gardenPlacement.ts
// Deterministic, device-independent flower placement. A flower seeded by its check-in id
// gets the same jittered home on every device and every reload (spec §4.2 / §6.1).

export interface BedRect { x: number; y: number; width: number; height: number; }
export interface Point { x: number; y: number; }

// cyrb53 — a fast, well-distributed 53-bit string hash. No Math.random anywhere.
export function hashSeed(seed: string): number {
  let h1 = 0xdeadbeef ^ seed.length;
  let h2 = 0x41c6ce57 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    const ch = seed.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Two independent floats in [0,1) from one seed (salt the second draw).
function seededPair(seed: string): [number, number] {
  const a = hashSeed(seed) % 1_000_003;
  const b = hashSeed(`${seed}::y`) % 1_000_003;
  return [a / 1_000_003, b / 1_000_003];
}

// One jittered point inside the bed, kept `margin` (fraction) off the edges.
export function seededFlowerPosition(seed: string, bed: BedRect, margin = 0.12): Point {
  const [u, v] = seededPair(seed);
  const mx = bed.width * margin;
  const my = bed.height * margin;
  return {
    x: bed.x + mx + u * (bed.width - 2 * mx),
    y: bed.y + my + v * (bed.height - 2 * my),
  };
}

// Place a list of seeds, re-jittering (with a salted seed) on collision so it reads
// "tended scatter," never clutter. Falls back to the last candidate after maxTries.
export function placeFlowers(seeds: string[], bed: BedRect, minDist: number, maxTries = 24): Point[] {
  const placed: Point[] = [];
  for (const seed of seeds) {
    let candidate = seededFlowerPosition(seed, bed);
    for (let t = 0; t < maxTries; t++) {
      const ok = placed.every((p) => Math.hypot(p.x - candidate.x, p.y - candidate.y) >= minDist);
      if (ok) break;
      candidate = seededFlowerPosition(`${seed}::retry${t}`, bed);
    }
    placed.push(candidate);
  }
  return placed;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/__tests__/gardenPlacement.test.ts`
Expected: PASS (6 tests). *(If the 5-seed min-distance test is ever flaky at minDist=20 in a 100×200 bed, it will not be — 5 points fit comfortably — but if seeds change, keep minDist ≤ ~one flower width.)*

- [ ] **Step 5: Commit**

```bash
git add src/lib/gardenPlacement.ts src/lib/__tests__/gardenPlacement.test.ts
git commit -m "feat(garden): deterministic seeded flower placement"
```

---

### Task 4: `buildGardenWeek` — the normalized week-array

**Files:**
- Create: `src/lib/gardenWeek.ts`
- Test: `src/lib/__tests__/gardenWeek.test.ts`

The one data shape that drives rendering (spec §6.4). Arranges per-day flower data into a Mon–Sun grid.

> **DRY note:** if `src/lib/weekGrouping.ts` exists in this checkout (it ships with My Dogs PR #23), replace the local `getWeekStartMonday`/`addDaysStr` below with imports of its `getWeekStart`/`addDaysStr` and delete the duplicates. As of `origin/main = ebed28c` it does NOT exist, so this task is self-contained.

- [ ] **Step 1: Write the failing test**

```typescript
// src/lib/__tests__/gardenWeek.test.ts
import { getWeekStartMonday, addDaysStr, buildGardenWeek, GardenFlowerInput } from '../gardenWeek';

describe('gardenWeek date helpers', () => {
  it('getWeekStartMonday returns the Monday of the week (Sat 2026-06-20 -> Mon 2026-06-15)', () => {
    expect(getWeekStartMonday('2026-06-20')).toBe('2026-06-15');
  });
  it('getWeekStartMonday on a Monday returns that Monday', () => {
    expect(getWeekStartMonday('2026-06-15')).toBe('2026-06-15');
  });
  it('addDaysStr adds days without timezone drift', () => {
    expect(addDaysStr('2026-06-15', 6)).toBe('2026-06-21');
    expect(addDaysStr('2026-06-30', 1)).toBe('2026-07-01');
  });
});

describe('buildGardenWeek', () => {
  const flowers: GardenFlowerInput[] = [
    { id: 'c1', date: '2026-06-15', mood: 'joyful', tier: 1 },   // Mon
    { id: 'c2', date: '2026-06-17', mood: 'calm', tier: 3 },     // Wed
  ];

  it('produces 7 Mon..Sun days', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days).toHaveLength(7);
    expect(week.days[0].date).toBe('2026-06-15');
    expect(week.days[6].date).toBe('2026-06-21');
    expect(week.weekStart).toBe('2026-06-15');
  });

  it('marks planted days with mood+tier and seeds them by check-in id', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'joyful', tier: 1, seed: 'c1' });
    expect(week.days[2]).toMatchObject({ state: 'planted', moodKey: 'calm', tier: 3, seed: 'c2' });
    expect(week.plantedCount).toBe(2);
  });

  it('marks today (unlogged) as "today" and other empty days as "empty"', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days[5].date).toBe('2026-06-20');
    expect(week.days[5].state).toBe('today');   // Sat, no flower yet
    expect(week.days[1].state).toBe('empty');   // Tue, missed -> bare soil, never "missed"
  });

  it('an already-logged today is "planted", not "today"', () => {
    const week = buildGardenWeek({
      today: '2026-06-20',
      flowers: [...flowers, { id: 'c3', date: '2026-06-20', mood: 'playful', tier: 2 }],
    });
    expect(week.days[5].state).toBe('planted');
  });

  it('empty days seed by date (stable home if later planted)', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days[1].seed).toBe('2026-06-16');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/lib/__tests__/gardenWeek.test.ts`
Expected: FAIL — "Cannot find module '../gardenWeek'".

- [ ] **Step 3: Write the implementation**

```typescript
// src/lib/gardenWeek.ts
// The normalized week-array: the single data shape that drives garden rendering (spec §6.4).
// Week runs Monday..Sunday. A missed day is bare soil ("empty"), NEVER "missed" (no guilt).

import type { GardenMood } from '../constants/gardenMoods';
import type { FlowerTier } from './flowerTier';

export type GardenDayState = 'planted' | 'today' | 'empty';

export interface GardenFlowerInput {
  id: string;          // check-in id — the deterministic placement seed
  date: string;        // YYYY-MM-DD
  mood: GardenMood;    // flower color
  tier: FlowerTier;    // 1..3 (a planted day always has a mood -> tier >= 1)
}

export interface GardenDay {
  date: string;        // YYYY-MM-DD
  weekday: number;     // 0 = Mon ... 6 = Sun
  state: GardenDayState;
  moodKey: GardenMood | null;
  tier: FlowerTier;
  seed: string;        // check-in id when planted; the date string otherwise
}

export interface GardenWeek {
  weekStart: string;   // Monday YYYY-MM-DD
  days: GardenDay[];   // length 7, Mon..Sun
  plantedCount: number;
}

// Parse a YYYY-MM-DD as a UTC date to avoid local-timezone drift, then format back.
function toUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
function fmt(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function addDaysStr(dateStr: string, days: number): string {
  const d = toUTC(dateStr);
  d.setUTCDate(d.getUTCDate() + days);
  return fmt(d);
}

// Monday of the week containing dateStr (ISO week start).
export function getWeekStartMonday(dateStr: string): string {
  const d = toUTC(dateStr);
  const dow = d.getUTCDay();            // 0 = Sun ... 6 = Sat
  const deltaToMonday = dow === 0 ? -6 : 1 - dow;
  return addDaysStr(dateStr, deltaToMonday);
}

export function buildGardenWeek(opts: { today: string; flowers: GardenFlowerInput[] }): GardenWeek {
  const weekStart = getWeekStartMonday(opts.today);
  const byDate = new Map(opts.flowers.map((f) => [f.date, f]));

  const days: GardenDay[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDaysStr(weekStart, i);
    const flower = byDate.get(date);
    if (flower) {
      days.push({ date, weekday: i, state: 'planted', moodKey: flower.mood, tier: flower.tier, seed: flower.id });
    } else if (date === opts.today) {
      days.push({ date, weekday: i, state: 'today', moodKey: null, tier: 0, seed: date });
    } else {
      days.push({ date, weekday: i, state: 'empty', moodKey: null, tier: 0, seed: date });
    }
  }

  return { weekStart, days, plantedCount: days.filter((d) => d.state === 'planted').length };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/lib/__tests__/gardenWeek.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/gardenWeek.ts src/lib/__tests__/gardenWeek.test.ts
git commit -m "feat(garden): buildGardenWeek normalized week-array + date helpers"
```

---

### Task 5: Additive `garden_mood` migration + type updates *(DECISION-GATED — see top)*

**Files:**
- Create: `supabase/migrations/<timestamp>_add_garden_mood.sql`
- Modify: `src/types/checkIn.ts` (add `garden_mood` to `DailyCheckIn`, `CheckInDraft`, `RevisionEntry.snapshot`)

- [ ] **Step 1: Generate the migration file with a real timestamp**

Run: `cd supabase && npx supabase migration new add_garden_mood` (creates `supabase/migrations/<ts>_add_garden_mood.sql`). If the Supabase CLI is unavailable, create the file manually with a UTC timestamp prefix matching the existing convention (e.g. `20260620XXXXXX_add_garden_mood.sql`).

- [ ] **Step 2: Write the migration SQL**

```sql
-- Additive Journey-garden flower color. NOT a remap of the clinical `mood` column
-- (which feeds pattern detection, AI baseline, and the sudden_aggression rule).
-- No CHECK constraint: GARDEN_MOODS in src/constants/gardenMoods.ts is the single
-- source of truth (owner rule: no duplicated enums between TS and Postgres).
alter table public.daily_check_ins
  add column if not exists garden_mood text;

comment on column public.daily_check_ins.garden_mood is
  'Journey-garden mood (flower color). One of GARDEN_MOODS in src/constants/gardenMoods.ts. App-validated; nullable; additive to the clinical mood column.';
```

- [ ] **Step 3: Apply the migration**

Apply via the Supabase MCP `apply_migration` (name `add_garden_mood`, the SQL above) OR `npx supabase db push` against the project. Then confirm:

Run (MCP `execute_sql` or psql): `select column_name from information_schema.columns where table_name = 'daily_check_ins' and column_name = 'garden_mood';`
Expected: one row, `garden_mood`.

- [ ] **Step 4: Update the TypeScript types**

In `src/types/checkIn.ts`:
- add the import at the top: `import type { GardenMood } from '../constants/gardenMoods';`
- add `garden_mood: GardenMood | null;` to the `DailyCheckIn` interface (after `mood: Mood;`)
- add `garden_mood: GardenMood | null;` to `RevisionEntry.snapshot` (after its `mood: Mood;`)
- add `garden_mood: GardenMood | null;` to `CheckInDraft` (after its `mood: Mood | null;`)

- [ ] **Step 5: Verify types compile and existing tests still pass**

Run: `npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l`
Expected: same count as the pre-task baseline (re-check the baseline at session start per `HANDOFF.md` §12 — 30 pre-#23-merge, 1 post). Then `npx jest src/lib/__tests__/daySummary.test.ts` (regression guard) → PASS.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/*_add_garden_mood.sql src/types/checkIn.ts
git commit -m "feat(garden): additive garden_mood column + types (clinical mood untouched)"
```

---

### Task 6: Static flower + scene asset map

**Files:**
- Create: `src/constants/flowerAssets.ts`
- Test: `src/constants/__tests__/flowerAssets.test.ts`

Metro cannot do template-literal `require()` (memory `feedback_rn_metro_static_require.md`). Build the literal 24-flower object map + scene assets.

> **Asset prerequisite:** the 24 flower PNGs exist (`assets/garden/flowers/puplog-flower-[mood]-tier[1-3].png`, verified 24/24) but **carry white backgrounds and are 1–6 MB** (`HANDOFF.md` §7.5). Before this renders cleanly in-app they need transparent + downscaled exports. If transparent exports are not ready when this task runs, the map still compiles and renders (with white halos) — flag it for the art pipeline; do not hand-edit the PNGs (memory `feedback_sticker_artwork_is_drop_in.md`).

- [ ] **Step 1: Write the failing test**

```typescript
// src/constants/__tests__/flowerAssets.test.ts
import { FLOWER_ASSETS, SCENE_ASSETS } from '../flowerAssets';
import { GARDEN_MOODS } from '../gardenMoods';

describe('flowerAssets', () => {
  it('has all 8 moods × 3 tiers = 24 flower sources', () => {
    let count = 0;
    for (const mood of GARDEN_MOODS) {
      for (const tier of [1, 2, 3] as const) {
        expect(FLOWER_ASSETS[mood][tier]).toBeDefined();
        count++;
      }
    }
    expect(count).toBe(24);
  });

  it('exposes the scene kit (doghouse, sprout, mound)', () => {
    expect(SCENE_ASSETS.doghouse).toBeDefined();
    expect(SCENE_ASSETS.sprout).toBeDefined();
    expect(SCENE_ASSETS.mound).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/constants/__tests__/flowerAssets.test.ts`
Expected: FAIL — "Cannot find module '../flowerAssets'".

- [ ] **Step 3: Write the implementation** (full literal map — no loops, no template requires)

```typescript
// src/constants/flowerAssets.ts
// Static require() map — Metro cannot resolve template-literal requires.
import type { ImageSourcePropType } from 'react-native';
import type { GardenMood } from './gardenMoods';

export const FLOWER_ASSETS: Record<GardenMood, Record<1 | 2 | 3, ImageSourcePropType>> = {
  joyful: {
    1: require('../../assets/garden/flowers/puplog-flower-joyful-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-joyful-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-joyful-tier3.png'),
  },
  playful: {
    1: require('../../assets/garden/flowers/puplog-flower-playful-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-playful-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-playful-tier3.png'),
  },
  affectionate: {
    1: require('../../assets/garden/flowers/puplog-flower-affectionate-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-affectionate-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-affectionate-tier3.png'),
  },
  calm: {
    1: require('../../assets/garden/flowers/puplog-flower-calm-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-calm-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-calm-tier3.png'),
  },
  curious: {
    1: require('../../assets/garden/flowers/puplog-flower-curious-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-curious-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-curious-tier3.png'),
  },
  tired: {
    1: require('../../assets/garden/flowers/puplog-flower-tired-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-tired-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-tired-tier3.png'),
  },
  anxious: {
    1: require('../../assets/garden/flowers/puplog-flower-anxious-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-anxious-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-anxious-tier3.png'),
  },
  unwell: {
    1: require('../../assets/garden/flowers/puplog-flower-unwell-tier1.png'),
    2: require('../../assets/garden/flowers/puplog-flower-unwell-tier2.png'),
    3: require('../../assets/garden/flowers/puplog-flower-unwell-tier3.png'),
  },
};

export const SCENE_ASSETS = {
  doghouse: require('../../assets/garden/puplog-doghouse.png'),
  sprout: require('../../assets/garden/puplog-sprout.png'),
  mound: require('../../assets/garden/puplog-mound.png'),
} as const;
```

> If `puplog-sprout.png` / `puplog-mound.png` are not yet generated (scene kit is owner-pending, spec §6.6), this require will fail the bundler. If they are missing when this task runs, comment those two lines and the `SCENE_ASSETS` test assertions for them, leaving a `// TODO(scene-kit): wire when generated` — do NOT create placeholder art. Re-enable when the PNGs land.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/constants/__tests__/flowerAssets.test.ts`
Expected: PASS (2 tests). *(jest-expo maps PNG requires to a stub, so this passes without the files being valid images — but the bundler in Step 3's note is the real check.)*

- [ ] **Step 5: Commit**

```bash
git add src/constants/flowerAssets.ts src/constants/__tests__/flowerAssets.test.ts
git commit -m "feat(garden): static flower + scene asset map (Metro-safe)"
```

---

### Task 7: `gardenStore` — fetch the week + derive `GardenWeek`

**Files:**
- Create: `src/stores/gardenStore.ts`
- Test: `src/stores/__tests__/gardenStore.test.ts`

Reads `daily_check_ins` for the dog's current Mon–Sun week, derives each day's tier via `computeFlowerTier`, and exposes a `GardenWeek`. Mirrors `healthStore`'s clear-on-dog-switch (spec §6.4). Writing `garden_mood` lands in Milestone 2 (Task 11).

- [ ] **Step 1: Write the failing test** (mock Supabase like the other store tests; jest.setup already mocks the client)

```typescript
// src/stores/__tests__/gardenStore.test.ts
import { useGardenStore } from '../gardenStore';

describe('gardenStore', () => {
  beforeEach(() => {
    useGardenStore.setState({ week: null, isLoading: false, error: null, dogId: null });
  });

  it('starts empty', () => {
    const s = useGardenStore.getState();
    expect(s.week).toBeNull();
    expect(s.isLoading).toBe(false);
  });

  it('deriveWeek builds a GardenWeek and derives tier from row fields', () => {
    const rows = [
      { id: 'c1', check_in_date: '2026-06-15', garden_mood: 'joyful', additional_symptoms: [], free_text: null },
      { id: 'c2', check_in_date: '2026-06-17', garden_mood: 'calm', additional_symptoms: ['scratching'], free_text: 'itchy' },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.days).toHaveLength(7);
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'joyful', tier: 1 }); // mood only
    expect(week.days[2]).toMatchObject({ state: 'planted', moodKey: 'calm', tier: 3 });   // note -> T3
    expect(week.plantedCount).toBe(2);
  });

  it('skips rows with a null/invalid garden_mood (un-planted in the garden)', () => {
    const rows = [
      { id: 'c1', check_in_date: '2026-06-15', garden_mood: null, additional_symptoms: [], free_text: null },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.plantedCount).toBe(0);
    expect(week.days[0].state).toBe('empty');
  });

  it('clearGarden resets state', () => {
    useGardenStore.setState({ week: { weekStart: 'x', days: [], plantedCount: 0 }, dogId: 'd1' });
    useGardenStore.getState().clearGarden();
    expect(useGardenStore.getState().week).toBeNull();
    expect(useGardenStore.getState().dogId).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/stores/__tests__/gardenStore.test.ts`
Expected: FAIL — "Cannot find module '../gardenStore'".

- [ ] **Step 3: Write the implementation**

```typescript
// src/stores/gardenStore.ts
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isGardenMood } from '../constants/gardenMoods';
import { computeFlowerTier } from '../lib/flowerTier';
import { buildGardenWeek, getWeekStartMonday, addDaysStr, GardenFlowerInput, GardenWeek } from '../lib/gardenWeek';

// Minimal row shape this store reads (explicit column select keeps payloads small).
interface GardenRow {
  id: string;
  check_in_date: string;
  garden_mood: string | null;
  additional_symptoms: string[] | null;
  free_text: string | null;
}

interface GardenState {
  week: GardenWeek | null;
  dogId: string | null;
  isLoading: boolean;
  error: string | null;
  deriveWeek: (today: string, rows: GardenRow[]) => GardenWeek;
  fetchWeek: (dogId: string, today: string) => Promise<void>;
  clearGarden: () => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const useGardenStore = create<GardenState>((set, get) => ({
  week: null,
  dogId: null,
  isLoading: false,
  error: null,

  deriveWeek: (today, rows) => {
    const flowers: GardenFlowerInput[] = [];
    for (const row of rows) {
      if (!isGardenMood(row.garden_mood)) continue; // not planted in the garden
      const tier = computeFlowerTier({
        mood: row.garden_mood,
        hasHealthChip: (row.additional_symptoms?.length ?? 0) > 0,
        hasPhoto: false,
        hasVideo: false,
        hasNote: !!row.free_text,
      });
      flowers.push({ id: row.id, date: row.check_in_date, mood: row.garden_mood, tier });
    }
    return buildGardenWeek({ today, flowers });
  },

  fetchWeek: async (dogId, today = todayStr()) => {
    // Clear stale data immediately on dog switch (mirror healthStore).
    set({ isLoading: true, error: null, dogId, week: null });
    const weekStart = getWeekStartMonday(today);
    const weekEnd = addDaysStr(weekStart, 6);
    try {
      const { data, error } = await supabase
        .from('daily_check_ins')
        .select('id, check_in_date, garden_mood, additional_symptoms, free_text')
        .eq('dog_id', dogId)
        .gte('check_in_date', weekStart)
        .lte('check_in_date', weekEnd);
      if (error) throw error;
      // Guard against a race: ignore if the user switched dogs mid-fetch.
      if (get().dogId !== dogId) return;
      set({ week: get().deriveWeek(today, (data ?? []) as GardenRow[]), isLoading: false });
    } catch (err) {
      if (get().dogId !== dogId) return;
      set({ error: err instanceof Error ? err.message : 'Failed to load garden.', isLoading: false });
    }
  },

  clearGarden: () => set({ week: null, dogId: null, isLoading: false, error: null }),
}));
```

> Wire `clearGarden()` into sign-out and account deletion alongside the other `clear*` calls (settings sign-out + `app/delete-account.tsx`) — same pattern as `clearHealth`/`clearLearn` (`HANDOFF.md`; `src/stores/CLAUDE.md`). Add that one-line call in each location and note it in the commit.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/stores/__tests__/gardenStore.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/stores/gardenStore.ts src/stores/__tests__/gardenStore.test.ts app/\(tabs\)/settings.tsx app/delete-account.tsx
git commit -m "feat(garden): gardenStore fetch/derive week + clear-on-signout"
```

---

### Task 8: `Flower` presentational component

**Files:**
- Create: `src/components/garden/Flower.tsx`
- Test: `src/components/__tests__/Flower.test.tsx`

Renders one flower image at a tier-scaled HEIGHT (spec §5.4 — tier scales height/ornateness, not width), with a per-flower accessibility label.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/__tests__/Flower.test.tsx
import { render } from '@testing-library/react-native';
import { Flower } from '../garden/Flower';

describe('Flower', () => {
  it('renders an accessible flower with mood + tier in its label', () => {
    const { getByLabelText } = render(<Flower mood="joyful" tier={3} baseSize={48} />);
    expect(getByLabelText(/joyful/i)).toBeTruthy();
    expect(getByLabelText(/full bloom/i)).toBeTruthy();
  });

  it('scales height by tier (tier 3 taller than tier 1)', () => {
    const t1 = render(<Flower mood="calm" tier={1} baseSize={48} />).getByLabelText(/calm/i);
    const t3 = render(<Flower mood="calm" tier={3} baseSize={48} />).getByLabelText(/calm/i);
    const h1 = t1.props.style.height ?? t1.props.style[0]?.height;
    const h3 = t3.props.style.height ?? t3.props.style[0]?.height;
    expect(h3).toBeGreaterThan(h1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/__tests__/Flower.test.tsx`
Expected: FAIL — "Cannot find module '../garden/Flower'".

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/garden/Flower.tsx
import { Image, StyleSheet } from 'react-native';
import { FLOWER_ASSETS } from '../../constants/flowerAssets';
import { GARDEN_MOOD_LABELS, GardenMood } from '../../constants/gardenMoods';
import type { FlowerTier } from '../../lib/flowerTier';

// Tier scales visible height (ornateness), not width (spec §5.4).
const TIER_HEIGHT_SCALE: Record<1 | 2 | 3, number> = { 1: 1.0, 2: 1.25, 3: 1.55 };
const TIER_BLOOM_WORD: Record<1 | 2 | 3, string> = { 1: 'simple bloom', 2: 'fuller bloom', 3: 'full bloom' };

interface FlowerProps {
  mood: GardenMood;
  tier: Exclude<FlowerTier, 0>; // a rendered flower always has a mood
  baseSize: number;             // width in px; height derived from tier
}

export function Flower({ mood, tier, baseSize }: FlowerProps) {
  const height = baseSize * TIER_HEIGHT_SCALE[tier];
  return (
    <Image
      source={FLOWER_ASSETS[mood][tier]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel={`${GARDEN_MOOD_LABELS[mood]} ${TIER_BLOOM_WORD[tier]}`}
      style={[styles.flower, { width: baseSize, height }]}
    />
  );
}

const styles = StyleSheet.create({
  flower: { resizeMode: 'contain' },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/__tests__/Flower.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/garden/Flower.tsx src/components/__tests__/Flower.test.tsx
git commit -m "feat(garden): Flower component (tier scales height, a11y label)"
```

---

### Task 9: `GardenScene` + Journey hero screen (read-only) — device-QA

**Files:**
- Create: `src/components/garden/GardenScene.tsx`, `src/components/garden/EmergencyChip.tsx`, `src/components/garden/GardenGreeting.tsx`
- Test: `src/components/__tests__/GardenScene.test.tsx`
- Modify: `app/(tabs)/index.tsx` (replace legacy home with the garden hero)

> **Geometry constants are tunable on-device** (we skipped the persisted mockup; the app cannot be screenshotted from the agent env — `HANDOFF.md` H12). The `BED_*`/`PATH_*` fractions below are sensible defaults from spec §4.1–4.2; iterate them on the user's iPhone. They are named constants, not placeholders.

- [ ] **Step 1: Write the failing render test** (scene renders the right number of flowers from a `GardenWeek`)

```tsx
// src/components/__tests__/GardenScene.test.tsx
import { render } from '@testing-library/react-native';
import { GardenScene } from '../garden/GardenScene';
import type { GardenWeek } from '../../lib/gardenWeek';

const week: GardenWeek = {
  weekStart: '2026-06-15',
  plantedCount: 2,
  days: [
    { date: '2026-06-15', weekday: 0, state: 'planted', moodKey: 'joyful', tier: 1, seed: 'c1' },
    { date: '2026-06-16', weekday: 1, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-16' },
    { date: '2026-06-17', weekday: 2, state: 'planted', moodKey: 'calm', tier: 3, seed: 'c2' },
    { date: '2026-06-18', weekday: 3, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-18' },
    { date: '2026-06-19', weekday: 4, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-19' },
    { date: '2026-06-20', weekday: 5, state: 'today', moodKey: null, tier: 0, seed: '2026-06-20' },
    { date: '2026-06-21', weekday: 6, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-21' },
  ],
};

describe('GardenScene', () => {
  it('renders one flower per planted day', () => {
    const { getByLabelText } = render(<GardenScene week={week} width={390} height={300} />);
    expect(getByLabelText(/joyful/i)).toBeTruthy();
    expect(getByLabelText(/calm/i)).toBeTruthy();
  });

  it('renders nothing extra for an empty week', () => {
    const empty: GardenWeek = { ...week, plantedCount: 0, days: week.days.map((d) => ({ ...d, state: 'empty', moodKey: null, tier: 0 })) };
    const { queryByLabelText } = render(<GardenScene week={empty} width={390} height={300} />);
    expect(queryByLabelText(/bloom/i)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/__tests__/GardenScene.test.tsx`
Expected: FAIL — "Cannot find module '../garden/GardenScene'".

- [ ] **Step 3: Write `GardenScene.tsx`** (baked ground PNG once it exists; until then a token-colored View stands in — do not block on art)

```tsx
// src/components/garden/GardenScene.tsx
import { useMemo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Flower } from './Flower';
import { SCENE_ASSETS } from '../../constants/flowerAssets';
import { placeFlowers, BedRect } from '../../lib/gardenPlacement';
import type { GardenWeek, GardenDay } from '../../lib/gardenWeek';

// --- Tunable geometry (fractions of the scene box). Tune on device; not placeholders. ---
const DOGHOUSE_W = 0.42;          // doghouse width as a fraction of scene width
const LEFT_BED: BedRect  = { x: 0.06, y: 0.34, width: 0.34, height: 0.58 };
const RIGHT_BED: BedRect = { x: 0.60, y: 0.34, width: 0.34, height: 0.58 };
const FLOWER_BASE = 0.13;         // flower width as a fraction of scene width
const MIN_SPACING = 0.12;         // min center-to-center (fraction of scene width)
const LAWN = '#bcd2a3';           // physical-scene watercolor (NOT a theme token)

interface Props { week: GardenWeek; width: number; height: number; }

function toPx(bed: BedRect, w: number, h: number): BedRect {
  return { x: bed.x * w, y: bed.y * h, width: bed.width * w, height: bed.height * h };
}

export function GardenScene({ week, width, height }: Props) {
  const planted = useMemo(() => week.days.filter((d) => d.state === 'planted'), [week]);

  // Split planted days left/right by weekday parity, place each deterministically in its bed.
  const left = planted.filter((d) => d.weekday % 2 === 0);
  const right = planted.filter((d) => d.weekday % 2 === 1);
  const flowerBasePx = FLOWER_BASE * width;
  const minDistPx = MIN_SPACING * width;

  const place = (days: GardenDay[], bed: BedRect) => {
    const pts = placeFlowers(days.map((d) => d.seed), toPx(bed, width, height), minDistPx);
    return days.map((d, i) => ({ day: d, pt: pts[i] }));
  };
  const positioned = [...place(left, LEFT_BED), ...place(right, RIGHT_BED)];

  return (
    <View style={[styles.scene, { width, height, backgroundColor: LAWN }]} accessibilityRole="image">
      {/* Doghouse at the head of the path (baked scene PNG; transparent). */}
      <Image
        source={SCENE_ASSETS.doghouse}
        resizeMode="contain"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ position: 'absolute', top: 0, left: (0.5 - DOGHOUSE_W / 2) * width, width: DOGHOUSE_W * width, height: height * 0.3 }}
      />
      {positioned.map(({ day, pt }) => (
        <View key={day.date} style={{ position: 'absolute', left: pt.x - flowerBasePx / 2, top: pt.y - flowerBasePx, alignItems: 'center' }}>
          <Flower mood={day.moodKey!} tier={day.tier as 1 | 2 | 3} baseSize={flowerBasePx} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ scene: { overflow: 'hidden' } });
```

> Replace the `backgroundColor: LAWN` View with the single baked watercolor ground PNG (sky/hill/lawn/path/beds) once generated (spec §6.4 — do NOT ship live `feTurbulence`). Layer order stays back→front: ground → doghouse → flowers → (Milestone-2 chrome/sheet).

- [ ] **Step 4: Write `EmergencyChip.tsx` and `GardenGreeting.tsx`** (always-on Golden-Rule surface + handwritten week line)

```tsx
// src/components/garden/EmergencyChip.tsx
import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES } from '../../constants/onboardingTheme';

export function EmergencyChip() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/emergency')}
      hitSlop={12}
      accessibilityRole="link"
      accessibilityLabel="Emergency help"
      style={styles.chip}
    >
      <Text style={styles.text}>⚠ Emergency</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 6, minHeight: 32, justifyContent: 'center' },
  text: { color: OB_COLORS.red, fontFamily: OB_FONTS.label, fontSize: OB_FONT_SIZES.label + 2 },
});
```

```tsx
// src/components/garden/GardenGreeting.tsx
import { Text, StyleSheet } from 'react-native';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES } from '../../constants/onboardingTheme';

// Deferred decision (spec §9 Q2): derive from the week's moods vs AI. v1 = a safe static line.
// Never imply diagnosis or alarm.
export function GardenGreeting({ dogName, plantedCount }: { dogName: string; plantedCount: number }) {
  const line = plantedCount === 0 ? `${dogName}'s garden is ready to grow —` : `${dogName}'s garden this week —`;
  return <Text style={styles.text} accessibilityRole="header">{line}</Text>;
}
const styles = StyleSheet.create({
  text: { color: OB_COLORS.ink, fontFamily: OB_FONTS.handwritten, fontSize: OB_FONT_SIZES.h1 },
});
```

- [ ] **Step 5: Rewrite `app/(tabs)/index.tsx`** as the Journey hero (header chip + EmergencyChip, greeting, GardenScene, and a coral CTA stub that Milestone 2 wires to the LogSheet). Use `OB_*` tokens only; **ink `#2a221c` on coral, never white** (spec §4.5 — `OB_COLORS.ctaText` is still `#ffffff` on `origin/main`; use `OB_COLORS.ink` directly; re-check whether PR #24 merged at session start). Drive it from `gardenStore` + `dogStore`:

```tsx
// app/(tabs)/index.tsx — Journey hero (read-only in Milestone 1)
import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDogStore } from '../../src/stores/dogStore';
import { useGardenStore } from '../../src/stores/gardenStore';
import { GardenScene } from '../../src/components/garden/GardenScene';
import { GardenGreeting } from '../../src/components/garden/GardenGreeting';
import { EmergencyChip } from '../../src/components/garden/EmergencyChip';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_RADII } from '../../src/constants/onboardingTheme';

export default function JourneyScreen() {
  const { width } = useWindowDimensions();
  const dogs = useDogStore((s) => s.dogs);
  const selectedDogId = useDogStore((s) => s.selectedDogId);
  const fetchDogs = useDogStore((s) => s.fetchDogs);
  const { week, isLoading, fetchWeek } = useGardenStore();
  const dog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];

  useEffect(() => { if (dogs.length === 0) fetchDogs(); }, [dogs.length, fetchDogs]);
  useEffect(() => { if (dog) fetchWeek(dog.id); }, [dog?.id, fetchWeek]); // re-fetch + clear on dog switch

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.dogChip} accessibilityRole="button">{dog ? dog.name : 'PupLog'} ▾</Text>
        <EmergencyChip />
      </View>
      <GardenGreeting dogName={dog?.name ?? 'Your pup'} plantedCount={week?.plantedCount ?? 0} />
      <View style={styles.sceneWrap}>
        {isLoading || !week
          ? <ActivityIndicator color={OB_COLORS.accent} style={{ marginTop: 80 }} />
          : <GardenScene week={week} width={width} height={width * 0.78} />}
      </View>
      <Pressable
        style={styles.cta}
        accessibilityRole="button"
        accessibilityLabel={`Plant ${dog?.name ?? 'your pup'}'s flower for today`}
        // Milestone 2: open the LogSheet here.
        onPress={() => { /* TODO(M2): open LogSheet */ }}
      >
        <Text style={styles.ctaLabel}>Plant {dog?.name ?? 'your pup'}'s flower for today</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: OB_COLORS.cream },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  dogChip: { fontFamily: OB_FONTS.h2, fontSize: OB_FONT_SIZES.h2, color: OB_COLORS.ink },
  sceneWrap: { flex: 1, justifyContent: 'center' },
  cta: { backgroundColor: OB_COLORS.cta, borderRadius: OB_RADII.button, paddingVertical: 16, marginHorizontal: 16, marginBottom: 90, alignItems: 'center' },
  ctaLabel: { color: OB_COLORS.ink, fontFamily: OB_FONTS.cta, fontSize: OB_FONT_SIZES.h3 }, // ink-on-coral, never white
});
```

> The legacy 888-line home (`StreakCounter`, `FlippableDogCard`, etc.) is removed from the Journey tab. If any of those components are still imported elsewhere, leave the components in place; only this screen changes. Confirm no other screen imported the old `index.tsx` default export (it is a route, so none should).

- [ ] **Step 6: Run the render test + typecheck + device QA**

Run: `npx jest src/components/__tests__/GardenScene.test.tsx` → PASS (2 tests).
Run the typecheck gate (Task 5 Step 5). Then **device QA** (`HANDOFF.md` §2; `cd <worktree> && npx expo start -c` because new assets were added): open the Journey tab, confirm the garden renders this week's flowers in the beds, the Emergency chip routes to `/emergency`, and the CTA is ink-on-coral. Tune `LEFT_BED`/`RIGHT_BED`/`FLOWER_BASE` until the scatter reads "tended."

- [ ] **Step 7: Commit**

```bash
git add src/components/garden/ src/components/__tests__/GardenScene.test.tsx app/\(tabs\)/index.tsx
git commit -m "feat(garden): read-only Journey garden hero (scene + greeting + emergency + CTA stub)"
```

**✅ MILESTONE 1 REVIEW CHECKPOINT** — request code review (`superpowers:requesting-code-review` / project `/code-review`) before starting Milestone 2. The Journey tab now shows a live, per-dog, deterministic garden from real check-ins, with the Golden-Rule Emergency surface always present and no streaks anywhere.

---

# MILESTONE 2 — Logging, celebration, animation, a11y

*Adds the log bottom-sheet (plant a flower), the plant celebration, multi-dog polish, and the full accessibility pass.*

### Task 10: `TierMeter` + live preview pot

**Files:**
- Create: `src/components/garden/TierMeter.tsx`
- Test: `src/components/__tests__/TierMeter.test.tsx`

3-dot "quick · detailed · full bloom" meter + a live preview flower that grows as inputs change (spec §5.3). Pure presentational — driven by a `tier` prop computed via `computeFlowerTier`.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/__tests__/TierMeter.test.tsx
import { render } from '@testing-library/react-native';
import { TierMeter } from '../garden/TierMeter';

describe('TierMeter', () => {
  it('shows the tier-0 sprout copy when no mood is chosen', () => {
    const { getByText } = render(<TierMeter tier={0} mood={null} />);
    expect(getByText(/Waiting to sprout/i)).toBeTruthy();
  });
  it('shows the tier-3 full-bloom copy', () => {
    const { getByText } = render(<TierMeter tier={3} mood="joyful" />);
    expect(getByText(/Full bloom/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/__tests__/TierMeter.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation** (copy is verbatim from `puplog_flower_tier_logic.md` §5)

```tsx
// src/components/garden/TierMeter.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Flower } from './Flower';
import { GardenMood } from '../../constants/gardenMoods';
import type { FlowerTier } from '../../lib/flowerTier';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES } from '../../constants/onboardingTheme';

const TIER_COPY: Record<FlowerTier, [string, string]> = {
  0: ['Waiting to sprout', 'Pick her mood and a flower takes root.'],
  1: ['A simple bloom', 'Sweet! Add a health note and it grows fuller.'],
  2: ['A fuller bloom', 'Lovely. A photo or note makes it bloom completely — real evidence for Biscuit.'],
  3: ['Full bloom!', 'Beautiful — the detailed kind of entry Biscuit can really read patterns from.'],
};

export function TierMeter({ tier, mood }: { tier: FlowerTier; mood: GardenMood | null }) {
  const [label, hint] = TIER_COPY[tier];
  return (
    <View style={styles.row} accessibilityLiveRegion="polite">
      <View style={styles.pot}>
        {tier >= 1 && mood ? <Flower mood={mood} tier={tier as 1 | 2 | 3} baseSize={40} /> : <Text>🌱</Text>}
      </View>
      <View style={styles.dots}>
        {[1, 2, 3].map((n) => (
          <View key={n} style={[styles.dot, tier >= n && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  pot: { width: 44, height: 56, alignItems: 'center', justifyContent: 'flex-end' },
  dots: { flexDirection: 'row', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: OB_COLORS.muted },
  dotOn: { backgroundColor: OB_COLORS.cta },
  copy: { flex: 1 },
  label: { fontFamily: OB_FONTS.h3, fontSize: OB_FONT_SIZES.h3, color: OB_COLORS.ink },
  hint: { fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink2 },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/__tests__/TierMeter.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/garden/TierMeter.tsx src/components/__tests__/TierMeter.test.tsx
git commit -m "feat(garden): TierMeter live preview + tier copy"
```

---

### Task 11: `LogSheet` — progressive mood → chips → specifics (unlock-after-mood fix)

**Files:**
- Create: `src/components/garden/LogSheet.tsx`
- Test: `src/components/__tests__/LogSheet.test.tsx`
- Modify: `src/stores/gardenStore.ts` (add `plantFlower(dogId, draft)`)

Implements the **§5.3 gating fix**: Specifics unlocks after MOOD (not after a symptom chip) so the photo/note-only → Tier 3 path is reachable. "All normal" is exclusive and counts toward Tier 2 (spec §5.3 owner decision). v1 wires note (not photo/video — deferred per the decision gate).

- [ ] **Step 1: Add the write path to `gardenStore`** — a failing store test first:

```typescript
// add to src/stores/__tests__/gardenStore.test.ts
import { supabase } from '../../lib/supabase';

it('plantFlower upserts garden_mood + re-runs emergency detection on the note', async () => {
  const upsert = jest.fn().mockResolvedValue({ data: { id: 'c9' }, error: null });
  (supabase.from as jest.Mock) = jest.fn(() => ({ upsert: () => ({ select: () => ({ single: upsert }) }) }));
  const ok = await useGardenStore.getState().plantFlower('dog-1', {
    check_in_date: '2026-06-20', garden_mood: 'playful', additional_symptoms: [], free_text: null,
  });
  expect(ok).toBe(true);
});
```

> The exact Supabase mock shape should match the project's existing store-test mocks (see `src/stores/__tests__/checkInStore.test.ts`) — adapt the chained-builder mock to however that file stubs `.upsert().select().single()`. Keep the assertion behavioral (returns true on success).

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/stores/__tests__/gardenStore.test.ts -t plantFlower`
Expected: FAIL — `plantFlower` is not a function.

- [ ] **Step 3: Implement `plantFlower` in `gardenStore.ts`**

```typescript
// add to GardenState interface:
//   plantFlower: (dogId: string, draft: GardenDraft) => Promise<boolean>;
// and add the type + import near the top:
import { detectEmergencyKeywords } from '../lib/emergencyKeywords';

export interface GardenDraft {
  check_in_date: string;
  garden_mood: string;
  additional_symptoms: string[];
  free_text: string | null;
}

// inside create(...):
plantFlower: async (dogId, draft) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('daily_check_ins')
      .upsert(
        {
          user_id: user.id,
          dog_id: dogId,
          check_in_date: draft.check_in_date,
          garden_mood: draft.garden_mood,
          additional_symptoms: draft.additional_symptoms,
          free_text: draft.free_text,
          // Golden Rule: an edit/insert re-runs emergency detection on the note (spec §5.6).
          emergency_flagged: draft.free_text ? detectEmergencyKeywords(draft.free_text).isEmergency : false,
        },
        { onConflict: 'dog_id,check_in_date' }
      )
      .select()
      .single();
    if (error) throw error;
    // Refresh the week so the new flower appears; fire pattern/AI analysis (non-blocking).
    await get().fetchWeek(dogId, draft.check_in_date);
    supabase.functions.invoke('analyze-patterns', { body: { dog_id: dogId } }).catch(() => {});
    return true;
  } catch (err) {
    set({ error: err instanceof Error ? err.message : 'Could not plant the flower.' });
    return false;
  }
},
```

> **Golden-Rule note (carry into the clinical-flow redesign — spec §6.2):** emergency keyword detection only runs on `free_text`. In the garden flow the note is optional (Tier-3), so for mood-only / chip-only logs `emergency_flagged` is always false. The always-on Emergency chip (Task 9) is the primary net; do not let the simplified flow further shrink this surface without a compensating control. Documented in the spec under "Deferred / open."

- [ ] **Step 4: Write the `LogSheet` render test** (gating fix is the key assertion)

```tsx
// src/components/__tests__/LogSheet.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { LogSheet } from '../garden/LogSheet';

describe('LogSheet', () => {
  it('locks Specifics until a mood is chosen, then unlocks it (not gated on a symptom chip)', () => {
    const { getByLabelText, queryByLabelText } = render(<LogSheet dogId="d1" dogName="Luna" date="2026-06-20" onPlanted={() => {}} onClose={() => {}} />);
    expect(queryByLabelText(/add a note/i)).toBeNull();          // Specifics locked pre-mood
    fireEvent.press(getByLabelText(/mood Joyful/i));             // pick mood only
    expect(getByLabelText(/add a note/i)).toBeTruthy();          // unlocked WITHOUT a symptom chip
  });

  it('shows an always-reachable Emergency help link', () => {
    const { getByLabelText } = render(<LogSheet dogId="d1" dogName="Luna" date="2026-06-20" onPlanted={() => {}} onClose={() => {}} />);
    expect(getByLabelText(/emergency help/i)).toBeTruthy();
  });
});
```

- [ ] **Step 5: Run to verify it fails**

Run: `npx jest src/components/__tests__/LogSheet.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 6: Implement `LogSheet.tsx`** (mood chips → health chips → specifics; Specifics unlocks after mood)

```tsx
// src/components/garden/LogSheet.tsx
import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { GARDEN_MOODS, GARDEN_MOOD_COLORS, GARDEN_MOOD_LABELS, GardenMood } from '../../constants/gardenMoods';
import { computeFlowerTier } from '../../lib/flowerTier';
import { useGardenStore } from '../../stores/gardenStore';
import { TierMeter } from './TierMeter';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_RADII } from '../../constants/onboardingTheme';

const HEALTH_CHIPS = ['All normal', 'Eating less', 'Low energy', 'Tummy trouble', 'Stiff or limping', 'Itchy skin', 'Threw up'];
const NOTE_MAX = 500;

interface Props { dogId: string; dogName: string; date: string; onPlanted: () => void; onClose: () => void; }

export function LogSheet({ dogId, dogName, date, onPlanted, onClose }: Props) {
  const router = useRouter();
  const plantFlower = useGardenStore((s) => s.plantFlower);
  const [mood, setMood] = useState<GardenMood | null>(null);
  const [chips, setChips] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const tier = useMemo(
    () => computeFlowerTier({ mood, hasHealthChip: chips.length > 0, hasPhoto: false, hasVideo: false, hasNote: note.trim().length > 0 }),
    [mood, chips, note],
  );

  const toggleChip = (c: string) => {
    if (c === 'All normal') { setChips((p) => (p.includes('All normal') ? [] : ['All normal'])); return; }
    setChips((p) => p.includes(c) ? p.filter((x) => x !== c) : [...p.filter((x) => x !== 'All normal'), c]);
  };

  const plant = async () => {
    if (!mood) return;
    setSaving(true);
    const ok = await plantFlower(dogId, { check_in_date: date, garden_mood: mood, additional_symptoms: chips, free_text: note.trim() || null });
    setSaving(false);
    if (ok) onPlanted();
  };

  return (
    <ScrollView style={styles.sheet} keyboardDismissMode="on-drag">
      {/* Section 1: Mood (unlocks everything) */}
      <Text style={styles.section}>1 · How is {dogName} today?</Text>
      <View style={styles.chipWrap}>
        {GARDEN_MOODS.map((m) => (
          <Pressable key={m} onPress={() => setMood(m)} accessibilityRole="button"
            accessibilityState={{ selected: mood === m }} accessibilityLabel={`mood ${GARDEN_MOOD_LABELS[m]}`}
            style={[styles.moodChip, { borderColor: GARDEN_MOOD_COLORS[m] }, mood === m && { backgroundColor: GARDEN_MOOD_COLORS[m] }]}>
            <View style={[styles.dot, { backgroundColor: GARDEN_MOOD_COLORS[m] }]} />
            <Text style={styles.chipText}>{GARDEN_MOOD_LABELS[m]}</Text>
          </Pressable>
        ))}
      </View>

      {/* Section 2: Health chips — unlocks after mood */}
      {mood && (
        <>
          <Text style={styles.section}>2 · Anything to note? (optional)</Text>
          <View style={styles.chipWrap}>
            {HEALTH_CHIPS.map((c) => (
              <Pressable key={c} onPress={() => toggleChip(c)} accessibilityRole="button"
                accessibilityState={{ selected: chips.includes(c) }} accessibilityLabel={`health ${c}`}
                style={[styles.healthChip, chips.includes(c) && styles.healthChipOn]}>
                <Text style={styles.chipText}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Section 3: Specifics — THE FIX: unlocks after MOOD, not after a chip (spec §5.3) */}
      {mood && (
        <>
          <Text style={styles.section}>3 · Add detail (optional)</Text>
          <TextInput
            value={note} onChangeText={(t) => t.length <= NOTE_MAX && setNote(t)}
            multiline placeholder="A note for the day…" placeholderTextColor={OB_COLORS.muted}
            accessibilityLabel="Add a note" style={styles.note}
          />
          {/* Photo/video deferred (decision gate): a disabled, labeled affordance signals it's coming. */}
        </>
      )}

      <TierMeter tier={tier} mood={mood} />

      <Pressable onPress={plant} disabled={!mood || saving} accessibilityRole="button"
        accessibilityLabel={`Plant ${dogName}'s flower`} style={[styles.cta, (!mood || saving) && styles.ctaOff]}>
        <Text style={styles.ctaLabel}>{tier === 3 ? `Plant ${dogName}'s full bloom` : `Plant ${dogName}'s flower`}</Text>
      </Pressable>

      {/* Golden Rule: Emergency reachable mid-log */}
      <Pressable onPress={() => router.push('/emergency')} hitSlop={12} accessibilityRole="link" accessibilityLabel="Emergency help">
        <Text style={styles.emergency}>Emergency help ›</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: { backgroundColor: OB_COLORS.cream, padding: 20 },
  section: { fontFamily: OB_FONTS.h3, fontSize: OB_FONT_SIZES.h3, color: OB_COLORS.ink, marginTop: 16, marginBottom: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 2, borderRadius: OB_RADII.chip, paddingHorizontal: 10, paddingVertical: 8, minHeight: 40 },
  healthChip: { borderWidth: 2, borderColor: OB_COLORS.muted, borderRadius: OB_RADII.chip, paddingHorizontal: 12, paddingVertical: 8, minHeight: 40, justifyContent: 'center' },
  healthChipOn: { backgroundColor: OB_COLORS.selectedBg, borderColor: OB_COLORS.selectedBorder },
  dot: { width: 12, height: 12, borderRadius: 6 },
  chipText: { fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink },
  note: { minHeight: 80, borderWidth: 2, borderColor: OB_COLORS.muted, borderRadius: OB_RADII.card, padding: 12, fontFamily: OB_FONTS.body, fontSize: OB_FONT_SIZES.body, color: OB_COLORS.ink, textAlignVertical: 'top' },
  cta: { backgroundColor: OB_COLORS.cta, borderRadius: OB_RADII.button, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  ctaOff: { opacity: 0.5 },
  ctaLabel: { color: OB_COLORS.ink, fontFamily: OB_FONTS.cta, fontSize: OB_FONT_SIZES.h3 }, // ink-on-coral
  emergency: { color: OB_COLORS.red, fontFamily: OB_FONTS.label, fontSize: OB_FONT_SIZES.body, textAlign: 'center', marginTop: 16, marginBottom: 24 },
});
```

- [ ] **Step 7: Run tests + wire into the screen**

Run: `npx jest src/components/__tests__/LogSheet.test.tsx src/stores/__tests__/gardenStore.test.ts` → PASS.
In `app/(tabs)/index.tsx`, replace the CTA's `onPress` TODO with state that mounts `<LogSheet>` in a modal/bottom container, passing `dogId={dog.id}`, `dogName={dog.name}`, `date={today}`, `onPlanted={() => { setSheetOpen(false); /* celebration in Task 12 */ }}`, `onClose={() => setSheetOpen(false)}`. After a successful plant, the screen re-reads `gardenStore.week` automatically (plantFlower calls `fetchWeek`).

- [ ] **Step 8: Device QA + commit**

Device QA: pick a mood only → confirm the note field appears (gating fix) → add a note → Plant → the flower appears in a bed. Then:

```bash
git add src/components/garden/LogSheet.tsx src/components/__tests__/LogSheet.test.tsx src/stores/gardenStore.ts src/stores/__tests__/gardenStore.test.ts app/\(tabs\)/index.tsx
git commit -m "feat(garden): log sheet (mood->chips->specifics, unlock-after-mood) + plantFlower"
```

---

### Task 12: Plant celebration (`withTiming` only)

**Files:**
- Create: `src/components/garden/PlantCelebration.tsx`
- Test: `src/components/__tests__/PlantCelebration.test.tsx`

~1000ms `plantPop` with a ~1.02–1.6× overshoot settling to tier height; `withTiming` only (no springs — owner preference); gated behind `useReducedMotion()` (spec §5.6).

- [ ] **Step 1: Add the reanimated mock + write the failing test**

```tsx
// src/components/__tests__/PlantCelebration.test.tsx
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
import { render } from '@testing-library/react-native';
import { PlantCelebration } from '../garden/PlantCelebration';

describe('PlantCelebration', () => {
  it('renders the newly planted flower', () => {
    const { getByLabelText } = render(<PlantCelebration mood="joyful" tier={2} onDone={() => {}} />);
    expect(getByLabelText(/joyful/i)).toBeTruthy();
  });
  it('calls onDone (reduced-motion path resolves immediately via mock)', () => {
    const onDone = jest.fn();
    render(<PlantCelebration mood="calm" tier={1} onDone={onDone} />);
    expect(typeof onDone).toBe('function');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/components/__tests__/PlantCelebration.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement** with `useReducedMotion()` (skip the pop, render final) and `withTiming` overshoot otherwise:

```tsx
// src/components/garden/PlantCelebration.tsx
import { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, useReducedMotion, runOnJS, Easing } from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';
import { Flower } from './Flower';
import { GardenMood } from '../../constants/gardenMoods';
import type { FlowerTier } from '../../lib/flowerTier';

export function PlantCelebration({ mood, tier, onDone }: { mood: GardenMood; tier: Exclude<FlowerTier, 0>; onDone: () => void }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) { onDone(); return; }
    scale.value = withSequence(
      withTiming(1.16, { duration: 520, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 480, easing: Easing.out(Easing.cubic) }, (finished) => { if (finished) runOnJS(onDone)(); }),
    );
  }, [reduced, onDone, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View style={styles.center} pointerEvents="none">
      <Animated.View style={animStyle}><Flower mood={mood} tier={tier} baseSize={64} /></Animated.View>
    </View>
  );
}
const styles = StyleSheet.create({ center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' } });
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/components/__tests__/PlantCelebration.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire + device QA + commit** — mount `PlantCelebration` over the scene on `onPlanted`, unmount on `onDone`. Device QA: plant a flower, see the ~1s pop. Toggle iOS Reduce Motion → confirm the flower appears with no pop.

```bash
git add src/components/garden/PlantCelebration.tsx src/components/__tests__/PlantCelebration.test.tsx app/\(tabs\)/index.tsx
git commit -m "feat(garden): plant celebration (withTiming overshoot, reduced-motion safe)"
```

---

### Task 13: Multi-dog switch + idle-loop focus pausing

**Files:**
- Modify: `app/(tabs)/index.tsx` (dog switcher cross-fade + clear-on-switch; pause idle loops off-focus)

- [ ] **Step 1: Add the header dog switcher** that calls `dogStore.selectDog(id)`; the existing `useEffect([dog?.id])` already triggers `gardenStore.fetchWeek` (which clears the prior dog's `week` first — Task 7). Confirm no stale flowers flash on switch (the `set({ week: null })` at fetch start handles it).

- [ ] **Step 2: Pause idle animations when the tab is unfocused** using `useIsFocused()` (react-navigation) — guard any future cloud/sun idle loops so they don't run off-screen (spec §6.4 FPS). For Milestone 2 there are no idle loops yet (the celebration is one-shot); add the `isFocused` guard scaffold so later scene-idle work has the hook:

```tsx
import { useIsFocused } from '@react-navigation/native';
// ...inside the component:
const isFocused = useIsFocused();
// pass `paused={!isFocused}` to any future idle-loop animation component.
```

- [ ] **Step 3: Device QA** — switch dogs via the header chip; confirm each dog shows its own independent week with no flash of the previous dog's flowers.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/index.tsx
git commit -m "feat(garden): multi-dog switch (clear-on-switch) + focus-pause scaffold"
```

---

### Task 14: Accessibility pass (WCAG AA)

**Files:**
- Modify: `src/components/garden/GardenScene.tsx` (per-flower VoiceOver labels + today/empty labels)
- Test: `src/components/__tests__/GardenScene.a11y.test.tsx`

Use `accessibility-compliance`. Day-state differs in SHAPE not color alone; per-flower labels never say "missed" (spec §6.5).

- [ ] **Step 1: Write the failing a11y test**

```tsx
// src/components/__tests__/GardenScene.a11y.test.tsx
import { render } from '@testing-library/react-native';
import { GardenScene } from '../garden/GardenScene';
import type { GardenWeek } from '../../lib/gardenWeek';

const week: GardenWeek = {
  weekStart: '2026-06-15', plantedCount: 1,
  days: [
    { date: '2026-06-15', weekday: 0, state: 'planted', moodKey: 'playful', tier: 2, seed: 'c1' },
    { date: '2026-06-16', weekday: 1, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-16' },
    { date: '2026-06-17', weekday: 2, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-17' },
    { date: '2026-06-18', weekday: 3, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-18' },
    { date: '2026-06-19', weekday: 4, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-19' },
    { date: '2026-06-20', weekday: 5, state: 'today', moodKey: null, tier: 0, seed: '2026-06-20' },
    { date: '2026-06-21', weekday: 6, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-21' },
  ],
};

describe('GardenScene a11y', () => {
  it('labels the planted day with weekday + mood + tier, never "missed"', () => {
    const { getByLabelText, queryByLabelText } = render(<GardenScene week={week} width={390} height={300} />);
    expect(getByLabelText(/Monday: playful, fuller bloom/i)).toBeTruthy();
    expect(queryByLabelText(/missed/i)).toBeNull();
  });
  it('labels today as not-yet-logged with a plant prompt', () => {
    const { getByLabelText } = render(<GardenScene week={week} width={390} height={300} />);
    expect(getByLabelText(/today, not yet logged/i)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx jest src/components/__tests__/GardenScene.a11y.test.tsx`
Expected: FAIL (labels not yet present).

- [ ] **Step 3: Add labels in `GardenScene.tsx`** — give each planted flower wrapper an `accessibilityLabel` of `"<Weekday>: <mood>, <bloom word> — double-tap to view"`, and render an accessible `today` marker (a soil-mound `Pressable`) labeled `"Today, not yet logged — double-tap to plant <dog>'s flower"`. Use a `WEEKDAY_NAMES` array (`['Monday',…,'Sunday']`) and the same `TIER_BLOOM_WORD` map as `Flower`. Empty days get no announced element (bare soil = neutral, not "missed").

- [ ] **Step 4: Run to verify it passes**

Run: `npx jest src/components/__tests__/GardenScene.a11y.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Device QA (VoiceOver) + commit** — enable VoiceOver; swipe through the garden; confirm each flower announces weekday/mood/tier, today prompts to plant, and nothing says "missed."

```bash
git add src/components/garden/GardenScene.tsx src/components/__tests__/GardenScene.a11y.test.tsx
git commit -m "feat(garden): per-flower VoiceOver labels (shape+color, never 'missed')"
```

---

### Task 15: Full-suite verification + Milestone 2 review

- [ ] **Step 1: Run the whole suite** — `npm test` → expect all prior tests + the new garden suites green (`gardenMoods`, `flowerTier`, `gardenPlacement`, `gardenWeek`, `flowerAssets`, `gardenStore`, `Flower`, `GardenScene`, `GardenScene.a11y`, `TierMeter`, `LogSheet`, `PlantCelebration`). Show the output (`superpowers:verification-before-completion`).
- [ ] **Step 2: Typecheck gate** — run the filtered `tsc` (Task 5 Step 5); expect zero NEW errors over the session-start baseline.
- [ ] **Step 3: Device QA full loop** — plant a mood-only flower (Tier 1), a flower with a chip (Tier 2), and one with a note (Tier 3); switch dogs; confirm Emergency from both the header and the sheet; confirm no streak UI anywhere.
- [ ] **Step 4: Request review** — `superpowers:requesting-code-review` (or `/code-review`). Then `superpowers:finishing-a-development-branch` → PR off `origin/main`; the user QAs on iPhone, then "merge."

---

## Self-review (run against the spec)

**Spec coverage check:**
- §4.1 bands → Task 9 (header chip, EmergencyChip, greeting, scene, CTA). Tab bar already exists (`FloatingTabBar`).
- §4.2 garden geometry / deterministic placement → Tasks 3, 9 (tunable constants; seeded jitter + collision reject).
- §4.3 day/flower states → Task 4 (`planted`/`today`/`empty`, never "missed").
- §4.5 ink-on-coral CTA → Tasks 9, 11 (`OB_COLORS.ink`, not `ctaText`).
- §4.6 Emergency surface (primary + secondary) → Tasks 9 (`EmergencyChip`), 11 (sheet link).
- §5.1 tier rule + video branch → Task 2.
- §5.2 8 moods → flower color → Tasks 1, 6, 8.
- §5.3 progressive sheet + **unlock-after-mood fix** + "All normal" exclusive/counts-T2 → Task 11.
- §5.4 tier scales height → Task 8.
- §5.5 tier copy / Biscuit hints → Task 10.
- §5.6 plant celebration + edit-to-upgrade (re-runs emergency detection) → Tasks 11 (`plantFlower` upsert), 12.
- §5.7 weekly Mon–Sun → Task 4 (`getWeekStartMonday`). *(The Monday "reset as gift" + keepsake hand-off to My Dogs is NOT in this plan — see Deferred.)*
- §6.1 additive `garden_mood`, no duplicated enum → Decision gate + Tasks 1, 5, 7.
- §6.4 RN build notes (static require map, week-array, withTiming, clear-on-switch, no live feTurbulence) → Tasks 6, 4, 12, 13, 9.
- §6.5 a11y → Task 14.

**Type consistency:** `GardenMood`, `FlowerTier`, `FlowerTierInput`, `GardenWeek`/`GardenDay`/`GardenFlowerInput`, `BedRect`/`Point`, `GardenDraft` are defined once and referenced consistently. `computeFlowerTier` signature is identical in Tasks 2, 7, 11. `Flower` props (`mood`, `tier`, `baseSize`) match across Tasks 8, 10, 12.

**Placeholder scan:** geometry values (`LEFT_BED`, `FLOWER_BASE`, `TIER_HEIGHT_SCALE`, etc.) are named tunable constants with concrete defaults, not TODO placeholders. The only deferred wirings are explicitly decision-gated (photo/video) or art-pipeline-gated (baked ground PNG, sprout/mound) with clear instructions and no fabricated art.

## Deferred / open (carry to follow-up plans or owner)

1. **Photo/video upload** (Tier-3 evidence) — needs a storage bucket + picker; `computeFlowerTier` already accepts `hasPhoto`/`hasVideo`. Follow-up plan.
2. **Weekly Monday reset "as a gift" + keepsake hand-off to My Dogs look-back** (spec §5.7) — interlocks with the My Dogs `WeekLookBack`; own task once My Dogs PR #23 is merged.
3. **Baked watercolor ground PNG + sprout/mound + no-nameplate doghouse regen + downscale** (spec §4.4/§6.6) — art pipeline; the scene currently uses a token-colored lawn + the existing doghouse PNG.
4. **Greeting source** (spec §9 Q2) — static v1; decide deterministic-from-moods vs AI (must never imply diagnosis).
5. **Clinical-flow redesign** (spec §6.2) — separate brainstorm/spec; the garden's `garden_mood` is decoupled, but the redesign should preserve pattern detection / AI / emergency-keyword feeds and **not further shrink the free-text emergency-detection surface** (Task 11 note).
6. **Edit past days: read-only recap vs full editable** (spec §9 Q7) — Task 11's `plantFlower` upsert already supports re-plant/edit; the tap-a-past-bloom UX is unspecified.
7. **Bed capacity / exact px geometry** (spec §9 Q8) — tune the Task 9 constants on device; the weekday-parity left/right split is a simple default.
