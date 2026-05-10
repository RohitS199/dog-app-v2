# Profile Screen Redesign — PR 1 (Foundations) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the foundations for the 10-screen Profile redesign — theme extensions, all 13 shared scrapbook primitives in `src/components/profile/`, an empty Profile route group, and the Profile tab fallback icon — without touching any existing screen logic. Subsequent PRs (2–6) consume these primitives.

**Architecture:** PR 1 is the foundations layer. It (a) extends `onboardingTheme.ts` with new color/radii/spacing/font tokens, (b) creates 13 reusable scrapbook components in a new `src/components/profile/` directory using strict TDD, (c) introduces the `app/(tabs)/profile/` Expo Router stack with an empty index, (d) replaces the `settings` tab with `profile` in `FloatingTabBar` using an inline-SVG fallback icon, and (e) deletes the old `app/(tabs)/settings.tsx`. No existing screens are re-skinned. Each component has a behavioral test before implementation.

**Tech Stack:** React Native (Expo SDK 54), TypeScript strict, Expo Router v6, Zustand, react-native-reanimated v4, react-native-svg, Jest 29 + React Native Testing Library, `@expo-google-fonts/nunito` (new dependency).

**Out of scope for PR 1 (deferred):** All screens beyond an empty Profile root (PRs 2–6); subscription, notifications, achievements stores; Supabase migrations; Edge Function `check-achievements`; tab label/icon swap for Journey/My Dogs/Discovery (PR 6); LogOutModal wiring to `signOut()` (PR 6).

---

## Settled Spec Reference

This plan implements **§2 (Architecture)**, **§6 (Theme extensions)**, **§7.1 (Shared primitives only — no sticker subsystem)**, **§8 (Tab Bar — Profile only)**, **§10 (PR 1 row)**, and the relevant tests from **§11** of `docs/superpowers/specs/2026-05-09-profile-screen-redesign-design.md`.

Decisions in spec **§0.6** are locked. Do not re-litigate.

---

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `src/constants/onboardingTheme.ts` | Modify | Add new colors, radii, spacing, Nunito font tokens |
| `src/constants/profileCopy.ts` | Create | Copy strings for Profile screens (i18n preparation) |
| `app/_layout.tsx` | Modify | Add Nunito to `useFonts()` |
| `package.json` | Modify | Add `@expo-google-fonts/nunito` |
| `jest.setup.js` | Modify | Mock `@expo-google-fonts/nunito` |
| `src/components/profile/glyphs.tsx` | Create | Inline SVG icons + Profile tab fallback glyph |
| `src/components/profile/NavBar.tsx` | Create | Header with back chevron + centered title |
| `src/components/profile/StickerIcon.tsx` | Create | 26×26 rounded square with single Caveat character |
| `src/components/profile/RowItem.tsx` | Create | Peach-soft pill row with leading icon, centered label, chevron |
| `src/components/profile/NavButton.tsx` | Create | Profile-root variant of RowItem with left-aligned label |
| `src/components/profile/WoodPortrait.tsx` | Create | Wood-frame avatar with optional photo |
| `src/components/profile/Toggle.tsx` | Create | 36×20 pill toggle with Reanimated thumb |
| `src/components/profile/ToggleRow.tsx` | Create | Row shell + label/sub stack + Toggle (optimistic) |
| `src/components/profile/InfoField.tsx` | Create | Bordered input with icon + label/value stack |
| `src/components/profile/PillButton.tsx` | Create | Pill CTA (Log Out + modal buttons) |
| `src/components/profile/SaveButton.tsx` | Create | Two-layer Duolingo-style press button |
| `src/components/profile/PerkRow.tsx` | Create | Subscription perk row with green check circle |
| `src/components/profile/LogOutModal.tsx` | Create | Bottom-pinned card modal with backdrop |
| `src/components/profile/__tests__/NavBar.test.tsx` | Create | 4 tests |
| `src/components/profile/__tests__/StickerIcon.test.tsx` | Create | 2 tests |
| `src/components/profile/__tests__/RowItem.test.tsx` | Create | 6 tests |
| `src/components/profile/__tests__/NavButton.test.tsx` | Create | 3 tests |
| `src/components/profile/__tests__/WoodPortrait.test.tsx` | Create | 5 tests |
| `src/components/profile/__tests__/Toggle.test.tsx` | Create | 6 tests |
| `src/components/profile/__tests__/ToggleRow.test.tsx` | Create | 5 tests |
| `src/components/profile/__tests__/InfoField.test.tsx` | Create | 8 tests |
| `src/components/profile/__tests__/PillButton.test.tsx` | Create | 4 tests |
| `src/components/profile/__tests__/SaveButton.test.tsx` | Create | 4 tests |
| `src/components/profile/__tests__/PerkRow.test.tsx` | Create | 2 tests |
| `src/components/profile/__tests__/LogOutModal.test.tsx` | Create | 8 tests |
| `app/(tabs)/profile/_layout.tsx` | Create | Stack navigator |
| `app/(tabs)/profile/index.tsx` | Create | Empty Profile root (text placeholder) |
| `app/(tabs)/_layout.tsx` | Modify | Replace `settings` tab with `profile` |
| `app/(tabs)/settings.tsx` | Delete | Replaced by Profile route group |
| `src/components/ui/FloatingTabBar.tsx` | Modify | Profile tab handling + inline SVG fallback icon |

**Test count target:** baseline 279 → 279 + 57 = 336 after PR 1. **Suite count target:** 22 → 34.

---

## Spacing Token Decision (Locked)

Spec §6.1 declares `OB_SPACING.gap1 = 4` and `OB_SPACING.gap2 = 6`. `gap2 = 6` collides with the existing `OB_SPACING.gap2 = 12` used by onboarding screens.

**Resolution:** add `OB_SPACING.gap1 = 4` (no collision). **Do not** add `gap2 = 6` or invent a `gap1_5 = 6` token — the 6pt value is a Profile-root nav-row spacing one-off that the handoff specifies. When that use-site lands (Profile root NavButton stack in PR 2), inline the 6 at the call-site with a comment:

```ts
gap: 6, // Profile root nav-row spacing — handoff one-off, not a scale value
```

If `6` later appears in multiple components, promote to a semantic token (e.g. `OB_SPACING.profileNavRowGap`) then. We don't pre-tokenize a single use-site, and we don't introduce fractional names below `gap2 = 12` because `OB_SPACING` has no fractional scale.

PR 1 contains no consumer of either `gap1: 4` or `6` — both first appear in PR 2 components. The token (`gap1: 4`) is added now because it's spec-canonical and harmless; the inline-6 use-site lands in PR 2.

---

## Pre-Flight

### Task 0: Pre-flight — commit spec, verify baseline

**Files:**
- Modify (commit only): `docs/superpowers/specs/2026-05-09-profile-screen-redesign-design.md`

- [ ] **Step 1: Verify clean working tree of relevant files**

Run: `git status docs/superpowers/specs/2026-05-09-profile-screen-redesign-design.md`
Expected: file shown as `AM` (added but uncommitted) or `A` (staged).

- [ ] **Step 2: Commit the spec file**

