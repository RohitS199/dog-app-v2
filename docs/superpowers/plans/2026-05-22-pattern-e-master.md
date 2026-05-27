# Pattern E — Trophy Detail + Sticker Customization Master Plan

**Date:** 2026-05-22
**Status:** Draft — pending user approval
**Owner:** Claude Opus 4.7 (1M context)

This is the master roadmap for implementing **Pattern E** (locked design from the 2026-05-22 design exploration session). It documents the 3-PR sequence and shared decisions. Each PR has its own detailed implementation plan.

## Source of truth

- **Locked design spec:** `HANDOFF.md` §4 (in worktree root)
- **Canonical mockup:** `preview-trophy-flow-pattern-e-empty-slots.html` (worktree root) — open in browser, click demo buttons at bottom to see all states.
- **Original research:** `HANDOFF.md` §3 (3 research syntheses)
- **Locked decisions:** `HANDOFF.md` §6
- **Hazards carried forward:** `HANDOFF.md` §8 (8.1–8.31)

If anything in this plan conflicts with HANDOFF.md, **HANDOFF.md wins** — it captures the user's locked decisions from the live design session.

## High-level scope

| Surface | Feature | Where |
|---|---|---|
| Profile root | 3 always-visible slots (filled OR empty "+" mount) | PR 2 |
| Profile root | "View all 12 stickers" link → browse grid | PR 2 |
| Trophy detail view | New Pressed Flower Specimen visual + ribbon stamp + idle motion + washi tape + earned date | **PR 1** |
| Trophy detail view | Ribbon tap → setFeatured / unsetFeatured / swap panel | PR 2 |
| Browse grid | All 12 stickers, locked desaturated, featured wear ribbon corner stamps | PR 2 |
| Picker grid | Same DOM as browse, but tap→fills slot, adaptive header copy | PR 2 |
| Swap panel | Slide-up, 3 thumbnails, manual swap | PR 2 |
| Locked sticker | Sepia/cream desaturation (no "?" placeholders) | **PR 1** |
| State + DB | `featuredIds` slot state + `profiles.featured_stickers` JSONB column | **PR 1** |
| Backend mirror | Edge Function `_shared/achievements.ts` adds `tender_caretaker` + auto-fill on first 3 earns | PR 3 |

## PR sequence

### PR 1 — Foundation + visual trophy ("what you see") ★ DETAILED PLAN BELOW

**Branch:** `feat/trophy-pattern-e-pr1-foundation` (off `feat/profile-watercolor-overhaul`)
**Plan file:** `docs/superpowers/plans/2026-05-22-pattern-e-pr1-foundation-and-trophy.md`
**Scope:**
- DB migration: add `profiles.featured_stickers JSONB DEFAULT '[null, null, null]'`
- Store: add `featuredIds` slot state + `setFeatured/unsetFeatured/swapFeatured/hydrateFeatured` actions + persistence (read on profile load, write on action)
- Data: add `ribbonTilt: number` to `StickerDef`, populate per sticker
- Copy: add 13 new keys to `profileCopy.ts`
- New components (visual only, ribbon non-interactive):
  - `LightWashOverlay.tsx` — 6s sweep gradient
  - `RibbonStamp.tsx` — 58×58 ★ stamp, 3 visual states (featured / unfeatured / locked-hidden)
  - `TrophyDetailView.tsx` — Pressed Flower Specimen overlay (replaces `StickerDetailContent` consumption point in `profile/index.tsx`)
- `StickerCard.tsx` locked-state visual update: sepia overlay instead of opacity 0.4
- `profile/index.tsx` Modal detail mode now renders `TrophyDetailView` instead of `StickerDetailContent`
- Delete `StickerDetailSheet.tsx` (already unused by production code)

**Out of scope for PR 1:** all customize flows (empty slots, picker, ribbon tap handlers, swap panel, browse grid polish). Profile row STILL uses legacy `topThreeForRow()` fallback so user behavior is unchanged outside the new visual trophy view.

