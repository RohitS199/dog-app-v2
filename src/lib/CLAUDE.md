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

3. **Compound pattern matching** (43 patterns):
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
