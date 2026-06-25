# Journey "Garden" Hero — Design Spec & Handoff (2026-06-23)

**Status:** Visual direction LOCKED via an interactive mockup; data model has one **decision gate** open (see §12). Ready for `superpowers:brainstorming` (short — direction is locked) → `superpowers:writing-plans` refresh → `superpowers:test-driven-development`.
**Author:** Claude (Opus 4.8), 2026-06-23 session — converged the visual through ~25 live mockup iterations with the user.
**For:** The next Claude instance (possibly a different machine / cloud session). Read this top-to-bottom, then the files it references.
**Supersedes (visually):** [`docs/superpowers/specs/2026-06-20-journey-tab-hero-design.md`](2026-06-20-journey-tab-hero-design.md) — the pre-mockup design. This document is the newer, authoritative visual + data-model spec. The implementation plan at [`docs/superpowers/plans/2026-06-20-journey-tab-hero.md`](../plans/2026-06-20-journey-tab-hero.md) is still largely valid; §12 + §15 below note which tasks need revision.

---

## 0. ⚠️ MANDATORY FOR EVERY CLAUDE INSTANCE: USE SKILLS — ALWAYS

**This is non-negotiable and applies to every session that touches this work.** Before starting ANY task in this spec, you MUST:

1. **Use the skills we already have.** Invoke the relevant skill *before* acting — see the full table in §17. At minimum: `superpowers:brainstorming` before any design/feature work, `superpowers:writing-plans` before coding, `superpowers:test-driven-development` while coding, `supabase-postgres-best-practices` before any SQL/migration, `react-native-architecture` + `react-native-best-practices` for the screen/animation build, `accessibility-compliance` for every new surface, and `superpowers:verification-before-completion` before claiming anything is done.
2. **Create a new skill** when a workflow recurs and no skill covers it (`superpowers:writing-skills` or `anthropic-skills:skill-creator`). Candidate skills are listed in §17 and in [`HANDOFF.md`](../../../HANDOFF.md) §14.
3. **Go find a skill online** when you hit an unfamiliar domain: `npx skills find "<query>"`, browse **https://skills.sh/trending**, and install high-quality, well-reviewed, reliable ones with `npx skills add <owner/repo@skill> -g -y` (prefer 1K+ installs / strong reviews). Confirm it's reputable before trusting it.

Do not "wing it." If a skill exists or could exist for what you're doing, use it or make it. This instruction is repeated in full detail in **§17** — read it again there. (Source for this policy: project [`CLAUDE.md`](../../../CLAUDE.md) "Skills — Always Use" + [`HANDOFF.md`](../../../HANDOFF.md) §14 + the user's explicit, repeated instruction in the 2026-06-23 session.)

---

## 1. What the Journey Garden Hero is

