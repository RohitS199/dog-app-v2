# PupLog

**Proactive dog health tracking with AI-powered pattern analysis.** Daily structured check-ins, rule-based pattern detection, AI health insights, educational triage, and a veterinary article library — all in one app.

> **Important:** PupLog provides educational health guidance only. It is **not** a substitute for professional veterinary advice, diagnosis, or treatment. Always consult your veterinarian.

## The Golden Rule

> Never let a dog owner walk away from a genuine emergency thinking they can wait.

Every feature in PupLog exists in service of this principle.

## Features

### Daily Health Check-Ins (v2.6)
- **9-question structured logging** — appetite, water intake, energy, stool quality, vomiting, mobility, mood, additional symptoms, free text
- **Rule-based pattern detection** — 17 pattern rules detect trends like appetite decline, energy changes, digestive issues, and mobility problems
- **AI health insights** — Daily Sonnet 4.5 analysis produces 1-3 observations with severity badges, article recommendations, and alert enrichments
- **Health calendar** — Monthly grid with color-coded day indicators (green/amber/red), consistency scoring, and day-detail bottom sheet
- **Rolling health summary** — Weekly Haiku 4.5 compression of raw data into a persistent health profile per dog
- **Streak tracking** — Consecutive check-in streaks with visual badges

### Symptom Triage
- **Free-text symptom input** — Describe symptoms in plain language, get an AI-generated urgency classification
- **Real-time emergency detection** — Client-side keyword engine (35 single + 44 compound + 3 cluster patterns) flags emergencies *before* submission
- **4 urgency levels** — Emergency (red), Urgent (orange), Soon (amber), Low Urgency (teal)
- **Veterinary source citations** — Every result includes tiered references from veterinary institutions
- **What to tell your vet** — Actionable bullet points for vet visit preparation

### Learn Tab
- **22 educational articles** across 6 sections (Know Your Dog, When to Worry, Safety & First Aid, Nutrition & Diet, Behavior & Wellness, Puppy & New Dog)
- **Markdown rendering** with PupLog theme
- **5-minute client cache** with pull-to-refresh
- **Deep links from AI insights** — article recommendations link directly to relevant content

### Additional Features
- **Multi-dog profiles** — Store multiple dogs with breed, age, weight, and vet phone
- **Offline awareness** — Detects network status and gracefully handles offline scenarios
- **WCAG AA accessibility** — 48dp touch targets, screen reader support, proper contrast ratios
- **Account management** — Change password, delete account with full data anonymization
- **COPPA compliance** — 13+ age gate on sign-up

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81 (Expo SDK 54, TypeScript strict) |
| Navigation | Expo Router v6 (file-based routing) |
| State | Zustand v5 (9 stores: auth, dog, triage, checkIn, health, learn, onboarding, subscription, articleTransition) |
| Backend | Supabase (Auth, Postgres, Edge Functions, pgvector RAG) |
| AI | Claude Sonnet 4.5 (daily analysis), Claude Haiku 4.5 (weekly compression) |
| Auth Storage | expo-secure-store (device secure enclave) |
| Payments | expo-superwall (paywall) + react-native-purchases (RevenueCat) |
| Animations | react-native-reanimated v4 + react-native-svg |
| Testing | Jest 29 + React Native Testing Library (279 tests, 22 suites) |

## Quick Start

### Prerequisites

- Node.js 18+
- npm
- Expo CLI (`npx expo`)
- Expo Go app on iOS or Android

### Setup

```bash
# Clone the repository
git clone https://github.com/RohitS199/dog-app-v2.git
cd dog_app_ui

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys:
#   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
#   EXPO_PUBLIC_REVENUECAT_IOS_KEY=your-revenuecat-ios-key
#   EXPO_PUBLIC_SUPERWALL_IOS_KEY=your-superwall-ios-key

# Start the development server
npx expo start
```

### Running Tests

```bash
npm test              # Run all 279 tests
npx jest --no-cache   # Clear cache and run
```

### Known Dependency Issues

- `@react-native-async-storage/async-storage` may require `--legacy-peer-deps` (React peer dep conflict). An `.npmrc` with `legacy-peer-deps=true` is included.
- `react-native-worklets` must be installed as a devDependency — required by reanimated's babel plugin.
- Jest must be v29 (not v30) — `jest-expo` bundles Jest 29 internally.

### Seed Data for Testing

