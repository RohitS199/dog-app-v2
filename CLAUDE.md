# PawCheck — Mobile App (dog_app_ui)

## Repository

- **GitHub**: https://github.com/RohitS199/dog-app-v2.git (migrated from dog-app-ui on Feb 21, 2026)
- **Remote name**: `origin`
- All new commits and PRs go to this repo. The old `dog-app-ui` repo is archived.

## What This Is

PawCheck is a React Native (Expo) mobile app that provides **educational health guidance** for dogs. It has two core features:

1. **Daily Health Check-Ins** (v2.6) — 9-question structured logging with rule-based pattern detection and health trend analysis
2. **Symptom Triage** (v1.0) — Free-text symptom input returning AI-generated urgency classification (Emergency, Urgent, Soon, Low Urgency) with educational information, vet tips, and source citations

**It is NOT veterinary medicine** — this distinction is legally load-bearing and permeates every design decision.

### The Golden Rule

> Never let a dog owner walk away from a genuine emergency thinking they can wait.

Every feature, every component, every urgency color choice exists in service of this principle. If you're ever unsure about a design decision, apply this rule.

## Tech Stack

- **Expo SDK 54** — Managed workflow, TypeScript strict mode
- **Expo Router v6** — File-based navigation (`app/` directory)
- **React Native 0.81** — New Architecture enabled
- **Zustand v5** — Lightweight state management (5 stores: auth, dog, triage, checkIn, health)
- **Supabase JS v2** — Auth, Postgres database, Edge Functions
- **expo-secure-store** — JWT token persistence (critical for security)
- **expo-network** — Offline detection (polling, no listener API)
- **@react-native-async-storage/async-storage** — Zustand persist middleware for check-in draft
- **react-native-reanimated v4** + **react-native-svg** — Installed for future Buddy mascot animation (not yet implemented)
- **Jest 29** + **React Native Testing Library** — 205 tests across 16 suites

## Project Structure

```
dog_app_ui/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx               # Root layout — auth routing logic
│   ├── (auth)/                   # Auth group (unauthenticated users)
│   │   ├── _layout.tsx           # Stack navigator, no header
│   │   ├── sign-in.tsx           # Email/password sign-in
│   │   ├── sign-up.tsx           # Sign-up with COPPA 13+ DOB gate
│   │   └── forgot-password.tsx   # Password reset via email
│   ├── (tabs)/                   # Main app (authenticated + terms accepted)
│   │   ├── _layout.tsx           # Bottom tab navigator (Home, Health, Triage, Settings)
│   │   ├── index.tsx             # Home — dog cards, check-in CTA, streak badges
│   │   ├── health.tsx            # Health tab — calendar, alerts, consistency score
│   │   ├── triage.tsx            # Core triage flow — input → loading → result
│   │   └── settings.tsx          # Account, dogs, legal, sign out, delete
│   ├── terms.tsx                 # ToS acceptance (required before main app)
│   ├── add-dog.tsx               # Add dog form
│   ├── edit-dog.tsx              # Edit/delete dog form
│   ├── check-in.tsx              # Daily check-in flow (9 questions, full-screen modal)
│   ├── emergency.tsx             # Standalone emergency resources screen
│   ├── change-password.tsx       # Change password for logged-in users
│   └── delete-account.tsx        # Account deletion with confirmation
├── src/
│   ├── components/
│   │   ├── legal/                # Safety-critical legal components (5)
│   │   ├── ui/                   # General UI components (20)
│   │   └── __tests__/            # Component tests (8 suites)
│   ├── constants/                # Theme, config, loading tips, check-in questions
│   ├── hooks/                    # useAppState, useNetworkStatus
│   ├── lib/                      # Supabase client, emergency keywords, pattern rules, consistency score
│   │   └── __tests__/            # Lib tests (5 suites)
│   ├── stores/                   # Zustand stores (auth, dog, triage, checkIn, health)
│   │   └── __tests__/            # Store tests (3 suites)
│   └── types/                    # TypeScript types (api, checkIn, health)
├── jest.config.js                # Jest with jest-expo preset
├── jest.setup.js                 # Mocks for Supabase, Expo modules, Linking
├── app.json                      # Expo config (scheme: pawcheck)
├── tsconfig.json                 # Extends expo/tsconfig.base, strict: true
├── index.ts                      # Entry point: import 'expo-router/entry'
└── .env.example                  # Required env vars template
```

