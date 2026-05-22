# Pattern E — PR 1 (Foundation + Trophy Detail View) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the foundations for the Pattern E trophy detail redesign. After this PR, tapping any sticker (on the profile row or in the grid) opens the new full-screen Pressed Flower Specimen trophy view with watercolor ribbon stamp, idle motion, light-wash sweep, and washi tape accent. Locked stickers in the grid display the actual watercolor artwork desaturated/sepia (NOT "?" placeholders). State + DB infrastructure exists for the 3-slot featured array but does NOT drive user-visible customize behavior yet — the profile row still uses the legacy `topThreeForRow()` fallback. The ribbon stamp on the trophy view is non-interactive (visual-only); PR 2 wires the tap handlers.

**Architecture:** PR 1 adds (a) a new `user_profiles.featured_stickers JSONB` column with hydrate-on-load via `profileStore`, (b) a `featuredIds` slot state with 4 actions (`setFeatured/unsetFeatured/swapFeatured/hydrateFeatured`) in `userAchievementsStore` plus optimistic Supabase persistence, (c) 3 new components — `LightWashOverlay`, `RibbonStamp` (visual states only), and `TrophyDetailView` (the full-screen Pressed Flower Specimen overlay), (d) a sepia-treatment update to `StickerCard`, and (e) the integration point in `app/(tabs)/profile/index.tsx` where the Modal's detail mode now renders `TrophyDetailView` instead of `StickerDetailContent`. Each component has TDD-style tests before implementation. The unused `StickerDetailSheet.tsx` is deleted as cleanup.

**Tech Stack:** React Native (Expo SDK 54), TypeScript strict, Expo Router v6, Zustand v5, react-native-reanimated v4, react-native-svg, expo-haptics, expo-linear-gradient, Jest 29 + React Native Testing Library, Supabase JS v2.

**Out of scope for PR 1 (deferred):**
- All customize flows: empty "+" slot mount, picker mode, ribbon tap handlers, swap panel — see `docs/superpowers/plans/2026-05-22-pattern-e-pr2-editing.md` (drafted after PR 1 lands).
- Backend Edge Function mirror — see `2026-05-22-pattern-e-pr3-backend.md`.
- Browse grid ribbon corner stamps + adaptive picker copy (PR 2).
- "Coming soon" treatment for null seasonal stickers (PR 2).
- Auto-fill on first 3 earns (logic added in PR 1 store as pure function, wired in PR 2).
- `topThreeForRow()` deprecation (PR 2 switches profile row to read `featuredIds`).

---

## Settled spec reference

This plan implements **HANDOFF.md §4.4** (Trophy detail view spec), **§4.5** (ribbon stamp visual states only — no tap), **§4.9** (locked sticker visual treatment), **§4.11** (subset of copy keys), **§4.12** (state matrix — internal data shape only), **§4.13** (animation library decisions), **§5.2/5.3/5.4/5.5/5.7** (subset relevant to PR 1).

Decisions in **HANDOFF.md §6** are locked. Do not re-litigate.

---

## File structure

| Path | Action | Responsibility |
|---|---|---|
| `supabase/migrations/2026-05-22-add-featured-stickers.sql` | Create | DB migration: `user_profiles.featured_stickers JSONB DEFAULT '[null, null, null]'::jsonb` |
| `src/constants/achievements.ts` | Modify | Add `ribbonTilt: number` to `StickerDef`; populate per-sticker (deterministic 8°–16° values) |
| `src/constants/profileCopy.ts` | Modify | Add 13 new copy keys (subset of HANDOFF §4.11 used by PR 1) |
| `src/stores/userAchievementsStore.ts` | Modify | Add `featuredIds: FeaturedSlots` state + `setFeatured/unsetFeatured/swapFeatured/hydrateFeatured/computeAutoFill` actions; clear on `clearAchievements` |
| `src/stores/profileStore.ts` | Modify | Add `featured_stickers` to loaded shape; hydrate via `useUserAchievementsStore.getState().hydrateFeatured()` after load |
| `src/stores/__tests__/userAchievementsStore.test.ts` | Modify | Add 8 tests for featuredIds actions + persistence + auto-fill pure function |
| `src/stores/__tests__/profileStore.test.ts` | Modify | Add 1 test: hydrateFeatured called with DB value on load |
| `src/components/profile/stickers/LightWashOverlay.tsx` | Create | 6s sweep gradient overlay using `expo-linear-gradient` + Reanimated. Respects reduced motion. |
| `src/components/profile/stickers/RibbonStamp.tsx` | Create | Watercolor ★ stamp with 3 visual states (`featured` / `unfeatured` / `locked`). `locked` renders null. Sizes: `large` (58×58 for trophy view) and `small` (24×24 for future grid corner stamps). Accepts `onPress` prop but PR 1 callers don't wire it. |
| `src/components/profile/stickers/TrophyDetailView.tsx` | Create | Full-screen overlay implementing HANDOFF §4.4: backdrop, sticker w/ idle motion, washi tape, title + watercolor underline draw, description (= unlockCriteria), flavor (= description), earned date / "Not yet bloomed", ribbon stamp, dismiss handler. Replaces `StickerDetailContent` consumption point. |
| `src/components/profile/stickers/StickerCard.tsx` | Modify | Locked + asset case: replace `opacity: 0.4` with `opacity: 0.5 + cream-tinted overlay View` (sepia approximation — Hazard 8.25). Locked + no asset (placeholder) unchanged. |
| `src/components/profile/stickers/__tests__/LightWashOverlay.test.tsx` | Create | 2 tests |
| `src/components/profile/stickers/__tests__/RibbonStamp.test.tsx` | Create | 5 tests |
| `src/components/profile/stickers/__tests__/TrophyDetailView.test.tsx` | Create | 7 tests |
| `src/components/profile/stickers/__tests__/StickerCard.test.tsx` | Modify | Update locked-state expectation: opacity 0.5 + sepia overlay (was 0.4) |
| `app/(tabs)/profile/index.tsx` | Modify | Modal detail mode renders `TrophyDetailView` (not `StickerDetailContent`). Pass `earnedAt`, `featured` (computed from `featuredIds`), `onDismiss`. Strip unused `StickerDetailContent` import. |
| `src/components/profile/stickers/StickerDetailSheet.tsx` | Delete | Already unused by production code (only test imports it). |
| `src/components/profile/stickers/__tests__/StickerDetailSheet.test.tsx` | Delete | Tests the deleted file. |
| `src/components/profile/stickers/StickerDetailContent.tsx` | Delete | Replaced by `TrophyDetailView`. After integration step, no callers remain. |

**Test count target:** baseline 470/49 → 470 + 22 new − 4 deleted = **488 tests / 51 suites** after PR 1.

---

## Pre-flight checks (do these first, before any task)

- [ ] **0.1** Verify worktree state matches handoff baseline:
  ```bash
  cd /Users/rohitsandur/Documents/Projects/dog_app_ui/.worktrees/profile-pr1
  git status                                                    # only HANDOFF.md untracked
  git rev-parse HEAD                                            # should be 844d6dc or newer
  ls -la .env                                                   # MUST be a symlink to project-root .env
  npm test --silent 2>&1 | grep -E "Tests:|Test Suites:" | tail -2  # 470 passed, 49 suites
  ```
- [ ] **0.2** Create the PR 1 branch off the current worktree HEAD:
  ```bash
  cd /Users/rohitsandur/Documents/Projects/dog_app_ui/.worktrees/profile-pr1
  git checkout -b feat/trophy-pattern-e-pr1-foundation
  ```
- [ ] **0.3** Skim `HANDOFF.md` §4.4 + §4.5 + §4.9 + §4.13 in the worktree root — these are the design sections this PR implements.
- [ ] **0.4** Open `preview-trophy-flow-pattern-e-empty-slots.html` in browser. Click the demo buttons "Brand-new user" / "Only 1 earned" / "Pre-fill 3 featured". Click stickers to open the trophy view. Inspect the CSS — every animation timing/color/easing in PR 1 components is grounded in this mockup.
- [ ] **0.5** Invoke skills before each domain (these will be used at the right tasks):
  - `supabase-postgres-best-practices` before Task 1 (DB migration)
  - `react-native-architecture` before Tasks 9–12 (new components)
  - `accessibility-compliance` before Task 11 (TrophyDetailView — has multiple interactive elements + accessibility roles)
  - `react-native-best-practices` before Task 9 (animations — performance considerations)

---

## Task 1: DB migration — add `user_profiles.featured_stickers` column

**Files:**
- Create: `supabase/migrations/2026-05-22-add-featured-stickers.sql`
- Use: `mcp__ab556fec-1fd4-4c63-be5d-67fe43831fce__apply_migration` MCP tool

**Why a real migration file?** The repo doesn't currently have a `supabase/migrations/` directory — migrations have historically been applied via Supabase Studio. Going forward, we want migrations in version control. This is the first.

- [ ] **1.1** Create the migrations directory:
  ```bash
  mkdir -p supabase/migrations
  ```