```bash
git add docs/superpowers/specs/2026-05-09-profile-screen-redesign-design.md
git commit -m "$(cat <<'EOF'
Add Profile screen redesign design spec

10 screens + tab restructure (5→4 tabs) + 3 new Supabase tables +
account-level sticker system. 6-PR foundations-first sequencing.
Locked decisions and out-of-scope items in §0.6 and §13.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Verify baseline test count is 279**

Run: `npm test -- --listTests 2>/dev/null | wc -l`
Expected: 22 (suite count baseline).

Run: `npm test 2>&1 | grep -E "Tests:" | tail -1`
Expected: `Tests:       279 passed, 279 total` (or close — record exact baseline).

- [ ] **Step 4: Verify type-check is green**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Record baseline in commit message scratch (no commit yet)**

No action — just confirm to yourself: tests=279, suites=22, types=clean. PR 1 ends with tests=332, suites=33, types=clean.

---

## Foundations

### Task 1: Extend onboardingTheme.ts with new tokens

**Files:**
- Modify: `src/constants/onboardingTheme.ts`

- [ ] **Step 1: Add new color tokens to OB_COLORS**

Edit the `OB_COLORS` object. Inside the existing block, before the closing `} as const;`, add:

```ts
  // Profile redesign additions (May 2026)
  peachSoft: '#fbe6cc',   // RowItem fill
  red: '#c75f4a',         // destructive text (Cancel Sub, Delete Account)
  orangeSoft: '#f9a886',  // Toggle ON track
  petalA: '#e8a6a0',      // watercolor accent
  petalB: '#d9a96a',      // watercolor accent
```

- [ ] **Step 2: Add new radii tokens to OB_RADII**

Inside the existing `OB_RADII` object, before the closing `} as const;`, add:

```ts
  // Profile redesign additions
  rowItem: 18,
  pillBtn: 22,
  modal: 18,
```

- [ ] **Step 3: Add new spacing token to OB_SPACING**

Inside the existing `OB_SPACING` object, before the closing `} as const;`, add:

```ts
  // Profile redesign addition (spec §6.1)
  gap1: 4,
```

Do **not** add a `gap2 = 6` or `gap1_5 = 6` token — the 6pt nav-row spacing is a one-off that gets inlined at the use-site (PR 2 Profile root NavButton stack).

- [ ] **Step 4: Add new font tokens to OB_FONTS**

Inside the existing `OB_FONTS` object, before the closing `} as const;`, add:

```ts
  // Profile redesign additions (Nunito — loaded via @expo-google-fonts/nunito)
  dataLabel: 'Nunito_600SemiBold',
  dataValue: 'Nunito_500Medium',
  btnLabel: 'Nunito_700Bold',
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/constants/onboardingTheme.ts
git commit -m "$(cat <<'EOF'
feat(profile): extend onboardingTheme with redesign tokens

Adds Profile-redesign color, radii, gap1=4 spacing, and Nunito font
tokens to OB_COLORS / OB_RADII / OB_SPACING / OB_FONTS without
modifying existing values. The spec's gap2=6 is intentionally
NOT added — it would collide with existing OB_SPACING.gap2=12,
and the 6pt value is a Profile-root nav-row one-off that gets
inlined at the use-site in PR 2.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Add Nunito font package + jest mock

**Files:**
- Modify: `package.json`
- Modify: `jest.setup.js`

- [ ] **Step 1: Install @expo-google-fonts/nunito**

Run: `npm install @expo-google-fonts/nunito --legacy-peer-deps`
Expected: package added to `dependencies` in `package.json`.

- [ ] **Step 2: Add jest mock for Nunito**

Append to `jest.setup.js` (after the existing `@expo-google-fonts/work-sans` mock block, before the `react-native-svg` mock):

```js
jest.mock('@expo-google-fonts/nunito', () => ({
  Nunito_500Medium: 'Nunito_500Medium',
  Nunito_600SemiBold: 'Nunito_600SemiBold',
  Nunito_700Bold: 'Nunito_700Bold',
  useFonts: jest.fn(() => [true]),
}));
```

- [ ] **Step 3: Verify tests still pass**

Run: `npm test 2>&1 | grep -E "Tests:" | tail -1`
Expected: same 279 tests passing (no regression).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json jest.setup.js
git commit -m "$(cat <<'EOF'
chore(profile): add @expo-google-fonts/nunito + jest mock

Nunito is required by the Profile redesign for InfoField labels,
data values, and Save button text per spec section 6.2.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Load Nunito in app/_layout.tsx

**Files:**
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Import Nunito weights**

Edit `app/_layout.tsx`. Add a new import after the existing `@expo-google-fonts/work-sans` import (line 9):

```ts
import { Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
```

- [ ] **Step 2: Add weights to useFonts()**

In the `useFonts({ ... })` call (around line 163), append the three Nunito weights to the object passed in:

```ts
const [fontsLoaded] = useFonts({
  DMSerifDisplay_400Regular,
  Caveat_400Regular,
  PatrickHand_400Regular,
  Kalam_700Bold,
  WorkSans_400Regular,
  WorkSans_500Medium,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
});
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Run tests**

Run: `npm test 2>&1 | grep -E "Tests:" | tail -1`
Expected: 279 passing.

- [ ] **Step 5: Commit**

```bash
git add app/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(profile): load Nunito fonts at app root

Nunito 500/600/700 weights are loaded via useFonts() so they're
available before any Profile screen mounts.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create profileCopy.ts (skeleton)

**Files:**
- Create: `src/constants/profileCopy.ts`

- [ ] **Step 1: Create profileCopy.ts with PR 1 strings**

Write `src/constants/profileCopy.ts`:

```ts
// Copy strings for Profile redesign. All user-facing text on Profile
// screens references this file (i18n preparation per spec section 6.3).
// Subsequent PRs (2-6) extend this with their screen-specific copy.

export const COPY = {
  // Log Out modal (rendered in PR 1, wired to authStore in PR 6)
  PROFILE_LOGOUT_HEADING: 'Heading out?',
  PROFILE_LOGOUT_BODY_FALLBACK: "We'll keep your dog's logs safe. You can come back any time.",
  PROFILE_LOGOUT_BODY_TEMPLATE: (dogName: string) =>
    `We'll keep ${dogName}'s logs safe. You can come back any time.`,
  PROFILE_LOGOUT_CONFIRM: 'Yes, log me out',
  PROFILE_LOGOUT_CANCEL: 'Stay',

  // Profile root (placeholder until PR 2 fills in)
  PROFILE_ROOT_PLACEHOLDER: 'Profile',
} as const;
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/constants/profileCopy.ts
git commit -m "$(cat <<'EOF'
feat(profile): add profileCopy constants (Log Out modal seeds)

Sets up src/constants/profileCopy.ts as the single source of truth
for Profile screen copy. Seeded with Log Out modal strings; subsequent
PRs add their screen-specific copy.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Shared Primitives (TDD)

Each component task follows the same TDD discipline: write failing tests → verify fail → implement → verify pass → commit. Components are ordered roughly by dependency depth (smaller/leaf-level first).

### Task 5: Create glyphs.tsx (inline SVG icons)

**Files:**
- Create: `src/components/profile/glyphs.tsx`

The handoff README (section "Stickers / glyphs") lists these glyphs: `HeartGlyph`, `LockGlyph`, `CardGlyph`, `BellGlyph`, `GearGlyph`, `ExitDoorGlyph`. Plus 5 InfoField watercolor icons (person, envelope, phone, cupcake, pin) and a `ProfileTabGlyph` for the FloatingTabBar fallback.

These are presentational SVGs — visual-only, no behavior to test. We skip a unit test file for them (visual verification only); the components that consume them have tests.

- [ ] **Step 1: Write glyphs.tsx**

Write `src/components/profile/glyphs.tsx`:

```tsx
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { OB_COLORS } from '../../constants/onboardingTheme';

type GlyphProps = {
  size?: number;
  color?: string;
};

const STROKE = 1.5;

export function HeartGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"
        fill={OB_COLORS.blush}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LockGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="5" y="11" width="14" height="9" rx="2" fill={OB_COLORS.blush} stroke={color} strokeWidth={STROKE} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" />
    </Svg>
  );
}

export function CardGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="6" width="18" height="13" rx="2" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} />
      <Path d="M3 11h18" stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function BellGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 17h12l-1.5-2V11a4.5 4.5 0 0 0-9 0v4z"
        fill={OB_COLORS.peach}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Path d="M10 19a2 2 0 0 0 4 0" stroke={color} strokeWidth={STROKE} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

