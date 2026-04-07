# PupLog Onboarding — Design & Implementation Guide

## Status: IN PROGRESS

This document describes the new interactive onboarding flow being built for PupLog. It serves as a handoff reference so any developer can understand the design intent, architecture, and current state.

**Plan file**: `~/.claude/plans/glistening-imagining-moore.md` — full implementation plan with step-by-step detail.

---

## The Core Idea

The old onboarding asked users to create an account before seeing any value. The new flow flips this: **value first, account second**.

Users complete goal-setting, dog profile creation (with photo), an educational segment, and a **real 7-question health check-in** — all BEFORE signing up or paying. By the time they reach the paywall, they've invested 3-5 minutes of real data about their dog. The paywall pitch becomes:

> "[Dog Name]'s health plan is ready. Your first check-in is saved. Complete 5 daily check-ins to unlock AI pattern detection."

This leverages sunk cost (they already did the work), the IKEA effect (they "built" their dog's profile), and a concrete unlock milestone (5 days → patterns activate).

---

## Monetization Model

- **Hard paywall** — users must subscribe to use the app
- **Annual plan**: Includes 7-day free trial
- **Monthly plan**: No trial
- **RevenueCat** for subscription management
- **Superwall** for paywall UI presentation (we trigger it, Superwall renders)

---

## Flow (19 screens, single-screen step manager)

### Phase 1: Intent & Discovery (Steps 0-3)

| Step | Screen | Purpose |
|------|--------|---------|
| 0 | **Welcome** | Emotional hook: "Every dog deserves a health advocate." Logo, tagline, "Get Started" CTA. "Already have an account? Sign In" footer link. |
| 1 | **Goal Selection** | "What's your #1 goal?" — 4 tappable cards: Peace of mind, Catch problems early, Track daily health, Be prepared for the vet. Identifies user motivation. |
| 2 | **Attribution** | "How did you hear about PupLog?" — 5 options (social, friend, vet, search, App Store). Analytics data, never shown again. |
| 3 | **Education** | "Did you know?" — Stat-driven screen about how most owners miss subtle health signs. Ties into why daily tracking matters. Bridges to dog profile setup. |

### Phase 2: Dog Profile (Steps 4-6)

| Step | Screen | Purpose |
|------|--------|---------|
| 4 | **Dog Profile** | Name, breed (searchable), age, weight + **photo upload** (expo-image-picker, optional). This is the #1 emotional investment step — once users type their dog's name and add a photo, abandonment drops dramatically. |
| 5 | **Extended Profile** | Spayed/neutered toggle, known conditions (multi-select chips), vet phone (optional). Deepens commitment + useful health context. |
| 6 | **Breed Health Concerns** | "[Dog Name]'s breed profile" — 3-4 personalized health risk cards from `breedHealthData.ts`. Creates "this app knows MY breed" moment. Transition: "Daily check-ins help catch these early." |

### Phase 3: Real Data Investment (Steps 7-16)

| Step | Screen | Purpose |
|------|--------|---------|
| 7-13 | **Check-In** (7 questions) | All 7 metric questions from `CHECK_IN_QUESTIONS`: appetite, water, energy, stool, vomiting, mobility, mood. Reuses `CheckInCard` component directly. Inline alerts for blood in stool and dry heaving (Golden Rule). |
| 14 | **Loading/Processing** | "Building [Dog Name]'s health profile..." — 3-4 second animated hold with rotating messages. Makes the snapshot feel computed, not instant. |
| 15 | **Health Snapshot** | "[Dog Name]'s first health snapshot" — `DaySummaryCard` rendered from THEIR real answers via `generateDaySummary()`. "This is real — based on what you just told us." |
| 16 | **AI Promise** | "Unlock AI-Powered Health Intelligence" — Timeline showing Day 1 ✓ (done!), Day 5 (patterns unlock), Day 14 (AI insights). Key message: **"5 daily check-ins to unlock pattern detection."** Blurred AI insight teaser. |

### Phase 4: Conversion (Steps 17-18)

| Step | Screen | Purpose |
|------|--------|---------|
| 17 | **Paywall** | Superwall-managed hard paywall. Annual (7-day trial) + Monthly (no trial). Must subscribe to proceed. |
| 18 | **Create Account** | Email, password, confirm, DOB (COPPA 13+ gate). Same form as current `sign-up.tsx`. After email verify + sign-in + terms → data syncs to Supabase. |

---

## Architecture

### Navigation: Single-screen step manager
`app/onboarding.tsx` manages all steps internally via `currentStep` state, matching the pattern used by `app/check-in.tsx`. No separate route files for each step.

### State: `onboardingStore.ts` (Zustand + AsyncStorage persist)
Stores all data locally until account creation:
- `goal`, `attribution` — intent data
- `dogProfile` — name, breed, age, weight, photo URI, spayed/neutered, conditions, vet phone
- `checkInAnswers` — 7 metric field → value pairs
- `currentStep`, `startedAt`, `hasCompletedPaywall`

After account creation + terms acceptance, `syncOnboardingData()` writes everything to Supabase.

### Routing: 4-state guard in `app/_layout.tsx`
```
1. No session + !hasSeenOnboarding → /onboarding
2. No session + hasSeenOnboarding  → /(auth)/sign-in
3. Session + no terms              → /terms
4. Session + terms                 → /(tabs)
```

`hasSeenOnboarding` is a standalone AsyncStorage key (`puplog-onboarding-complete`), separate from Zustand (survives store resets on sign-out).

### Data sync: `syncOnboardingData()`
Called from `terms.tsx` after terms acceptance:
1. Upload dog photo to Supabase Storage → get public URL
2. `dogStore.addDog()` with full profile (including new columns)
3. Insert `daily_check_ins` record (7 answers + defaults for missing fields)
4. Fire `analyze-patterns` + `ai-health-analysis` Edge Functions
5. Set `hasSeenOnboarding = true`, clear onboarding store

---

## DB Migration Required

```sql
ALTER TABLE dogs
  ADD COLUMN spayed_neutered boolean DEFAULT NULL,
  ADD COLUMN known_conditions text[] DEFAULT '{}',
  ADD COLUMN photo_url text DEFAULT NULL;
```

---

## Feature Unlock Thresholds

These are the actual numbers from the codebase that the onboarding messaging references:

| Feature | Unlocks At | Source File |
|---------|-----------|-------------|
| Single-day alerts (blood, aggression) | Day 1 | `src/lib/patternRules.ts` |
| Trend pattern detection | **Day 5** (+ 70% density) | `src/constants/config.ts` → `MIN_HISTORY_DAYS: 5` |
| Consistency score | **Day 5** | `src/lib/consistencyScore.ts` |
| AI insights (fire-and-forget) | Day 1 (quality improves) | `src/stores/checkInStore.ts` |
| Weekly AI summary rewrite | Day 7+ | `weekly-summary-update` Edge Function |
| GettingStartedCard dismissal | Streak ≥ 5 | `src/components/ui/GettingStartedCard.tsx` |

**Onboarding message**: "Complete 5 daily check-ins to unlock AI pattern detection" — this is the accurate, compelling number.

---

## Component Reuse

| Existing Component | Reused In |
|---|---|
| `CheckInCard` | Goal selection (step 1) + check-in questions (steps 7-13) |
| `ProgressDots` | Check-in steps (7 of 7) |
| `DaySummaryCard` | Health snapshot (step 15) |
| `AIInsightCard` | Blurred teaser in AI Promise (step 16) |
| `Button` | All steps |

New components: `OnboardingProgress` (horizontal bar), `BreedHealthCard`, `PatternPromiseCard`.

---

## Key Design Principles

1. **Every screen after step 4 uses [Dog Name]** — personalization is non-negotiable
2. **The check-in is REAL data, not a demo** — this is the key differentiator vs. passive onboarding slides
3. **The loading screen (step 14) makes the snapshot feel computed** — even though `generateDaySummary()` is instant, a 3-4 second hold with "Analyzing..." messages creates perceived value
4. **The "5 days" unlock is concrete and achievable** — gives users a clear reason to return daily
5. **Golden Rule compliance** — blood in stool and dry heaving trigger inline emergency alerts even during onboarding
6. **Hard paywall after emotional investment** — by step 17, users have spent 3-5 minutes building [Dog Name]'s profile. Abandoning feels like losing all that work.

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/onboarding.tsx` | Main screen (19 steps) |
| `src/stores/onboardingStore.ts` | Zustand + persist |
| `src/components/ui/OnboardingProgress.tsx` | Horizontal progress bar |
| `src/components/ui/BreedHealthCard.tsx` | Breed health risk cards |
| `src/components/ui/PatternPromiseCard.tsx` | Day 1/5/14 timeline |
| `src/constants/breedHealthData.ts` | Breed → health concerns map |

## Files to Modify

| File | Change |
|------|--------|
| `app/_layout.tsx` | 4-state routing guard |
| `app/terms.tsx` | Trigger `syncOnboardingData()` |
| `src/stores/dogStore.ts` | Accept new dog columns |

---

## What's NOT Built Yet (as of this document)

- [ ] RevenueCat SDK integration
- [ ] Superwall SDK integration
- [ ] Supabase Storage bucket for dog photos
- [ ] The onboarding screens themselves
- [ ] The onboardingStore
- [ ] The routing guard changes
- [ ] The DB migration
- [ ] The breed health data constants
- [ ] New UI components (OnboardingProgress, BreedHealthCard, PatternPromiseCard)
- [ ] Tests for new code
