# Journey Meadow Mushrooms — Design Spec (2026-06-29)

> **Author:** Claude (Opus 4.8) — "Journey garden hero" session, 2026-06-29.
> **For:** the next Claude instance that will IMPLEMENT this. Read this top-to-bottom, then the linked files, then the companion plan: [`docs/superpowers/plans/2026-06-29-journey-meadow-mushrooms.md`](../plans/2026-06-29-journey-meadow-mushrooms.md).
> **Repo:** https://github.com/RohitS199/dog-app-v2 · **Branch:** `feature/journey-scene-build` · **Open PR:** [#30](https://github.com/RohitS199/dog-app-v2/pull/30) (the Journey garden hero — this work stacks onto it or onto `main` after #30 merges).

---

## §0. SKILLS ARE MANDATORY — read before you touch anything (the user is explicit, EVERY session)

The user has said, repeatedly and emphatically: **always, always, always use skills.** This is non‑negotiable and applies to *every* task in this spec. Three tiers, in order:

1. **Use the skills we already have.** At minimum for THIS feature:
   - `react-native-architecture` — component/layout/animation architecture (invoke BEFORE building the component).
   - `react-native-best-practices` — FPS / re-render / memory / static-`require` guidance (the project skill at `.claude/skills/react-native-best-practices`).
   - `accessibility-compliance` — every new surface; mushrooms are decorative and MUST be hidden from assistive tech (see §9).
   - `superpowers:test-driven-development` — RED→GREEN for every component/helper (see §10).
   - `superpowers:using-git-worktrees` — isolate the work (see the plan, Task 0).
   - `superpowers:verification-before-completion` — run tests + typecheck + bundle and PASTE real output before claiming done (see §11).
   - `superpowers:writing-plans` / `superpowers:executing-plans` / `superpowers:subagent-driven-development` — to execute the companion plan.
   - `superpowers:requesting-code-review` + `superpowers:finishing-a-development-branch` — before/at PR.
2. **Create a new skill yourself** if a workflow recurs and no skill covers it (e.g. a "scatter a decorative drop-in asset around the Journey scene" skill, or an "ingest + crop-to-alpha + downscale a Gemini PNG into the worktree" skill). Use `superpowers:writing-skills`.
3. **Find a reputable, well‑reviewed skill online** when neither of the above fits. Commands:
   - `npx skills find "<query>"`
   - Browse trending, battle‑tested skills: **https://skills.sh/trending**
   - Install a high‑quality one (1K+ installs, good reviews): `npx skills add <owner/repo@skill> -g -y`
   - The project's `find-skills` skill helps discover these.

**If there is even a 1% chance a skill applies, invoke it.** This requirement is repeated at the end of this doc (§13) on purpose. Do not rationalize skipping it.

---

## §1. Goal (one sentence)

Scatter a handful of small, charming **decorative mushrooms** across the **grass meadow around the garden bed** on the Journey hero — adding depth/detail to the scene — using transparent Gemini drop‑in art the user generated, following the exact pattern already established by [`Clouds.tsx`](../../../src/components/garden/Clouds.tsx) (decorative, deterministic, accessibility‑hidden, reduced‑motion/off‑focus aware).

This is **art polish only.** No data, no backend, no new screens. It must not touch the Golden Rule surfaces (Emergency chip, legal components) — see [`CLAUDE.md`](../../../CLAUDE.md) "Golden Rule" / "Legal Components."

---

## §2. Current scene state you are building on (PR #30)