export function GearGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="3.5" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} />
      <Path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M5.5 18.5l2-2M16.5 7.5l2-2"
        stroke={color}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ExitDoorGlyph({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="3" width="11" height="18" rx="1" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="12" r="0.8" fill={color} />
      <Path d="M15 12h6M18 9l3 3-3 3" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// 5 watercolor InfoField icons (deliberately simple per feedback_sticker_artwork_is_drop_in)
export function PersonIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="9" r="3.5" fill={OB_COLORS.petalA} stroke={color} strokeWidth={STROKE} />
      <Path d="M5 20c0-4 3.5-6 7-6s7 2 7 6" fill={OB_COLORS.petalA} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

export function EnvelopeIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="6" width="18" height="13" rx="1.5" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} />
      <Path d="M3 7l9 6 9-6" fill="none" stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
    </Svg>
  );
}

export function PhoneIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="7" y="3" width="10" height="18" rx="2" fill={OB_COLORS.blush} stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="18" r="0.7" fill={color} />
    </Svg>
  );
}

export function CupcakeIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 13l1 8h12l1-8z" fill={OB_COLORS.peach} stroke={color} strokeWidth={STROKE} strokeLinejoin="round" />
      <Path d="M7 13c0-2.5 2.5-4 5-4s5 1.5 5 4" fill={OB_COLORS.petalA} stroke={color} strokeWidth={STROKE} />
      <Circle cx="12" cy="6" r="1" fill={color} />
    </Svg>
  );
}

export function PinIcon({ size = 22, color = OB_COLORS.sketch }: GlyphProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21s-6-7-6-12a6 6 0 1 1 12 0c0 5-6 12-6 12z"
        fill={OB_COLORS.petalB}
        stroke={color}
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="9" r="2" fill={OB_COLORS.cream} stroke={color} strokeWidth={STROKE} />
    </Svg>
  );
}

// Profile tab fallback glyph (used by FloatingTabBar until Figma asset arrives)
// Active: peach fill + wood stroke. Inactive: muted fill + ink2 stroke.
export function ProfileTabGlyph({
  size = 28,
  active,
}: {
  size?: number;
  active: boolean;
}) {
  const fillColor = active ? '#f9d6b2' : OB_COLORS.muted;
  const strokeColor = active ? OB_COLORS.wood : OB_COLORS.ink2;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="9" r="4" fill={fillColor} stroke={strokeColor} strokeWidth={1.4} />
      <Path
        d="M4 21 C 5 16 8 14 12 14 C 16 14 19 16 20 21 Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.4}
      />
    </Svg>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run tests**

Run: `npm test 2>&1 | grep -E "Tests:" | tail -1`
Expected: 279 passing (no new tests yet — glyphs are visual).

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/glyphs.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add inline SVG glyphs for redesign

11 glyphs covering Settings rows (Heart, Lock, Card, Bell, Gear,
ExitDoor), 5 InfoField watercolor icons (Person, Envelope, Phone,
Cupcake, Pin), and the Profile tab fallback (active/inactive
states). Placeholders are deliberately simple per
feedback_sticker_artwork_is_drop_in.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Create NavBar component

**Files:**
- Create: `src/components/profile/NavBar.tsx`
- Test: `src/components/profile/__tests__/NavBar.test.tsx`

NavBar is a 44pt header: back chevron `‹` (Caveat 24, orange) on left, centered title (Patrick Hand 18). `back={false}` hides the chevron.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/NavBar.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavBar } from '../NavBar';