**Definition of done:** User taps any sticker → sees new Pressed Flower Specimen view with all visual polish. State + DB exist but don't drive any customize behavior yet. 470/470 → 470 + new tests passing.

### PR 2 — Editing surface ("how you customize")

**Branch:** `feat/trophy-pattern-e-pr2-editing` (off PR 1 branch — stacked, or off main after PR 1 merges)
**Plan file:** `docs/superpowers/plans/2026-05-22-pattern-e-pr2-editing.md` (written after PR 1 lands)
**Scope:**
- New components:
  - `EmptySlotMount.tsx` — hand-drawn dashed "+" mount (74×74)
  - `SwapPanel.tsx` — slide-up panel with 3 thumbnails
- `StickerCollection.tsx`: add picker-mode variant, "View all" link, ribbon corner stamps for featured stickers in browse mode
- `RibbonStamp.tsx`: wire tap handlers to `setFeatured / unsetFeatured / showSwapPanel`
- `profile/index.tsx`: extend Modal state machine to include `picker | swap-panel` modes; profile row reads `featuredIds` (NOT `topThreeForRow()`)
- Auto-fill logic wired to `triggerEventCheck` (first 3 earns auto-fill)
- "Coming soon" treatment for null seasonal stickers (no PNG yet)
- Toast notifications for featured/unfeatured/swapped events
- Adaptive picker header copy (3 states: empty / partial / full)

**Out of scope for PR 2:** backend mirror.

**Definition of done:** Full customize flow works end-to-end client-side. Earning a sticker auto-fills an empty slot. User can tap empty slot → picker → fill. User can tap ribbon on a non-featured sticker → swap panel → choose which to swap out.

### PR 3 — Backend mirror + production hardening

