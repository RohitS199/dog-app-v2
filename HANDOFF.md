# PupLog — Project & Session Handoff

**Last updated:** 2026-06-03
**Written by:** Claude (Opus) — "avatar follow-ups + cleanup" session
**For:** The next Claude instance — most likely a **different cloud machine**. Read this top-to-bottom, then read `CLAUDE.md`, `DOCUMENTATION.md`, and the codebase.

---

## ⚠️ READ THIS BOX FIRST (cross-machine context)

- **This file is committed to `origin/main` on purpose.** Normally PupLog kept `HANDOFF.md` untracked, but the user is handing off to a *different cloud instance*, so it was committed so a fresh clone receives it. If you cloned the repo and are reading this, you have the latest.
- **You are (probably) on a fresh clone of `origin/main` = `aaa6897`** — a **clean tree**. You do **NOT** have:
  - the user's ~27 uncommitted "onboarding redesign" files (they live only on the user's laptop's local `main`; never pushed — see §6),
  - the user's `~/.claude/` memory files (project notes, plans). **Everything you need is in this doc + the repo.**
- **The elaborate "never pull / worktree-everything" workflow described in older notes was specific to the user's laptop** (its local `main` carries uncommitted WIP). On a clean clone you can branch off `main` normally. Still follow **branch + PR**, never commit straight to `main`.
- **`.env` is gitignored.** You must create it before the app boots or runs on-device (see §2). Tests are mocked and don't need it.

---

## 0. TL;DR — where things stand and what's next

- **The profile-avatar workstream is 100% complete and merged.** No in-flight task. **Zero open PRs.**
- `origin/main = aaa6897`. **522 tests / 56 suites green.** TypeScript baseline = 30 known errors (all pre-existing, see §9).
- **Bundle D** (a proposed "use one of your dogs' photos as your avatar" add-on) was **brainstormed and deliberately DROPPED** this session — see §5.4 for the reasoning so nobody re-proposes it.
- **What to do next is the user's call.** The backlog is in §7. The most likely next threads: the **onboarding redesign** integration, **subscription/paywall** wiring, or the broader **playful UI redesign** (flowers + stickers). **Triage is intentionally "on ice."**
- **Process the user expects:** for any new feature, **brainstorm → plan → TDD** (Superpowers skills). They like low ceremony and 2–3 sharp questions, not 10. They QA visual/native changes on a physical iPhone, then tell you to merge.

---

## 1. What this session accomplished (2026-06-02 → 06-03)

This session finished the **profile-avatar arc** and cleaned up after it. All work is merged to `origin/main`.

| PR | Branch | What | Status |
| --- | --- | --- | --- |
| #16 | `feat/floating-tab-single-source` | FloatingTabBar reads avatar from `profileStore` — single source of truth; killed the `auth.user_metadata` dual-write | merged (earlier in arc) |
| #17 | `feat/avatar-polish` | hitSlop→12 (WCAG 44dp), offline-aware upload alert, defensive hydrate | merged (earlier in arc) |
| **#18** | `feat/avatar-compression` | `src/lib/resizeImage.ts` `resizeForAvatar()` — resize ≤800px + JPEG 0.8 before upload (graceful fallback to original) | **merged this session** |
| **#19** | `fix/profile-offline-resilience` | `profileStore.loadFromAuthAndProfile` uses `getSession()` (offline-safe) not `getUser()`; `fetchProfileRow` returns `{row,error}`; My Information no longer hangs on a spinner offline | **merged this session** |
| **#20** | `fix/wood-portrait-border` | `WoodFrameSvg.ts` `AVATAR_DIAMETER_RATIO` 0.56→0.62 (+recenter) so the photo fills the wood-frame cutout (removed cream ring) | **merged this session** |
| **#21** | `refactor/drop-authstore-updateavatar` | Deleted **dead** `authStore.updateAvatar` (38 lines, zero callers — every call site uses `profileStore.updateAvatar`). Verified: 522/522 tests, 0 new TS errors | **merged this session** |