- [ ] **1.2** Create `supabase/migrations/2026-05-22-add-featured-stickers.sql`:
  ```sql
  -- Pattern E: add featured_stickers JSONB array to user_profiles.
  -- Each user has a 3-slot featured array, populated by client (PR 1)
  -- and mirrored by Edge Function on first 3 earns (PR 3).
  -- Length must be 3. Each element is a sticker_id string or null.

  ALTER TABLE public.user_profiles
    ADD COLUMN IF NOT EXISTS featured_stickers JSONB DEFAULT '[null, null, null]'::jsonb;

  -- Length sanity (advisory — JSONB lets you violate this, so client enforces too).
  ALTER TABLE public.user_profiles
    DROP CONSTRAINT IF EXISTS user_profiles_featured_stickers_length_check;
  ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_featured_stickers_length_check
    CHECK (jsonb_typeof(featured_stickers) = 'array' AND jsonb_array_length(featured_stickers) = 3);

  COMMENT ON COLUMN public.user_profiles.featured_stickers IS
    'Pattern E (2026-05-22): 3-slot array of sticker_id strings or nulls. Length 3 enforced by CHECK constraint. Source of truth for the user-chosen 3 featured stickers shown on the profile row.';
  ```

- [ ] **1.3** Apply the migration via MCP tool. Use `mcp__ab556fec...__apply_migration` with:
  - `name`: `pattern_e_add_featured_stickers`
  - `query`: the contents of `supabase/migrations/2026-05-22-add-featured-stickers.sql`

  Expected response: success.

- [ ] **1.4** Verify the column exists. Run `mcp__ab556fec...__list_tables` with `schemas: ['public']` and inspect the `user_profiles` table's columns — `featured_stickers` should be there with default `'[null, null, null]'::jsonb`.

- [ ] **1.5** Verify existing rows backfilled to default:
  ```sql
  SELECT user_id, featured_stickers FROM user_profiles LIMIT 5;
  ```
  Run via `mcp__ab556fec...__execute_sql`. Every row should show `[null, null, null]`.

