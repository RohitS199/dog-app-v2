# src/stores/ — Zustand State Management

Six Zustand stores manage all app state. Auth, dog, triage, and learn stores use the `create<Interface>((set, get) => ...)` pattern. The checkInStore additionally uses Zustand's `persist` middleware with AsyncStorage.

## authStore.ts — Authentication State

**State:**
- `session: Session | null` — Supabase auth session (contains JWT)
- `user: User | null` — Supabase user object (has `id`, `email`, etc.)
- `isLoading: boolean` — True during initial session restoration
- `hasAcceptedTerms: boolean` — Whether user has accepted current terms version

**Methods:**

### `initialize()`
Called once on app start (in `app/_layout.tsx`). Does:
1. Gets existing session from secure storage via `supabase.auth.getSession()`
2. Sets session/user in state, sets `isLoading: false`
3. If session exists, checks terms acceptance
4. Sets up `onAuthStateChange` listener for future session changes (e.g., token refresh, sign out from another device)

### `signIn(email, password)`
Calls `supabase.auth.signInWithPassword()`. On success, sets session/user and checks terms acceptance. The root layout then redirects based on `hasAcceptedTerms`.

### `signUp(email, password)`
Calls `supabase.auth.signUp()`. Does NOT sign the user in — Supabase sends a confirmation email. The sign-up screen shows a "Check Your Email" alert.

### `signOut()`
Calls `supabase.auth.signOut()`. Resets session, user, and hasAcceptedTerms to initial values. Callers (settings screen, delete-account) should also call `clearDogs()`, `clearAll()`, `clearCheckIn()`, `clearHealth()`, and `clearLearn()` to wipe local state.

### `resetPassword(email)`
Calls `supabase.auth.resetPasswordForEmail()`. For FORGOT password flow only (unauthenticated).

### `changePassword(newPassword)`
Calls `supabase.auth.updateUser({ password })`. For CHANGE password flow only (authenticated). These two methods are NOT interchangeable.

### `checkTermsAcceptance()`
Queries `user_acknowledgments` table for a row matching the user's ID and current `LEGAL.TERMS_VERSION`. Sets `hasAcceptedTerms` accordingly. Returns boolean.

### `setSession(session)`
Direct setter, used by `useAppState` hook when session is validated on foreground.

---

## dogStore.ts — Dog Profiles

**State:**
- `dogs: Dog[]` — All user's dogs, ordered by `created_at` ascending
- `selectedDogId: string | null` — Currently selected dog for triage
- `isLoading: boolean` — True during fetch/mutation
- `error: string | null`
- `lastTriageDates: Record<string, string>` — Map of dog_id → ISO date string of most recent triage

**Methods:**

### `fetchDogs()`
Queries `dogs` table ordered by `created_at`. Auto-selects first dog if none selected.

### `fetchLastTriageDates()`
Queries `triage_audit_log` for all user's dogs, ordered by `created_at` descending. Iterates results and keeps only the most recent entry per dog. Used to display "Last checked today/yesterday/X days ago" on home screen cards.

### `addDog(dog)`
Inserts into `dogs` table with `user_id: user.id` (fetched via `supabase.auth.getUser()`) and appends to local state. Auto-selects if no dog was previously selected. Returns the new Dog object. **Note**: The `user_id` must be included explicitly in the insert because the RLS INSERT policy requires `auth.uid() = user_id` and the column has no default. The Omit type excludes server-managed fields: `id`, `user_id`, `created_at`, `updated_at`, `last_checkin_date`, `checkin_streak`, `health_summary`.

### `updateDog(id, updates)`
Updates `dogs` table and patches local state via `.map()`.

### `deleteDog(id)`
Deletes from `dogs` table and filters from local state. If the deleted dog was selected, auto-selects the first remaining dog (or null if none left).

### `selectDog(id)` / `clearDogs()`
Simple setters. `clearDogs` also resets `lastTriageDates`.

---

## triageStore.ts — Triage Flow State

