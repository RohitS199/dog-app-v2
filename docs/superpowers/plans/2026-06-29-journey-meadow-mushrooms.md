# Journey Meadow Mushrooms — Implementation Plan (2026-06-29)

> **For agentic workers:** REQUIRED SUB‑SKILL — use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to run this task‑by‑task. Steps use checkbox (`- [ ]`) syntax.
>
> ⚠️ **BEFORE YOU START — SKILLS ARE MANDATORY (the user is explicit, EVERY session).** Use the skills we have, **create** one when a workflow recurs (`superpowers:writing-skills`), or **find** a reputable/well‑reviewed one online (`npx skills find "<q>"`, https://skills.sh/trending, `npx skills add <owner/repo@skill> -g -y`). See the design spec [`docs/superpowers/specs/2026-06-29-journey-meadow-mushrooms-design.md` §0 + §13](../specs/2026-06-29-journey-meadow-mushrooms-design.md). At minimum here: `react-native-architecture`, `react-native-best-practices` (FPS/static‑require), `accessibility-compliance` (decorative surface), `superpowers:test-driven-development` (every component), `superpowers:using-git-worktrees`, `superpowers:verification-before-completion`, `superpowers:requesting-code-review`, `superpowers:finishing-a-development-branch`.

**Goal:** scatter ~6 decorative Gemini mushroom PNGs across the grass meadow around the garden bed on the Journey hero, mirroring [`Clouds.tsx`](../../../src/components/garden/Clouds.tsx). Decorative, deterministic, accessibility‑hidden, memoized. **Static for v1** (no animation). Spec: [`…/specs/2026-06-29-journey-meadow-mushrooms-design.md`](../specs/2026-06-29-journey-meadow-mushrooms-design.md).

**Architecture:** new `src/components/garden/Mushrooms.tsx` (config array + `MushroomSprite` + memoized wrapper) + a `SCENE_ASSETS.mushrooms` static `require()` array + one mount line in `GardenScene.tsx`. No data/backend.

**Tech:** Expo SDK 54, RN 0.81, TS strict, Jest 29 + RN Testing Library. Repo https://github.com/RohitS199/dog-app-v2, branch `feature/journey-scene-build` (PR [#30](https://github.com/RohitS199/dog-app-v2/pull/30)).

---

## File structure

| File | Responsibility | Create / Modify |
| --- | --- | --- |
| `src/constants/flowerAssets.ts` | add `SCENE_ASSETS.mushrooms` static require array | **Modify** ([current](../../../src/constants/flowerAssets.ts)) |
| `src/components/garden/Mushrooms.tsx` | decorative scatter component (mirror `Clouds.tsx`) | **Create** |
| `src/components/garden/__tests__/Mushrooms.test.tsx` | renders N decorative images; no crash | **Create** |
| `src/components/garden/GardenScene.tsx` | mount `<Mushrooms>` after the bed image | **Modify** ([current](../../../src/components/garden/GardenScene.tsx)) |
| `assets/garden/puplog-mushroom-{1,2,3}.png` | the 3 downscaled mushroom PNGs | **Already present** (committed with the spec) |

**Asset facts (already prepped — see spec §3):** `-1` 724×800 aspect **0.905** (red), `-2` 739×800 aspect **0.924** (amber), `-3` 473×800 aspect **0.591** (tall pink). Transparent. Hardcode the aspects.

---

## Task 0: Worktree + verify assets + baseline

- [ ] **Step 1: Isolated worktree** (skill: `superpowers:using-git-worktrees`). If PR #30 is merged, branch off `origin/main`; otherwise stack off the Journey branch:
```bash
cd /Users/rohitsandur/Documents/Projects/dog_app_ui
git fetch origin
# if #30 merged:
git worktree add .worktrees/meadow-mushrooms -b feature/meadow-mushrooms origin/main
# ELSE stack on the Journey branch (this work depends on the scene built there):
# git worktree add .worktrees/meadow-mushrooms -b feature/meadow-mushrooms origin/feature/journey-scene-build
cp .env .worktrees/meadow-mushrooms/.env     # H1/H2 — app won't boot without it
cd .worktrees/meadow-mushrooms && npm install --legacy-peer-deps
```
> NOTE: the **current active worktree `.worktrees/journey-scene` already has** the 3 downscaled PNGs + this spec/plan committed on `feature/journey-scene-build`. If you branch off that branch you inherit them. If you branch off `main` AFTER #30 merges, they come with the merge.

- [ ] **Step 2: Verify the 3 mushroom assets are present + transparent**
```bash
ls assets/garden/puplog-mushroom-*.png            # expect 3
python3 -c "from PIL import Image; [print(f,*Image.open(f).convert('RGBA').size,'corner',Image.open(f).convert('RGBA').load()[0,0][3]) for f in ['assets/garden/puplog-mushroom-1.png','assets/garden/puplog-mushroom-2.png','assets/garden/puplog-mushroom-3.png']]"
```
Expected: 3 files, sizes ~724×800 / 739×800 / 473×800, corner alpha `0`. If MISSING (branched off a base without them), the originals are untracked in the main repo `assets/garden/` — re‑crop+downscale them with the snippet in the spec §3 / the 2026‑06‑29 session.

- [ ] **Step 3: Baseline tests**
Run: `CI=true npm test 2>&1 | tail -5` → expect green at **~601 tests / 76 suites** (tip of `feature/journey-scene-build`). Record the exact numbers; never regress.

---

## Task 1: Register the mushroom assets

- [ ] **Step 1:** In [`src/constants/flowerAssets.ts`](../../../src/constants/flowerAssets.ts), inside `SCENE_ASSETS` (next to `gardenBed` / `clouds`), add:
```ts
// Painted meadow mushrooms (Gemini drop-ins, downscaled). Static requires only — Metro can't
// resolve dynamic paths (memory: rn-metro-static-require). Aspects: 0.905 / 0.924 / 0.591.
mushrooms: [
  require('../../assets/garden/puplog-mushroom-1.png'),
  require('../../assets/garden/puplog-mushroom-2.png'),
  require('../../assets/garden/puplog-mushroom-3.png'),
],
```
- [ ] **Step 2:** Typecheck quick — `npx tsc --noEmit 2>&1 | grep flowerAssets || echo ok`.

---

## Task 2: `Mushrooms.tsx` (TDD)

- [ ] **Step 1: Write the failing test** — `src/components/garden/__tests__/Mushrooms.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import { Mushrooms } from '../Mushrooms';

describe('Mushrooms', () => {
  it('renders the configured decorative mushroom images', () => {
    const { UNSAFE_getAllByType } = render(<Mushrooms width={390} height={844} />);
    const { Image } = require('react-native');
    expect(UNSAFE_getAllByType(Image).length).toBeGreaterThanOrEqual(5);
  });
  it('does not crash at small/large canvases', () => {
    expect(() => render(<Mushrooms width={320} height={700} />)).not.toThrow();
    expect(() => render(<Mushrooms width={430} height={932} />)).not.toThrow();
  });
});
```
- [ ] **Step 2: Run it — verify RED**
`CI=true npx jest src/components/garden/__tests__/Mushrooms.test.tsx` → FAIL (module missing).

- [ ] **Step 3: Implement `src/components/garden/Mushrooms.tsx`** (mirror [`Clouds.tsx`](../../../src/components/garden/Clouds.tsx); STATIC — no reanimated for v1):
```tsx
import { memo } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SCENE_ASSETS } from '../../constants/flowerAssets';

// Decorative painted mushrooms scattered on the grass AROUND the garden bed (never on the soil).
// Mirrors Clouds.tsx: a deterministic placement array + a11y-hidden wrapper. Placement is by the
// mushroom's BASE point (bottom-center, where it meets the grass). STATIC for v1 (mushrooms are
// rigid; the flowers already carry the wind motion — spec §5). Tune fractions on device.
const ASPECTS = [0.905, 0.924, 0.591]; // index -> w/h, matches SCENE_ASSETS.mushrooms order
const MUSHROOMS = [
  { i: 0, baseX: 0.13, baseY: 0.70, w: 0.10, mirror: false },
  { i: 2, baseX: 0.20, baseY: 0.62, w: 0.06, mirror: false },
  { i: 1, baseX: 0.88, baseY: 0.72, w: 0.095, mirror: true },
  { i: 0, baseX: 0.83, baseY: 0.63, w: 0.055, mirror: true },
  { i: 2, baseX: 0.34, baseY: 0.88, w: 0.07, mirror: false },
  { i: 1, baseX: 0.66, baseY: 0.89, w: 0.075, mirror: true },
].sort((a, b) => a.baseY - b.baseY); // back -> front paint order

function MushroomSprite({ cfg, width, height }: { cfg: (typeof MUSHROOMS)[number]; width: number; height: number }) {
  const w = cfg.w * width;
  const h = w / ASPECTS[cfg.i];
  return (
    <Image
      source={SCENE_ASSETS.mushrooms[cfg.i]}
      resizeMode="contain"
      style={{
        position: 'absolute',
        left: cfg.baseX * width - w / 2,
        top: cfg.baseY * height - h, // base sits on the grass
        width: w,
        height: h,
        transform: cfg.mirror ? [{ scaleX: -1 }] : undefined,
      }}
    />
  );
}

// Memoized on { width, height } so the scene's isFocused toggles don't re-render it (cf. Ground).
export const Mushrooms = memo(function Mushrooms({ width, height }: { width: number; height: number }) {
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {MUSHROOMS.map((cfg, idx) => (
        <MushroomSprite key={idx} cfg={cfg} width={width} height={height} />
      ))}
    </View>
  );
});
```
- [ ] **Step 4: Run it — verify GREEN**
`CI=true npx jest src/components/garden/__tests__/Mushrooms.test.tsx` → PASS.

---

## Task 3: Mount in `GardenScene.tsx`

- [ ] **Step 1: Import** at the top of [`GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) (next to the other garden component imports):
```ts
import { Mushrooms } from './Mushrooms';
```
- [ ] **Step 2: Mount** immediately AFTER the garden‑base `<Image source={SCENE_ASSETS.gardenBed} … />` block and BEFORE the doghouse contact shadow:
```tsx
{/* Decorative mushrooms scattered on the meadow around the bed (static; a11y-hidden). */}
<Mushrooms width={width} height={height} />
```
- [ ] **Step 3: Verify the scene still renders + commit**
```bash
CI=true npx jest src/components/garden/__tests__/GardenScene.test.tsx   # PASS (renders emptyWeek)
CI=true npm test 2>&1 | tail -5                                          # no regression
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l   # expect 0
git add src/constants/flowerAssets.ts src/components/garden/Mushrooms.tsx src/components/garden/__tests__/Mushrooms.test.tsx src/components/garden/GardenScene.tsx
git commit -m "feat(garden): scatter decorative meadow mushrooms around the bed

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Device QA + tune placement (with the user)

- [ ] **Step 1:** `npx expo start -c` → user scans QR → confirm on a physical iPhone (the agent cannot screenshot — handoff hazard):
  - mushrooms read as tasteful accents **on the grass around the bed** — none on the soil/rocks, doghouse, or under the CTA/tab bar;
  - they look **varied** (sizes + mirrored, not 6 identical copies) and **depth** reads right (smaller = farther);
  - **Emergency chip** still present + tappable; **VoiceOver** announces only the per‑day markers (no new nodes).
- [ ] **Step 2:** Tune the `MUSHROOMS` fractions (`baseX`/`baseY`/`w`/`mirror`) and the count live until the user is happy. Re‑run `CI=true npm test 2>&1 | tail -5` after edits (the count assertion ≥5 must still hold — adjust the test if the user wants fewer).

---

## Task 5 (OPTIONAL — only if the user asks): faint idle sway

- [ ] Reuse the [`SwayingFlower.tsx`](../../../src/components/garden/SwayingFlower.tsx) pattern (shared clock + `active` multiplier) with a tiny amplitude (1–2°), `transformOrigin: 'bottom'`, gated on `useReducedMotion()` + the scene's `isFocused` (pass `paused` into `Mushrooms` like `Clouds` does). Add a "does not crash when paused / reduced motion" test (mirror `Clouds.test.tsx`). **Skip entirely for v1.**

---

## Task 6: Final verification + PR

- [ ] **Step 1** (`superpowers:verification-before-completion`) — paste REAL output:
```bash
CI=true npm test 2>&1 | tail -6
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l   # 0
npx expo export --platform ios 2>&1 | tail -5
```
- [ ] **Step 2** (`superpowers:requesting-code-review` → `superpowers:finishing-a-development-branch`): open the PR:
```bash
git push -u origin feature/meadow-mushrooms
gh pr create --repo RohitS199/dog-app-v2 --base main --head feature/meadow-mushrooms \
  --title "feat(garden): decorative meadow mushrooms on the Journey hero" \
  --body "Scatters the 3 Gemini mushroom drop-ins across the meadow around the bed. Decorative, a11y-hidden, static (v1). Spec: docs/superpowers/specs/2026-06-29-journey-meadow-mushrooms-design.md"
```
> If PR #30 hasn't merged and you stacked on `feature/journey-scene-build`, either set `--base feature/journey-scene-build` (stacked PR) or rebase onto `main` after #30 merges — your call with the user.

---

## Self‑review (by the plan author)

- **Spec coverage:** §3 assets → Task 0/1; §4 component + mount → Tasks 2–3; §5 animation → Task 5 (optional); §8 testing → Tasks 2–3; §9 verification → Task 6. ✅
- **No placeholders:** the `MUSHROOMS` array has concrete starting fractions + an explicit "tune on device" step (Task 4). ✅
- **Reuses precedent:** `Clouds.tsx` (scatter + a11y‑hidden + memo) and the `gardenBed` `<Image>` mount. No new patterns. ✅
- **Guardrails:** decorative + a11y‑hidden; Golden‑Rule surfaces untouched; soil/doghouse/CTA avoided; static requires; downscaled assets. ✅
- **Skills:** mandated in the header + Task 0 + Task 6; create/find‑online options included. ✅
