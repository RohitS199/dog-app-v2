# PupLog — Flower Tier Logic (Journey garden)

**What this is:** the single reference for how a daily check-in becomes a flower — **color = the dog's mood, complexity (tier) = how detailed the log was.** This is the "rewarded for specifics" mechanic: richer logs literally grow fuller flowers. No points, no badges.

**Status:** consolidated 2026-06-20 from the two places this logic actually lives today:
- **Determination logic (source of truth):** the `tier()` function in `preview-journey-hero-option-a-v2.html` (project root, ~line 1209).
- **Art / visual-complexity reference:** `~/Downloads/puplog_flower_prompts_v2 (1).md` (the 24-flower Gemini prompt guide).

⚠️ **Thresholds are still tunable** (flagged as an open product question in `HANDOFF.md` §7.6). This documents the *current mockup behavior*; treat it as a strong default, not locked law, until the Journey spec is written.

---

## 1. The tier rule (exact — first match wins, top to bottom)

```
tier 0  →  no mood picked yet            →  "sprout" placeholder
tier 1  →  mood picked, nothing else     →  simple bloom
tier 2  →  mood + ≥1 health/symptom chip →  fuller bloom
tier 3  →  mood + a PHOTO or a NOTE       →  full bloom
```

Verbatim from the mockup:

```js
function tier() {
  if (!mood) return 0;                 // nothing chosen → sprout
  if (hasPhoto || hasNote) return 3;   // photo OR free-text note → full bloom
  if (symptoms.size > 0) return 2;     // ≥1 symptom chip → fuller bloom
  return 1;                            // mood only → simple bloom
}
```

**Key subtlety:** the photo/note check comes **before** the symptom check, so a photo or note jumps straight to **Tier 3 even if no symptom chip is selected.** Detail (evidence Biscuit can read) is rewarded over breadth.

**One flower per dog per day** (`UNIQUE(dog_id, check_in_date)` already enforced in the DB). A missed day = bare soil, never a wilted flower (no streaks, no guilt — product decision).

---

## 2. The 8 moods → flower color

`color = mood`. Filenames: `puplog-flower-[mood]-tier[1|2|3].png` (all 24 exist in `assets/garden/flowers/`).

| Mood key | Label | Hex | Color name | Flower character (T1) |
|---|---|---|---|---|
| `joyful` | Joyful | `#F4C430` | Sunny Yellow | 5-petal wildflower |
| `playful` | Playful | `#FF8C61` | Coral Orange | 5-petal buttercup |
| `affectionate` | Affectionate | `#F4A6B8` | Rose Pink | 5-petal forget-me-not |
| `calm` | Calm | `#A8C9A0` | Sage Green | 6-petal daisy |
| `curious` | Curious | `#9BB5DD` | Periwinkle Blue | 5-petal star flower |
| `tired` | Tired | `#C8B4D8` | Soft Lavender | bell-shaped |
| `anxious` | Anxious | `#A89AA8` | Muted Plum | tight half-open **bud** |
| `unwell` | Unwell | `#C5CDD2` | Pale Ash Blue | drooping snowdrop |

**Hard moods get dignity** (never violate): anxious = an accurate tight bud, not a punishing wilt; unwell = a delicate snowdrop, not a dead flower.

---

## 3. The inputs that drive the tier

From the log bottom-sheet, in order:

1. **Mood** (section 1) — 8 chips above, exactly one. **Unlocks the tier system** (no mood = sprout). → sets **color**.
2. **Health/symptom chips** (section 2, unlocks after mood) — multi-select: `All normal · Eating less · Low energy · Tummy trouble · Stiff or limping · Itchy skin · Threw up`. "All normal" is **exclusive** (selecting it clears the others; selecting any other clears it). Any ≥1 selected → at least **Tier 2**.
   - Note: "All normal" still counts as a selected chip → `symptoms.size > 0` → Tier 2. (Tunable — see §6.)
3. **Specifics** (section 3, unlocks after ≥1 symptom chip) — a **photo** and/or a **note** (free text). Either one → **Tier 3**.

---

## 4. Tier → visual complexity (the art spec)

From `puplog_flower_prompts_v2 (1).md`. Complexity grows with tier; the same mood color carries across all three.

| Tier | Meaning (art guide wording) | Visual |
|---|---|---|
| **Tier 1** | Quick tap-through check-in | Simple wildflower, ~5 petals, single bloom |
| **Tier 2** | Standard log (mood + activity) | Fuller flower, layered petals, medium bloom |
| **Tier 3** | Detailed log (notes, photo, tags) | Ornate flower, multiple petal layers, elaborate bloom |

> ⚠️ **Discrepancy to reconcile:** the art guide describes Tier 2 as "mood + activity" and Tier 3 as "notes, photo, tags" — looser than the code, which is precisely "mood + ≥1 symptom chip" (T2) and "mood + photo/note" (T3). **The code is the precise version**; the guide's prose is approximate. Align them when the Journey spec is written.

---

## 5. Tier copy (in-sheet labels + Biscuit hints, from the mockup)

| Tier | Label | Hint |
|---|---|---|
| 0 | "Waiting to sprout" | "Pick her mood and a flower takes root." |
| 1 | "A simple bloom" | "Sweet! Add a health note and it grows fuller." |
| 2 | "A fuller bloom" | "Lovely. A photo or note makes it bloom completely — real evidence for Biscuit." |
| 3 | "Full bloom!" | "Beautiful — the detailed kind of entry Biscuit can really read patterns from." |

---

## 6. Open product questions (resolve before locking — `HANDOFF.md` §7.6)

1. **How do the 8 emotional moods map onto the existing clinical 9-question check-in** (`src/constants/checkInQuestions.ts`, `app/check-in.tsx`)? Working proposal: mood is a *new* first question (= color); symptom chips absorb the clinical layer; photo + note = Tier 3. Fate of the full 7-metric flow (replace / re-skin / fold into "details") is undecided.
2. **Can editing a day's entry retroactively upgrade its flower tier?**
3. **Exact thresholds** — current defaults: mood = T1 · +symptom = T2 · +photo/note = T3. Specifically: should **"All normal"** count toward Tier 2, or should only *abnormal* chips raise the tier? (Currently any chip, including "All normal," → T2.)

---

## 7. For the eventual React-Native build

- Port `tier()` as a pure, unit-tested helper (e.g. `src/lib/flowerTier.ts`) — same first-match order. TDD it.
- Flower art = a **static `require()` asset map** `FLOWER_ASSETS[mood][tier]` — **Metro cannot do template-literal requires**, so no `require(\`...${mood}...\`)`.
- Flower PNGs currently have **white backgrounds**; RN needs true background-removed + downscaled exports (sources are 1024–2048px).
- `mood` likely needs a new column or value-mapping on `daily_check_ins` — **no duplicated enums between TS and the Postgres CHECK constraint** (a project rule).
- Animation: reanimated `withTiming` only (no springs); plant celebration ≈ 1000ms with a 1.02× overshoot.

---

**Sources:** `preview-journey-hero-option-a-v2.html` (`tier()` ~L1209, `MOODS` ~L1137, `SYMPTOMS` ~L1147, `TIER_COPY` ~L1216) · `~/Downloads/puplog_flower_prompts_v2 (1).md` · `assets/garden/README.md` · `HANDOFF.md` §7.
