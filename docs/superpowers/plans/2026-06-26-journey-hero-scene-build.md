# Journey Hero — Scene Build (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> ⚠️ **BEFORE YOU START — SKILLS ARE MANDATORY (the user is explicit, every session).** Use the skills we have, create one when a workflow recurs, or find a reputable/reliable/well-reviewed one online (`npx skills find "<q>"`, https://skills.sh/trending, `npx skills add <owner/repo@skill> -g -y`). See the design spec [`docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md` §0 + §9](../specs/2026-06-26-journey-hero-scene-build-design.md). At minimum here: `react-native-architecture` + `react-native-best-practices` (FPS), `superpowers:test-driven-development` (every helper), `accessibility-compliance` (every surface), `superpowers:using-git-worktrees`, `superpowers:verification-before-completion`.

**Goal:** Build the Journey garden hero's Phase-1 "no-art" scene layers — doghouse grounding (contact shadow + dog-name sign), drifting clouds + an interim sky gradient, a bobbing Biscuit mascot, and a fluttering butterfly — on top of the existing garden plumbing, leaving the baked watercolor ground for Phase 2.

**Architecture:** Extend [`src/components/garden/GardenScene.tsx`](../../../src/components/garden/GardenScene.tsx) (the absolutely-positioned layer cake). New self-contained, decorative, animated child components (`Clouds`, `Butterfly`) + an in-scene doghouse shadow/name overlay + a Biscuit bob wrapper. All idle loops use `react-native-reanimated` `withTiming`/`withRepeat` (no springs), gated behind `useReducedMotion()` and paused off-focus via `@react-navigation/native`'s `useIsFocused()`. The baked ground (Phase 2) drops in behind everything later with no rework.

**Tech Stack:** Expo SDK 54, RN 0.81, TS strict, `react-native-reanimated ~4.1.1`, `expo-linear-gradient ~15.0.8`, `react-native-svg 15.12.1` (all verified installed in [`package.json`](../../../package.json)). Jest 29 + React Native Testing Library.

**Spec:** [`docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md`](../specs/2026-06-26-journey-hero-scene-build-design.md). Companion: [`2026-06-24-journey-hero-visual-build.md`](../specs/2026-06-24-journey-hero-visual-build.md) (per-layer §7, palette §8, animation §9). Visual truth: [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html).

---

## File structure

| File | Responsibility | Create / Modify |
| --- | --- | --- |
| `src/components/garden/GardenScene.tsx` | Scene layer cake — add sky gradient, doghouse shadow + name, mount `Clouds`/`Biscuit bob`/`Butterfly` | **Modify** ([current](../../../src/components/garden/GardenScene.tsx)) |
| `app/(tabs)/index.tsx` | Pass `dogName` into `GardenScene` | **Modify** (call site line 85) |
| `src/components/garden/Clouds.tsx` | 3 drifting decorative cloud images, reduced-motion + paused aware | **Create** |
| `src/components/garden/Butterfly.tsx` | `react-native-svg` butterfly, drift + wing flap, reduced-motion + paused aware | **Create** |
| `src/components/garden/__tests__/GardenScene.test.tsx` | Render + dogName + decorative assertions | **Create** (if absent) |
| `src/components/garden/__tests__/Clouds.test.tsx` | Renders 3 clouds, decorative, reduced-motion safe | **Create** |
| `src/components/garden/__tests__/Butterfly.test.tsx` | Renders, decorative, reduced-motion safe | **Create** |
| `jest.setup.js` | Reanimated mock additions if a test needs them | **Modify** (only if needed) |

**Decision recorded in the spec ([§4.1](../specs/2026-06-26-journey-hero-scene-build-design.md)): do NOT build code flower-stems** — the delivered flower art already includes stems + leaves (verified by alpha profile). Skip stems unless on-device QA shows clusters look floaty.

---

## Task 0: Worktree setup + verify the transparent art renders

**Files:** none (environment).

