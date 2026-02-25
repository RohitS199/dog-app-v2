# src/components/ — UI Components

Split into two directories based on purpose:

## legal/ — Safety-Critical Legal Components

These components enforce the legal boundary between "educational information" and "veterinary medicine." They MUST appear on every triage result screen. Removing or weakening them creates legal liability.

### DisclaimerFooter.tsx
Yellow warning banner with ⚕️ icon and legal disclaimer text. Appears at the bottom of every result screen and the home screen.
- **Props**: `text?: string` — custom text, defaults to `LEGAL.DISCLAIMER_TEXT`
- **Styling**: Yellow background (#FFF8E1), left border accent in warning color, icon + text in row layout
- **Used in**: TriageResult, Home screen FlatList footer, triage input screen, article detail screen

### UrgencyBadge.tsx
Color-coded pill badge that displays the urgency level. The single most important visual indicator.
- **Props**: `level: UrgencyLevel` (emergency | urgent | soon | monitor), `size?: 'small' | 'large'`
- **Rendering**: Colored border + background from `URGENCY_CONFIG`, dot indicator + label text
- **Accessibility**: Full `accessibilityLabel` with level name and description (e.g., "Urgency level: Emergency. Seek veterinary care immediately")
- **Color mapping**: See root CLAUDE.md — teal for monitor, NOT green
- **Used in**: TriageResult (large size)

### SourceCitation.tsx
Tappable list of veterinary reference sources with tier badges. Returns `null` if sources array is empty.
- **Props**: `sources: TriageSource[]` — each has `name`, `tier` (number), `url`
- **Tier labels**: 1 = "Veterinary Reference", 1.5 = "Professional Reference", 2 = "Veterinary Institution", 3 = "Veterinary Practice"
- **Behavior**: Tapping a source with a URL opens it via `Linking.openURL()`
- **Used in**: TriageResult (only for `type: 'triage'` responses, not emergency bypass)

### EmergencyCallBanner.tsx
Emergency action banner with "Find Emergency Vet Near You" button and optional ASPCA Poison Control.
- **Props**: `showPoisonControl?: boolean`
- **"Find Vet" button**: Red background, opens `EMERGENCY.SEARCH_EMERGENCY_VET_URL` (Google search) — NOT a vet locator API (that's post-MVP)
- **Poison Control**: Only shown when `showPoisonControl` is true (set when `type === 'emergency_bypass'` and `show_poison_control === true`). Shows phone number and $75 fee note.
- **Used in**: TriageResult (for emergency/urgent levels)

### CallYourVetButton.tsx
Direct phone dial button or honest "no vet on file" fallback.
- **Props**: `vetPhone: string | null`
- **With phone**: Blue button, calls `Linking.openURL('tel:...')`
- **Without phone**: Gray card with "No vet phone number on file. You can add one in your dog's profile." This is the "honest button" pattern from the PRD — no fake functionality.
- **Used in**: TriageResult, emergency screen

### index.ts
Barrel export for all legal components. Import pattern: `import { UrgencyBadge, DisclaimerFooter } from '../components/legal'`

---

## ui/ — General UI Components

### DogSelector.tsx
Modal bottom sheet for selecting between multiple dogs.
- **Props**: `visible: boolean`, `onClose: () => void`
- Uses `Modal` with transparent overlay and slide animation
- FlatList of dog rows with radio-style selection (checkmark on selected)
- Each row has `accessibilityRole="radio"` and `accessibilityState={{ selected }}`
- Calls `useDogStore().selectDog()` on selection
- Only shown when user has > 1 dog (triage screen checks `dogs.length > 1`)

### EmergencyAlert.tsx
Red-bordered alert card shown when the emergency keyword engine detects danger in symptom input. This fires BEFORE submission — it's the Golden Rule in action.
- **Props**: `matchedPatterns: string[]`, `onDismiss: () => void`
- Title: "Possible Emergency Detected"
- "Find Emergency Vet Now" button → opens Google search
- "Continue with symptom check anyway" dismissable link → calls `onDismiss`
- Has `accessibilityRole="alert"` on container

### LoadingScreen.tsx
Full-screen loading state shown during API call to check-symptoms.
- **No props** — self-contained
- Rotating tips from `LOADING_TIPS` array, cycling every 4 seconds
- "Still working" message appears after `LIMITS.LOADING_STILL_WORKING_MS` (15 seconds)
- The minimum display time (3 seconds) is NOT enforced here — it's enforced in `triageStore.submitSymptoms()` via a `setTimeout` that pads the loading time

### OfflineBanner.tsx
Gray banner: "You're offline. Some features may be unavailable."
- **No props** — shown/hidden by parent based on `useNetworkStatus()`
- Non-intrusive, doesn't shift layout significantly

### OffTopicResult.tsx
Friendly card shown when the API returns `type: 'off_topic'` (non-dog animal, human health, etc.).
- **Props**: `result: OffTopicResponse`, `onTryAgain: () => void`
- Shows 🐾 emoji (hidden from screen readers), the message text, and "Try Again" button
- Deliberately NOT an error state — it's a polite redirect
- No urgency badge, no sources, no disclaimer (since no triage happened)

### TriageNudge.tsx
Blue info card suggesting the user see a vet if they've been checking symptoms frequently.
- **Props**: `triageCount: number`, `onDismiss: () => void`
- Returns `null` if `triageCount < 3` (only shows for 3+ checks in 7 days)
- Message: "You've checked symptoms X times in the past week. If you're worried about your dog, seeing a vet is always the best option."
- Dismissable with "Got it" button

### TriageResult.tsx
The main triage result display. Renders a ScrollView with the full result breakdown.
- **Props**: `result: TriageResponse | EmergencyBypassResponse`, `vetPhone: string | null`
- **Layout order**: UrgencyBadge (large) → headline → EmergencyCallBanner (emergency/urgent only, with poison control for emergency_bypass) → CallYourVetButton → "What This May Mean" (educational_info) → "What to Tell Your Vet" (bullet list) → SourceCitation (triage only) → DisclaimerFooter
- Emergency bypass results have empty sources, so SourceCitation isn't rendered
- The disclaimer text comes from `result.disclaimer`, not the default constant

### CheckInCard.tsx
Single check-in question with radio-style options and optional yesterday comparison hint.
- **Props**: `question: CheckInQuestion`, `selectedValue: string | null`, `yesterdayValue: string | null`, `onSelect: (value) => void`, `showAlert: { message: string } | null`
- Shows yesterday's answer as a hint label below options (e.g., "Yesterday: Normal")
- Optional inline alert (e.g., blood in stool warning)

### AdditionalSymptomsCard.tsx
Multi-select symptom chips for step 7 of the check-in flow.
- **Props**: `selectedSymptoms: AdditionalSymptom[]`, `onToggle: (symptom) => void`
- "None" chip deselects all others; selecting any symptom deselects "None"

### FreeTextCard.tsx
Free text input (step 8) with 500-character limit and optional emergency keyword detection.
- **Props**: `value: string | null`, `onChange: (text) => void`

### CheckInReview.tsx
Summary of all 9 answers with tap-to-edit functionality.
- **Props**: `draft: CheckInDraft`, `onEditStep: (step) => void`, `onSubmit: () => void`, `isSubmitting: boolean`

### DaySummaryCard.tsx
Post-submission confirmation card with 4 tiers, streak display, and pattern alerts.
- **Props**: `summary: DaySummary`, `streak: number`, `alertsResult: AnalyzePatternsResponse | null`, `onDone: () => void`

### ProgressDots.tsx
Horizontal dot indicator showing current step in the check-in flow.
- **Props**: `totalSteps: number`, `currentStep: number`

### CalendarGrid.tsx
Monthly calendar grid with 6 status states (shape+color for WCAG AA).
- **Props**: `year: number`, `month: number`, `dayStatuses: Record<string, CalendarDayStatus>`, `onDayPress: (date) => void`, `todayString: string`
- Green circle (score 4-5), amber triangle (2-3), red diamond (1), blue outlined circle (days 1-4), gray dash (missed), nothing (future)
- 48x48 cells for MIN_TOUCH_TARGET

### DayDetailSheet.tsx
Bottom sheet modal showing full check-in data with previous day comparison.
- **Props**: `visible: boolean`, `onClose: () => void`, `checkIn: DailyCheckIn | null`, `previousCheckIn: DailyCheckIn | null`, `dateString: string`

### StreakCounter.tsx
Streak display with gamification messaging.
- **Props**: `streak: number`

### ConsistencyCard.tsx
7-day consistency score visual with 5-dot bar.
- **Props**: `score: ConsistencyScore`

### PatternAlertCard.tsx
Pattern alert display with severity-colored left border and dismiss button.
- **Props**: `alert: PatternAlert`, `onDismiss: (alertId) => void`
- `vet_recommended` level shows "Contact Your Vet" prominently
- Uses `ALERT_LEVEL_CONFIG` for colors/icons
- Shows `ai_insight` text when available (between message and vet banner, with "AI Analysis" label, italic styling, divider separator)

### AIInsightCard.tsx
AI-generated health observation card with severity badge and article recommendations.
- **Props**: `insight: AIHealthInsight`, `onArticlePress: (slug: string) => void`
- Left border color: `COLORS.success` (green) if `is_positive`, else severity color from `ALERT_LEVEL_CONFIG`
- Header: `AlertLevelBadge` + optional "Good sign" green pill badge (only when `is_positive`)
- Title + message body
- "Recommended Reading" section (only if `recommended_articles` non-empty): tappable rows with reason text + `>` arrow, `accessibilityRole="link"`, `MIN_TOUCH_TARGET` height
- `onArticlePress(slug)` → routes to `/article/[slug]`

### HealthSummaryCard.tsx
Rolling AI health summary display with collapsible baseline profile.
- **Props**: `summary: HealthSummary`, `dogName: string`
- Header: "{dogName}'s Health Profile"
- `summary_text` as main body
- Latest annotation from `annotations[]` (if non-empty) with "Latest Note" label, italic text
- Collapsible "View Baseline" / "Hide Baseline" toggle (via `useState`)
  - Label-value pairs for each baseline field (Appetite, Water Intake, Energy, Stool, Mobility, Mood)
  - Vomiting history note and known sensitivities (if present)
- **"Last updated X days ago"** relative time indicator at bottom (today/yesterday/X days ago/date format)

### AlertLevelBadge.tsx
Small pill badge for alert severity level.
- **Props**: `level: AlertLevel`
- Follows `UrgencyBadge.tsx` pattern

### GettingStartedCard.tsx
Cold start onboarding card on home screen.
- Shows "Start Your First Check-In" for streak 0, "X more days until insights" for streaks 1-4
- Auto-dismisses when `checkin_streak >= 5`
- White CTA button on Orange Collar (accent) background

---

## __tests__/ — Component Tests (9 suites, 69 tests)

All tests use Jest + React Native Testing Library. See `jest.setup.js` at project root for mock configuration.

### EmergencyAlert.test.tsx (3 tests)
Tests rendering of warning message, "Find Emergency Vet" button, and dismiss callback.

### LegalComponents.test.tsx (9 tests)
Tests DisclaimerFooter (default + custom text), EmergencyCallBanner (vet button, poison control show/hide), CallYourVetButton (with/without phone), SourceCitation (empty, names, tier labels).

### TriageResult.test.tsx (10 tests)
Tests headline, educational_info, what_to_tell_vet bullets, sources, disclaimer, emergency bypass with poison control, vet phone display, no-vet fallback.

### UrgencyBadge.test.tsx (7 tests)
Tests all 4 urgency levels render correct labels, accessibility labels include descriptions, large size variant renders.

### CheckInCard.test.tsx (8 tests)
Tests question rendering, option selection, selected state highlighting, yesterday hint display, inline alert for blood in stool.

### CheckInReview.test.tsx (5 tests)
Tests all answers rendered, tap-to-edit callback fires with correct step index.

### PatternAlertCard.test.tsx (8 tests)
Tests title/message rendering, severity badge, dismiss callback, vet_recommended shows "Contact Your Vet" CTA, ai_insight display (present and null cases).

### CalendarGrid.test.tsx (8 tests)
Tests correct cell count for month, status indicators (shape+color), date press callback, today cell highlighting.

### AIInsightCard.test.tsx (8 tests)
Tests title rendering, message rendering, correct severity badge, "Good sign" badge for positive insights, no "Good sign" for negative, article recommendation links, onArticlePress callback with correct slug, hidden "Recommended Reading" when no articles.