- [ ] **1.6** RLS check — confirm the existing `user_profiles` UPDATE policy permits users to update their own row (the existing PR #5 / PR #6 policy should cover this; verify no new policy needed):
  ```sql
  SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'user_profiles';
  ```
  Expected: an UPDATE policy with `auth.uid() = user_id`.

- [ ] **1.7** Commit:
  ```bash
  git add supabase/migrations/2026-05-22-add-featured-stickers.sql
  git commit -m "$(cat <<'EOF'
  feat(db): add user_profiles.featured_stickers JSONB column

  Pattern E foundation. 3-slot array of sticker_id strings or nulls,
  default [null, null, null], length enforced by CHECK constraint.

  Source of truth for the user-chosen 3 featured stickers shown on
  the profile row (PR 2 wires consumption; PR 3 mirrors on backend).

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 2: Add `ribbonTilt` to `StickerDef` and populate per-sticker

**Files:**
- Modify: `src/constants/achievements.ts`

**Design intent (HANDOFF §4.5):** Each sticker's ribbon stamp gets a per-sticker rotation in the 8°–16° range (range absolute, sign varies). Hand-placed feel. Deterministic per sticker so the stamp doesn't jitter between renders.

- [ ] **2.1** Open `src/constants/achievements.ts`. Locate `StickerDef` type (currently ends at the `enabledWhen?` field).

- [ ] **2.2** Add `ribbonTilt: number; // -16..-8 or 8..16, deterministic per id` to the type after `rotation`. The type now looks like:
  ```typescript
  export type StickerDef = {
    id: StickerId;
    title: string;
    description: string;
    unlockCriteria: string;
    category: StickerCategory;
    heroWeight: number;
    rotation: number;
    ribbonTilt: number;        // NEW: -16..-8 or 8..16 deg, hand-placed feel
    enabledWhen?: 'always' | 'flowers_shipped';
  };
  ```

- [ ] **2.3** Populate `ribbonTilt` for each of the 12 stickers. Suggested values (alternating signs, full 8–16 range usage):

  | Sticker | rotation | ribbonTilt |
  |---|---|---|
  | `welcome` | -3 | +12 |
  | `seasonal_fall` | +5 | -10 |
  | `seasonal_winter` | -5 | +14 |
  | `seasonal_spring` | +3 | -8 |
  | `seasonal_summer` | -7 | +9 |
  | `pattern_spotter` | +7 | -13 |
  | `tender_caretaker` | -2 | +16 |
  | `first_peony` | -3 | -11 |
  | `bouquet_of_joy` | +5 | +8 |
  | `multi_pup_parent` | -5 | -15 |
  | `full_spectrum` | +3 | +10 |
  | `bloom_master` | 0 | -14 |

  Add the `ribbonTilt:` line to each entry in `STICKERS`.

- [ ] **2.4** Run typecheck — expect 30 errors (baseline, unchanged):
  ```bash
  npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l
  ```
  Expected output: `0` (zero NEW errors).

- [ ] **2.5** Run achievements test to confirm no regression:
  ```bash
  npx jest src/constants/__tests__/achievements.test.ts --silent 2>&1 | tail -5
  ```
  Expected: all tests pass (if the test file exists; if not, that's fine — it'll be created in Task 3).

- [ ] **2.6** Commit:
  ```bash
  git add src/constants/achievements.ts
  git commit -m "$(cat <<'EOF'
  feat(achievements): add ribbonTilt field to StickerDef

  Per-sticker rotation in -16..-8 or +8..+16 range for the watercolor
  ribbon stamp (HANDOFF §4.5). Deterministic per id; hand-placed feel.
  Used by RibbonStamp component on trophy view (PR 1) and grid corner
  stamps (PR 2).

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 3: Add new copy keys to `profileCopy.ts`

**Files:**
- Modify: `src/constants/profileCopy.ts`

**Subset for PR 1** (full set in HANDOFF §4.11; remaining keys land in PR 2):

| Key | Value |
|---|---|
| `STICKER_NOT_YET_BLOOMED` | `Not yet bloomed` |
| `STICKER_EARNED_BLOOM_PREFIX` | `Bloomed · ` |
| `STICKER_RIBBON_FEATURED` | `Featured` |
| `STICKER_RIBBON_TAP_TO_FEATURE` | `Tap to feat` |
| `STICKER_DETAIL_DISMISS_HINT` | `Tap anywhere to close` |

- [ ] **3.1** Open `src/constants/profileCopy.ts`. Locate the existing sticker section (search for `STICKER_CATEGORY_MILESTONE`).

- [ ] **3.2** Add the 5 new keys above to the COPY object, alphabetically sorted within the sticker block:
  ```typescript
  STICKER_DETAIL_DISMISS_HINT: 'Tap anywhere to close',
  STICKER_EARNED_BLOOM_PREFIX: 'Bloomed · ',  // · = middle dot character; ASCII-safe
  STICKER_NOT_YET_BLOOMED: 'Not yet bloomed',
  STICKER_RIBBON_FEATURED: 'Featured',
  STICKER_RIBBON_TAP_TO_FEATURE: 'Tap to feat',
  ```
  ⚠️ **ASCII rule:** the middle dot character (`·`) is a non-ASCII Unicode codepoint. Use `·` escape sequence to avoid encoding issues (CLAUDE.md "Common Pitfalls").

- [ ] **3.3** Run typecheck — expect 30 errors baseline:
  ```bash
  npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l
  ```
  Expected: `0` new.

- [ ] **3.4** Commit:
  ```bash
  git add src/constants/profileCopy.ts
  git commit -m "$(cat <<'EOF'
  feat(copy): add 5 sticker copy keys for trophy detail (PR 1)

  Pattern E PR 1 subset (HANDOFF §4.11). Remaining keys land in PR 2
  (picker headers, swap panel, empty-slot caption, toasts).

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 4: `userAchievementsStore` — add `featuredIds` state + initial value

**Files:**
- Modify: `src/stores/userAchievementsStore.ts`
- Modify: `src/stores/__tests__/userAchievementsStore.test.ts`

- [ ] **4.1** Write failing test. Open `src/stores/__tests__/userAchievementsStore.test.ts`. Append after the last existing test:

  ```typescript
  // ─── Featured slots (Pattern E PR 1) ───────────────────────────────────────

  it('20. initial featuredIds is [null, null, null]', () => {
    const state = useUserAchievementsStore.getState();
    expect(state.featuredIds).toEqual([null, null, null]);
  });
  ```

  Update the `beforeEach` initialState object to include `featuredIds: [null, null, null]`:
  ```typescript
  const initialState = {
    earnedIds: new Set(),
    earnedRecords: [],
    isLoading: false,
    error: null,
    lastEarned: null,
    seasonalCheckedThisSession: false,
    featuredIds: [null, null, null],
  };
  ```

- [ ] **4.2** Run the test — expect FAIL with `Property 'featuredIds' does not exist on type 'UserAchievementsState'`:
  ```bash
  npx jest src/stores/__tests__/userAchievementsStore.test.ts -t "initial featuredIds" --silent 2>&1 | tail -10
  ```

- [ ] **4.3** Open `src/stores/userAchievementsStore.ts`. Add the `FeaturedSlots` type at the top, after the existing `EarnedRecord` type:
  ```typescript
  export type FeaturedSlots = [StickerId | null, StickerId | null, StickerId | null];
  ```

  Add `featuredIds: FeaturedSlots;` to the `UserAchievementsState` interface (after `seasonalCheckedThisSession`).

  Add to `INITIAL_STATE`:
  ```typescript
  const INITIAL_STATE = {
    earnedIds: new Set<StickerId>(),
    earnedRecords: [] as EarnedRecord[],
    isLoading: false,
    error: null,
    lastEarned: null,
    seasonalCheckedThisSession: false,
    featuredIds: [null, null, null] as FeaturedSlots,
  };
  ```

  Update `clearAchievements`:
  ```typescript
  clearAchievements: () => {
    set({
      earnedIds: new Set<StickerId>(),
      earnedRecords: [],
      isLoading: false,
      error: null,
      lastEarned: null,
      seasonalCheckedThisSession: false,
      featuredIds: [null, null, null],
    });
  },
  ```

- [ ] **4.4** Re-run the test — expect PASS:
  ```bash
  npx jest src/stores/__tests__/userAchievementsStore.test.ts -t "initial featuredIds" --silent 2>&1 | tail -5
  ```

- [ ] **4.5** Run the full userAchievementsStore test suite — expect all existing + new tests pass:
  ```bash
  npx jest src/stores/__tests__/userAchievementsStore.test.ts --silent 2>&1 | tail -5
  ```

- [ ] **4.6** Commit:
  ```bash
  git add src/stores/userAchievementsStore.ts src/stores/__tests__/userAchievementsStore.test.ts
  git commit -m "$(cat <<'EOF'
  feat(achievements/store): add featuredIds slot state

  Pattern E PR 1 foundation. featuredIds: FeaturedSlots holds the
  user's 3 chosen featured stickers (or null per slot). Initialized
  to [null, null, null]; cleared on sign-out via clearAchievements.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 5: `userAchievementsStore` — `setFeatured(slot, id)` action with persistence

**Files:**
- Modify: `src/stores/userAchievementsStore.ts`
- Modify: `src/stores/__tests__/userAchievementsStore.test.ts`

- [ ] **5.1** Write failing test. Append to `userAchievementsStore.test.ts`:

  ```typescript
  it('21. setFeatured fills the specified slot and persists to Supabase', async () => {
    mockAuthUser();

    const updateMock = jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) }));
    mockSupabase.from = jest.fn(() => ({ update: updateMock }));

    await useUserAchievementsStore.getState().setFeatured(0, 'welcome');

    const state = useUserAchievementsStore.getState();
    expect(state.featuredIds).toEqual(['welcome', null, null]);
    expect(mockSupabase.from).toHaveBeenCalledWith('user_profiles');
    expect(updateMock).toHaveBeenCalledWith({ featured_stickers: ['welcome', null, null] });
  });

  it('22. setFeatured replaces existing value in the slot', async () => {
    mockAuthUser();
    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
    }));

    useUserAchievementsStore.setState({ featuredIds: ['welcome', null, null] });

    await useUserAchievementsStore.getState().setFeatured(0, 'multi_pup_parent');

    expect(useUserAchievementsStore.getState().featuredIds).toEqual(['multi_pup_parent', null, null]);
  });
  ```

- [ ] **5.2** Run — expect FAIL with `state.setFeatured is not a function`:
  ```bash
  npx jest src/stores/__tests__/userAchievementsStore.test.ts -t "setFeatured" --silent 2>&1 | tail -10
  ```

- [ ] **5.3** Implement in `userAchievementsStore.ts`. Add to the interface:
  ```typescript
  /**
   * Pattern E PR 1: fills the specified slot (0|1|2) with stickerId, then
   * persists the new featuredIds array to user_profiles.featured_stickers.
   * Optimistic: updates local state immediately, fire-and-forget DB write.
   */
  setFeatured: (slotIndex: 0 | 1 | 2, stickerId: StickerId) => Promise<void>;
  ```

  Add the action implementation (inside `create<UserAchievementsState>((set, get) => ({ ... }))`):
  ```typescript
  setFeatured: async (slotIndex, stickerId) => {
    const { featuredIds } = get();
    const next: FeaturedSlots = [...featuredIds] as FeaturedSlots;
    next[slotIndex] = stickerId;
    set({ featuredIds: next });

    // Persist to DB (optimistic — DB error doesn't roll back local state)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('user_profiles')
        .update({ featured_stickers: next })
        .eq('user_id', user.id);
    } catch {
      // Silent — local state is source of truth in PR 1; PR 3 adds reconciliation
    }
  },
  ```

- [ ] **5.4** Re-run — expect PASS:
  ```bash
  npx jest src/stores/__tests__/userAchievementsStore.test.ts -t "setFeatured" --silent 2>&1 | tail -5
  ```

- [ ] **5.5** Commit:
  ```bash
  git add src/stores/userAchievementsStore.ts src/stores/__tests__/userAchievementsStore.test.ts
  git commit -m "feat(achievements/store): add setFeatured action with optimistic Supabase persistence

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
  ```

---

## Task 6: `userAchievementsStore` — `unsetFeatured(id)` action

**Files:**
- Modify: `src/stores/userAchievementsStore.ts`
- Modify: `src/stores/__tests__/userAchievementsStore.test.ts`

- [ ] **6.1** Write failing test:
  ```typescript
  it('23. unsetFeatured nulls out the slot containing the given id and persists', async () => {
    mockAuthUser();
    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
    }));

    useUserAchievementsStore.setState({ featuredIds: ['welcome', 'multi_pup_parent', null] });

    await useUserAchievementsStore.getState().unsetFeatured('welcome');

    expect(useUserAchievementsStore.getState().featuredIds).toEqual([null, 'multi_pup_parent', null]);
  });

  it('24. unsetFeatured for id not in any slot is a no-op', async () => {
    mockAuthUser();
    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
    }));

    useUserAchievementsStore.setState({ featuredIds: ['welcome', null, null] });

    await useUserAchievementsStore.getState().unsetFeatured('multi_pup_parent');

    expect(useUserAchievementsStore.getState().featuredIds).toEqual(['welcome', null, null]);
  });
  ```

- [ ] **6.2** Run — expect FAIL.

- [ ] **6.3** Implement. Add to interface:
  ```typescript
  unsetFeatured: (stickerId: StickerId) => Promise<void>;
  ```

  Add action:
  ```typescript
  unsetFeatured: async (stickerId) => {
    const { featuredIds } = get();
    const slotIdx = featuredIds.indexOf(stickerId);
    if (slotIdx === -1) return;  // no-op

    const next: FeaturedSlots = [...featuredIds] as FeaturedSlots;
    next[slotIdx] = null;
    set({ featuredIds: next });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('user_profiles')
        .update({ featured_stickers: next })
        .eq('user_id', user.id);
    } catch {
      // Silent
    }
  },
  ```

- [ ] **6.4** Re-run — expect PASS.

- [ ] **6.5** Commit:
  ```bash
  git add src/stores/userAchievementsStore.ts src/stores/__tests__/userAchievementsStore.test.ts
  git commit -m "feat(achievements/store): add unsetFeatured action

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
  ```

---

## Task 7: `userAchievementsStore` — `swapFeatured(oldId, newId)` action

**Files:**
- Modify: `src/stores/userAchievementsStore.ts`
- Modify: `src/stores/__tests__/userAchievementsStore.test.ts`

- [ ] **7.1** Write failing test:
  ```typescript
  it('25. swapFeatured removes oldId and inserts newId in its slot', async () => {
    mockAuthUser();
    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ error: null })) })),
    }));

    useUserAchievementsStore.setState({
      featuredIds: ['welcome', 'multi_pup_parent', 'pattern_spotter'],
    });

    await useUserAchievementsStore.getState().swapFeatured('multi_pup_parent', 'tender_caretaker');

    expect(useUserAchievementsStore.getState().featuredIds).toEqual([
      'welcome',
      'tender_caretaker',
      'pattern_spotter',
    ]);
  });
  ```

- [ ] **7.2** Run — expect FAIL.

- [ ] **7.3** Implement. Add to interface:
  ```typescript
  swapFeatured: (oldStickerId: StickerId, newStickerId: StickerId) => Promise<void>;
  ```

  Add action:
  ```typescript
  swapFeatured: async (oldId, newId) => {
    const { featuredIds } = get();
    const slotIdx = featuredIds.indexOf(oldId);
    if (slotIdx === -1) return;  // no-op if old not present

    const next: FeaturedSlots = [...featuredIds] as FeaturedSlots;
    next[slotIdx] = newId;
    set({ featuredIds: next });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('user_profiles')
        .update({ featured_stickers: next })
        .eq('user_id', user.id);
    } catch {
      // Silent
    }
  },
  ```

- [ ] **7.4** Re-run — expect PASS.

- [ ] **7.5** Commit:
  ```bash
  git add src/stores/userAchievementsStore.ts src/stores/__tests__/userAchievementsStore.test.ts
  git commit -m "feat(achievements/store): add swapFeatured action

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
  ```

---

## Task 8: `userAchievementsStore` — `hydrateFeatured(ids)` + `computeAutoFill()` pure function

**Files:**
- Modify: `src/stores/userAchievementsStore.ts`
- Modify: `src/stores/__tests__/userAchievementsStore.test.ts`

- [ ] **8.1** Write failing tests:
  ```typescript
  it('26. hydrateFeatured replaces local state without DB write', () => {
    useUserAchievementsStore.setState({ featuredIds: [null, null, null] });

    useUserAchievementsStore.getState().hydrateFeatured(['welcome', 'multi_pup_parent', null]);

    expect(useUserAchievementsStore.getState().featuredIds).toEqual([
      'welcome',
      'multi_pup_parent',
      null,
    ]);
  });

  it('27. hydrateFeatured falls back to [null, null, null] when given null', () => {
    useUserAchievementsStore.getState().hydrateFeatured(null);
    expect(useUserAchievementsStore.getState().featuredIds).toEqual([null, null, null]);
  });

  it('28. computeAutoFill fills empty slots when totalEarned <= 3', () => {
    const result = useUserAchievementsStore.getState().computeAutoFill(
      [null, null, null],
      ['welcome'],
    );
    expect(result).toEqual(['welcome', null, null]);
  });

  it('29. computeAutoFill skips already-featured ids', () => {
    const result = useUserAchievementsStore.getState().computeAutoFill(
      ['welcome', null, null],
      ['welcome', 'multi_pup_parent'],
    );
    expect(result).toEqual(['welcome', 'multi_pup_parent', null]);
  });

  it('30. computeAutoFill no-ops when totalEarned > 3 (manual swap required)', () => {
    const result = useUserAchievementsStore.getState().computeAutoFill(
      ['welcome', 'multi_pup_parent', 'pattern_spotter'],
      ['welcome', 'multi_pup_parent', 'pattern_spotter', 'tender_caretaker'],
    );
    expect(result).toEqual(['welcome', 'multi_pup_parent', 'pattern_spotter']);
  });

  it('31. clearAchievements resets featuredIds to [null, null, null]', () => {
    useUserAchievementsStore.setState({ featuredIds: ['welcome', null, null] });
    useUserAchievementsStore.getState().clearAchievements();
    expect(useUserAchievementsStore.getState().featuredIds).toEqual([null, null, null]);
  });
  ```

- [ ] **8.2** Run — expect FAIL on tests 26-30.

- [ ] **8.3** Implement. Add to interface:
  ```typescript
  /**
   * Pattern E PR 1: replaces featuredIds with the array loaded from DB
   * (called by profileStore.loadFromAuthAndProfile after a successful fetch).
   * Defensive: null or wrong-length input falls back to [null, null, null].
   */
  hydrateFeatured: (ids: FeaturedSlots | null) => void;

  /**
   * Pattern E PR 1: pure function. Returns the new featuredIds after auto-filling
   * empty slots from the earnedIds list. Only fires when totalEarned <= 3 —
   * once user has 4+ earns, new earns require manual swap via the picker (PR 2).
   * Called by PR 2's wired earn flow; included in PR 1 as a tested primitive.
   */
  computeAutoFill: (currentFeatured: FeaturedSlots, earnedIds: StickerId[]) => FeaturedSlots;
  ```

  Add implementations:
  ```typescript
  hydrateFeatured: (ids) => {
    if (!Array.isArray(ids) || ids.length !== 3) {
      set({ featuredIds: [null, null, null] });
      return;
    }
    set({ featuredIds: ids as FeaturedSlots });
  },

  computeAutoFill: (currentFeatured, earnedIds) => {
    // Only auto-fill while user has 3 or fewer total earns
    if (earnedIds.length > 3) return currentFeatured;

    const next: FeaturedSlots = [...currentFeatured] as FeaturedSlots;
    const alreadyFeatured = new Set(next.filter((id): id is StickerId => id !== null));

    for (const earnId of earnedIds) {
      if (alreadyFeatured.has(earnId)) continue;
      const emptyIdx = next.indexOf(null);
      if (emptyIdx === -1) break;
      next[emptyIdx] = earnId;
      alreadyFeatured.add(earnId);
    }
    return next;
  },
  ```

  Note: `computeAutoFill` is a pure function but lives on the store for convenient access. It does NOT call `set()` — caller decides whether to apply the result.

- [ ] **8.4** Re-run — expect all 6 new tests pass.

- [ ] **8.5** Run the full userAchievementsStore suite — expect all tests pass:
  ```bash
  npx jest src/stores/__tests__/userAchievementsStore.test.ts --silent 2>&1 | tail -5
  ```

- [ ] **8.6** Commit:
  ```bash
  git add src/stores/userAchievementsStore.ts src/stores/__tests__/userAchievementsStore.test.ts
  git commit -m "$(cat <<'EOF'
  feat(achievements/store): add hydrateFeatured + computeAutoFill pure fn

  hydrateFeatured loads server value into local state without DB write
  (called by profileStore after fetch). computeAutoFill is a tested
  primitive returning the new slots after auto-filling from earnedIds;
  caller decides whether to apply. PR 2 wires it into the earn flow.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 9: `profileStore` — hydrate `featuredIds` on load