## Critical Architecture Decisions

### Auth Routing (app/_layout.tsx)

The root layout implements a 3-state routing guard:
1. **No session** → redirect to `/(auth)/sign-in`
2. **Session but no terms acceptance** → redirect to `/terms`
3. **Session + terms accepted** → allow `/(tabs)` access

This runs on every segment change via `useSegments()`. The `hasAcceptedTerms` flag is checked against the `user_acknowledgments` table in Supabase.

### API Contract (src/types/api.ts)

The backend returns **3 distinct response types** — the `type` field discriminates:

```typescript
type CheckSymptomsResponse =
  | TriageResponse       // type: 'triage' — normal result with urgency + sources
  | EmergencyBypassResponse  // type: 'emergency_bypass' — emergency with poison control
  | OffTopicResponse     // type: 'off_topic' — non-dog or human health query
```

**CRITICAL CORRECTNESS NOTES:**
- Urgency values are `'emergency' | 'urgent' | 'soon' | 'monitor'` — **NOT 'low'**. The backend returns `"monitor"`, the UI label is "Low Urgency".
- The `type` field discriminates responses, NOT a boolean `is_emergency_bypass` (that field does NOT exist).
- `show_poison_control` and `poison_control_number` only exist on `EmergencyBypassResponse`.

### Color Palette — "Earthy Dog Park"

