// Design tokens for PawCheck
// "Earthy Dog Park" palette — organic, grounded, playful feel
// Limestone bg, Topsoil cards, Dark Loam text/buttons, Orange Collar accents
// Urgency colors: Teal for "monitor" (NOT green) to avoid "all clear" signal

export const COLORS = {
  // Brand — Earth Tones
  primary: '#3E2723',      // Dark Loam — primary buttons, text, actions
  primaryLight: '#5D4037',  // Medium brown — lighter primary contexts
  primaryDark: '#1B0F0A',   // Darkest brown

  // Accent — Orange Collar (selection, alerts, active states, FAB)
  accent: '#FF6F00',
  accentLight: 'rgba(255, 111, 0, 0.12)', // Orange Collar at ~12% for light tinted backgrounds

  // Urgency levels (safety-critical — do NOT change)
  emergency: '#C62828',
  urgent: '#E65100',
  soon: '#F57C00',
  monitor: '#00897B', // Teal — intentionally NOT green

  // Neutrals — Earthy palette
  background: '#EFEBE9',   // Limestone — main app background
  surface: '#D7CCC8',      // Topsoil — cards, containers, modules
  surfaceLight: '#F5F0ED', // Light tint for input fields
  textPrimary: '#3E2723',  // Dark Loam — maximum readability
  textSecondary: '#5D4037', // Medium brown — softer text
  textDisabled: '#795548', // Warm brown — 4.6:1 on Limestone, WCAG AA
  border: '#BCAAA4',       // Warm brown border
  divider: '#C8B8B0',      // Slightly darker than Topsoil for dividers

  // Semantic
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#FF6F00',         // Orange Collar — info accent

  // Overlay
  overlay: 'rgba(62, 39, 35, 0.5)', // Dark Loam overlay
} as const;

export const URGENCY_CONFIG = {
  emergency: {
    label: 'Emergency',
    color: COLORS.emergency,
    backgroundColor: '#FFEBEE',
    description: 'Seek veterinary care immediately',
  },
  urgent: {
    label: 'Urgent',
    color: COLORS.urgent,
    backgroundColor: '#FFF3E0',
    description: 'See a vet within 24 hours',
  },
  soon: {
    label: 'Soon',
    color: COLORS.soon,
    backgroundColor: '#FFF8E1',
    description: 'Schedule a vet visit soon',
  },
  monitor: {
    label: 'Low Urgency',
    color: COLORS.monitor,
    backgroundColor: '#E0F2F1',
    description: 'Monitor at home, see vet if symptoms worsen',
  },
} as const;

export type UrgencyLevel = keyof typeof URGENCY_CONFIG;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Minimum touch target for accessibility (48dp)
export const MIN_TOUCH_TARGET = 48;

// Alert level configuration for pattern alerts
export const ALERT_LEVEL_CONFIG = {
  info: {
    label: 'Info',
    color: '#1976D2',
    backgroundColor: '#E3F2FD',
    icon: 'information-outline' as const,
  },
  watch: {
    label: 'Watch',
    color: '#F57C00',
    backgroundColor: '#FFF3E0',
    icon: 'eye-outline' as const,
  },
  concern: {
    label: 'Concern',
    color: '#E65100',
    backgroundColor: '#FBE9E7',
    icon: 'alert-outline' as const,
  },
  vet_recommended: {
    label: 'Vet Recommended',
    color: '#C62828',
    backgroundColor: '#FFEBEE',
    icon: 'medical-bag' as const,
  },
} as const;

export type AlertLevelKey = keyof typeof ALERT_LEVEL_CONFIG;

// Calendar day status visual configuration
export const CALENDAR_STATUS_CONFIG = {
  good: {
    color: '#388E3C',
    backgroundColor: '#E8F5E9',
    shape: 'circle' as const,
  },
  fair: {
    color: '#F57C00',
    backgroundColor: '#FFF3E0',
    shape: 'triangle' as const,
  },
  poor: {
    color: '#C62828',
    backgroundColor: '#FFEBEE',
    shape: 'diamond' as const,
  },
  new: {
    color: '#1976D2',
    backgroundColor: 'transparent',
    shape: 'circle_outlined' as const,
  },
  missed: {
    color: '#9E9E9E',
    backgroundColor: 'transparent',
    shape: 'dash' as const,
  },
  future: {
    color: 'transparent',
    backgroundColor: 'transparent',
    shape: 'none' as const,
  },
} as const;
