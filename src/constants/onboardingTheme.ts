// Design tokens for PupLog onboarding — scrapbook aesthetic
// These are ONLY used during onboarding. The main app uses theme.ts (Earthy Dog Park).

export const OB_COLORS = {
  cream: '#f7f1e6',
  cream2: '#efe6d2',
  peach: '#f3d7b0',
  peach2: '#e8c28a',
  wood: '#8a5a38',
  woodDk: '#5a3a22',
  ink: '#2a221c',
  ink2: '#574a3f',
  muted: '#a9998a',
  sketch: '#1a140f',
  green: '#6b7a3d',
  greenDk: '#4b5a28',
  accent: '#475E3D',
  blush: '#f2c6bd',
  cta: '#F4845F',
  ctaText: '#ffffff',
  selectedBg: '#e3ead9',
  selectedBorder: '#475E3D',
  // Profile redesign additions (May 2026)
  peachSoft: '#fbe6cc',
  red: '#c75f4a',
  orangeSoft: '#f9a886',
  petalA: '#e8a6a0',
  petalB: '#d9a96a',
  // Pattern E — Featured-state palette (May 2026). Dusty dog-park dusk blue.
  // Paired with `cream` foreground = 4.92:1 contrast (WCAG AA pass for 9pt label).
  featuredBlue: '#3F6E8F',
  // 10% featuredBlue wash — unfeatured ribbon bg + featured grid tile tint.
  // Picks up enough hue to distinguish from the cream trophy backdrop without
  // competing with the solid featured state.
  featuredBlueWash: 'rgba(63, 110, 143, 0.10)',
} as const;

export const OB_FONTS = {
  h1: 'Caveat_400Regular',
  h2: 'PatrickHand_400Regular',
  h3: 'PatrickHand_400Regular',
  body: 'PatrickHand_400Regular',
  label: 'Kalam_700Bold',
  cta: 'WorkSans_500Medium',
  option: 'WorkSans_500Medium',
  placeholder: 'WorkSans_400Regular',
  handwritten: 'Caveat_400Regular',
  wheelValue: 'Kalam_700Bold',
  // Profile redesign additions (Nunito — loaded via @expo-google-fonts/nunito)
  dataLabel: 'Nunito_600SemiBold',
  dataValue: 'Nunito_500Medium',
  btnLabel: 'Nunito_700Bold',
} as const;

export const OB_FONT_SIZES = {
  h1: 30,
  h2: 19,
  h3: 15,
  body: 14,
  label: 11,
  cta: 14,
  option: 14,
  placeholder: 13,
  handwritten: 16,
  skip: 15,
} as const;

export const OB_LINE_HEIGHTS = {
  h1: 1.15,
  h2: 1.25,
  h3: 1.3,
  body: 1.55,
} as const;

export const OB_SPACING = {
  mt1: 4,
  mt2: 8,
  mt3: 12,
  mt4: 16,
  screenPaddingTop: 10,
  screenPaddingH: 24,
  screenPaddingBottom: 18,
  gap2: 12,
  gap3: 14,
  gap4: 18,
  mascotPadding: 32,
  cardPadding: 20,
  cardPaddingHero: 24,
  sectionGap: 32,
  buttonGap: 12,
  paragraphGap: 12,
  frameBorder: 6,
  backChevronOffset: -16,
  // Profile redesign addition (spec §6.1)
  gap1: 4,
} as const;

export const OB_RADII = {
  button: 24,
  buttonSm: 18,
  card: 14,
  chip: 12,
  field: 12,
  iconBackground: 10,
  woodFrame: 8,
  progress: 2,
  // Profile redesign additions
  rowItem: 18,
  pillBtn: 22,
  modal: 18,
} as const;

export const OB_BORDERS = {
  standard: 2,
  selected: 2.5,
  woodFrame: 3,
} as const;

// Sketchy shadow helper for cards/buttons
// button: Duolingo-style 4pt solid-offset (no blur) for tactile "push" feel.
// buttonPressed: zero-offset, invisible — paired with translateY(4) on press.
export const OB_SHADOWS = {
  card: {
    shadowColor: OB_COLORS.sketch,
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  button: {
    shadowColor: OB_COLORS.sketch,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonPressed: {
    shadowColor: OB_COLORS.sketch,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;

export const OB_BUTTON_PRESS_TRANSLATE = 4;

// Progress bar config (continuous bar — see OnboardingProgressBar.tsx)
export const OB_PROGRESS = {
  height: 4,
  filledColor: OB_COLORS.cta,
  trackColor: 'rgba(138, 90, 56, 0.15)', // wood @ 15% — warm scrapbook tint on cream
} as const;

// Total steps for progress display
export const OB_TOTAL_STEPS = 19;