The app uses an earthy, organic palette:
- **Limestone** (#EFEBE9) — main background
- **Topsoil** (#D7CCC8) — cards, containers
- **Dark Loam** (#3E2723) — primary text, buttons, actions
- **Orange Collar** (#FF6F00) — accent, selection states, FAB, active tab

New tokens: `accent` (Orange Collar), `accentLight` (12% Orange Collar for tinted backgrounds), `surfaceLight` (light tint for input fields).

### Urgency Colors — Teal, NOT Green

```
emergency → #C62828 (Red)
urgent    → #E65100 (Orange)
soon      → #F57C00 (Amber)
monitor   → #00897B (Teal) ← INTENTIONALLY not green
```

The lowest urgency uses **teal (#00897B)**, not green. This was a deliberate decision to avoid the "green = all clear" false safety signal. Do not change this to green.

### Client-Side Emergency Detection (src/lib/emergencyKeywords.ts)

Runs with **500ms debounce** on symptom input, BEFORE submission. If triggered, shows an emergency alert banner urging the user to seek immediate help. This is the Golden Rule in action — even before the API responds.

Three pattern types:
1. **Single-word** (35 patterns): seizure, poison, choking, antifreeze, xylitol, etc.
2. **Compound** (44 patterns): all words must be present — "not breathing", "hit by car", "blue gums", "stuck throat", "grey gums", etc.
3. **Symptom clusters** (3 clusters): if N+ keywords appear together — e.g., vomiting + diarrhea + lethargic

### Loading Screen (3-Second Minimum)

The loading screen enforces a `LOADING_MIN_DISPLAY_MS: 3000` minimum display time. If the API returns in 130ms (emergency bypass), a flash of loading feels broken. Holding for 3 seconds makes it feel intentional. Tips rotate every 4 seconds, "still working" appears at 15 seconds, timeout at 30 seconds.

### Triage Store Auto-Retry

The `triageStore.submitSymptoms()` has a one-time auto-retry with a `hasRetried` guard. If the first API call fails and `hasRetried` is false, it silently retries once. The guard prevents infinite retry loops.

### Triage Nudge

If the user runs 3+ triage checks within 7 days, a blue info card appears: "If you're worried about your dog, seeing a vet is always the best option." Dismissable per session. Timestamps are tracked in `recentTriageTimestamps[]` and filtered by 7-day window.

### Daily Check-In Flow (v2.6)

The check-in is a **full-screen modal** (`app/check-in.tsx`) with 9 steps:
- Steps 0-6: Single-select questions (appetite, water, energy, stool, vomiting, mobility, mood)
- Step 7: Multi-select additional symptoms (11 options, "None" deselects all others)
- Step 8: Free text (500 char max) with emergency keyword detection
- After step 8: Review screen (tap any answer to edit)
- After submit: Day summary card with 4 tiers (all_normal, minor_notes, attention_needed, vet_recommended)

**Check-in data flow**: UPSERT directly to Supabase `daily_check_ins` table (no Edge Function). Sets `emergency_flagged` by running `detectEmergencyKeywords()` on free text. After save, fires `analyze-patterns` Edge Function and `fetchDogs()` in parallel (non-blocking). `handleSubmit` checks for errors before transitioning to summary (prevents dead state on failure).

**Draft persistence**: Zustand persist middleware with AsyncStorage. Only `draft` and `currentStep` are persisted. `startCheckIn` awaits persist rehydration before checking draft. Three rehydration guards discard stale drafts: (a) dogId no longer exists, (b) check_in_date has passed, (c) entry already exists for that dog+date. Dog switch mid-flow resets `flowState` to questions.

### Pattern Detection (v2.6)

17 rule-based pattern rules in `src/lib/patternRules.ts`:
- **5 single-day rules** (always fire): blood_in_stool, dry_heaving_emergency, sudden_aggression, vomiting_plus_other, multi_symptom_acute
- **12 trend rules** (require 70% density over trailing window): appetite_decline, appetite_increase, energy_decline, etc.
- **Composite priority**: appetite_thirst_increase suppresses standalone appetite_increase
- **Never auto-resolve**: blood_in_stool, dry_heaving_emergency
- **Severity escalation**: watch → concern at 14+ days active

### Health Calendar (v2.6)

`app/(tabs)/health.tsx` — Monthly calendar grid with 6 status states:
- Green circle (score 4-5), Amber triangle (2-3), Red diamond (1), Blue outlined circle (days 1-4), Gray dash (missed), Nothing (future)
- Shape + color differentiation for WCAG AA accessibility
- Day detail bottom sheet shows full check-in data with previous day comparison
- Consistency score: mode of trailing 7-day window, 1-5 scale, requires min 5 days
- Health store fetches 7 days before month start for trailing window at boundaries
- Loading indicator + error display during data fetch
- Calendar data cleared on dog switch (prevents stale data from previous dog)

## Backend (Supabase — separate project, all tasks COMPLETE)

The backend is a Supabase project at `https://wwuwosuysoxihtbykwgh.supabase.co`. All Edge Functions deploy with `verify_jwt: false` due to ES256/HS256 mismatch — they validate JWTs internally.

### Edge Functions

| Function | Version | Purpose |
|----------|---------|---------|
| `check-symptoms` | v10 | 16-step triage pipeline (emergency bypass, RAG, LLM, output filter, foreign body floor, audit log) |
| `analyze-patterns` | v1 | 8-step rule-based pattern detection (17 rules, 20/hr rate limit, dedup, auto-resolve) |
| `delete-account` | v1 | Password re-auth → anonymize triage data → admin delete user |
| `run-stress-test` | v3 | 120-prompt automated test harness (run per-category, not all at once) |

### Database Tables

- **`dogs`** — Dog profiles + `last_checkin_date` + `checkin_streak`. FK to auth.users with CASCADE delete.
- **`daily_check_ins`** — Structured daily health logs (7 metrics + symptoms + free text). UNIQUE(dog_id, check_in_date). RLS: full CRUD for own records.
- **`pattern_alerts`** — Rule-based pattern detection results (17 types, 4 severity levels). RLS: SELECT/UPDATE only (INSERT/DELETE service role).
- **`triage_audit_log`** — Every triage result + `daily_log_id` FK + `history_context_included`. FK to auth.users with SET NULL.
- **`user_acknowledgments`** — ToS acceptance records. FK with CASCADE.
- **`anonymized_safety_metrics`** — Aggregate triage data from deleted accounts.
- **`dog_health_content`** — 303 RAG chunks with pgvector embeddings.
- **`stress_test_results`** — Automated test run results.
- **`documents`** — Legacy (32 rows, unused). Will be dropped after RAG expansion.
- **RLS policies** on all tables. User-facing tables are user-scoped. `dog_health_content` has authenticated SELECT. System tables have RLS with no policies (service role only).

### Database Triggers

- **`trg_checkin_streak`** — AFTER INSERT/UPDATE on `daily_check_ins`: updates `dogs.checkin_streak` and `dogs.last_checkin_date`. Uses `check_in_date` (not `now()`).
- **`trg_checkin_revision`** — BEFORE UPDATE on `daily_check_ins`: appends old snapshot to `revision_history` JSONB array.

### SQL Functions

- **`anonymize_user_triage_data(user_id)`** — Called before account deletion. Aggregates metrics, redacts PII, nullifies user_id in audit records.
- **`hybrid_search_dog_health(...)`** — RAG retrieval combining vector similarity + keyword search.
- **`update_checkin_streak()`** — Trigger function for streak calculation on check-in insert/update.
- **`append_checkin_revision()`** — Trigger function for revision history on check-in update.

### Backend Completion Status (ALL DONE — last updated Feb 20, 2026)

1. ToS acknowledgment verified working
2. `what_to_tell_vet` output filter fixed (check-symptoms v7)
3. 120-prompt stress test: **Tier 1 = 100% (60/60)**, **Tier 2 = 90% (54/60)**, overall 95% (114/120) (check-symptoms v10, full retest Feb 19)
4. Anonymization hook + anonymized_safety_metrics table created
5. delete-account Edge Function deployed (v1), tested end-to-end (happy path + wrong password + cascade + anonymization)
6. Audit log verified (all urgency values valid, append-only by design), rate limits confirmed (10/hr)
7. Security hardening: search_path fixed on 6 functions, RLS enabled on all public tables, 0 ERROR-level security findings
8. Supabase security linter: 0 ERRORs, 0 WARNs on code (leaked password protection requires Pro Plan)

## Environment Setup

```bash
cp .env.example .env
# Fill in:
#   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

npm install
npx expo start
```

**Known dependency issues:**
- `react-native-worklets` must be installed as a devDependency — required by `react-native-reanimated`'s babel plugin. If tests fail with "Cannot find module 'react-native-worklets/plugin'", run `npm install --save-dev react-native-worklets`.
- `@react-native-async-storage/async-storage` requires `--legacy-peer-deps` flag for installation (react peer dep conflict).
- Jest must be v29 (not v30) — `jest-expo` bundles Jest 29 internally. v30 causes module scope errors.
- `expo-network` may need `--legacy-peer-deps` flag for installation.

## Running Tests

```bash
npm test          # Runs all 205 tests
npx jest --no-cache  # If you encounter stale cache issues
```

**16 test suites:**

*Lib tests (5 suites, 105 tests):*
- `emergencyKeywords.test.ts` — 39 tests (pattern matching, normalization, clusters, v9/v10 compound patterns)
- `foreignBodyFloor.test.ts` — 22 tests (Step 12b regex pattern matching, urgency floor logic)
- `consistencyScore.test.ts` — 9 tests (7-day trailing score, min 5 days, tie-breaking)
- `daySummary.test.ts` — 10 tests (4 tiers, blood in stool, dry heaving, multiple abnormals)
- `patternRules.test.ts` — 25 tests (all 17 rules, density gating, composite priority)

*Store tests (3 suites, 41 tests):*
- `triageStore.test.ts` — 13 tests (symptoms, char limits, nudge tracking)
- `checkInStore.test.ts` — 20 tests (startCheckIn, setAnswer, step navigation, toggleSymptom, free text limit, rehydration guards)
- `healthStore.test.ts` — 8 tests (fetchMonthData, dismissAlert, clearHealth)

*Component tests (8 suites, 59 tests):*
- `UrgencyBadge.test.tsx` — 7 tests (all urgency levels, accessibility)
- `TriageResult.test.tsx` — 10 tests (triage, emergency bypass, sources, vet phone)
- `LegalComponents.test.tsx` — 9 tests (disclaimer, call banner, source citation)
- `EmergencyAlert.test.tsx` — 3 tests (rendering, dismiss callback)
- `CheckInCard.test.tsx` — 8 tests (renders question, options, selected state, yesterday hint, inline alert)
- `CheckInReview.test.tsx` — 5 tests (renders all answers, tap-to-edit callback)
- `PatternAlertCard.test.tsx` — 6 tests (title/message, badge, dismiss, vet_recommended CTA)
- `CalendarGrid.test.tsx` — 8 tests (cell count, status indicators, date press, today highlight)

## Accessibility

The app targets **WCAG AA** compliance:
- All touch targets are minimum 48dp (`MIN_TOUCH_TARGET` constant)
- All interactive elements have `accessibilityRole` and `accessibilityLabel`
- `COLORS.textDisabled` is `#795548` (4.6:1 on Limestone) — passes AA
- Decorative emojis/arrows have `accessibilityElementsHidden`
- Error messages use `accessibilityRole="alert"`

## Legal Components

Components in `src/components/legal/` are **safety-critical**. They enforce the legal boundary between "educational information" and "veterinary medicine." Every triage result screen MUST include:
1. `UrgencyBadge` — Color-coded urgency level
2. `EmergencyCallBanner` — For emergency/urgent results
3. `CallYourVetButton` — Always present with honest fallback
4. `SourceCitation` — Tiered veterinary references
5. `DisclaimerFooter` — "Not a substitute for professional veterinary advice"

Do not remove or weaken these components. They are legally required.

## Milestone Status

- **Milestone 1** (Auth + Legal Foundation): COMPLETE
- **Milestone 2** (Dog Profiles + Onboarding): COMPLETE (animation skipped)
- **Milestone 3** (Core Triage): COMPLETE
- **Milestone 4** (Settings + Account Management): COMPLETE
- **Milestone 5** (Testing + Polish): COMPLETE (accessibility audit done)
- **Backend Completion**: COMPLETE — all tasks done, security hardened, stress test passed, delete-account verified
- **v2.6 Phase 1** (Daily Check-Ins + Pattern Detection): COMPLETE — 205/205 tests pass, 16 suites, all 9 blocks implemented, 7-bug audit fix applied
- **Milestone 6** (Beta Testing): NOT STARTED — needs TestFlight build + real user testers

## Stress Test Results (Feb 19, 2026 — v10 full retest)

Full 120-prompt stress test against v10: **Tier 1 (safety) = 100% (60/60)**, **Tier 2 (quality) = 90% (54/60)**, overall **95% (114/120)**. Zero safety-critical failures. Zero regressions from v10 system prompt addition. CAT6-08 = urgent (foreign body floor working). CAT10-08 = emergency_bypass (prompt injection defused). Cat 10 improved to 100% (was 90%). Remaining Tier 2 failures: Cat 8/11 over-cautious responses, Cat 9/12 RAG gaps. See `DOCUMENTATION.md` Section 12 for full breakdown.

## Known Remaining Work

1. ~~**Tab bar icons**~~ — DONE.
2. ~~**Emergency regex gaps**~~ — DONE.
3. ~~**CAT6-08 foreign body non-determinism**~~ — DONE.
4. ~~**v2.6 Phase 1**~~ — DONE. Daily check-ins, pattern detection, health calendar, 4-tab navigation.
5. **v2.6 Phase 2** (AI + Dashboard) — NOT STARTED. AI-powered pattern insights, enhanced dashboard.
6. **v2.6 Phase 3** (Enhanced Triage v11) — NOT STARTED. Triage integration with check-in history context.
7. **Buddy mascot animation** — Deferred. `react-native-reanimated` and `react-native-svg` are installed but animation not implemented.
8. **50/day rate limit** — Only 10/hour is implemented (check-symptoms). analyze-patterns has 20/hour.
9. **Leaked password protection** — Requires Supabase Pro Plan. Not active on Free plan.
10. **Emergency vet locator** — Post-MVP. Currently opens Google search.
11. **Privacy Policy** — Needs attorney drafting (outlined in legal compliance docs).
12. **LLC formation + E&O insurance** — Business prerequisites before launch.
13. **Tier 2 RAG gaps** — Cat 12 needs dog_health_content expansion (post-beta).

## Full Documentation

See `DOCUMENTATION.md` in the project root for comprehensive documentation including:
- Complete development history across all milestones
- Backend infrastructure details (Edge Functions, database schema, SQL functions)
- API contract with all 3 response types
- Stress test results with failure analysis
- Accessibility audit results
- Legal & compliance requirements

## Common Pitfalls

1. **Smart quotes in string literals** — TypeScript can't parse curly quotes (`'`, `'`). Use straight quotes or escaped apostrophes (`\'`). The `loadingTips.ts` file had this issue and was fixed.
2. **Jest version mismatch** — Must use Jest 29, not 30. `jest-expo` has Jest 29 as peer dep.
3. **Missing react-native-worklets** — If `node_modules` gets cleaned, tests fail. Reinstall with `npm install --save-dev react-native-worklets`.
4. **Urgency value "low" does NOT exist** — The API returns `"monitor"`. If you code against `"low"`, the urgency badge won't render for lowest level.
5. **`resetPasswordForEmail` vs `updateUser`** — `resetPasswordForEmail` is for FORGOT password (sends email). `updateUser({ password })` is for CHANGE password (logged-in user). Don't confuse them.
6. **Character limit is 2000** — Not 1000. The server enforces 2000. `LIMITS.SYMPTOM_MAX_CHARS = 2000`.