**State:**
- `symptoms: string` — Current symptom text input
- `isLoading: boolean` — True during API call
- `result: CheckSymptomsResponse | null` — Current result (any of the 3 response types)
- `cachedResult: CheckSymptomsResponse | null` — Last successful non-off-topic result (for offline reference)
- `error: string | null`
- `hasRetried: boolean` — Guard for one-time auto-retry
- `recentTriageTimestamps: number[]` — Timestamps of triage submissions in rolling 7-day window
- `nudgeDismissed: boolean` — Whether user dismissed the triage nudge this session

**Methods:**

### `setSymptoms(text)`
Enforces `LIMITS.SYMPTOM_MAX_CHARS` (2000). Silently drops text beyond the limit.

### `submitSymptoms(dogId)` — The core method
1. Sets `isLoading: true`, clears previous result/error
2. Records `loadingStart = Date.now()`
3. Calls `supabase.functions.invoke('check-symptoms', { body: { dog_id, symptoms } })`
4. **Rate limit handling**: If error contains "429" or "rate", shows friendly "reached maximum checks" message
5. **Minimum loading time**: If API responded faster than `LOADING_MIN_DISPLAY_MS` (3000ms), sleeps for the remainder. This prevents jarring loading screen flashes.
6. **On success**: Sets result, updates `cachedResult` (only for non-off-topic), appends timestamp to `recentTriageTimestamps` (filtering out entries older than 7 days), resets `hasRetried` and `nudgeDismissed`
7. **On failure + first attempt** (`hasRetried === false`): Sets `hasRetried: true` and silently retries once. If retry succeeds, uses that result. If retry also fails, falls through to error state.
8. **On failure + already retried**: Sets error message

### `clearResult()`
Resets result, error, and symptoms (for "New Check" flow).

### `clearAll()`
Nuclear reset of all state. Called on sign-out and account deletion.

### `dismissNudge()`
Sets `nudgeDismissed: true` for this session.

### `getRecentTriageCount()`
Counts timestamps within the last 7 days. Used by `TriageNudge` component (shows at 3+).

### Test Coverage

13 tests in `__tests__/triageStore.test.ts`:
- `setSymptoms` works correctly
- Character limit enforcement (2000 chars)
- `clearResult` and `clearAll` reset state
- Triage nudge count tracks recent submissions
- Old timestamps (>7 days) are excluded from count
- `dismissNudge` works

---

## checkInStore.ts — Daily Check-In Draft + Submission (v2.6)

Uses **Zustand persist middleware** with `@react-native-async-storage/async-storage` to persist draft across app restarts. Only `draft` and `currentStep` are persisted — everything else is ephemeral.

**State:**
- `currentStep: number` — 0-8 (persisted)
- `draft: CheckInDraft | null` — Current check-in draft (persisted)
- `yesterdayCheckIn: DailyCheckIn | null` — Yesterday's check-in for hints
- `existingCheckIn: DailyCheckIn | null` — Today's existing entry (edit mode)
- `isSubmitting: boolean` — True during submission
- `error: string | null`
- `daySummary: DaySummary | null` — Post-submission summary
- `analyzePatternsResult: AnalyzePatternsResponse | null` — Pattern analysis results

**Methods:**

### `startCheckIn(dogId)`
Initializes the check-in flow. **Awaits persist rehydration** before checking draft validity. Three rehydration guards discard stale drafts:
- (a) `draft.dog_id !== dogId` → discard
- (b) `draft.check_in_date !== today` → discard
- (c) Entry already exists for that dog+date → populate from existing (edit mode)

Fetches yesterday's check-in (for hints) and today's existing entry in parallel.

### `setAnswer(field, value)` / `toggleSymptom(symptom)` / `setFreeText(text)`
Draft field setters. `toggleSymptom`: "none" deselects all others. `setFreeText`: enforces 500 char limit.

### `nextStep()` / `prevStep()` / `goToStep(n)`
Navigation within 0-8 range.

### `submitCheckIn()`
1. Validates all 7 required metric fields are filled
2. Gets authenticated user
3. Sets `emergency_flagged` by running `detectEmergencyKeywords()` on free text
4. UPSERT: update if `existingCheckIn` exists, otherwise insert
5. Generates client-side `daySummary` via `generateDaySummary()`
6. Fires in parallel (non-blocking): `analyze-patterns` Edge Function + `fetchDogs()` for streak update
7. Fire-and-forget: `ai-health-analysis` Edge Function (sends dog_id + check_in_id, silent failure)
8. On error: sets error message (caller checks error before transitioning)