describe('NavBar', () => {
  const onBack = jest.fn();

  beforeEach(() => onBack.mockClear());

  it('renders the title', () => {
    const { getByText } = render(<NavBar title="My Information" onBackPress={onBack} />);
    expect(getByText('My Information')).toBeTruthy();
  });

  it('renders the back chevron when back is undefined (default true)', () => {
    const { getByLabelText } = render(<NavBar title="Settings" onBackPress={onBack} />);
    expect(getByLabelText('Go back')).toBeTruthy();
  });

  it('hides the back chevron when back is false', () => {
    const { queryByLabelText } = render(<NavBar title="Profile" back={false} onBackPress={onBack} />);
    expect(queryByLabelText('Go back')).toBeNull();
  });

  it('calls onBackPress when back chevron is pressed', () => {
    const { getByLabelText } = render(<NavBar title="About" onBackPress={onBack} />);
    fireEvent.press(getByLabelText('Go back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/NavBar.test.tsx --no-cache 2>&1 | tail -20`
Expected: FAIL with "Cannot find module '../NavBar'".

- [ ] **Step 3: Implement NavBar**

Write `src/components/profile/NavBar.tsx`:

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';

interface NavBarProps {
  title: string;
  back?: boolean;
  onBackPress?: () => void;
}

const HEADER_HEIGHT = 44;

export function NavBar({ title, back = true, onBackPress }: NavBarProps) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.side}>
        {back ? (
          <Pressable
            onPress={onBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
          >
            <Text style={styles.chevron}>{'‹'}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  side: {
    width: 44,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 44,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backPressed: {
    opacity: 0.6,
  },
  chevron: {
    fontFamily: OB_FONTS.h1,
    fontSize: 24,
    color: OB_COLORS.cta,
    lineHeight: 24,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: OB_FONTS.h2,
    fontSize: 18,
    color: OB_COLORS.ink,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/NavBar.test.tsx --no-cache 2>&1 | tail -10`
Expected: 4 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/NavBar.tsx src/components/profile/__tests__/NavBar.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add NavBar primitive

44pt header with optional back chevron (orange Caveat ‹) and
centered Patrick Hand title. 4 behavioral tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Create StickerIcon component

**Files:**
- Create: `src/components/profile/StickerIcon.tsx`
- Test: `src/components/profile/__tests__/StickerIcon.test.tsx`

26×26 rounded square with a single Caveat character — the generic leading icon used in row items.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/StickerIcon.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { StickerIcon } from '../StickerIcon';

describe('StickerIcon', () => {
  it('renders the provided character', () => {
    const { getByText } = render(<StickerIcon char="P" />);
    expect(getByText('P')).toBeTruthy();
  });

  it('uses default backgroundColor when bg prop omitted', () => {
    const { getByText } = render(<StickerIcon char="§" />);
    expect(getByText('§')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/StickerIcon.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../StickerIcon'".

- [ ] **Step 3: Implement StickerIcon**

Write `src/components/profile/StickerIcon.tsx`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';

interface StickerIconProps {
  char: string;
  bg?: string;
  size?: number;
}

export function StickerIcon({ char, bg = OB_COLORS.peach, size = 26 }: StickerIconProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg, width: size, height: size, borderRadius: size * 0.27 },
      ]}
    >
      <Text style={styles.char}>{char}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  char: {
    fontFamily: OB_FONTS.h1,
    fontSize: 16,
    color: OB_COLORS.woodDk,
    lineHeight: 18,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/StickerIcon.test.tsx --no-cache 2>&1 | tail -10`
Expected: 2 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/StickerIcon.tsx src/components/profile/__tests__/StickerIcon.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add StickerIcon primitive

26x26 rounded square with single Caveat character — generic leading
icon for row items. 2 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Create RowItem component

**Files:**
- Create: `src/components/profile/RowItem.tsx`
- Test: `src/components/profile/__tests__/RowItem.test.tsx`

Peach-soft pill, leading icon (any ReactNode), centered label, chevron `›` on right.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/RowItem.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { RowItem } from '../RowItem';

describe('RowItem', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<RowItem label="Notifications" onPress={onPress} />);
    expect(getByText('Notifications')).toBeTruthy();
  });

  it('renders the leading icon', () => {
    const { getByText } = render(
      <RowItem
        label="Security"
        icon={<Text>ICON</Text>}
        onPress={onPress}
      />
    );
    expect(getByText('ICON')).toBeTruthy();
  });

  it('renders the chevron by default', () => {
    const { getByText } = render(<RowItem label="Help Center" onPress={onPress} />);
    expect(getByText('›')).toBeTruthy();
  });

  it('hides the chevron when chevron={false}', () => {
    const { queryByText } = render(<RowItem label="About" chevron={false} onPress={onPress} />);
    expect(queryByText('›')).toBeNull();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<RowItem label="Privacy" onPress={onPress} />);
    fireEvent.press(getByLabelText('Privacy'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes accessibilityRole=button when onPress is set', () => {
    const { getByRole } = render(<RowItem label="About" onPress={onPress} />);
    expect(getByRole('button')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/RowItem.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../RowItem'".

- [ ] **Step 3: Implement RowItem**

Write `src/components/profile/RowItem.tsx`:

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII, OB_SHADOWS } from '../../constants/onboardingTheme';

interface RowItemProps {
  label: string;
  icon?: React.ReactNode;
  chevron?: boolean;
  onPress?: () => void;
}

export function RowItem({ label, icon, chevron = true, onPress }: RowItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.container,
        pressed && onPress && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {chevron ? <Text style={styles.chevron}>{'›'}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: OB_RADII.rowItem,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    ...OB_SHADOWS.card,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    color: OB_COLORS.ink,
  },
  chevron: {
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.cta,
    marginLeft: 8,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/RowItem.test.tsx --no-cache 2>&1 | tail -10`
Expected: 6 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/RowItem.tsx src/components/profile/__tests__/RowItem.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add RowItem primitive

Peach-soft pill row with leading icon, centered label, optional
chevron. Standard list row for Settings sub-screens. 6 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Create NavButton component

**Files:**
- Create: `src/components/profile/NavButton.tsx`
- Test: `src/components/profile/__tests__/NavButton.test.tsx`

Profile-root variant: leading icon + **left-aligned** label (RowItem has centered label). Used only on the Profile root for the 3 nav rows.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/NavButton.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { NavButton } from '../NavButton';

describe('NavButton', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<NavButton label="My Information" onPress={onPress} />);
    expect(getByText('My Information')).toBeTruthy();
  });

  it('renders the leading icon', () => {
    const { getByText } = render(
      <NavButton label="My Subscription" icon={<Text>ICN</Text>} onPress={onPress} />
    );
    expect(getByText('ICN')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<NavButton label="Settings" onPress={onPress} />);
    fireEvent.press(getByLabelText('Settings'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/NavButton.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../NavButton'".

- [ ] **Step 3: Implement NavButton**

Write `src/components/profile/NavButton.tsx`:

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII, OB_SHADOWS } from '../../constants/onboardingTheme';

interface NavButtonProps {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

export function NavButton({ label, icon, onPress }: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.chevron}>{'›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: 14,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    ...OB_SHADOWS.card,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    textAlign: 'left',
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    color: OB_COLORS.ink,
  },
  chevron: {
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.cta,
    marginLeft: 8,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/NavButton.test.tsx --no-cache 2>&1 | tail -10`
Expected: 3 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/NavButton.tsx src/components/profile/__tests__/NavButton.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add NavButton primitive

Profile-root nav row with left-aligned label (vs RowItem's
centered label). 3 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Create WoodPortrait component

**Files:**
- Create: `src/components/profile/WoodPortrait.tsx`
- Test: `src/components/profile/__tests__/WoodPortrait.test.tsx`

Wood-frame round avatar — wood ring + cream inner border + photo (or stripe placeholder). Sizes: 68 (Profile root), 76 (My Information), 130 (large hero).

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/WoodPortrait.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { WoodPortrait } from '../WoodPortrait';

describe('WoodPortrait', () => {
  it('renders without an avatar (stripe placeholder)', () => {
    const { getByLabelText } = render(<WoodPortrait size={68} />);
    expect(getByLabelText('Profile photo placeholder')).toBeTruthy();
  });

  it('renders the user photo when avatar URI is provided', () => {
    const { getByLabelText } = render(<WoodPortrait size={76} avatar="https://example.com/avatar.jpg" />);
    expect(getByLabelText('Profile photo')).toBeTruthy();
  });

  it('accepts size 68', () => {
    const { getByTestId } = render(<WoodPortrait size={68} testID="wp" />);
    expect(getByTestId('wp')).toBeTruthy();
  });

  it('accepts size 76', () => {
    const { getByTestId } = render(<WoodPortrait size={76} testID="wp" />);
    expect(getByTestId('wp')).toBeTruthy();
  });

  it('accepts size 130', () => {
    const { getByTestId } = render(<WoodPortrait size={130} testID="wp" />);
    expect(getByTestId('wp')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/WoodPortrait.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../WoodPortrait'".

- [ ] **Step 3: Implement WoodPortrait**

Write `src/components/profile/WoodPortrait.tsx`:

```tsx
import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { OB_COLORS } from '../../constants/onboardingTheme';

interface WoodPortraitProps {
  size: 68 | 76 | 130;
  avatar?: string | null;
  testID?: string;
  style?: ViewStyle;
}

export function WoodPortrait({ size, avatar, testID, style }: WoodPortraitProps) {
  const outerRing = Math.max(3, Math.round(size * 0.06));
  const middleRing = Math.max(2, Math.round(size * 0.04));
  const photoSize = size - 2 * (outerRing + middleRing);

  return (
    <View
      testID={testID}
      style={[
        styles.outer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          padding: outerRing,
          backgroundColor: OB_COLORS.woodDk,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.middle,
          {
            borderRadius: (size - 2 * outerRing) / 2,
            padding: middleRing,
            backgroundColor: OB_COLORS.wood,
          },
        ]}
      >
        <View
          style={[
            styles.inner,
            {
              width: photoSize,
              height: photoSize,
              borderRadius: photoSize / 2,
              backgroundColor: OB_COLORS.cream,
            },
          ]}
        >
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={[styles.photo, { width: photoSize, height: photoSize, borderRadius: photoSize / 2 }]}
              accessibilityLabel="Profile photo"
            />
          ) : (
            <View
              style={[
                styles.placeholder,
                {
                  width: photoSize,
                  height: photoSize,
                  borderRadius: photoSize / 2,
                  backgroundColor: OB_COLORS.cream2,
                },
              ]}
              accessibilityLabel="Profile photo placeholder"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {},
  placeholder: {},
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/WoodPortrait.test.tsx --no-cache 2>&1 | tail -10`
Expected: 5 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/WoodPortrait.tsx src/components/profile/__tests__/WoodPortrait.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add WoodPortrait avatar primitive

Wood-frame round avatar with photo (when uploaded) or cream
placeholder. Sizes 68/76/130. 5 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Create Toggle component

**Files:**
- Create: `src/components/profile/Toggle.tsx`
- Test: `src/components/profile/__tests__/Toggle.test.tsx`

36×20 pill, sketch border, Reanimated thumb. OFF = cream track + black thumb. ON = `orangeSoft` track + white thumb with border. 150ms spring.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/Toggle.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  const onValueChange = jest.fn();

  beforeEach(() => onValueChange.mockClear());

  it('renders in the OFF state', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} />);
    const sw = getByRole('switch');
    expect(sw.props.accessibilityState).toEqual(expect.objectContaining({ checked: false }));
  });

  it('renders in the ON state', () => {
    const { getByRole } = render(<Toggle value={true} onValueChange={onValueChange} />);
    const sw = getByRole('switch');
    expect(sw.props.accessibilityState).toEqual(expect.objectContaining({ checked: true }));
  });

  it('calls onValueChange(true) when pressed from OFF', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} />);
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('calls onValueChange(false) when pressed from ON', () => {
    const { getByRole } = render(<Toggle value={true} onValueChange={onValueChange} />);
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('does not fire onValueChange when disabled', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} disabled />);
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('exposes accessibilityRole=switch', () => {
    const { getByRole } = render(<Toggle value={false} onValueChange={onValueChange} />);
    expect(getByRole('switch')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/Toggle.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../Toggle'".

- [ ] **Step 3: Implement Toggle**

Write `src/components/profile/Toggle.tsx`:

```tsx
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { OB_BORDERS, OB_COLORS } from '../../constants/onboardingTheme';

const TRACK_W = 36;
const TRACK_H = 20;
const THUMB = 14;
const PAD = 1;
const ON_X = TRACK_W - THUMB - PAD * 2;

interface ToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(value ? 1 : 0, { damping: 18, stiffness: 220 });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? OB_COLORS.orangeSoft : OB_COLORS.cream,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * ON_X }],
    backgroundColor: progress.value > 0.5 ? '#ffffff' : OB_COLORS.sketch,
    borderWidth: progress.value > 0.5 ? 1 : 0,
    borderColor: OB_COLORS.sketch,
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    padding: PAD,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/Toggle.test.tsx --no-cache 2>&1 | tail -10`
Expected: 6 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/Toggle.tsx src/components/profile/__tests__/Toggle.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add Toggle primitive

36x20 sketched-border pill with Reanimated thumb. OFF=cream/black,
ON=orangeSoft/white. accessibilityRole=switch. 6 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Create ToggleRow component

**Files:**
- Create: `src/components/profile/ToggleRow.tsx`
- Test: `src/components/profile/__tests__/ToggleRow.test.tsx`

RowItem shell + label/sub stack + Toggle. Optimistic — fires `onValueChange` immediately on press; the consumer (notificationsStore in PR 4) handles persistence + revert.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/ToggleRow.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ToggleRow } from '../ToggleRow';

describe('ToggleRow', () => {
  const onValueChange = jest.fn();

  beforeEach(() => onValueChange.mockClear());

  it('renders the label', () => {
    const { getByText } = render(
      <ToggleRow label="Daily log reminder" value={false} onValueChange={onValueChange} />
    );
    expect(getByText('Daily log reminder')).toBeTruthy();
  });

  it('renders the sub text when provided', () => {
    const { getByText } = render(
      <ToggleRow
        label="Weekly insight ready"
        sub="Sundays · AI summary"
        value={true}
        onValueChange={onValueChange}
      />
    );
    expect(getByText('Sundays · AI summary')).toBeTruthy();
  });

  it('does NOT render sub text when omitted', () => {
    const { queryByText } = render(
      <ToggleRow label="Marketing emails" value={false} onValueChange={onValueChange} />
    );
    expect(queryByText('Sundays')).toBeNull();
  });

  it('toggling the switch fires onValueChange with the new value', () => {
    const { getByRole } = render(
      <ToggleRow label="Vet appointments" value={false} onValueChange={onValueChange} />
    );
    fireEvent.press(getByRole('switch'));
    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('reflects parent-controlled value (rerender from false to true)', () => {
    const { getByRole, rerender } = render(
      <ToggleRow label="Garden milestones" value={false} onValueChange={onValueChange} />
    );
    rerender(<ToggleRow label="Garden milestones" value={true} onValueChange={onValueChange} />);
    expect(getByRole('switch').props.accessibilityState).toEqual(
      expect.objectContaining({ checked: true })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/ToggleRow.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../ToggleRow'".

- [ ] **Step 3: Implement ToggleRow**

Write `src/components/profile/ToggleRow.tsx`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII, OB_SHADOWS } from '../../constants/onboardingTheme';
import { Toggle } from './Toggle';

interface ToggleRowProps {
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({ label, sub, icon, value, onValueChange, disabled }: ToggleRowProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.textStack}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {sub ? (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Toggle value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: OB_RADII.rowItem,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    ...OB_SHADOWS.card,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  textStack: {
    flex: 1,
  },
  label: {
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    color: OB_COLORS.ink,
  },
  sub: {
    fontFamily: OB_FONTS.body,
    fontSize: 12,
    color: OB_COLORS.ink2,
    marginTop: 2,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/ToggleRow.test.tsx --no-cache 2>&1 | tail -10`
Expected: 5 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/ToggleRow.tsx src/components/profile/__tests__/ToggleRow.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add ToggleRow primitive

RowItem shell + label/sub stack + Toggle. Parent-controlled
value (optimistic — store handles revert). 5 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Create InfoField component

**Files:**
- Create: `src/components/profile/InfoField.tsx`
- Test: `src/components/profile/__tests__/InfoField.test.tsx`

Bordered input with watercolor icon + label/value stack. Focused = orange 2px border. Edit mode = `<TextInput>`; idle = static text.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/InfoField.test.tsx`:

```tsx
import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { InfoField } from '../InfoField';

describe('InfoField', () => {
  const onChangeText = jest.fn();
  const onPress = jest.fn();

  beforeEach(() => {
    onChangeText.mockClear();
    onPress.mockClear();
  });

  it('renders the label and value in idle (read-only) mode', () => {
    const { getByText } = render(
      <InfoField label="EMAIL" value="aman@puplog.app" />
    );
    expect(getByText('EMAIL')).toBeTruthy();
    expect(getByText('aman@puplog.app')).toBeTruthy();
  });

  it('renders a TextInput when editable=true', () => {
    const { getByDisplayValue } = render(
      <InfoField label="NAME" value="Aman Reddy" editable onChangeText={onChangeText} />
    );
    expect(getByDisplayValue('Aman Reddy')).toBeTruthy();
  });

  it('calls onChangeText when input changes', () => {
    const { getByDisplayValue } = render(
      <InfoField label="PHONE" value="123" editable onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByDisplayValue('123'), '456');
    expect(onChangeText).toHaveBeenCalledWith('456');
  });

  it('renders the leading icon when provided', () => {
    const { getByText } = render(
      <InfoField label="LOCATION" value="SF" icon={<Text>PIN</Text>} />
    );
    expect(getByText('PIN')).toBeTruthy();
  });

  it('renders as a Pressable when onPress is set and editable=false', () => {
    const { getByLabelText } = render(
      <InfoField label="BIRTHDAY" value="May 14, 1992" onPress={onPress} />
    );
    fireEvent.press(getByLabelText('BIRTHDAY'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows placeholder when value is empty in editable mode', () => {
    const { getByPlaceholderText } = render(
      <InfoField label="PHONE" value="" editable placeholder="+1 555..." onChangeText={onChangeText} />
    );
    expect(getByPlaceholderText('+1 555...')).toBeTruthy();
  });

  it('shows readonly empty value as em dash', () => {
    const { getByText } = render(<InfoField label="LOCATION" value="" />);
    expect(getByText('—')).toBeTruthy();
  });

  it('disables the TextInput when keyboardType is provided but disabled=true', () => {
    const { getByDisplayValue } = render(
      <InfoField label="EMAIL" value="x@y.com" editable disabled onChangeText={onChangeText} />
    );
    expect(getByDisplayValue('x@y.com').props.editable).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/InfoField.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../InfoField'".

- [ ] **Step 3: Implement InfoField**

Write `src/components/profile/InfoField.tsx`:

```tsx
import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII } from '../../constants/onboardingTheme';

interface InfoFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  editable?: boolean;
  disabled?: boolean;
  onChangeText?: (next: string) => void;
  onPress?: () => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function InfoField({
  label,
  value,
  icon,
  editable,
  disabled,
  onChangeText,
  onPress,
  placeholder,
  keyboardType,
  autoCapitalize,
}: InfoFieldProps) {
  const [focused, setFocused] = useState(false);

  const Wrapper: React.ComponentType<any> = onPress && !editable ? Pressable : View;
  const wrapperProps = onPress && !editable
    ? { onPress, accessibilityRole: 'button', accessibilityLabel: label }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      style={[
        styles.container,
        focused && styles.focused,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.stack}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {editable ? (
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={OB_COLORS.muted}
            editable={!disabled}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            accessibilityLabel={label}
          />
        ) : (
          <Text style={styles.value} numberOfLines={1}>
            {value || '—'}
          </Text>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
    borderRadius: OB_RADII.field,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  focused: {
    borderColor: OB_COLORS.cta,
    borderWidth: 2,
  },
  iconWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stack: {
    flex: 1,
  },
  label: {
    fontFamily: OB_FONTS.dataLabel,
    fontSize: 9,
    color: OB_COLORS.ink2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 14,
    color: OB_COLORS.ink,
    marginTop: 2,
  },
  input: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 14,
    color: OB_COLORS.ink,
    marginTop: 2,
    padding: 0,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/InfoField.test.tsx --no-cache 2>&1 | tail -10`
Expected: 8 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/InfoField.tsx src/components/profile/__tests__/InfoField.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add InfoField primitive

Bordered field with leading icon + uppercase label + Nunito value.
Edit mode renders TextInput; idle renders static text. Focused
state = 2px orange border. 8 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Create PillButton component

**Files:**
- Create: `src/components/profile/PillButton.tsx`
- Test: `src/components/profile/__tests__/PillButton.test.tsx`

Pill CTA used by Log Out (cream fill, orange border) and modal CTAs (solid orange "primary" or ghost cream "secondary"). Radius 22, 1.5px sketch border, sketch shadow.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/PillButton.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PillButton } from '../PillButton';

describe('PillButton', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<PillButton label="Log Out" onPress={onPress} />);
    expect(getByText('Log Out')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<PillButton label="Yes, log me out" onPress={onPress} />);
    fireEvent.press(getByLabelText('Yes, log me out'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onPress when disabled', () => {
    const { getByLabelText } = render(
      <PillButton label="Stay" onPress={onPress} disabled />
    );
    fireEvent.press(getByLabelText('Stay'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('supports the primary variant (solid orange)', () => {
    const { getByText } = render(
      <PillButton label="Yes, log me out" variant="primary" onPress={onPress} />
    );
    expect(getByText('Yes, log me out')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/PillButton.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../PillButton'".

- [ ] **Step 3: Implement PillButton**

Write `src/components/profile/PillButton.tsx`:

```tsx
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';

type PillVariant = 'logout' | 'primary' | 'ghost';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: PillVariant;
  disabled?: boolean;
}

export function PillButton({ label, onPress, variant = 'logout', disabled }: PillButtonProps) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        (variant === 'logout' || isGhost) && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary && styles.primaryText,
          (variant === 'logout' || isGhost) && styles.ghostText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: OB_RADII.pillBtn,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    ...OB_SHADOWS.card,
  },
  primary: {
    backgroundColor: OB_COLORS.cta,
  },
  ghost: {
    backgroundColor: OB_COLORS.cream,
    borderColor: OB_COLORS.cta,
    borderWidth: 2.5,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: OB_FONTS.h3,
    fontSize: 17,
  },
  primaryText: {
    color: OB_COLORS.ctaText,
  },
  ghostText: {
    color: OB_COLORS.cta,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/PillButton.test.tsx --no-cache 2>&1 | tail -10`
Expected: 4 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/PillButton.tsx src/components/profile/__tests__/PillButton.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add PillButton primitive

Pill-shaped CTA with logout/primary/ghost variants. Used by
Log Out button and modal confirm/cancel. 4 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Create SaveButton component

**Files:**
- Create: `src/components/profile/SaveButton.tsx`
- Test: `src/components/profile/__tests__/SaveButton.test.tsx`

Two-layer Duolingo-style: dark slab `#c75f3d` absolutely positioned `inset: 4px 0 -4px 0` behind orange face. Press translates face down 4px. Reuses `OB_BUTTON_PRESS_TRANSLATE = 4`.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/SaveButton.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SaveButton } from '../SaveButton';

describe('SaveButton', () => {
  const onPress = jest.fn();

  beforeEach(() => onPress.mockClear());

  it('renders the label', () => {
    const { getByText } = render(<SaveButton label="Save Changes" onPress={onPress} />);
    expect(getByText('Save Changes')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByLabelText } = render(<SaveButton label="Save Changes" onPress={onPress} />);
    fireEvent.press(getByLabelText('Save Changes'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onPress when disabled', () => {
    const { getByLabelText } = render(
      <SaveButton label="Save Changes" onPress={onPress} disabled />
    );
    fireEvent.press(getByLabelText('Save Changes'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('exposes accessibilityState.disabled when disabled', () => {
    const { getByLabelText } = render(
      <SaveButton label="Save Changes" onPress={onPress} disabled />
    );
    expect(getByLabelText('Save Changes').props.accessibilityState).toEqual(
      expect.objectContaining({ disabled: true })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/SaveButton.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../SaveButton'".

- [ ] **Step 3: Implement SaveButton**

Write `src/components/profile/SaveButton.tsx`:

```tsx
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import {
  OB_BORDERS,
  OB_BUTTON_PRESS_TRANSLATE,
  OB_COLORS,
  OB_FONTS,
} from '../../constants/onboardingTheme';

const AnimatedView = Animated.View;

const SLAB_COLOR = '#c75f3d';
const RADIUS = 14;

interface SaveButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SaveButton({ label, onPress, disabled }: SaveButtonProps) {
  const translateY = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const handlePressIn = useCallback(() => {
    if (reducedMotion || disabled) return;
    translateY.value = withTiming(OB_BUTTON_PRESS_TRANSLATE, { duration: 80 });
  }, [reducedMotion, disabled, translateY]);

  const handlePressOut = useCallback(() => {
    if (reducedMotion || disabled) return;
    translateY.value = withTiming(0, { duration: 100 });
  }, [reducedMotion, disabled, translateY]);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={styles.outer}
    >
      <View style={[styles.slab, disabled && styles.disabledSlab]} />
      <AnimatedView style={[styles.face, disabled && styles.disabledFace, faceStyle]}>
        <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
      </AnimatedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    height: 52,
    width: '100%',
    position: 'relative',
  },
  slab: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: OB_BUTTON_PRESS_TRANSLATE,
    bottom: -OB_BUTTON_PRESS_TRANSLATE,
    backgroundColor: SLAB_COLOR,
    borderRadius: RADIUS,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  face: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: OB_COLORS.cta,
    borderRadius: RADIUS,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 15,
    color: OB_COLORS.ctaText,
    letterSpacing: 0.3,
  },
  disabledSlab: { opacity: 0.5 },
  disabledFace: { opacity: 0.5 },
  disabledLabel: {},
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/SaveButton.test.tsx --no-cache 2>&1 | tail -10`
Expected: 4 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/SaveButton.tsx src/components/profile/__tests__/SaveButton.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add SaveButton primitive

Two-layer Duolingo-style press button: dark slab #c75f3d
behind orange face. Press translates face 4px down. 4 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Create PerkRow component

**Files:**
- Create: `src/components/profile/PerkRow.tsx`
- Test: `src/components/profile/__tests__/PerkRow.test.tsx`

Subscription perk row: 18px green check circle + body text. Used in My Subscription (PR 3).

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/PerkRow.test.tsx`:

```tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { PerkRow } from '../PerkRow';

describe('PerkRow', () => {
  it('renders the perk text', () => {
    const { getByText } = render(<PerkRow text="Unlimited daily logs" />);
    expect(getByText('Unlimited daily logs')).toBeTruthy();
  });

  it('renders the green check circle', () => {
    const { getByLabelText } = render(<PerkRow text="AI weekly insights" />);
    expect(getByLabelText('Included perk')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/PerkRow.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../PerkRow'".

- [ ] **Step 3: Implement PerkRow**

Write `src/components/profile/PerkRow.tsx`:

```tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';

interface PerkRowProps {
  text: string;
}

export function PerkRow({ text }: PerkRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.checkCircle} accessibilityLabel="Included perk">
        <Text style={styles.checkMark}>{'✓'}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: OB_COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.ink,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/PerkRow.test.tsx --no-cache 2>&1 | tail -10`
Expected: 2 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/PerkRow.tsx src/components/profile/__tests__/PerkRow.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add PerkRow primitive

Subscription perk row with green check circle + body text.
2 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Create LogOutModal component

**Files:**
- Create: `src/components/profile/LogOutModal.tsx`
- Test: `src/components/profile/__tests__/LogOutModal.test.tsx`

Bottom-pinned card 90px above tab bar. Backdrop dims root to opacity 0.4. "Heading out?" + body + two PillButtons. Reanimated scale-up + fade. Component is built in PR 1; PR 6 wires it to `signOut()` on the Profile root.

- [ ] **Step 1: Write the failing test**

Write `src/components/profile/__tests__/LogOutModal.test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LogOutModal } from '../LogOutModal';

describe('LogOutModal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();

  beforeEach(() => {
    onConfirm.mockClear();
    onCancel.mockClear();
  });

  it('renders the heading', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(getByText('Heading out?')).toBeTruthy();
  });

  it('renders the fallback body when no dog name is provided', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(getByText("We'll keep your dog's logs safe. You can come back any time.")).toBeTruthy();
  });

  it('renders the dog-specific body when a name is provided', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} dogName="Biscuit" />
    );
    expect(getByText("We'll keep Biscuit's logs safe. You can come back any time.")).toBeTruthy();
  });

  it('renders both action buttons', () => {
    const { getByText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(getByText('Yes, log me out')).toBeTruthy();
    expect(getByText('Stay')).toBeTruthy();
  });

  it('calls onConfirm when "Yes, log me out" is pressed', () => {
    const { getByLabelText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    fireEvent.press(getByLabelText('Yes, log me out'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when "Stay" is pressed', () => {
    const { getByLabelText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    fireEvent.press(getByLabelText('Stay'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the backdrop is pressed', () => {
    const { getByLabelText } = render(
      <LogOutModal visible onConfirm={onConfirm} onCancel={onCancel} />
    );
    fireEvent.press(getByLabelText('Close log out modal'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when visible is false', () => {
    const { queryByText } = render(
      <LogOutModal visible={false} onConfirm={onConfirm} onCancel={onCancel} />
    );
    expect(queryByText('Heading out?')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/profile/__tests__/LogOutModal.test.tsx --no-cache 2>&1 | tail -10`
Expected: FAIL with "Cannot find module '../LogOutModal'".

- [ ] **Step 3: Implement LogOutModal**

Write `src/components/profile/LogOutModal.tsx`:

```tsx
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';
import { COPY } from '../../constants/profileCopy';
import { PillButton } from './PillButton';

interface LogOutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  dogName?: string;
}

export function LogOutModal({ visible, onConfirm, onCancel, dogName }: LogOutModalProps) {
  const body = dogName
    ? COPY.PROFILE_LOGOUT_BODY_TEMPLATE(dogName)
    : COPY.PROFILE_LOGOUT_BODY_FALLBACK;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        style={styles.backdrop}
        onPress={onCancel}
        accessibilityLabel="Close log out modal"
        accessibilityRole="button"
      />
      <View style={styles.cardWrap} pointerEvents="box-none">
        <View style={styles.card}>
          <Text style={styles.heading}>{COPY.PROFILE_LOGOUT_HEADING}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.btnRow}>
            <PillButton label={COPY.PROFILE_LOGOUT_CONFIRM} variant="primary" onPress={onConfirm} />
            <View style={styles.btnGap} />
            <PillButton label={COPY.PROFILE_LOGOUT_CANCEL} variant="ghost" onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 20, 15, 0.4)',
  },
  cardWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: OB_COLORS.cream,
    borderRadius: OB_RADII.modal,
    borderWidth: 2.5,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 20,
    paddingVertical: 18,
    ...OB_SHADOWS.button,
  },
  heading: {
    textAlign: 'center',
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.ink,
    marginBottom: 8,
  },
  body: {
    textAlign: 'center',
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.ink2,
    marginBottom: 14,
  },
  btnRow: {
    flexDirection: 'column',
  },
  btnGap: {
    height: 8,
  },
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/components/profile/__tests__/LogOutModal.test.tsx --no-cache 2>&1 | tail -10`
Expected: 8 passing.

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/profile/LogOutModal.tsx src/components/profile/__tests__/LogOutModal.test.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add LogOutModal primitive

Bottom-pinned card with backdrop, heading, body, and two
PillButton CTAs. Component built; will be wired to authStore
signOut() in PR 6. 8 tests.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Route Group + Tab Restructure

### Task 18: Create empty Profile route group

**Files:**
- Create: `app/(tabs)/profile/_layout.tsx`
- Create: `app/(tabs)/profile/index.tsx`

- [ ] **Step 1: Write Profile route layout**

Write `app/(tabs)/profile/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
```

- [ ] **Step 2: Write empty Profile root**

Write `app/(tabs)/profile/index.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OB_COLORS, OB_FONTS } from '../../../src/constants/onboardingTheme';
import { COPY } from '../../../src/constants/profileCopy';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.placeholder}>{COPY.PROFILE_ROOT_PLACEHOLDER}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    fontFamily: OB_FONTS.h1,
    fontSize: 30,
    color: OB_COLORS.ink,
  },
});
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Run all tests**

Run: `npm test 2>&1 | grep -E "Tests:" | tail -1`
Expected: same passing count (these are routes, not directly tested).

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/profile/_layout.tsx app/\(tabs\)/profile/index.tsx
git commit -m "$(cat <<'EOF'
feat(profile): add empty Profile route group

Stack navigator + placeholder index renders cream-paper bg with
"Profile" Caveat heading. PR 2 fills this in.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: Update FloatingTabBar for Profile tab + inline-SVG fallback

**Files:**
- Modify: `src/components/ui/FloatingTabBar.tsx`

The current `FloatingTabBar` keys on `route.name === 'settings'` to render the avatar overlay; we re-key on `'profile'`. When the user has no avatar, we render the inline `ProfileTabGlyph` instead of `MaterialCommunityIcons`. The FAB stays per spec §8.6 (TODO comment added).

- [ ] **Step 1: Update tab maps**

Edit `src/components/ui/FloatingTabBar.tsx`. Replace the two maps near the top of the file:

```ts
const TAB_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  index: 'home',
  health: 'calendar-heart',
  learn: 'book-open-variant',
  profile: 'account-outline',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  health: 'Health',
  learn: 'Learn',
  profile: 'Profile',
};
```

- [ ] **Step 2: Import ProfileTabGlyph**

Add an import near the top of the file (after the existing imports):

```ts
import { ProfileTabGlyph } from '../profile/glyphs';
```

- [ ] **Step 3: Update Tab component to use Profile fallback glyph**

In the existing `Tab` function, locate the `isSettings` prop and rename it to `isProfile`. Inside the component, change the avatar render branch so that when no avatar is set we render `<ProfileTabGlyph active={isFocused} />` instead of the static `userInitial` text. Replace the inner content of the `isSettings ? (...) : (...)` ternary with this:

```tsx
{isProfile ? (
  avatarUrl ? (
    <View style={[styles.tabAvatar, isFocused && styles.tabAvatarActive]}>
      <Image source={{ uri: avatarUrl }} style={styles.tabAvatarImage} />
    </View>
  ) : (
    <ProfileTabGlyph active={isFocused} />
  )
) : (
  <MaterialCommunityIcons name={icon} size={27} color={color} />
)}
```

Update the `Tab` props to rename `isSettings: boolean` → `isProfile: boolean`.

- [ ] **Step 4: Update renderTab callsite**

Inside `renderTab` (in the same file), change the `isSettings` prop on the `<Tab>` to `isProfile`:

```tsx
<Tab
  key={route.key}
  route={route}
  isFocused={isFocused}
  icon={icon}
  label={label}
  isProfile={route.name === 'profile'}
  avatarUrl={avatarUrl}
  userInitial={userInitial}
  onPress={onPress}
/>
```

(`userInitial` stays in the prop list but is no longer rendered when there's no avatar — leave it to avoid changing the public surface unnecessarily; PR 6 cleanup may remove it.)

- [ ] **Step 5: Add FAB-stays TODO comment**

Add this comment immediately above the `handleFAB` callback (the existing FAB handler):

```ts
// TODO: Remove FAB once Journey redesign delivers an alternative check-in CTA.
// Gated on project_journey_redesign.md (TBD). Until then, the FAB stays even
// though the May 2026 mockup tab bar does not show it.
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If errors mention `isSettings` somewhere downstream, search and rename.)

- [ ] **Step 7: Run tests**

Run: `npm test 2>&1 | grep -E "Tests:" | tail -1`
Expected: existing 279 + new tests passing (no regression in `FloatingTabBar` callers).

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/FloatingTabBar.tsx
git commit -m "$(cat <<'EOF'
feat(profile): wire Profile tab into FloatingTabBar

Renames the isSettings tab branch to isProfile, swaps in the
inline-SVG ProfileTabGlyph for users without an avatar, and adds
a TODO comment documenting that the FAB stays until the Journey
redesign delivers an alternative check-in CTA.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: Swap settings tab for profile in (tabs)/_layout.tsx, delete settings.tsx

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Delete: `app/(tabs)/settings.tsx`

- [ ] **Step 1: Update tab declaration**

Edit `app/(tabs)/_layout.tsx`. Replace the existing `<Tabs.Screen name="settings" />` with:

```tsx
<Tabs.Screen name="profile" />
```

The full file becomes:

```tsx
import { Tabs } from 'expo-router';
import { FloatingTabBar } from '../../src/components/ui/FloatingTabBar';
import { ArticleExpandOverlay } from '../../src/components/ui/ArticleExpandOverlay';

export default function TabsLayout() {
  return (
    <>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="health" />
        <Tabs.Screen name="learn" />
        <Tabs.Screen
          name="triage"
          options={{ href: null }}
        />
        <Tabs.Screen name="profile" />
      </Tabs>
      <ArticleExpandOverlay />
    </>
  );
}
```

- [ ] **Step 2: Delete the old settings.tsx file**

Run: `git rm app/\(tabs\)/settings.tsx`
Expected: file removed, staged for commit.

- [ ] **Step 3: Verify no remaining imports of (tabs)/settings**

Run: `grep -RIn "(tabs)/settings" --include="*.ts" --include="*.tsx" .`
Expected: no matches (or only matches inside this plan/spec files in `docs/` — those are fine).

- [ ] **Step 4: Verify navigation references to old path**

Run: `grep -RIn "router.push.*settings\|router.replace.*settings" --include="*.ts" --include="*.tsx" src app`
Expected: no matches (Profile rows in PR 4 will route to `/profile/settings`, but no code yet routes to the old `/settings`).

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Run all tests**

Run: `npm test 2>&1 | grep -E "Tests:" | tail -1`
Expected: same total passing count (the deleted screen had no tests).

- [ ] **Step 7: Commit**

```bash
git add app/\(tabs\)/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(profile): swap settings tab for profile route group

Replaces (tabs)/settings.tsx with the (tabs)/profile/ route group.
The old single-file Settings screen is deleted; Profile root
renders the empty placeholder until PR 2 fills it in.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Verification

### Task 21: Final PR 1 verification

**Files:** none

- [ ] **Step 1: Full type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Full test suite**

Run: `npm test --silent 2>&1 | tail -20`
Expected: `Tests:       336 passed, 336 total` (279 baseline + 57 new), `Test Suites: 34 passed, 34 total`.

Tests added in this PR by file (NavBar 4 + StickerIcon 2 + RowItem 6 + NavButton 3 + WoodPortrait 5 + Toggle 6 + ToggleRow 5 + InfoField 8 + PillButton 4 + SaveButton 4 + PerkRow 2 + LogOutModal 8 = 57). Adjust expectation if a test was tightened during implementation.

- [ ] **Step 3: Visual smoke test (manual)**

Run: `npx expo start` and open the app on iOS simulator. Confirm:

1. Tab bar shows: Home, Health, Learn, Profile (4 visible tabs + FAB; Triage hidden).
2. Profile tab icon: when no avatar, the inline-SVG person glyph renders (peach + wood stroke when active, muted when inactive).
3. Tapping Profile: navigates to the empty Profile root showing "Profile" in Caveat 30pt centered on cream background.
4. No console errors; no layout warnings.

If the visual is wrong, fix in-place and recommit. Do NOT proceed if the tab bar regressed.

- [ ] **Step 4: Verify branch state**

Run: `git log --oneline main..HEAD | wc -l`
Expected: ~20 commits (one per task plus pre-flight spec commit).

Run: `git status`
Expected: clean working tree.

- [ ] **Step 5: Invoke superpowers:verification-before-completion**

Before declaring PR 1 complete, invoke the `superpowers:verification-before-completion` skill to run its checklist (tests, lint, type-check, manual verification confirmation).

- [ ] **Step 6: Open PR**

Push the branch and open a PR against `main`. PR title: `feat(profile): PR 1 — foundations (theme, primitives, route group, tab restructure)`. PR body should reference the spec at `docs/superpowers/specs/2026-05-09-profile-screen-redesign-design.md` §10 row 1, list the 13 primitives, link the test count delta (279 → 332), and note that PR 2 (My Information + user_profiles migration) is next.

---

## What Each Subsequent PR Will Add (For Context, Not Scope)

| PR | Headline | New stores | New migrations | New screens |
|---|---|---|---|---|
| 2 | My Information | `profileStore` | `0001_user_profiles`, `0005_avatar_storage`, `0006_handle_new_user`, backfill script | `my-information.tsx` |
| 3 | My Subscription | extend `subscriptionStore` | — | `my-subscription.tsx` |
| 4 | Settings hub + 5 sub-screens | `notificationsStore` | `0002_user_preferences` | `settings/{index,notifications,security,help-center,about,privacy}.tsx` |
| 5 | Achievement stickers | `userAchievementsStore` | `0003_user_achievements`, `0004_ai_insights_reviewed_at`; Edge Function `check-achievements` | sticker subsystem (collection + detail + celebration) |
| 6 | Polish | — | — | LogOutModal wiring; Journey/My Dogs/Discovery rename; rasterized PNG tab icons |

A separate plan will be written for each subsequent PR after the previous one lands.

---

## Risks for PR 1

| Risk | Mitigation |
|---|---|
| Existing `gap2: 12` consumers regress | None expected — `gap2` is untouched; we add only `gap1: 4`. Run `grep -RIn "gap2" src` after Task 1 to confirm. |
| `Modal` from React Native + `Pressable` backdrop has known iOS behavior where statusBar style flickers | Acceptable for PR 1 (presentational only; not user-facing yet). PR 6 wiring will set `statusBarStyle="light"` on Modal if needed. |
| Reanimated mock returns animations synchronously, masking timing bugs | Visual smoke test (Task 21 step 3) catches anything jest can't. |
| `git rm` on settings.tsx misses an open PR or stash | Task 20 step 3-4 greps for stale references before commit. |
| Nunito package install hits peer-dep conflict | Task 2 already uses `--legacy-peer-deps` (matches existing convention from CLAUDE.md). |

---

**End of PR 1 plan.**
