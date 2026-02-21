# src/components/ — UI Components

Split into two directories based on purpose:

## legal/ — Safety-Critical Legal Components

These components enforce the legal boundary between "educational information" and "veterinary medicine." They MUST appear on every triage result screen. Removing or weakening them creates legal liability.

### DisclaimerFooter.tsx
Yellow warning banner with ⚕️ icon and legal disclaimer text. Appears at the bottom of every result screen and the home screen.
- **Props**: `text?: string` — custom text, defaults to `LEGAL.DISCLAIMER_TEXT`
- **Styling**: Yellow background (#FFF8E1), left border accent in warning color, icon + text in row layout
- **Used in**: TriageResult, Home screen FlatList footer, triage input screen

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

---

## __tests__/ — Component Tests

All tests use Jest + React Native Testing Library. See `jest.setup.js` at project root for mock configuration.

### EmergencyAlert.test.tsx (3 tests)
Tests rendering of warning message, "Find Emergency Vet" button, and dismiss callback.

### LegalComponents.test.tsx (9 tests)
Tests DisclaimerFooter (default + custom text), EmergencyCallBanner (vet button, poison control show/hide), CallYourVetButton (with/without phone), SourceCitation (empty, names, tier labels).

### TriageResult.test.tsx (10 tests)
Tests headline, educational_info, what_to_tell_vet bullets, sources, disclaimer, emergency bypass with poison control, vet phone display, no-vet fallback.

### UrgencyBadge.test.tsx (7 tests)
Tests all 4 urgency levels render correct labels, accessibility labels include descriptions, large size variant renders.