### `clearDraft()` / `clearAll()`
Resets all state. `clearAll` called on sign-out and account deletion.

### Test Coverage

20 tests in `__tests__/checkInStore.test.ts`:
- startCheckIn, setAnswer, step navigation bounds
- toggleSymptom: none deselects others, selecting symptom deselects none
- Free text 500 char limit
- clearDraft, clearAll resets
- Rehydration guard tests

---

## healthStore.ts — Calendar Data + Pattern Alerts + AI Insights (v2.6)

**State:**
- `calendarData: Record<string, DailyCheckIn>` — Date string → check-in. Includes 7 days before month start for trailing window.
- `activeAlerts: PatternAlert[]` — Currently active pattern alerts
- `aiInsights: AIHealthInsight[]` — Recent AI-generated observations (up to 10, newest first)
- `isLoadingInsights: boolean` — True during AI insights fetch (separate from main `isLoading`)
- `selectedDate: string | null` — Selected date for detail sheet
- `isLoading: boolean` — True during data fetch
- `error: string | null`

**Methods:**

### `fetchMonthData(dogId, year, month)`
Fetches check-ins from **7 days before month start** through end of month. This trailing window ensures consistency scoring works correctly at month boundaries. Resets `calendarData: {}` at start of fetch to clear stale data from previously selected dog.

### `fetchActiveAlerts(dogId)`
Queries `pattern_alerts` WHERE `is_active = true`, ordered by `created_at` descending.

### `fetchAIInsights(dogId)`
Queries `ai_health_insights` for the dog, ordered by `created_at` descending, limit 10. Uses **explicit column selection** (excludes `rolling_summary_snapshot` and `metadata` — large JSONB not needed on mobile). Silent failure — AI insights are supplementary; deterministic alerts remain primary. Has its own `isLoadingInsights` flag (doesn't trigger main loading spinner).

**Important**: In `health.tsx`, this is in a **separate `useEffect`** with `[selectedDogId]` dependency only — NOT in the month-dependent useEffect. AI insights are dog-scoped, not month-scoped. Month navigation must not re-fetch them. Also re-fetches on tab focus to cover the fire-and-forget timing gap after check-in submission.

### `dismissAlert(alertId)`
Updates `dismissed_by_user = true` and `is_active = false` in database, then removes from local state.

### `setSelectedDate(date)` / `clearHealth()`
Simple setters. `clearHealth` resets all state including `aiInsights: []` and `isLoadingInsights: false`. Called on sign-out and account deletion.

### Test Coverage

11 tests in `__tests__/healthStore.test.ts`:
- fetchMonthData, dismissAlert, clearHealth
- Initial aiInsights state, fetchAIInsights loading, clearHealth resets AI state

---

## learnStore.ts — Learn Tab Article Library

**State:**
- `articles: Article[]` — All published articles (camelCase mapped from DB)
- `sections: Section[]` — Sections with articles grouped in, filtered to non-empty sections only
- `isLoading: boolean` — True during fetch
- `error: string | null`
- `lastFetched: number | null` — Timestamp for 5-minute cache TTL

**Methods:**

### `fetchArticles(force?)`
Checks cache TTL (5 min) → queries Supabase `blog_articles` with explicit column select (no `id`) → maps snake_case to camelCase → groups by section using `SECTION_META` constant (6 sections in fixed display order) → filters out empty sections. Error handling preserves cached data.

### `getArticleBySlug(slug)`
Synchronous lookup: `articles.find(a => a.slug === slug)`. Used by article detail screen.

### `getSectionMeta(sectionSlug)`
Returns section metadata (title, icon, accentColor) for use in article detail screen header.

### `clearLearn()`
Resets all state including `lastFetched: null`. Called on sign-out and account deletion to prevent cross-user cache leak.

### Test Coverage

10 tests in `__tests__/learnStore.test.ts`:
- Initial state, fetchArticles (cache skip, force bypass, error), getArticleBySlug, sections assembly, clearLearn
