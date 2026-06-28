# PupLog — Project & Session Handoff

**Last updated:** 2026-06-26
**Written by:** Claude (Opus 4.8) — "Journey garden hero: processed **all hero art** (24 flowers + doghouse → background-removed + downscaled, ~90 MB → 6.6 MB, **PR #28**); resolved the **§6 ground strategy with the user → Option B (baked watercolor ground PNG)** with a hybrid build order; and wrote the **Phase-1 scene-build spec + plan** for the next instance. Merged the Journey docs thread (**PR #27**)." session. (Prior, 2026-06-17: My Dogs dog-portrait-frame, still UNCOMMITTED on the #23 worktree — §5A.)
**For:** The next Claude instance — possibly a **different machine/cloud instance**. Read this top-to-bottom, then `CLAUDE.md`, `DOCUMENTATION.md`, and the codebase.
**⭐ Journey scene-build entry point:** [`docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md`](docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md) (design + decisions) → [`docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md`](docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md) (TDD plan). **USE SKILLS — existing, new, or found online — ALWAYS (§14).**

---

## ⚠️ READ THIS BOX FIRST

There are **two live threads** plus the standing invariants. Don't conflate them.

**Thread A — Journey garden hero (NOW THE ACTIVE CREATIVE THREAD; no longer "parked"):**
- **Plumbing built + reviewed + green** → PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26) (`feature/journey-garden-hero`, HEAD `1a7b75f`): data model `garden_logs` (live), store, helpers, screen, `src/components/garden/*`, a11y. **68 suites / 573 tests green.** Awaiting iPhone QA + merge.
- **Hero art DONE** → PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28) (`assets/garden-art`): 24 flowers + doghouse background-removed + downscaled, 3 clouds; `assets/garden/` **~90 MB → 6.6 MB** (fixes the bundle-bloat review finding). All verified transparent. **The flower art includes stems** → the "build code stems" item is obsolete (scene spec §4.1).
- **§6 ground strategy RESOLVED with the user → Option B (baked watercolor ground PNG)**, hybrid build order: build the **Phase-1 no-art layers first** (doghouse grounding, clouds + interim sky, Biscuit bob, butterfly), drop the baked ground in behind them later.
- **Next job: execute the Phase-1 plan** → spec [`docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md`](docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md) + plan [`docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md`](docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md). Branch off `origin/main` **after #26 + #28 merge** (both code + art needed). Remaining art the user still owes (Gemini): the **baked ground PNG** (required, Phase 2) + a watercolor **Biscuit** (recommended). Deep reference §7.
- **Docs travel now:** the Journey design thread was committed via PR [#27](https://github.com/RohitS199/dog-app-v2/pull/27) (**merged** → `origin/main` `feedafa`); the art via PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28). The 2026-06-26 scene spec + plan are still untracked on the laptop — **commit them** (this session was mid-handoff).

**Thread B — My Dogs + coral CTA + the older docs handoff (await iPhone QA + merge):**
- **⚠️ UNCOMMITTED, laptop-only — the dog portrait frame (2026-06-17).** The wooden-frame dog portrait + flexible bone name-tag lives ONLY as uncommitted working-tree edits in `.worktrees/my-dogs-tab` (on top of `cab328a`). **A fresh clone has NONE of it.** Deep reference **§5A**. Once the user's iPhone QA passes, **commit it to `feature/my-dogs-tab` (PR #23)** — files in §5A.
- **PR [#23](https://github.com/RohitS199/dog-app-v2/pull/23) — My Dogs tab (Phase 1)** · **PR [#24](https://github.com/RohitS199/dog-app-v2/pull/24) — coral-CTA WCAG AA fix** · **PR [#25](https://github.com/RohitS199/dog-app-v2/pull/25) — older docs handoff (the 2026-06-17 version of THIS file; slightly stale — close it or refresh).** The user QAs visual changes on a physical iPhone, then says "merge" (`gh pr merge <n> --merge`).

**Standing invariants (unchanged):**
- **`origin/main` = `feedafa`** (after PR #27 merged). **Open PRs: #23, #24, #25, #26, #28** (#27 merged). **Laptop local `main` = `ac1070c`** — deliberately *diverged*: 2 My-Dogs *doc* commits not on origin, behind origin on avatar/handoff/docs merges, carries **~27 uncommitted onboarding-redesign files** + untracked Journey docs/art. **Never pull/rebase/commit-to local `main`.** Branch off `origin/main`, PR back.
- **`.env` is gitignored** — app won't boot without it (`supabaseUrl is required`). Each worktree needs its own copy: `cp <main>/.env <worktree>/.env`. Ask the user for the two `EXPO_PUBLIC_SUPABASE_*` keys on a fresh clone.
- The user hit their **Claude monthly spend limit** during the My Dogs final review (2026-06-12, killed ~27 verifier subagents mid-workflow). It has been usable since, but prefer solo work / small fan-outs unless they confirm headroom.
- **Process the user expects:** brainstorm → plan → TDD (Superpowers skills); low ceremony; 2–3 sharp questions max; device QA then "merge." **Always use existing skills, hunt for new ones, make skills when a pattern recurs (§14).**

---

## 0. TL;DR — where things stand and what's next

- **My Dogs tab is BUILT and shipped as PR #23** (not "paused" — the previous handoff predates this work). Full per-dog "Living Scrapbook" hub: dog switcher → identity hero → active-alert card → month calendar → weekly polaroid look-back → sticker shelf → Ask Biscuit bridge → care details, plus a full-screen all-weeks page. Built **entirely on the scrapbook design system** (not the dated "Earthy Dog Park" theme) after a 3-agent market-research pass; binding rationale committed as a visual addendum. 570/66 green. **Awaiting iPhone QA + merge.**
- **Coral-CTA WCAG fix is PR #24** — pre-existing `ctaText:#ffffff` on coral `#F4845F` was 2.53:1 (AA fail); retokened to ink `#2a221c` (6.2:1), fixing all 8 coral-CTA sites app-wide. Independent of #23. **Awaiting QA + merge.**
- **Bonus fix folded into #23:** `@expo/vector-icons` was a *phantom dependency* (imported by 24 files, declared by none) → the 24× `TS2307` + 5× `TS2345` baseline. Declaring it drops the tsc baseline **30 → 1**. (Other checkouts still show 30 until they merge #23 and `npm install`.)
- **Journey hero (Thread 2) is parked** at: direction locked, canonical mockup built, all 24 mood×tier flowers wired in. Gated on the user generating doghouse/scene art. Deep reference §7.
- **Untouched:** onboarding-redesign WIP (laptop local `main`, the user's own arc — §9), avatar arc (merged, §8), backend (complete).
- **Immediate next action for you:** (1) the **dog portrait frame** built this session is **UNCOMMITTED** on the `.worktrees/my-dogs-tab` worktree (§5A) — once the user's iPhone QA passes, **commit it to PR #23**; (2) then check PR #23/#24 for review comments / a merge instruction. Otherwise the Journey hero is the standing creative thread. Don't start new feature code without a brainstorm.

---

## 1. Recent sessions

### 1a. Latest — My Dogs tab built end-to-end → PR #23 (2026-06-11 → 06-12)

The user said **"start building it"** against the existing My Dogs spec, then: *"make this production level good… look at the color scheme… do market-level research and see what is wrong and fix it."* Sequence:

1. **Loaded `superpowers:executing-plans`**, read the spec + the 13-task plan, then launched **3 background market-research agents** (pet apps; wellness/journaling design systems; scrapbook/memory products) + 1 Profile-conventions recon agent.
2. **Market verdict (the answer to "what's wrong with the colors"):** the legacy "Earthy Dog Park" palette is the **2014 Material Design Brown column** — `#D7CCC8` cards = Brown 100, `#FF6F00` = Orange 900, `#FAFAFA` = Grey 50. Mid-tone gray-brown cards **invert elevation** (cards darker than bg) and **mute dog photos**; two CTA recipes **fail WCAG AA** (white-on-`#FF6F00` 2.79:1, white-on-coral 2.53:1). Fix already in-repo: the **scrapbook system** Profile shipped on (`onboardingTheme.ts`).
3. **Wrote a binding visual addendum** that overrides the plan's styling: `docs/superpowers/specs/2026-06-11-my-dogs-visual-addendum.md` (committed on the branch — see §5). Added scrapbook tokens (`cardWhite`/`hairline`/`washNeutral` + 8 week-tone fill/wash pairs) to `onboardingTheme.ts`.
4. **Built the 13 tasks via `superpowers:subagent-driven-development`** — fresh implementer per task, each followed by an independent **spec-compliance review** then a **code-quality review**; every reviewer finding fixed (polish commits in the log). Helpers (pure logic) went first, then components, then the screen + nav.
5. **5-lens adversarial final review** (correctness / design / WCAG-with-computed-ratios / Golden-Rule safety / RN perf) via a Workflow, each finding attacked by a refuter before counting. **It caught a real Golden-Rule regression in my own plan** (see §5.4) plus correctness + a11y items — all fixed in commit `20c1ea9`.
6. **Root-caused the tsc baseline** (`cab328a`, see §0/§5.5) and shipped **PR #23**.

### 1b. coral-CTA WCAG AA fix → PR #24 (2026-06-12)

A spawned-task follow-up. `OB_COLORS.ctaText` was `#ffffff` on coral `#F4845F` (2.53:1, AA fail). Survey confirmed all 8 coral-fill CTA sites read the token → retokened to ink `#2a221c` (6.2:1) fixes them all at once; also fixed PillButton ghost/logout (coral *text* on cream, the mirror violation). TDD: wrote `src/components/__tests__/PillButton.test.tsx` first (3 color assertions red) → fix → 5/5 green. Details §6.

### 1c. Journey hero: pitch → Option A → v2 → 24 flowers (2026-06-11 → 06-12) — parked

A *separate parallel thread* (HTML mockups + Gemini art, all laptop-untracked). Direction locked to Option A "The Front Yard"; canonical mockup `preview-journey-hero-option-a-v2.html`; all 24 mood×tier flowers generated and wired into an asset-slot loader. Full deep reference preserved in **§7** (do not lose it — it lives only in this file).

### 1d. My Dogs spec + plan origin (2026-06-10) — superseded by 1a

Spec `docs/superpowers/specs/2026-06-03-my-dogs-tab-design.md` (laptop `main` commit `7523c63`) + 13-task plan `docs/superpowers/plans/2026-06-06-my-dogs-tab.md` (commit `ac1070c`). The user briefly reopened the design for market research — which is exactly what session 1a then did, *as the production pass*, before building. **These two doc files are on laptop local `main` only — NOT on the PR #23 branch** (the branch was cut from `origin/main`; only the *visual addendum* rides on it). A fresh clone reviewing #23 sees the addendum, not the original spec/plan.

### 1e. Profile-avatar arc (2026-06-02 → 06-03) — COMPLETE

PRs #15–#22 merged. `origin/main` history: `ebed28c` ← `aaa6897`(#21) ← `2ecb6ad`(#20) ← `a002d8a`(#19) ← `945b8e2`(#18) ← `0f1b3a8`(#17) ← `1c7636e`(#16). Reference §8.

---

## 2. Project identification + how to run

| Field | Value |
| --- | --- |
| Product | **PupLog** — React Native (Expo) app: *educational* dog-health guidance. **NOT veterinary medicine** (legally load-bearing). Formerly "PawCheck" (rebranded 2026-03-07). |
| GitHub (active) | `https://github.com/RohitS199/dog-app-v2.git` (remote `origin`) |
| GitHub (archived) | `https://github.com/RohitS199/dog-app-ui.git` — do not push here |
| Landing page repo | `https://github.com/RohitS199/PupLog-landing-page.git` (at `/Users/rohitsandur/Documents/Projects/puplog_landing_page/`) |
| Open PRs | **#23** (My Dogs) · **#24** (coral-CTA a11y) · **#25** (older docs handoff) · **#26** (Journey garden plumbing) · **#28** (Journey art). #27 (Journey docs) **merged**. |
| `origin/main` HEAD | `feedafa` (after #27) · laptop local `main` = `ac1070c` (diverged on purpose, §4) |
| Supabase project | `https://wwuwosuysoxihtbykwgh.supabase.co` |
| Tech stack | Expo SDK 54, RN 0.81 (New Arch), TypeScript strict, Expo Router v6, Zustand v5, Supabase JS v2, Jest 29 + RNTL |
| Tests | **522 / 56** at `origin`; **570 / 66** at the #23 commit (`cab328a`) · **578 / 68** in the #23 worktree with the §5A frame work; **527 / 57** on the #24 branch (the "279/22" in `CLAUDE.md` is stale) |

**Run the app (on the user's phone via Expo dev-client):**
```bash
# To QA PR #23 (My Dogs):
cd /Users/rohitsandur/Documents/Projects/dog_app_ui/.worktrees/my-dogs-tab && npx expo start
# To QA PR #24 (coral CTA):
cd /Users/rohitsandur/Documents/Projects/dog_app_ui/.worktrees/coral-cta-aa && npx expo start
```
Both worktrees already have `node_modules` + `.env`. Scan the QR (opens the dev-client, not Expo Go — native modules present). `-c` clears Metro cache; `--tunnel` if the phone can't reach the Mac.

**Run the Journey-hero mockups** (Thread 2, no build): open `preview-journey-hero-option-a-v2.html` directly, or serve via `.claude/launch.json` (`python3 -m http.server 8088`) → `http://localhost:8088/preview-journey-hero-option-a-v2.html` (HTTP lets the canvas de-white the flower PNGs; file:// falls back to multiply blend).

**Test:** `npm test` (or `CI=true npm test`); `npx jest --no-cache` if cache misbehaves. **Run tests inside the active worktree**, not the main dir (stale `.claude/worktrees/*` can poison resolution — H3).

**Dependency gotchas:** `react-native-worklets` devDep; `async-storage` + `expo-network` need `--legacy-peer-deps`; **Jest must be v29**; **no smart/curly quotes in `.ts` literals**.

---

## 3. The "Golden Rule" (never violate)

> **Never let a dog owner walk away from a genuine emergency thinking they can wait.**

Urgency "monitor" = teal `#00897B`, **never green**. The 5 legal components (`src/components/legal/`) are required on every triage result. **This rule shaped the My Dogs design** (§5.4): week-tone colors are deliberately distinct from the urgency palette so alert colors stay rare; "concern" weeks get caring-neutral *text* (never color-only); the hub surfaces active pattern alerts because hiding the Health tab from the bar would otherwise bury them; the today-chip refuses "feeling good" wording on a vet-tier day. Keep an "Emergency help ›" path one tap away on every new logging surface.

---

## 4. Current repo / git state

- **`origin/main = feedafa`** (after Journey docs PR #27 merged). **Open PRs: #23 (My Dogs), #24 (coral CTA), #25 (older docs handoff), #26 (Journey garden plumbing), #28 (Journey art).** Other remote branches not in play (ask before touching): `feat/dev-onboarding-bypass`, `feat/envelope-watercolor-icon`, `feature/profile-pr1-foundations`, `feature/profile-redesign-pr2-6`, `fix/onboarding-auth-navigation`, `claude/*`.
- **Active worktrees (mine — keep until their PR merges):**
  - `.worktrees/my-dogs-tab` → `feature/my-dogs-tab` `cab328a` (PR #23)
  - `.worktrees/coral-cta-aa` → `fix/coral-cta-aa-contrast` `4ba1f44` (PR #24)
  - (Plus stale `.claude/worktrees/*` from old sessions — ignore; don't run tests from them.)
- **Laptop local `main` = `ac1070c`** — has the 2 My-Dogs *doc* commits (`7523c63`/`ac1070c`, NOT on origin), behind origin on avatar/handoff merges, and carries: ~27 **modified** onboarding-redesign files (`src/components/onboarding/*`, `app/onboarding.tsx`, `onboardingTheme.ts`, `jest.setup.js`, + untracked `AnimatedCheck.tsx`) **and** the Thread-2 Journey-hero untracked inventory. **The user's separate arcs — do not commit/stash/modify.**
- **Workflow:** branch every feature off **`origin/main`** (never local `main`), one worktree per bundle, `cp .env` in, PR to origin. Subagent sandboxes often deny `git` — the controller commits with targeted `git add <files>` (never `-A` when other agents share the tree). Shell cwd can reset to the main checkout after user interrupts — always `cd` with absolute paths in bash commands.

---

## 5. MY DOGS TAB — what shipped in PR #23 (deep reference)

**One-line:** a calm per-dog "Living Scrapbook" hub — identity + logging history + collection + care — with **no health analysis** (that's the future Discovery tab's job). Reachable as the "My Dogs" tab; built on the scrapbook design system like Profile.

### 5.1 Files (all committed on `feature/my-dogs-tab`)

| Layer | Files |
| --- | --- |
| **Binding design doc** | `docs/superpowers/specs/2026-06-11-my-dogs-visual-addendum.md` (overrides plan styling; market-research rationale + per-component token bindings) |
| **Pure helpers (+ tests)** | `src/lib/calendarStatus.ts` (`computeDayStatuses` extracted from `health.tsx` so both calendars match; `getTodayString` device-local date contract) · `src/lib/weekGrouping.ts` (`getWeekStart`/`addDaysStr`/`groupCheckInsByWeek`; `WeekSummary`/`WeekTone`; tone = worst day-summary tier) · `src/lib/dogPersonality.ts` (`describeDog`, JSONB-safe fallback) |
| **Components (+ tests)** | `src/components/dogs/` — `DogSwitcher` · `DogIdentityHero` · `WeekSceneCard` (exports `WEEK_TONE_COLORS`) · `WeekLookBack` · `DogStickerShelf` · `AskBiscuitCard` · `DogCareDetails` |
| **Screens** | `app/(tabs)/dogs.tsx` (the hub) · `app/dog-weeks.tsx` (full-screen all-weeks page) · test `src/components/__tests__/MyDogsScreen.test.tsx` |
| **Shared-component seams** | `src/components/ui/CalendarGrid.tsx` (+ optional `accentColor`/`todayTextColor`/`flat`) · `src/components/ui/DayDetailSheet.tsx` (+ optional `backgroundColor`/`closeButtonColor`/`closeTextColor`) — **all default-preserving; Health tab is pixel-identical** |
| **Nav** | `app/(tabs)/_layout.tsx` (registers `dogs`) · `src/components/ui/FloatingTabBar.tsx` (bar = Journey/My Dogs/Discovery/Profile; `health`+`triage` hidden) |
| **Deps/infra** | `package.json`+lock (`@expo/vector-icons` now declared) · `jest.setup.js` (expo-router mock gains `useNavigation().addListener`) · 4× `CLAUDE.md` updated |

### 5.2 Visual system (the production pass — this is "what was wrong")

- **Built on scrapbook tokens** (`src/constants/onboardingTheme.ts` `OB_*`), NOT the legacy `theme.ts` "Earthy Dog Park." Screen bg cream `#f7f1e6`; cards warm-white `#FFFDF8` with 2px sketch `#1a140f` borders + soft shadow; Caveat (screen titles) / PatrickHand 19 (section headers) / **Nunito for all data**; CTAs = **ink `#2a221c` on coral `#F4845F` (6.2:1)**, never white-on-coral; Duolingo-style 4px-offset press mechanic.
- **New tokens added to `onboardingTheme.ts`:** `cardWhite`, `hairline`, `washNeutral`, and 8 week-tone pairs (`toneThriving`/`toneThrivingWash` … `toneConcern`/`toneConcernWash`) — **fills/washes only, never text, and deliberately distinct from the urgency palette** (`#C62828`/`#E65100`/`#F57C00`/`#00897B`).
- **Calendar embed:** the reused `CalendarGrid` sits in a cardWhite wrapper via the new `flat` seam (no nested old-theme card) with `todayTextColor=ink` on the coral today-circle (AA). Health tab unaffected because every seam defaults to the old value.
- Polaroid week cards: pure-white paper, ±2° tilt (alternating), one handwritten date stamp — scrapbook restraint = one physical metaphor per layer.

### 5.3 Phase-1 scope & deliberate limitations (documented, not bugs)

- **Per-dog stickers = honest empty shelf.** `userAchievementsStore` is account-level only; per-dog attribution needs a `dog_id` migration on `user_achievements`. Prop seam (`earnedStickerIds`) ready.
- **Ask Biscuit → `/health`** (interim). Real Discovery screen ships later; `health` stays registered/navigable, just off the bar.
- **Look-back bounded to the loaded month window** (+7 trailing days). Multi-month history = a follow-up wider fetch.
- Navigating to the hidden `health` tab leaves no bar tab highlighted (cosmetic, accepted).

### 5.4 Safety mitigations from the adversarial review (Golden Rule applied)

These were *findings against my own first cut*, fixed in `20c1ea9`:
- **Alert-visibility regression** (hiding Health from the bar buried `vet_recommended` alerts) → the hub now shows a **severity-striped active-alert card** (`activeAlerts` from `healthStore`, fetched on mount + tab focus) that routes to `/health`.
- **Color-only tone encoding** → attention/concern week cards carry caring-neutral **text** ("A bumpy week" / "A tough week") + a11y markers, not just a wash.
- **Contradictory chip** → the today chip goes neutral ("Logged today", washNeutral) on attention/vet-tier days; "feeling good" can't appear on a vet-recommended day.
- **Stale shared-store reads** → day-sheet closes on dog switch; `dog-weeks` filters `calendarData` by `dog_id` + shows a loading state. Focus listener only re-fetches alerts (not the *clearing* month fetch — avoids an empty-calendar flash).
- Plus honest fallbacks: weight 0 / age <1 render "Not added" / "<1 yr".

### 5.5 The tsc baseline fix (`cab328a`) — root-caused, not patched

`@expo/vector-icons` was a **phantom dependency**: imported by 24 files, declared by none, so npm kept it nested under `node_modules/expo/node_modules/...` where Metro/Jest tolerate it but Node-style TS resolution can't see it (→ 24× `TS2307`). The 5× `TS2345` (`string | number | symbol`) were downstream — with the module untyped, `keyof typeof MaterialCommunityIcons.glyphMap` degraded. Declaring `"@expo/vector-icons": "^15.0.3"` (the version already in the tree) hoists a typed root copy. **Baseline 30 → 1** (the remaining one is an unrelated pre-existing `TS2345` at `app/(tabs)/index.tsx:634`). Removed the 5 temporary `@ts-ignore` blocks the My Dogs files had used. **Note for §12's typecheck gate:** once #23 merges, the "30 known errors / filter out vector-icons" convention is obsolete — the real baseline becomes **1**.

### 5.6 My Dogs follow-ups (also in root `CLAUDE.md`)

Per-dog sticker data layer (`dog_id` on `user_achievements`) · real Discovery screen + Health-tab retirement · multi-month look-back fetch · Phase-2 watercolor flower art in calendar cells + look-back scenes (ties into Thread 2's flower system) · after #23 merges, drop the obsolete `@ts-ignore`-era typecheck filter.

---

## 5A. DOG PORTRAIT FRAME — hero portrait + width-flexible bone name-tag (2026-06-17 — UNCOMMITTED on the #23 worktree)

**Status:** built, **578/68 green, tsc clean** (only the 1 pre-existing `index.tsx:634` baseline), visually verified via PIL composites. **EVERY change is an uncommitted working-tree edit in `.worktrees/my-dogs-tab` on top of `cab328a`** — a fresh clone has none of it. **The user is QA-ing the latest fix (grommet connection) on their iPhone; once it passes, commit it to `feature/my-dogs-tab` (PR #23).**

**What it is:** in the My Dogs hero (`DogIdentityHero`) the circular portrait + the big name heading are replaced by a hand-drawn **wooden picture frame** holding the dog's photo, with a **blue bone name-tag hanging from the frame's ring** showing the dog's name. The tag is its own element that **widens to fit any name length** (the first cut overlaid text on a fixed-size tag and long names shrank to unreadable / truncated — the user flagged it, so it was reworked into a stretchable tag).

**Spec:** `docs/superpowers/specs/2026-06-16-dog-portrait-frame-design.md` (includes a "Revision 2026-06-17" section documenting the flexible-tag rework). Built via `superpowers:brainstorming` → spec → `superpowers:test-driven-development` (RED→GREEN throughout).

### 5A.1 Files (ALL uncommitted — `git add` these explicitly)
| Layer | Files |
| --- | --- |
| **New components** | `src/components/dogs/DogPortraitFrame.tsx` (frame + photo-in-cutout + hangs the tag) · `src/components/dogs/BoneTag.tsx` (3-slice bone that grows with the name) |
| **New tests** | `src/components/__tests__/DogPortraitFrame.test.tsx` (4) · `src/components/__tests__/BoneTag.test.tsx` (3) |
| **Modified** | `src/components/dogs/DogIdentityHero.tsx` (swapped portrait+heading for `DogPortraitFrame`; **also removed the CTA `OB_SHADOWS.button` drop-shadow** per the user) · `src/components/__tests__/DogIdentityHero.test.tsx` (+1 framed-portrait test) |
| **Polish fix (modified)** | `src/components/dogs/DogSwitcher.tsx` (`paddingHorizontal: 0→24` on its `row`) + `app/(tabs)/dogs.tsx` (wrapped `<DogSwitcher>` in `switcherBleed: { marginHorizontal: -24 }`) — avatar row now scrolls **full-bleed / edge-to-edge** instead of clipping ~24px inside the screen gutter |
| **New assets** (`assets/dogs/`, untracked dir) | `wood-frame.png` (606×376, source art w/ blank tag — slice source, not used at runtime) · **`wood-frame-empty.png`** (frame + clasp + ring + grommet, **bone erased — the component renders THIS**) · `bone-left.png` (41×66) · `bone-mid.png` (2×66, the stretch strip) · `bone-right.png` (40×66) · `frame-tag-source.svg` (510 KB — the user's Figma export; raster-embedded, **reference only, not used by code**, and large: decide with the user whether to keep it in git) |

### 5A.2 How it works (so you can tune it)
- **Frame:** `DogPortraitFrame({size, photoUrl, name, fallbackInitial})` renders `wood-frame-empty.png` at `size × size/FRAME_ASPECT` (`FRAME_ASPECT = 606/376 ≈ 1.612`). Photo absolutely-positioned in the cutout via ratios measured with PIL: `PHOTO_LEFT 0.348 · TOP 0.197 · W 0.290 · H 0.473`. No photo / load error → cream cutout + initial. Hero frame width = `min(Dimensions.width − 48, 320)`.
- **Bone tag = a nine-patch stretch.** `BoneTag({name, scale, maxWidth})` lays out `[bone-left][bone-mid stretched][bone-right]` (RN `resizeMode="stretch"` on the 2px mid strip) + the name centered over it. The **waist widens once `name.length > BASE_CHARS`**, so the bone grows instead of the text shrinking. **Tunables in `BoneTag.tsx`:** `CHAR_W=0.58` (extra waist per char), `BASE_CHARS=5`, `NAME_FONT=22` (native; the tag text is on the small side since the tag is small vs the frame — bump this if the user wants it bigger), `WAIST_MIN=22`. Width capped at the frame width (`maxWidth`).
- **The grommet connection (the bug the user caught → fixed; ASSET-ONLY fix, no code change):** the chain must read rail → gold clasp → silver ring → bone **grommet** (the bone's own hole) → bone, like the user's Figma. The first empty-frame erased the grommet too, so the bone dangled detached below the ring. Fix: `wood-frame-empty.png` now **keeps the clasp + full silver ring + grommet** (center column) and erases only the bone *body*; the 3-slice bone (no grommet) tucks under the grommet at `LOOP_Y_RATIO=0.82` in `DogPortraitFrame`. Grommet stays centered (the bone is always centered), so the connection holds at any name width. **If you re-run the erase, keep `(291 ≤ x ≤ 320) and (y < 333)` in `wood-frame.png` (606×376).**
- **Known minor (told the user):** very long names give the bone a fuller / less-pinched waist. Reads fine; tune via the `bone-mid` slice (take it from a narrower waist x) if they want a slimmer long-tag.

### 5A.3 Asset-derivation workflow (reproduce / re-tune with PIL — no Figma round-trip needed)
The art arrived as a 606×376 PNG (+ a raster-embedded SVG). **`python3` + PIL 12.1.1 are available locally.** The whole pipeline was PIL: scan pixels to measure the photo-cutout + bone bbox; crop the 3 bone slices; regenerate `wood-frame-empty.png` (erase bone body, keep clasp+ring+grommet); and **composite a preview** (sample photo + name on the frame) to verify ratios **before** building RN. ⚠️ **The RN app cannot be screenshotted from the agent environment** — PIL composites are the verification path; final visual QA is the user on-device. Previews were saved to the user's **Desktop** (`dog-frame-final-preview.png`, `dog-frame-connection-fixed.png`, `bone-stretch-proof.png`).

### 5A.4 To QA / re-test on the user's phone
`cd /Users/rohitsandur/Documents/Projects/dog_app_ui/.worktrees/my-dogs-tab && npx expo start -c` — **the `-c` matters** because new image assets were added/changed (Metro caches the asset registry; a hot reload won't re-bundle a swapped PNG — stop Metro and restart with `-c`). Open the **My Dogs** tab; try a dog with a long name to watch the tag widen.

---

## 6. CORAL-CTA WCAG FIX — PR #24 (reference)

- **Root fix = one token.** `OB_COLORS.ctaText` `#ffffff` → ink `#2a221c`. Every coral-fill CTA reads it, so this corrects all 8 sites at once: `src/components/profile/SaveButton.tsx`, `src/components/profile/PillButton.tsx` (primary), `src/components/onboarding/ScrapbookButton.tsx` (primary), `app/(tabs)/profile/my-information.tsx` (pencil button + its spinner), `app/(tabs)/profile/my-subscription.tsx` (retry), `app/(tabs)/profile/settings/help-center.tsx` (contact + close).
- **Mirror violation also fixed:** `PillButton` ghost/logout used coral *text on cream* (~2.5:1) → ink, coral border keeps the variant identity.
- Audited the other literal-white text sites (green-fill checkmarks/badges in `PerkRow`, `ScrapbookChip`, `PaywallScreen`) — they pass (4.8–7.3:1), left untouched.
- **New test:** `src/components/__tests__/PillButton.test.tsx` (5 tests) pins the ink recipe.
- **⚠️ Merge interaction with the onboarding WIP:** laptop local `main` has uncommitted edits to `onboardingTheme.ts` / `ScrapbookButton.tsx`. When that redesign lands, **keep `ctaText` as ink** — if a merge ever re-offers `#ffffff`, that's the regression returning.

---

## 7. JOURNEY HERO WORKSTREAM (Thread 2 — parked creative thread, deep reference)

> All artifacts here are **untracked on the laptop** unless noted. This section is the only record — preserve it. Picks up after the two PRs are dealt with (or whenever the user generates more art).

### 7.1 Product shape (locked decisions)

- **4-tab target IA:** Journey / My Dogs / Discovery / Profile. Journey = the hero (live growing garden + daily logging). My Dogs = per-dog identity/history (**now built, PR #23**). Discovery = Biscuit reads the garden (not designed). Profile = Pattern E stickers + settings (shipped).
- **Streaks are dead** (May 2026). Flowers + stickers are the engagement layer; a missed day = bare soil, never a wilted flower or guilt copy.
- **One check-in per dog per day** (`UNIQUE(dog_id, check_in_date)`) → **one flower**, planted in that dog's garden. **Weekly cycle:** Journey shows the current week; at week's end the scene becomes a "house & garden" snapshot for My Dogs' look-back (the My Dogs `WeekLookBack`/`WeekSceneCard` are the Phase-1 placeholder for exactly this — Phase 2 swaps the tone-wash scene for real flower art).
- **Flower encoding:** **color = the dog's mood that day; complexity = how detailed the log was.** This IS "rewarded for specifics" — richer logs grow fuller flowers; no points/badges. Tier thresholds in the v2 mockup (tunable): mood picked = T1 · ≥1 health chip = T2 · photo **or** note = T3.
- **Hard moods get dignity:** anxious = tight plum bud; unwell = ash-blue snowdrop (delicate, never wilted).

### 7.2 The 8 moods (canonical palette — `~/Downloads/puplog_flower_prompts_v2 (1).md`)

| Mood | Hex | Color name | | Mood | Hex | Color name |
| --- | --- | --- | --- | --- | --- | --- |
| joyful | `#F4C430` | Sunny Yellow | | tired | `#C8B4D8` | Soft Lavender |
| playful | `#FF8C61` | Coral Orange | | anxious | `#A89AA8` | Muted Plum |
| affectionate | `#F4A6B8` | Rose Pink | | unwell | `#C5CDD2` | Pale Ash Blue |
| calm | `#A8C9A0` | Sage Green | | curious | `#9BB5DD` | Periwinkle Blue |

Filename convention `puplog-flower-[mood]-tier[1|2|3].png` — **all 24 exist** in `assets/garden/flowers/` (~82 MB; sources still have **white backgrounds**, §7.5).

### 7.3 Canonical mockup — `preview-journey-hero-option-a-v2.html`

390×844 phone frame; scrapbook palette; Google-Fonts CDN. Scene: sky → drifting clouds → far hill → wobbled meadow washes → doghouse (slot) + contact shadow → Biscuit (placeholder corgi) + speech bubble → dirt path → soil bed → this week's swaying flowers → wooden day-pegs → **today = pulsing dashed coral ring + soil mound + "🌱 Plant today" sign** → grass tufts → vignette → paper grain. Tapping the mound opens a bottom sheet: live preview pot (sprout→T1→T2→T3 with the real mood PNG), labeled tier meter, numbered sections (1 mood chips ×8 with color dots → 2 health chips, "All normal" exclusive → 3 photo + note), 52px coral CTA, emergency link; sections unlock progressively; planting pops the flower with a petal burst + Biscuit reaction. **Build decision:** SVG filters live *inside* SVG (`filter="url(#wob)"` on paths), not CSS `filter:url()` on HTML — Safari limitation.

**Asset-slot loader (JS in the file):** `assetURL(file)` probes `assets/garden/<file>`, **canvas-de-whites on success** (near-white→transparent, falloff min-channel 228–247), caches per page-load (→ **hard-refresh after dropping files** — H8), falls back to SVG placeholders (or `mix-blend-mode:multiply` when canvas is tainted on file://). `renderFlower(el, moodKey, color, tier, px)` is the single flower entry point; live-file count shows in the caption chip. A doghouse PNG triggers an HTML "LUNA" name overlay (generated houses must have a **blank** sign).

### 7.4 Gemini art pipeline

The user generates art in Gemini one prompt at a time (downloads `Gemini_Generated_Image_*.png`, sometimes dragged into the folder). **Your loop when art arrives:** Read each image → identify mood by color + tier by complexity (T1 ~5 simple petals / T2 layered / T3 ornate) → copy into `assets/garden/flowers/` with the canonical name → hard-refresh the mockup → verify. Prompt guides (house style consistent — base style block verbatim, colors as "name (hex)", Save-as lines, calibrator-first): flowers `~/Downloads/puplog_flower_prompts_v2 (1).md`, stickers `~/Downloads/puplog_sticker_prompts_v2.md`, **scene kit `puplog_garden_scene_prompts.md`** (project root): `puplog-doghouse.png` ⭐ calibrator (chunky storybook, walnut `#5A3A22` roof, chestnut `#8A5A38` planks, **completely blank cream sign**), `puplog-mound.png`, `puplog-sprout.png`, optional `puplog-grass-tuft.png` + `puplog-butterfly.png` — all into `assets/garden/`. Lock style by re-uploading a finished asset as reference; "no text/letters" fix phrase for the sign; pure-white bg + post removal; phone squint test (doghouse ~190px, mound ~75px). `assets/garden/README.md` = slot map.

### 7.5 Known debts (Journey)

- **White backgrounds:** all 24 flower sources carry white bg; mockup de-whites at runtime, but the **RN app needs true background-removed exports** (or a processing step) + downscaling (sources 1024–2048px, 1–6 MB).
- **82 MB of PNGs untracked** — decide with the user: plain commit / Git LFS / keep-out-of-git+transfer (they also exist in `~/Downloads` as `Gemini_Generated_Image_*.png`).
- De-white threshold protects pale highlights (`#FFF4D6` etc.); recheck if a flower has near-white petals.
- Biscuit in the mockup is a placeholder corgi SVG; final mascot art is a separate track. In-app `src/components/onboarding/BiscuitMascot.tsx` is a simpler placeholder.

### 7.6 Open product questions (resolve before the Journey spec — 2–3 sharp Qs, not 10)

1. How do the 8 moods map onto the clinical 9-question check-in (`src/constants/checkInQuestions.ts`, `app/check-in.tsx`)? Mockup proposal: mood = a *new* first question (= flower color); symptom chips absorb the clinical layer; photo + note = Tier 3. The 7-metric flow's fate (replace / re-skin / fold into "details") is undecided.
2. Can editing a day's entry retroactively upgrade its flower tier?
3. Minor: exact tier thresholds; permanent vs on-tap day labels.

### 7.7 Where Journey left off → next

> **⚠️ 2026-06-26 UPDATE — read this FIRST (supersedes the dates below where they conflict):**
> - **Plumbing built + reviewed** → PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26) (`garden_logs` live, store/helpers/screen/components, 68 suites/573 green).
> - **All hero art processed + committed** → PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28): 24 flowers + doghouse background-removed + downscaled (~90 MB → 6.6 MB; fixes the §7.5 white-bg + bloat debts). **Flower art includes stems** → don't build code stems.
> - **§6 ground strategy RESOLVED with the user → Option B (baked watercolor ground PNG)**; hybrid order = build the no-art layers first.
> - **Phase-1 scene-build spec + plan written** → [`docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md`](docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md) + [`docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md`](docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md). **Next = execute that plan** (doghouse grounding → clouds + sky → Biscuit bob → butterfly), then Phase-2 baked ground (user generates the PNG + a watercolor Biscuit). Branch off `origin/main` after #26 + #28 merge.
> - **Visual source of truth is now `preview-journey-hero-final-week.html`** (committed via PR #27). **USE SKILLS — existing, new, or found online — ALWAYS.**
>
> **⚠️ 2026-06-23 UPDATE — read this first:** the Journey visual is now LOCKED via a fully-built mockup, and a **detailed handoff spec exists** → **[`docs/superpowers/specs/2026-06-23-journey-garden-hero-design.md`](docs/superpowers/specs/2026-06-23-journey-garden-hero-design.md)** (authoritative for scene/palette/scatter/cluster/clouds AND the data model; every claim is referenced). **Visual source of truth is now `preview-journey-hero-final-week.html`** — full end-of-week garden: 61-bloom organic *cluster* scatter (no day-slots), real cloud PNGs (`assets/garden/puplog-cloud-1/2/3.png`), grass/mushroom/wildflower/pebble detail, grounded doghouse, distinct horizon. **Data-model correction:** the line below about "a new column on `daily_check_ins`" is **SUPERSEDED** — a mood-only garden log can't be a `daily_check_ins` row (its 7 clinical columns are NOT NULL, verified against the live DB); the spec's **§12 recommends a separate `garden_logs` table** (decision gate — ratify before building the data layer). A TDD plan exists at [`docs/superpowers/plans/2026-06-20-journey-tab-hero.md`](docs/superpowers/plans/2026-06-20-journey-tab-hero.md) (its data-layer Tasks 5/7/11 need the `garden_logs` revision; pure-logic Tasks 1–4/6/8 are ready). **Always use skills — existing, newly-created, or found online via `npx skills find` / skills.sh — see the spec §0 + §17.**

① Doghouse + scene-kit art (user generates from `puplog_garden_scene_prompts.md`, doghouse first — calibrator; name-overlay alignment `.house-name` in the v2 HTML may need a nudge). ② QA squint-pass over all 24 flowers at phone scale; regenerate any that muddy; declare the set locked. ③ Resolve §7.6. ④ Then `superpowers:brainstorming` (short — direction locked) → spec in `docs/superpowers/specs/` → `superpowers:writing-plans` → TDD. RN implementation notes: reuse `checkInStore` draft/persist; `dogs`/`daily_check_ins` already support the data; mood likely needs a new column/value mapping on `daily_check_ins` (no duplicated enums between TS + Postgres CHECK); flower rendering = **static `require()` asset map** `FLOWER_ASSETS[mood][tier]` (**Metro cannot do template-literal requires**); reanimated `withTiming` only (no springs); plant celebration ≈ 1000ms, 1.02× overshoot.

---

## 8. Avatar subsystem (reference — complete, stable)

`src/stores/profileStore.ts` `updateAvatar(uri|null)` → `user_profiles.avatar_url` (single source of truth), optimistic+revert, uploads to `avatars` bucket; `loadFromAuthAndProfile()` uses `getSession()` (offline-safe). `app/(tabs)/profile/my-information.tsx` picker → `resizeForAvatar()` (`src/lib/resizeImage.ts`, ≤800px JPEG 0.8) → `updateAvatar`; offline short-circuit via `useNetworkStatus()`. `src/components/profile/WoodPortrait.tsx` + `WoodFrameSvg.ts`: `AVATAR_DIAMETER_RATIO=0.62`, recenter `LEFT=0.494−D/2`, `TOP=0.5106−D/2` (cutout center (123,120) in 249×235 viewBox). `FloatingTabBar` reads `profileStore.loaded?.avatar_url`; `authStore.updateAvatar` deleted (#21) — don't resurrect. **Bundle D (dog photo as human avatar) was DROPPED** — don't re-propose.

---

## 9. Onboarding-redesign WIP (laptop-only — not yours)

~27 modified files on laptop local `main` (19-step onboarding: `src/components/onboarding/*`, `app/onboarding.tsx`, `onboardingTheme.ts`, `jest.setup.js`, + untracked `AnimatedCheck.tsx`). **Do not commit/stash/modify.** The onboarding scrapbook aesthetic (cream, sketch borders, Caveat/PatrickHand/Kalam, chunky 4px-offset buttons, Biscuit + typewriter bubbles) is the visual language the Journey hero (and My Dogs) match — `onboardingTheme.ts` is the token source. ⚠️ Coordinate with PR #24 on `ctaText` (§6).

---

## 10. Remaining work / backlog

**Awaiting action (immediate):**
- **PR #23 / #24** — iPhone QA → merge (`gh pr merge <n> --merge`). PR bodies have the device checklists.

**Active redesign era, priority order:**
1. **Journey tab hero** — parked creative thread; gated on doghouse art (§7).
2. **My Dogs Phase 2** — watercolor flowers in calendar cells + look-back scenes (ties to Journey's flower system); per-dog sticker data layer; multi-month look-back; real Discovery + Health retirement (§5.6).
3. **Onboarding flow (19-step)** — user's own WIP; needs integration testing + auth-screen routing.
4. **Subscription/paywall** — `subscriptionStore.ts` + `SuperwallProvider.tsx` exist; needs Superwall/RevenueCat config + testing.
5. **Discovery tab** — not designed; Biscuit reads the garden; absorbs today's Health-tab content (which must keep a home until then — currently reached via My Dogs → Ask Biscuit).
6. **Buddy/Biscuit mascot final art + animation** — deferred (`withTiming`, no springs).

**Paused:** Triage **on ice** (April 2026); v2.6 Phase 3 (triage + check-in history) not started.

**Pre-launch/ops:** Privacy Policy (attorney), LLC + E&O insurance, 50/day rate limit (only 10/hr on `check-symptoms`), leaked-password protection (needs Supabase Pro), emergency vet locator (post-MVP), Tier-2 RAG expansion (post-beta), Milestone 6 beta/TestFlight.

**Backend is COMPLETE** (Edge Functions v10/v1s, RLS hardened, stress tests 100% Tier-1, delete-account, AI health analysis, weekly-summary GitHub Action active since 2026-03-07). See `CLAUDE.md` + `DOCUMENTATION.md`.

---

## 11. Product-direction decisions (recorded here — `~/.claude` memory doesn't travel)

- PawCheck → **PupLog** (2026-03-07). **No streaks ever** (flowers + stickers; missed days neutral). **Triage on ice** (April 2026).
- **Flower system canonical:** color = mood (8), complexity = log-detail tier (3); per-dog; weekly cycles; hard moods with dignity. Don't propose alternative mappings.
- **Profile = account-level stickers only** (never flowers); My Dogs = per-dog gardens/history; Journey = the live garden.
- **Color systems:** legacy "Earthy Dog Park" (`theme.ts`) is **dated** (2014 Material Brown — see §5.2); the **scrapbook `OB_COLORS`** (`onboardingTheme.ts`) is the go-forward system for all redesign surfaces. Profile + My Dogs are on it; Journey hero matches it; legacy Home/Health still on the old theme (migration pending Discovery). Urgency monitor = teal `#00897B`, never green.
- **Engineering principles the user enforces:** no duplicated enums between TS and Postgres CHECKs; privacy toggles default opt-out; **Gemini artwork is a drop-in — never hand-beautify placeholders**; **Metro needs static `require()` paths** (asset maps, no template literals); **CTAs use ink-on-coral, never white-on-coral** (WCAG, §6).

---

## 12. Conventions in force

- Relative imports only; ASCII apostrophes only; user-facing Profile copy in `src/constants/profileCopy.ts`.
- Zustand stores in `src/stores/`; redesign screens use `OB_*` tokens; legacy screens use `COLORS`.
- **TDD for store/lib logic** (write the failing test first); components/screens get render tests; reanimated components need a local `jest.mock`.
- **TypeScript baseline:** currently **30 known errors** at `origin` (24× `TS2307` `@expo/vector-icons` + 6× `TS2345`). The filtered gate below is the *origin-era* convention; **PR #23 drops the real baseline to 1** by declaring the phantom dep, after which this filter is obsolete:
  ```bash
  # origin-era gate (pre-#23 merge):
  npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l
  # post-#23: just expect a count of 1 (the unrelated index.tsx:634 TS2345)
  ```
- Git: branch + PR only; Conventional Commits with scope; merge via `gh pr merge <n> --merge`; HEREDOC commit bodies with trailer `Co-Authored-By: Claude <model name> <noreply@anthropic.com>`.
- Accessibility: **WCAG AA** — 44–48dp targets, roles/labels, shape+color (not color alone), `accessibilityRole="alert"` for errors, **compute contrast ratios before shipping a color pairing** (white-on-coral and white-on-orange both failed — §6, §5.2).

---

## 13. Hazards (carry forward — several earned the hard way)

| # | Hazard | Mitigation |
| --- | --- | --- |
| H1 | Fresh clone / worktree has no `.env` → `supabaseUrl is required` | `cp .env.example .env` (or `cp <main>/.env <worktree>/.env`), restart Metro `-c`. |
| H2 | Worktrees need their own `.env` | Always `cp` it in at creation. |
| H3 | Stale `.claude/worktrees/*` poison `npm test`/tsc from the main dir | Run tests inside the active worktree / clean clone. |
| H4 | `@expo/vector-icons` 24× TS2307 baseline | **Fixed by PR #23** (declared the dep). Pre-merge, use the filtered typecheck (§12). |
| H5 | Subagent sandboxes deny `git` (commit/push) mid-task | The controller commits with **targeted `git add <files>`** (never `-A` while agents share the tree); verify + commit the agent's written files yourself. |
| H6 | Edit/Write "File has not been read yet" after interrupts / out-of-band edits | Re-`Read` the region right before editing. |
| H7 | `find -newermt` / Spotlight miss user-dragged files (moves preserve mtime) | When the user says "I put it there," **`ls` the actual folder**; never trust time-window searches alone. |
| H8 | The v2 mockup caches asset-existence probes per page-load | **Hard-refresh** after dropping PNGs (drop → refresh). |
| H9 | **Claude monthly spend limit** can kill subagents mid-workflow (hit 2026-06-12, killed ~27 verifiers) | Prefer solo / small fan-outs; confirm headroom before big multi-agent runs. Workflow `args` may arrive as a JSON string — parse defensively in scripts. |
| H10 | The 24 flower PNGs (82 MB) untracked — one `git clean -fd` deletes them | Back up / commit before destructive git ops; they also exist in `~/Downloads`. |
| H11 | Shell cwd resets to main checkout after user interrupts | Begin every bash command with an absolute `cd`. |
| H12 | RN visual changes **can't be screenshotted** from the agent env | Verify layout/ratios via **PIL composites** (`python3`+PIL 12.1.1 local) before building; final QA = the user on device (§5A.3). |
| H13 | Hot reload won't re-bundle a swapped/added image asset | After changing a PNG, **stop Metro and restart with `-c`** (cache clear) or the old asset sticks. |
| H14 | The §5A dog-portrait-frame work is **uncommitted** — one `git stash`/`checkout` in the worktree loses it | Commit it to `feature/my-dogs-tab` after the user's QA passes; until then don't run destructive git ops in `.worktrees/my-dogs-tab`. |

---

## 14. Skills — use them, find them, make them (the user is explicit)

**Always use the existing skills:**
- **Any new feature:** `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:test-driven-development` → `superpowers:requesting-code-review` → `superpowers:finishing-a-development-branch`. **Brainstorm BEFORE designing/coding.** For executing a written plan: `superpowers:executing-plans` or `superpowers:subagent-driven-development` (the latter drove the whole My Dogs build — fresh implementer per task + two-stage review; it works very well here).
- **Always-on:** `superpowers:verification-before-completion` (show test/typecheck output before claiming done), `superpowers:systematic-debugging` (any bug — root cause before fix; it found the phantom-dep §5.5), `superpowers:using-git-worktrees` (every feature).
- **Domain:** `supabase-postgres-best-practices` (the mood column + per-dog `dog_id` migration will need it), `supabase-edge-functions`, `react-native-architecture` + `react-native-best-practices` (Journey build, perf), `accessibility-compliance` (WCAG AA on every new surface — used for PR #24), `anthropic-sdk` (AI features).

**Find & add new skills from the internet when a domain is unfamiliar:**
```bash
npx skills find "<query>"                 # search the ecosystem
npx skills add <owner/repo@skill> -g -y   # install (prefer 1K+ installs)
```
Browse **https://skills.sh/trending**. For the upcoming RN animation work (flower planting/growth), look for a reanimated/animation skill before hand-rolling.

**Create new skills when a workflow recurs** (`superpowers:writing-skills` or `anthropic-skills:skill-creator`). Standing candidates: ① **"gemini-asset-intake"** — identify dropped art → map to canonical slot names → verify in mockup (the §7.4 loop, run 8× already); ② **"puplog-mockup-conventions"** — the phone-frame / scrapbook-token / asset-slot HTML mockup recipe; ③ **"market-research-design-pass"** — the 3-agent research → binding visual-addendum workflow that produced the My Dogs design verdict (reusable for any "make this production-good" UI request); ④ **"raster-asset-to-rn"** — the §5A.3 PIL pipeline: measure asset regions by pixel-scan → derive ratio constants / nine-patch slices → composite-preview to verify *before* the RN build (the app can't be screenshotted from the agent env). Just used heavily for the wooden frame + stretchable bone tag; recurs for the Journey scene assets.

---

## 15. Key files reference

**My Dogs (PR #23 — on `feature/my-dogs-tab`):** see the table in §5.1. Headline: `app/(tabs)/dogs.tsx`, `app/dog-weeks.tsx`, `src/components/dogs/*` (7), `src/lib/{calendarStatus,weekGrouping,dogPersonality}.ts`, `docs/superpowers/specs/2026-06-11-my-dogs-visual-addendum.md`.

**Dog portrait frame (UNCOMMITTED on `feature/my-dogs-tab` — §5A):** `src/components/dogs/DogPortraitFrame.tsx`, `src/components/dogs/BoneTag.tsx`, `assets/dogs/{wood-frame,wood-frame-empty,bone-left,bone-mid,bone-right}.png` + `assets/dogs/frame-tag-source.svg`, `docs/superpowers/specs/2026-06-16-dog-portrait-frame-design.md`, tests `src/components/__tests__/{DogPortraitFrame,BoneTag}.test.tsx`. Also modified there: `DogIdentityHero.tsx` (+ CTA shadow removed), `DogSwitcher.tsx` + `app/(tabs)/dogs.tsx` (avatar row full-bleed).

**coral-CTA (PR #24 — on `fix/coral-cta-aa-contrast`):** `src/constants/onboardingTheme.ts` (`ctaText`), `src/components/profile/PillButton.tsx`, `src/components/__tests__/PillButton.test.tsx`.

**Journey hero (Thread 2 — laptop-untracked):**

| What | Path |
| --- | --- |
| ⭐ Design spec + handoff (READ FIRST, 2026-06-23) | `docs/superpowers/specs/2026-06-23-journey-garden-hero-design.md` |
| ⭐ Visual source of truth (mockup) | `preview-journey-hero-final-week.html` |
| TDD implementation plan | `docs/superpowers/plans/2026-06-20-journey-tab-hero.md` |
| Interactive mockup (log-sheet flow; styling now stale) | `preview-journey-hero-option-a-v2.html` |
| Cloud assets (real PNGs) | `assets/garden/puplog-cloud-1.png`, `-cloud-2.png`, `-cloud-3.png` |
| Pitch options (reference) | `preview-journey-hero-option-a-front-yard.html`, `...-option-b-gardeners-journal.html`, `...-option-c-biscuits-walk.html` |
| 24 flower PNGs | `assets/garden/flowers/puplog-flower-[mood]-tier[1-3].png` |
| Slot map | `assets/garden/README.md` |
| Scene-kit Gemini guide | `puplog_garden_scene_prompts.md` |
| Flower/sticker prompt guides | `~/Downloads/puplog_flower_prompts_v2 (1).md`, `~/Downloads/puplog_sticker_prompts_v2.md` |
| Mockup server config (:8088) | `.claude/launch.json` |

**Shared / adjacent:**

| What | Path |
| --- | --- |
| Scrapbook design tokens (the visual language) | `src/constants/onboardingTheme.ts` |
| Legacy "Earthy Dog Park" theme (dated) | `src/constants/theme.ts` |
| My Dogs original spec + plan (laptop `main` only — NOT on the #23 branch) | `docs/superpowers/specs/2026-06-03-my-dogs-tab-design.md`, `docs/superpowers/plans/2026-06-06-my-dogs-tab.md` |
| Tab bar (Journey/My Dogs/Discovery/Profile) | `src/components/ui/FloatingTabBar.tsx` |
| Per-dog sticker gap | `src/stores/userAchievementsStore.ts`, `src/constants/achievements.ts` |
| Check-in flow (Journey will reshape it) | `app/check-in.tsx`, `src/stores/checkInStore.ts`, `src/constants/checkInQuestions.ts` |
| Health calendar (shared `CalendarGrid`/`DayDetailSheet`/`computeDayStatuses`) | `app/(tabs)/health.tsx`, `src/stores/healthStore.ts` |
| Avatar subsystem (complete) | `src/stores/profileStore.ts`, `app/(tabs)/profile/my-information.tsx`, `src/lib/resizeImage.ts`, `src/components/profile/WoodPortrait.tsx` |
| Biscuit placeholder | `src/components/onboarding/BiscuitMascot.tsx` |
| Project bibles | `CLAUDE.md` (root + per-dir), `DOCUMENTATION.md` |

---

## 16. Resume protocol

**If you're on the user's laptop** (`/Users/rohitsandur/Documents/Projects/dog_app_ui/`):
```bash
gh pr list --state open                 # expect #23 (My Dogs) + #24 (coral CTA)
git worktree list                       # expect .worktrees/my-dogs-tab + .worktrees/coral-cta-aa
git -C .worktrees/my-dogs-tab status    # expect UNCOMMITTED dog-portrait-frame work (§5A) — commit after QA
git status                              # main: onboarding WIP modified + journey-hero untracked (don't touch)
ls assets/garden/flowers/               # expect 24 puplog-flower-*.png (Thread 2)
```
- **First: commit the uncommitted dog-portrait-frame work (§5A).** `git -C .worktrees/my-dogs-tab status` shows it. If the user's iPhone QA passed, **commit it to `feature/my-dogs-tab`** (`git add` the §5A.1 files + a Conventional Commit) — it then rides into PR #23. If QA found issues, fix in the worktree first.
- **Then, deal with the PRs:** ask the user if they have QA feedback or a merge instruction. To QA: `cd .worktrees/<branch> && npx expo start -c` (§2). To merge: `gh pr merge <n> --merge`, then `git worktree remove .worktrees/<branch>` and delete the local branch.
- **Then** the Journey hero is the standing creative thread (§7.7). **Never pull local `main`.** New code → worktree off `origin/main` + `cp .env`.

**If you're a fresh clone / different machine:**
```bash
git clone https://github.com/RohitS199/dog-app-v2.git && cd dog-app-v2
git rev-parse --short origin/main       # expect ebed28c (or later if PRs merged)
gh pr list --state open                 # #23/#24 if still open
cp .env.example .env                    # ask the user for the two EXPO_PUBLIC_SUPABASE_* keys
npm install --legacy-peer-deps
npm test                                # expect 522/56 at origin (570/66 if you check out the #23 branch)
```
- The PR branches are on `origin` — `git fetch && git checkout feature/my-dogs-tab` to review/QA #23.
- **You will NOT have the §5A dog-portrait-frame work** (uncommitted on the laptop, never pushed) — it must be committed from the laptop before any other machine sees it; ask the user to do so / push the branch.
- **You will NOT have Thread 2** (Journey hero, untracked). Ask the user to push it if needed — recommended split: ① docs + mockups + `assets/garden/README.md` as a small commit; ② the 24 PNGs (82 MB) as a deliberate decision (plain commit / Git LFS / out-of-git transfer; §7.5).

---

## 17. Note on this file

`HANDOFF.md` (laptop copy) is **untracked**; an older version is committed at `origin` (`ebed28c`, via PR #22). If this is for another machine, commit & push it (as PR #22 did). Keep it accurate — this file + `CLAUDE.md` + the code are the cold-start picture.

**Bottom line (2026-06-26):** the **Journey garden hero is the active thread.** Plumbing is built + reviewed (PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26), 68 suites/573 green); **all hero art is processed + committed** (PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28) — 24 flowers + doghouse transparent + downscaled, ~90 MB → 6.6 MB, stems included); the **§6 ground strategy is resolved → Option B (baked watercolor PNG)**; and the **Phase-1 scene-build spec + plan are written** → [`docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md`](docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md) + [`docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md`](docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md). **Next move: merge #28 + #26 after iPhone QA, then execute the Phase-1 plan** (doghouse grounding → clouds + sky → Biscuit bob → butterfly); Phase 2 = the user-generated baked ground PNG + a watercolor Biscuit. Still pending in Thread B: My Dogs PR #23 (+ the uncommitted dog-portrait-frame §5A), coral PR #24, docs PR #25. Use the skills, hunt for new ones online, make the candidate skills in §14, and mind the hazards (H7 `ls` not mtime, H9 spend limit, H11 absolute `cd`, H12 PIL-verify visuals, H13 `-c` after asset swaps, H14 commit the frame work). 🐾🌼
