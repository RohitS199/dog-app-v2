# app/ — Expo Router Screens

This directory contains all screens for the app, organized using Expo Router's file-based routing convention. Each `.tsx` file maps to a route.

## Routing Architecture

### Route Groups

- **`(auth)/`** — Unauthenticated screens. Wrapped in a `Stack` navigator with no headers. Users see these when they have no active session.
- **`(tabs)/`** — Main app screens. Wrapped in a bottom `Tabs` navigator (Home, Health, Learn, Triage, Settings). Users must have a session AND accepted terms to access.
- **Top-level screens** (`terms.tsx`, `add-dog.tsx`, `check-in.tsx`, etc.) — Modal-style screens pushed on top of the navigation stack.

### Auth Guard (app/_layout.tsx)

`_layout.tsx` is the root layout and the MOST IMPORTANT routing file. It implements a 3-state redirect system:

```
No session → /(auth)/sign-in
Session, no terms → /terms
Session + terms → /(tabs)
```

This works by watching `useSegments()` and checking auth state from `useAuthStore`. The `useAppState()` hook is also mounted here to handle app foreground/background transitions (session validation, auto-refresh toggling).

**How it renders:** Uses `<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }} />` to render child routes. The opaque `contentStyle` background ensures pushed screens fully cover the absolutely-positioned FloatingTabBar in the tabs layout (prevents FAB/tab bar visual leak). This provides native iOS swipe-back gestures on pushed screens (check-in, add-dog, etc.). Auth redirects use `router.replace()` which doesn't animate, so no unwanted transitions on redirect.

## File Descriptions

### _layout.tsx (Root Layout)
- Calls `useAuthStore().initialize()` on mount to restore the session from secure storage
- Watches `session`, `isLoading`, `hasAcceptedTerms`, and `segments` to decide routing
- Shows a centered `ActivityIndicator` while loading
- Mounts `useAppState()` which manages session refresh on foreground/background
- Uses `<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.background } }} />` — enables native swipe-back gestures on iOS, opaque background prevents FloatingTabBar leak on pushed screens

### (auth)/_layout.tsx
- Simple `Stack` with `headerShown: false` and themed background color
- All auth screens inherit this hidden-header style

### (auth)/sign-in.tsx
- Email + password form
- Calls `useAuthStore().signIn()` which does `signInWithPassword()` then `checkTermsAcceptance()`
- Links to forgot-password and sign-up
- The "Create an Account" button is a `Link` with `asChild` pattern

### (auth)/sign-up.tsx
- **COPPA Compliance**: Includes a date-of-birth gate (MM/DD/YYYY inputs). The `calculateAge()` function validates the user is >= 13 years old (`LIMITS.COPPA_MIN_AGE`). If under 13, the form shows an error and blocks sign-up.
- Calls `useAuthStore().signUp()` then shows "Check Your Email" confirmation
- Password requires minimum 8 characters with confirm field

### (auth)/forgot-password.tsx
- Single email input, calls `useAuthStore().resetPassword()` which calls `supabase.auth.resetPasswordForEmail()`
- Deliberately vague success message: "If an account exists with that email..." (prevents email enumeration)

### terms.tsx
- Full Terms of Service text (10 sections) in a scrollable view
- **Scroll-to-bottom detection**: The `handleScroll` callback checks if `layoutMeasurement.height + contentOffset.y >= contentSize.height - 50`. The checkbox is disabled until the user scrolls to the bottom.
- Checkbox + "I Agree" button. On accept, inserts a record into `user_acknowledgments` table with `terms_version` from `LEGAL.TERMS_VERSION`
- After acceptance, calls `checkTermsAcceptance()` which updates the auth store, triggering the root layout to redirect to `/(tabs)`

### (tabs)/_layout.tsx
- Bottom tab navigator with 4 visible tabs: Journey (`index`), My Dogs (`dogs`), Discovery (`learn`), Profile (`settings`). `health` and `triage` tabs are registered but hidden from the bar (`href: null`) — Health is reachable via My Dogs → Ask Biscuit card.
- Uses custom `FloatingTabBar` component as `tabBar` prop — absolutely positioned pill-shaped bar with centered FAB (+ button)
- `ArticleExpandOverlay` rendered as sibling to `<Tabs>` for Pinterest-style shared element transitions
- Tab icons use `MaterialCommunityIcons` from `@expo/vector-icons`: `home` (Journey), `paw` (My Dogs), `book-open-variant` (Discovery), `cog-outline` (Profile)
- Uses theme colors for active/inactive tint

