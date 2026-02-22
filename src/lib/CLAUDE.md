# src/lib/ — Core Libraries

## supabase.ts — Supabase Client

Creates and exports the singleton Supabase client used throughout the app.

**Key configuration:**
- `storage: secureStoreAdapter` — Custom adapter that wraps `expo-secure-store` for native platforms and `localStorage` for web. This means JWT tokens are stored in the device's secure enclave on iOS/Android, not in plain AsyncStorage.
- `autoRefreshToken: true` — Supabase auto-refreshes tokens before expiry
- `persistSession: true` — Session survives app restarts
- `detectSessionInUrl: false` — Required for React Native (no URL-based auth detection)

**Platform handling**: The `secureStoreAdapter` checks `Platform.OS === 'web'` and falls back to `localStorage`. This allows development in Expo's web mode.

**Environment variables**: URL and anon key come from `API.SUPABASE_URL` and `API.SUPABASE_ANON_KEY` (which read from `EXPO_PUBLIC_*` env vars). If these are empty strings (env not set), the client will fail silently on API calls.

## emergencyKeywords.ts — Client-Side Emergency Detection Engine

**Purpose**: Detect emergency language in symptom text input BEFORE the user submits. This runs client-side with a 500ms debounce. When triggered, it shows an emergency alert banner urging immediate vet contact. This is the Golden Rule's first line of defense.

### How It Works

`detectEmergencyKeywords(rawText)` returns `{ isEmergency: boolean, matchedPatterns: string[] }`.

1. **Text normalization** (`normalizeText()`):
   - Lowercases everything
   - Converts Unicode smart quotes (`\u2018`, `\u2019`, `\u0060`, `\u00B4`) to straight apostrophes
   - Converts Unicode double quotes (`\u201C`, `\u201D`) to straight double quotes
   - Strips all non-word/non-space/non-apostrophe characters
   - Collapses whitespace

2. **Single-word pattern matching** (35 patterns):
   Each pattern is tested with `\b...\b` word boundary regex. Examples: `seizure`, `poison`, `bloat`, `choking`, `antifreeze`, `xylitol`, `chocolate`, `hemorrhaging`, `bleeding`.