A SQL seed script at `scripts/seed-data.sql` creates realistic test data (2 dogs, 51 check-ins, pattern alerts, AI insights, health summaries). See [CLAUDE.md](CLAUDE.md#seed-data-for-testing) for usage instructions.

## Project Structure

```
dog_app_ui/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (auth)/                   # Sign in, sign up, forgot password
│   ├── (tabs)/                   # Home, Health, Learn, Triage, Settings
│   ├── check-in.tsx              # 9-step daily check-in flow
│   ├── onboarding.tsx            # 19-step onboarding flow
│   ├── article/[slug].tsx        # Article detail with Markdown
│   ├── emergency.tsx             # Emergency vet resources
│   └── ...                       # Terms, add-dog, edit-dog, etc.
├── src/
│   ├── components/
│   │   ├── legal/                # Safety-critical components (5)
│   │   └── ui/                   # General UI components (36+)
│   ├── constants/                # Theme, config, breed data, check-in questions
│   ├── hooks/                    # useAppState, useNetworkStatus
│   ├── lib/                      # Supabase client, emergency keywords, pattern rules
│   ├── providers/                # SuperwallProvider (paywall)
│   ├── stores/                   # Zustand stores (9)
│   └── types/                    # TypeScript type definitions
├── scripts/
│   └── seed-data.sql             # Test data seed script
├── n8n/                          # Weekly summary orchestration (n8n option)
├── .github/workflows/            # Weekly summary orchestration (GitHub Actions option)
├── CLAUDE.md                     # AI assistant instructions
└── DOCUMENTATION.md              # Comprehensive project documentation
```

## How It Works

### Daily Check-In Flow

```
Daily Check-In (9 questions)
         │
         ▼
  UPSERT to Supabase ──► analyze-patterns Edge Function
         │                        │
         │                 17 rule-based pattern
         │                 detection rules
         │
         ▼
  ai-health-analysis Edge Function (fire-and-forget)
         │
         ▼
  Claude Sonnet 4.5 reads:
  • Dog profile + rolling summary
  • 14 days raw check-in data
  • Active pattern alerts
  • 22 article catalog
         │
         ▼
  Produces:
  • 1-3 observations (severity-rated)
  • 0-2 article recommendations
  • Alert enrichments
  • Summary annotation (critical events only)
```

### Triage Pipeline

```
User Input ──► Client-Side Emergency Detection (500ms debounce)
                         │
                    [if keywords found]
                         │
                    Emergency Alert Banner
                         │
               User submits ──► check-symptoms Edge Function
                                         │
                                16-Step Pipeline (v10):
                                JWT → Rate Limit → Emergency Bypass →
                                Off-Topic → Dog Profile → RAG →
                                LLM → Safety Filter → Foreign Body Floor →
                                Audit Log
                                         │
                                ┌────────┼────────┐
                                │        │        │
                             Triage  Emergency  Off-Topic
                             Result   Bypass    Response
```

## Urgency Levels

| Level | Color | Meaning |
|-------|-------|---------|
| Emergency | Red (#C62828) | Seek veterinary care immediately |
| Urgent | Orange (#E65100) | See a vet within 24 hours |
| Soon | Amber (#F57C00) | Schedule a vet visit this week |
| Low Urgency | Teal (#00897B) | Monitor at home, see vet if worsening |

> The lowest urgency uses **teal**, not green — a deliberate choice to avoid the "green = all clear" false safety signal.

## Backend

The backend runs on Supabase with five Edge Functions:

| Function | Version | Purpose |
|----------|---------|---------|
| `check-symptoms` | v10 | 16-step triage pipeline with RAG, LLM, and safety filters |
| `analyze-patterns` | v1 | 8-step rule-based pattern detection (17 rules, 20/hr rate limit) |
| `ai-health-analysis` | v1 | Daily Sonnet 4.5 analysis (fire-and-forget, 20/hr rate limit) |
| `weekly-summary-update` | v1 | Weekly Haiku 4.5 health summary compression |
| `delete-account` | v1 | Password re-auth, data anonymization, account deletion |

### Stress Test Results (v10)

- **Tier 1 (Safety):** 100% (60/60) — zero safety-critical failures
- **Tier 2 (Quality):** 90% (54/60)
- **Overall:** 95% (114/120)

### AI Health Analysis Test Results

- **9 scenarios, 55/55 runs passed (100%)**
- **15/15 safety-critical tests passed** (Cushing's guardrail, ibuprofen detection, baseline shift)

## Security

- Row Level Security (RLS) on all 11 database tables
- JWT tokens stored in device secure enclave via expo-secure-store
- Edge Functions validate JWTs internally
- Audit log is append-only (no UPDATE/DELETE policies)
- Account deletion anonymizes triage data before removing user
- COPPA 13+ age gate on sign-up
- All SQL functions have immutable search_path
- 0 ERROR-level security findings in Supabase linter

## Test Coverage

279 tests across 22 suites:

| Category | Suites | Tests | Coverage |
|----------|--------|-------|----------|
| Lib | 6 | 105+ | Emergency keywords, foreign body floor, consistency score, day summary, pattern rules, breed health data |
| Stores | 5 | 54+ | Triage, check-in, health, learn, onboarding stores |
| Components | 11 | 69+ | Urgency badge, triage result, legal, emergency alert, check-in cards, calendar, AI insights, flippable dog card, alert card stack |

## Design System

**"Earthy Dog Park" palette:**
- Limestone (#FAFAFA) — main background
- Topsoil (#D7CCC8) — cards, containers
- Dark Loam (#3E2723) — primary text, buttons
- Orange Collar (#FF6F00) — accent, active states

**Typography:** DM Serif Display for headings, system font for body text.

## Milestone Status

- [x] Auth + Legal Foundation
- [x] Dog Profiles + Onboarding
- [x] Core Triage (16-step pipeline)
- [x] Settings + Account Management
- [x] Testing + Polish (228 tests, accessibility audit)
- [x] Backend Completion (security hardened, stress test passed)
- [x] v2.6 Phase 1 — Daily Check-Ins + Rule-Based Pattern Detection
- [x] v2.6 Phase 2 — AI Pattern Analysis (daily Sonnet + weekly Haiku + frontend dashboard)
- [ ] UI Redesign — Playful overhaul (onboarding, social auth, subscriptions, breed data) — in progress
- [ ] Milestone 6 — Beta Testing (TestFlight build + real user testers)

## License

All rights reserved. This is a private project.

## Contact

Rohit Sandur — [GitHub](https://github.com/RohitS199)
