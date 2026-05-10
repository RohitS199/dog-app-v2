# Profile Screen Redesign — Design Spec

**Date:** 2026-05-09
**Status:** Ready for implementation planning
**Scope:** 10 Profile screens + tab restructure + 3 new Supabase tables + full account-level achievement sticker system + theme extensions

---

## 0. Context for Implementing Engineer (start here)

> **If you're a fresh Claude Code session picking this up: read this section in full before touching code.** It's the minimum context needed to execute the spec without re-discovering what was already settled.

### 0.1 Project basics

- **Project root:** `/Users/rohitsandur/Documents/Projects/dog_app_ui`
- **What PupLog is:** React Native (Expo SDK 54) iOS/Android app for educational dog health guidance. Three core features: daily check-ins, symptom triage, Learn (article library). Backed by Supabase (Postgres + Edge Functions + RLS + pgvector). Zustand for state. 279 tests / 22 suites passing on `main`.
- **The Golden Rule:** *Never let a dog owner walk away from a genuine emergency thinking they can wait.* This rule is legally load-bearing on triage paths but does not directly apply to Profile work — flagged so you don't accidentally weaken legal components if you touch shared theme files.
- **Repo:** https://github.com/RohitS199/dog-app-v2.git, branch `main`, remote `origin`

### 0.2 Required reading before writing any code

In order:

1. **`CLAUDE.md`** at repo root — full architecture overview, store list, theme tokens, common pitfalls
2. **`src/CLAUDE.md`** and **`src/components/CLAUDE.md`** — module-specific notes
3. **`src/constants/onboardingTheme.ts`** — the scrapbook theme this work extends (NOT the `theme.ts` Earthy Dog Park palette — that's the legacy theme staying in place for non-redesign surfaces)
4. **`src/components/onboarding/ScrapbookButton.tsx`** — reference for the Duolingo-style two-layer button pattern this work reuses
5. **`src/components/onboarding/WheelPicker.tsx`** — used by the My Information birthday field
6. **`src/components/ui/FloatingTabBar.tsx`** — current custom tab bar; will be modified
7. **`app/(tabs)/_layout.tsx`** — current tab structure
8. **`app/(tabs)/settings.tsx`** — file being deleted; read to understand what's being replaced
9. **`app/change-password.tsx`** and **`app/delete-account.tsx`** — Profile rows route to these; do NOT modify them
10. **The 10 design handoff screenshots** in `/Users/rohitsandur/Downloads/design_handoff_puplog_profile/screenshots/` — visuals are final
11. **The handoff README** at `/Users/rohitsandur/Downloads/design_handoff_puplog_profile/README.md` — design tokens, component patterns, copy

### 0.3 Required reading — saved memory files

These are at `/Users/rohitsandur/.claude/projects/-Users-rohitsandur-Documents-Projects-dog-app-ui/memory/`:

| File | Why it matters |
|---|---|
| `MEMORY.md` | Index of all memories; loaded automatically into context |
| `project_achievement_stickers.md` | Locked sticker list + heroWeight values + per-dog vs account-level rule |
| `project_no_streaks.md` | Streak system is removed — do NOT reintroduce streaks |
| `project_flower_garden_system.md` | 24-flower system gates 4 of the stickers |
| `project_puplog_spacing_spec.md` | Locked spacing/typography spec |
| `feedback_puplog_design_tokens.md` | Don't deviate from spacing tokens silently |
| `feedback_no_duplicate_enums_db_and_code.md` | TS constants are the single source of truth, no Postgres CHECK enums |
| `feedback_privacy_default_opt_out.md` | Personalization toggles default false |
| `feedback_sticker_artwork_is_drop_in.md` | Don't beautify placeholder sticker art — Gemini PNGs replace them |
| `feedback_rn_metro_static_require.md` | Metro can't resolve dynamic require paths — use static asset maps |

### 0.4 Skills to invoke (in order)

1. **`superpowers:writing-plans`** — produces a numbered, step-by-step implementation plan from this spec. Run this FIRST. Do not start coding until the plan is written and approved.
2. **`superpowers:executing-plans`** — when ready to start work, this skill runs the plan with TDD + verification checkpoints
3. **`superpowers:test-driven-development`** — auto-activates during implementation; do not bypass
4. **`react-native-architecture`** — invoke before any new screen / store / navigation work
5. **`accessibility-compliance`** — invoke when building any new component (WCAG AA, 48dp touch targets, accessibility roles/labels)
6. **`supabase-postgres-best-practices`** — invoke before writing migrations (RLS, indexes, search_path)
7. **`supabase-edge-functions`** — invoke before writing the `check-achievements` Edge Function
8. **`superpowers:verification-before-completion`** — invoke before claiming any PR is done; runs tests, type-check, lint
9. **`superpowers:requesting-code-review`** — invoke when a PR is ready for review

### 0.5 Engineering conventions to follow

- **Tests are mandatory.** Follow existing patterns: Jest 29 + React Native Testing Library, mock Zustand stores directly, test behavior (not snapshots). Run `npm test` to verify. Current count: 279 tests / 22 suites — every PR adds tests, target ~459 / 44 suites by end of this work.
- **No path aliases** — all imports relative
- **No smart quotes in TS strings** — pure ASCII or escape (`\'`)
- **Jest is v29, NOT v30** — `jest-expo` requires v29
- **Edge Functions deploy with `verify_jwt: false`** — they validate JWTs internally (ES256/HS256 mismatch in the project)
- **Stores get a `clear*()` function** — gets called on sign-out (see authStore for the pattern)
- **All copy strings live in `src/constants/profileCopy.ts`** — never inline JSX strings (i18n preparation)
- **Existing screens NOT in scope** — `/change-password`, `/delete-account`, `/terms`, `/sign-in`, `/sign-up`, `/forgot-password`, `/add-dog`, `/edit-dog` keep current styling; do not re-skin them in this work

### 0.6 Decisions already settled (do NOT re-litigate)

These were ratified through a multi-round brainstorming + review process. Re-opening them wastes cycles:

| Question | Settled answer |
|---|---|
| Scope | 10 Profile screens + full 4-tab restructure |
| User profile data storage | New `user_profiles` table (phone, birthday, location, avatar_url) + `auth.users.user_metadata` for first/last name |
| Subscription data | Mock data with RevenueCat-ready interface; no real RevenueCat wiring this PR |
| Notification preferences storage | New `user_preferences` Supabase table (combined notify + privacy + security + timezone) |
| Achievement stickers | Full system: 11 sticker IDs, account-level only, ghost outlines, tap-for-criteria sheet, celebration animation, heroWeight ranking |
| Sub-screen routing | Wire existing flows; toast "Coming soon" for unbuilt items |
| Help Center FAQ source | Hardcoded in `src/constants/helpFaqs.ts` |
| Sticker artwork | Static `STICKER_ASSETS` map with `null` defaults + simple SVG placeholder fallback. Gemini PNGs drop in later. |
| Tab bar icons | Pre-rasterized PNGs from Figma SVGs (build script: `npm run build:tab-icons`) |
| Profile tab icon (until Figma asset arrives) | Inline SVG fallback using handoff's person watercolor glyph |
| FAB | Stay until Journey redesign delivers alternative check-in CTA — TODO comment |
| Tab restructure timing | Profile tab change in PR 1 (load-bearing); Journey/My Dogs/Discovery rename deferred to PR 6 |
| Birthday picker | Reuse existing `WheelPicker` (matches onboarding aesthetic) |
| First/last name parsing | Single text input on My Information; split on first whitespace on save |
| Edit avatar pencil | "Coming soon" toast (image picker out of scope) |
| Notification toggles | Persist to DB but no actual scheduling — explicitly non-functional this PR |
| ToS viewer | `/terms?mode=view` query param branch on existing `/terms.tsx`, no new file |
| heroWeight values | Locked: welcome=30, seasonal=50, pattern_spotter=55, first_peony=60, bouquet_of_joy=65, multi_pup_parent=70, full_spectrum=75, bloom_master=80 |

### 0.7 What success looks like

- 6 PRs landed, each independently reviewable and tested
- 279 → ~459 tests, 22 → ~44 suites, all green
- 10 Profile screens render pixel-correctly per handoff
- Tab bar restructured to 4 tabs with rasterized PNG icons
- 3 new Supabase tables migrated with RLS
- `check-achievements` Edge Function deployed and earning 7 of 11 stickers (4 await flower system)
- No re-skin of existing screens, no breaking changes to existing routes
- All decisions in §0.6 honored

---

## 1. Goal & Context

PupLog's current Settings tab is replaced with a 10-screen Profile flow rendered in the May 2026 scrapbook aesthetic. This work also restructures the bottom tab bar from 5 tabs (Home / Health / Learn / Triage hidden / Settings) to 4 tabs (**Journey / My Dogs / Discovery / Profile**) and ships the locked account-level achievement sticker system.

**Source design handoff:** `/Users/rohitsandur/Downloads/design_handoff_puplog_profile/` — pixel-final wireframes for 10 screens, design tokens, component patterns, copy. The handoff's HTML/JSX is a reference, not production code.

**Locked decisions referenced:**
- `project_achievement_stickers.md` — 9 account-level stickers (Welcome, Multi-Pup Parent, Pattern Spotter, Seasonal slot ×4, First Peony, Bouquet of Joy, Full Spectrum, Bloom Master) with `heroWeight` ranking algorithm
- `project_no_streaks.md` — streak system removed; stickers + flowers replace it
- `project_flower_garden_system.md` — 24-flower garden system gates 4 of the stickers
- `project_puplog_spacing_spec.md` — 24pt screen edges, 32pt section gaps, Duolingo-style 4pt offset shadow
- `feedback_no_duplicate_enums_db_and_code.md` — single TS source of truth, no Postgres CHECK constraint duplication
- `feedback_privacy_default_opt_out.md` — default-false for personalization toggles (GDPR/CCPA posture)
- `feedback_sticker_artwork_is_drop_in.md` — Gemini-generated sticker PNGs drop in later; placeholders stay simple
- `feedback_rn_metro_static_require.md` — Metro requires static `require()` paths

---

## 2. Architecture

### 2.1 Routing

New route group `app/(tabs)/profile/` containing a Stack navigator. The current `app/(tabs)/settings.tsx` file is **deleted** and replaced by this group. Existing root-level screens (`/change-password.tsx`, `/delete-account.tsx`, `/terms.tsx`) are untouched — Profile rows navigate to them via `router.push()`.

```
app/(tabs)/profile/
├── _layout.tsx                      Stack navigator (native iOS push, 300ms ease-out)
├── index.tsx                        Profile root (screen 01)
├── my-information.tsx               (screen 02)
├── my-subscription.tsx              (screen 03)
└── settings/
    ├── _layout.tsx                  Nested Stack
    ├── index.tsx                    Settings hub (screen 04)
    ├── notifications.tsx            (screen 05)
    ├── security.tsx                 (screen 06)
    ├── help-center.tsx              (screen 07)
    ├── about.tsx                    (screen 08)
    └── privacy.tsx                  (screen 09)
```

**Log Out modal (screen 10)** is a state-driven overlay component rendered inside `index.tsx`, not a route.

### 2.2 Stores (Zustand)

Three new stores in `src/stores/`:

| Store | Purpose | Persistence |
|---|---|---|
| `profileStore.ts` | Form draft state for My Information; fetches/upserts `user_profiles` row | None (memory) |
| `notificationsStore.ts` | 4 notification toggles + 3 quiet-hours fields + 2 security toggles + 3 privacy toggles + timezone — reads/writes `user_preferences` | None (single Supabase row is the source of truth) |
| `userAchievementsStore.ts` | Earned-sticker set, fetches `user_achievements`, tracks `lastEarned` for celebration trigger | None (server-authoritative) |

**`subscriptionStore.ts`** (existing, currently a stub) is extended with the full state shape: `plan`, `renewalDate`, `price`, `isActive`, `perks[]`, `manageBillingUrl?`. A `fetchSubscription()` method returns mock data today and is RevenueCat-swappable later (single-function swap, no screen refactor).

### 2.3 Sign-out store cleanup

The Log Out confirmation calls `signOut()` from `authStore` and clears all 12 stores: auth, dog, triage, checkIn, health, learn, articleTransition, onboarding, subscription, **profile** (new), **notifications** (new), **userAchievements** (new). Then `router.replace('/(auth)/sign-in')`.

---

## 3. Data Model

Three new Supabase tables. All have RLS enabled, FK to `auth.users` with `ON DELETE CASCADE`.

### 3.1 `user_profiles`

Stores phone, birthday, location, avatar URL. **`first_name` and `last_name` continue to live in `auth.users.user_metadata`**, not in this table — read via `supabase.auth.getUser()`, write via `supabase.auth.updateUser({ data: { first_name, last_name } })`.

```sql
create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  birthday date,
  location text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS: SELECT/INSERT/UPDATE own row only.
-- Trigger: update_updated_at on UPDATE.
```

### 3.2 `user_preferences`

Combined notifications + privacy + security preferences. Single row per user, single fetch on app load.

```sql
create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,

  -- Notifications
  notify_daily_log_reminder boolean default true,
  notify_weekly_insight boolean default true,
  notify_vet_appointments boolean default true,
  notify_garden_milestones boolean default false,
  notify_quiet_hours_enabled boolean default true,
  notify_quiet_hours_start time default '22:00',
  notify_quiet_hours_end time default '07:00',

  -- Security
  face_id_enabled boolean default false,
  two_factor_enabled boolean default false,

  -- Privacy (GDPR-leaning defaults — see feedback_privacy_default_opt_out.md)
  privacy_anonymous_analytics boolean default true,
  privacy_personalized_tips boolean default false,    -- explicit opt-in
  privacy_marketing_emails boolean default false,     -- explicit opt-in

  -- Timezone (IANA, populated from device on first save)
  timezone text not null default 'America/Los_Angeles',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
-- RLS: SELECT/INSERT/UPDATE own row only.
```

Default row created automatically on signup via `handle_new_user()` trigger on `auth.users` (see Migration 0006 below). The `timezone` column is the first place tz becomes authoritative in the schema — populated from `Intl.DateTimeFormat().resolvedOptions().timeZone` at first save.

### 3.3 `user_achievements`

Earned-sticker ledger. One row per (user, sticker).

```sql
create table public.user_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  sticker_id text not null,                  -- validated app-side; NO check constraint
  earned_at timestamptz default now(),
  metadata jsonb,                            -- e.g. { dog_id: '...' } for stickers triggered per-dog
  primary key (user_id, sticker_id)
);
create index ach_user_recency_idx
  on public.user_achievements (user_id, earned_at desc);
-- RLS: SELECT own; INSERT via service role (Edge Function).
```

The 11 sticker IDs (`welcome`, `seasonal_fall`, `seasonal_winter`, `seasonal_spring`, `seasonal_summer`, `pattern_spotter`, `first_peony`, `bouquet_of_joy`, `multi_pup_parent`, `full_spectrum`, `bloom_master`) live in `src/constants/achievements.ts` as a TypeScript union literal (single source of truth — see `feedback_no_duplicate_enums_db_and_code.md`).

### 3.4 Existing-table modification: `ai_health_insights.reviewed_at`

```sql
alter table public.ai_health_insights add column reviewed_at timestamptz;
```

Used by the `pattern_spotter` sticker earn rule. Nullable; existing rows stay NULL (which means Pattern Spotter triggers on the *next* insight a user views, not historical ones — acceptable simplification, no backfill).

---

## 4. Migrations

Seven migration files, sequenced into the appropriate PRs:

| # | File | PR | What |
|---|---|---|---|
| 0001 | `0001_user_profiles.sql` | PR 2 | Create `user_profiles` + RLS + updated_at trigger |
| 0002 | `0002_user_preferences.sql` | PR 4 | Create `user_preferences` (all 13 columns + timezone) + RLS |
| 0003 | `0003_user_achievements.sql` | PR 5 | Create `user_achievements` + index + RLS (no CHECK constraint) |
| 0004 | `0004_ai_insights_reviewed_at.sql` | PR 5 | `ALTER TABLE ai_health_insights ADD COLUMN reviewed_at` |
| 0005 | `0005_avatar_storage.sql` | PR 2 | Verify or create `user-avatars` Storage bucket + RLS (read public; write/update/delete only on `name LIKE auth.uid() || '/%'`) |
| 0006 | `0006_handle_new_user.sql` | PR 2 | Function + AFTER INSERT trigger on `auth.users`: creates default `user_profiles`, default `user_preferences`, inserts `welcome` achievement (`ON CONFLICT DO NOTHING`). SECURITY DEFINER, explicit search_path. Extends any existing trigger if found. |
| — | `scripts/backfill-existing-users.sql` | PR 2 | One-time, manual. For every `auth.users` row missing `user_profiles`: inserts default rows in all three new tables. `INSERT … ON CONFLICT DO NOTHING` everywhere — safe to re-run. |

**Pre-deployment check** before each migration runs in production:
```sql
select * from supabase_advisor.get_advisors();
```
Confirm 0 ERROR-level findings (matches existing security-hardening posture per `CLAUDE.md`).

---

## 5. Edge Function: `check-achievements`

Single endpoint, fire-and-forget pattern (matches `analyze-patterns` and `ai-health-analysis` conventions).

**Request:** `{ user_id: uuid, event_type: string }`
**Response:** `{ newly_earned: string[] }`
**Auth:** Service role (validates JWT internally; `verify_jwt: false` in `supabase/functions/check-achievements/index.ts` deno config — matches existing convention)

**Event types and rules:**

| Event | Caller | Stickers checked | Notes |
|---|---|---|---|
| `signup` | `handle_new_user()` SQL trigger inserts `welcome` directly | `welcome` | No Edge Function call needed for this one |
| `dog_added` | `dogStore.addDog()` after successful insert | `multi_pup_parent` | Predicate: `count(dogs WHERE user_id) >= 2` |
| `ai_insight_viewed` | `healthStore.markInsightReviewed(id)` (called when user taps an `<AIInsightCard>`) | `pattern_spotter` | First insight ever viewed per user |
| `app_opened` | `userAchievementsStore.checkSeasonal()` once per session (cold launch only) | `seasonal_*` | Current season computed from date; no cron |
| `flower_earned` | (future) `flowerStore.recordFlower()` | `first_peony`, `bloom_master`, `full_spectrum`, `bouquet_of_joy` | **Gated by `FLOWERS_ENABLED` constant in the Edge Function** — 4 stickers stay locked until flowers ship |

**Idempotency:** All inserts use `ON CONFLICT DO NOTHING`. Same event fired twice produces one row.

**Implementation note for `bouquet_of_joy` / `first_peony` / `full_spectrum` / `bloom_master`:** Triggered by per-dog events but earned once at the account level. The `metadata.dog_id` field stores which dog triggered it (for celebration copy). Future engineers must NOT refactor to per-dog uniqueness — see code comment in `check-achievements/index.ts`:

```ts
// Account-level sticker triggered by per-dog event.
// The flower belongs to ONE dog's garden, but the achievement is earned ONCE per account.
// Stored as a single row (user_id, sticker_id) — `metadata.dog_id` records which dog
// triggered it for celebration copy. Do not refactor to per-dog earning;
// see project_achievement_stickers.md "Account-level vs per-dog asymmetry".
```

**Logging:** Structured `console.log` with `{ event_type, user_id, newly_earned, latency_ms }`. Same pattern as `analyze-patterns`.

**Shared constants between app and Edge Function:** `STICKER_IDS` array duplicated in `supabase/functions/_shared/achievements.ts`. A lint-test (`achievements.test.ts`) asserts equality between `STICKER_IDS_APP` and `STICKER_IDS_EDGE` to prevent drift. Drift catches in CI, not at runtime.

---

## 6. Theme

The handoff's tokens already match `src/constants/onboardingTheme.ts` for cream/peach/wood/ink/sketch/cta. The redesign uses the *onboarding* theme (cream-paper scrapbook), NOT the locked Earthy Dog Park palette in `theme.ts` — the May 2026 redesign is migrating the whole app to scrapbook (in progress). `theme.ts` continues to apply to non-redesign surfaces (triage, legal components) that aren't being touched.

### 6.1 Extensions to `onboardingTheme.ts`

```ts
// New colors
OB_COLORS.peachSoft  = '#fbe6cc';   // RowItem fill
OB_COLORS.red        = '#c75f4a';   // destructive text (Cancel Sub, Delete Account)
OB_COLORS.orangeSoft = '#f9a886';   // toggle ON track
OB_COLORS.petalA     = '#e8a6a0';   // watercolor accent
OB_COLORS.petalB     = '#d9a96a';   // watercolor accent

// New radii
OB_RADII.rowItem = 18;
OB_RADII.pillBtn = 22;
OB_RADII.modal   = 18;

// New spacing
OB_SPACING.gap1 = 4;
OB_SPACING.gap2 = 6;
```

### 6.2 New font: Nunito

Add `@expo-google-fonts/nunito` (4 weights). Load in `app/_layout.tsx` via `useFonts()`. Add to `OB_FONTS`:

```ts
OB_FONTS.dataLabel = 'Nunito_600SemiBold';   // InfoField label
OB_FONTS.dataValue = 'Nunito_500Medium';     // InfoField value
OB_FONTS.btnLabel  = 'Nunito_700Bold';       // Save Changes
```

### 6.3 Copy in constants (i18n preparation)

All user-facing strings on Profile screens live in `src/constants/profileCopy.ts`, not inline JSX. Pattern:

```tsx
<Text>{COPY.PROFILE_LOGOUT_HEADING}</Text>          // not "Heading out?"
```

This makes future i18n a single-file extraction.

---

## 7. New Components (`src/components/profile/`)

Built in PR 1 (Foundations) before any screen consumes them. Each in its own file with a behavioral test.

### 7.1 Shared primitives

| Component | Purpose |
|---|---|
| `NavBar.tsx` | Header: back chevron `‹` (orange Caveat 24) + centered title (Patrick Hand 18). Optional `back={false}`. |
| `RowItem.tsx` | Peach-soft pill, leading icon, **centered** label, chevron. Used in Settings, Help, About, Privacy. |
| `NavButton.tsx` | Profile-root variant: leading icon + **left-aligned** label. Used for the 3 nav rows on Profile root. |
| `WoodPortrait.tsx` | Wood-frame avatar — wood ring + cream inner border + photo (or stripe placeholder). Sizes 68 / 76 / 130. Renders `<Image source={{uri: avatar_url}}>` when avatar set, stripe pattern otherwise. |
| `Toggle.tsx` | 36×20 pill, sketch border, Reanimated thumb. OFF = cream track + black thumb. ON = `orangeSoft` track + white thumb with border. 150ms spring. |
| `ToggleRow.tsx` | RowItem shell + label/sub stack + Toggle. Optimistic — fires store update on change, no save button. |
| `InfoField.tsx` | Bordered input with watercolor icon + label/value stack. Focused = orange 2px border. Edit mode = `<TextInput>`; idle = static text. |
| `PillButton.tsx` | Log Out (cream fill, orange border) + modal CTAs (solid orange, ghost cream). 22 radius, 1.5px black box-shadow. |
| `SaveButton.tsx` | Duolingo-style two-layer: dark slab `#c75f3d` absolutely positioned `inset: 4px 0 -4px 0` behind orange face. Reuses `OB_SHADOWS.button` and `OB_BUTTON_PRESS_TRANSLATE`. |
| `LogOutModal.tsx` | Bottom-pinned card 90px above tab bar, backdrop dims root to 0.4. Reanimated scale-up + fade entrance (250ms). |
| `PerkRow.tsx` | Subscription perks: 18px green check circle + body text. |
| `StickerIcon.tsx` | 26×26 rounded-square with single Caveat character — generic leading icon. |
| `glyphs.tsx` | Inline SVGs: `HeartGlyph`, `LockGlyph`, `CardGlyph`, `BellGlyph`, `GearGlyph`, `ExitDoorGlyph` + 5 watercolor InfoField icons (person, envelope, phone, cupcake, pin). |

### 7.2 Sticker subsystem (`src/components/profile/stickers/`)

Built in PR 5.

| Component | Purpose |
|---|---|
| `StickerCollection.tsx` | Renders stickers — variants: `profile-row` (top 3 by hero rank), `sheet` (all 11). Earned = full color, unearned = dashed ghost outline. Tap → `StickerDetailSheet`. Deterministic rotation by sticker ID. |
| `StickerCard.tsx` | One sticker. Reads asset from static `STICKER_ASSETS` map (Section 7.4); falls back to category-color SVG circle with sticker's first letter when asset is `null`. |
| `StickerDetailSheet.tsx` | Bottom sheet — title, description, criteria (or earned date), category badge. Uses existing `DayDetailSheet` modal pattern. |
| `StickerEarnCelebration.tsx` | Full-screen overlay triggered by `userAchievementsStore.lastEarned`. Animation: `withSequence(withTiming(1.02, { duration:400, easing: Easing.out(Easing.back()) }), withTiming(1, { duration:600, easing: Easing.out(Easing.cubic) }))` — 1000ms total, 1.02× peak per locked spacing-spec memory. Visual-test on device before locking exact easing values. |

### 7.3 Sticker manifest (`src/constants/achievements.ts`)

```ts
export const STICKER_IDS = [
  'welcome',
  'seasonal_fall', 'seasonal_winter', 'seasonal_spring', 'seasonal_summer',
  'pattern_spotter',
  'first_peony',
  'bouquet_of_joy',
  'multi_pup_parent',
  'full_spectrum',
  'bloom_master',
] as const;
export type StickerId = typeof STICKER_IDS[number];

export type StickerCategory =
  | 'milestone' | 'mastery' | 'engagement' | 'seasonal';

export type StickerDef = {
  id: StickerId;
  title: string;
  description: string;
  unlockCriteria: string;        // shown on ghost detail sheet
  category: StickerCategory;
  heroWeight: number;            // for ranking on Profile root
  rotation: number;              // -7..7, deterministic per id
  enabledWhen?: 'always' | 'flowers_shipped';
};

export const STICKERS: Record<StickerId, StickerDef> = {
  welcome:          { ..., heroWeight: 30 },
  seasonal_fall:    { ..., heroWeight: 50 },
  seasonal_winter:  { ..., heroWeight: 50 },
  seasonal_spring:  { ..., heroWeight: 50 },
  seasonal_summer:  { ..., heroWeight: 50 },
  pattern_spotter:  { ..., heroWeight: 55 },
  first_peony:      { ..., heroWeight: 60, enabledWhen: 'flowers_shipped' },
  bouquet_of_joy:   { ..., heroWeight: 65, enabledWhen: 'flowers_shipped' },
  multi_pup_parent: { ..., heroWeight: 70 },
  full_spectrum:    { ..., heroWeight: 75, enabledWhen: 'flowers_shipped' },
  bloom_master:     { ..., heroWeight: 80, enabledWhen: 'flowers_shipped' },
};
```

### 7.4 Sticker asset map (`src/components/profile/stickers/assets.ts`)

**CRITICAL:** Static map — Metro cannot resolve dynamic `require()` paths (see `feedback_rn_metro_static_require.md`).

```ts
export const STICKER_ASSETS: Record<StickerId, ImageSourcePropType | null> = {
  welcome:          null,   // null until Gemini-generated PNG ships
  seasonal_fall:    null,
  seasonal_winter:  null,
  seasonal_spring:  null,
  seasonal_summer:  null,
  pattern_spotter:  null,
  first_peony:      null,
  bouquet_of_joy:   null,
  multi_pup_parent: null,
  full_spectrum:    null,
  bloom_master:     null,
};
// When a PNG is dropped into src/assets/stickers/, replace the null:
//   welcome: require('../../../assets/stickers/welcome.png'),
```

The `StickerCard` component uses `if (STICKER_ASSETS[id]) <Image source={STICKER_ASSETS[id]}/> else <PlaceholderSVG id={id}/>`. Drop-in replacement when art lands.

### 7.5 Hero ranking algorithm

```ts
function sortKey(s: StickerDef, earned: boolean): number {
  return s.heroWeight + (earned ? 100 : 0);
}

function topThreeForRow(allStickers, earnedSet, FLOWERS_ENABLED): StickerDef[] {
  const eligible = allStickers.filter(s => s.enabledWhen === 'always' || FLOWERS_ENABLED);
  return [...eligible]
    .sort((a, b) => sortKey(b, earnedSet.has(b.id)) - sortKey(a, earnedSet.has(a.id)))
    .slice(0, 3);
}
```

The `enabledWhen === 'flowers_shipped'` filter ensures users don't see flower-gated ghosts on the Profile root while flowers don't exist. The collection sheet still shows all 11 (flower-gated ones display "Coming with the flower system" sub-text).

---

## 8. Tab Bar

### 8.1 Current → New

5 tabs (Home / Health / Learn / Triage hidden / Settings) → 4 tabs (Journey / My Dogs / Discovery / Profile).

| Current | New | What changes |
|---|---|---|
| `(tabs)/index.tsx` | (same file) | Label "Home" → **"Journey"**. Content untouched. |
| `(tabs)/health.tsx` | (same file) | Label "Health" → **"My Dogs"**. Content untouched. |
| `(tabs)/learn.tsx` | (same file) | Label "Learn" → **"Discovery"**. Content untouched. |
| `(tabs)/triage.tsx` | (same file) | No change. Already `href: null`. |
| `(tabs)/settings.tsx` | **DELETED** | Tab points at `(tabs)/profile/index.tsx` route group. |

**Files are NOT renamed** — only labels and icons change. Renaming files would cascade through every `router.push()` call site. Keeping file paths stable is the safer move.

### 8.2 Tab restructure timing

Per Approach 1 sequencing (foundations first, then vertical slices), the **Journey / My Dogs / Discovery label rename is deferred to PR 6** to avoid showing users mismatched labels (e.g., "My Dogs" tab containing the existing health calendar) for 5+ PR cycles. The Profile tab change happens in PR 1 (load-bearing for the route group); the other 3 renames + Figma SVG icon swap land together in PR 6 polish.

### 8.3 Icons (rasterized PNGs from Figma SVGs)

Hand-drawn watercolor icon SVGs from Figma have very high path counts (810 / 1593 / 633 paths) — too heavy for `react-native-svg` at runtime. **Solution: rasterize to PNG at build time.**

```
assets-source/tab-icons/             # Source SVGs (committed, NOT bundled)
├── tab-journey-active.svg
├── tab-journey-inactive.svg
├── tab-mydogs-active.svg
├── tab-mydogs-inactive.svg
├── tab-discovery-active.svg
├── tab-discovery-inactive.svg
└── (Profile uses inline SVG fallback — see below)

src/assets/tab-icons/                # Bundled @2x and @3x PNGs
├── tab-journey-active@2x.png
├── tab-journey-active@3x.png
├── tab-journey-inactive@2x.png
├── tab-journey-inactive@3x.png
... (8 PNGs total for Journey/My Dogs/Discovery)
```

Build script: `scripts/rasterize-tab-icons.mjs` using `sharp`. Run via `npm run build:tab-icons`. Re-run when Figma art updates.

**Active/inactive treatment:** Asset itself communicates state (color = active, grayscale = inactive). No programmatic halo or animation needed.

### 8.4 Profile tab fallback icon

No Figma icon for Profile yet. Until provided, **Profile uses an inline SVG fallback** based on the handoff's `person` watercolor glyph (~10 paths — fine for inline rendering):

```tsx
// Active: peach #f9d6b2 fill + wood #8a5a38 stroke
// Inactive: muted #a9998a fill + ink2 stroke
<Svg viewBox="0 0 24 24">
  <Circle cx="12" cy="9" r="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.4"/>
  <Path d="M4 21 C 5 16 8 14 12 14 C 16 14 19 16 20 21 Z"
        fill={fillColor} stroke={strokeColor} strokeWidth="1.4"/>
</Svg>
```

When Figma Profile icon arrives, it slots into `assets-source/tab-icons/` and the inline fallback is removed.

### 8.5 Avatar replaces Profile icon when uploaded

If `user_profiles.avatar_url` exists, the Profile tab renders a 28pt circular `<Image source={{uri: avatar_url}}>` with a 1.5px sketch border instead of the static icon. Falls back to the static icon when no avatar. Active/inactive: full color vs. desaturated.

### 8.6 FAB

The current `FloatingTabBar` has a centered FAB (opens check-in). The new mockup tab bar does not show a FAB. **Decision: keep the FAB for this PR set with a TODO comment**, gated on the Journey redesign delivering an alternative check-in CTA. Removing the FAB now would leave no in-app path to start a check-in until Journey ships — a regression we won't accept.

```tsx
// FloatingTabBar.tsx
// TODO: Remove FAB once Journey redesign delivers an alternative check-in CTA.
// Gated on `project_journey_redesign.md` (TBD). Until then, the FAB stays
// even though the May 2026 mockup tab bar does not show it.
```

### 8.7 Layout

- Floating pill: 16pt margin from screen sides, 16pt above home indicator (via `useSafeAreaInsets()`)
- Container: green `#475E3D`, 30 radius, 76pt height
- 4 cells with icon (28pt) + label (Patrick Hand 11pt cream `#f7f1e6`, 4pt below icon)
- Triage `href: null` — hidden as today

---

## 9. Per-screen Specs

### 9.1 Profile root — `app/(tabs)/profile/index.tsx`

**Data:** `auth.users.email` + `user_metadata.first_name`, `.last_name`; `user_profiles.avatar_url`; `userAchievementsStore` (all 11 stickers + earned set).

**Layout (top → bottom):**
1. `<WoodPortrait size={68} src={avatar_url} />` centered
2. Name: `${first_name} ${last_name[0]}.` ("Aman R.") — Nunito 600 17. Falls back to "PupLog User" if no name set; falls back to first-name-only if no last name.
3. `<StickerCollection variant="profile-row" />` — top 3 stickers by `heroWeight + earned*100`, filtered by `FLOWERS_ENABLED`. Tap any sticker → opens collection sheet (full 11).
4. Three `<NavButton>` rows: My Information / My Subscription / Settings — each `router.push()` to its sub-route
5. `<PillButton variant="logout">` — sets `isModalOpen` → renders `<LogOutModal>`
6. Plain text "Delete Account" → `router.push('/delete-account')`

**Behavior:**
- Tab focus listener re-fetches `userAchievementsStore` (covers fire-and-forget timing gap)
- Cold-launch session check: `userAchievementsStore.checkSeasonal()` runs once per app process lifetime
- If `lastEarned` is set when screen mounts → render `<StickerEarnCelebration>`

**Edge cases:**
- `user_profiles` row missing (race with `handle_new_user` trigger) → defensive `INSERT … ON CONFLICT DO NOTHING` from `profileStore` on first read

### 9.2 My Information — `my-information.tsx`

**Data:** `auth.users.email` (read-only) + `user_metadata.first_name`/`.last_name`; `user_profiles.{phone, birthday, location, avatar_url}`.

**Layout:** NavBar + 76px WoodPortrait with orange ✎ pill overlay + 5 `<InfoField>` rows + `<SaveButton>`.

**Form behavior:** Local `profileStore.draft`. On mount, `loadFromAuthAndProfile()` populates draft. Edits update draft, not source. Save commits via two parallel API calls:
1. `supabase.auth.updateUser({ data: { first_name, last_name } })`
2. `supabase.from('user_profiles').upsert({ phone, birthday, location })`

Success → toast "Saved" + `router.back()`. Error → keep on screen + alert with retry.

**Field rules:**

| Field | Input | Validation |
|---|---|---|
| NAME | Single TextInput showing `${first_name} ${last_name}`. On save, split on first whitespace ("Mary Anne Smith" → `first: "Mary"`, `last: "Anne Smith"`). Focused = orange 2px border. | Empty rejected (Save disabled). |
| EMAIL | TextInput `editable={false}` (greyed). Tapping does nothing. | None — out of scope. |
| PHONE | TextInput `keyboardType="phone-pad"`. Freeform text — no E.164 normalization, no formatting library. | None. |
| BIRTHDAY | Tap opens **`WheelPicker`** (existing component from `src/components/onboarding/WheelPicker.tsx`) in a modal. Selected date renders as "May 14, 1992". | Min 1900-01-01, max today. |
| LOCATION | Plain TextInput. | None. |

**Edge cases:**
- Avatar `✎` pill tapped → **"Coming soon" toast** (image picker out of scope)
- Going back with unsaved changes → discard draft silently (no confirm — matches change-password.tsx pattern)
- Server error on save → field values preserved, error alert with retry

### 9.3 My Subscription — `my-subscription.tsx`

**Data:** `subscriptionStore` (mock today; RevenueCat-ready interface).

```ts
type SubscriptionState = {
  plan: string;             // "Yearly Plan"
  renewalDate: string;      // "May 14, 2026"
  price: string;            // "$39.99 / year"
  isActive: boolean;
  perks: string[];          // 4 strings
  manageBillingUrl?: string;
};
```

**Mock values today:** `plan: "Yearly Plan"`, `price: "$39.99 / year"`, `renewalDate: "May 14, 2026"`, `isActive: true`, `perks: ["Unlimited daily logs","AI weekly insights","Vet-ready PDF export","Up to 5 dogs"]`.

**Layout:** NavBar + green plan card + "what's included" label + 4 `<PerkRow>` + Manage Billing `<RowItem>` (white bg, CardGlyph) + Cancel Subscription text link.

**Behavior:**
- **Manage Billing:** `Linking.openURL('itms-apps://apps.apple.com/account/subscriptions')` (iOS) / `https://play.google.com/store/account/subscriptions` (Android)
- **Cancel Subscription:** "Coming soon" toast — flow not designed yet

**Inactive state (not in handoff, conservative implementation):** Same layout, badge → "inactive" (gray fill), "Renews ${date}" → "Expired ${date}". Manage Billing row stays so user can resubscribe.

### 9.4 Settings hub — `settings/index.tsx`

Pure navigation. NavBar + 5 `<RowItem>` rows: Notifications (BellGlyph) / Security (LockGlyph) / Help Center (HeartGlyph) / About PupLog (StickerIcon "P") / Privacy and Terms (StickerIcon "§"). Each row pushes to its sub-route.

### 9.5 Notifications — `settings/notifications.tsx`

**Data:** `notificationsStore` reads `user_preferences` (4 notify flags + 3 quiet-hours + timezone).

**Layout:** NavBar + 4 `<ToggleRow>` (Daily log reminder / Weekly insight ready / Vet appointments / Garden milestones) + Quiet Hours card (peach-soft, "10:00 PM → 7:00 AM" + Toggle).

**Behavior:** Each toggle persists immediately (optimistic). `notificationsStore.toggle(key)` updates local state synchronously, then fires `supabase.from('user_preferences').update({ [key]: newValue })` in background. On error → revert + toast.

**Quiet hours time text:** Not editable in this scope. Tapping shows "Coming soon" — time-range picker is out-of-scope.

**⚠️ Explicit non-functional note:** Toggles persist to `user_preferences` and read back on app open. **No notifications fire today** — actual scheduling (`expo-notifications` + APNs/FCM + quiet-hours timezone math) is a separate follow-up task. QA / beta testers should expect zero notifications regardless of toggle state until that work lands.

### 9.6 Security — `settings/security.tsx`

**Layout:**
- "Change Password" `<RowItem>` (LockGlyph) → `router.push('/change-password')` (existing screen)
- "Face ID" `<ToggleRow>` — sub: "Unlock with Face ID". Toggle ON requires `LocalAuthentication.authenticateAsync()` to succeed first; OFF is immediate. Persists to `user_preferences.face_id_enabled`. Disabled if `LocalAuthentication.hasHardwareAsync() === false`.
- "Two-factor auth" `<ToggleRow>` — toggling ON shows "Coming soon" + reverts (Supabase 2FA setup is its own flow)
- "Active Devices · 2" `<RowItem>` → "Coming soon" toast
- "Download My Data" `<RowItem>` → "Coming soon" toast

### 9.7 Help Center — `settings/help-center.tsx`

**Data:** Hardcoded `HELP_FAQS` in `src/constants/helpFaqs.ts`.

```ts
type HelpFaq = {
  id: string;
  title: string;
  destination:
    | { type: 'route';  href: string }
    | { type: 'sheet';  body: string }
    | { type: 'mailto'; subject: string };
};
export const HELP_FAQS: HelpFaq[] = [
  { id:'daily-logs', title:'How do daily logs work?', destination:{ type:'sheet', body:'…' } },
  { id:'share-vet',  title:'Sharing with my vet',     destination:{ type:'sheet', body:'…' } },
  { id:'add-dog',    title:'Adding a second dog',     destination:{ type:'route', href:'/add-dog' } },
  { id:'cancel-sub', title:'Cancel subscription',     destination:{ type:'route', href:'/profile/my-subscription' } },
];
```

**Layout:** NavBar + search bar + "popular" label + 4 `<RowItem>` rows + Contact card pinned bottom.

**Search:** Local state, `title.toLowerCase().includes(query.toLowerCase())`. Empty result → "No matches — try another term".

**Contact:** `Linking.openURL('mailto:support@puplog.app?subject=Help with PupLog')`. Email address from `src/constants/config.ts`.

### 9.8 About PupLog — `settings/about.tsx`

**Data:** `Constants.expoConfig?.version` (from `expo-constants`) and platform-specific build number.

**Layout:** NavBar + 72×72 peach app-icon tile (Caveat "P") + "PupLog" + "v ${version} · build ${build}" + italic mission card + 3 `<RowItem>` rows.

**Behavior:**
- **Rate PupLog** → `StoreReview.requestReview()` from `expo-store-review` (iOS); Android falls back to `Linking.openURL(playStoreUrl)`
- **Tell a friend** → `Share.share({ message: 'Check out PupLog — daily health tracking for your dog. <App Store URL>' })`. URL placeholder until App Store listing exists.
- **Follow us** → "Coming soon" toast until official social handle confirmed

### 9.9 Privacy and Terms — `settings/privacy.tsx`

**Data:** `notificationsStore` reads `user_preferences` (3 privacy flags).

**Layout:** NavBar + "documents" label + 3 `<RowItem>` (Privacy Policy / Terms of Service / Cookie Policy) + "your data" label + 3 `<ToggleRow>` (Anonymous analytics / Personalized tips / Marketing emails).

**Behavior:**
- **Privacy Policy** → "Coming soon" toast (pending attorney drafting per CLAUDE.md)
- **Terms of Service** → `router.push('/terms?mode=view')` — extends existing `/terms.tsx` with a query param that skips the scroll-to-unlock requirement and shows ToS as static read. Single prop branch, no new file.
- **Cookie Policy** → "Coming soon" toast (pending attorney drafting)
- **Toggles** persist immediately to `user_preferences` (same pattern as Notifications). `privacy_personalized_tips defaults false` per GDPR posture.

### 9.10 Log Out modal — `<LogOutModal>` rendered inside Profile root

**Trigger:** `setIsModalOpen(true)` on Profile root.

**Layout:** Backdrop dims root to opacity 0.4 + bottom-pinned card 90px above tab bar. Cream fill, 2.5px sketch border, 18 radius, 3px offset shadow. "Heading out?" Caveat 22 + body "We'll keep ${primaryDog?.name ?? "your dog's"} logs safe. You can come back any time." + two `<PillButton>` stacked: solid orange "Yes, log me out" + ghost cream "Stay".

**Animation:** Reanimated — backdrop fade in 200ms; card scale 0.92→1.0 + opacity fade 250ms. Reverse on dismiss.

**Behavior:**
- **Yes, log me out** → `signOut()` + clear all 12 stores + `router.replace('/(auth)/sign-in')`
- **Stay** → close modal
- **Backdrop tap / hardware back** → close modal
- **`signOut()` failure** → keep modal open + alert "Couldn't sign out — try again"

---

## 10. PR Sequence

| PR | Content |
|---|---|
| **1** | Foundations — theme extensions, all shared primitives in `src/components/profile/` (NavBar, RowItem, NavButton, WoodPortrait, Toggle, ToggleRow, InfoField, PillButton, SaveButton, LogOutModal, PerkRow, StickerIcon, glyphs), Profile route group `(tabs)/profile/` with empty Profile root, Settings tab pointed at the new route, **Profile tab inline-SVG fallback icon** in `FloatingTabBar`. Other 3 tabs unchanged at this PR. |
| **2** | My Information screen + `user_profiles` migration + avatar storage + `handle_new_user` trigger + backfill script + `profileStore` |
| **3** | My Subscription screen + extended `subscriptionStore` (RevenueCat-ready interface, mock data) |
| **4** | Settings hub + 5 sub-screens (Notifications, Security, Help Center, About, Privacy) + `user_preferences` migration + `notificationsStore` |
| **5** | Achievement sticker system — `user_achievements` migration + `ai_health_insights.reviewed_at` migration + Edge Function `check-achievements` + `userAchievementsStore` + `<StickerCollection>` + `<StickerCard>` + `<StickerDetailSheet>` + `<StickerEarnCelebration>` + earn-event hooks in `dogStore.addDog()` and `healthStore.markInsightReviewed()` |
| **6** | Polish — Log Out modal final wiring, Journey/My Dogs/Discovery label rename, Figma SVG tab icons rasterization pipeline + bundled PNGs, removal of `(tabs)/settings.tsx` file |

---

## 11. Tests

Approximate test counts (final number determined during implementation):

| Suite | Tests |
|---|---|
| `NavBar.test.tsx` | 4 (renders title; back chevron visibility; calls onBackPress) |
| `RowItem.test.tsx` | 6 (renders label/icon/chevron; press fires; accessibility) |
| `NavButton.test.tsx` | 3 (left-aligned label vs centered) |
| `WoodPortrait.test.tsx` | 5 (size variants; with/without avatar; tilt-marks) |
| `Toggle.test.tsx` | 6 (on/off render; state change; spring animation start; accessibility role=switch) |
| `ToggleRow.test.tsx` | 5 (label + sub render; toggle press; optimistic state update; revert on error) |
| `InfoField.test.tsx` | 8 (idle vs edit mode; focused state; all 5 icon variants; validation) |
| `PillButton.test.tsx` | 4 (variants; press translate; disabled state) |
| `SaveButton.test.tsx` | 4 (slab + face render; press translate; disabled state) |
| `LogOutModal.test.tsx` | 8 (renders; confirm calls signOut; cancel dismisses; backdrop tap; signOut failure path) |
| `profileStore.test.ts` | 10 (load from auth+profile; update draft; save split-on-whitespace; error revert) |
| `notificationsStore.test.ts` | 12 (fetch defaults; toggle each flag; revert on error; quiet-hours fields) |
| `userAchievementsStore.test.ts` | 8 (fetch; checkSeasonal idempotency; lastEarned tracking; defensive ON CONFLICT) |
| `subscriptionStore.test.ts` | 6 (mock data shape; isActive states; manage billing URL by platform) |
| `achievements.test.ts` | 12 (all STICKERS entries valid; rotation in [-7,7]; categories valid; STICKER_IDS_APP === STICKER_IDS_EDGE lint) |
| `StickerCard.test.tsx` | 6 (earned vs ghost; onPress fires with id; placeholder fallback when asset null) |
| `StickerCollection.test.tsx` | 8 (top-3 ranking; FLOWERS_ENABLED filter; sheet variant shows all 11; rotation deterministic) |
| `StickerDetailSheet.test.tsx` | 6 (earned shows date; ghost shows criteria; flower-gated shows "Coming with the flower system") |
| `StickerEarnCelebration.test.tsx` | 4 (mounts on lastEarned; dismisses; calls clearLastEarned on done) |
| `check-achievements.test.ts` (Deno) | 12 (each predicate function; idempotency; concurrency race; feature-flag gating; unknown event_type rejection) |
| Each of 10 screens | ~5 tests each (renders; nav buttons fire; data binding; out-of-scope toasts; back navigation) — ~50 tests total |

**Estimated new test count:** ~180 tests, ~22 new test suites. New project total: 459 tests across 44 suites.

---

## 12. Defaults / Detail Decisions Locked

The following defaults are locked unless explicitly overridden in implementation. These were ratified during brainstorming Section 8:

1. **Birthday picker** — reuses existing `WheelPicker` (matches onboarding aesthetic)
2. **Phone format** — freeform, no normalization
3. **Location** — freeform, no autocomplete
4. **NAME parsing** — split on first whitespace
5. **Profile root name** — `${first} ${last[0]}.` ; "PupLog User" fallback
6. **Subscription inactive state** — same layout, "active" badge → "inactive", "Renews" → "Expired"
7. **Terms of Service viewer** — `/terms?mode=view` query param branch
8. **Privacy Policy / Cookie Policy** — "Coming soon" toast
9. **Help Center FAQ taps** — three destination types: route / sheet (3-5 line answer) / mailto
10. **About — Follow us** — "Coming soon" toast until official handle confirmed
11. **App version** — from `expo-constants` at runtime
12. **Email field on My Information** — read-only, non-tappable
13. **Avatar wood-frame chrome** — wood frame always present; user photo replaces stripe placeholder when uploaded
14. **Tab bar layout** — floating pill, 16pt margin, safe-area aware
15. **FAB** — kept until Journey redesign delivers alternative check-in CTA (TODO comment in `FloatingTabBar`)

---

## 13. Out of Scope

The following are explicitly NOT in this work and require their own follow-up specs:

**Authentication / account:**
- Email change with verification flow
- 2FA enrollment + setup screens
- Active Devices listing
- Download My Data export
- Avatar image picker (`expo-image-picker` + crop UI)

**Subscription:**
- Cancel Subscription confirmation flow
- Real RevenueCat wiring (mock data ships now; real integration is a future PR)
- Receipt validation, refunds, plan switching

**Notifications:**
- Actual notification scheduling (`expo-notifications` permissions + local-notification scheduling + push setup)
- Quiet hours time-range picker UI
- Quiet-hours timezone-aware enforcement

**Per-dog stickers (My Dogs surface, not Profile):**
- `Recovery Rainbow`, `First Photo`, `Park Explorer`, `Tender Caretaker`
- Per-dog garden visualization
- Historical garden polaroid strip

**Documents:**
- Privacy Policy (needs attorney drafting)
- Cookie Policy (needs attorney drafting)
- Terms of Service v1.0 stays — viewer-mode is in scope; new content is not

**Tab content redesigns:**
- Journey tab content (only label/icon changes here)
- My Dogs tab content (only label/icon changes here)
- Discovery tab content (only label/icon changes here)

**FAB:**
- FAB removal (gated on Journey redesign)
- Per-tab FAB visibility rules

**Sharing / external:**
- "Tell a friend" share content (uses generic `Share.share()` until App Store URL is final)
- "Follow us" social link (pending official handle)
- Custom Android `Rate PupLog` flow

**Re-skinning existing screens:**
- `/change-password.tsx`, `/delete-account.tsx`, `/terms.tsx`, `/sign-in.tsx`, `/sign-up.tsx`, `/forgot-password.tsx`, `/add-dog`, `/edit-dog` — all keep current styling; re-skin is a separate task

**Backend:**
- Backfill of historical `ai_health_insights.reviewed_at` data — column nullable, existing rows stay null

**Internationalization:**
- All copy is English. No i18n setup. Copy strings live in `src/constants/profileCopy.ts` for future extraction.

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Migration applies before all users have a `user_profiles` row → race in app | Defensive `INSERT … ON CONFLICT DO NOTHING` from `profileStore` on first read; backfill script runs once after deploy |
| Sticker artwork PNGs not ready when system ships | Static `STICKER_ASSETS` map with `null` defaults + SVG placeholder fallback. Drop-in replacement when art lands. |
| Tab icon SVGs (810–1593 paths) bog down `react-native-svg` | Pre-rasterize to PNG @2x/@3x at build time |
| `STICKER_IDS` drift between app code and Edge Function | Lint test `achievements.test.ts` asserts equality between `STICKER_IDS_APP` and `STICKER_IDS_EDGE` |
| Notification toggles imply working notifications, but none fire | Explicit "non-functional" note in spec + visible TODO; coordinate with QA before beta tester rollout |
| FAB visual diff vs mockup until Journey redesign | TODO comment in `FloatingTabBar` documents the dependency; revisit when Journey lands |
| Existing `/terms` `?mode=view` query param breaks the auth-gate flow | Test both modes in `terms.test.tsx`; `mode=view` is opt-in, default behavior unchanged |
| Welcome trigger fires on every signup retry | `INSERT … ON CONFLICT DO NOTHING` in `handle_new_user()` makes it idempotent |

---

## 15. Open Questions for Implementation

To be resolved during PR work, not blockers for spec approval:

1. **Profile tab Figma icon** — when delivered, replace inline SVG fallback with rasterized PNGs (drop-in)
2. **PupLog social handle** — when confirmed, replace "Follow us" toast with `Linking.openURL`
3. **App Store URL** — when published, update "Tell a friend" share message + Android Rate fallback URL
4. **Animation timing for `<StickerEarnCelebration>`** — visual-test on device; locked spec is "1000ms / 1.02× overshoot" but the exact `Easing.back` parameters need eyeball confirmation
5. **Mock subscription values** — placeholder used in PR 3; real values come from RevenueCat in a future PR

---

**End of design spec.**