The Journey hero lives in [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) (full‑bleed, scene as background, UI floats on top) and the scene itself in [`src/components/garden/GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx). As of PR [#30](https://github.com/RohitS199/dog-app-v2/pull/30) the scene renders, **in z‑order (back → front)**:

1. **Sky→meadow `LinearGradient`** — `GardenScene.tsx` (`colors={['#b3d9ed','#bcdfef','#b7d49d','#aec59a']}`, green from ~0.42 down).
2. **`Clouds`** — [`src/components/garden/Clouds.tsx`](../../../src/components/garden/Clouds.tsx) — 3 drifting cloud PNGs.
3. **`Ground`** (meadow depth only) — [`src/components/garden/Ground.tsx`](../../../src/components/garden/Ground.tsx) — `react-native-svg` far hill, sunlight pool, cool mottles, warm highlights. (It used to draw the soil bed; the bed is now an image — see #4.)
4. **Garden‑base image** — `SCENE_ASSETS.gardenBed` (`assets/garden/puplog-garden-bed.png`) rendered as an `<Image>` at the bed footprint. See `GardenScene.tsx` `bedFootprint()` + `BED_*` constants. **This is the precedent for adding a painted drop‑in to the scene** (commit `7550a5a`).
5. **Doghouse contact shadow + doghouse `<Image>`** — `SCENE_ASSETS.doghouse`, square 1024² PNG, `DOGHOUSE_W=0.482`, `DOGHOUSE_TOP=0.235`.
6. **`BiscuitBob`** — [`src/components/garden/BiscuitMascot`](../../../src/components/garden/BiscuitBob.tsx) placeholder, `topFrac=0.5 leftFrac=0.58`.
7. **Swaying flowers** — [`src/components/garden/SwayingFlower.tsx`](../../../src/components/garden/SwayingFlower.tsx) wrapping [`Flower.tsx`](../../../src/components/garden/Flower.tsx), scattered on the **inner soil** (`scatterPx` = bed footprint inset by `SOIL_INSET_X/Y`). Wind sway via a shared clock (see §7).
8. **Per‑day a11y markers** (one VoiceOver label per planted day) + today marker.
9. **`Butterfly`** — [`src/components/garden/Butterfly.tsx`](../../../src/components/garden/Butterfly.tsx) — front‑most ambient.

**Key geometry constants in `GardenScene.tsx` you will reuse** (fractions of the full‑screen scene box `width × height`):

| Constant | Value | Meaning |
| --- | --- | --- |
| `BED_CX` | `0.5` | bed center x (fraction of width) |
| `BED_CY` | `0.723` | bed center y (fraction of height) |
| `BED_W` | `0.882` | bed width (fraction of width) |
| `BED_ASPECT` | `1400/871 ≈ 1.607` | garden‑base image aspect (w/h) |
| `SOIL_INSET_X / Y` | `0.16 / 0.24` | flower scatter inset from the rock ring |
| `bedFootprint(width,height)` | `{left, top, w, h}` | the bed image's on‑screen px rect — **use this to place mushrooms around it** |

The bed's on‑screen rect (so you know where the grass is): `w = BED_W*width`, `h = w/BED_ASPECT`, centered at `(BED_CX*width, BED_CY*height)`. On a 390×844 device that's ≈ **344×214 px, spanning y 0.596–0.849**. The **meadow you scatter mushrooms in** is everything green *around* that oval and the doghouse — chiefly the **left/right grass beside the bed** and the **front grass below it**, staying clear of the bed soil, the doghouse, and the CTA/tab‑bar zone (bottom ~10%).

---

## §3. The assets (already prepared this session)

The user generated 3 single mushrooms with Gemini (watercolor storybook style to match the scene). They arrived in the **main repo** working tree at huge sizes; this session **cropped each to its alpha bounding box (+2% pad) and downscaled to ≤800 px**, then copied them into the worktree at `assets/garden/`:

| File (in `assets/garden/`) | Downscaled | Aspect (w/h) | Size | Look |
| --- | --- | --- | --- | --- |
| `puplog-mushroom-1.png` | 724×800 | **0.905** | 0.64 MB | classic **red** toadstool, cream spots, cream stem w/ skirt |
| `puplog-mushroom-2.png` | 739×800 | **0.924** | 0.54 MB | **amber‑brown** rounded cap, stout cream stem |
| `puplog-mushroom-3.png` | 473×800 | **0.591** | 0.34 MB | tall slender **dusty‑rose (pink)** cap, slim cream stem |

- All are **transparent PNGs** (corner alpha 0; verified). Each includes a faint baked **contact shadow at the base** — so the asset's bottom edge IS the ground‑contact point.
- **Aspects differ** (0.905, 0.924, 0.591) — so when you render, set the **width** and derive **height = width / aspect** to avoid distortion. Hardcode the three aspects in the asset config (don't read pixel sizes at runtime).
- The originals (4.8–6.3 MB, oddly cropped 1:1 / 1.83:1 / 0.60:1) remain **untracked in the main repo's `assets/garden/`**; they are NOT needed — the downscaled copies in the worktree are committed with this spec. The user can delete the originals anytime.
- **Stem color decision (locked):** keep the **cream/white** stems. The user asked whether to tint them green or brown; we agreed cream is correct — it reads as a mushroom and *contrasts* against the grass (a green stem would camouflage, a brown one looks muddy). The baked contact shadow is what grounds them, not the stem color. (Conversation 2026-06-29.)

**Metro constraint (memory: [`feedback_rn_metro_static_require.md`]):** asset `require()`s must be **static string literals** — never template literals. Register them in a static map (mirror `SCENE_ASSETS.clouds`).

---

## §4. Design — the `Mushrooms` component (mirror `Clouds`)

Add a new decorative component **`src/components/garden/Mushrooms.tsx`** that is the mushroom analogue of [`Clouds.tsx`](../../../src/components/garden/Clouds.tsx). Study `Clouds.tsx` first — it is the canonical template: a config array + a per‑sprite subcomponent + a wrapper that is `accessibilityElementsHidden` / `importantForAccessibility="no-hide-descendants"` / `pointerEvents="none"`.

### §4.1 Asset map (in `src/constants/flowerAssets.ts`)
Extend `SCENE_ASSETS` (next to `doghouse`, `gardenBed`, `clouds`):
```ts
// Painted meadow mushrooms (Gemini drop-ins; downscaled). Static requires — Metro can't
// resolve dynamic paths (memory: rn-metro-static-require).
mushrooms: [
  require('../../assets/garden/puplog-mushroom-1.png'), // aspect 0.905 (red)
  require('../../assets/garden/puplog-mushroom-2.png'), // aspect 0.924 (amber)
  require('../../assets/garden/puplog-mushroom-3.png'), // aspect 0.591 (tall pink)
],
```

### §4.2 Placement config (deterministic, like `CLOUDS`)
A module‑level array of placements. Each entry positions a mushroom by its **base point** (bottom‑center, where it meets the grass) so depth sorting + sizing are natural:
```ts
const ASPECTS = [0.905, 0.924, 0.591]; // index → w/h, matches SCENE_ASSETS.mushrooms order
// baseX/baseY are fractions of the scene box; w is fraction of WIDTH. mirror flips horizontally
// for variety; the array is hand-placed to ring the meadow AROUND the bed (never on the soil).
const MUSHROOMS = [
  { i: 0, baseX: 0.13, baseY: 0.70, w: 0.10, mirror: false }, // left of bed, mid
  { i: 2, baseX: 0.20, baseY: 0.62, w: 0.06, mirror: false }, // upper-left, small (far)
  { i: 1, baseX: 0.88, baseY: 0.72, w: 0.095, mirror: true  }, // right of bed
  { i: 0, baseX: 0.83, baseY: 0.63, w: 0.055, mirror: true  }, // upper-right, small (far)
  { i: 2, baseX: 0.34, baseY: 0.88, w: 0.07, mirror: false }, // front meadow, left
  { i: 1, baseX: 0.66, baseY: 0.89, w: 0.075, mirror: true  }, // front meadow, right
];
```
> These are **starting values** — they MUST be tuned on device (the agent cannot screenshot; the user QAs on a physical iPhone — see hazard H‑screenshot in the handoff). Keep them as a clearly‑labeled, easily‑editable array.

**Placement rules (so it reads right):**
- **On the grass, never on the soil bed or rocks.** Compute the bed footprint and keep base points outside `[BED_CX ± BED_W/2]` horizontally OR below the bed; the front‑meadow ones (baseY ≥ ~0.86) sit on the near grass below the oval. (You may import/duplicate `bedFootprint` logic, or just keep the hand‑placed fractions above which already avoid the soil.)
- **Avoid the doghouse** (top ~0.235–0.49, centered) and **avoid the bottom ~0.10** (CTA + floating tab bar live there — see `app/(tabs)/index.tsx` `styles.cta marginBottom:90` and `FloatingTabBar`).
- **Depth:** smaller `w` + higher `baseY` reads as farther away. **Sort by `baseY` ascending** so nearer (lower) mushrooms paint over farther ones.
- **Variety:** reuse the 3 assets with different sizes + `mirror` (horizontal flip via `transform:[{scaleX:-1}]`) so 6 placements don't look like 6 identical copies.

### §4.3 Sprite rendering
```ts
function MushroomSprite({ cfg, width, height }: {...}) {
  const w = cfg.w * width;
  const h = w / ASPECTS[cfg.i];
  return (
    <Image
      source={SCENE_ASSETS.mushrooms[cfg.i]}
      resizeMode="contain"
      style={{
        position: 'absolute',
        left: cfg.baseX * width - w / 2,
        top: cfg.baseY * height - h,        // base point sits on the grass
        width: w,
        height: h,
        transform: cfg.mirror ? [{ scaleX: -1 }] : undefined,
      }}
    />
  );
}
```
Wrapper `Mushrooms({ width, height })`: a `View` with `StyleSheet.absoluteFill`, `pointerEvents="none"`, `accessibilityElementsHidden`, `importantForAccessibility="no-hide-descendants"`, mapping the (baseY‑sorted) `MUSHROOMS` array. Wrap in `React.memo` keyed on `{width,height}` (the scene re‑renders on focus toggles — see `GardenScene` `isFocused`; mushrooms must not re‑render for that). Mirror `Ground`'s `memo` precedent.

### §4.4 Mount point in `GardenScene.tsx`
Mount `<Mushrooms width={width} height={height} />` **immediately after the garden‑base `<Image>`** (so mushrooms sit on the meadow, in front of the bed's far edge) and **before the doghouse shadow/blooms**. Rationale: they're ground decor around the bed; placing them before the blooms means a flower that happens to overlap a mushroom paints in front (flowers are the focus). If on‑device QA shows a front mushroom should overlap the bed's near rocks, that already works because front‑meadow mushrooms (baseY ≥ 0.86) are below the bed.

---

## §5. Animation — STATIC for v1 (optional faint idle)

**Default: static** (no animation). Real mushrooms are rigid; swaying them like the flowers looks wrong, and static keeps it cheap. The flowers already sway (motion is covered).

**Optional (only if the user asks):** a *very* subtle idle — a 1–2° rock or a tiny 1–2 px vertical breathing, pivoting at the base (`transformOrigin: 'bottom'`), each on its own phase. If you add it, **reuse the exact pattern in [`SwayingFlower.tsx`](../../../src/components/garden/SwayingFlower.tsx)** (a shared clock + `active` multiplier) and **gate it** on `useReducedMotion()` + the scene's `isFocused` (off‑focus pause) — identical to the flowers/clouds. Do NOT introduce a second animation driver style. Keep amplitude tiny (mushrooms are stiff). This is explicitly **out of scope for v1** unless requested.

---

## §6. Accessibility (invoke `accessibility-compliance`)

Mushrooms are **purely decorative** and MUST be invisible to assistive tech (same as clouds, butterfly, blooms):
- Wrapper + sprites: `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"` + `pointerEvents="none"`.
- **Add zero new accessible nodes.** VoiceOver must still announce exactly one marker per planted day (the `dayMarkers` in `GardenScene.tsx`) and nothing else new. This is a guardrail — verify on device with VoiceOver (handoff has the steps).
- No touch targets (decorative), so no 44/48 dp concerns.

---

## §7. Performance (invoke `react-native-best-practices`)

- ~6 static `<Image>`s, no animation (v1) → negligible. Still: **`React.memo`** the component on `{width,height}` so the scene's `isFocused` state toggles (`GardenScene.tsx`) don't re‑render it. Precedent: `Ground` is memoized for exactly this reason.
- **Static `require()` map only** (memory: `feedback_rn_metro_static_require.md`). No dynamic/template requires.
- Assets already downscaled (≤800 px, ≤0.64 MB each) — keep them small; do not re‑introduce the multi‑MB originals. (Precedent: the garden‑base was downscaled 22 MB → 1.6 MB before commit.)

---

## §8. Testing (invoke `superpowers:test-driven-development`)

Write the test FIRST (RED→GREEN). Mirror the existing decorative‑component tests — note the **`includeHiddenElements: true`** quirk: decorative components are `accessibilityElementsHidden`, so RNTL default queries can't see them (this exact gotcha bit `SwayingFlower.test.tsx` this session). Mocks already exist in [`jest.setup.js`](../../../jest.setup.js): `react-native` `Image`, reanimated, `react-native-svg`. Image `require()`s resolve to numbers under `jest-expo`.

`src/components/garden/__tests__/Mushrooms.test.tsx` (minimum):
```tsx
import { render } from '@testing-library/react-native';
import { Mushrooms } from '../Mushrooms';

describe('Mushrooms', () => {
  it('renders the configured decorative mushroom images', () => {
    const { UNSAFE_getAllByType } = render(<Mushrooms width={390} height={844} />);
    const { Image } = require('react-native');
    expect(UNSAFE_getAllByType(Image).length).toBeGreaterThanOrEqual(5); // however many placements
  });
  it('does not crash at small/large canvases', () => {
    expect(() => render(<Mushrooms width={320} height={700} />)).not.toThrow();
    expect(() => render(<Mushrooms width={430} height={932} />)).not.toThrow();
  });
});
```
Plus: confirm `GardenScene.test.tsx` still passes (it renders `emptyWeek`; mushrooms render regardless). If you add the optional idle (§5), add a "does not crash with reduced motion / paused" test mirroring `Clouds.test.tsx`.

**Baseline before you start:** `CI=true npm test` was **green at ~601 tests / 76 suites** at the tip of `feature/journey-scene-build` (commit `7550a5a`, garden‑base image). Record the exact number you see; do not regress it.

---

## §9. Verification (invoke `superpowers:verification-before-completion`)

Before claiming done, RUN these and **paste the real output** (no "should pass"):
```bash
CI=true npm test 2>&1 | tail -6                  # ≥ baseline + new Mushrooms tests
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l   # expect 0
npx expo export --platform ios 2>&1 | tail -5    # clean bundle (catches a bad asset require)
```
Then **device QA with the user** (`npx expo start -c`, scan QR): mushrooms scattered tastefully around the bed on the grass, none on the soil/rocks/doghouse/CTA, varied (sizes + mirrored), depth reads right; Emergency chip still present + tappable; VoiceOver announces only the per‑day markers (no new nodes). Tune the `MUSHROOMS` fractions live.

---

## §10. References (everything this spec relies on)

**Repo / PR / branch**
- GitHub: https://github.com/RohitS199/dog-app-v2 · PR [#30](https://github.com/RohitS199/dog-app-v2/pull/30) `feature/journey-scene-build` (the Journey hero, where this builds on).

**Code (repo‑relative; the active worktree is `.worktrees/journey-scene/` on the user's laptop)**
- Template to copy: [`src/components/garden/Clouds.tsx`](../../../src/components/garden/Clouds.tsx)
- Sway template (if optional idle): [`src/components/garden/SwayingFlower.tsx`](../../../src/components/garden/SwayingFlower.tsx)
- Mount point + bed geometry: [`src/components/garden/GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) (`bedFootprint`, `BED_CX/CY/W`, `BED_ASPECT`, `SOIL_INSET_*`, `isFocused`)
- Meadow depth: [`src/components/garden/Ground.tsx`](../../../src/components/garden/Ground.tsx) (memo precedent)
- Garden‑base image precedent (how a painted drop‑in joins the scene): same `GardenScene.tsx` `<Image source={SCENE_ASSETS.gardenBed}>` + commit `7550a5a`
- Asset map: [`src/constants/flowerAssets.ts`](../../../src/constants/flowerAssets.ts) (`SCENE_ASSETS`)
- Screen (full‑bleed host): [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx)
- Test mocks: [`jest.setup.js`](../../../jest.setup.js)
- Assets: `assets/garden/puplog-mushroom-1.png`, `…-2.png`, `…-3.png`

**Visual truth**
- Mockup: [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) — note **line 850** ("detail pass 2: pebbles, denser grass, more wildflowers, **mushrooms**") confirms mushrooms were always intended as meadow detail. (The mockup's mushrooms are emoji‑placeholders, not the asset look — match the Gemini watercolor instead.)
- The user's reference photo + the generated red toadstool were shared in chat on 2026-06-29.

**Memory / decisions (user's `~/.claude/.../memory/`)**
- `feedback_rn_metro_static_require.md` — static `require()` only.
- `feedback_sticker_artwork_is_drop_in.md` — artwork is a Gemini drop‑in; don't hand‑polish placeholders.
- `project_journey_garden_build.md` — the Journey garden arc tracker.

**Companion plan:** [`docs/superpowers/plans/2026-06-29-journey-meadow-mushrooms.md`](../plans/2026-06-29-journey-meadow-mushrooms.md)

---

## §11. Out of scope (don't scope‑creep)

- **Grass tufts** and the **dirt path** from the doghouse to the bed (mockup also has these) — separate follow‑ups; do them only if the user asks.
- **Baked‑shadow tuning** on the mushroom art (greener/softer base shadow) — an art regen, not code.
- **Persisting / data** — mushrooms are pure decoration; no store, no DB.
- **Mushroom sway** beyond the optional faint idle in §5.

---

## §12. Self‑review (by the spec author)

- **Pattern reuse:** mirrors `Clouds.tsx` (decorative config array + memo + a11y‑hidden) and the `gardenBed` `<Image>` precedent — no new architecture invented. ✅
- **Geometry grounded:** placements are fractions of the same scene box the rest of the scene uses; the bed footprint (`bedFootprint`, `BED_*`) defines where the grass is. ✅
- **Aspect‑correct sizing:** width set, height = width/aspect, per‑asset aspects hardcoded (0.905/0.924/0.591) — no squish. ✅
- **Guardrails:** decorative + a11y‑hidden + pointerEvents none; Golden‑Rule surfaces untouched; CTA/tab‑bar/doghouse/soil avoided. ✅
- **Tunables flagged:** the `MUSHROOMS` fractions are explicitly "tune on device"; the agent can't screenshot. ✅
- **Tested + verified:** TDD test specified; full suite + filtered tsc + expo export + device QA. ✅
- **Open question for the user:** how many mushrooms feels right (spec assumes ~6)? Confirm during QA.

---

## §13. SKILLS — repeated on purpose (do NOT skip)

Per the user's standing, emphatic instruction: **always use skills.** Before and during implementation:
- **Use** existing skills (`react-native-architecture`, `react-native-best-practices`, `accessibility-compliance`, the whole `superpowers:*` workflow — brainstorm/plan/TDD/verify/review/finish, `using-git-worktrees`).
- **Create** a new skill if a workflow recurs and none fits (`superpowers:writing-skills`).
- **Find** a reputable, well‑reviewed one online if needed: `npx skills find "<q>"`, browse **https://skills.sh/trending**, install with `npx skills add <owner/repo@skill> -g -y`. The `find-skills` skill helps.

If there's a 1% chance a skill applies, invoke it. This is the user's hard rule.