**Files:**
- Modify: `src/stores/profileStore.ts`
- Modify: `src/stores/__tests__/profileStore.test.ts`

- [ ] **9.1** Read existing `profileStore.test.ts` to understand mock pattern (`Read` tool). Existing tests likely mock `supabase.from('user_profiles').select().eq().maybeSingle()`. Identify the test that exercises `loadFromAuthAndProfile`'s success path.

- [ ] **9.2** Write failing test. Append to `profileStore.test.ts`:
  ```typescript
  it('hydrates userAchievementsStore.featuredIds from user_profiles.featured_stickers', async () => {
    mockAuthUser();
    mockSupabase.from = jest.fn(() => ({
      upsert: jest.fn(() => Promise.resolve({ error: null })),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(() =>
        Promise.resolve({
          data: {
            user_id: 'user-abc',
            phone: null,
            birthday: null,
            location: null,
            avatar_url: null,
            featured_stickers: ['welcome', 'multi_pup_parent', null],
          },
          error: null,
        }),
      ),
    }));

    // Spy on hydrateFeatured before the call
    const hydrateSpy = jest.spyOn(useUserAchievementsStore.getState(), 'hydrateFeatured');

    await useProfileStore.getState().loadFromAuthAndProfile();

    expect(hydrateSpy).toHaveBeenCalledWith(['welcome', 'multi_pup_parent', null]);

    hydrateSpy.mockRestore();
  });
  ```

  Add the import at the top:
  ```typescript
  import { useUserAchievementsStore } from '../userAchievementsStore';
  ```

- [ ] **9.3** Run — expect FAIL (hydrateFeatured not called).

- [ ] **9.4** Modify `profileStore.ts`:
  - Add `featured_stickers: FeaturedSlots | null` to the private `UserProfileRow` interface.
  - Update `fetchProfileRow` to include `featured_stickers` in select if SELECT is using explicit columns (it currently uses `*`, so this is already included).
  - At the end of `loadFromAuthAndProfile`'s try block, after `set({ loaded, draft, ... })`, add:
    ```typescript
    // Pattern E PR 1: hydrate featured slots into achievements store
    useUserAchievementsStore.getState().hydrateFeatured(
      (profileRow?.featured_stickers as FeaturedSlots | null) ?? null,
    );
    ```
  - Add the import at top:
    ```typescript
    import { useUserAchievementsStore, FeaturedSlots } from './userAchievementsStore';
    ```

- [ ] **9.5** Re-run — expect PASS.

- [ ] **9.6** Run the full profileStore suite to confirm no regressions:
  ```bash
  npx jest src/stores/__tests__/profileStore.test.ts --silent 2>&1 | tail -5
  ```