- [ ] **Step 1: Branch off the right base in an isolated worktree**

The garden code is only in PR [#26](https://github.com/RohitS199/dog-app-v2/pull/26) (`feature/journey-garden-hero`); the art is in PR [#28](https://github.com/RohitS199/dog-app-v2/pull/28). **Preferred:** after the user merges #28 then #26, branch off `origin/main`. **If building before merge**, branch off the garden branch and bring the art in:

```bash
cd /Users/rohitsandur/Documents/Projects/dog_app_ui
git fetch origin
# If #26 + #28 are merged to main:
git worktree add .worktrees/journey-scene -b feature/journey-scene-build origin/main
# ELSE (pre-merge) branch off the garden code branch:
# git worktree add .worktrees/journey-scene -b feature/journey-scene-build origin/feature/journey-garden-hero
cp .env .worktrees/journey-scene/.env   # H1/H2 — app won't boot without it
cd .worktrees/journey-scene && npm install --legacy-peer-deps
```

- [ ] **Step 2: Ensure the transparent art is present**

```bash
# in the worktree:
ls assets/garden/flowers/ | wc -l          # expect 24
python3 -c "from PIL import Image; im=Image.open('assets/garden/puplog-doghouse.png').convert('RGBA'); px=im.load(); print('doghouse transparent:', max(px[0,0][3],px[im.size[0]-1,0][3])<10)"
```
Expected: `24` and `doghouse transparent: True`. If the art is missing (pre-merge branch off main), `git checkout origin/assets/garden-art -- assets/garden`.

- [ ] **Step 3: Establish the test baseline**

Run: `CI=true npm test 2>&1 | tail -5`
Expected: green at the garden baseline (**~573 tests / 68 suites** — design spec [§8](../specs/2026-06-26-journey-hero-scene-build-design.md)). Record the exact numbers; every later task must not regress them.

- [ ] **Step 4: (Optional) device smoke-check the art**

Run: `npx expo start -c --dev-client` → user scans QR → confirms flowers + doghouse now render **transparent with their built-in stems** on the flat-green base. (Agent cannot screenshot — [`HANDOFF.md` H12](../../../HANDOFF.md).) No commit.

---

## Task 1: Doghouse contact shadow + dog-name sign

**Files:**
- Modify: `src/components/garden/GardenScene.tsx` (props line 26–30; doghouse block 104–116)
- Modify: `app/(tabs)/index.tsx:85` (GardenScene call site)
- Test: `src/components/garden/__tests__/GardenScene.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/garden/__tests__/GardenScene.test.tsx`:

```tsx
import { render } from '@testing-library/react-native';
import { GardenScene } from '../GardenScene';
import type { GardenWeek } from '../../../lib/gardenWeek';

const emptyWeek: GardenWeek = {
  days: [{ date: '2026-06-22', weekday: 0, state: 'today', moodKey: null, tier: 0, seed: 's0' } as any],
} as GardenWeek;

describe('GardenScene doghouse name', () => {
  it('renders the dog name on the doghouse sign', () => {
    const { getByText } = render(
      <GardenScene week={emptyWeek} width={390} height={359} dogName="Luna" />
    );
    expect(getByText('Luna')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it — verify it fails**

Run: `CI=true npx jest src/components/garden/__tests__/GardenScene.test.tsx -t "dog name"`
Expected: FAIL — `dogName` is not a prop yet / "Luna" not found.

- [ ] **Step 3: Add the `dogName` prop**

In `src/components/garden/GardenScene.tsx`, extend the `Props` interface (currently lines 26–30):

```tsx
interface Props {
  week: GardenWeek;
  width: number;
  height: number;
  dogName?: string;
}
```
And the signature (line 55): `export function GardenScene({ week, width, height, dogName }: Props) {`

- [ ] **Step 4: Render the contact shadow + name sign**

Import `Text` (add to the `react-native` import on line 2: `import { View, Image, StyleSheet, Text } from 'react-native';`). Inside the doghouse block, render a tight contact-shadow ellipse **before** the doghouse `<Image>` and the name **after** it. Replace the doghouse `<Image>` (lines 104–116) with:

```tsx
{/* Tight contact shadow tucked under the doghouse base (NOT a big soft far oval). */}
<View
  pointerEvents="none"
  accessibilityElementsHidden
  importantForAccessibility="no-hide-descendants"
  style={{
    position: 'absolute',
    top: height * 0.06 + height * 0.3 * 0.92,   // ~base of the doghouse image
    left: (0.5 - DOGHOUSE_W / 2) * width + DOGHOUSE_W * width * 0.12,
    width: DOGHOUSE_W * width * 0.76,
    height: height * 0.035,
    backgroundColor: 'rgba(46,32,18,0.32)',     // 2026-06-23 §9.1 / mockup line 883
    borderRadius: height * 0.02,
  }}
/>
{/* Doghouse (transparent scene PNG). */}
<Image
  source={SCENE_ASSETS.doghouse}
  resizeMode="contain"
  accessibilityElementsHidden
  importantForAccessibility="no-hide-descendants"
  style={{
    position: 'absolute',
    top: height * 0.06,
    left: (0.5 - DOGHOUSE_W / 2) * width,
    width: DOGHOUSE_W * width,
    height: height * 0.3,
  }}
/>
{/* Dog name on the doghouse sign. Sign rect measured from the PNG with PIL (Step 6). */}
{dogName ? (
  <Text
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    numberOfLines={1}
    style={{
      position: 'absolute',
      top: height * 0.06 + height * 0.3 * SIGN_TOP_RATIO,
      left: (0.5 - DOGHOUSE_W / 2) * width,
      width: DOGHOUSE_W * width,
      textAlign: 'center',
      fontFamily: OB_FONTS.handwritten,
      fontSize: Math.max(11, DOGHOUSE_W * width * 0.10),
      color: '#4A3520',
    }}
  >
    {dogName}
  </Text>
) : null}
```

Add the import + constant near the top:
```tsx
import { OB_FONTS } from '../../constants/onboardingTheme';
const SIGN_TOP_RATIO = 0.62; // fraction of doghouse height to the sign center — refine in Step 6
```
(`OB_FONTS.handwritten` = Caveat, globally loaded — confirmed in the visual-build spec [§7.13](../specs/2026-06-24-journey-hero-visual-build.md).)

- [ ] **Step 5: Run the test — verify it passes**

Run: `CI=true npx jest src/components/garden/__tests__/GardenScene.test.tsx`
Expected: PASS.

- [ ] **Step 6: Refine the sign position from the actual PNG (PIL)**

The doghouse sign location must match the art. Measure it:
```bash
python3 - <<'PY'
from PIL import Image
im=Image.open('assets/garden/puplog-doghouse.png').convert('RGBA'); w,h=im.size; px=im.load()
# Find the cream sign band: scan rows for a horizontal run of light, low-saturation pixels.
for frac in [0.55,0.60,0.62,0.65,0.70]:
    y=int(h*frac); row=[px[x,y] for x in range(w)]
    light=sum(1 for r,g,b,a in row if a>200 and min(r,g,b)>180)
    print(f"y={frac:.2f} light-run={light}")
PY
```
Set `SIGN_TOP_RATIO` to the fraction with the widest light run (the sign). Re-run Step 5.

- [ ] **Step 7: Pass `dogName` from the screen**

In `app/(tabs)/index.tsx`, the call site is line 85: `<GardenScene week={week} width={width} height={width * 0.92} />`. `dog` is defined at line 32 (`const dog = dogs.find(...) ?? dogs[0]`). Change to:
```tsx
<GardenScene week={week} width={width} height={width * 0.92} dogName={dog?.name ?? ''} />
```

- [ ] **Step 8: Verify + commit**

Run: `CI=true npm test 2>&1 | tail -5` (no regression) and the filtered typecheck:
`npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l` → expect `0`.
```bash
git add src/components/garden/GardenScene.tsx "app/(tabs)/index.tsx" src/components/garden/__tests__/GardenScene.test.tsx
git commit -m "feat(garden): ground the doghouse with a contact shadow + dog-name sign

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Interim sky gradient

**Files:**
- Modify: `src/components/garden/GardenScene.tsx` (root View line 89–90)

- [ ] **Step 1: Replace the flat-green background with a vertical gradient**

`LAWN` (line 23) is interim; the Phase-2 baked ground owns the real sky. Add the import:
```tsx
import { LinearGradient } from 'expo-linear-gradient';
```
The current root is `<View style={[styles.scene, { width, height, backgroundColor: LAWN }]}>` (line 90). Render a full-bleed gradient as the **first child** (behind everything), keeping the box `View`:
```tsx
<View style={[styles.scene, { width, height }]}>
  {/* Interim sky→meadow gradient (mockup line 62) — replaced by the baked ground PNG in Phase 2. */}
  <LinearGradient
    colors={['#b3d9ed', '#bcdfef', '#b7d49d', '#aec59a']}
    locations={[0, 0.33, 0.42, 1]}
    style={StyleSheet.absoluteFill}
    pointerEvents="none"
  />
  {/* ...existing soil bed, doghouse, blooms, a11y markers... */}
```
(Remove `backgroundColor: LAWN` from the root style; keep `LAWN`/`SOIL` constants — `SOIL` is still used by the bed ellipse.)

- [ ] **Step 2: Verify it renders (no test needed — pure visual; reuse the GardenScene test)**

Run: `CI=true npx jest src/components/garden/__tests__/GardenScene.test.tsx`
Expected: PASS (the existing render test still mounts the scene). If `expo-linear-gradient` isn't mocked and the render throws, add to `jest.setup.js`:
```js
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
```

- [ ] **Step 3: Commit**

```bash
git add src/components/garden/GardenScene.tsx jest.setup.js
git commit -m "feat(garden): interim sky gradient behind the scene (Phase-2 ground replaces it)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Drifting clouds

**Files:**
- Create: `src/components/garden/Clouds.tsx`
- Create: `src/components/garden/__tests__/Clouds.test.tsx`
- Modify: `src/components/garden/GardenScene.tsx` (mount `<Clouds>`)

- [ ] **Step 1: Write the failing test**

Create `src/components/garden/__tests__/Clouds.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import { Clouds } from '../Clouds';

describe('Clouds', () => {
  it('renders three decorative cloud images', () => {
    const { UNSAFE_getAllByType } = render(<Clouds width={390} height={359} paused={false} />);
    const { Image } = require('react-native');
    expect(UNSAFE_getAllByType(Image).length).toBe(3);
  });

  it('does not crash with reduced motion / paused', () => {
    expect(() => render(<Clouds width={390} height={359} paused />)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it — verify it fails**

Run: `CI=true npx jest src/components/garden/__tests__/Clouds.test.tsx`
Expected: FAIL — `Clouds` module does not exist.

- [ ] **Step 3: Implement `Clouds.tsx`**

```tsx
import { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat,
  useReducedMotion, cancelAnimation, Easing,
} from 'react-native-reanimated';
import { SCENE_ASSETS } from '../../constants/flowerAssets';

// Per-cloud config from 2026-06-23 §9.4 (top/width as fractions of the scene box; secs = drift period).
const CLOUDS = [
  { src: require('../../../assets/garden/puplog-cloud-1.png'), top: 0.08, w: 0.31, opacity: 1.0, secs: 75, phase: 0.0 },
  { src: require('../../../assets/garden/puplog-cloud-2.png'), top: 0.18, w: 0.39, opacity: 0.6, secs: 120, phase: 0.5 },
  { src: require('../../../assets/garden/puplog-cloud-3.png'), top: 0.13, w: 0.19, opacity: 0.72, secs: 96, phase: 0.25 },
];

function Cloud({ cfg, width, height, paused }: {
  cfg: typeof CLOUDS[number]; width: number; height: number; paused: boolean;
}) {
  const reduced = useReducedMotion();
  const active = !paused && !reduced;
  const cloudW = cfg.w * width;
  const travel = width + cloudW;          // off-left to off-right
  const x = useSharedValue(-cloudW + cfg.phase * travel);

  useEffect(() => {
    if (!active) return;
    const startX = -cloudW + cfg.phase * travel;
    x.value = startX;
    x.value = withRepeat(
      withTiming(width, { duration: cfg.secs * 1000, easing: Easing.linear }),
      -1, false
    );
    return () => cancelAnimation(x);
  }, [active, width]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: cfg.top * height, opacity: cfg.opacity }, style]}
    >
      <Image source={cfg.src} resizeMode="contain" style={{ width: cloudW, height: cloudW * 0.5 }} />
    </Animated.View>
  );
}

export function Clouds({ width, height, paused }: { width: number; height: number; paused: boolean }) {
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
    >
      {CLOUDS.map((cfg, i) => (
        <Cloud key={i} cfg={cfg} width={width} height={height} paused={paused} />
      ))}
    </Animated.View>
  );
}
```
(Cloud `require()`s are static — Metro-safe, memory `feedback_rn_metro_static_require.md`. Cloud aspect ~2:1 per PR #28 dims.)

- [ ] **Step 4: Run the test — verify it passes**

Run: `CI=true npx jest src/components/garden/__tests__/Clouds.test.tsx`
Expected: PASS. If the reanimated mock lacks `cancelAnimation`/`withRepeat`, add them in `jest.setup.js` (the mock already has `withSequence` — visual-build spec [§9](../specs/2026-06-24-journey-hero-visual-build.md)):
```js
// inside the existing react-native-reanimated mock factory:
cancelAnimation: jest.fn(),
withRepeat: (v) => v,
```

- [ ] **Step 5: Mount `<Clouds>` in the scene (above the sky, below the doghouse)**

In `GardenScene.tsx`, after the sky gradient and before the soil bed, add `<Clouds width={width} height={height} paused={!isFocused} />`. Add focus tracking at the top of the component:
```tsx
import { useIsFocused } from '@react-navigation/native';
// inside GardenScene:
const isFocused = useIsFocused();
```
(`@react-navigation/native` is already a dep — used by the tab navigator / `FloatingTabBar`. Add to `jest.setup.js` if not mocked: `jest.mock('@react-navigation/native', () => ({ ...jest.requireActual('@react-navigation/native'), useIsFocused: () => true }));`.)

- [ ] **Step 6: Verify + commit**

Run: `CI=true npm test 2>&1 | tail -5` (no regression).
```bash
git add src/components/garden/Clouds.tsx src/components/garden/__tests__/Clouds.test.tsx src/components/garden/GardenScene.tsx jest.setup.js
git commit -m "feat(garden): drifting clouds (reduced-motion + off-focus paused)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Biscuit mascot bob

**Files:**
- Modify: `src/components/garden/GardenScene.tsx` (mount `BiscuitMascot` in a bob wrapper)

- [ ] **Step 1: Add a bob wrapper + mount Biscuit**

Reuse the existing placeholder [`src/components/onboarding/BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx) (already reduced-motion-safe; it does a wag). Add a vertical **bob** via a wrapper. In `GardenScene.tsx`, import and add a small local component (or inline). Position per mockup `.biscuit-slot` (visual-build spec [§7.10](../specs/2026-06-24-journey-hero-visual-build.md)) — near the doghouse, on the ground line:
```tsx
import { BiscuitMascot } from '../onboarding/BiscuitMascot';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, useReducedMotion, cancelAnimation, Easing } from 'react-native-reanimated';

function BiscuitBob({ width, height, paused }: { width: number; height: number; paused: boolean }) {
  const reduced = useReducedMotion();
  const active = !paused && !reduced;
  const y = useSharedValue(0);
  useEffect(() => {
    if (!active) return;
    y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ), -1, false
    );
    return () => cancelAnimation(y);
  }, [active]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: 'absolute', top: height * 0.30, left: width * 0.62 }, style]}
    >
      <BiscuitMascot size="lg" wag={false} />
    </Animated.View>
  );
}
```
Mount `<BiscuitBob width={width} height={height} paused={!isFocused} />` in the scene **after** the doghouse (so Biscuit sits in front). Tune `top`/`left` on device.

- [ ] **Step 2: Verify it still renders + commit**

Run: `CI=true npx jest src/components/garden/__tests__/GardenScene.test.tsx` (mounts the whole scene including Biscuit). Expected: PASS. Then `CI=true npm test 2>&1 | tail -5` (no regression).
```bash
git add src/components/garden/GardenScene.tsx
git commit -m "feat(garden): mount Biscuit with a gentle bob (placeholder art; reduced-motion safe)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
> NOTE: swap `BiscuitMascot` for the watercolor Biscuit PNG when the user generates it (design spec [§7](../specs/2026-06-26-journey-hero-scene-build-design.md)).

---

## Task 5: Butterfly

**Files:**
- Create: `src/components/garden/Butterfly.tsx`
- Create: `src/components/garden/__tests__/Butterfly.test.tsx`
- Modify: `src/components/garden/GardenScene.tsx` (mount `<Butterfly>`)

- [ ] **Step 1: Write the failing test**

Create `src/components/garden/__tests__/Butterfly.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import { Butterfly } from '../Butterfly';

describe('Butterfly', () => {
  it('renders without crashing (decorative)', () => {
    expect(() => render(<Butterfly width={390} height={359} paused={false} />)).not.toThrow();
  });
  it('does not crash when paused', () => {
    expect(() => render(<Butterfly width={390} height={359} paused />)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it — verify it fails**

Run: `CI=true npx jest src/components/garden/__tests__/Butterfly.test.tsx`
Expected: FAIL — `Butterfly` module does not exist.

- [ ] **Step 3: Implement `Butterfly.tsx`**

```tsx
import { useEffect } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence,
  useReducedMotion, cancelAnimation, Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// Decorative butterfly: drift across + flap wings. 2026-06-23 §9.3. No art needed.
export function Butterfly({ width, height, paused }: { width: number; height: number; paused: boolean }) {
  const reduced = useReducedMotion();
  const active = !paused && !reduced;
  const t = useSharedValue(0);   // 0..1 drift across the scene
  const flap = useSharedValue(1);

  useEffect(() => {
    if (!active) return;
    t.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }), -1, false);
    flap.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 220, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 220, easing: Easing.inOut(Easing.ease) })
      ), -1, false
    );
    return () => { cancelAnimation(t); cancelAnimation(flap); };
  }, [active]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.value * width * 0.8 + width * 0.1 },
      { translateY: height * 0.4 + Math.sin(t.value * Math.PI * 4) * 18 },
    ],
  }));
  const leftWing = useAnimatedStyle(() => ({ transform: [{ scaleX: flap.value }] }));
  const rightWing = useAnimatedStyle(() => ({ transform: [{ scaleX: flap.value }] }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, width: 18, height: 14 }, containerStyle]}
    >
      <Animated.View style={[{ position: 'absolute', left: 0 }, leftWing]}>
        <Svg width={10} height={14}><Path d="M9 7 C2 0 0 4 1 7 C0 10 2 14 9 7 Z" fill="#E9A6C0" /></Svg>
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', left: 8 }, rightWing]}>
        <Svg width={10} height={14}><Path d="M1 7 C8 0 10 4 9 7 C10 10 8 14 1 7 Z" fill="#E9A6C0" /></Svg>
      </Animated.View>
    </Animated.View>
  );
}
```

- [ ] **Step 4: Run the test — verify it passes**

Run: `CI=true npx jest src/components/garden/__tests__/Butterfly.test.tsx`
Expected: PASS. If `react-native-svg` isn't mocked, add to `jest.setup.js`:
```js
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Svg: 'Svg', Path: 'Path' }));
```

- [ ] **Step 5: Mount `<Butterfly>` near the top of the diegetic layer**

In `GardenScene.tsx`, mount `<Butterfly width={width} height={height} paused={!isFocused} />` after Biscuit (front-most ambient).

- [ ] **Step 6: Verify + commit**

Run: `CI=true npm test 2>&1 | tail -5` (no regression).
```bash
git add src/components/garden/Butterfly.tsx src/components/garden/__tests__/Butterfly.test.tsx src/components/garden/GardenScene.tsx jest.setup.js
git commit -m "feat(garden): fluttering butterfly (react-native-svg; reduced-motion + paused)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Final verification + PR

**Files:** none (verification).

- [ ] **Step 1: Full suite + typecheck + bundle (`superpowers:verification-before-completion`)**

```bash
CI=true npm test 2>&1 | tail -6
npx tsc --noEmit 2>&1 | grep "error TS" | grep -v "@expo/vector-icons" | grep -v "app/(tabs)/index.tsx" | grep -v "app/(tabs)/learn.tsx" | wc -l   # expect 0
npx expo export --platform ios 2>&1 | tail -5   # clean bundle
```
Expected: test count ≥ the Task-0 baseline (plus the new Clouds/Butterfly/GardenScene tests), tsc `0`, clean export. **Paste the real output** — no "should pass" claims (design spec [§8](../specs/2026-06-26-journey-hero-scene-build-design.md)).

- [ ] **Step 2: Device QA with the user**

`npx expo start -c --dev-client` → user scans QR → confirms on device: doghouse grounded with name + shadow; clouds drift; Biscuit bobs; butterfly flutters; **all motion respects iOS Reduce Motion**; Emergency surface (`EmergencyChip`) still present and tappable; VoiceOver still announces one marker per planted day and nothing new (design spec [§8 guardrails](../specs/2026-06-26-journey-hero-scene-build-design.md)). Tune the `top`/`left` constants live as needed.

- [ ] **Step 3: Code review + PR**

`superpowers:requesting-code-review`, then open the PR to `origin/main`:
```bash
git push -u origin feature/journey-scene-build
gh pr create --repo RohitS199/dog-app-v2 --base main --head feature/journey-scene-build \
  --title "feat(garden): Journey hero Phase-1 scene (doghouse grounding, clouds, Biscuit, butterfly)" \
  --body "Phase-1 no-art scene layers per docs/superpowers/specs/2026-06-26-journey-hero-scene-build-design.md. Baked watercolor ground = Phase 2."
```

---

## Self-review (done by the plan author)

- **Spec coverage:** §4.2 doghouse grounding → Task 1; §4.3 clouds + sky → Tasks 2–3; §4.4 Biscuit bob → Task 4; §4.5 butterfly → Task 5; §4.1 stems → explicitly **dropped** (art has them); §8 verification → Task 6. Phase-2 baked ground ([spec §5](../specs/2026-06-26-journey-hero-scene-build-design.md)) is intentionally **out of scope** (separate, art-gated).
- **Placeholder scan:** no "TBD"/"add error handling" — the one tunable (`SIGN_TOP_RATIO`) has a concrete starting value + a PIL measurement step (Task 1 Step 6) and on-device tuning.
- **Type consistency:** `Clouds`/`Butterfly` props `{ width, height, paused }` consistent across create + mount; `GardenScene` gains `dogName?: string` (Task 1) used in Task 1 Step 7; `isFocused` (Task 3 Step 5) reused by Tasks 4–5.
- **Guardrails:** every new sprite is `accessibilityElementsHidden`; all loops are `useReducedMotion()`-gated + `paused`-aware; Emergency surface untouched (design spec [§8](../specs/2026-06-26-journey-hero-scene-build-design.md)).
