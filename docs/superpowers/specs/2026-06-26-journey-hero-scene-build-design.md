# Journey Hero — Scene Build (Phase 1, "no-art layers") — Design Spec & Handoff

**Status:** Design approved by the user (2026-06-26 brainstorm). This spec resolves the open **§6 strategic decision** from the prior visual-build spec and defines the **Phase-1 scene build** — everything we can build *now* with zero new art — plus the deferred Phase-2 baked-ground swap.
**Author:** Claude (Opus 4.8), 2026-06-26 session.
**For:** The next Claude instance (possibly a different machine / cloud session). Read this top-to-bottom, then the documents it references.
**Supersedes nothing; extends:** the per-layer build detail and palette live in the companion specs — this doc records the *decisions* + the *Phase-1 build order* and points at them:
- ⭐ [`docs/superpowers/specs/2026-06-24-journey-hero-visual-build.md`](2026-06-24-journey-hero-visual-build.md) — the RN build plan + current-state delta (per-layer §7, palette §8, animation §9, asset pipeline §10).
- ⭐ [`docs/superpowers/specs/2026-06-23-journey-garden-hero-design.md`](2026-06-23-journey-garden-hero-design.md) — the **visual source of truth** (mockup palette/layering/scatter, fully line-referenced).
- Visual truth (mockup): [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) (project root).
- Live handoff bible: [`HANDOFF.md`](../../../HANDOFF.md).

---

## 0. ⚠️ MANDATORY, EVERY SESSION: USE SKILLS — ALWAYS (existing · new · found online)

**This is non-negotiable and the user has stated it explicitly and repeatedly (2026-06-23, 2026-06-24, 2026-06-26).** Before starting ANY task in this spec you MUST work through all three avenues, in order:

1. **Use the skills we already have** — invoke the relevant skill *before* acting. Full table in [§9](#9-skills--mandatory-read-again). At minimum:
   - `superpowers:brainstorming` before any new design/creative decision,
   - `superpowers:writing-plans` before writing code (the plan for THIS spec is [`docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md`](../plans/2026-06-26-journey-hero-scene-build.md)),
   - `superpowers:test-driven-development` for every pure helper (stem geometry, cloud params, bob math),
   - `react-native-architecture` + `react-native-best-practices` for the scene/animation build (**FPS is load-bearing** — many layers + ~40 images + idle loops),
   - `accessibility-compliance` for every surface (keep the §12 a11y model of the visual-build spec),
   - `superpowers:using-git-worktrees` for isolation,
   - `superpowers:verification-before-completion` before claiming anything is done.
2. **Create a new skill** when a workflow recurs and none covers it — `superpowers:writing-skills` or `anthropic-skills:skill-creator`. Standing candidates (from [`HANDOFF.md` §14](../../../HANDOFF.md) and the visual-build spec §15): **`raster-asset-to-rn`** (the PIL background-removal + downscale pipeline), **`gemini-asset-intake`** (identify dropped art → map to slot names → verify), **`rn-watercolor-scene`** (porting an HTML/SVG painted scene to performant RN), **`puplog-mockup-conventions`**.
3. **Go find a skill online** when you hit an unfamiliar domain (RN watercolor scenes, `react-native-svg` performance, flower-growth/idle-loop animation, parallax FPS):
   ```bash
   npx skills find "<query>"                 # search the ecosystem
   npx skills add <owner/repo@skill> -g -y   # install (global)
   ```
   Browse **https://skills.sh/trending**. **Only install reputable, well-reviewed, reliable skills** (strong install counts / reviews; prefer 1K+ installs; verify before trusting).

**Do not "wing it." If a skill exists or could exist for what you're doing — use one, make one, or find one. Always.** This is repeated in full in [§9](#9-skills--mandatory-read-again). Sources: project [`CLAUDE.md`](../../../CLAUDE.md) "Skills — Always Use", [`HANDOFF.md` §14](../../../HANDOFF.md), the visual-build spec [§0 + §15](2026-06-24-journey-hero-visual-build.md), and the user's explicit instruction.

---

## 1. The decision this spec records (resolved with the user, 2026-06-26)

### 1.1 §6 ground strategy — RESOLVED: **Option B (baked watercolor ground PNG)**
The prior visual-build spec [§6](2026-06-24-journey-hero-visual-build.md) left a fork open: build the painted ground as (A) a `react-native-svg` port of the mockup, (B) a single baked watercolor PNG the user generates in Gemini, or a hybrid. **The user chose Option B.** Rationale:
- The aesthetic *is* watercolor. The mockup gets its painterly texture from a **live `feTurbulence` filter** ([`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) noise bg ~line 49, `#wob`/`#wob2`) that **cannot ship in RN** (FPS) — see visual-build spec [§4 "RN build constraint"](2026-06-24-journey-hero-visual-build.md). An SVG port (Option A) would give correct shapes/gradients but **flat, non-watercolor** edges. Only a baked PNG preserves the look.
- Option B's only real con was "blocked on the user producing art." That con is now **weak**: the user has a proven, fast Gemini→PIL pipeline (they delivered all 24 flowers + the doghouse, background-removed, in a single 2026-06-26 session — see [§2](#2-whats-already-done)).

### 1.2 Sequencing — **hybrid build order** (build the no-art layers first)
The ground is the **bottom** layer. Everything above it is art-independent. So **Phase 1 builds all the no-art layers now** (this spec, [§4](#4-phase-1-per-layer-build-spec)); **Phase 2 drops the baked ground in behind them** ([§5](#5-phase-2--the-baked-ground-deferred)) as a single swap with **no rework**. This gives a large visible jump immediately without waiting on any asset.

### 1.3 Art format — **transparent raster PNG, never vectorized**
Watercolor art stays raster. Do **not** vectorize / convert to SVG (auto-trace destroys the painted texture → flat blobs). `react-native-svg` is used in the scene for *geometric* pieces (stems gradient, contact-shadow ellipse, butterfly) — **not** for the painted art. Recorded as a standing principle (mirrors [`HANDOFF.md` §11](../../../HANDOFF.md) "Gemini artwork is a drop-in" and memory `feedback_sticker_artwork_is_drop_in.md`).

---

## 2. What's already done

| Thing | Status | Reference |
| --- | --- | --- |
| **Garden plumbing (M1+M2)** — data model `garden_logs`, store, helpers, screen, components, a11y | ✅ built, reviewed, **green** (68 suites / 573 tests), merge-ready | PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26), branch `feature/journey-garden-hero`, HEAD `1a7b75f`. Code: [`src/components/garden/`](../../../src/components/garden/), [`src/stores/gardenStore.ts`](../../../src/stores/gardenStore.ts), [`src/lib/{flowerTier,gardenPlacement,gardenWeek}.ts`](../../../src/lib/), [`src/constants/{gardenMoods,flowerAssets}.ts`](../../../src/constants/). |
| **Hero art — 24 flowers + doghouse, transparent + downscaled** | ✅ committed | PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28), branch `assets/garden-art` (off `origin/main` `feedafa`). 24 flowers @≤512px (~5.4 MB), doghouse @1024px (~0.9 MB), 3 clouds — `assets/garden/` went **~90 MB → 6.6 MB** (fixes the bundle-bloat review finding). All verified transparent (corner alpha 0). |
| **The flower cluster scatter** (the core mechanic) | ✅ working | [`GardenScene.tsx:56–131`](../../../src/components/garden/GardenScene.tsx) — `scatterFlowers` expansion (one DB row/day → a cluster of blooms). |

> ⚠️ **The garden code is NOT on `origin/main`** — it lives only in PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26)'s branch. The art is in PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28). **The scene build needs BOTH.** See [§6 branching](#6-environment-branching-how-to-run).

---

## 3. What this spec builds — Phase 1 build order

These layers build on the **current flat-green placeholder** ([`GardenScene.tsx:90`](../../../src/components/garden/GardenScene.tsx) `backgroundColor: LAWN`). None needs new art.

**First, note what's already handled (no build):** the moment PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28)'s transparent art is present, the **flowers (with their built-in stems) and the doghouse render correctly** — same filenames, so the [`flowerAssets.ts`](../../../src/constants/flowerAssets.ts) static `require()` map needs **no code change**. The delivered flower PNGs **include stems + leaves** (verified — [§4.1](#41-flower-stems)), so the earlier "blooms float → build code stems" item is **obsolete**.

Build order (biggest visual jump first):

| # | Layer | Why | New art? | Detail |
| --- | --- | --- | --- | --- |
| 1 | **Doghouse grounding** (contact shadow + dog-name sign) | The doghouse is now transparent (PR #28) so the shadow reads; grounds the hero | none | [§4.2](#42-doghouse-grounding) |
| 2 | **Clouds + interim sky gradient** | Atmosphere + life; clouds need a sky to read against | none (clouds committed) | [§4.3](#43-clouds--interim-sky) |
| 3 | **Biscuit bob** | The mascot is a focal character; gentle bob = life | none (code placeholder) | [§4.4](#44-biscuit-mascot-bob) |
| 4 | **Butterfly** | Final ambient touch | none (code SVG) | [§4.5](#45-butterfly) |

**Deferred to Phase 2 (one swap, behind all of the above):** the baked watercolor ground PNG — [§5](#5-phase-2--the-baked-ground-deferred).

---

## 4. Phase-1 per-layer build spec

For each: **mockup ref → current state → RN build → animation/a11y.** Full palette is in the visual-build spec [§8](2026-06-24-journey-hero-visual-build.md) and the 2026-06-23 spec [§6](2026-06-23-journey-garden-hero-design.md) — **do not eyeball colors; copy from there.** Current scene file: [`src/components/garden/GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) (in the PR #26 worktree). Its tunable geometry constants are at lines 11–24; render tree: root View (90), soil bed (92–102), doghouse (104–116), blooms (118–131), a11y day-markers (133–142), today marker (144–158).

### 4.1 Flower stems — ALREADY IN THE ART (no build needed)
The delivered flower PNGs ([`assets/garden/flowers/`](../../../assets/garden/), PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28)) **include stems + leaves** — verified by alpha profile: content tapers from a wide bloom to a narrow stem at the base (`joyful-tier1` band widths top→bottom `0.92 → 0.4 → 0.12 → 0.02`; `calm-tier1` `0.9 → 0.32 → 0.19 → 0.02`). Each bloom is rendered bottom-anchored at `(b.x, b.y)` ([`GardenScene.tsx:118–131`](../../../src/components/garden/GardenScene.tsx), where `top: b.y - h`, `left: b.x - b.size/2`, so `(b.x, b.y)` is the bloom's bottom-center on the soil), so the art's own stem reads as planted.
- **Therefore the earlier "render code stems behind each bloom" item ([visual-build §7.7](2026-06-24-journey-hero-visual-build.md)) is OBSOLETE — do NOT build code stems.**
- **Only if** on-device QA shows the dense clusters still look floaty: build them as [visual-build §7.7](2026-06-24-journey-hero-visual-build.md) describes — a pure geometry helper (`stemH ≈ px*0.62`, `stemW ≈ px*0.055`, mockup line 1239) + an [`expo-linear-gradient`](../../../package.json) `#6f8a48→#54703a` stem behind each `<Flower>`, decorative (`accessibilityElementsHidden`), TDD. Otherwise skip this entirely.

### 4.2 Doghouse grounding
- **Mockup:** `.doghouse-slot` line 111; name shows when `.live` line 129; grounding fix = a **tight, dark contact shadow** `rgba(46,32,18,0.32)` tucked at the base (NOT a big soft far oval) — spec [`2026-06-23 §9.1`](2026-06-23-journey-garden-hero-design.md); shadow color also cited in visual-build spec [§8](2026-06-24-journey-hero-visual-build.md) (mockup line 883).
- **Current:** plain transparent PNG at [`GardenScene.tsx:104–116`](../../../src/components/garden/GardenScene.tsx) (`source={SCENE_ASSETS.doghouse}`, `top: height*0.06`, `left: (0.5 - DOGHOUSE_W/2)*width`, `width: DOGHOUSE_W*width` where `DOGHOUSE_W = 0.4` line 20, `height: height*0.3`). No shadow, no name.
- **Build:**
  1. **Contact-shadow ellipse** — a tight dark ellipse (`rgba(46,32,18,0.32)`) just under the doghouse base, rendered *behind* the doghouse `<Image>`. A `View` with `borderRadius` or a `react-native-svg` `<Ellipse>`.
  2. **Dog-name sign** — overlay the **dog's name** on the sign. The name is NOT currently passed in: **extend the `GardenScene` prop contract** (currently `{ week, width, height }` at [`GardenScene.tsx:26–30`](../../../src/components/garden/GardenScene.tsx)) to add `dogName: string`, and pass it from [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) (the selected dog is available there — visual-build spec [§7.9](2026-06-24-journey-hero-visual-build.md)). Position the name text over the sign region of the PNG (measure the sign rect with PIL on `assets/garden/puplog-doghouse.png` — hazard H12, [`HANDOFF.md` §13](../../../HANDOFF.md)).
- **a11y:** shadow decorative. The name is already announced elsewhere (header dog chip), so keep the scene's name overlay `accessibilityElementsHidden` to avoid VoiceOver duplication (visual-build spec [§12](2026-06-24-journey-hero-visual-build.md)).

### 4.3 Clouds + interim sky
- **Clouds — mockup:** `.cloud` lines 84–92 (3 divs, each own size/dur/opacity/phase). **Assets committed** (PR #28, verified transparent): `assets/garden/puplog-cloud-1.png` (460×248), `-cloud-2.png` (600×161), `-cloud-3.png` (380×268). Per-cloud params from [`2026-06-23 §9.4`](2026-06-23-journey-garden-hero-design.md): c1 top84 / w122 / 75s; c2 top152 / w152 / op0.6 / 120s; c3 top112 / w74 / op0.72 / 96s; **negative delays** spread them out.
- **Clouds — build:** 3 `<Animated.Image>` drifting on X via [`react-native-reanimated`](../../../package.json) (`~4.1.1`, installed) `withRepeat(withTiming(translateX, { duration, easing: linear }), -1)`. **No springs** (owner pref — visual-build spec [§9](2026-06-24-journey-hero-visual-build.md)). **Gate behind `useReducedMotion()`** and **pause when the tab is unfocused** — [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) already uses `useFocusEffect`; precedent hook [`src/hooks/useTabFocusAnimation.ts`](../../../src/hooks/useTabFocusAnimation.ts). Model: the existing reduced-motion-safe loop in [`src/components/onboarding/BiscuitMascot.tsx:38–57`](../../../src/components/onboarding/BiscuitMascot.tsx) (uses `useReducedMotion`, `withRepeat`, `withSequence`, `withDelay`).
- **Interim sky — mockup:** sky gradient line 62 (`linear-gradient(180deg, #b3d9ed 0%, #bcdfef 33%, #b7d49d 42%, #aec59a 100%)`). Replace `backgroundColor: LAWN` ([`GardenScene.tsx:90`](../../../src/components/garden/GardenScene.tsx), `LAWN = '#bcd2a3'` line 23) with an [`expo-linear-gradient`](../../../package.json) vertical gradient so the clouds read. **This is interim** — the Phase-2 baked ground will own the real sky (visual-build spec [§7.1](2026-06-24-journey-hero-visual-build.md)). Keep it cheap; it's throwaway.
- **a11y:** clouds + sky decorative (`accessibilityElementsHidden`).
- **jest:** the reanimated mock is in [`jest.setup.js`](../../../jest.setup.js) (has `withSequence`; add `withRepeat`/`withDelay`/`withTiming` mocks there if a new test needs them — visual-build spec [§9](2026-06-24-journey-hero-visual-build.md)).

### 4.4 Biscuit mascot bob
- **Mockup:** `.biscuit-slot` line 131, art slot line 888. Final mascot art is a **separate track** ([`2026-06-23 §9.2`](2026-06-23-journey-garden-hero-design.md)).
- **Current placeholder:** [`src/components/onboarding/BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx) — a code-drawn corgi (ears + body `View`s, `OB_COLORS.peach2`) that already does a reduced-motion-safe **wag** (rotate) via reanimated.
- **Build:** mount `BiscuitMascot` in the scene positioned per the mockup, and add a gentle **bob** (vertical `translateY` via `withRepeat(withTiming(...))`, reduced-motion-gated + focus-paused). The existing wag is rotate; the bob is a new `translateY` loop (add a `bob` prop or a sibling animated wrapper). Swap the code corgi for the **watercolor Biscuit PNG** when the user generates it ([§7](#7-remaining-gemini-art-inventory)).
- **a11y:** decorative — `BiscuitMascot` already sets `accessibilityElementsHidden` ([`BiscuitMascot.tsx:67`](../../../src/components/onboarding/BiscuitMascot.tsx)).

### 4.5 Butterfly
- **Mockup:** `.butterfly` line 141; drift + **flapping wings** ([`2026-06-23 §9.3`](2026-06-23-journey-garden-hero-design.md) — SMIL in the mockup → reanimated in RN).
- **Build:** a small butterfly as a `react-native-svg` ([`react-native-svg 15.12.1`](../../../package.json), installed) shape (two wing paths) — **no art needed**. Drift across a path + flap the wings (scaleX on each wing) via reanimated, reduced-motion-gated + focus-paused.
- **a11y:** decorative (`accessibilityElementsHidden`).

---

## 5. Phase 2 — the baked ground (deferred)

**One watercolor PNG** containing every **static, painted** layer, back→front: sky → sun glow (top-right) → far hill → meadow (mottled/uneven terrain) → dirt path + stepping stones → garden-bed soil → ambient grass detail (tufts, wildflowers, clover, pebbles, **mushrooms**). Palette + mockup line refs: visual-build spec [§7.1, §7.4–7.6, §7.8, §8](2026-06-24-journey-hero-visual-build.md) and [`2026-06-23 §5–§8`](2026-06-23-journey-garden-hero-design.md).

**Leave OUT** of the PNG (they layer on top / move): ❌ doghouse, ❌ flowers, ❌ clouds, ❌ Biscuit, ❌ butterfly.

**Swap-in:** replace the `LAWN` background / interim sky gradient ([`GardenScene.tsx:90`](../../../src/components/garden/GardenScene.tsx)) and remove the placeholder `SOIL` ellipse (lines 92–102) with one `<Image>` behind everything. **Critical alignment:** the soil in the art must land under `BED = { x: 0.1, y: 0.46, width: 0.8, height: 0.42 }` ([`GardenScene.tsx:19`](../../../src/components/garden/GardenScene.tsx)) or the flower scatter floats off the soil — keep the `BED` rect aligned to wherever the art puts the bed (visual-build spec [§7.4–7.6](2026-06-24-journey-hero-visual-build.md)).

**Open sub-decisions for Phase 2 (resolve with the user when generating):**
- **Dimensions + safe zones** — read the actual `GardenScene` box (the `width`/`height` props from [`index.tsx`](../../../app/(tabs)/index.tsx)) and generate at ~2× with the bed/path/doghouse-spot inside a safe zone.
- **Aspect-ratio across phones (SE → Max)** — cover-fit + safe zones, or a couple of exports (visual-build spec [§6 Option B cons](2026-06-24-journey-hero-visual-build.md), open decision [§14.4](2026-06-24-journey-hero-visual-build.md)).
- **Prompt** — the scene-kit guide [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md) does **not yet** have a baked-ground prompt (visual-build spec [§10 TODO](2026-06-24-journey-hero-visual-build.md)). Write one (house style, palette from the mockup) before the user generates.

---

## 6. Environment, branching, how to run

| Thing | Value / reference |
| --- | --- |
| **GitHub repo (active)** | `https://github.com/RohitS199/dog-app-v2.git` (remote `origin`) — [`CLAUDE.md:5`](../../../CLAUDE.md) |
| `origin/main` HEAD | `feedafa` (after docs PR #27 merged) |
| **Garden code PR** | [#26](https://github.com/RohitS199/dog-app-v2/pull/26) — `feature/journey-garden-hero`, HEAD `1a7b75f` (awaits iPhone QA) |
| **Art PR** | [#28](https://github.com/RohitS199/dog-app-v2/pull/28) — `assets/garden-art` (off `feedafa`) |
| Supabase project | `https://wwuwosuysoxihtbykwgh.supabase.co` |
| Worktree (kept) | `.worktrees/journey-garden-hero` → `feature/journey-garden-hero`. **Each worktree needs `cp <main>/.env <worktree>/.env`** or the app won't boot (`supabaseUrl is required`) — [`HANDOFF.md` H1/H2](../../../HANDOFF.md). |
| Stack | Expo SDK 54, RN 0.81 (New Arch), TS strict, Expo Router v6, Zustand v5. **Installed & relevant:** `expo-linear-gradient ~15.0.8`, `react-native-svg 15.12.1`, `react-native-reanimated ~4.1.1`, `react-native-worklets ^0.5.1` (all verified in [`package.json`](../../../package.json)). |

**Branching (important — the code + art are on two unmerged branches):** the scene build edits [`GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) (in PR #26) and consumes the art (PR #28). **Recommended:** after the user's iPhone QA, **merge #28 then #26** to `origin/main`, then branch the scene build off `origin/main` (clean — has both code + art). If building before merge: branch off `feature/journey-garden-hero` and bring the art assets in from `assets/garden-art` (PR #28). **Never branch off / pull local `main`** — it carries unrelated onboarding WIP ([`HANDOFF.md` §4](../../../HANDOFF.md)). One worktree per bundle (`superpowers:using-git-worktrees`), PR to `origin`.

**Run the mockup (no build):** `cd /Users/rohitsandur/Documents/Projects/dog_app_ui && python3 -m http.server 8088` → `http://localhost:8088/preview-journey-hero-final-week.html`. **Hard-refresh** after edits; animations run only in a **foreground** tab. Launch config: [`.claude/launch.json`](../../../.claude/launch.json).

**Run the RN app (device QA):** `cd .worktrees/journey-garden-hero && npx expo start -c --dev-client`, scan the QR → the user's PupLog **dev client** (NOT Expo Go — native modules present). `-c` matters when assets change (Metro caches the asset registry — [`HANDOFF.md` H13](../../../HANDOFF.md)). **The agent environment CANNOT screenshot the RN app** ([`HANDOFF.md` H12](../../../HANDOFF.md)) — verify via PIL composites + `npx expo export --platform ios`; the **user QAs on device**. Seed data is live (4 dogs, current week).

---

## 7. Remaining Gemini art inventory

| Asset | Need | Notes |
| --- | --- | --- |
| **Baked watercolor ground PNG** | 🎯 **Required** (Phase 2) | The one piece that makes the scene "snap in" — [§5](#5-phase-2--the-baked-ground-deferred). Whole static painted world, minus the moving/changing layers. |
| **Biscuit the corgi** (watercolor, transparent) | 💡 **Recommended** | Replaces the code placeholder [`BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx) so the mascot matches the watercolor style. Phase-1 ships with the placeholder; swap when ready. |
| **Butterfly** | Optional | [§4.5](#45-butterfly) builds it in code (`react-native-svg`); a painted sprite is a nice-to-have. |

**Pipeline (when art arrives):** verify transparency + dims, **autocrop + downscale** with PIL (`python3` + PIL local; recipe in visual-build spec [§10](2026-06-24-journey-hero-visual-build.md) / `2026-06-23 §14.3`), drop into [`assets/garden/`](../../../assets/garden/) with the canonical name, `npx expo start -c`. **Background-removal + downscale is the ONLY allowed post-processing — do not hand-beautify** (memory `feedback_sticker_artwork_is_drop_in.md`, [`HANDOFF.md` §11](../../../HANDOFF.md)). Asset map: [`assets/garden/README.md`](../../../assets/garden/README.md). Metro requires **static `require()`** — keep the [`flowerAssets.ts`](../../../src/constants/flowerAssets.ts) map; no template-literal requires (memory `feedback_rn_metro_static_require.md`).

---

## 8. Verification & guardrails

**Verification** (`superpowers:verification-before-completion` before any "done" — visual-build spec [§13](2026-06-24-journey-hero-visual-build.md)):
- `npm test` — show the count vs the **573 / 68-suite** baseline at HEAD `1a7b75f`; new pure helpers (stem geometry, etc.) get TDD tests.
- Filtered `tsc` — expect 0 (filter excludes `@expo/vector-icons`, `app/(tabs)/index.tsx`, `app/(tabs)/learn.tsx` — visual-build spec [§11](2026-06-24-journey-hero-visual-build.md)).
- `npx expo export --platform ios` — clean bundle.
- **The agent cannot screenshot the RN app** ([`HANDOFF.md` H12](../../../HANDOFF.md)) — verify composition via PIL composites + the Metro export; **the user QAs layout/animation on device.** The `GardenScene` geometry constants ([`GardenScene.tsx:11–24`](../../../src/components/garden/GardenScene.tsx)) are tunable on-device — iterate with the user.

**Golden Rule & a11y (do not regress — visual-build spec [§12](2026-06-24-journey-hero-visual-build.md), [`CLAUDE.md`](../../../CLAUDE.md)):**
> **Never let a dog owner walk away from a genuine emergency thinking they can wait.**
- Keep the always-on **Emergency surface** (`EmergencyChip` on the hero, Emergency link in `LogSheet`, both → [`app/emergency.tsx`](../../../app/emergency.tsx)). Scene work must not cover/remove them.
- **Preserve the `GardenScene` a11y model** ([`GardenScene.tsx:118–158`](../../../src/components/garden/GardenScene.tsx)): blooms hidden from VoiceOver, **one accessible marker per planted day**, today marker, never "missed" for empty days. **Every new scene sprite (stem, shadow, cloud, mascot, butterfly) must be `accessibilityElementsHidden` / decorative** so it adds no VoiceOver noise. Use `accessibility-compliance`.
- Urgency "monitor" = teal `#00897B`, **never green** — keep garden greens distinct from the urgency palette ([`CLAUDE.md`](../../../CLAUDE.md)).
- Keep the 5 legal components untouched ([`src/components/legal/`](../../../src/components/legal/)).

---

## 9. SKILLS — MANDATORY (read again — load-bearing)

**Per the user's explicit, repeated instruction and [`CLAUDE.md`](../../../CLAUDE.md) + [`HANDOFF.md` §14](../../../HANDOFF.md): every Claude instance MUST use skills. Three avenues, in order (this repeats [§0](#0--mandatory-every-session-use-skills--always-existing--new--found-online)).**

### 9.1 Use the skills we already have (invoke BEFORE acting)
| Skill | Use it for |
| --- | --- |
| `superpowers:brainstorming` | Before any new design decision (e.g. the Phase-2 ground prompt, the greeting source). |
| `superpowers:writing-plans` | The plan for this spec: [`docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md`](../plans/2026-06-26-journey-hero-scene-build.md). |
| `superpowers:test-driven-development` | Every pure helper (stem geometry, cloud params, bob/butterfly math). |
| `superpowers:using-git-worktrees` | Branch off `origin/main` (or `feature/journey-garden-hero`) — never local `main`. |
| `superpowers:subagent-driven-development` / `executing-plans` | Execute the plan (drove the M1+M2 garden build well). |
| `react-native-architecture` + `react-native-best-practices` | The scene build, `Image`/SVG layering, reanimated loops, **FPS** (the main risk: many layers + ~40 images + idle loops). |
| `accessibility-compliance` | **Every new surface** (keep the §8 a11y model; decorative sprites). |
| `anthropic-sdk` | If the greeting goes AI (latest Claude models). |
| `superpowers:verification-before-completion` | **Before** claiming done. |
| `superpowers:requesting-code-review` / `receiving-code-review` / `finishing-a-development-branch` | Review + merge. |
| `find-skills` | Search the ecosystem. |

### 9.2 Create a new skill when a workflow recurs
`superpowers:writing-skills` or `anthropic-skills:skill-creator`. Standing candidates ([`HANDOFF.md` §14](../../../HANDOFF.md), visual-build spec [§15.2](2026-06-24-journey-hero-visual-build.md)): **`raster-asset-to-rn`** (PIL background-removal + downscale + nine-patch measure — just exercised heavily on the 24 flowers + doghouse, recurs for the ground + Biscuit), **`gemini-asset-intake`** (identify dropped art → map to slot names → verify), **`rn-watercolor-scene`** (porting an HTML/SVG painted scene to performant RN — recurs across Journey/My Dogs/Discovery), **`puplog-mockup-conventions`**.

### 9.3 Go find a skill online
Unfamiliar domain (RN watercolor scenes, `react-native-svg` performance, flower-growth/bloom animation, parallax/idle-loop FPS)? **Search the market first:**
```bash
npx skills find "<query>"                 # search the ecosystem
npx skills add <owner/repo@skill> -g -y   # install (global)
```
Browse **https://skills.sh/trending**. **Only install reputable, well-reviewed, reliable skills** (strong install counts/reviews; verify before trusting).

**Bottom line: do not start domain work without a skill. Use one, make one, or find one — always.**

---

## 10. Full reference index

**This doc:** `docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md`.
**Implementation plan (next step):** [`docs/superpowers/plans/2026-06-26-journey-hero-scene-build.md`](../plans/2026-06-26-journey-hero-scene-build.md).
**Companion specs/plan:** ⭐ [`2026-06-24-journey-hero-visual-build.md`](2026-06-24-journey-hero-visual-build.md) (RN build plan — per-layer §7, palette §8, animation §9, asset pipeline §10), ⭐ [`2026-06-23-journey-garden-hero-design.md`](2026-06-23-journey-garden-hero-design.md) (visual truth), [`2026-06-20-journey-tab-hero-design.md`](2026-06-20-journey-tab-hero-design.md) (pre-mockup), plan [`2026-06-20-journey-tab-hero.md`](../plans/2026-06-20-journey-tab-hero.md).
**Mockups (root):** ⭐ [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) (visual truth), [`preview-journey-hero-option-a-v2.html`](../../../preview-journey-hero-option-a-v2.html) (log-sheet UX). Server: [`.claude/launch.json`](../../../.claude/launch.json) `:8088`.
**Code (built — PR #26 branch):** [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx), [`src/components/garden/`](../../../src/components/garden/) (`GardenScene`/`Flower`/`LogSheet`/`TierMeter`/`PlantCelebration`/`EmergencyChip`/`GardenGreeting`), [`src/stores/gardenStore.ts`](../../../src/stores/gardenStore.ts), [`src/lib/{flowerTier,gardenPlacement,gardenWeek}.ts`](../../../src/lib/), [`src/constants/{gardenMoods,flowerAssets}.ts`](../../../src/constants/), [`src/components/onboarding/BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx), [`src/hooks/useTabFocusAnimation.ts`](../../../src/hooks/useTabFocusAnimation.ts), [`jest.setup.js`](../../../jest.setup.js).
**Assets:** [`assets/garden/`](../../../assets/garden/) — 24 flowers + doghouse + 3 clouds (transparent + downscaled, PR #28); baked ground MISSING. [`assets/garden/README.md`](../../../assets/garden/README.md).
**Prompt guides:** [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md) (no baked-ground prompt yet), [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md), `~/Downloads/puplog_flower_prompts_v2 (1).md`.
**Bibles:** [`CLAUDE.md`](../../../CLAUDE.md), [`HANDOFF.md`](../../../HANDOFF.md), [`DOCUMENTATION.md`](../../../DOCUMENTATION.md).
**Repos/services:** GitHub `https://github.com/RohitS199/dog-app-v2.git` (PRs [#26](https://github.com/RohitS199/dog-app-v2/pull/26), [#28](https://github.com/RohitS199/dog-app-v2/pull/28)); Supabase `https://wwuwosuysoxihtbykwgh.supabase.co`; skills marketplace `https://skills.sh/trending`.
**Memory pointers:** `project_journey_garden_build.md`, `project_journey_hero_pitch.md`, `project_flower_garden_system.md`, `project_no_streaks.md`, `feedback_rn_metro_static_require.md`, `feedback_sticker_artwork_is_drop_in.md`.

**Git note:** the Journey docs/mockups were committed via PR [#27](https://github.com/RohitS199/dog-app-v2/pull/27) (merged); the art via PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28). This spec + its plan should be committed too (they travel with the design thread). Always `cp .env` into any new worktree.

---

*End of spec. Re-read [§0](#0--mandatory-every-session-use-skills--always-existing--new--found-online) and [§9](#9-skills--mandatory-read-again): use skills — existing, new, or found online — ALWAYS. §6 ground strategy is RESOLVED (Option B baked PNG); build the Phase-1 no-art layers first ([§3](#3-what-this-spec-builds--phase-1-build-order)).*