### (tabs)/index.tsx (Home Screen)
- `FlatList` of dog cards with pull-to-refresh
- Each card shows: name, breed, age, weight, last triage date (formatted as "today", "yesterday", "X days ago"), streak badge
- "Check In Now" CTA button per dog card → navigates to `/check-in`
- Edit button per card → navigates to edit-dog with dog ID
- Floating action button (FAB) for adding dogs
- `GettingStartedCard` as list header — progressive cold start onboarding (auto-dismisses at 5+ day streak)
- First-load tooltip: "Describe your dog's symptoms and I'll help you understand how urgently you should see a vet."
- Empty state with "Add Your Dog" CTA
- `fetchDogs()` and `fetchLastTriageDates()` called on mount

### (tabs)/health.tsx (Health Calendar + AI Insights Dashboard)
- Dog selector row at top (same pattern as triage screen)
- Streak counter: "{N}-day check-in streak!"
- Month navigation with `< February 2026 >` arrows
- `CalendarGrid` component — 7-column grid, 6 status states with shape+color per WCAG AA
- Loading indicator + error display during data fetch
- Consistency score card (when >= 5 days history)
- `HealthSummaryCard` — rolling AI health profile with collapsible baseline and "Last updated X days ago" (conditional on `selectedDog.health_summary` existing)
- AI Insights section — up to 5 `AIInsightCard` components showing AI observations with severity badges, positive/negative indicators, and tappable article recommendation links (routes to `/article/[slug]`)
- Active alerts section (list of `PatternAlertCard` with dismiss) — now enhanced with `ai_insight` text display
- `DayDetailSheet` bottom sheet on date tap — full check-in data + previous day comparison
- Uses `useHealthStore` — fetches 7 days before month start for trailing window consistency scoring
- AI insights use a **separate `useEffect`** with `[selectedDogId]` only (not month-dependent) to avoid unnecessary re-fetches on month navigation
- **Tab focus listener** re-fetches AI insights and active alerts on navigation focus (covers fire-and-forget timing gap after check-in submission)
- Clears stale calendar data when switching dogs

### (tabs)/learn.tsx (Learn Tab)
- Educational article library organized by sections
- Uses `useLearnStore` for data fetching with 5-minute cache TTL
- `RefreshControl` for pull-to-refresh (force bypasses cache)
- Sections displayed with icon, title, description, and horizontal `FlatList` of article cards
- Article cards navigate to `/article/[slug]` on press
- 3 states: loading (first fetch), error (with retry), empty ("Articles are on the way!")
- Stale-while-revalidate: shows cached sections during background refresh
- Educational disclaimer at bottom
- `clearLearn()` called on sign-out and account deletion

### (tabs)/triage.tsx (Core Triage Flow)
**This is the most complex screen.** It has 3 distinct states: input, loading, and result.

**Input state:**
- Dog selector row (tappable if > 1 dog to open `DogSelector` bottom sheet)
- `TextInput` with 2000 char limit and color-coded character counter (normal → warning at <200 → danger at <50)
- 500ms debounced emergency keyword detection via `detectEmergencyKeywords()` — if triggered, shows `EmergencyAlert` banner
- Emergency alert can be dismissed to continue with submission
- Submit button disabled if: no symptoms, no dog selected, or offline
- `OfflineBanner` shown when `useNetworkStatus()` returns false
- `TriageNudge` shown if 3+ triage checks in 7 days (from `triageStore.getRecentTriageCount()`)
- `DisclaimerFooter` at bottom

**Loading state:**
- Renders `LoadingScreen` component (3s minimum display, rotating tips, "still working" at 15s)

**Result state:**
- Header bar with "← New Check" button + "Emergency" button (if urgency is emergency)
- If `type === 'off_topic'`: renders `OffTopicResult` (friendly message + Try Again button)
- Otherwise: renders `TriageResult` (full urgency badge, headline, educational info, vet phone, sources, disclaimer)

### dog-weeks.tsx (All-Weeks Scrapbook)
Full-screen page showing every week in a scrollable grid of `WeekSceneCard` components.
- Phase 1 reads the currently-loaded `healthStore` month window (no multi-month fetch yet)
- Each card shows week tone (worst day-summary tier), date range, and scene illustration
- Reached via "See more" from `WeekLookBack` on the My Dogs tab

### add-dog.tsx
- Form: name*, breed*, age* (0-30 decimal), weight* (lbs), vet_phone (optional)
- Validation: name and breed required, age within LIMITS.DOG_AGE_MIN-MAX, weight > 0 and <= 300
- Calls `useDogStore().addDog()`, navigates back on success
- Cancel button in header