- [ ] **9.7** Commit:
  ```bash
  git add src/stores/profileStore.ts src/stores/__tests__/profileStore.test.ts
  git commit -m "$(cat <<'EOF'
  feat(profile/store): hydrate featuredIds from user_profiles.featured_stickers

  Cross-store wire-up: after profile load, calls
  useUserAchievementsStore.hydrateFeatured() with the server value.
  Defensive — null or malformed value falls back to [null, null, null]
  inside hydrateFeatured.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 10: New component — `LightWashOverlay.tsx`

**Files:**
- Create: `src/components/profile/stickers/LightWashOverlay.tsx`
- Create: `src/components/profile/stickers/__tests__/LightWashOverlay.test.tsx`

**Design intent (HANDOFF §4.4):** A radial gradient that sweeps across the trophy sticker every 6 seconds, suggesting wet pigment. Opacity peaks in the middle of the sweep (0 → 0.85 → 0). Respects reduced motion (renders null in that case).

- [ ] **10.1** Write failing test:
  ```typescript
  // src/components/profile/stickers/__tests__/LightWashOverlay.test.tsx
  import { render } from '@testing-library/react-native';
  import { LightWashOverlay } from '../LightWashOverlay';

  // Mock useReducedMotion since we exercise both code paths
  jest.mock('react-native-reanimated', () => {
    const actual = jest.requireActual('react-native-reanimated/mock');
    return {
      ...actual,
      useReducedMotion: jest.fn(() => false),
    };
  });

  describe('LightWashOverlay', () => {
    it('renders the overlay View when reduced motion is off', () => {
      const { getByTestId } = render(<LightWashOverlay />);
      expect(getByTestId('light-wash-overlay')).toBeTruthy();
    });

    it('renders null when reduced motion is on', () => {
      const Reanimated = require('react-native-reanimated');
      Reanimated.useReducedMotion.mockReturnValueOnce(true);
      const { queryByTestId } = render(<LightWashOverlay />);
      expect(queryByTestId('light-wash-overlay')).toBeNull();
    });
  });
  ```

- [ ] **10.2** Run — expect FAIL (`Cannot find module '../LightWashOverlay'`).

- [ ] **10.3** Implement `LightWashOverlay.tsx`:
  ```typescript
  import React, { useEffect } from 'react';
  import { StyleSheet } from 'react-native';
  import { LinearGradient } from 'expo-linear-gradient';
  import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
  } from 'react-native-reanimated';

  const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

  /**
   * 6-second radial-ish light-wash sweep used on the trophy detail sticker.
   * Sweeps left→right with an opacity peak in the middle (0 → 0.85 → 0).
   * Respects reduced motion: returns null in that case (no animation, no
   * static overlay — the sticker speaks for itself).
   *
   * Design ref: HANDOFF.md §4.4 (Trophy detail view → Light-wash sweep).
   */
  export function LightWashOverlay() {
    const reducedMotion = useReducedMotion();
    const progress = useSharedValue(0);  // 0..1

    useEffect(() => {
      if (reducedMotion) return;
      progress.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 800 }),  // initial delay
          withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }, [reducedMotion, progress]);

    const animatedStyle = useAnimatedStyle(() => {
      // translateX: -130% → +130%
      const tx = -1.3 + progress.value * 2.6;
      // opacity peaks at 0.5 progress
      const opacity = progress.value < 0.5
        ? progress.value * 2 * 0.85
        : (1 - progress.value) * 2 * 0.85;
      return {
        transform: [{ translateX: `${tx * 100}%` }],
        opacity,
      };
    });

    if (reducedMotion) return null;

    return (
      <AnimatedGradient
        testID="light-wash-overlay"
        pointerEvents="none"
        colors={['rgba(255,240,200,0)', 'rgba(255,240,200,0.55)', 'rgba(255,240,200,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.overlay, animatedStyle]}
      />
    );
  }

  const styles = StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: '-8%',
      left: '-8%',
      right: '-8%',
      bottom: '-8%',
    },
  });
  ```

- [ ] **10.4** Re-run — expect PASS:
  ```bash
  npx jest src/components/profile/stickers/__tests__/LightWashOverlay.test.tsx --silent 2>&1 | tail -5
  ```

- [ ] **10.5** Commit:
  ```bash
  git add src/components/profile/stickers/LightWashOverlay.tsx src/components/profile/stickers/__tests__/LightWashOverlay.test.tsx
  git commit -m "$(cat <<'EOF'
  feat(stickers): add LightWashOverlay component (Pattern E PR 1)

  6s sweep gradient using expo-linear-gradient + react-native-reanimated.
  Opacity peaks at 0.85 in the middle of each sweep cycle. Respects
  useReducedMotion (returns null). Used on TrophyDetailView sticker
  artwork to suggest wet pigment.

  HANDOFF §4.4 / §4.13.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 11: New component — `RibbonStamp.tsx` (visual states only)

**Files:**
- Create: `src/components/profile/stickers/RibbonStamp.tsx`
- Create: `src/components/profile/stickers/__tests__/RibbonStamp.test.tsx`

**Design intent (HANDOFF §4.5):** Circular watercolor badge with ★ + tiny label. 3 states:
- `featured` — orange filled, white "Featured" label.
- `unfeatured` — cream-tinted, dashed outline, "Tap to feat" label.
- `locked` — renders null (`display: none`).

PR 1 wires no onPress (visual demonstration only). The `onPress` prop is accepted for forward-compat with PR 2.

Sizes: `large` (58×58, for trophy view) and `small` (24×24, for grid corner stamps — used by PR 2).

- [ ] **11.1** Write failing test:
  ```typescript
  // src/components/profile/stickers/__tests__/RibbonStamp.test.tsx
  import { fireEvent, render } from '@testing-library/react-native';
  import { RibbonStamp } from '../RibbonStamp';

  describe('RibbonStamp', () => {
    it('renders Featured label in featured state', () => {
      const { getByText } = render(<RibbonStamp state="featured" tilt={12} />);
      expect(getByText('Featured')).toBeTruthy();
    });

    it('renders Tap to feat label in unfeatured state', () => {
      const { getByText } = render(<RibbonStamp state="unfeatured" tilt={-10} />);
      expect(getByText('Tap to feat')).toBeTruthy();
    });

    it('renders null in locked state', () => {
      const { queryByTestId } = render(<RibbonStamp state="locked" tilt={8} />);
      expect(queryByTestId('ribbon-stamp')).toBeNull();
    });

    it('fires onPress when pressed (forward-compat with PR 2)', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <RibbonStamp state="featured" tilt={12} onPress={onPress} />,
      );
      fireEvent.press(getByTestId('ribbon-stamp'));
      expect(onPress).toHaveBeenCalled();
    });

    it('applies correct accessibilityLabel per state', () => {
      const { getByTestId, rerender } = render(
        <RibbonStamp state="featured" tilt={12} />,
      );
      expect(getByTestId('ribbon-stamp').props.accessibilityLabel).toBe('Featured. Tap to unpin.');

      rerender(<RibbonStamp state="unfeatured" tilt={12} />);
      expect(getByTestId('ribbon-stamp').props.accessibilityLabel).toBe('Tap to feature this sticker.');
    });
  });
  ```

- [ ] **11.2** Run — expect FAIL.

- [ ] **11.3** Implement `RibbonStamp.tsx`:
  ```typescript
  import React from 'react';
  import { Pressable, StyleSheet, Text, View } from 'react-native';
  import { OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
  import { COPY } from '../../../constants/profileCopy';

  export type RibbonState = 'featured' | 'unfeatured' | 'locked';
  export type RibbonSize = 'large' | 'small';

  export type RibbonStampProps = {
    state: RibbonState;
    tilt: number;             // -16..-8 or 8..16 deg, from StickerDef.ribbonTilt
    size?: RibbonSize;        // default 'large' (58×58); 'small' = 24×24 for grid corner
    onPress?: () => void;     // PR 1 callers don't wire; PR 2 wires
  };

  const SIZES: Record<RibbonSize, number> = { large: 58, small: 24 };
  const STAR_SIZES: Record<RibbonSize, number> = { large: 22, small: 11 };
  const LABEL_SIZES: Record<RibbonSize, number> = { large: 9, small: 0 };  // hide label on small

  export function RibbonStamp({ state, tilt, size = 'large', onPress }: RibbonStampProps) {
    if (state === 'locked') return null;

    const dim = SIZES[size];
    const isFeatured = state === 'featured';
    const label = isFeatured
      ? COPY.STICKER_RIBBON_FEATURED
      : COPY.STICKER_RIBBON_TAP_TO_FEATURE;
    const a11y = isFeatured
      ? 'Featured. Tap to unpin.'
      : 'Tap to feature this sticker.';

    return (
      <Pressable
        testID="ribbon-stamp"
        accessibilityRole="button"
        accessibilityLabel={a11y}
        onPress={onPress}
        hitSlop={6}
        style={[
          styles.outer,
          {
            width: dim,
            height: dim,
            borderRadius: dim / 2,
            backgroundColor: isFeatured ? OB_COLORS.peach : OB_COLORS.cream,
            borderWidth: isFeatured ? 0 : 2,
            borderStyle: isFeatured ? 'solid' : 'dashed',
            borderColor: OB_COLORS.sketch,
            transform: [{ rotate: `${tilt}deg` }],
          },
        ]}
      >
        <View style={styles.inner}>
          <Text
            style={[
              styles.star,
              {
                fontSize: STAR_SIZES[size],
                color: isFeatured ? OB_COLORS.cream : OB_COLORS.sketch,
                opacity: isFeatured ? 1 : 0.6,
              },
            ]}
          >
            *
          </Text>
          {LABEL_SIZES[size] > 0 ? (
            <Text
              style={[
                styles.label,
                {
                  fontSize: LABEL_SIZES[size],
                  color: isFeatured ? OB_COLORS.cream : OB_COLORS.sketch,
                  opacity: isFeatured ? 1 : 0.7,
                },
              ]}
            >
              {label}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  }

  const styles = StyleSheet.create({
    outer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    inner: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    star: {
      fontFamily: OB_FONTS.h1,
      fontWeight: '700',
      lineHeight: undefined,
    },
    label: {
      fontFamily: OB_FONTS.caption,
      marginTop: -2,
    },
  });
  ```

  > **Note on the ★ character:** RN doesn't reliably render the unicode ★ across all platforms. We use ASCII `*` here as a placeholder. Better: replace with a small SVG star asset in a follow-up if visual fidelity is insufficient. Document as a follow-up hazard.

- [ ] **11.4** Re-run — expect PASS.

