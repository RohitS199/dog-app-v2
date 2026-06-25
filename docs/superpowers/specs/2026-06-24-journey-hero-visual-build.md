# Journey Hero — Visual Build Spec & Handoff (2026-06-24)

**Status:** The Journey garden's **logic/plumbing is built, reviewed, and merge-ready** (PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26), branch `feature/journey-garden-hero`, HEAD `1a7b75f`). The **painted scene is NOT built** — the on-device hero is the working mechanic on a flat-green placeholder, not the [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) watercolor world. **This document specs the remaining visual build** to close that gap.
**Author:** Claude (Opus 4.8), 2026-06-24 session.
**For:** The next Claude instance (possibly a different machine / cloud session). Read this top-to-bottom, then the files it references.
**Companion docs (read both):** the authoritative *visual* description is [`docs/superpowers/specs/2026-06-23-journey-garden-hero-design.md`](2026-06-23-journey-garden-hero-design.md) (mockup palette/layering/scatter, fully line-referenced) — **this doc does not re-derive it; it points at it and adds the RN BUILD plan + current-state delta + the one open strategic decision.** The task plan is [`docs/superpowers/plans/2026-06-20-journey-tab-hero.md`](../plans/2026-06-20-journey-tab-hero.md). Live handoff bible: [`HANDOFF.md`](../../../HANDOFF.md).

---

## 0. ⚠️ MANDATORY FOR EVERY CLAUDE INSTANCE: USE SKILLS — ALWAYS

**Non-negotiable, every session that touches this work.** Before starting ANY task here you MUST:

1. **Use the skills we already have.** Invoke the relevant skill *before* acting (full table in §15). At minimum: `superpowers:brainstorming` before design work, `superpowers:writing-plans` before coding, `superpowers:test-driven-development` while coding any logic/helper, `react-native-architecture` + `react-native-best-practices` for the scene/SVG/animation build (perf is load-bearing — many layers + ~40 images + idle loops), `accessibility-compliance` for every surface, `superpowers:using-git-worktrees` for isolation, and `superpowers:verification-before-completion` before claiming anything done.
2. **Create a new skill** when a workflow recurs and no skill covers it (`superpowers:writing-skills` or `anthropic-skills:skill-creator`). Candidate skills are listed in §15.
3. **Go find a skill online** when you hit an unfamiliar domain (e.g. RN watercolor scenes, react-native-svg performance, flower-growth animation): `npx skills find "<query>"`, browse **https://skills.sh/trending**, and install **reputable, well-reviewed, reliable** ones (prefer 1K+ installs / strong reviews) with `npx skills add <owner/repo@skill> -g -y`. Verify before trusting.

Do not "wing it." If a skill exists or could exist for what you're doing, **use one, make one, or find one — always.** This is repeated in full in **§15** (read it again there). Sources for this policy: project [`CLAUDE.md`](../../../CLAUDE.md) "Skills — Always Use" + [`HANDOFF.md`](../../../HANDOFF.md) §14 + the user's explicit, repeated instruction (2026-06-23 and 2026-06-24 sessions).

---

## 1. What is built vs. what this doc covers

