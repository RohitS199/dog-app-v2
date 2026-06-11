# My Dogs Tab — Visual Addendum (binding for implementation)

- **Date:** 2026-06-11
- **Status:** Binding. Overrides the *styling* in `docs/superpowers/plans/2026-06-06-my-dogs-tab.md` (laptop-local). Structure, data flow, tests, copy, and IA from the spec/plan stay as written unless explicitly amended here.
- **Why:** Market research pass (pet apps: Finch/Dogo/Woofz/Rover/Embark/Fi; wellness systems: Duolingo/Headspace/Gentler Streak/Daylio/Waterllama; memory products: Apple Journal/Day One/Tinybeans/Polarsteps/Spotify Wrapped/Retro/Lapse) + in-repo audit.

## 1. The verdict — what was wrong

1. **"Earthy Dog Park" (`theme.ts`) is the 2014 Material Brown column.** Topsoil `#D7CCC8` = Brown 100, border `#BCAAA4` = Brown 200, Dark Loam `#3E2723` = Brown 900, accent `#FF6F00` = Orange 900, bg `#FAFAFA` = Grey 50. Mid-tone gray-brown card fills are the single most dated element in the app: they invert elevation (cards darker than bg), mute dog-photo vibrancy, and read "beige office," not "living scrapbook."
2. **`#FAFAFA` is a cool gray-white** — emotionally wrong for a scrapbook. The genre (Finch ≈`#FFF6E9`, Headspace `#FDF5EB`) sits on warm cream. The repo already knows: onboarding + Profile use cream `#f7f1e6`.
3. **Contrast violations in the old recipe:** white-on-`#FF6F00` = 2.79:1 and white-on-coral `#F4845F` = 2.53:1 — both FAIL WCAG AA. Ink `#2A221C` on coral = 6.2:1 PASSES. New CTAs in this tab use **ink-on-coral**, never white-on-orange.
4. **One saturated accent is too few for a 7-section hub**, and `#FF6F00` sits between the urgency oranges (`#E65100`, `#F57C00`) — an orange-drenched hub dilutes the alert channel. Best-in-class systems give each module its own hue family (Duolingo: streak=orange, XP=yellow, gems=blue) and keep alert colors rare. This *protects the Golden Rule*.
5. **The fix is in-repo:** the scrapbook system (`onboardingTheme.ts`, shipped on Profile) is market-correct. My Dogs extends it. The old `theme.ts` surfaces are **banned in this tab** (exception: shared components' internals + the urgency/calendar-status safety semantics, which are untouched).

## 2. Token additions (in `OB_COLORS`, committed with this doc)

| Token | Value | Job |
|---|---|---|
| `cardWhite` | `#FFFDF8` | All content-card faces (photos/data pop on cream) |
| `hairline` | `#EDE3D2` | Row dividers on cardWhite |
| `washNeutral` | `#F3ECDE` | Empty/ghost/pressed fills |
| `toneThriving` / `toneThrivingWash` | `#7FAE5C` / `#E6EDDA` | Week tone: all-normal |
| `toneOkay` / `toneOkayWash` | `#E0B65C` / `#F7EBCB` | Week tone: minor notes |
| `toneAttention` / `toneAttentionWash` | `#C97B4A` / `#F5E3D7` | Week tone: attention |
| `toneConcern` / `toneConcernWash` | `#A14D5D` / `#F1DEDF` | Week tone: vet-recommended week |

Tone colors are **fills/washes only — never text**. All text is ink (`#2A221C`) or ink2 (`#574A3F`). Tone hues deliberately avoid the urgency palette (`#C62828`/`#E65100`/`#F57C00`/teal) so alert colors keep their meaning. `muted #a9998a` is decorative-only (2.45:1 — never text).

## 3. Global rules for every `src/components/dogs/*` + both screens

- **Surfaces:** screen bg `OB_COLORS.cream`. Cards: `OB_COLORS.cardWhite` face, 2px `OB_COLORS.sketch` border, radius `OB_RADII.rowItem` (18), `OB_SHADOWS.card`. No `COLORS.surface`/`COLORS.card`/`COLORS.background` anywhere in this tab.
- **Type:** screen title + dog name = `OB_FONTS.h1` (Caveat). Section headers = `OB_FONTS.h2` (PatrickHand, 19, ink). **All body/meta/values/captions = Nunito** (`OB_FONTS.dataLabel`/`dataValue`/`btnLabel`) — PatrickHand never carries data on this tab; Caveat additionally allowed only as handwritten *date stamps / dog-voice lines*, ≥16pt. Secondary text = `ink2`.
- **CTAs (Duolingo press mechanic, matches onboarding):** coral `OB_COLORS.cta` fill, **ink label** (`OB_FONTS.btnLabel`), pill radius `OB_RADII.pillBtn`, 2px sketch border, `OB_SHADOWS.button` at rest → `OB_SHADOWS.buttonPressed` + `translateY(4)` (`OB_BUTTON_PRESS_TRANSLATE`) while pressed. Min height 48 (`MIN_TOUCH_TARGET`).
- **Accent jobs:** coral = action/brand · `featuredBlue` = Biscuit/info · leaf greens (`toneThriving`, OB `accent #475E3D` for text) = garden/positive · tones = week cards. `#FF6F00` does not appear in this tab (two-oranges clash); the CalendarGrid today-circle gets a new optional `accentColor` prop (default `COLORS.accent`, My Dogs passes coral) so Health is untouched.
- **Scrapbook restraint (one physical metaphor per layer):** polaroid framing + ±2° tilt ONLY on week-scene cards and ghost sticker slots; alternate tilt signs across siblings; never tilt grid/calendar/tappable rows; no texture overlays anywhere; max one handwritten element per card.
- **Warm empties:** every empty state = designed moment (ghost shapes + one warm sentence + at most one CTA). Never a bare gray box.
- **A11y:** unchanged from plan — roles/labels/48dp/shape+color statuses; decorative glyphs `accessibilityElementsHidden` + `importantForAccessibility="no"`.

## 4. Per-component bindings (plan tests stay valid unless noted)

1. **DogSwitcher** — avatar 56 circle: `cardWhite` bg, 2px sketch border; selected → border 3px coral + name `Nunito_700` ink; unselected name `Nunito_600` ink2. Add pill: `washNeutral` bg, dashed sketch border, plus icon ink. Labels 12pt.
2. **DogIdentityHero** — portrait 104: 2px sketch ring with 4px `cardWhite` padding ring + `OB_SHADOWS.card`; fallback initial Caveat 44 `woodDk` on `cream2`. Name Caveat 34 ink. Meta = **three chips** (`{breed}`, `{age_years} yrs`, `with you {N} yr(s)`) — `peachSoft` bg, radius `OB_RADII.chip`, `Nunito_600` 12 ink2, NOT a dot-separated text line (market: pill chips, not label rows). Keep plan's strings *inside* the chips so `/Golden Retriever/` matches. Personality line = Caveat 20 ink, centered (dog-voice). Today states: logged → chip `selectedBg` bg + `OB_COLORS.accent` (#475E3D) `Nunito_700` 13 text `Logged · {mood} today`; not logged → CTA pill per §3 with text `How's {name} today?`.
3. **WeekSceneCard** — polaroid object: pure `#FFFFFF` face, 2px sketch border, radius 8 (paper < card radius), padding 8, width 132; scene area h84 radius 6 filled with the week's **tone wash**, containing a centered `home-variant-outline` glyph (ink2, decorative-hidden) and a bottom row of **7 day dots** (logged = 8px filled circle in tone fill; unlogged = 8px `washNeutral` circle) — honest data, no emoji. Caption: date `label` in **Caveat 16 ink** (handwritten date stamp), `{loggedCount}/7 days` `Nunito_600` 11 ink2. `rotation` prop as plan (−2/1.5/−1 cycle). A11y label as plan.
4. **WeekLookBack** — header `{dog}'s house & garden` PatrickHand 19 (spec copy kept); empty state: `washNeutral` card, dashed sketch border, plan's copy in `Nunito_500` 14 ink2; `See more ›` coral `Nunito_700`.
5. **DogStickerShelf** — header `{dog}'s stickers` PatrickHand 19; `cardWhite` bordered card containing **3 ghost slots** (56 circles, dashed sketch border, `washNeutral` fill, tilts −2/+1.5/−1) above the plan's coming-soon sentence (`Nunito_500` 14 ink2, centered). Test `/coming soon/i` still matches.
6. **AskBiscuitCard** — `cardWhite` bordered row card; 44 `featuredBlue` circle + white `paw` icon; title PatrickHand 17 ink; subtitle `Nunito_500` 13 ink2; chevron coral.
7. **DogCareDetails** — header `Care` PatrickHand 19 + `Edit ›` coral `Nunito_700`; `cardWhite` bordered card; rows: label `Nunito_600` 13 ink2 / value `Nunito_600` 15 ink; dividers `hairline`; **last row has no divider** (resolves plan's noted polish item).
8. **dogs.tsx** — bg cream; top bar `My Dogs` Caveat 30 + gear (ink, 48dp). Calendar section header `What you logged` PatrickHand 19; `CalendarGrid` sits inside a `cardWhite` bordered card (padding `sm`) and receives `accentColor={OB_COLORS.cta}`. Section spacing 24. No-dogs empty state: tilted (−2°) dashed polaroid placeholder (120×140, `washNeutral`) with `paw` glyph + plan's copy + coral/ink CTA pill. Loading spinner color `wood`.
9. **dog-weeks.tsx** — cream bg; back chevron ink; title Caveat 26; wrap-grid of WeekSceneCards, rotation cycle (−2/1.5/−1/2).
10. **Shared-component seams (Health tab pixel-identical):** `CalendarGrid` + optional `accentColor?: string` (default `COLORS.accent`). `DayDetailSheet` + optional `backgroundColor?: string` (default `COLORS.surface`); My Dogs passes `OB_COLORS.cream`.
11. **FloatingTabBar / Task 12** — per plan only (add `dogs` slot, paw icon, hide `health`). The bar's global styling is app-wide chrome — out of scope.

## 5. Explicitly out of scope (flagged, not fixed here)

- Repainting Journey/Health/old-theme screens; retiring `theme.ts` surfaces app-wide.
- Existing white-on-coral labels in onboarding/Profile (`PillButton` primary, `ctaText`) — same AA violation, pre-existing; fix as follow-up.
- Photo-in-calendar-cell memories, Wrapped-style shareable recap exports, sticker decoration loop, flower art — Phase 2 candidates from research, recorded in §6 of the research briefs.