- [ ] **11.5** Commit:
  ```bash
  git add src/components/profile/stickers/RibbonStamp.tsx src/components/profile/stickers/__tests__/RibbonStamp.test.tsx
  git commit -m "$(cat <<'EOF'
  feat(stickers): add RibbonStamp component, visual states only (Pattern E PR 1)

  Watercolor ribbon stamp for trophy/grid usage. 3 visual states:
  - featured: orange filled, white 'Featured' label
  - unfeatured: cream tinted dashed border, 'Tap to feat' label
  - locked: renders null (no affordance for unearned stickers)

  Accepts onPress for forward-compat; PR 2 wires the tap handlers.
  Sizes: large (58, trophy view) and small (24, grid corner stamp).

  HANDOFF §4.5.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 12: New component — `TrophyDetailView.tsx`

**Files:**
- Create: `src/components/profile/stickers/TrophyDetailView.tsx`
- Create: `src/components/profile/stickers/__tests__/TrophyDetailView.test.tsx`

**Design intent (HANDOFF §4.4):** Full-screen warm cream overlay. Centered sticker with idle motion, light-wash sweep, washi tape accent. Caveat title with watercolor underline. Description = unlockCriteria (Nunito, concrete). Flavor = description (Caveat italic, curly quotes). Earned date stamp at bottom OR "Not yet bloomed" for locked. Ribbon stamp in upper-right (non-interactive in PR 1). Backdrop tap dismisses.

- [ ] **12.1** Invoke `accessibility-compliance` skill before writing tests — this component has multiple interactive elements + a dismiss target.

- [ ] **12.2** Write failing tests. Create `__tests__/TrophyDetailView.test.tsx`:
  ```typescript
  import { fireEvent, render } from '@testing-library/react-native';
  import { TrophyDetailView } from '../TrophyDetailView';
  import { STICKERS } from '../../../../constants/achievements';
  import { COPY } from '../../../../constants/profileCopy';

  const baseProps = {
    sticker: STICKERS.welcome,
    earned: true,
    featured: true,
    earnedAt: '2026-05-09T12:00:00Z',
    onDismiss: jest.fn(),
  };

  describe('TrophyDetailView', () => {
    beforeEach(() => {
      (baseProps.onDismiss as jest.Mock).mockClear();
    });

    it('renders title, unlockCriteria, description for earned + featured sticker', () => {
      const { getByText } = render(<TrophyDetailView {...baseProps} />);
      expect(getByText(STICKERS.welcome.title)).toBeTruthy();
      expect(getByText(STICKERS.welcome.unlockCriteria)).toBeTruthy();
      // Flavor uses curly-quoted description
      expect(getByText(new RegExp(STICKERS.welcome.description))).toBeTruthy();
    });

    it('shows "Bloomed · <date>" stamp for earned sticker', () => {
      const { getByText } = render(<TrophyDetailView {...baseProps} />);
      // "Bloomed · May 9, 2026"
      expect(getByText(/Bloomed.*May 9, 2026/)).toBeTruthy();
    });

    it('shows "Not yet bloomed" for locked sticker', () => {
      const { getByText, queryByText } = render(
        <TrophyDetailView
          {...baseProps}
          earned={false}
          featured={false}
          earnedAt={null}
        />,
      );
      expect(getByText(COPY.STICKER_NOT_YET_BLOOMED)).toBeTruthy();
      expect(queryByText(/Bloomed/)).toBeNull();
    });

    it('renders ribbon stamp in featured state when earned + featured', () => {
      const { getByText } = render(<TrophyDetailView {...baseProps} />);
      expect(getByText(COPY.STICKER_RIBBON_FEATURED)).toBeTruthy();
    });

    it('renders ribbon stamp in unfeatured state when earned + not featured', () => {
      const { getByText } = render(
        <TrophyDetailView {...baseProps} featured={false} />,
      );
      expect(getByText(COPY.STICKER_RIBBON_TAP_TO_FEATURE)).toBeTruthy();
    });

    it('does NOT render ribbon stamp for locked sticker', () => {
      const { queryByTestId } = render(
        <TrophyDetailView
          {...baseProps}
          earned={false}
          featured={false}
          earnedAt={null}
        />,
      );
      expect(queryByTestId('ribbon-stamp')).toBeNull();
    });

    it('calls onDismiss when backdrop is pressed', () => {
      const { getByTestId } = render(<TrophyDetailView {...baseProps} />);
      fireEvent.press(getByTestId('trophy-backdrop'));
      expect(baseProps.onDismiss).toHaveBeenCalled();
    });
  });
  ```

- [ ] **12.3** Run — expect FAIL.

- [ ] **12.4** Implement `TrophyDetailView.tsx`. **This is the largest file in PR 1; copy the full implementation below.**

  ```typescript
  import React, { useEffect } from 'react';
  import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
  import * as Haptics from 'expo-haptics';
  import Animated, {
    Easing,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
  } from 'react-native-reanimated';
  import { StickerDef } from '../../../constants/achievements';
  import { OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
  import { COPY } from '../../../constants/profileCopy';
  import { STICKER_ASSETS } from './assets';
  import { LightWashOverlay } from './LightWashOverlay';
  import { RibbonStamp } from './RibbonStamp';

  export type TrophyDetailViewProps = {
    sticker: StickerDef;
    earned: boolean;
    featured: boolean;
    earnedAt: string | null;       // ISO string or null
    onDismiss: () => void;
    onRibbonPress?: () => void;    // PR 1 callers don't pass; PR 2 wires
  };

  function formatBloomedDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Pattern E PR 1 — Trophy detail view (Pressed Flower Specimen).
   * Full-screen overlay rendered INSIDE the existing single Modal in
   * app/(tabs)/profile/index.tsx. NEVER nested in its own Modal
   * (iOS one-Modal limit, Hazard 8.3).
   *
   * Animations:
   * - Entrance: 480ms fade in
   * - Sticker idle motion: 3s breath (translateY ±2, scale 0.99↔1.02)
   * - Light-wash sweep: 6s gradient pan (own component)
   * - All respect useReducedMotion via Reanimated.
   *
   * Haptics: light impact on entrance landing (once per open).
   *
   * Design ref: HANDOFF.md §4.4.
   */
  export function TrophyDetailView({
    sticker,
    earned,
    featured,
    earnedAt,
    onDismiss,
    onRibbonPress,
  }: TrophyDetailViewProps) {
    const reducedMotion = useReducedMotion();
    const fade = useSharedValue(0);
    const idle = useSharedValue(0);  // 0..1 oscillation

    useEffect(() => {
      // Entrance fade
      fade.value = withTiming(1, {
        duration: reducedMotion ? 0 : 480,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });

      // Haptic on landing (only if motion enabled)
      if (!reducedMotion) {
        const t = setTimeout(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 480);
        // Idle motion starts after entrance
        idle.value = withRepeat(
          withSequence(
            withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          false,
        );
        return () => clearTimeout(t);
      }
    }, [reducedMotion, fade, idle]);

    const backdropStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

    const stickerStyle = useAnimatedStyle(() => {
      const ty = -2 + idle.value * 4;       // -2..+2
      const scale = 0.99 + idle.value * 0.03; // 0.99..1.02
      return {
        transform: [
          { translateY: ty },
          { scale },
          { rotate: `${sticker.rotation}deg` },
        ],
      };
    });

    const asset = STICKER_ASSETS[sticker.id];
    const ribbonState: 'featured' | 'unfeatured' | 'locked' = !earned
      ? 'locked'
      : featured ? 'featured' : 'unfeatured';

    const stampText = earned && earnedAt
      ? COPY.STICKER_EARNED_BLOOM_PREFIX + formatBloomedDate(earnedAt)
      : COPY.STICKER_NOT_YET_BLOOMED;

    return (
      <Animated.View style={[styles.root, backdropStyle]}>
        {/* Backdrop tap target — separate Pressable so children don't block dismiss */}
        <Pressable
          testID="trophy-backdrop"
          accessibilityRole="button"
          accessibilityLabel="Close trophy detail"
          onPress={onDismiss}
          style={StyleSheet.absoluteFill}
        />

        {/* Sticker artwork wrapper (above backdrop, doesn't dismiss on tap) */}
        <View style={styles.stickerWrap} pointerEvents="box-none">
          {/* Washi tape accent */}
          <View style={styles.washi} />

          {/* The sticker itself + animation */}
          <Animated.View style={[styles.stickerInner, stickerStyle]} pointerEvents="box-none">
            {asset !== null ? (
              <View>
                <Image source={asset} style={styles.stickerImg} resizeMode="contain" />
                <LightWashOverlay />
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderChar}>{sticker.title.charAt(0)}</Text>
              </View>
            )}
          </Animated.View>

          {/* Ribbon stamp — non-interactive in PR 1 (onRibbonPress undefined) */}
          <View style={styles.ribbonAnchor} pointerEvents="box-none">
            <RibbonStamp
              state={ribbonState}
              tilt={sticker.ribbonTilt}
              size="large"
              onPress={onRibbonPress}
            />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>{sticker.title}</Text>

        {/* Watercolor underline (static — animated draw deferred to polish pass) */}
        <View style={styles.underline} />

        {/* Description (= unlockCriteria, the concrete primary read) */}
        <Text style={styles.description}>{sticker.unlockCriteria}</Text>

        {/* Flavor (= description, the poetic secondary line) */}
        <Text style={styles.flavor}>{'“' + sticker.description + '”'}</Text>

        {/* Earned date stamp (or "Not yet bloomed" for locked) */}
        <View style={styles.stamp}>
          <Text style={styles.stampText}>{stampText}</Text>
        </View>

        {/* Dismiss hint */}
        <Text style={styles.dismissHint}>{COPY.STICKER_DETAIL_DISMISS_HINT}</Text>
      </Animated.View>
    );
  }

  const STICKER_DIM = 215;
  const PLACEHOLDER_RADIUS = 32;

  const styles = StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(250, 246, 238, 0.97)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    stickerWrap: {
      width: STICKER_DIM,
      height: STICKER_DIM,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
    },
    stickerInner: {
      width: STICKER_DIM,
      height: STICKER_DIM,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stickerImg: {
      width: STICKER_DIM,
      height: STICKER_DIM,
    },
    placeholder: {
      width: STICKER_DIM,
      height: STICKER_DIM,
      borderRadius: PLACEHOLDER_RADIUS,
      backgroundColor: OB_COLORS.peach,
      alignItems: 'center',
      justifyContent: 'center',
    },
    placeholderChar: {
      fontFamily: OB_FONTS.h1,
      fontSize: 80,
      color: OB_COLORS.woodDk,
    },
    washi: {
      position: 'absolute',
      top: -2,
      left: -8,
      width: 50,
      height: 14,
      backgroundColor: 'rgba(255, 230, 170, 0.78)',
      transform: [{ rotate: '-22deg' }],
      zIndex: 1,
    },
    ribbonAnchor: {
      position: 'absolute',
      top: 4,
      right: -10,
      zIndex: 2,
    },
    title: {
      fontFamily: OB_FONTS.h1,
      fontSize: 40,
      color: OB_COLORS.woodDk,
      transform: [{ rotate: '-1deg' }],
      textAlign: 'center',
    },
    underline: {
      width: 86,
      height: 5,
      borderRadius: 3,
      backgroundColor: OB_COLORS.peach,
      opacity: 0.8,
      marginTop: 8,
      marginBottom: 16,
    },
    description: {
      fontFamily: OB_FONTS.body,
      fontSize: 15,
      fontWeight: '500',
      color: OB_COLORS.woodDk,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 21,
    },
    flavor: {
      fontFamily: OB_FONTS.h1,
      fontStyle: 'italic',
      fontSize: 18,
      color: OB_COLORS.sketch,
      opacity: 0.85,
      transform: [{ rotate: '-0.8deg' }],
      marginTop: 16,
      textAlign: 'center',
    },
    stamp: {
      position: 'absolute',
      bottom: 88,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor: OB_COLORS.sketch,
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 4,
      transform: [{ rotate: '2deg' }],
    },
    stampText: {
      fontFamily: OB_FONTS.caption,
      fontSize: 14,
      color: OB_COLORS.sketch,
    },
    dismissHint: {
      position: 'absolute',
      bottom: 36,
      fontFamily: OB_FONTS.body,
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      color: OB_COLORS.sketch,
      opacity: 0.5,
    },
  });
  ```

- [ ] **12.5** Re-run tests — expect PASS:
  ```bash
  npx jest src/components/profile/stickers/__tests__/TrophyDetailView.test.tsx --silent 2>&1 | tail -10
  ```

- [ ] **12.6** Commit:
  ```bash
  git add src/components/profile/stickers/TrophyDetailView.tsx src/components/profile/stickers/__tests__/TrophyDetailView.test.tsx
  git commit -m "$(cat <<'EOF'
  feat(stickers): add TrophyDetailView component (Pattern E PR 1)

  Full-screen Pressed Flower Specimen overlay replacing StickerDetailContent.
  Includes: warm cream backdrop, centered sticker with breath idle motion,
  light-wash sweep (LightWashOverlay), washi tape accent, Caveat title with
  watercolor underline, description (= unlockCriteria), flavor (= description),
  dashed-border earned date stamp ('Bloomed · <date>' or 'Not yet bloomed'),
  ribbon stamp in upper-right (non-interactive in PR 1), backdrop tap dismiss.

  Respects useReducedMotion. Fires Haptics.Light on entrance landing.

  HANDOFF §4.4 / §4.5 / §4.9 (locked variant) / §4.13.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 13: `StickerCard` — sepia treatment for locked stickers with assets

