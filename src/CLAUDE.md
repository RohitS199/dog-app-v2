# src/ — Application Source Code

All non-screen source code lives here. Screens are in `app/` (Expo Router), but all business logic, types, components, hooks, and state management are in `src/`.

## Directory Overview

```
src/
├── components/
│   ├── legal/       # Safety-critical legal/compliance components (5)
│   ├── ui/          # General UI components (7)
│   └── __tests__/   # Component tests (4 suites, 29 tests)
├── constants/       # Theme tokens ("Soft Sage and Cream"), config, loading tips
├── hooks/           # useAppState, useNetworkStatus
├── lib/             # Supabase client, emergency keyword engine
│   └── __tests__/   # Lib tests (2 suites, 61 tests)
├── stores/          # Zustand state management (auth, dog, triage)
│   └── __tests__/   # Store tests (1 suite, 13 tests)
└── types/           # TypeScript type definitions (API contract)
```

## Import Patterns

- Components in `app/` import from `src/` using relative paths: `../../src/stores/authStore`
- Components within `src/` use shorter relative paths: `../../constants/theme`
- Legal components have a barrel export: `import { UrgencyBadge, DisclaimerFooter } from '../../src/components/legal'`
- No path aliases configured — all imports are relative

## Key Files by Importance

1. **`types/api.ts`** — API contract types. Urgency is `'monitor'` NOT `'low'`. Response discriminated by `type` field.
2. **`stores/triageStore.ts`** — Most complex store. Handles submission, auto-retry, rate limit handling, cached results, triage nudge.
3. **`lib/emergencyKeywords.ts`** — Client-side emergency detection. 35 single + 43 compound + 3 cluster patterns. Golden Rule's first line of defense.
4. **`stores/dogStore.ts`** — Dog CRUD. `addDog()` must include `user_id` explicitly (RLS requirement).
5. **`stores/authStore.ts`** — Auth state. `changePassword()` uses `updateUser()` (NOT `resetPasswordForEmail`).
6. **`constants/theme.ts`** — "Soft Sage and Cream" palette. Urgency colors are safety-critical — do not change.
7. **`components/legal/`** — All 5 components MUST appear on triage result screens. Legally required.

## Testing

103 tests across 7 suites, all passing. Run with `npm test` or `npx jest --no-cache`.
