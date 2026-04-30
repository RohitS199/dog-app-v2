# PupLog Onboarding — Status & Handoff

> **Last updated**: 2026-04-30. Refresh of the original handoff after the polish pass landed and the Expo Go cache debugging session resolved.
> **Anchor commit**: `729a7a0` — "Refactor onboarding to 19-step scrapbook flow and polish to research spec"
> **Hard constraint (durable)**: Do NOT change colors. Earthy Dog Park (main app) + scrapbook (onboarding) palettes are locked under git tag `color-baseline-v1`.

---

## 1. What's done

### 1.1 Onboarding refactor

- 19-step component-based flow in `src/components/onboarding/` (33 files), each composing `OnboardingShell` + `ScreenTransition`.
- Replaces the prior monolithic `app/onboarding.tsx` (1551 lines → 130 lines, switch on `currentStep`).
- Separate scrapbook theme in `src/constants/onboardingTheme.ts` — cream canvas (#f7f1e6), Caveat/PatrickHand/Kalam/WorkSans fonts, orange CTA (#F4845F).
- Continuous progress bar in header (segmented variant removed); inline `BackChevron` SVG; ScreenTransition animates per-step.

### 1.2 Research-backed polish (all applied)

| Task | Change | Status |
|---|---|---|
| §4.2.1 ScrapbookButton Duolingo shadow | 4pt solid offset (was 1.5); press → shadow opacity 0 + translateY +4 | ✅ |
| §4.2.2 Progress bar a11y | `accessibilityRole="progressbar"` + label + `accessibilityValue {now,min,max}` | ✅ |
| §4.2.3 sectionGap 24 → 32 | Token bump to spec value (research consensus for breathing) | ✅ Needs device check |
| §4.2.4 BackChevron alignment | `marginLeft: -12 → -16` via new `OB_SPACING.backChevronOffset` | ✅ Needs device check |
| §4.3.1 Body font 13 → 14 | `OB_FONT_SIZES.body` | ✅ |
| §4.3.2 Progress bar scrapbook flourish | Skipped — 4pt is too thin for added texture | ⏭️ |
| §4.3.3 Skip button font tokenized | New `OB_FONT_SIZES.skip = 15` | ✅ |
| §4.3.4 Wood frame padding tokenized | New `OB_SPACING.frameBorder = 6` | ✅ |
| §4.3.5 WheelPicker magic numbers | Documented inline (UX-specific, not reused) | ✅ |
| §4.3.6 BirthdayScreen heading marginBottom | `mt3` → `paragraphGap` (semantic, same value) | ✅ |
| §4.3.7 BuildingPlan progress bar | Comment added explaining ceremony-bar intent vs top bar | ✅ |
| ScrapbookChip radius | 24pt (button pill) → 12pt per spec hierarchy | ✅ |
| §4.4.1 Component tests | +16 tests across 3 new suites | ✅ |
| §4.4.2 Visual regression infra | Out of scope (separate effort) | ⏭️ |

**Build state**: 322/322 tests passing. TypeScript clean for all onboarding files.

### 1.3 Files changed in commit `729a7a0`

- New (33 files): all `src/components/onboarding/*.tsx`
- New: `src/constants/onboardingTheme.ts`, `src/lib/lifeStage.ts`, `src/lib/haptics.ts`
- New (4 tests): `BackChevron.test.tsx`, `OnboardingShell.test.tsx`, `OnboardingProgressBar.test.tsx`, `lifeStage.test.ts`
- New: `assets/onboarding/` (3 SVGs)
- Modified: `app/_layout.tsx`, `app/onboarding.tsx`, `src/stores/onboardingStore.ts`, `package.json`, `package-lock.json`, `jest.setup.js`, `src/stores/__tests__/onboardingStore.test.ts`
- Deleted: `src/components/ui/OnboardingProgress.tsx`, `src/components/ui/PatternPromiseCard.tsx` (only referenced by old onboarding)

---

## 2. Open items

### 2.1 Device verification (cannot validate from code alone)

Walk all 19 screens on a physical iPhone:

- [ ] **sectionGap 32pt** — confirm CTAs aren't pushed below fold on iPhone SE / iPhone 13 mini. Tightest screens: Paywall, HealthBaseline, Notifications, BuildingPlan. If cramped, revert `OB_SPACING.sectionGap` to 24 in `src/constants/onboardingTheme.ts:71`.
- [ ] **Duolingo press physics** — tap any orange "Begin" / "Continue" button. Should feel chunky: shadow disappears + button moves down 4pt + slight scale. Compare to Duolingo's primary green button.
- [ ] **BackChevron `-16pt` optical alignment** — chevron stem should optically align with screen-edge text on screens 1–18. Adjust `OB_SPACING.backChevronOffset` (range -20 to -8) if off.
- [ ] **Returning-user flow** — sign out from main app, force-quit, reopen. Should land on `/(auth)/sign-in` (NOT onboarding) because `puplog-onboarding-complete` is set.
- [ ] **Step 0 → Begin tap** transitions cleanly into ValuePropScreen (step 1).

### 2.2 Out of onboarding scope (related, post-onboarding)

- **Main app spacing pass** — apply same research-backed spec to home, health, learn, triage, settings.
  - Reference: `project_puplog_spacing_spec.md` in memory.
  - Main app uses `src/constants/theme.ts` (Earthy Dog Park), NOT `onboardingTheme.ts`.
  - Top steal-this items: Forest "one growing thing" home hero, Cleo chat-bubble tip cards on AIInsightCard, Headspace 1000ms+1.02× celebration on DaySummaryCard.
- **TestFlight readiness** — paywall completion → sign-up flow needs end-to-end QA (currently routes to `/(auth)/sign-up` after paywall complete or skip).

---

## 3. Locked decisions (do NOT change without explicit approval)

| Item | Why |
|---|---|
| Color palettes | User-mandated; tagged `color-baseline-v1` |
| Urgency colors (teal for monitor, NEVER green) | Legally load-bearing — avoids "all clear" false signal |
| 19-step flow order | Research-derived, user-approved |
| `scrollable={false}` on BirthdayScreen | Wheel picker has its own gesture handling |
| ScreenTransition wraps the header | Header animates in/out per step (intentional) |

---

## 4. Token reference (`src/constants/onboardingTheme.ts`)

```typescript
OB_SPACING: {
  mt1: 4, mt2: 8, mt3: 12, mt4: 16,
  screenPaddingTop: 10, screenPaddingH: 24, screenPaddingBottom: 18,
  gap2: 12, gap3: 14, gap4: 18,
  mascotPadding: 32,
  cardPadding: 20, cardPaddingHero: 24,
  sectionGap: 32,           // ← bumped from 24 to spec
  buttonGap: 12, paragraphGap: 12,
  frameBorder: 6,           // ← new (AddPupScreen wood frame)
  backChevronOffset: -16,   // ← new (was -12)
}

OB_RADII: {
  button: 24, buttonSm: 18,
  card: 14,
  chip: 12,                 // ← now applied to ScrapbookChip
  field: 12, iconBackground: 10, woodFrame: 8, progress: 2,
}

OB_FONT_SIZES: {
  h1: 30, h2: 19, h3: 15,
  body: 14,                 // ← bumped from 13
  label: 11, cta: 14, option: 14, placeholder: 13,
  handwritten: 16, skip: 15, // ← skip is new
}

OB_LINE_HEIGHTS: { h1: 1.15, h2: 1.25, h3: 1.3, body: 1.55 }

OB_SHADOWS.button:        { offset: 4pt, opacity: 1, blur: 0 }
OB_SHADOWS.buttonPressed: { offset: 0,   opacity: 0, blur: 0 }
OB_BUTTON_PRESS_TRANSLATE: 4   // ← new

OB_PROGRESS: { height: 4, filledColor: cta, trackColor: 'rgba(138,90,56,0.15)' }
OB_TOTAL_STEPS: 19
```

---

## 5. Quick-start for next Claude

1. **Read this file fully**, then memory at `~/.claude/projects/-Users-rohitsandur-Documents-Projects-dog-app-ui/memory/`.
2. **First action**: confirm §2.1 device-verification items on iOS simulator or physical device — these CANNOT be validated from code alone.
3. **Never use browser preview** — this is React Native (Expo). Always `npx expo start` + iOS sim or device.
4. **Never change colors** — git tag `color-baseline-v1` is the source of truth.
5. **Never start a second Metro on a different port** if 8081 is busy. Kill the existing Metro first (`pkill -f "expo start"`). Multiple Metros confuse Expo Go's discovery.

---

## 6. Lessons from the deployment session (2026-04-24)

These are operational gotchas worth remembering for any future on-device debugging:

- **Expo Go aggressively caches per-project bundles on-device.** `npx expo start --clear` only clears Metro (server-side). The phone-side cache survives unless you explicitly delete the project from Expo Go's Recents OR uninstall+reinstall Expo Go.
- **iOS routes `exp://` URL scheme to whichever installed app handles it.** If you have BOTH Expo Go and a standalone PupLog dev/preview build installed, scanning a QR may launch the standalone — which has stale baked-in JS and isn't talking to Metro. Fix: delete the standalone build, or open Expo Go first and enter the URL manually.
- **iOS "Local Network" permission for Expo Go must be ON** for LAN auto-discovery of Metro (Bonjour/mDNS). If "Development servers" list is empty in Expo Go's Home tab, that permission is the first thing to check (Settings → Privacy & Security → Local Network → Expo Go).
- **Manual URL entry in Expo Go** can bypass QR + discovery entirely: `exp://10.0.0.181:8081` (substitute current LAN IP).
- **Verifying Metro is serving fresh code**: `curl -s "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false" -o /tmp/bundle.js && grep -c "<UNIQUE_NEW_STRING>" /tmp/bundle.js`. If the new string count > 0, Metro has the new bundle. If the phone still shows old behavior, the issue is 100% device-side cache.
- **Don't trust the OS-reported "uninstall"** — iCloud backup can restore AsyncStorage on reinstall, and "Offload App" preserves data. To truly wipe AsyncStorage, you need a full Delete App (long-press → Remove App → Delete App → confirm Delete).

---

## 7. Source links (research foundation)

### Round 1 — General spacing/playful app research
Stored in project memory at `project_puplog_spacing_spec.md`.

- [Wise Design — Spacing/Radius/Padding](https://wise.design/foundations/spacing)
- [Shopify Polaris — Space tokens](https://polaris-react.shopify.com/tokens/space)
- [Uber Base design system](https://base.uber.com/)
- [Duolingo Brand Guidelines](https://design.duolingo.com/)
- [Apple HIG — Layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Material Design 3 — Spacing](https://m3.material.io/foundations/layout/understanding-layout/spacing)
- [Blake Crosley — Duolingo/Headspace breakdowns](https://blakecrosley.com/guides/)

### Round 2 — Onboarding header + progress patterns

- [Apple HIG — Navigation Bars](https://developer.apple.com/design/human-interface-guidelines/navigation-bars)
- [Material Design 3 — Progress indicators](https://m3.material.io/components/progress-indicators/overview)
- [USWDS — Segmented progress bar](https://design.va.gov/components/form/progress-bar-segmented)
- [Hinge case study — Winnie Phung](https://www.winniephung.design/hinge-case-study)
- [Headspace teardown](https://tearthemdown.medium.com/product-teardown-headspace-user-onboarding-personalisation-b6effd0df1d7)
- [Airbnb host onboarding redesign — MadTinker](https://madtinker.net/ux-ui-projects-for-beginners-11-redesigning-airbnb-host-onboarding/)
- [Brilliant onboarding — Savvy](https://trysavvy.com/example/brilliant-onboarding)
- [Monzo onboarding analysis — Craft Innovations](https://craftinnovations.global/monzo-onboarding-analysis/)
