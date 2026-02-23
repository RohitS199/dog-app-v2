# src/types/ — TypeScript Type Definitions

## api.ts — API Contract Types

These types match the **deployed backend** exactly. They were corrected from earlier documentation that had errors.

### Response Types (discriminated union on `type` field)

**`TriageResponse`** (`type: 'triage'`)
Normal triage result. Contains:
- `urgency`: `'emergency' | 'urgent' | 'soon' | 'monitor'` — **NOT 'low'**. The backend returns `"monitor"`, the UI maps it to label "Low Urgency".
- `headline`: Short summary (e.g., "Your dog may have gastritis")
- `educational_info`: Detailed educational text about the condition
- `what_to_tell_vet`: Array of bullet points for vet visit preparation — **now filtered** through the output filter (as of check-symptoms v7, unchanged through v10)
- `sources`: Array of `{ name, tier, url }` — veterinary references used
- `disclaimer`: Server-generated disclaimer text
- `_debug`: Optional debug info, only present in `__DEV__` mode

**`EmergencyBypassResponse`** (`type: 'emergency_bypass'`)
Returned when the backend's emergency keyword detection fires (step 3 of the 16-step pipeline). Skips RAG and LLM entirely for faster response.
- `urgency`: Always `'emergency'`
- `sources`: Always empty array `[]` (no RAG was consulted)
- `show_poison_control`: Boolean — whether to show ASPCA Poison Control
- `poison_control_number`: `'888-426-4435'`
- All other fields same as TriageResponse

**`OffTopicResponse`** (`type: 'off_topic'`)
Returned for non-dog queries (cats, humans, etc.) or LLM-detected off-topic.
- `message`: Friendly redirect message
- `reason`: `'non_dog_animal' | 'human_health' | 'llm_detected'`
- NO urgency, NO sources, NO disclaimer

**`CheckSymptomsResponse`** — Union of all three

### Request Types

**`CheckSymptomsRequest`**: `{ dog_id: string, symptoms: string }`

### Data Models

**`Dog`**: Full dog profile with `id`, `user_id`, `name`, `breed`, `age_years` (NUMERIC), `weight_lbs`, `vet_phone` (nullable), `last_checkin_date` (DATE, nullable), `checkin_streak` (number), `created_at`, `updated_at`

**`UserAcknowledgment`**: Terms acceptance record with `id`, `user_id`, `terms_version`, `accepted_at`

### Edge Function Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `check-symptoms` | POST | Bearer JWT | Triage pipeline (v10) |
| `analyze-patterns` | POST | Bearer JWT | Pattern detection (v1, 20/hr rate limit) |
| `delete-account` | POST | Bearer JWT + password in body | Account deletion (v1) |
| `run-stress-test` | POST | Bearer JWT | Testing only (v3) |

### Critical Notes for Future Developers

1. The `type` field is the discriminator. There is NO `is_emergency_bypass` boolean field on the response.
2. The urgency value `"low"` does NOT exist. It's `"monitor"`. Coding against `"low"` means the urgency badge won't render.
3. `show_poison_control` and `poison_control_number` only exist on `EmergencyBypassResponse`, not `TriageResponse`.
4. The `_debug` field is stripped in production by the backend. Don't depend on it.
5. `sources` is always `[]` on emergency_bypass (no RAG lookup was done).
6. All Edge Functions use `verify_jwt: false` but validate JWTs internally via `supabase.auth.getUser(token)`.
7. The `what_to_tell_vet` field is now filtered through the same output filter as `headline` and `educational_info` (fixed in v7, unchanged through v10).
8. The `delete-account` endpoint requires `{ password: string }` in the body for re-authentication.

---

## checkIn.ts — Check-In Type Definitions (v2.6)

### Metric Enums
Type aliases matching `daily_check_ins` CHECK constraints exactly:
- `Appetite`: `'normal' | 'less' | 'barely' | 'refusing' | 'more'`
- `WaterIntake`: `'normal' | 'less' | 'much_less' | 'more' | 'excessive'`
- `EnergyLevel`: `'normal' | 'low' | 'lethargic' | 'barely_moving' | 'hyperactive'`
- `StoolQuality`: `'normal' | 'soft' | 'diarrhea' | 'constipated' | 'blood' | 'not_noticed'`
- `Vomiting`: `'none' | 'once' | 'multiple' | 'dry_heaving'`
- `Mobility`: `'normal' | 'stiff' | 'limping' | 'reluctant' | 'difficulty_rising'`
- `Mood`: `'normal' | 'quiet' | 'anxious' | 'clingy' | 'hiding' | 'aggressive'`

### Interfaces
- **`MetricField`** — Union of the 7 field names (appetite, water_intake, etc.)
- **`METRIC_FIELDS`** — Const array of all 7 field names (used for iteration)
- **`DailyCheckIn`** — Full database row (all columns including id, user_id, timestamps)
- **`CheckInDraft`** — Form state with nullable answer fields (before submission)
- **`AdditionalSymptom`** — Union of 11 symptom values + 'none'

---

## health.ts — Health / Calendar / Alert Types (v2.6)

### Type Definitions
- **`PatternType`** — Union of 17 canonical pattern names (e.g., 'appetite_decline', 'blood_in_stool')
- **`AlertLevel`** — `'info' | 'watch' | 'concern' | 'vet_recommended'`
- **`PatternAlert`** — Full database row matching `pattern_alerts` columns
- **`CalendarDayStatus`** — `'good' | 'fair' | 'poor' | 'new' | 'missed' | 'future'`
- **`ConsistencyScore`** — `{ score: number, matchCount: number, totalFields: number }`
- **`DaySummary`** — `{ type: 'all_normal' | 'minor_notes' | 'attention_needed' | 'vet_recommended', title: string, message: string, abnormalities: string[] }`
- **`AnalyzePatternsResponse`** — `{ patterns: PatternAlert[], summary: string, density: { logged: number, window: number } }`

---

## learn.ts — Learn Tab Type Definitions

### Interfaces
- **`Article`** — Mapped from `blog_articles` table row (camelCase). Fields: `slug` (routing key, NOT uuid), `title`, `summary`, `body` (raw Markdown), `section` (section slug), `readTimeMinutes`, `imageUrl` (nullable), `sortOrder`, `publishedAt` (nullable). No `id` field — intentionally excluded from Supabase query.
- **`Section`** — Display grouping for articles. Fields: `id` (section slug), `title`, `description`, `icon` (MaterialCommunityIcons name), `accentColor`, `articles: Article[]`.

### Section Slugs (must match DB CHECK constraint)
`know-your-dog`, `when-to-worry`, `safety-first-aid`, `nutrition-diet`, `behavior-wellness`, `puppy-new-dog`