**Files:**
- Modify: `src/components/profile/stickers/StickerCard.tsx`
- Modify: `src/components/profile/stickers/__tests__/StickerCard.test.tsx`

**Design intent (HANDOFF §4.9, Hazard 8.25):** Replace the current `opacity: 0.4` on locked sticker images with a richer sepia approximation: `opacity: 0.5` on the Image + a cream-tinted overlay View on top. RN doesn't support CSS `filter: sepia()`, so this is the pragmatic approximation.

- [ ] **13.1** Read the current StickerCard test to understand the existing locked-state expectation. Identify the assertion about `opacity: 0.4`.

- [ ] **13.2** Update the test:
  - Change the locked-with-asset case to expect `opacity: 0.5` on the Image.
  - Add a new assertion: a sibling overlay View with `testID="locked-overlay"` exists when locked + asset.
  - Locked WITHOUT asset (placeholder) unchanged.
  - Earned case unchanged.

  Example update (adapt to existing test structure):
  ```typescript
  it('renders locked sticker with sepia overlay (asset case)', () => {
    const { getByTestId, UNSAFE_getByType } = render(
      <StickerCard sticker={STICKERS.welcome} earned={false} />,
    );
    const img = UNSAFE_getByType(Image);
    expect(img.props.style.opacity).toBe(0.5);
    expect(getByTestId('locked-overlay')).toBeTruthy();
  });
  ```

- [ ] **13.3** Run — expect FAIL.

- [ ] **13.4** Modify `StickerCard.tsx`. Locate the `asset !== null` branch:
  - Change `opacity: earned ? 1 : 0.4` to `opacity: earned ? 1 : 0.5`.
  - Wrap the Image in a fragment with a sibling overlay View when `!earned`:
    ```typescript
    {asset !== null ? (
      <View style={{ width: size, height: size }}>
        <Image
          source={asset}
          style={{
            width: size,
            height: size,
            opacity: earned ? 1 : 0.5,
            transform: [{ scale: STICKER_VISUAL_SCALE }],
          }}
          resizeMode="contain"
        />
        {!earned && (
          <View
            testID="locked-overlay"
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(246, 240, 230, 0.35)' },
            ]}
          />
        )}
      </View>
    ) : earned ? (
      // ... existing earned placeholder unchanged
    ```
  - Import `StyleSheet` if not already.

- [ ] **13.5** Re-run StickerCard tests — expect all pass:
  ```bash
  npx jest src/components/profile/stickers/__tests__/StickerCard.test.tsx --silent 2>&1 | tail -10
  ```

- [ ] **13.6** Commit:
  ```bash
  git add src/components/profile/stickers/StickerCard.tsx src/components/profile/stickers/__tests__/StickerCard.test.tsx
  git commit -m "$(cat <<'EOF'
  feat(stickers): sepia overlay for locked sticker cards (Pattern E PR 1)

  Replaces opacity 0.4 with opacity 0.5 + cream-tinted overlay View
  (rgba(246,240,230,0.35)) on top of the watercolor image. Approximates
  the sepia/desaturated look from HANDOFF §4.9 since RN doesn't support
  CSS filter:sepia(). Locked placeholder (no asset) unchanged.

  Hazard 8.25 — visual fidelity to be evaluated on device; consider
  pre-rendered desaturated PNGs OR Skia ColorMatrix in a follow-up
  if the approximation is insufficient.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 14: Wire `TrophyDetailView` into `app/(tabs)/profile/index.tsx`

**Files:**
- Modify: `app/(tabs)/profile/index.tsx`

- [ ] **14.1** Read `app/(tabs)/profile/index.tsx`. Locate the Modal's detail mode branch (where `selectedStickerId !== null` currently renders `<StickerDetailContent ... />`).

- [ ] **14.2** Identify how `earnedAt` is currently looked up — likely `earnedRecords.find(r => r.id === selectedStickerId)?.earned_at ?? null`.

- [ ] **14.3** Add a computed `featured` boolean from the store:
  ```typescript
  const featuredIds = useUserAchievementsStore(s => s.featuredIds);
  const isFeatured = selectedStickerId !== null && featuredIds.includes(selectedStickerId);
  ```

- [ ] **14.4** Replace the `<StickerDetailContent ... />` render with:
  ```typescript
  <TrophyDetailView
    sticker={STICKERS[selectedStickerId]}
    earned={earnedIds.has(selectedStickerId)}
    featured={isFeatured}
    earnedAt={earnedAt}
    onDismiss={handleDetailClose}
  />
  ```

- [ ] **14.5** Update the import line — replace `import { StickerDetailContent }` with `import { TrophyDetailView } from '../../../src/components/profile/stickers/TrophyDetailView'`. Verify the path matches your actual project structure.

- [ ] **14.6** Remove any wrapping styles around `<StickerDetailContent>` (the bottom-sheet container) — TrophyDetailView fills the screen on its own.

- [ ] **14.7** Run the full test suite to confirm no regressions:
  ```bash
  npm test --silent 2>&1 | tail -10
  ```
  Expected: 470 baseline + 22 new + 0 broken = ~492 (will adjust after StickerDetailSheet delete in Task 15).

- [ ] **14.8** Typecheck:
  ```bash
  npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l
  ```
  Expected: `0` new errors.

- [ ] **14.9** Manual device test (the cheapest visual smoke test):
  ```bash
  npx expo start
  ```
  - Open the app on simulator.
  - Sign in.
  - Navigate to Profile tab.
  - Tap a sticker in the row → expect new TrophyDetailView (cream backdrop, big sticker, idle motion, ribbon stamp upper-right, "Bloomed · ..." stamp at bottom).
  - Tap a locked sticker in the grid → expect sepia treatment + ribbon hidden + "Not yet bloomed".
  - Tap backdrop → dismisses.
  - **If anything looks broken visually, fix before committing.**

- [ ] **14.10** Commit:
  ```bash
  git add "app/(tabs)/profile/index.tsx"
  git commit -m "$(cat <<'EOF'
  feat(profile): swap StickerDetailContent → TrophyDetailView (Pattern E PR 1)

  The Modal's detail-mode branch now renders the new Pressed Flower
  Specimen overlay. featuredIds is read from useUserAchievementsStore
  and passed as the boolean 'featured' prop (drives ribbon stamp state).
  StickerDetailContent is no longer used; file deletion in next commit.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 15: Delete `StickerDetailSheet.tsx` + `StickerDetailContent.tsx` + their tests