The **Journey tab** is PupLog's home screen and primary engagement surface: a per-dog, full-bleed, **living watercolor garden** where **one daily log plants flowers**, the garden **fills over the week**, and at week's end it becomes a keepsake. **No streaks, ever** — a missed day is just bare soil, never guilt. (Product direction sources: [`HANDOFF.md`](../../../HANDOFF.md) §7.1 + §11; memory pointers in the project's auto-memory: `project_no_streaks.md`, `project_flower_garden_system.md`, `project_journey_hero_pitch.md`.)

- **4-tab IA:** Journey / My Dogs / Discovery / Profile — confirmed in [`src/components/ui/FloatingTabBar.tsx:21`](../../../src/components/ui/FloatingTabBar.tsx) (`index: 'Journey'`, `health: 'My Dogs'`, `learn: 'Discovery'`, `profile: 'Profile'`).
- **Journey = the live garden** (this spec). **My Dogs** = per-dog history (shipped, PR #23). **Discovery** = "Biscuit reads the garden" (not designed). **Profile** = account stickers + settings (shipped).
- The garden **replaces** the current legacy home at [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) (888 lines, legacy `COLORS` theme — to be rewritten).

---

## 2. Repository, environment, and how to run

| Thing | Value / Reference |
| --- | --- |
| **GitHub repo (active)** | `https://github.com/RohitS199/dog-app-v2.git` (remote `origin`) — [`CLAUDE.md:5`](../../../CLAUDE.md) |
| GitHub repo (archived, do NOT push) | `https://github.com/RohitS199/dog-app-ui.git` |
| Supabase project | `https://wwuwosuysoxihtbykwgh.supabase.co` — [`CLAUDE.md:229`](../../../CLAUDE.md) |
| Tech stack | Expo SDK 54, RN 0.81 (New Arch), TypeScript strict, Expo Router v6, Zustand v5, Supabase JS v2, react-native-reanimated v4, react-native-svg, Jest 29 + RNTL — [`CLAUDE.md`](../../../CLAUDE.md) "Tech Stack" |
| Project bibles | [`CLAUDE.md`](../../../CLAUDE.md) (root + per-dir), [`DOCUMENTATION.md`](../../../DOCUMENTATION.md), [`HANDOFF.md`](../../../HANDOFF.md) |
| `.env` | **gitignored** — app won't boot without it (`supabaseUrl is required`). Each worktree needs `cp <main>/.env <worktree>/.env`. ([`HANDOFF.md`](../../../HANDOFF.md) H1/H2.) |

**Run the visual mockup (no build needed):**
```bash
cd /Users/rohitsandur/Documents/Projects/dog_app_ui
python3 -m http.server 8088
# then open: http://localhost:8088/preview-journey-hero-final-week.html
```
A launch config exists at [`.claude/launch.json`](../../../.claude/launch.json) (name `mockup-preview`). **Hard-refresh** after edits (the mockup caches asset-existence probes per page-load — [`HANDOFF.md`](../../../HANDOFF.md) H8). Animations only run in a **foreground** browser tab (browsers pause animation in hidden/background tabs — discovered this session; it's why static screenshots show frozen clouds/butterfly).

**Run the RN app (device QA):** `cd <worktree> && npx expo start -c` (the `-c` matters whenever new image assets were added — Metro caches the asset registry; [`HANDOFF.md`](../../../HANDOFF.md) H13). The agent environment **cannot screenshot the RN app** — verify layout via PIL composites and let the user QA on device ([`HANDOFF.md`](../../../HANDOFF.md) H12).

**Workflow discipline:** branch every feature off `origin/main` (never local `main`, which carries unrelated WIP — [`HANDOFF.md`](../../../HANDOFF.md) §4), one worktree per bundle (`superpowers:using-git-worktrees`), PR back to `origin`.

---

## 3. Product direction — LOCKED decisions (do not re-litigate)

These were settled with the user (this session + prior). Sources cited inline.

1. **No streaks.** Flowers + stickers are the engagement layer; missed day = bare soil, no wilt, no guilt copy. ([`HANDOFF.md`](../../../HANDOFF.md) §7.1, §11.)
2. **Color = the dog's mood that day; complexity/density = how detailed the log was** ("rewarded for specifics"). ([`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md) §1–2.)
3. **No per-day sections.** Flowers scatter **organically across the whole soil**, never in labeled Mon/Tue/Wed slots. (User decision, 2026-06-23.)
4. **One log → a CLUSTER of blooms** (not a single stem), so the bed **fills** by week's end. Cluster size scales with tier. (User decision, 2026-06-23 — this *visually* supersedes the older "one log = one flower" wording in [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md) §1 and [`HANDOFF.md`](../../../HANDOFF.md) §7.1; **the data layer is still one row per day** — see §12.)
5. **Placement is deterministic** (seeded), so a flower's spot is random-*looking* but **fixed forever** — it never reshuffles on reload. (User confirmed, 2026-06-23.)
6. **Weekly Mon–Sun cycle.** At week's end the scene becomes an end-of-week keepsake ("A fresh bed starts Monday") and hands off to the My Dogs look-back. ([`HANDOFF.md`](../../../HANDOFF.md) §7.1; mockup [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html).)
7. **Scrapbook design system, not the legacy theme.** Use `OB_*` tokens from [`src/constants/onboardingTheme.ts`](../../../src/constants/onboardingTheme.ts); **never** the legacy `COLORS` in [`src/constants/theme.ts`](../../../src/constants/theme.ts). CTAs are **ink `#2a221c` on coral `#F4845F`**, never white-on-coral (WCAG; [`HANDOFF.md`](../../../HANDOFF.md) §6, §11). *Physical scene colors* (sky, grass, soil) are their own watercolor palette (§6) and are NOT theme tokens.

---

## 4. The canonical mockup = the visual source of truth

**The authoritative visual is [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html)** (project root, untracked on the laptop — see §18 for the git situation). It is the **end-of-week, fully-logged "final result"** view, built and tuned with the user this session. **When this spec and the mockup disagree on an exact number, the mockup wins** — read it.

Two mockups exist; know the difference:

| File | What it is | State |
| --- | --- | --- |
| [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) | **THE visual truth.** End-of-week garden: full 61-bloom bed, real cloud PNGs, rich grass detail, grounded doghouse, distinct horizon, retrospective greeting, no "Plant today" CTA. | Built 2026-06-23. **Use this for all visual values.** |
| [`preview-journey-hero-option-a-v2.html`](../../../preview-journey-hero-option-a-v2.html) | The **interactive** mockup with the **log bottom-sheet flow** (mood chips → health chips → specifics → tier preview → plant celebration). | Older look (flat green, day-pegs, SVG clouds). **Its sheet/logging UX is still the reference; its scene styling is stale** — port the final-week look into it as a follow-up. |

Pitch options (reference only, superseded): `preview-journey-hero-option-a-front-yard.html`, `...-option-b-gardeners-journal.html`, `...-option-c-biscuits-walk.html`.

---

## 5. Scene composition & layering

Back-to-front (z-order). In the mockup the painted ground is one SVG (`viewBox="0 0 390 844"`) at [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) line ~673; the doghouse/Biscuit/butterfly/flowers/clouds are HTML layers above it.

1. **Sky** — the phone-frame background gradient (§6), blue at top to green at the horizon (~31% height).
2. **Clouds** — three drifting watercolor PNGs (§9.4).
3. **Sun** — radial-gradient glow, top-right ([`...final-week.html`](../../../preview-journey-hero-final-week.html) `.sun`, line ~71).
4. **Far hill** — wobble-edged green wash, the horizon shape (line 688).
5. **Meadow** — the main lawn gradient + mottles + uneven terrain dips/rises (§6, §8).
6. **Dirt path** — doghouse → bed, with scattered dirt particles (§6, §8).
7. **Garden bed** — soil ellipse + scattered dirt + the flower cluster scatter (§7).
8. **Ambient grass detail** — tufts, wildflowers, clover, pebbles, mushrooms (§8).
9. **Foreground grass tufts** — bottom-corner framing.
10. **Diegetic elements** — doghouse (with name sign + grounded shadow), Biscuit mascot (bobbing), butterfly (drifting + flapping), speech bubble (§9).
11. **Chrome** — status bar, header (dog chip + date), tab bar.

> **RN build note:** the mockup paints the ground with live SVG `feTurbulence` (the `#wob`/`#wob2` filters). **Do NOT ship live `feTurbulence` in RN** (perf). Bake the entire ground (sky/hill/meadow/path/bed wash + wobble) into ONE watercolor PNG asset; render flowers/details on top. (Same guidance as the original spec; see [`HANDOFF.md`](../../../HANDOFF.md) §7.5 art-debt notes.)

---

## 6. Palette — exact values (read from the mockup, cited)

All hexes below are the **current tuned values** in [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html). Cite the line if you change them.

| Element | Value | Mockup line |
| --- | --- | --- |
| **Sky→ground gradient** (phone bg) | `linear-gradient(180deg, #b3d9ed 0%, #bcdfef 33%, #b7d49d 42%, #aec59a 100%)` | line 62 |
| **Far hill** (horizon) | `#c2d9a3` @ opacity 0.97 | line 688 |
| **Meadow gradient** (`meadowGrad`) | `#cfe3b8 → #bfd6a9 → #b0c99b` | lines 675–679 |
| **Soil bed gradient** (`bedGrad`, radial) | `#b89164 → #9d7b54 → #876844` | lines ~680–684 |
| **Soil inner shading ellipse** | `#856641` @ opacity 0.42 | line 751 |
| **Dirt path fill** | `#c7a778` @ opacity 0.9 | line 714 |
| **Path stepping-stones** | `#8a6a45` | lines ~715–718 |
| **Doghouse contact shadow** | `rgba(46,32,18,0.32)` ellipse, fade to 0 @ 66% | line 883 |
| **Dirt particles** (bed + path) | browns `#5f4628 / #6b5031 / #7d5e3d / #9a7a4f / #b0905f / #806248` | grep `dirt` in file |

**Design notes (why these values):**
- **Distinct horizon (this session):** the old sky gradient had a near-white middle stop (`#e2ebdf`) that washed blue into green with no horizon. Holding a clearer blue to ~33% then transitioning directly to green (line 62) + a more saturated far hill (line 688) created a visible horizon. Keep that separation.
- **Soil + path** were tuned to a "lighter brown" the user liked, while keeping the path opaque enough (0.9) to stay clearly visible on the light-green grass.
- **Lighter green** lawn (the `meadowGrad` + hill values above) per user preference.

---

## 7. The garden bed — scatter + cluster mechanic (the core visual)

Reference implementation: the `scatterFlowers()` function in [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) lines ~1276–1325. **This is the algorithm to port to RN** (as pure, unit-tested helpers — see the plan, §15).

### 7.1 One log → a cluster of blooms
- Each daily log expands into **K blooms** of that day's mood color, K by tier:
  `BLOOMS_BY_TIER = { 1: 5, 2: 7, 3: 10 }` ([`...final-week.html:1279`](../../../preview-journey-hero-final-week.html)). **Tunable** — this is the "much fuller bed" value the user settled on. Range across a 7-day week: ~**21** (all quick logs) to ~**42** (all detailed); the demo's mixed/detailed week = **61** blooms (4×tier-3 + 3×tier-2).
- This keeps **one DB row per day** (§12) — the cluster is a **render-time expansion**, not extra data.
- "Rewarded for specifics": more detail → denser cluster.

### 7.2 Deterministic organic scatter (no day-slots)
- A seeded PRNG (`mulberry32`, fixed seed) places every bloom, so the layout is **random-looking but fixed forever** (no reshuffle on reload). In RN, seed per check-in id / per (dog, week). **No `Math.random()`** — it would break determinism. (The plan's `src/lib/gardenPlacement.ts` uses cyrb53 + the same approach.)
- **Inner bed ellipse:** `CX=192, CY=610, RX=160, RY=84` ([`...final-week.html:1294`](../../../preview-journey-hero-final-week.html)) — within the soil graphic, with margin.
- **`MIN_DIST = 15`** (line 1296) — tight; blooms overlap heavily for a packed, lush bed; placement falls back to last candidate after retries so all blooms render.
- **Depth:** blooms are sorted by Y and painted back-to-front so front flowers overlap back ones.
- **Bloom base sizes:** tier 3 = 48, tier 2 = 42, tier 1 = 36 px, with ±~10% per-bloom jitter ([`...final-week.html:1316`](../../../preview-journey-hero-final-week.html)). Tier scales **height/ornateness**, not width.

### 7.3 Stems connect to the ground
- The Gemini flower PNGs have transparent padding, so blooms "floated." Each bloom now renders a **stem** (a green gradient `#6f8a48 → #54703a`, height ≈ `px*0.62`) behind the bloom, rising from the soil into the flower base. Reference: the `renderFlower` img branch in [`...final-week.html`](../../../preview-journey-hero-final-week.html) line ~1188. (For RN, the eventual real flower art should include stems, or render a stem element.)

### 7.4 Dirt scatter
- The bed and path both carry scattered **dirt flecks** (varied browns/sizes) ringing and spilling onto the grass — gives a freshly-tended look. (User-requested; bed + path both done this session.)

---

## 8. Grass & ambient detail

All in the painted-ground SVG, behind the diegetic layers. The user explicitly asked to **keep all of these**.

- **Grass tufts** — hand-drawn curved blades in `#71875c / #7e9468 / #6f855a / #73895d`, scattered across the open lawn at varied heights (short + taller), kept **off** the path and bed. (~24 tufts across two detail passes.)
- **Uneven terrain** — low-opacity darker "dips" (`#7e9a6b`) and lighter "rises" (`#dcebca`) under the grass so the plain gently rolls instead of reading flat. Rendered **under** the path/bed so only open green shows it.
- **Wildflowers** — tiny 5-petal daisies (white `#fbfbf3` + yellow `#f4c430` center) plus purple `#c4b1e0` and pink `#eeb6c6` variants, sprinkled in the grass. Small enough not to compete with the bed.
- **Clover specks** — small green dots `#86a06e`.
- **Pebbles** — small grey-tan ellipses `#bdb4a4 / #b8af9e` with highlights, near the path.
- **Mushrooms** — cute spotted storybook mushrooms (coral cap `#d57a5c` + cream stem `#f3ead6` + white spots, plus a tan `#e3a36a` variant). User loved these — keep.

> All of the above are hand-drawn SVG in the mockup. For RN they can be **baked into the ground PNG**, or kept as a small set of static SVG/PNG detail sprites. The exact positions live in [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) (search `grass tuft`, `wildflower`, `mushroom`, `pebble`, `uneven terrain`).

---

## 9. Diegetic elements & assets

### 9.1 Doghouse — grounded
- Asset: [`assets/garden/puplog-doghouse.png`](../../../assets/garden/puplog-doghouse.png) (the scene-kit calibrator). The app overlays the dog's name on the blank sign.
- **Grounding fix (this session):** the PNG has ~8.3% transparent bottom padding (visible base at scene-y ≈370). The old shadow was a big, soft, light oval sitting *below* the base → "hovering." Now it's a **tight, darker contact shadow tucked at the base** (`rgba(46,32,18,0.32)`, line 883). Principle: **hard/close shadow = grounded; soft/far = floating.**

### 9.2 Biscuit mascot
- Placeholder corgi (SVG in mockup / [`src/components/onboarding/BiscuitMascot.tsx`](../../../src/components/onboarding/BiscuitMascot.tsx) in-app). Final mascot art is a **separate track**. Bobs gently (`@keyframes bob`).

### 9.3 Butterfly — flapping
- Small coral butterfly that **drifts** (the `flutter` keyframes) AND **flaps its wings**. Wing flap = SMIL `animateTransform` `type="scale"`, each wing pivoted at the body axis via a translated `<g>` (so wings hinge correctly), `values="1 1; 0.28 1; 1 1"`, `dur="0.4s"`. Reference: [`...final-week.html`](../../../preview-journey-hero-final-week.html) `<!-- Butterfly -->` (line ~790). **For RN this becomes a reanimated wing animation gated behind reduce-motion** (SMIL is mockup-only).

### 9.4 Clouds — real watercolor PNGs (this session)
- **Three distinct cloud assets**, transparent, in [`assets/garden/`](../../../assets/garden/):
  - [`puplog-cloud-1.png`](../../../assets/garden/puplog-cloud-1.png) — medium puff (460×248).
  - [`puplog-cloud-2.png`](../../../assets/garden/puplog-cloud-2.png) — wide wispy streak (600×161).
  - [`puplog-cloud-3.png`](../../../assets/garden/puplog-cloud-3.png) — small compact puff (380×268).
- Wired as three `.cloud` divs, each its own size/height/speed/opacity/phase ([`...final-week.html`](../../../preview-journey-hero-final-week.html) lines 90–92):
  - `c1`: top 84, width 122, dur 75s, delay −30s
  - `c2`: top 152, width 152, opacity 0.6, dur 120s, delay −75s
  - `c3`: top 112, width 74, opacity 0.72, dur 96s, delay −20s
  - `@keyframes drift { translateX(0) → translateX(560px) }` (line 93). **Negative `animation-delay`** spreads them across the sky from the first frame; widths chosen so they're fully off-screen at both ends → no loop "pop."
- **Asset prep done:** the user's Figma exports were keyed-transparent but 2048px/1.5 MB; trimmed transparent margins + downscaled via PIL (cloud-1 460px/137 KB, cloud-2 600px/93 KB, cloud-3 380px/111 KB). See §14 for the reusable PIL recipe.

---

## 10. Animation spec (for the RN build)

- **All idle loops use reanimated `withTiming` only** (no springs — user preference), gated behind **`useReducedMotion()`**, and **paused when the tab is unfocused** (`useIsFocused()`) so they don't run off-screen (FPS). (Sources: original spec §6.4; [`HANDOFF.md`](../../../HANDOFF.md) §7.7.)
- **Plant celebration** ≈ 1000ms, ~1.02–1.16× overshoot settling to tier height, reduce-motion-safe.
- **Per-flower sway:** in the mockup, every bloom sways at one shared 4.8s/±1.4° rhythm with a randomized *phase* (random `animation-delay`) — not in unison, but one speed/amplitude. **For a more natural breeze, randomize per-flower duration + amplitude + direction** (seeded) in RN. (User asked about this; recommended improvement.)
- **Clouds** drift; **butterfly** drifts + flaps; **Biscuit** bobs.
- The agent env **cannot observe motion** (preview tab is backgrounded → all animation pauses). Verify motion by scrubbing the timeline (WAAPI `getAnimations()[0].currentTime` / SVG `setCurrentTime`) or trust the code; final QA is the user on a foreground tab / device.

---

## 11. The flower → mood/tier mechanic

**Source of truth:** [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md) (project root). Port `tier()` as a pure, TDD'd helper (`src/lib/flowerTier.ts` — already specced in the plan).

### 11.1 The 8 garden moods (color = mood)
| Mood | Hex | Color name | | Mood | Hex | Color name |
| --- | --- | --- | --- | --- | --- | --- |
| joyful | `#F4C430` | Sunny Yellow | | tired | `#C8B4D8` | Soft Lavender |
| playful | `#FF8C61` | Coral Orange | | anxious | `#A89AA8` | Muted Plum |
| affectionate | `#F4A6B8` | Rose Pink | | unwell | `#C5CDD2` | Pale Ash Blue |
| calm | `#A8C9A0` | Sage Green | | curious | `#9BB5DD` | Periwinkle Blue |

Hard moods keep dignity: anxious = a tight bud, unwell = a delicate snowdrop — never a wilt. (Source: [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md) §2.) All 24 flower PNGs (`puplog-flower-[mood]-tier[1-3].png`) exist in [`assets/garden/flowers/`](../../../assets/garden/flowers/) (white-bg sources; RN needs transparent + downscaled exports — [`HANDOFF.md`](../../../HANDOFF.md) §7.5).

### 11.2 The tier rule (first match wins)
```
tier 0  → no mood picked            → sprout placeholder
tier 1  → mood only                 → simple bloom
tier 2  → mood + ≥1 health chip     → fuller bloom
tier 3  → mood + a photo/video/note → full bloom   (evidence beats breadth)
```
Verbatim helper is in [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md) §1. **Note:** the ported helper must include a **video** term (`hasVideo`/`hasMedia`) — the original mockup `tier()` had no video branch; the plan's `computeFlowerTier` already adds it. The cluster **density** (§7.1) is the new layer on top of tier.

### 11.3 Log bottom-sheet (the interactive flow)
Reference UX: [`preview-journey-hero-option-a-v2.html`](../../../preview-journey-hero-option-a-v2.html) sheet. Progressive: **mood → health chips → specifics (note/photo/video) → live tier preview → plant**. **Fix to carry into RN:** the v2 mockup gates "Specifics" behind a symptom chip, which makes the photo/note-only → Tier 3 path unreachable; **Specifics must unlock after MOOD**, not after a chip. "All normal" chip is exclusive and counts toward Tier 2. (Already captured in the plan's `LogSheet` task.)

---

## 12. Data model — ⚠️ DECISION GATE (resolve before building the data layer)

This is the most important engineering finding. **Verified against the live DB this session via the Supabase MCP** (`execute_sql` on `information_schema.columns`).

### 12.1 The blocker
A "quick" mood-only garden log **cannot be a `daily_check_ins` row.** The 7 clinical metric columns are **NOT NULL with no defaults**: `appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood` (verified). Also `additional_symptoms` is `jsonb NOT NULL default '[]'` holding the **clinical** `AdditionalSymptom` enum (`coughing/sneezing/...` — see [`src/types/checkIn.ts:11`](../../../src/types/checkIn.ts)), NOT the garden's simple chips. So you cannot insert a garden log with only a mood.

### 12.2 Garden mood ≠ clinical mood (safety-relevant)
The garden's 8 moods are **distinct** from the clinical `mood` enum `normal/quiet/anxious/clingy/hiding/aggressive` ([`src/types/checkIn.ts:9`](../../../src/types/checkIn.ts)) — only `anxious` overlaps. **Do NOT remap or overwrite clinical mood**, because it feeds safety logic:
- `sudden_aggression` fires on `mood === 'aggressive'` — [`src/lib/patternRules.ts:138`](../../../src/lib/patternRules.ts) (single-day, always-fires rule; the garden moods have no `aggressive`).
- `classifyMood` (anxious/hiding/aggressive = "significant") feeds multiple rules — [`src/lib/patternRules.ts:66`](../../../src/lib/patternRules.ts).
- AI baseline `typical_mood: 'normal'|'anxious'|'quiet'` — [`src/types/api.ts:80`](../../../src/types/api.ts).
- `generateDaySummary` — [`src/lib/daySummary.ts:81`](../../../src/lib/daySummary.ts).

### 12.3 The decision (RECOMMENDED — confirm with the user)
**Create a new `garden_logs` table** that the garden owns:
- `UNIQUE(dog_id, log_date)` → one log per dog per day (data integrity preserved; cluster is render-only).
- `garden_mood text` (one of the 8 — **single source of truth = a TS const `GARDEN_MOODS`, NO duplicated Postgres `CHECK`**, per the user's standing rule; memory `feedback_no_duplicate_enums_db_and_code.md`).
- columns for the tier inputs (health chips, note, photo/video flags).
- This **decouples** the garden from the **deferred clinical-flow redesign** entirely — the garden ships without waiting on it.

**Rejected alternatives** (document, don't silently pick): (a) make the 7 clinical columns nullable — high blast radius, breaks pattern detection/day-summary/consistency which assume full rows; (b) garden co-creates a full clinical check-in — kills the quick one-tap UX. Use `supabase-postgres-best-practices` before writing the migration.

### 12.4 Golden-Rule note (carry into the clinical redesign)
Emergency keyword detection currently runs **only on `free_text`** — [`src/stores/checkInStore.ts:254`](../../../src/stores/checkInStore.ts) (`emergency_flagged: draft.free_text ? detectEmergencyKeywords(draft.free_text).isEmergency : false`). In the garden flow the note is optional, so keyword detection is dark for note-less logs. The **always-on Emergency surface** (§13) is the primary net; do not let the simplified flow shrink the keyword surface without a compensating control.

> **Impact on the plan:** [`docs/superpowers/plans/2026-06-20-journey-tab-hero.md`](../plans/2026-06-20-journey-tab-hero.md) Tasks 5, 7, 11 assumed an additive `garden_mood` column on `daily_check_ins`; §12.1 invalidates that for mood-only logs. **Revise those tasks to the `garden_logs` model** once the user ratifies. Tasks 1–4, 6, 8 (pure logic + presentational, data-source-agnostic) are unaffected and ready to build.

---

## 13. Golden Rule & safety (never violate)

> **Never let a dog owner walk away from a genuine emergency thinking they can wait.** ([`CLAUDE.md`](../../../CLAUDE.md) "The Golden Rule".)

- Keep an **always-on Emergency affordance** on the Journey screen and inside the log sheet (routes to [`app/emergency.tsx`](../../../app/emergency.tsx)). (Plan: `EmergencyChip` + sheet link.)
- Urgency "monitor" = teal `#00897B`, **never green** — garden greens must stay clearly distinct from urgency colors.
- Editing a day's entry must **re-run** emergency-keyword detection + pattern/AI analysis (§12.4).
- The 5 legal components in [`src/components/legal/`](../../../src/components/legal/) are required wherever triage results appear — don't touch them. Use `accessibility-compliance` for every new surface (WCAG AA: 44–48dp targets, roles/labels, shape+color not color-alone, compute contrast before shipping a pairing).

---

## 14. Asset pipeline (Gemini + PIL)

### 14.1 Prompt guides (the house style — reuse verbatim)
- **Scene kit:** [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md) (project root) — doghouse (calibrator), mound, sprout, grass tuft, butterfly. Contains the **base style block** to paste at the top of any new asset prompt.
- **Flowers:** `~/Downloads/puplog_flower_prompts_v2 (1).md` (the 24-flower guide; ⚠️ lives in Downloads, not the repo — ask the user to relocate/commit it).
- **Tier logic:** [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md).
- **Stickers:** `~/Downloads/puplog_sticker_prompts_v2.md`.

### 14.2 Clouds — the prompts used (this session)
Clouds **must not** use the kit's pure-white background (white cloud on white = can't key out). Generate on a **flat blue** key color and remove *that*. The three cloud prompts are recorded below for reproducibility (style-lock by uploading `puplog-cloud-1.png` + the doghouse as reference images):

- **`puplog-cloud-1.png`** (medium puff), **`-cloud-2.png`** (long wispy streak — *"a long, low, wispy cloud of two or three stretched billows, much wider than tall, thinning to feathery wisps at the ends"*), **`-cloud-3.png`** (small compact puff — *"one plump rounded puff, roughly as tall as it is wide"*).
- Shared frame: *"Soft watercolor illustration in a children's storybook style … NOT photo-realistic, NOT 3D … warm off-white (hex #FBFCFE) cloud body with delicate pale blue-grey shading (hex #D3E0EA) under the billows, a barely-there cooler outline … Background: a flat, even, solid medium sky-blue (hex #8FC3E6) filling the frame — exists only so the white cloud can be cleanly masked out; keep it clearly more saturated than the cloud's pale shading."*

> **TODO for the next session:** add a **"Clouds" section to [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md)** with these three prompts, so the cloud recipe lives with the rest of the kit. (User-approved direction; not yet done.) Use the doghouse no-nameplate / squint-test conventions already in that guide.

### 14.3 Reusable PIL recipe (`python3` + PIL available locally — [`HANDOFF.md`](../../../HANDOFF.md) §5A.3)
After the user keys out a background in Figma, trim transparent margins + downscale:
```python
from PIL import Image
def prep(path, target_w, margin=14):
    im = Image.open(path).convert('RGBA')
    l,t,r,b = im.getchannel('A').getbbox()           # tight bounds of non-transparent pixels
    l=max(0,l-margin); t=max(0,t-margin); r=min(im.width,r+margin); b=min(im.height,b+margin)
    im = im.crop((l,t,r,b))
    im = im.resize((target_w, round(im.height*target_w/im.width)), Image.LANCZOS)
    im.save(path)
```
Also verify transparency (corner pixels `(0,0,0,0)`) and check for stray artifacts (e.g., generation sparkles) before wiring. **Don't hand-beautify the art** — background removal + downscale is the only allowed post-processing (memory `feedback_sticker_artwork_is_drop_in.md`).

### 14.4 Asset intake loop
When the user drops art: **`ls` the actual folder** (don't trust mtime/Spotlight — moves preserve mtime, [`HANDOFF.md`](../../../HANDOFF.md) H7), verify transparency/dimensions, trim+downscale, drop into [`assets/garden/`](../../../assets/garden/) (flowers → `assets/garden/flowers/`), hard-refresh the mockup. The mockup auto-loads `assets/garden/<file>` and de-whites flowers at runtime — **clouds are plain `<img>`s and are NOT de-whited** (correct; they're already transparent).

---

## 15. Implementation pointers

- **Plan:** [`docs/superpowers/plans/2026-06-20-journey-tab-hero.md`](../plans/2026-06-20-journey-tab-hero.md) — bite-sized TDD tasks. Pure-logic tasks (mood constants, `computeFlowerTier`, seeded `gardenPlacement`, `buildGardenWeek`, static `FLOWER_ASSETS` require-map) are **ready and data-source-agnostic**. Data-layer tasks need the §12 `garden_logs` revision. Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
- **Target screen:** rewrite [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx) as the garden hero; tab already labeled "Journey" ([`FloatingTabBar.tsx:21`](../../../src/components/ui/FloatingTabBar.tsx)).
- **Metro constraint:** flower/scene art = a **static `require()` asset map** `FLOWER_ASSETS[mood][tier]` — Metro **cannot** do template-literal requires (memory `feedback_rn_metro_static_require.md`).
- **Tokens:** `OB_*` from [`src/constants/onboardingTheme.ts`](../../../src/constants/onboardingTheme.ts); scene colors from §6. Ink-on-coral CTAs (re-check whether the coral-CTA fix PR merged at session start — [`HANDOFF.md`](../../../HANDOFF.md) §6).
- **Reuse:** if [`src/lib/weekGrouping.ts`](../../../src/lib/weekGrouping.ts) exists (ships with My Dogs PR #23), reuse its `getWeekStart`/`addDaysStr` instead of duplicating (DRY).
- **Test baseline:** verify the current `npm test` count + the filtered `tsc` baseline at session start ([`HANDOFF.md`](../../../HANDOFF.md) §12) before claiming green.

---

## 16. Open decisions / gates carried forward

1. **DATA MODEL (§12)** — ratify `garden_logs` before building the data layer. **Blocking.**
2. **Cluster density floor** — `{1:5,2:7,3:10}` is current; confirm or tune (does an all-quick week fill enough?).
3. **Photo/video storage** — needs a storage bucket + picker; `computeFlowerTier` already accepts `hasPhoto`/`hasVideo`. Deferrable; Tier 3 reachable by **note** in v1.
4. **Clinical-flow redesign** — separate brainstorm/spec; preserve pattern detection / AI / emergency-keyword feeds (§12.4).
5. **Greeting source** — static end-of-week line in the mockup; decide deterministic-from-moods vs AI (must never imply diagnosis).
6. **Weekly reset → keepsake hand-off** to the My Dogs `WeekLookBack` — interlocks with PR #23; own task.
7. **Port the final-week look into [`preview-journey-hero-option-a-v2.html`](../../../preview-journey-hero-option-a-v2.html)** (clouds, palette, grass detail, scatter+cluster, grounded house) so the interactive mockup matches.
8. **Add the cloud prompts to the scene-kit guide** (§14.2 TODO).
9. **Final mascot art** (Biscuit) — separate track.

---

## 17. SKILLS — MANDATORY (read again — this is load-bearing)

**Per the user's explicit, repeated instruction and [`CLAUDE.md`](../../../CLAUDE.md) + [`HANDOFF.md`](../../../HANDOFF.md) §14: every Claude instance working on this MUST use skills. Three avenues, in order:**

### 17.1 Use the skills we already have
Invoke the relevant skill **before** acting (not after).

| Skill | Use it for |
| --- | --- |
| `superpowers:brainstorming` | **Before any design/feature work** — even though direction is locked, brainstorm-lite before the spec/plan refresh. |
| `superpowers:writing-plans` | Turning this spec into a task-by-task TDD plan (refresh the existing plan for `garden_logs`). |
| `superpowers:test-driven-development` | Every helper/store (write the failing test first). |
| `superpowers:subagent-driven-development` / `executing-plans` | Executing the plan (fresh implementer per task + two-stage review — drove the My Dogs build well). |
| `superpowers:using-git-worktrees` | Every feature (branch off `origin/main`). |
| `superpowers:verification-before-completion` | **Before claiming anything done** — show test/typecheck output. |
| `superpowers:systematic-debugging` | Any bug — root-cause before fixing. |
| `superpowers:requesting-code-review` / `receiving-code-review` / `finishing-a-development-branch` | Reviews + merge. |
| `supabase-postgres-best-practices` | The `garden_logs` migration, RLS, indexes (§12). |
| `supabase-edge-functions` | Any Edge Function work. |
| `react-native-architecture` + `react-native-best-practices` | The garden screen, navigation, the reanimated animations + FPS (§10). |
| `accessibility-compliance` | **Every new surface** — WCAG AA (§13). |
| `anthropic-sdk` | Any AI feature (greeting, Discovery). |
| `find-skills` | Searching the ecosystem for new skills. |

### 17.2 Create a new skill when a workflow recurs
Use `superpowers:writing-skills` or `anthropic-skills:skill-creator`. Standing candidates (from [`HANDOFF.md`](../../../HANDOFF.md) §14, several already recurred this session):
- **"gemini-asset-intake"** — identify dropped art → map to canonical slot names → verify (the §14.4 loop).
- **"puplog-mockup-conventions"** — the phone-frame / scrapbook-token / asset-slot HTML mockup recipe.
- **"raster-asset-to-rn"** — the §14.3 PIL pipeline (measure regions by pixel-scan → ratio constants / nine-patch slices → composite-preview before the RN build).
- **"market-research-design-pass"** — the 3-agent research → binding visual-addendum workflow.

### 17.3 Go find a skill online
When you hit an unfamiliar domain (e.g. RN flower-planting/growth animation), **search the market first**:
```bash
npx skills find "<query>"                 # search the ecosystem
npx skills add <owner/repo@skill> -g -y   # install (global)
```
Browse **https://skills.sh/trending**. **Only install reputable, well-reviewed, reliable skills** — prefer ones with strong install counts / reviews that you're confident will work. Verify before trusting. (For the upcoming reanimated work, look for a vetted animation skill before hand-rolling.)

**Bottom line: do not start domain work without checking for a skill. Use one, make one, or find one — always.**

---

## 18. Full reference index

**Mockups (project root, untracked on laptop):**
- ⭐ [`preview-journey-hero-final-week.html`](../../../preview-journey-hero-final-week.html) — visual source of truth.
- [`preview-journey-hero-option-a-v2.html`](../../../preview-journey-hero-option-a-v2.html) — interactive log-sheet flow (stale styling).
- `preview-journey-hero-option-a-front-yard.html`, `...-option-b-gardeners-journal.html`, `...-option-c-biscuits-walk.html` — pitch options (superseded).
- Mockup server: [`.claude/launch.json`](../../../.claude/launch.json) (`mockup-preview`, :8088).

**Assets ([`assets/garden/`](../../../assets/garden/)):**
- Clouds: `puplog-cloud-1.png` (460×248), `puplog-cloud-2.png` (600×161), `puplog-cloud-3.png` (380×268).
- Scene: `puplog-doghouse.png`. (`puplog-mound.png`, `puplog-sprout.png` not yet generated — see [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md).)
- 24 flowers: `assets/garden/flowers/puplog-flower-[mood]-tier[1-3].png` (white-bg; need transparent + downscaled exports for RN).
- Slot map: [`assets/garden/README.md`](../../../assets/garden/README.md).

**Docs & prompt guides:**
- This spec; prior spec [`docs/superpowers/specs/2026-06-20-journey-tab-hero-design.md`](2026-06-20-journey-tab-hero-design.md); plan [`docs/superpowers/plans/2026-06-20-journey-tab-hero.md`](../plans/2026-06-20-journey-tab-hero.md).
- [`puplog_garden_scene_prompts.md`](../../../puplog_garden_scene_prompts.md), [`puplog_flower_tier_logic.md`](../../../puplog_flower_tier_logic.md).
- `~/Downloads/puplog_flower_prompts_v2 (1).md`, `~/Downloads/puplog_sticker_prompts_v2.md` (⚠️ in Downloads — ask user to commit).
- [`CLAUDE.md`](../../../CLAUDE.md), [`DOCUMENTATION.md`](../../../DOCUMENTATION.md), [`HANDOFF.md`](../../../HANDOFF.md).

**Key code references:**
- Tab bar: [`src/components/ui/FloatingTabBar.tsx`](../../../src/components/ui/FloatingTabBar.tsx).
- Target screen: [`app/(tabs)/index.tsx`](../../../app/(tabs)/index.tsx).
- Clinical types (mood/symptom enums): [`src/types/checkIn.ts`](../../../src/types/checkIn.ts).
- Pattern rules (safety): [`src/lib/patternRules.ts`](../../../src/lib/patternRules.ts).
- Day summary: [`src/lib/daySummary.ts`](../../../src/lib/daySummary.ts).
- AI baseline types: [`src/types/api.ts`](../../../src/types/api.ts).
- Check-in store (emergency flag, persist pattern): [`src/stores/checkInStore.ts`](../../../src/stores/checkInStore.ts).
- Scrapbook tokens: [`src/constants/onboardingTheme.ts`](../../../src/constants/onboardingTheme.ts).
- Emergency screen: [`app/emergency.tsx`](../../../app/emergency.tsx); legal components: [`src/components/legal/`](../../../src/components/legal/).

**Repos / services:**
- GitHub (active): `https://github.com/RohitS199/dog-app-v2.git` (remote `origin`).
- Supabase: `https://wwuwosuysoxihtbykwgh.supabase.co`.
- Skills marketplace: `https://skills.sh/trending`.

**Git situation (important):** [`HANDOFF.md`](../../../HANDOFF.md) is the live source. The Journey work (mockups, `assets/garden/`, prompt guides, this spec) is **untracked on the laptop** — a fresh clone has none of it; one `git clean -fd` deletes it ([`HANDOFF.md`](../../../HANDOFF.md) H10). Before another machine can use this: commit & push (recommended split: docs + mockups + small assets as one commit; the large flower/cloud PNGs as a deliberate decision — plain commit vs Git LFS vs out-of-git transfer). **Always `cp .env` into any new worktree** or the app won't boot.

---

*End of spec. Re-read §0 and §17: use skills — existing, new, or found online — always.*