Also this session:
- **Pruned** all merged avatar worktrees + their local & remote branches (#18/#19/#20 and #21).
- **Brainstormed Bundle D and dropped it** (§5.4).
- Rewrote this `HANDOFF.md` and committed it to `main` for the cross-machine handoff.

`origin/main` history (most recent first):
```
aaa6897 Merge pull request #21 (remove dead authStore.updateAvatar)
2ecb6ad Merge pull request #20 (wood frame border)
a002d8a Merge pull request #19 (offline resilience)
945b8e2 Merge pull request #18 (avatar compression)
0f1b3a8 Merge pull request #17 (avatar polish)
1c7636e Merge pull request #16 (FloatingTabBar single source)
```

---

## 2. Project identification + how to run

| Field | Value |
| --- | --- |
| Product | **PupLog** — React Native (Expo) app: *educational* dog-health guidance. **NOT veterinary medicine** (legally load-bearing). Formerly "PawCheck" (rebranded 2026-03-07). |
| GitHub (active) | `https://github.com/RohitS199/dog-app-v2.git` (remote `origin`). Old repo `dog-app-ui` is archived. |
| Landing page repo | `https://github.com/RohitS199/PupLog-landing-page.git` |
| `origin/main` HEAD | `aaa6897` |
| Supabase project | `https://wwuwosuysoxihtbykwgh.supabase.co` |
| Tech stack | Expo SDK 54, React Native 0.81 (New Arch), TypeScript strict, Expo Router v6, Zustand v5, Supabase JS v2, Jest 29 + RN Testing Library |
| Tests | **522 passing / 56 suites** (the "279/22" figure in `CLAUDE.md` is stale — the redesign added profile/onboarding/sticker suites) |

**Run it:**
```bash
cp .env.example .env          # then fill EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY (ask the user)
npm install --legacy-peer-deps
npx expo start
```
**Test it:** `npm test` (or `CI=true npm test` for a clean one-shot). `npx jest --no-cache` if cache acts up.

**Known dependency gotchas:**
- `react-native-worklets` must exist as a devDep (reanimated babel plugin needs it).
- `@react-native-async-storage/async-storage` and `expo-network` need `--legacy-peer-deps`.
- **Jest must be v29**, not v30 (`jest-expo` bundles 29).
- **No smart/curly quotes in `.ts` string literals** — they break the TS parser. ASCII only.

---

## 3. The "Golden Rule" (never violate)

> **Never let a dog owner walk away from a genuine emergency thinking they can wait.**

Every urgency color, disclaimer, and the client-side emergency keyword detector exist to serve this. The lowest urgency uses **teal `#00897B`, intentionally NOT green** (avoids a false "all clear"). The 5 legal components (`src/components/legal/`) are legally required on every triage result. Don't weaken any of this.

---

## 4. Current repo / git state

- `origin/main = aaa6897`. **0 open PRs.** All avatar branches deleted.
- **Other remote branches exist and are NOT part of this session** (leave them unless the user asks): `feat/dev-onboarding-bypass`, `feat/envelope-watercolor-icon`, `feature/profile-pr1-foundations`, `feature/profile-redesign-pr2-6`, `fix/onboarding-auth-navigation`, plus a `claude/*` worktree branch. Ask the user before touching these.
- **On the user's laptop only:** local `main` is `48ef3a9` — *behind* `origin/main` and carrying ~27 uncommitted onboarding-redesign files. It is **deliberately frozen / never pulled** to protect that WIP. **A fresh clone does not have any of this** and should just work off `origin/main`.

---

## 5. The profile-avatar subsystem (reference — this session's domain)

### 5.1 Data flow / single source of truth
- **`src/stores/profileStore.ts`** is the heart. `updateAvatar(uri | null)` is the **single entry point** for set/remove. It writes **only** to `user_profiles.avatar_url` (the app-wide single source of truth). Optimistic update + revert-on-failure. Returns `{ success, error }`. Uploads to the Supabase **`avatars`** storage bucket.
- `loadFromAuthAndProfile()` — uses `getSession()` (offline-safe) + `fetchProfileRow() → {row,error}`; populates the editable `draft` even offline so the My Information screen never hangs.
- **`src/components/ui/FloatingTabBar.tsx`** reads `useProfileStore(s => s.loaded?.avatar_url)`. Nothing reads `auth.user_metadata.avatar_url` anymore (that path is fully retired; the dead `authStore.updateAvatar` was deleted in PR #21).

### 5.2 The avatar UI
- **`app/(tabs)/profile/my-information.tsx`** — `handleAvatarPress()` builds the picker menu: **iOS `ActionSheetIOS`**, **Android `Alert`**. Options: Take Photo / Choose from Library / (Remove, if a photo exists) / Cancel. Both upload paths run `resizeForAvatar(uri)` then `updateAvatar(uri)`, and short-circuit with an offline alert when `useNetworkStatus()` is false.
- **`src/components/profile/WoodPortrait.tsx` + `WoodFrameSvg.ts`** — the wood-framed circular avatar. Tuning constants: `AVATAR_DIAMETER_RATIO = 0.62`, recenter formula `LEFT = 0.494 − D/2`, `TOP = 0.5106 − D/2` (cutout center is (123,120) in the 249×235 viewBox). If you ever re-tune D, recompute LEFT/TOP with those.
- **`src/lib/resizeImage.ts`** — `resizeForAvatar(uri)` runs `expo-image-manipulator` (`resize width 800`, `compress 0.8`, JPEG); **falls back to the original uri** if manipulation throws (resize is an optimization, never a hard blocker).

### 5.3 Navigation note (this confused us once)
The avatar editor is **not its own tab.** Path: the **Profile tab** (its bottom-bar icon *is* the user's avatar) → **My Information** screen → tap the photo. The 5 "classic" tabs in older docs (Home/Health/Learn/Triage/Settings) predate the redesign that added the **Profile** tab and the `app/(tabs)/profile/` area (`index`, `my-information`, `my-subscription`, `settings/`).

### 5.4 Bundle D — DROPPED (do not rebuild)
A queued idea was to add a 4th avatar-menu option, **"Choose from your dogs,"** opening a sheet of the user's dog photos to use as their *profile* avatar. **We brainstormed it and dropped it.** Reasoning: the profile avatar represents the **human owner**; **dog** photos already have their proper home in the **My Dogs** area (`dogStore.updateDogPhoto`, `dogs.photo_url`, the `dog-photos` bucket). It blurred "this is me" vs "this is my dog" and added menu clutter for a marginal payoff — owners who want their dog as their avatar can already use **Choose from Library**. **YAGNI.** With it dropped, the avatar arc is feature-complete.

---

## 6. The user's onboarding-redesign WIP (laptop-only — context)

On the **user's laptop**, local `main` carries ~27 uncommitted files for an in-progress **19-step onboarding redesign** (mostly `src/components/onboarding/*`, `app/onboarding.tsx`, `src/constants/onboardingTheme.ts`, plus `jest.setup.js` tweaks). This is the user's separate, ongoing feature arc.
- **A fresh cloud clone does NOT have these** — so for *you* there's nothing to protect; just work off `origin/main`.
- **If you ever operate on the user's laptop:** do not commit/stash/modify those files; branch new work off `origin/main` (the user freezes local `main`).
- Some onboarding scaffolding *is* on `origin/main` already (`app/onboarding.tsx`, `onboardingStore.ts`, `onboardingTheme.ts`, breed data, social-auth buttons) — the uncommitted WIP is further iteration on top.

---

## 7. Remaining work / backlog (the "what's left")

Pulled from `CLAUDE.md` "Known Remaining Work" + the user's product notes. Roughly priority-ordered; confirm direction with the user before starting any of it.

**Active product build-out (redesign era):**
1. **Playful UI redesign ("Earthy Dog Park" / park + notebook theme)** — IN PROGRESS. HTML mockups → RN. Uses `OB_*` tokens (`onboardingTheme.ts`): cream / ink / cta (orange) / sketch borders.
2. **Onboarding flow (19-step)** — built (`app/onboarding.tsx` + `onboardingStore.ts`), needs **integration testing + routing from the auth screens**. (This is what the laptop WIP is iterating.)
3. **Subscription / paywall** — `subscriptionStore.ts` + `SuperwallProvider.tsx` exist; `expo-superwall` + `react-native-purchases` installed; needs **configuration + testing** (RevenueCat/Superwall keys).
4. **Flower garden system** — replaces streaks. 24 flowers (8 moods × 3 detail tiers); a per-dog "garden" hero on the Journey/Home screen. (Design lives in the user's notes; ask for specifics — artwork is Gemini-generated drop-in, see §8.)
5. **Achievement stickers** — two layers: **account-level on Profile**, **per-dog on My Dogs**. Artwork is a Gemini drop-in; don't beautify placeholders.
6. **Buddy mascot animation** — deferred; `react-native-reanimated` + `react-native-svg` installed but unused. (User dislikes spring physics — use `withTiming`, not springs.)

**Triage (currently paused):**
7. **Triage is "on ice"** (paused ~April 2026). v2.6 Phase 3 ("Enhanced Triage v11" — triage + check-in history context) is **NOT started** and not a priority right now. Don't pick this up unless the user reactivates it.

**Pre-launch / ops prerequisites:**
8. **Privacy Policy** — needs attorney drafting.
9. **LLC formation + E&O insurance** — business prereqs before launch.
10. **50/day rate limit** — only **10/hr** exists today (`check-symptoms`); `analyze-patterns` has 20/hr.
11. **Leaked-password protection** — requires Supabase **Pro** plan (off on Free).
12. **Emergency vet locator** — post-MVP; currently opens a Google search.
13. **Tier-2 RAG gaps** — expand `dog_health_content` (post-beta).
14. **Milestone 6 — Beta** — TestFlight build + real testers. Not started.

**Backend is otherwise COMPLETE** (Edge Functions, RLS, stress tests, delete-account, AI health analysis, weekly summary via GitHub Actions). See `CLAUDE.md` "Backend" + `DOCUMENTATION.md`.

---

## 8. Product-direction decisions (capture — these live only in the user's local memory)

The cloud instance won't have the user's `~/.claude` notes, so the load-bearing decisions are recorded here:
- **Rebrand:** PawCheck → **PupLog** (2026-03-07).
- **Streaks are being removed** in the redesign — **flowers + stickers replace them** as the engagement mechanic. Don't add new streak UI.
- **Triage is on ice** (paused April 2026).
- **Flower garden** (24 flowers, 8 moods × 3 detail tiers, per-dog garden hero on Journey) and **achievement stickers** (account-level on Profile, per-dog on My Dogs) are the redesign's core engagement features.
- **Color:** "Earthy Dog Park" — Dark Loam `#3E2723` (text/buttons), Limestone `#FAFAFA` (bg), Topsoil `#D7CCC8` (surface), Orange Collar `#FF6F00` (accent). Urgency "monitor" = teal `#00897B` (**never green**).

**Engineering principles the user has called out (honor these):**
- **Don't duplicate closed enum values** between TS constants and Postgres `CHECK` constraints — single source of truth.
- **Default privacy/personalization toggles to opt-out** (GDPR/CCPA posture).
- **Sticker/illustration artwork is a Gemini-generated drop-in** — don't hand-polish placeholder art.
- **Metro requires static `require()` paths** — never template literals for assets; use a static asset map.

---

## 9. Conventions in force

- **Imports:** relative only (no path aliases). ASCII apostrophes only.
- **State:** Zustand stores in `src/stores/`. Profile/onboarding screens use the `OB_*` theme tokens (`src/constants/onboardingTheme.ts`); legacy screens use `COLORS` (`theme.ts`).
- **Copy:** all user-facing Profile strings live in `src/constants/profileCopy.ts` (`COPY` object) — don't inline literals.
- **TDD:** required for store/lib logic (RED→GREEN). Screen components have **no Expo Router test harness** by convention → verified by manual/device QA. Reanimated components need a local `jest.mock('react-native-reanimated', …)`. Prefer `testID` over `accessibilityLabel` when labels may duplicate.
- **TypeScript baseline = 30 known errors** (24× `TS2307` `@expo/vector-icons` not hoisted + 6× `TS2345` in `app/(tabs)/{index,learn}.tsx`). **Zero new allowed.** Filtered check:
  ```bash
  npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l
  ```
- **Git:** never push to `main` directly — feature branch + PR. Conventional Commits, scope like `(profile)`. Merge via `gh pr merge <n> --merge` (merge commits match history). Commit trailer used in this repo: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`. Use a HEREDOC for the body.
- **Accessibility:** WCAG AA — 44–48dp touch targets, roles + labels, shape+color (not color alone), `accessibilityRole="alert"` for errors.

---

## 10. Hazards (carry forward)

| # | Hazard | Mitigation |
| --- | --- | --- |
| H1 | **A fresh clone has no `.env`** (gitignored) → app boots to `Error: supabaseUrl is required.` | `cp .env.example .env`, fill the two `EXPO_PUBLIC_SUPABASE_*` keys (ask the user). Restart Metro with `-c` after. |
| H2 | **Worktrees need their own `.env`** (only relevant on the user's laptop workflow) | `cp <main>/.env <worktree>/.env`. |
| H3 | **Stale `.claude/worktrees/*`** on the user's laptop can poison `npm test` from the main dir | Run tests from inside the active worktree, or on a clean clone it's a non-issue. |
| H4 | `@expo/vector-icons` not hoisted in worktrees → ~24 `TS2307` (the TS baseline) | Use the filtered typecheck above. |
| H5 | `expo-image-manipulator` native module may be missing from an old dev build → `resizeForAvatar` silently falls back (no compression) | Confirm via Supabase Storage file size; if multi-MB, `npx expo run:ios` to rebuild. |
| H6 | **Read-state resets across turn boundaries** — the Edit/Write tools can error "File has not been read yet" after an interrupt | Re-`Read` the exact region right before editing. |

---

## 11. Skills to use (the user is strict about this)

- **Any new feature:** `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:test-driven-development` → `superpowers:finishing-a-development-branch`. **Brainstorm BEFORE designing/coding.**
- **Worktrees:** `superpowers:using-git-worktrees` (on the user's laptop; less needed on a clean clone).
- **Verification:** `superpowers:verification-before-completion` — run tests + typecheck and show output before claiming done.
- **Domain skills:** `supabase-postgres-best-practices` (SQL/RLS/migrations), `supabase-edge-functions`, `react-native-architecture`, `accessibility-compliance`, `anthropic-sdk`.
- The user explicitly wants skills used proactively. Low ceremony otherwise: 2–3 sharp questions, focused PRs, they QA on a physical iPhone then say "merge."

---

## 12. Key files reference

| What | Path |
| --- | --- |
| Avatar store (set/remove + offline load) | `src/stores/profileStore.ts` (`updateAvatar`, `loadFromAuthAndProfile`, `fetchProfileRow`) |
| Avatar store tests | `src/stores/__tests__/profileStore.test.ts` |
| Avatar UI screen + picker menu | `app/(tabs)/profile/my-information.tsx` (`handleAvatarPress`) |
| Profile copy strings | `src/constants/profileCopy.ts` (`COPY`, `MY_INFO_AVATAR_*`) |
| Image resize helper | `src/lib/resizeImage.ts` (+ `__tests__/resizeImage.test.ts`) |
| Tab bar (reads profileStore avatar) | `src/components/ui/FloatingTabBar.tsx` |
| Wood-frame avatar + tuning ratios | `src/components/profile/WoodPortrait.tsx` + `WoodFrameSvg.ts` |
| Auth store (note: `updateAvatar` was deleted) | `src/stores/authStore.ts` |
| Dog store (`dogs.photo_url`, `updateDogPhoto`) | `src/stores/dogStore.ts` |
| Network status hook | `src/hooks/useNetworkStatus.ts` |
| Onboarding theme tokens | `src/constants/onboardingTheme.ts` |
| Original avatar design/plan | `docs/superpowers/specs/2026-05-27-profile-avatar-upload-design.md`, `docs/superpowers/plans/2026-05-27-profile-avatar-upload.md` |
| Project bible / standing docs | `CLAUDE.md` (root + per-dir), `DOCUMENTATION.md` |

---

## 13. Resume protocol (fresh clone)

```bash
git clone https://github.com/RohitS199/dog-app-v2.git
cd dog-app-v2
git rev-parse --short origin/main        # expect aaa6897 (or later)
cp .env.example .env                       # fill EXPO_PUBLIC_SUPABASE_URL + ANON_KEY (ask the user)
npm install --legacy-peer-deps
npm test                                   # expect 522 passing / 56 suites
gh pr list --state open                    # expect none (as of this handoff)
```
Then: confirm with the user which backlog item (§7) to tackle, and **brainstorm first**.

---

## 14. Note on this file

`HANDOFF.md` is committed to `main` for this cross-machine handoff (it was historically untracked). The user's laptop has an untracked local copy that may diverge — harmless, since their local `main` is frozen. The next instance may keep updating this on `main` or revert it to untracked; that's the user's call. **Keep it accurate** — it (plus `CLAUDE.md` and the code) is the cold-start picture.

**Bottom line: the avatar arc is done and merged (`origin/main` `aaa6897`, 522/56 green, 0 open PRs). Bundle D was dropped. Pick the next thread with the user from §7 and brainstorm before building. Good luck.**
