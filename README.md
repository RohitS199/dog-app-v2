# PupLog

**Proactive dog health tracking with AI-powered pattern analysis.** Daily structured check-ins, rule-based pattern detection, AI health insights, and a veterinary article library — all in one app.

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
| State | Zustand v5 (9 stores: auth, dog, checkIn, health, learn, onboarding, subscription, articleTransition) |
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
cd dog-app-v2

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
│   ├── (tabs)/                   # Home, Health, Learn, Settings
│   ├── check-in.tsx              # 9-step daily check-in flow
│   ├── onboarding.tsx            # 19-step onboarding flow
│   ├── article/[slug].tsx        # Article detail with Markdown
│   ├── emergency.tsx             # Emergency vet resources
│   ├── choose-plan.tsx            # Subscription plan selection
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

## Backend

The backend runs on Supabase with Edge Functions:

| Function | Version | Purpose |
|----------|---------|---------|
| `analyze-patterns` | v1 | 8-step rule-based pattern detection (17 rules, 20/hr rate limit) |
| `ai-health-analysis` | v1 | Daily Sonnet 4.5 analysis (fire-and-forget, 20/hr rate limit) |
| `weekly-summary-update` | v1 | Weekly Haiku 4.5 health summary compression |
| `delete-account` | v1 | Password re-auth, data anonymization, account deletion |

### AI Health Analysis Test Results

- **9 scenarios, 55/55 runs passed (100%)**
- **15/15 safety-critical tests passed** (Cushing's guardrail, ibuprofen detection, baseline shift)

## Security

- Row Level Security (RLS) on all 11 database tables
- JWT tokens stored in device secure enclave via expo-secure-store
- Edge Functions validate JWTs internally
- Audit log is append-only (no UPDATE/DELETE policies)
- Account deletion anonymizes data before removing user
- COPPA 13+ age gate on sign-up
- All SQL functions have immutable search_path
- 0 ERROR-level security findings in Supabase linter

## Test Coverage

279 tests across 22 suites:

| Category | Suites | Tests | Coverage |
|----------|--------|-------|----------|
| Lib | 6 | 105+ | Emergency keywords, consistency score, day summary, pattern rules, breed health data |
| Stores | 5 | 54+ | Check-in, health, learn, onboarding stores |
| Components | 11 | 69+ | Check-in cards, calendar, AI insights, pattern alerts, legal components, flippable dog card, alert card stack |

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
- [x] Settings + Account Management
- [x] Testing + Polish (279 tests, accessibility audit)
- [x] Backend Completion (security hardened)
- [x] v2.6 Phase 1 — Daily Check-Ins + Rule-Based Pattern Detection
- [x] v2.6 Phase 2 — AI Pattern Analysis (daily Sonnet + weekly Haiku + frontend dashboard)
- [ ] UI Redesign — Playful overhaul (onboarding, social auth, subscriptions, breed data) — in progress
- [ ] Milestone 6 — Beta Testing (TestFlight build + real user testers)

## License

All rights reserved. This is a private project.

## Contact

Rohit Sandur — [GitHub](https://github.com/RohitS199)