**Built (the plumbing — do NOT rebuild; it's reviewed + green):**
- Data model `garden_logs` (migration [`supabase/migrations/20260624034713_create_garden_logs.sql`](../../../supabase/migrations/20260624034713_create_garden_logs.sql), applied live), store [`src/stores/gardenStore.ts`](../../../src/stores/gardenStore.ts) (read week + `plantFlower` write path), pure helpers [`src/lib/flowerTier.ts`](../../../src/lib/flowerTier.ts) / [`gardenPlacement.ts`](../../../src/lib/gardenPlacement.ts) / [`gardenWeek.ts`](../../../src/lib/gardenWeek.ts), constants [`src/constants/gardenMoods.ts`](../../../src/constants/gardenMoods.ts) / [`flowerAssets.ts`](../../../src/constants/flowerAssets.ts).
- Screen [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) + components [`src/components/garden/`](../../../src/components/garden/) (`GardenScene`, `Flower`, `LogSheet`, `TierMeter`, `PlantCelebration`, `EmergencyChip`, `GardenGreeting`).
- 68 test suites / 573 tests green, filtered `tsc` 0, iOS Metro export clean. Two-agent code review: 0 Critical, 0 safety regressions (see [`HANDOFF.md`](../../../HANDOFF.md) / the project memory `project_journey_garden_build.md` for the review + fixes).

**NOT built (this doc) — the painted scene.** The current [`GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) renders only: a flat-green `View` (`LAWN = '#bcd2a3'`, line 23 / 90), a brown soil ellipse (`SOIL = '#9d7b54'`, line 24 / 99), the doghouse PNG (line 105), and the flower clusters (line 118). **Everything else in the mockup is missing** — see the gap table in §3.

---

## 2. Repository, environment, how to run

| Thing | Value / reference |
| --- | --- |
| **GitHub repo (active)** | `https://github.com/RohitS199/dog-app-v2.git` (remote `origin`) — [`CLAUDE.md:5`](../../../CLAUDE.md) |
| **PR** | [#26](https://github.com/RohitS199/dog-app-v2/pull/26) — full garden build (M1+M2), branch `feature/journey-garden-hero`, HEAD `1a7b75f` |
| Supabase project | `https://wwuwosuysoxihtbykwgh.supabase.co` |
| Worktree (kept) | `/.worktrees/journey-garden-hero` (branched off `origin/main`). Has `.env` + a copy of `assets/garden/` + symlinked `node_modules`. **Each new worktree needs `cp <main>/.env <worktree>/.env`** or the app won't boot (`supabaseUrl is required`) — [`HANDOFF.md`](../../../HANDOFF.md) H1/H2. |
| Stack | Expo SDK 54, RN 0.81 (New Arch), TS strict, Expo Router v6, Zustand v5, **react-native-svg 15.12.1** (installed — enables the SVG-port option in §6), **react-native-reanimated ~4.1.1**, Jest 29 + RNTL — [`CLAUDE.md`](../../../CLAUDE.md) "Tech Stack" |

**Run the mockup (no build):** `cd /Users/rohitsandur/Documents/Projects/dog_app_ui && python3 -m http.server 8088` → open `http://localhost:8088/preview-journey-hero-final-week.html`. **Hard-refresh** after edits. Animations run only in a **foreground** tab. Launch config: [`.claude/launch.json`](../../../.claude/launch.json) (`mockup-preview`).

**Run the RN app (device QA):** `cd .worktrees/journey-garden-hero && npx expo start -c --dev-client`, scan the QR with the iPhone Camera → opens the user's PupLog **dev client** (NOT Expo Go — `react-native-purchases` + `expo-superwall` are native modules). `-c` matters when new assets are added (Metro caches the asset registry — [`HANDOFF.md`](../../../HANDOFF.md) H13). **The agent environment CANNOT screenshot the RN app** ([`HANDOFF.md`](../../../HANDOFF.md) H12) — verify layout via PIL composites + Metro export (`npx expo export --platform ios`) and let the user QA on device. **Seed data is live** (4 dogs, current week) so the garden shows populated; removal SQL is in `project_journey_garden_build.md`.

**Workflow discipline:** branch every feature off `origin/main` (never local `main`, which carries unrelated WIP — [`HANDOFF.md`](../../../HANDOFF.md) §4), one worktree per bundle (`superpowers:using-git-worktrees`), PR to `origin`.

---

## 3. THE GAP — current hero vs. the mockup

Reference: scene layering in [`2026-06-23 spec §5`](2026-06-23-journey-garden-hero-design.md) and the mockup [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) (line numbers below are in that file).

| Mockup layer | Mockup ref | On screen now? | Build owner |
| --- | --- | --- | --- |
| Sky→horizon gradient (blue→green, distinct horizon ~31–42%) | line 62 | ❌ flat green `LAWN` | **build (CSS→RN gradient or baked PNG)** |
| 3 drifting watercolor **clouds** | `.cloud` line 84–92; assets exist (§10) | ❌ | **build (reanimated drift; PNGs exist)** |
| **Sun** glow (radial, top-right) | `.sun` line 71 | ❌ | build (RN radial gradient) |
| **Far hill** (cooler wash, horizon shape) | line 687–688 | ❌ | ground (§6) |
| **Meadow** gradient + mottles + uneven terrain | `meadowGrad` line 675; path line 690 | ❌ | ground (§6) |
| **Dirt path** (doghouse→bed) + stepping stones + dirt | line 688; stones ~715 | ❌ | ground (§6) |
| **Garden bed**: soil + scattered dirt flecks | `bedGrad` line 680; ellipse line 750 | ⚠️ crude `SOIL` ellipse | ground (§6) + dirt scatter |
| Flower **stems** (green gradient, behind each bloom) | `renderFlower` line 1233; `stemH=px*0.62` line 1239 | ❌ floating tiles | **build (per-bloom stem element)** |
| Ambient: **grass tufts, wildflowers, clover, pebbles, mushrooms** | tufts line 797; wildflowers/clover line 835; pebbles/mushrooms line 850 | ❌ | ground (§6) or sprites |
| **Doghouse** grounded: name sign + tight contact shadow | `.doghouse-slot` line 111; name line 129; shadow [`2026-06-23 §9.1`](2026-06-23-journey-garden-hero-design.md) | ⚠️ plain PNG, no shadow/sign | **build (shadow + name overlay)** |
| **Biscuit mascot** (bobbing corgi) | `.biscuit-slot` line 131; art slot line 888; placeholder [`BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx) | ❌ | **build (mount + bob)** |
| **Butterfly** (drift + flapping wings) | `.butterfly` line 141; [`2026-06-23 §9.3`](2026-06-23-journey-garden-hero-design.md) | ❌ | build (reanimated) |
| **Speech bubble** | `.bubble` line 158–159 | ❌ | build (optional) |
| Real **watercolor flowers** (transparent, with stems) | flowers [`2026-06-23 §11.1`](2026-06-23-journey-garden-hero-design.md) | ❌ boxy **white-bg** tiles | **ART (§10) — biggest visual lever** |
| Flower **cluster scatter** (the core mechanic) | `scatterFlowers()` line 1289; `BLOOMS_BY_TIER` line 1279 | ✅ **working** ([`GardenScene.tsx:56–84`](../../../src/components/garden/GardenScene.tsx)) | done |

**Two buckets:** (a) **Art assets** I/next-Claude cannot generate (no image-gen) — the **baked watercolor ground PNG** and the **transparent flower PNGs** — the user produces these in Gemini/Figma (§10). (b) **Buildable in RN now** — clouds, sun, stems, doghouse grounding, mascot, butterfly, greeting/bubble, composition tuning.

---

## 4. The mockup = the visual source of truth

**[`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html)** (project root, untracked — §16 git note). When this spec and the mockup disagree on a number, **the mockup wins** — read it. The painted ground is one SVG (`viewBox="0 0 390 844"`) starting line ~664; the doghouse/Biscuit/butterfly/flowers/clouds are HTML layers above it. The interactive **log-sheet** reference (already ported to RN as `LogSheet`) is [`preview-journey-hero-option-a-v2.html`](../../../preview-journey-hero-option-a-v2.html) (stale scene styling — ignore its scene).

> **RN build constraint (load-bearing):** the mockup paints the ground with **live `feTurbulence`** (`#wob`/`#wob2` filters; noise bg at line 49). **Do NOT ship live `feTurbulence` in RN** (perf) — [`2026-06-23 §5`](2026-06-23-journey-garden-hero-design.md). Either bake the wobble into a PNG (§6 Option B) or drop it / approximate with static texture in an SVG port (§6 Option A). Use `react-native-best-practices` for the FPS budget.

---

## 5. Scene architecture & layering (z-order, back→front)

Mirror the mockup's stack ([`2026-06-23 §5`](2026-06-23-journey-garden-hero-design.md)). In RN, `GardenScene` is an absolutely-positioned layer cake inside the `width × height` box ([`GardenScene.tsx:90`](../../../src/components/garden/GardenScene.tsx)):

1. **Sky** (phone-frame bg gradient, §8) → 2. **Clouds** (drifting PNGs) → 3. **Sun** (radial glow) → 4. **Far hill** → 5. **Meadow** (+ mottles/terrain) → 6. **Dirt path** (+ stones/dirt) → 7. **Garden bed** (soil + dirt + the flower **cluster scatter with stems**) → 8. **Ambient grass detail** (tufts/wildflowers/clover/pebbles/mushrooms) → 9. **Foreground grass tufts** (bottom corners) → 10. **Diegetic** (doghouse + name + shadow, Biscuit bob, butterfly, speech bubble) → 11. **Chrome** (header dog chip + EmergencyChip, greeting, CTA, tab bar — already built in [`index.tsx`](../../../app/(tabs)/index.tsx)).

Layers **1–9** are "the ground/scene" → see the strategic decision in §6. Layers **2, 3, 10** are dynamic/animated and built on top regardless of the §6 choice. Layer **7's flower scatter is already implemented** ([`GardenScene.tsx:56–131`](../../../src/components/garden/GardenScene.tsx)) — only **stems** (§7.7) and real flower art (§10) are missing from it.

---

## 6. ⚠️ STRATEGIC DECISION (resolve first — `superpowers:brainstorming` before building)

**How to build the painted ground (layers 1, 4–9).** The user was presented this fork (2026-06-24) and chose "write the spec" rather than picking — **so the next session must decide with the user.** Two options, both honest:

**Option A — Port the mockup's scene to React Native SVG.** `react-native-svg@15.12.1` is installed. Recreate sky/hill/meadow/path/bed/grass/wildflowers/mushrooms as RN `<Svg>` paths/gradients ported from the mockup's SVG (lines ~664–880), **dropping `feTurbulence`** (approximate the watercolor wobble with static texture overlays or accept clean edges).
- *Pros:* no art dependency for the ground; resolution-independent; tunable in code; lands SOON.
- *Cons:* large porting effort (hundreds of SVG elements); must watch FPS (`react-native-best-practices`; consider flattening static layers to a single cached SVG or a one-time rasterization); won't have the true watercolor texture without art.

**Option B — Baked watercolor ground PNG (the [`2026-06-23 spec`](2026-06-23-journey-garden-hero-design.md) plan).** The user generates ONE PNG (sky+hill+meadow+path+bed+grass+mushrooms baked in, §10) in Gemini/Figma; drop it behind the dynamic layers (replace the `LAWN` View at [`GardenScene.tsx:90`](../../../src/components/garden/GardenScene.tsx)).
- *Pros:* far less code; best texture fidelity; cheap to render; the look "jumps" the moment the asset lands.
- *Cons:* blocked on the user producing art; one fixed aspect ratio (need a strategy for SE→Max — e.g. cover-fit + safe zones, or per-bucket exports).

**Hybrid (recommended starting point, but confirm):** build the **dynamic layers now** (clouds, sun, stems, doghouse grounding, mascot, butterfly — §7, no art needed) to get a big jump immediately, AND in parallel get the **baked ground PNG** (Option B) for the painted base; fall back to an **Option-A SVG sky/hill/meadow** if the art stalls. Decide with the user; record the decision in [`HANDOFF.md`](../../../HANDOFF.md) and the project memory.

---

## 7. Per-layer build spec

For each: **mockup ref → current state → RN build → asset/animation.** All scene hexes are in §8. Tokens for *chrome* are `OB_*` from [`src/constants/onboardingTheme.ts`](../../../src/constants/onboardingTheme.ts); **physical-scene colors are their own palette (§8), NOT theme tokens** ([`2026-06-23 §3.7`](2026-06-23-journey-garden-hero-design.md)).

### 7.1 Sky + horizon
Mockup line 62 (`linear-gradient(180deg, #b3d9ed 0%, #bcdfef 33%, #b7d49d 42%, #aec59a 100%)`). Now: flat `LAWN`. Build: replace the `backgroundColor: LAWN` at [`GardenScene.tsx:90`](../../../src/components/garden/GardenScene.tsx) with a vertical gradient (use `expo-linear-gradient` — confirm it's installed; else `react-native-svg` `<LinearGradient>`), OR fold into the baked PNG (Option B). Keep the **distinct horizon** ([`2026-06-23 §6 "design notes"`](2026-06-23-journey-garden-hero-design.md)).

### 7.2 Clouds *(assets exist — build now)*
Mockup `.cloud` lines 84–92 (3 divs, each own size/dur/opacity/phase). Assets (verified, transparent, in [`assets/garden/`](../../../assets/garden/)): `puplog-cloud-1.png` (460×248, 137 KB), `puplog-cloud-2.png` (600×161, 93 KB), `puplog-cloud-3.png` (380×268, 111 KB). Build: 3 `<Animated.Image>` drifting via reanimated `withRepeat(withTiming(translateX))`, gated behind `useReducedMotion()` + paused off-focus (§9). Per-cloud top/width/dur/opacity from [`2026-06-23 §9.4`](2026-06-23-journey-garden-hero-design.md) (c1 top84/w122/75s; c2 top152/w152/op0.6/120s; c3 top112/w74/op0.72/96s; negative delays spread them).

### 7.3 Sun
Mockup `.sun` line 71 (radial-gradient glow, top-right). Build: a `react-native-svg` `<RadialGradient>` circle or a soft PNG. Static (no animation needed).

### 7.4–7.6 Far hill / meadow / dirt path / garden bed
Mockup: far hill 687–688, `meadowGrad` 675 + path 690, `bedGrad` 680 + ellipse 750, stepping stones ~715, dirt flecks (grep `dirt`). These are the §6 ground decision. Current: only the `SOIL` ellipse ([`GardenScene.tsx:99`](../../../src/components/garden/GardenScene.tsx)). Keep the bed centered where the flower scatter expects it: `BED = {x:0.1, y:0.46, w:0.8, h:0.42}` ([`GardenScene.tsx:19`](../../../src/components/garden/GardenScene.tsx)) — if you move the bed art, keep this rect aligned or the blooms drift off the soil.

### 7.7 Flower stems *(build now — the blooms already render)*
Mockup `renderFlower` line 1233; stem = green gradient `#6f8a48→#54703a`, `stemH ≈ px*0.62`, `stemW ≈ px*0.055` (line 1239); [`2026-06-23 §7.3`](2026-06-23-journey-garden-hero-design.md). Now: blooms float (the Gemini PNGs have transparent padding). Build: in [`GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) `blooms.map` (line 118), render a stem `View`/gradient **behind** each `Flower`, rising from the soil into the bloom base. (Eventually the real flower art may include stems — coordinate with §10.)

### 7.8 Ambient grass detail
Tufts (line 797), wildflowers + clover (835), pebbles + mushrooms (850). [`2026-06-23 §8`](2026-06-23-journey-garden-hero-design.md) has every color + "keep all of these" (user-loved, esp. mushrooms). Build: bake into the ground PNG (Option B), OR a small set of static SVG/PNG detail sprites (Option A). Keep them **off** the path and bed.

### 7.9 Doghouse grounding *(build now)*
Mockup `.doghouse-slot` line 111; name shows when `.live` line 129; grounding fix in [`2026-06-23 §9.1`](2026-06-23-journey-garden-hero-design.md) — a **tight, dark contact shadow** (`rgba(46,32,18,0.32)`) tucked at the base (NOT a big soft far oval). Asset [`assets/garden/puplog-doghouse.png`](../../../assets/garden/puplog-doghouse.png) **(⚠️ 4.67 MB — white-bg, needs transparent + downscaled export, §10)**. Now: plain PNG at [`GardenScene.tsx:105`](../../../src/components/garden/GardenScene.tsx), no shadow/sign. Build: add the contact-shadow ellipse + overlay the **dog's name** on the sign (the dog name is available in `index.tsx` — pass it into `GardenScene`).

### 7.10 Biscuit mascot *(placeholder exists)*
Mockup `.biscuit-slot` line 131, art slot line 888. Placeholder corgi component: [`src/components/onboarding/BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx). Final mascot art is a **separate track** ([`2026-06-23 §9.2`](2026-06-23-journey-garden-hero-design.md)). Build: mount it in the scene with a gentle bob (reanimated `@keyframes bob` → `withRepeat`), reduced-motion-safe.

### 7.11 Butterfly + 7.12 Speech bubble
Butterfly: mockup `.butterfly` line 141; drift + **flapping wings** ([`2026-06-23 §9.3`](2026-06-23-journey-garden-hero-design.md) — SMIL in the mockup → reanimated in RN, reduced-motion-gated). Speech bubble: `.bubble` line 158 (optional; decide content with the greeting, §7.13).

### 7.13 Greeting
Now: plain handwritten line ([`GardenGreeting.tsx`](../../../src/components/garden/GardenGreeting.tsx), `OB_FONTS.handwritten` = Caveat, globally loaded — confirmed). Mockup uses a retrospective end-of-week line. **Open decision** (greeting source: static vs deterministic-from-moods vs AI — must never imply diagnosis): [`2026-06-23 §16.5`](2026-06-23-journey-garden-hero-design.md). If AI, use `anthropic-sdk` + the latest Claude models.

---

## 8. Palette — exact values (read from the mockup, cited)

Do not eyeball — copy from [`2026-06-23 spec §6`](2026-06-23-journey-garden-hero-design.md) (every element + mockup line). Highlights: sky gradient (mockup line 62), far hill `#c2d9a3` @0.97 (line 688), `meadowGrad` `#cfe3b8→#bfd6a9→#b0c99b` (675–679), `bedGrad` `#b89164→#9d7b54→#876844` (680–684), path `#c7a778` @0.9 (714), doghouse shadow `rgba(46,32,18,0.32)` (883). Current placeholders: `LAWN #bcd2a3`, `SOIL #9d7b54` ([`GardenScene.tsx:23–24`](../../../src/components/garden/GardenScene.tsx)). **Urgency "monitor" = teal `#00897B`, never green** — keep garden greens visually distinct from urgency ([`CLAUDE.md`](../../../CLAUDE.md)).

---

## 9. Animation spec (RN)

[`2026-06-23 §10`](2026-06-23-journey-garden-hero-design.md). **All idle loops: reanimated `withTiming`/`withRepeat` only** (no springs — owner pref), gated behind **`useReducedMotion()`**, and **paused when the tab is unfocused**. The focus hook already exists: [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) uses `useFocusEffect` from `expo-router` (precedent: [`src/hooks/useTabFocusAnimation.ts:2`](../../../src/hooks/useTabFocusAnimation.ts)) — pass `paused={!isFocused}` into the cloud/mascot/butterfly loops. The jest reanimated mock lives in [`jest.setup.js`](../../../jest.setup.js) (it gained `withSequence`; add `withRepeat`/`withDelay` mocks there if a new test needs them). `PlantCelebration` (built) is the model for reduced-motion-safe one-shots. **The agent env cannot observe motion** — verify by code review + Metro export; the user QAs on device.

---

## 10. Asset pipeline (Gemini + PIL) — the biggest visual lever

**Existing prompt guides (reuse verbatim — house style):**
- Scene kit: [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md) — §"Visual Style Foundation" (line 19), "Scene Palette" (33), "Filename Convention" (51), and "THE 5 SCENE ASSETS" (57): Doghouse (59), Soil Mound (86), Sprout (110), Grass Tuft (132), Butterfly (154). **It does NOT yet have a baked-ground prompt or the cloud prompts** — the cloud prompts are recorded in [`2026-06-23 §14.2`](2026-06-23-journey-garden-hero-design.md) (TODO: fold them into this guide).
- Flowers: `~/Downloads/puplog_flower_prompts_v2 (1).md` (⚠️ in Downloads, not the repo — ask the user to relocate/commit). Tier logic: [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md).

**Assets that EXIST** ([`assets/garden/`](../../../assets/garden/)): 3 clouds (transparent, ~93–137 KB), `puplog-doghouse.png` (**4.67 MB, white-bg**), 24 flowers `flowers/puplog-flower-[mood]-tier[1-3].png` (**~85 MB total, ~3.4 MB each, white-bg**). Slot map: [`assets/garden/README.md`](../../../assets/garden/README.md).

**Assets NEEDED (user generates, then PIL-process):**
1. **Transparent + downscaled flower exports** — fixes both the boxy look AND the **bundle-bloat code-review finding** (~85 MB → target a few MB). Spec [`2026-06-23 §11.1, §14.3`](2026-06-23-journey-garden-hero-design.md).
2. **Transparent + downscaled doghouse** (4.67 MB → small).
3. **Baked watercolor ground PNG** (if §6 Option B / hybrid).
4. (Optional) sprout + mound (scene-kit, [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md) §3/§2) — wire the commented requires in [`flowerAssets.ts`](../../../src/constants/flowerAssets.ts) (`TODO(scene-kit)`).

**PIL recipe (trim transparent margins + downscale)** — `python3` + PIL available locally; copy verbatim from [`2026-06-23 §14.3`](2026-06-23-journey-garden-hero-design.md). **Don't hand-beautify art** — background removal + downscale is the only allowed post-processing (memory `feedback_sticker_artwork_is_drop_in.md`). **Asset intake loop** ([`2026-06-23 §14.4`](2026-06-23-journey-garden-hero-design.md)): `ls` the actual folder (don't trust mtime — [`HANDOFF.md`](../../../HANDOFF.md) H7), verify transparency/dims, trim+downscale, drop into [`assets/garden/`](../../../assets/garden/), `npx expo start -c`.

> **Consider a skill (§15):** the §14.3 PIL pipeline + §14.4 intake loop recur — candidate skills `"raster-asset-to-rn"` / `"gemini-asset-intake"` ([`HANDOFF.md`](../../../HANDOFF.md) §14).

---

## 11. Current code map (what to touch)

- **Scene:** [`src/components/garden/GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) — the file that grows from placeholder to painted scene. Tunable constants at lines 11–24 (`BLOOMS_BY_TIER`, `BLOOM_BASE`, `MIN_SPACING`, `BED`, `DOGHOUSE_W`, `LAWN`, `SOIL`). Render tree: bg+soil (90–116), doghouse (105), blooms (118), a11y day-markers (133), today marker (144). **Preserve the a11y model** (blooms hidden, one marker per planted day — §12).
- **Screen:** [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) — header (dog chip + EmergencyChip), `GardenGreeting`, `GardenScene`, CTA→`LogSheet` modal, `PlantCelebration`, `DogSelector`. `GardenScene` is given `week`, `width`, `height` — extend the prop contract if the doghouse needs the dog name (§7.9).
- **Asset map:** [`src/constants/flowerAssets.ts`](../../../src/constants/flowerAssets.ts) — `FLOWER_ASSETS` (24) + `SCENE_ASSETS` (doghouse; sprout/mound commented `TODO(scene-kit)`). Metro **cannot** do template-literal `require()` (memory `feedback_rn_metro_static_require.md`) — keep the static map.
- **Mascot:** [`src/components/onboarding/BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx).
- **Tokens:** [`src/constants/onboardingTheme.ts`](../../../src/constants/onboardingTheme.ts) (`OB_*`, chrome only).
- **Tests/typecheck baseline:** `npm test` (68 suites/573 green at HEAD `1a7b75f`), filtered `tsc` 0 (filter: exclude `@expo/vector-icons`, `app/(tabs)/index.tsx`, `app/(tabs)/learn.tsx`). New scene logic → TDD (`superpowers:test-driven-development`).

---

## 12. Golden Rule & safety (do not regress)

> **Never let a dog owner walk away from a genuine emergency thinking they can wait.** ([`CLAUDE.md`](../../../CLAUDE.md).)
- Keep the **always-on Emergency surface** — `EmergencyChip` on the hero + the Emergency link in `LogSheet`, both → [`app/emergency.tsx`](../../../app/emergency.tsx). Don't let scene work cover/remove them.
- `plantFlower` re-runs `detectEmergencyKeywords(note)` to set `emergency_flagged` — don't touch.
- **Preserve the GardenScene a11y** ([`GardenScene.tsx:118–155`](../../../src/components/garden/GardenScene.tsx)): blooms hidden from VoiceOver (`accessibilityElementsHidden`), one accessible marker per planted day, today marker, never "missed". Any new scene sprite must be `accessibilityElementsHidden` / decorative so it doesn't add VoiceOver noise. Use `accessibility-compliance` for every new surface (44–48dp targets, shape+color, contrast).
- Keep the 5 legal components untouched ([`src/components/legal/`](../../../src/components/legal/)).

---

## 13. Verify approach

`superpowers:verification-before-completion` before any "done." Evidence: `npm test` (show the count vs 573 baseline), filtered `tsc` (0), `npx expo export --platform ios` (clean bundle — **watch the bundle SIZE drop** once flower/doghouse art is downscaled). **The agent cannot screenshot the RN app** — verify scene composition via the Metro export + PIL composites; the **user QAs layout/animation on device** ([`HANDOFF.md`](../../../HANDOFF.md) H12). The `GardenScene` geometry constants (§11) are **tunable on-device** — iterate with the user.

---

## 14. Open decisions / gates

1. **§6 ground strategy** (SVG port vs baked PNG vs hybrid) — **decide first, with the user.**
2. **Art delivery** — flowers + doghouse (transparent/downscaled) + baked ground; user-generated (§10).
3. **Greeting source** (§7.13) — static vs deterministic vs AI.
4. **Composition for SE→Max** — the baked-PNG aspect-ratio strategy, or SVG resolution-independence.
5. **Deferred features** (separate plans): photo/video Tier-3 (storage bucket), **weekly Monday "reset as keepsake" → My Dogs `WeekLookBack` handoff** ([`2026-06-23 §16.6`](2026-06-23-journey-garden-hero-design.md), interlocks with My Dogs PR #23), final mascot art.
6. **Scene-kit prompt guide** — add the cloud + baked-ground prompts to [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md) (§10 TODO).

---

## 15. SKILLS — MANDATORY (read again — load-bearing)

**Per the user's explicit, repeated instruction (2026-06-23 + 2026-06-24) and [`CLAUDE.md`](../../../CLAUDE.md) + [`HANDOFF.md`](../../../HANDOFF.md) §14: every Claude instance MUST use skills. Three avenues, in order.**

### 15.1 Use the skills we already have (invoke BEFORE acting)
| Skill | Use it for |
| --- | --- |
| `superpowers:brainstorming` | **Before** the §6 decision + any scene-design work. |
| `superpowers:writing-plans` | Turn this spec into a task-by-task TDD plan. |
| `superpowers:test-driven-development` | Every new helper/logic (stem geometry, layout math, greeting logic). |
| `superpowers:using-git-worktrees` | Branch off `origin/main`. |
| `superpowers:subagent-driven-development` / `executing-plans` | Execute the plan (drove this build well). |
| `react-native-architecture` + `react-native-best-practices` | The scene build, SVG/Image layering, reanimated loops, **FPS** (many layers + ~40 images + idle animation — perf is the main risk). |
| `accessibility-compliance` | **Every new surface** (keep the §12 a11y model; decorative sprites). |
| `supabase-postgres-best-practices` / `supabase-edge-functions` | Only if touching data (you shouldn't for the scene). |
| `anthropic-sdk` | If the greeting goes AI (latest Claude models). |
| `superpowers:verification-before-completion` | **Before** claiming done. |
| `superpowers:requesting-code-review` / `receiving-code-review` / `finishing-a-development-branch` | Review + merge. |
| `find-skills` | Search the ecosystem. |

### 15.2 Create a new skill when a workflow recurs
`superpowers:writing-skills` or `anthropic-skills:skill-creator`. Standing candidates ([`HANDOFF.md`](../../../HANDOFF.md) §14): **"raster-asset-to-rn"** (the §10 PIL pipeline), **"gemini-asset-intake"** (the §10 intake loop), **"puplog-mockup-conventions"**, **"rn-watercolor-scene"** (porting an HTML/SVG painted scene to performant RN — likely recurs across My Dogs/Discovery).

### 15.3 Go find a skill online
Unfamiliar domain (RN watercolor scenes, react-native-svg performance, flower-growth/bloom animation, parallax/idle-loop FPS)? **Search the market first:**
```bash
npx skills find "<query>"                 # search the ecosystem
npx skills add <owner/repo@skill> -g -y   # install (global)
```
Browse **https://skills.sh/trending**. **Only install reputable, well-reviewed, reliable skills** (strong install counts/reviews; verify before trusting).

**Bottom line: do not start domain work without a skill. Use one, make one, or find one — always.**

---

## 16. Full reference index

**This doc:** `docs/superpowers/specs/2026-06-24-journey-hero-visual-build.md`.
**Companion specs/plan:** [`2026-06-23-journey-garden-hero-design.md`](2026-06-23-journey-garden-hero-design.md) (visual truth — palette/layering/scatter, fully referenced), [`2026-06-20-journey-tab-hero-design.md`](2026-06-20-journey-tab-hero-design.md) (pre-mockup), plan [`2026-06-20-journey-tab-hero.md`](../plans/2026-06-20-journey-tab-hero.md).
**Mockups (root, untracked):** ⭐ [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) (visual truth), [`preview-journey-hero-option-a-v2.html`](../../../preview-journey-hero-option-a-v2.html) (log-sheet UX). Server: [`.claude/launch.json`](../../../.claude/launch.json) `:8088`.
**Code (built):** [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx), [`src/components/garden/`](../../../src/components/garden/) (`GardenScene`/`Flower`/`LogSheet`/`TierMeter`/`PlantCelebration`/`EmergencyChip`/`GardenGreeting`), [`src/stores/gardenStore.ts`](../../../src/stores/gardenStore.ts), [`src/lib/{flowerTier,gardenPlacement,gardenWeek}.ts`](../../../src/lib/), [`src/constants/{gardenMoods,flowerAssets}.ts`](../../../src/constants/), [`src/components/onboarding/BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx), [`src/hooks/useTabFocusAnimation.ts`](../../../src/hooks/useTabFocusAnimation.ts), [`jest.setup.js`](../../../jest.setup.js).
**Assets:** [`assets/garden/`](../../../assets/garden/) (3 clouds, doghouse 4.67 MB, 24 flowers ~85 MB; baked-ground/sprout/mound MISSING), [`assets/garden/README.md`](../../../assets/garden/README.md).
**Prompt guides:** [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md), [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md), `~/Downloads/puplog_flower_prompts_v2 (1).md`.
**Bibles:** [`CLAUDE.md`](../../../CLAUDE.md), [`HANDOFF.md`](../../../HANDOFF.md), [`DOCUMENTATION.md`](../../../DOCUMENTATION.md), project memory `project_journey_garden_build.md`.
**Repos/services:** GitHub `https://github.com/RohitS199/dog-app-v2.git` (PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26)); Supabase `https://wwuwosuysoxihtbykwgh.supabase.co`; skills marketplace `https://skills.sh/trending`.
**Memory pointers:** `project_journey_garden_build.md`, `project_journey_hero_pitch.md`, `project_flower_garden_system.md`, `project_no_streaks.md`, `feedback_rn_metro_static_require.md`, `feedback_sticker_artwork_is_drop_in.md`, `feedback_no_duplicate_enums_db_and_code.md`.

**Git note:** the Journey docs/mockups/`assets/garden/` are **untracked on the laptop** (the branch has the *code*, not the docs/art); a fresh clone has none of it ([`HANDOFF.md`](../../../HANDOFF.md) H10). To travel: commit + push the Journey thread (large PNGs = a deliberate plain-commit-vs-LFS call). Always `cp .env` into any new worktree.

---

*End of spec. Re-read §0 and §15: use skills — existing, new, or found online — ALWAYS. Resolve §6 (ground strategy) with the user before building.*
