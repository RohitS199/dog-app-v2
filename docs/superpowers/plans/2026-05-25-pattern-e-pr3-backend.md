# Pattern E PR 3 — Backend mirror + auto-fill orchestration

**Branch:** `feat/trophy-pattern-e-pr3-backend`
**Stacks on:** PR 2 (`feat/trophy-pattern-e-pr2-editing`)
**Status:** In flight — see [PR #9](https://github.com/RohitS199/2-app-v2/pull/9).

## Why this PR exists

PR 1 shipped the data layer (`user_profiles.featured_stickers` JSONB column + Zustand store actions). PR 2 wired the frontend editing surface (empty slots, picker, ribbon tap, swap panel, optimistic auto-fill in `fetch()`). PR 3 closes the loop server-side so the system is correct under direct SQL access, multi-device sync, and offline edge cases.

## What ships in this PR

### 1. Validation trigger

**File:** `supabase/migrations/20260525050741_pattern_e_featured_stickers_validation.sql`

A `BEFORE INSERT OR UPDATE OF featured_stickers` trigger on `user_profiles` that runs `validate_featured_stickers_earned()`. For each non-null slot, it verifies the sticker_id exists in `user_achievements` for the same user. Catches:

- Direct SQL writes that bypass the frontend (`UPDATE user_profiles SET featured_stickers = ...`).
- Stale frontend state writing a sticker the user no longer has (rare — only if user_achievements was deleted out of band).
- Multi-device race where one device features a sticker before the other has synced the earn record. The receiving session retries via the next `fetch()`.

A `CHECK` constraint can't do this — CHECK can't reference other tables. The trigger is `SECURITY DEFINER` with an explicit `search_path = public` and `REVOKE EXECUTE FROM anon, authenticated` to follow the project security hardening pattern.

## What's deferred to a follow-up (NOT in this PR)

These items require Edge Function source modifications. The Edge Function source for `check-achievements` is **not** checked in to this repo — it lives in the Supabase dashboard / a separate repo / on the server. Doing them here would require either checking the source in first (architectural decision the user should make) or deploying directly to production via MCP (state-changing operation that requires explicit user approval).

### 2. `_shared/achievements.ts` mirror update

The Edge Function file `_shared/achievements.ts` is the backend mirror of `src/constants/achievements.ts`. PR 1 added a 12th sticker (`tender_caretaker`) and the `ribbonTilt` field to all 12 stickers in the frontend constants. The backend mirror needs to be updated to match — at minimum, add the `tender_caretaker` row so the earn rules pipeline knows about it.

**Action when ready:** copy `src/constants/achievements.ts` content into the Edge Function's `_shared/achievements.ts` (adjusting for Deno imports). Validate via `npx supabase functions deploy check-achievements`.

### 3. Server-side auto-fill in `check-achievements`

When `check-achievements` returns `newly_earned: [...ids]`, the frontend `fetch()` triggers `computeAutoFill` and persists the new featuredIds (added in PR 2 commit `5fd11fe`). A server-side mirror would:

- Compute the auto-fill inside `check-achievements` after inserting new `user_achievements` rows.
- Update `user_profiles.featured_stickers` in the same transaction.
- Return the resulting featured_stickers in the response payload so the frontend can short-circuit the redundant client-side compute.

This is purely an optimization/correctness pass — the frontend optimistic update already gets the right result in the common case. Server-side becomes important when:
- The user is on multiple devices and Device A earns the sticker while Device B has stale state.
- A future server-side "achievement check on schedule" runs without a connected client.

### 4. `ribbonTilt` mirror

The backend doesn't render UI so it doesn't strictly need `ribbonTilt`. Leaving this out unless a future telemetry / export path needs it.

## Test plan

- [ ] Apply migration: `npx supabase migration up` (or run via MCP `apply_migration`).
- [ ] Confirm trigger exists:
  ```sql
  SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.user_profiles'::regclass;
  ```
  Expect `trg_validate_featured_stickers` in the list.
- [ ] Negative test (should fail with `check_violation`):
  ```sql
  UPDATE user_profiles
  SET featured_stickers = '["welcome", "some_unearned_sticker", null]'::jsonb
  WHERE user_id = '<your-user-id>';
  ```
- [ ] Positive test (should succeed):
  ```sql
  -- assuming 'welcome' is in user_achievements for this user
  UPDATE user_profiles
  SET featured_stickers = '["welcome", null, null]'::jsonb
  WHERE user_id = '<your-user-id>';
  ```
- [ ] Frontend regression: `npm test --silent` from worktree — expect 504 passing.
- [ ] Frontend typecheck: `npx tsc --noEmit` — expect 0 new TS errors above 30 baseline.

## After this PR

- Tackle the Edge Function `_shared/achievements.ts` mirror in a separate (non-PR-stacked) branch once we agree on whether to check the Edge Function source into this repo or keep it on the Supabase side.
- Consider lightweight telemetry: `INSERT INTO featured_sticker_events` on every set/unset/swap so we can answer "what fraction of users customize their featured row" after launch.
- Optional: pre-rendered desaturated PNG variants for locked stickers if the current sepia overlay reads weak on device (Hazard 8.25 follow-up).