**Files:**
- Delete: `src/components/profile/stickers/StickerDetailSheet.tsx`
- Delete: `src/components/profile/stickers/__tests__/StickerDetailSheet.test.tsx`
- Delete: `src/components/profile/stickers/StickerDetailContent.tsx` (no callers after Task 14)

- [ ] **15.1** Confirm zero callers via grep:
  ```bash
  grep -rn "StickerDetailContent\|StickerDetailSheet" --include="*.ts" --include="*.tsx" | grep -v "node_modules"
  ```
  Expected output: only matches in the files-to-delete themselves. If any other file imports them, STOP and update that file first.

- [ ] **15.2** Delete the 3 files:
  ```bash
  rm src/components/profile/stickers/StickerDetailSheet.tsx
  rm src/components/profile/stickers/__tests__/StickerDetailSheet.test.tsx
  rm src/components/profile/stickers/StickerDetailContent.tsx
  ```

- [ ] **15.3** Re-run the test suite — expect ~488 passing (470 baseline + 22 new − 4 StickerDetailSheet tests deleted):
  ```bash
  npm test --silent 2>&1 | grep -E "Tests:|Test Suites:" | tail -2
  ```

- [ ] **15.4** Typecheck — expect 0 new errors:
  ```bash
  npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l
  ```

- [ ] **15.5** Commit:
  ```bash
  git add -A
  git commit -m "$(cat <<'EOF'
  chore(stickers): delete StickerDetailSheet + StickerDetailContent (Pattern E PR 1)

  StickerDetailSheet was already unused by production code (only its
  own test file imported it). StickerDetailContent had its last caller
  swapped to TrophyDetailView in the previous commit. Removing both
  to keep the surface area tight.

  Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

## Task 16: Final verification + open PR

- [ ] **16.1** Final test run:
  ```bash
  npm test --silent 2>&1 | grep -E "Tests:|Test Suites:" | tail -2
  ```
  Expected: ~488 tests, ~51 suites, all passing.

- [ ] **16.2** Final typecheck:
  ```bash
  npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l
  ```
  Expected: `0` (zero new errors above the 30 baseline).

- [ ] **16.3** Visual smoke test on device — re-walk Task 14.9. Confirm:
  - Trophy view renders on tap.
  - Locked stickers show sepia treatment.
  - Ribbon stamp shows correct state per featured/unfeatured/locked.
  - Backdrop tap dismisses.
  - No console errors / warnings.

- [ ] **16.4** Stage + commit any incidental polish (if needed). Do NOT amend prior commits.

- [ ] **16.5** Push the branch:
  ```bash
  git push -u origin feat/trophy-pattern-e-pr1-foundation
  ```

- [ ] **16.6** Open PR via `gh`:
  ```bash
  gh pr create --title "feat(profile): Pattern E PR 1 — foundation + trophy detail view" --body "$(cat <<'EOF'
  ## Summary

  Pattern E PR 1 of 3 — see [master plan](docs/superpowers/plans/2026-05-22-pattern-e-master.md).

  Adds the **visual foundation** for the Pattern E trophy detail redesign:

  - **New DB column** `user_profiles.featured_stickers` (JSONB, default `[null, null, null]`, length 3 CHECK constraint)
  - **Store state** `featuredIds: FeaturedSlots` on `userAchievementsStore` with 4 actions (`setFeatured / unsetFeatured / swapFeatured / hydrateFeatured`) + `computeAutoFill` pure function. Persistence via optimistic write to `user_profiles`.
  - **3 new components**: `LightWashOverlay`, `RibbonStamp` (visual states only, non-interactive in PR 1), `TrophyDetailView` (Pressed Flower Specimen overlay).
  - **Locked sticker treatment**: `StickerCard` now shows opacity 0.5 + cream-tinted overlay (sepia approximation per Hazard 8.25).
  - **Integration**: `app/(tabs)/profile/index.tsx` Modal detail mode renders `TrophyDetailView` instead of the legacy `StickerDetailContent`.
  - **Cleanup**: deleted unused `StickerDetailSheet.tsx`, `StickerDetailContent.tsx`, and their tests.

  ## What's still legacy in PR 1

  - Profile row still uses `topThreeForRow()` — no empty "+" slots yet, no read of `featuredIds`. PR 2 swaps this.
  - Ribbon stamp is visible but non-interactive (no `onPress` wired). PR 2 wires.
  - 3 seasonal sticker PNGs still null. PR 2 adds "coming soon" treatment.
  - Backend Edge Function still missing `tender_caretaker` mirror + auto-fill. PR 3 handles.

  ## Tests

  - 18 new tests across 3 new component suites (`LightWashOverlay`, `RibbonStamp`, `TrophyDetailView`).
  - 8 new tests in `userAchievementsStore.test.ts` for featured slot actions + auto-fill.
  - 1 new test in `profileStore.test.ts` for cross-store hydration.
  - Updated `StickerCard.test.tsx` locked-state assertion.
  - Removed 4 tests from deleted `StickerDetailSheet.test.tsx`.
  - **Total: 470 → ~488. 49 → 51 suites. All passing.**

  ## Test plan

  - [ ] `npm test` — expect ~488 passing, 51 suites
  - [ ] `npx tsc --noEmit` — expect 30 baseline errors, 0 new
  - [ ] On-device smoke test:
    - Tap an earned sticker on profile row → new trophy view renders, ribbon shows "Featured" or "Tap to feat"
    - Tap a locked sticker in the grid → sepia treatment, ribbon hidden, "Not yet bloomed" stamp
    - Tap backdrop → dismisses
    - Reduced motion enabled → no animation, sticker statically centered
  - [ ] Verify DB column applied: `SELECT featured_stickers FROM user_profiles LIMIT 5;`

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

- [ ] **16.7** Return the PR URL to the user. **Do NOT merge without explicit user greenlight.**

---

## Self-review checklist

After completing all 16 tasks, run this checklist before declaring the PR ready:

**1. Spec coverage:**
- [ ] §4.4 Trophy detail view: backdrop ✓, sticker w/ idle motion ✓, light-wash ✓, washi tape ✓, title ✓, underline ✓, description (= unlockCriteria) ✓, flavor (= description with curly quotes) ✓, earned date stamp ✓, dismiss hint ✓, reduced motion ✓, haptics ✓.
- [ ] §4.5 Ribbon stamp: 3 visual states ✓. Tap handlers deferred to PR 2 ✓ (acceptable per master plan).
- [ ] §4.9 Locked sticker treatment: sepia approximation ✓ (Hazard 8.25 documented).
- [ ] §4.11 Copy keys: PR 1 subset added ✓. Remaining keys deferred to PR 2 ✓.
- [ ] §4.13 Animation library: Reanimated v4 + `withTiming` only ✓, NO springs ✓, `Easing.bezier(0.16, 1, 0.3, 1)` used ✓.
- [ ] §5.2 Files modified: all expected files touched.
- [ ] §5.4 Store changes: featuredIds + 4 actions + computeAutoFill ✓.
- [ ] §5.5 Backend: DB migration ✓. Edge Function deferred to PR 3 ✓ (acceptable per master plan).
- [ ] §5.7 Tests: PR 1 subset implemented ✓.

**2. Placeholder scan:** grep the new components for `TODO`, `FIXME`, `TBD`, `XXX`:
```bash
grep -rn "TODO\|FIXME\|TBD\|XXX" src/components/profile/stickers/LightWashOverlay.tsx src/components/profile/stickers/RibbonStamp.tsx src/components/profile/stickers/TrophyDetailView.tsx
```
Expected: 0 matches. If found, fix or convert to a hazard entry.

**3. Type consistency:**
- `FeaturedSlots` type used consistently across `userAchievementsStore`, `profileStore`, and the import in `profile/index.tsx`.
- `setFeatured / unsetFeatured / swapFeatured` all return `Promise<void>` — uniform.
- `RibbonStamp.state` type matches the 3 strings used in `TrophyDetailView`.

**4. Test count + suite count:** match the master plan projection (51 suites, ~488 tests).

**5. Smart quotes:** grep for `'`, `'`, `"`, `"` in new files. Expected: 0 (curly quotes break TS — use escape sequences).

---

## Definition of done

PR 1 ships when ALL of the following are true:

- [ ] All 16 task checkboxes complete.
- [ ] Self-review checklist passes.
- [ ] `npm test` reports ~488 passing across 51 suites.
- [ ] `npx tsc --noEmit` reports 30 errors (baseline, zero new).
- [ ] On-device smoke test (Task 14.9) confirms the trophy view renders correctly in all 3 ribbon states + locked.
- [ ] PR is open on GitHub with the description above.
- [ ] User has been notified with the PR URL and explicitly asked for review.
- [ ] No merge attempted without explicit user greenlight.

---

## After PR 1 merges

1. Draft `docs/superpowers/plans/2026-05-22-pattern-e-pr2-editing.md` using the master plan + lessons from PR 1 implementation.
2. Update `HANDOFF.md` §0 TL;DR with new state (PR 1 merged, PR 2 in flight).
3. Update memory file `project_achievement_stickers.md` if new conventions emerged (e.g., the sepia overlay pattern).

---

**End of PR 1 plan.**
