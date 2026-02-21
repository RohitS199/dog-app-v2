# src/stores/ — Zustand State Management

Three Zustand stores manage all app state. All use the `create<Interface>((set, get) => ...)` pattern.

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
Calls `supabase.auth.signOut()`. Resets session, user, and hasAcceptedTerms to initial values. Callers (settings screen, delete-account) should also call `clearDogs()` and `clearAll()` to wipe local state.

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
Inserts into `dogs` table with `user_id: user.id` (fetched via `supabase.auth.getUser()`) and appends to local state. Auto-selects if no dog was previously selected. Returns the new Dog object. **Note**: The `user_id` must be included explicitly in the insert because the RLS INSERT policy requires `auth.uid() = user_id` and the column has no default.

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