**Branch:** `feat/trophy-pattern-e-pr3-backend`
**Plan file:** `docs/superpowers/plans/2026-05-22-pattern-e-pr3-backend.md` (written after PR 2 lands)
**Scope:**
- Edge Function `_shared/achievements.ts`: add `tender_caretaker` entry (drift fix carried from PR #6 hazard 8.19) + mirror auto-fill logic on award
- Server-side write of `profiles.featured_stickers` on auto-fill
- End-to-end test: trigger an earn → verify featured slot populated in DB → verify frontend store re-reads correctly
- Offline behavior check: featured changes queue or fail gracefully (no silent data loss)
- 60fps perf check on idle motion + light-wash sweep

**Definition of done:** Backend authoritative. Frontend store reconciles on conflict (server wins). No silent drift between client + server.

## Shared decisions (DO NOT re-litigate in PR plans)

These come from HANDOFF.md §6 and apply across all 3 PRs:

| Decision | Resolution |
|---|---|
| Trophy visual | "Pressed Flower Specimen" (Option 1) — drift + breath + light-wash |
| Navigation | Pattern A (direct-to-trophy from profile row) |
| Customize mechanism | Empty "+" slot + watercolor ★ ribbon on trophy view |
| Replacement at capacity | Manual swap via slide-up panel (NOT auto-replace oldest) |
| Locked sticker treatment | Desaturated sepia on real artwork (Apple Fitness pattern) — NEVER "?" |
| Description hierarchy | `unlockCriteria` is primary (concrete), `description` is secondary flavor |
| Profile row chrome | NO "my featured" label, NO ★ ribbon stamps on row stickers |
| Empty "+" rotation | STRAIGHT (the rings rotate ±10°, not the +) |
| Always-visible 3 slots | Yes — even at 0 earned. Empty slots ARE the discovery surface. |
| Auto-fill | Yes — first 3 earns auto-fill empty slots; 4+ requires manual swap |
| Featured cap | 3 fixed (matches row capacity) |
| Animation lib | `react-native-reanimated` v4 + `withTiming` ONLY. NO spring physics. |
| Default easing | `Easing.bezier(0.16, 1, 0.3, 1)` (easeOutExpo equivalent) |
| Branch strategy | Pattern E gets its own branches + PRs (NOT extending PR #6) |
| Missing seasonal PNGs | Use "coming soon" treatment for `seasonal_fall/winter/summer` — user decision 2026-05-22 |

## Cross-PR risks + mitigations

| Risk | Mitigation |
|---|---|
| iOS one-Modal limit (Hazard 8.3) | PR 1 & 2 use the existing single Modal in `profile/index.tsx` — switch content layers via state, never nest Modals |
| Auto-fill drift between client+server (Hazard 8.30) | PR 3 makes backend authoritative. PR 2's client auto-fill is optimistic; profile re-fetch reconciles. |
| Sepia filter not supported in RN (Hazard 8.25) | PR 1 uses `opacity 0.5 + cream-tinted overlay View` (simplest path). If visual fidelity insufficient, PR 1.5 considers pre-rendered desaturated PNGs OR Skia. |
| Stacked PRs review burden | If PR 1 reviews slowly, branch PR 2 off PR 1 (stacked). When PR 1 merges, rebase PR 2 onto main. |
| Test mock gaps for new RN libs | `jest.setup.js` already mocks `react-native-reanimated`, `expo-haptics`, `react-native-svg`. PR 1 verifies these cover our new component needs; extend if not. |

## Asset inventory (shared across PRs)

| Sticker ID | Asset file | Status |
|---|---|---|
| `welcome` | `assets/stickers/welcome.png` (+@2x, @3x) | ✓ wired |
| `multi_pup_parent` | wired | ✓ |
| `tender_caretaker` | wired | ✓ (PR #6) |
| `pattern_spotter` | wired | ✓ |
| `first_peony` | wired | ✓ |
| `bouquet_of_joy` | wired | ✓ |
| `full_spectrum` | wired | ✓ |
| `bloom_master` | wired | ✓ |
| `seasonal_spring` | wired | ✓ |
| `seasonal_fall` | null | "coming soon" treatment in PR 2 |
| `seasonal_winter` | null | "coming soon" treatment in PR 2 |
| `seasonal_summer` | null | "coming soon" treatment in PR 2 |

User confirmed (2026-05-22): the existing 9 PNGs are final. The 3 missing seasonals will show "coming soon" in the picker/grid until artwork arrives.

## What gets deleted

| File | Why | When |
|---|---|---|
| `src/components/profile/stickers/StickerDetailSheet.tsx` | Legacy bottom-sheet — already unused by `profile/index.tsx` (only test file imports it) | PR 1 |
| `src/components/profile/stickers/__tests__/StickerDetailSheet.test.tsx` | Tests the deleted file | PR 1 |
| Use of `topThreeForRow()` for profile row rendering | Replaced by `featuredIds` array from store | PR 2 (keep function itself as fallback / migration helper) |
| `StickerDetailContent.tsx` | Replaced by `TrophyDetailView.tsx` | PR 1 (deleted after `profile/index.tsx` swap, with tests if any) |

## Test count projections

| Phase | Suites | Tests |
|---|---|---|
| Baseline (2026-05-22) | 49 | 470 |
| After PR 1 | 49 + 3 new − 1 deleted = 51 | 470 + ~22 new − ~4 deleted = ~488 |
| After PR 2 | 51 + 4 new = 55 | ~488 + ~30 new = ~518 |
| After PR 3 | 55 + 1 e2e suite (skipped in CI by default) | ~518 + 0 (manual) = ~518 |

## Approval gate

This master plan, plus the detailed PR 1 plan, are ready for user review. **No code is written until the user explicitly approves the PR 1 plan.** After PR 1 lands, the detailed PR 2 plan is drafted using lessons learned.

---

**End of master plan.** See `2026-05-22-pattern-e-pr1-foundation-and-trophy.md` for PR 1 implementation detail.