3. **Compound pattern matching** (44 patterns):
   All words in the compound must be present (order doesn't matter). Examples:
   - `['not', 'breathing']` — matches "my dog is not breathing"
   - `['hit', 'car']` — matches "was hit by a car"
   - `['blue', 'gums']` / `['grey', 'gums']` / `['gray', 'gums']` — matches gum color changes
   - `['trying', 'vomit', 'nothing']` — matches "she keeps trying to vomit but nothing comes up"
   - `['stuck', 'throat']` — matches "something is stuck in her throat"
   - `['blood', 'stool']` / `['blood', 'poop']` — matches blood in stool
   - `['cannot', 'use', 'legs']` — matches leg paralysis descriptions

4. **Symptom cluster matching** (3 clusters):
   If N+ keywords from a cluster appear together, it's flagged. Examples:
   - `['vomiting', 'vomit', 'diarrhea', 'lethargy', 'lethargic', 'blood']` with `minMatches: 3`
   - `['swollen', 'belly', 'pacing', 'restless', 'drooling']` with `minMatches: 3`
   - `['weak', 'collapse', 'pale', 'cold']` with `minMatches: 3`

### Test Coverage

39 tests in `__tests__/emergencyKeywords.test.ts` covering:
- Empty/whitespace input returns no emergency
- All single-word patterns trigger correctly
- Compound patterns require all words present (including v9 additions: stuck+throat, white gums, blood+poop/feces, cannot breathe, reverse gum patterns)
- True negatives for context-dependent words ("stuck behind couch", "bloodhound")
- Cluster matching with minimum threshold
- Text normalization (smart quotes, case insensitivity, extra whitespace)

22 tests in `__tests__/foreignBodyFloor.test.ts` covering:
- Step 12b foreign body urgency floor logic (monitor→urgent, soon→urgent, urgent/emergency unchanged)
- Pattern matching for 12 common foreign body ingestion phrases
- Negative cases (regular symptoms, food items, gap exceeding 40 chars)
- Known edge case documentation ("got ahold of", passive phrasing)

### Known Edge Cases
- **"lethargic" vs "lethargy"**: The cluster includes both `'lethargy'` and `'lethargic'` as separate keywords. Word boundaries prevent partial matching, so both forms need to be listed.
- **"rat poison" and "snail bait"**: These are in the single-word list but are actually multi-word strings. They still match because the normalized text preserves spaces and the regex uses word boundaries around the full phrase.
- **Smart quotes**: The normalization explicitly handles curly apostrophes. "can't" with a Unicode right single quote (`\u2019`) is normalized to "can't" with a straight apostrophe, matching the compound pattern `["can't", "breathe"]`.

---

## consistencyScore.ts — 7-Day Consistency Score (v2.6)

Pure function: computes a consistency score from a trailing 7-day check-in window.

`calculateConsistencyScore(checkIns: DailyCheckIn[])` returns `ConsistencyScore | null`.

1. Returns `null` if fewer than `MIN_HISTORY_DAYS` (5) days of data
2. For each of 7 metric fields, computes the **mode** (most frequent value) across the window
3. Counts how many of today's (most recent) values match their respective modes
4. Maps match count to 1-5 scale: 0-1 matches = 1, 2-3 = 2, 4 = 3, 5-6 = 4, 7 = 5
5. Tie-breaking: if multiple values have equal frequency, defaults to the most recent check-in's value

### Test Coverage

9 tests in `__tests__/consistencyScore.test.ts`:
- 7/7 matches = score 5, 0/7 = score 1
- < 5 days returns null
- Tie-breaking with most recent value
- Partial match scores (2-4)

---

## daySummary.ts — Post-Check-In Day Summary (v2.6)

Pure function: classifies a check-in into one of 4 summary tiers.

`generateDaySummary(checkIn: DailyCheckIn)` returns `DaySummary`.

Classifies each field's abnormality level per PRD Section 3.2.1:
- **Baseline**: normal values (no concern)
- **Mild**: slight deviations (e.g., `less` appetite, `soft` stool)
- **Significant**: concerning values (e.g., `barely_moving`, `blood`, `dry_heaving`)
- **Flag**: unusual increases (e.g., `more` appetite = polyphagia)

**Summary tiers:**
- `all_normal` — All fields at baseline
- `minor_notes` — Only mild deviations
- `attention_needed` — One or more significant abnormalities
- `vet_recommended` — Critical: blood in stool, dry heaving, 3+ significant abnormalities

### Test Coverage

10 tests in `__tests__/daySummary.test.ts`:
- All-normal template, blood in stool alert, dry heaving alert, multiple abnormals
- Mild-only summary, mixed mild+significant

---

## patternRules.ts — Rule-Based Pattern Detection (v2.6)

17 pattern detection rules as pure functions, used by the `analyze-patterns` Edge Function and tested locally.

### Rule Categories

**Single-day rules (5)** — Always fire regardless of data density:
- `blood_in_stool` — stool_quality = 'blood' → vet_recommended
- `dry_heaving_emergency` — vomiting = 'dry_heaving' → vet_recommended
- `sudden_aggression` — mood = 'aggressive' → concern
- `vomiting_plus_other` — vomiting = 'multiple' + another significant abnormality → concern
- `multi_symptom_acute` — 3+ significant abnormalities in single day → concern

**Trend rules (12)** — Require ≥70% density over trailing window:
- `appetite_decline` — appetite 'barely'/'refusing' for 3+ of last 5 days → watch
- `appetite_increase` — appetite 'more' for 3+ days → info
- `appetite_thirst_increase` — appetite 'more' + water 'excessive' (composite, suppresses standalone appetite_increase) → watch
- `energy_decline` — energy 'lethargic'/'barely_moving' for 3+ days → watch
- `excessive_energy` — energy 'hyperactive' for 3+ days → info
- `digestive_issues` — stool 'diarrhea'/'blood' or vomiting 'multiple'/'dry_heaving' for 2+ days → watch
- `recurring_vomiting` — vomiting not 'none' for 3+ of last 5 days → concern
- `abnormal_water` — water 'much_less'/'excessive' for 3+ days → watch
- `mobility_issues` — mobility 'limping'/'reluctant'/'difficulty_rising' for 3+ days → watch
- `behavioral_change` — mood 'anxious'/'hiding'/'aggressive' for 3+ days → watch
- `multi_symptom_trend` — 2+ fields with significant abnormalities across multiple days → concern
- `persistent_decline` — any field with significant abnormality for 5+ consecutive days → concern

### Test Coverage

25 tests in `__tests__/patternRules.test.ts`:
- All 17 rules tested per PRD Section 10.3 test cases
- Density gating (rules don't fire below 70%)
- Composite priority (appetite_thirst_increase > appetite_increase)
- Empty/insufficient input handling
