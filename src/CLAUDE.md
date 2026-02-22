# src/ — Application Source Code

All non-screen source code lives here. Screens are in `app/` (Expo Router), but all business logic, types, components, hooks, and state management are in `src/`.

## Directory Overview

```
src/
├── components/
│   ├── legal/       # Safety-critical legal/compliance components (5)
│   ├── ui/          # General UI components (20)
│   └── __tests__/   # Component tests (8 suites, 59 tests)
├── constants/       # Theme tokens, config, loading tips, check-in questions
├── hooks/           # useAppState, useNetworkStatus
├── lib/             # Supabase client, emergency keywords, pattern rules, consistency score, day summary
│   └── __tests__/   # Lib tests (5 suites, 105 tests)
├── stores/          # Zustand state management (auth, dog, triage, checkIn, health)
│   └── __tests__/   # Store tests (3 suites, 41 tests)
└── types/           # TypeScript type definitions (api, checkIn, health)
```

## Import Patterns

- Components in `app/` import from `src/` using relative paths: `../../src/stores/authStore`
- Components within `src/` use shorter relative paths: `../../constants/theme`
- Legal components have a barrel export: `import { UrgencyBadge, DisclaimerFooter } from '../../src/components/legal'`
- No path aliases configured — all imports are relative

## Key Files by Importance

1. **`types/api.ts`** — API contract types. Urgency is `'monitor'` NOT `'low'`. Response discriminated by `type` field.
2. **`stores/checkInStore.ts`** — Check-in draft with Zustand persist middleware (AsyncStorage). Handles UPSERT submission, rehydration guards, emergency flag detection. Awaits persist rehydration before checking draft.
3. **`stores/triageStore.ts`** — Triage submission with auto-retry, rate limit handling, cached results, triage nudge.
4. **`lib/emergencyKeywords.ts`** — Client-side emergency detection. 35 single + 44 compound + 3 cluster patterns. Golden Rule's first line of defense.
5. **`lib/patternRules.ts`** — 17 rule-based pattern detection rules (5 single-day, 12 trend).
6. **`stores/dogStore.ts`** — Dog CRUD. `addDog()` must include `user_id` explicitly (RLS requirement). Omit type excludes server-managed fields (`last_checkin_date`, `checkin_streak`).
7. **`stores/healthStore.ts`** — Calendar data with trailing window fetch (7 days before month start), active alerts, dismiss.
8. **`stores/authStore.ts`** — Auth state. `changePassword()` uses `updateUser()` (NOT `resetPasswordForEmail`).
9. **`constants/theme.ts`** — "Soft Sage and Cream" palette. Urgency colors are safety-critical — do not change.
10. **`components/legal/`** — All 5 components MUST appear on triage result screens. Legally required.

## Testing

205 tests across 16 suites, all passing. Run with `npm test` or `npx jest --no-cache`.
