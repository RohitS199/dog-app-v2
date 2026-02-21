# src/constants/ — App-Wide Constants

Three files containing all magic values, design tokens, and configuration.

## theme.ts — Design Tokens

All visual styling constants. Every component references these instead of hardcoded values.

### COLORS — "Soft Sage and Cream" Palette
- **Brand**: `primary` (#94A684 sage green), `primaryLight` (#A8B896), `primaryDark` (#7A8E6C)
- **Urgency** (safety-critical — do NOT change):
  - `emergency` (#C62828 red)
  - `urgent` (#E65100 orange)
  - `soon` (#F57C00 amber)
  - `monitor` (#00897B teal — intentionally NOT green, avoids "all clear" signal)
- **Neutrals — Cream palette**:
  - `background` (#F8F9F5 warm off-white cream)
  - `surface` (#FFFFFF)
  - `textPrimary` (#1A1C19 deep charcoal for legibility)
  - `textSecondary` (#5E625B softer grey-green)
  - `textDisabled` (#9E9E9E — passes WCAG AA 4.6:1 on white)
  - `border` (#E2E4DE sage-tinted)
  - `divider` (#EDEEE9 light sage)
- **Semantic**: `error` (#D32F2F), `success` (#388E3C), `warning` (#F57C00), `info` (#7A8E6C sage-tinted)
- **Overlay**: `rgba(26, 28, 25, 0.5)` charcoal overlay

### URGENCY_CONFIG
Maps each urgency level to its display config:
- `label` — Display name (e.g., "Low Urgency" for monitor)
- `color` — Text/border color
- `backgroundColor` — Badge/card background (e.g., #E0F2F1 for monitor)
- `description` — Explanatory text (e.g., "Seek veterinary care immediately")

The `UrgencyLevel` type is derived from `keyof typeof URGENCY_CONFIG`.

### Layout Constants
- `SPACING`: xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
- `FONT_SIZES`: xs(12), sm(14), md(16), lg(18), xl(20), xxl(24), xxxl(32)
- `BORDER_RADIUS`: sm(4), md(8), lg(12), xl(16), full(9999)
- `MIN_TOUCH_TARGET`: 48 — WCAG minimum touch target in dp. Used on every button and interactive element.

## config.ts — App Configuration

### API
- `SUPABASE_URL` and `SUPABASE_ANON_KEY` — Read from `process.env.EXPO_PUBLIC_*` env vars (set in `.env` file)
- `CHECK_SYMPTOMS_ENDPOINT` and `DELETE_ACCOUNT_ENDPOINT` — Edge Function paths (used for reference, actual calls go through `supabase.functions.invoke()`)

### LIMITS
- `SYMPTOM_MAX_CHARS: 2000` — Server also enforces this. NOT 1000.
- `RATE_LIMIT_PER_HOUR: 10`, `RATE_LIMIT_PER_DAY: 50` — Note: only 10/hour is actually enforced server-side
- `EMERGENCY_DEBOUNCE_MS: 500` — Debounce for client-side emergency keyword detection
- `LOADING_MIN_DISPLAY_MS: 3000` — Minimum loading screen display time (prevents jarring flash)
- `LOADING_STILL_WORKING_MS: 15000` — When "still working" message appears
- `LOADING_TIMEOUT_MS: 30000` — Loading timeout (referenced but not currently enforced via timeout mechanism)
- `DOG_AGE_MIN: 0`, `DOG_AGE_MAX: 30` — Validation range for dog age
- `COPPA_MIN_AGE: 13` — COPPA compliance age gate

### EMERGENCY
- `ASPCA_POISON_CONTROL: '888-426-4435'` — ASPCA hotline number
- `SEARCH_EMERGENCY_VET_URL` — Google search URL for "emergency vet near me" (post-MVP will use Google Places API)

### LEGAL
- `DISCLAIMER_TEXT` — Default legal disclaimer shown on result screens
- `TERMS_VERSION: '1.0'` — Used to check acceptance in `user_acknowledgments` table. When terms change, increment this and users will be re-prompted.

## loadingTips.ts — Loading Screen Tips

Array of 8 educational tip strings shown during the loading screen on 4-second rotation. Examples:
- "Analyzing symptoms against veterinary references..."
- "Remember: this is educational information, not a diagnosis."
- "Your dog's health history matters - share details with your vet."

**Important**: This file previously had smart quote issues (curly `'` `'` characters) that caused TypeScript compilation errors. All apostrophes must be straight quotes (`'`) or escaped (`\'`). If you edit this file, use only ASCII quotes.