### edit-dog.tsx
- Pre-populates form from `dogs.find(d => d.id === id)` via `useLocalSearchParams`
- Same validation as add-dog
- Includes "Delete [name]" button at bottom → `Alert.alert` confirmation → `deleteDog()`
- If dog not found (e.g., navigated via stale link), shows error with "Go Back" link

### article/[slug].tsx (Article Detail)
- Dynamic route using `useLocalSearchParams<{ slug: string }>()`
- Fetches article via `useLearnStore().getArticleBySlug(slug)`
- Layout: back button → section label (colored) → title → summary → metadata row (read time + date) → accent divider → Markdown body → DisclaimerFooter
- Markdown rendered via `react-native-markdown-display` with PupLog theme overrides
- Links in Markdown open via `Linking.openURL()`
- States: loading, not found (with back button), normal article view
- No hero image rendering (imageUrl is null for launch articles)

### emergency.tsx
- Standalone emergency resources screen, reachable from triage result or directly
- 4 sections:
  1. **Call Your Vet** — Direct phone dial button (or "no vet on file" fallback)
  2. **Find Emergency Vet** — Opens Google search for "emergency vet near me"
  3. **ASPCA Poison Control** — Direct dial to 888-426-4435, notes $75 fee
  4. **While waiting for help** — 5 practical tips (stay calm, keep warm, don't give food/water, note time, bring packaging)
- Offline card when disconnected (reassures phone dialer works without internet)

### change-password.tsx
- New password + confirm fields, minimum 8 chars
- Calls `useAuthStore().changePassword()` which uses `supabase.auth.updateUser({ password })` — this is the correct method for logged-in users (NOT `resetPasswordForEmail`)
- Shows success alert and navigates back

### check-in.tsx (Daily Check-In Flow)
- Full-screen modal launched via `router.push('/check-in')`, supports iOS swipe-back gesture
- 3 flow states: `questions` → `review` → `summary`
- `ScrollView` with `keyboardDismissMode="on-drag"` — swipe down to dismiss keyboard on free text step
- Steps 0-6: `CheckInCard` — single-select questions (appetite, water, energy, stool, vomiting, mobility, mood)
- Step 7: `AdditionalSymptomsCard` — multi-select chips (11 options, "None" deselects all)
- Step 8: `FreeTextCard` — TextInput (500 chars) + emergency keyword detection
- After step 8: `CheckInReview` — summary of all 9 answers, tap any to edit
- After submit: `DaySummaryCard` — 4-tier feedback + streak + pattern alerts
- Dog selector in header (if > 1 dog) — dog switch resets `flowState` to `questions`
- `ProgressDots` shows step X of 9
- Inline alerts for blood in stool (step 3) and dry heaving (step 4)
- `handleSubmit` checks for errors before transitioning to summary (prevents dead state on failure)
- Error display at bottom of screen

### (tabs)/dogs.tsx (My Dogs Hub — "Living Scrapbook" Phase 1)
Per-dog hub screen built on scrapbook tokens (see `src/constants/onboardingTheme.ts`). Design rationale in `docs/superpowers/specs/2026-06-11-my-dogs-visual-addendum.md`.
- `DogSwitcher` — avatar pills + Add button at the top
- `DogIdentityHero` — portrait, identity chips, `describeDog` personality line, today chip with check-in CTA
- Current-month read-only calendar via `CalendarGrid` (shared with Health tab via `computeDayStatuses`); day tap opens `DayDetailSheet`
- `WeekLookBack` — horizontal polaroid strip of the last 3 weeks + "See more" → `/dog-weeks`
- `DogStickerShelf` — honest Phase-1 empty shelf (per-dog sticker data layer not yet implemented)
- `AskBiscuitCard` — single bridge to health analysis; routes to `/health` until a real Discovery screen ships
- `DogCareDetails` — weight, conditions, vet phone + Edit → `/edit-dog`
- NO health analysis on this tab (that's Discovery's job)

### (tabs)/learn.tsx (Discovery Tab)
- **3-step confirmation**: password re-entry + type "DELETE" + final `Alert.alert`
- Verifies password by calling `supabase.auth.signInWithPassword()` before deletion
- Calls `delete-account` Edge Function (v1, deployed Feb 18, 2026)
  - Edge Function flow: JWT verify → password re-auth → anonymize triage data → admin.deleteUser()
  - Anonymization: aggregates metrics to `anonymized_safety_metrics`, redacts symptoms, nullifies user_id in audit log
  - Cascade: dogs are deleted (CASCADE FK), audit records persist with null user_id (SET NULL FK)
- Clears all local state: `clearDogs()`, `clearAll()`, `clearCheckIn()`, `clearHealth()`, `clearLearn()`, `signOut()`
- Warning card lists everything that gets deleted: account, dogs, triage history, check-in history, terms record
