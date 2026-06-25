# PupLog — Journey Tab Hero ("Garden Path") — Design Spec

**Date:** 2026-06-20
**Status:** Design APPROVED (visual direction + flower/tier logic locked). Ready for implementation planning (`superpowers:writing-plans`).
**Author:** Claude (Opus 4.8) with the project owner (RAS), via `superpowers:brainstorming` + a multi-agent design-exploration pass (see §2.3). Verified by a 4-critic adversarial review on 2026-06-20 (paths, gaps, fidelity, RN/skills) — fixes applied inline.
**Feature:** The hero/home screen of the **Journey** tab — a per-dog watercolor garden that grows one flower per daily health log.
**Supersedes (for garden layout only):** the organic-arc garden in `preview-journey-hero-option-a-v2.html`. That mockup is still the reference for the *log bottom-sheet* and *scene/watercolor rendering technique* (see §4.7, §5).

> ⚠️ **HANDOFF.md is renumbered frequently.** Section numbers below were re-synced to `HANDOFF.md` on 2026-06-20 (Golden Rule §3, My Dogs §5, Coral-CTA §6, Journey §7, Avatar §8, Onboarding §9, Backlog §10, Product decisions §11, Conventions §12, Hazards §13, Skills §14, Key files §15). If a `HANDOFF.md §N` pointer below misses, re-grep `^## ` in `HANDOFF.md` and match by the section *title* given alongside.

---

## 0. READ THIS FIRST

### 0.1 ⚠️ MANDATORY: USE SKILLS — every session, no exceptions

This is a standing instruction from the project owner and it is **non-negotiable**. Before doing work in any domain, and throughout:

1. **Use the skills already installed.** For this feature you will need, at minimum:
   - `superpowers:brainstorming` → `superpowers:writing-plans` → `superpowers:test-driven-development` → `superpowers:requesting-code-review` → `superpowers:finishing-a-development-branch` (the core dev pipeline)
   - `superpowers:verification-before-completion` (always — show test/typecheck output before claiming done)
   - `superpowers:using-git-worktrees` (laptop feature work — see §7.1)
   - `react-native-architecture` and `react-native-best-practices` (the screen build + perf)
   - `accessibility-compliance` (WCAG AA on every new surface — §6.5)
   - `supabase-postgres-best-practices` (the `mood` column / data-model change — §6.1)
   - `supabase-edge-functions` (only if you touch pattern/AI functions — §6.3)
2. **Create new skills** when a workflow recurs. Use `superpowers:writing-skills` or `anthropic-skills:skill-creator`. Two candidates flagged in `HANDOFF.md` §14 ("Skills"): a "gemini-asset-intake" skill (identify dropped art → canonical name → verify) and a "puplog-mockup-conventions" skill.
3. **Find and install vetted skills from the marketplace** when a domain is unfamiliar:
   ```bash
   npx skills find "<query>"                 # search the ecosystem
   npx skills add <owner/repo@skill> -g -y   # install (prefer 1K+ installs, good reviews, proven reliable)
   ```
   Browse https://skills.sh/trending. For the upcoming reanimated flower/plant animation, check for a reanimated/animation skill before hand-rolling.

> If a skill plausibly applies (even 1%), invoke it. This rule overrides default behavior. Source: `~/.claude` Superpowers `using-superpowers` skill + project `CLAUDE.md` "Skills — Always Use" + `HANDOFF.md` §14 ("Skills — use them, find them, make them").

### 0.2 What is locked vs open

- **LOCKED:** the hero is the "Garden Path" composition (§4); flower color = mood, complexity = log detail tier (§5, per `puplog_flower_tier_logic.md`); weekly Mon–Sun cycle; clean watercolor; flat-on projection; no streaks; clinical logging is OPTIONAL (mood-only is a valid Tier-1 log).
- **OPEN / DEFERRED:** the clinical-question flow itself (a separate later redesign — §6.2), plus the minor TBDs in §9.

### 0.3 How to use this document

Read it top to bottom, then read `CLAUDE.md`, `HANDOFF.md`, `puplog_flower_tier_logic.md`, and the files in §10. Then resume at §8 (Next steps). Every path, repo, and external claim is cited inline or in §10.

---

## 1. Project context (where this fits)

| Field | Value | Source |
|---|---|---|
| Product | PupLog — React Native (Expo) app for **educational** dog-health guidance. **NOT veterinary medicine** (legally load-bearing). | `CLAUDE.md` "What This Is" |
| Active repo | `https://github.com/RohitS199/dog-app-v2.git` (remote `origin`) | `CLAUDE.md` "Repository"; `HANDOFF.md` §2 |
| Archived repo (do NOT push) | `https://github.com/RohitS199/dog-app-ui.git` | `HANDOFF.md` §2 |
| Landing page repo | `https://github.com/RohitS199/PupLog-landing-page.git` | `HANDOFF.md` §2 |
| Supabase project | `https://wwuwosuysoxihtbykwgh.supabase.co` | `CLAUDE.md` "Backend" |
| `origin/main` HEAD | `ebed28c` (laptop local `main` = `ac1070c`, deliberately diverged — **never pull local main**; branch off `origin/main`) | `HANDOFF.md` §4 |
| In-flight (not this work) | PR #23 (My Dogs tab) + PR #24 (coral-CTA a11y) are open & MERGEABLE, awaiting QA; uncommitted dog-portrait-frame work sits on the `.worktrees/my-dogs-tab` worktree | `HANDOFF.md` §0, §5, §5A, §6 |
| Tech stack | Expo SDK 54, RN 0.81 (New Arch), TypeScript strict, Expo Router v6, Zustand v5, reanimated v4, react-native-svg, Jest 29 + RNTL | `CLAUDE.md` "Tech Stack" |
| Tests at origin | 522 passing / 56 suites (the "279/22" in `CLAUDE.md` is stale; My Dogs branch shows higher) | `HANDOFF.md` §2 |

**Where the Journey hero sits in the IA:** the 4-tab bar is Journey / My Dogs / Discovery / Profile, already relabeled in `src/components/ui/FloatingTabBar.tsx` (`index`→"Journey", `health`→"My Dogs", `learn`→"Discovery", `profile`→"Profile"), verified in-file. The Journey tab screen is `app/(tabs)/index.tsx` (currently the legacy home). Source: `src/components/ui/FloatingTabBar.tsx`; `HANDOFF.md` §7 ("Journey Hero Workstream"). Note: "My Dogs" now renders the shipped PR #23 hub on the scrapbook system (no longer the old Health calendar) — but PR #23 is not yet merged to `origin/main`.

---

## 2. The feature, in one paragraph

The **Journey tab** opens onto a full-screen, full-bleed watercolor **front yard**: a green lawn, a light-brown path leading up to a doghouse, and two soil flower-beds. Each day the owner logs how their dog is doing; **one log plants one flower** in that dog's garden. The flower's **color encodes the dog's mood** that day (8 moods); the flower's **complexity/tier encodes how detailed the log was** ("rewarded for specifics"). The garden runs **weekly** (Mon–Sun); at week's end it is "pressed" into a keepsake for the My Dogs tab and a fresh bed begins. There are **no streaks and no guilt** — a missed day is just bare soil. An **Emergency** affordance is always one tap away (the app's Golden Rule).

### 2.1 The Golden Rule (never violate)

> **Never let a dog owner walk away from a genuine emergency thinking they can wait.**

Implication for this screen: an always-on "Emergency" surface stays one tap from the resting hero, never gated behind the log flow (§4.6). Source: `CLAUDE.md` "The Golden Rule"; `HANDOFF.md` §3.

### 2.2 Product decisions inherited (do not re-litigate)

- **No streaks, ever** — flowers + stickers replace them; missed days are neutral. Source: `HANDOFF.md` §11 ("Product-direction decisions"); memory `project_no_streaks.md`.
- **Flower system is canonical:** color = mood (8), complexity = log-detail tier (3); per-dog; weekly cycles; hard moods rendered with dignity. Source: `HANDOFF.md` §11; memory `project_flower_garden_system.md`.
- **Profile shows account-level stickers only; My Dogs gets per-dog history; Journey is the live garden.** Source: `HANDOFF.md` §11.
- **Triage is on ice** (April 2026) — not part of this work. Source: `HANDOFF.md` §11; memory `project_triage_on_ice.md`.

### 2.3 How this design was reached (provenance)

1. Doghouse art generated; nameplate feature dropped (owner decision — keep a simple house, the dog's name lives in the header chip, not on the house). NOTE: the canonical art guidance has not yet caught up — see §4.4/§6.6.
2. Style locked: **flat-on** projection (not 3/4/isometric) and **clean controlled watercolor** (soft washes, crisp ink outlines, not muddy) — chosen so the 24 existing flowers + doghouse need no rework and to match the cozy-game canon (esp. Cozy Grove).
3. A multi-agent design pass (4 concept designers → 3-judge panel [delight / usability / RN-feasibility] → synthesizer) recommended a "Front Yard Row" hybrid. Owner then steered to a more organic **garden** with a **path + two soil beds** (this spec's §4). Market-research directives from that pass are in §3.2.

---

## 3. Principles & research directives

### 3.1 Locked design principles

- **Flat-on, clean watercolor.** No perspective/isometric tricks; soft washes with clear shapes and crisp ink outlines; never messy/blotchy. (Owner decision; matches `puplog_garden_scene_prompts.md` house style.)
- **The garden IS the hero** — full-bleed, first thing seen, let it breathe. ONE star; supporting UI is deferential.
- **Additive only.** A flower only ever appears. Nothing greys, wilts, or downgrades for inaction. Bare soil/empty beds = "potential not yet used," never failure.
- **Deterministic + art-directed placement.** Each flower gets a *fixed, seeded* home the moment it is planted and never moves on reload. Placement is jittered within the bed rectangles, collision-checked and balanced — "sporadic," never random clutter (this is what keeps it "clean, not messy"). Geometry contract in §4.2.
- **Two reward scales:** a ~1000ms bloom celebration at the moment of logging (micro), and the full week's filled beds as a screenshot-worthy artifact (macro).
- **Reward depth visibly.** A more detailed log grows a richer flower (more petals/ornateness) — see §5.

### 3.2 Market-research directives (competitive analysis)

From a research pass over Finch, Forest, Cozy Grove, Animal Crossing, Pikmin Bloom, Daylio, How We Feel, Apple Fitness rings. Key takeaways baked into this design:

- **The metaphor is the navigation; the visual is the data** — garden readable as data without numbers. (Forest, ACNH, Cozy Grove, Pikmin Bloom)
- **Celebrate the artifact, not the streak.** (Duolingo's streak-guilt is the explicit anti-pattern we reject.)
- **Additive only on inaction.** (Pikmin Bloom's flower trail never subtracts.)
- **Micro-reward at completion, macro-reward in the retrospective view.** (Habitica coin-fly + Daylio year-in-pixels)
- **Depth of engagement = visible richness.** (How We Feel rewards nuanced entries with bespoke illustration.)
- **Never reset mid-cycle.** Cozy Grove's fatal flaw was daily re-graying ("Groundhog Day"). Our garden resets ONLY on Monday, framed as a gift.

Cited sources (re-verify): [Cozy Grove review](https://www.nintendolife.com/reviews/switch-eshop/cozy_grove) (aesthetic twin: watercolor + ink + paper), [Finch design critique](https://ixd.prattsi.org/2025/09/design-critique-finch-ios-app-2/) (clutter is its weakness — keep our hero calm), [Forest gamification case study](https://trophy.so/blog/forest-gamification-case-study), [Duolingo streak dark patterns](https://opinionsandconditions.substack.com/p/duolingo-owl-dark-patterns-digital-guilt), [Pikmin Bloom flower planting](https://www.pikminwiki.com/Flower_planting), [Daylio "Year in Pixels"](https://moodflow.co/blog/year-in-pixels-the-color-coded-secret-to-your-personal-growth-in-2026), [Apple Activity Rings HIG](https://developer.apple.com/design/human-interface-guidelines/activity-rings).

---

## 4. Visual design — the "Garden Path" hero

A single, **non-scrolling** 390×844pt viewport (iPhone). The only vertical motion is the log bottom-sheet sliding up over the fixed scene. All UI chrome uses the **scrapbook** tokens in `src/constants/onboardingTheme.ts` (§4.8). Scene illustration colors are hardcoded watercolor hex (physical-color scene), not theme tokens.

> The authoritative visual reference for this layout is the in-session mockup titled `journey_hero_path_and_soil_beds`. **It currently exists only as an ephemeral chat widget — it is NOT a file.** Building a persisted `preview-journey-hero-garden-path.html` (reusing the scene/watercolor techniques in `preview-journey-hero-option-a-v2.html`) is a recommended first task (§8, item 1).

### 4.1 Vertical bands (top → bottom, approx % of 844pt)

| Band | Contains | ~% |
|---|---|---|
| Status bar | iOS status bar over painted sky (no opaque bar) | 5 |
| Header | LEFT: cream "dog chip" switcher (peach avatar + dog name "Luna" + caret, 2px sketch border, 4pt solid bottom shadow). RIGHT: always-on **Emergency** chip (red `#c75f4a` text + alert glyph). | 7 |
| Greeting | One handwritten (Caveat) line naming the week's feel, e.g. "Luna's garden this week —" / "A gentle, playful week so far —". | 7 |
| Scene | Watercolor sky → far hill → sun + drifting cloud → **doghouse** at the head of the path (flat-on, no nameplate, bone-on-gable). | ~16 (overlaps garden) |
| Garden (hero) | Green lawn; **light-brown path** running up the middle from the foreground to the doghouse door; **two imperfect-rectangle soil beds** flanking the path where flowers grow; grass everywhere else. | ~30 |
| Foreground | Grass band; **Biscuit** (corgi mascot, ambient — currently a geometric placeholder, see below) sits here; small grass tufts at the very bottom edges. | ~5 |
| Primary CTA | Full-width coral (`#F4845F`) pill, ~52pt, **ink `#2a221c` label** (NOT white — see §4.5) "Plant Luna's flower for today", 4pt solid bottom shadow that collapses on press. | 8 |
| Tab bar | Floating cream scrapbook tab bar: Journey (active, sage `#e3ead9` fill + `#475E3D`), My Dogs, Discovery, Profile. | 13 |

> **Biscuit is a placeholder.** `src/components/onboarding/BiscuitMascot.tsx` is a geometric stand-in (rounded shapes + ears in `OB_COLORS`), NOT a finished corgi. The ambient corgi is final-art-pending via the same Gemini pipeline as the doghouse/flowers (§6.6). Do not wire a non-existent corgi asset.

### 4.2 The garden (the differentiator)

- **Lawn:** green base (mockup used `#bcd2a3`) filling the lower scene.
- **Path:** a flat-on **light-brown** walkway (mockup used `#d4b88f`, edge `#c2a274`) from the doghouse door down the center to the foreground, with a slight organic taper/curve and optional lighter stepping-stone hints. NOT a perspective path — a painted flat shape.
- **Two soil beds:** "imperfect rectangle" watercolor soil shapes (wobbly edges) flanking the path, left and right, running from below the house to the foreground (mockup soil `#b68f66`, outline `#8c6a48`, with subtle darker wash + speckle texture).
- **Flowers grow inside the beds** (the beds are the planting zones — this is what bounds the "sporadic" scatter so it always reads tended).
- **Grass** fills everything outside the path and beds (margins, gaps between bed and path, top, foreground).

**Placement geometry contract (approximate — tune in the persisted mockup, §8 item 1):**
- Each bed is roughly a vertical rounded rectangle occupying ~left-third and ~right-third of the ~30% Garden band, separated by the central path.
- A flower's position = a deterministic jittered point inside its bed rectangle, seeded from `check_in_id` (so it is fixed forever and identical across devices — §6.1). Enforce a min center-to-center spacing ≈ one flower-width; reject-and-re-jitter on collision.
- Capacity: one Mon–Sun week is ≤7 flowers, split across the two beds (≈4 left / 3 right is a fine default — flexible; a thin week simply leaves the beds partly empty, which reads as a young garden, never as gaps). Set exact px/% in the mockup, then port the same numbers to RN.

### 4.3 Day / flower states

- **Planted day:** a fully painted watercolor flower bloomed flat-on in a bed; color = that day's mood; height/ornateness = that day's tier (§5.4). Permanent — never dims or wilts.
- **Today (unlogged):** there is no fixed "today slot" — the action is the labeled CTA (§4.5). When logged, the new flower blooms into an open bed patch with the celebration (§5.6).
- **Missed / future / empty:** simply fewer flowers in the beds. An under-full bed reads as a *young* garden, never as gaps or failure (the key advantage of the organic bed over a fixed 7-slot row).
- **First run:** empty beds (bare soil) + the labeled CTA as the obvious first action.

### 4.4 Doghouse

Flat-on front elevation at the **head of the path** (top of the garden). Walnut roof `#5A3A22`, chestnut planks `#8A5A38`, dark arched door `#2E2117`, a tiny white bone on the gable. **No nameplate** (owner decision §2.3) — the dog's identity is the header chip.

- **Asset:** `assets/garden/puplog-doghouse.png` (static-require slot). **Renamed 2026-06-20 from `Dog House.png`** (the space + caps would break Metro `require()` — §6.4). It is ~4.7 MB and **must be downscaled** before bundling (§6.6 debt).
- ⚠️ **The on-disk art likely still shows the blank name sign** (the no-nameplate regenerate has not been done yet), AND `puplog_garden_scene_prompts.md` §1 + its Scene Palette ("Blank name sign #FBE6CC") + `assets/garden/README.md` STILL describe a doghouse *with* a blank sign for a name overlay. Those guidance files and the asset must be updated to the no-sign decision (§8 item 2). The regenerate prompt in `puplog_garden_scene_prompts.md` §1 must be edited to remove the sign.

### 4.5 The action (today's CTA)

The garden is the **reward**; the labeled **"Plant Luna's flower for today"** coral pill is the **action**. Tapping it opens the log bottom-sheet (§5.3). After today is logged, the CTA collapses to a quiet "Edit today's flower" and the new bloom appears in a bed. (We keep a clear, conventional, ≥48dp button — the usability win we preserved when moving away from a mound-only diegetic CTA.)

⚠️ **CTA label color = ink `#2a221c`, NOT white.** White `#ffffff` on coral `#F4845F` is **2.53:1 — a confirmed WCAG AA failure** (`HANDOFF.md` §6 "Coral-CTA WCAG fix"; PR #24 → https://github.com/RohitS199/dog-app-v2/pull/24). PR #24 retokens `OB_COLORS.ctaText` to ink `#2a221c` (6.2:1) app-wide but is **not yet merged** (`origin/main` still has `ctaText: '#ffffff'`). Until #24 lands, use ink `#2a221c` directly; do NOT consume `OB_COLORS.ctaText`. (My Dogs already standardized on "ink on coral, never white-on-coral" — `HANDOFF.md` §5.2.)

### 4.6 Emergency surface (Golden Rule)

- **Primary:** an always-mounted **Emergency** chip in the header top-right — red ink `#c75f4a` + alert glyph, `role="link"`, ≥48dp via hitSlop. Never gated.
- **Secondary:** an "Emergency help ›" line at the bottom of the log bottom-sheet (so it is reachable mid-log).
- Both route to the existing standalone emergency resources screen (`app/emergency.tsx`; ASPCA poison control `888-426-4435` + emergency-vet Google search). Source: `CLAUDE.md` "EMERGENCY"; `src/constants/config.ts`.

### 4.7 What carries over from `preview-journey-hero-option-a-v2.html`

That mockup's **garden layout (organic arc) is superseded** by §4.2. But reuse its: scene depth/wash technique, the **log bottom-sheet** structure (progressive mood → symptom → specifics, live preview pot + tier meter), drifting clouds/sun idle loops, and the de-white asset loader pattern (relevant only to HTML previews; RN needs true transparent PNGs — §6.5). Note its Safari gotcha: SVG filters must live inside SVG elements, not CSS `filter: url()` on HTML. Source: `HANDOFF.md` §7.3 ("Canonical mockup").

### 4.8 Theme tokens (match exactly)

From `src/constants/onboardingTheme.ts` (verified hex-for-hex 2026-06-20):

- **Colors (`OB_COLORS`):** cream `#f7f1e6` (paper bg), cream2 `#efe6d2`, peach `#f3d7b0`, wood `#8a5a38`, woodDk `#5a3a22`, ink `#2a221c` (text + CTA label), ink2 `#574a3f`, muted `#a9998a`, sketch `#1a140f` (outlines), green `#6b7a3d`, accent `#475E3D`, blush `#f2c6bd`, cta `#F4845F` (coral fill), selectedBg `#e3ead9`, selectedBorder `#475E3D`, red `#c75f4a` (emergency), peachSoft `#fbe6cc`. **Do NOT use `ctaText` (`#ffffff`) — see §4.5.**
- **Fonts (`OB_FONTS`):** Caveat (h1/handwritten/greeting/date), Patrick Hand (h2/h3/body), Kalam Bold (labels/day-tags), Work Sans (cta/options), Nunito (data/buttons).
- **Sizes (`OB_FONT_SIZES`):** h1 30, h2 19, h3 15, body 14, label 11.
- **Spacing (`OB_SPACING`):** 4/8/12/16/24/32 scale; card padding 20/24.
- **Radii (`OB_RADII`):** button 24, card 14, chip 12.
- **Shadows (`OB_SHADOWS`):** Duolingo-style 4pt solid (no-blur) bottom shadow; `buttonPressed` zero-offset + `OB_BUTTON_PRESS_TRANSLATE = 4` translateY on press.
- **Entrance choreography (`OB_ENTER_HERO`):** 320ms, group stagger 90, item stagger 60, ease-out cubic; `OB_ENTER_STANDARD`/`OB_ENTER_ACTION` for lighter surfaces.

> Legacy `src/constants/theme.ts` ("Earthy Dog Park" `COLORS`) is used by old surfaces — do NOT use it for the Journey hero. But its `MIN_TOUCH_TARGET = 48` and urgency colors (monitor = teal `#00897B`, never green) remain authoritative project-wide. Source: `src/constants/CLAUDE.md`.

---

## 5. The flower system (color = mood, tier = detail)

**Single source of truth:** `puplog_flower_tier_logic.md` (project root, consolidated 2026-06-20). This section restates it; if they ever disagree, that file (and the code it cites) wins.

### 5.1 The tier rule (exact — first match wins)

```js
// Logic VERBATIM from preview-journey-hero-option-a-v2.html, tier() ~L1209
// (inline comments below are paraphrased, not from source)
function tier() {
  if (!mood) return 0;                 // nothing chosen -> sprout
  if (hasPhoto || hasNote) return 3;   // photo OR free-text note -> full bloom
  if (symptoms.size > 0) return 2;     // >=1 symptom/health chip -> fuller bloom
  return 1;                            // mood only -> simple bloom
}
```

- **Tier 0** = no mood → sprout placeholder.
- **Tier 1** = mood only → simple bloom. **This is a valid one-tap daily log — clinical input is OPTIONAL** (owner decision 2026-06-20).
- **Tier 2** = mood + ≥1 health/symptom chip → fuller bloom.
- **Tier 3** = mood + a photo or note → full bloom. **Key subtlety:** the photo/note check runs *before* the symptom check, so a photo/note jumps straight to Tier 3 even with zero symptom chips — *evidence beats breadth*.
- **VIDEO (forward-looking, owner intent):** Tier 3 should also be reachable by a **video**. The mockup `tier()` only checks `hasPhoto || hasNote` — there is NO video branch in the source. The ported helper (§6.4) must add a `hasVideo`/`hasMedia` term to the Tier-3 branch; a literal port would silently drop video.
- **One flower per dog per day** (`UNIQUE(dog_id, check_in_date)` already enforced — §6.1).

### 5.2 The 8 moods → flower color

| Mood key | Label | Hex | Color name | T1 character |
|---|---|---|---|---|
| `joyful` | Joyful | `#F4C430` | Sunny Yellow | 5-petal wildflower |
| `playful` | Playful | `#FF8C61` | Coral Orange | 5-petal buttercup |
| `affectionate` | Affectionate | `#F4A6B8` | Rose Pink | 5-petal forget-me-not |
| `calm` | Calm | `#A8C9A0` | Sage Green | 6-petal daisy |
| `curious` | Curious | `#9BB5DD` | Periwinkle Blue | 5-petal star flower |
| `tired` | Tired | `#C8B4D8` | Soft Lavender | bell-shaped |
| `anxious` | Anxious | `#A89AA8` | Muted Plum | tight half-open **bud** |
| `unwell` | Unwell | `#C5CDD2` | Pale Ash Blue | drooping snowdrop |

**Hard moods get dignity (never violate):** anxious = an accurate tight bud, not a punishing wilt; unwell = a delicate snowdrop, not a dead flower. Source: `puplog_flower_tier_logic.md` §2; `HANDOFF.md` §7.2 ("The 8 moods").

### 5.3 Log bottom-sheet flow (progressive)

Reuse the v2 mockup sheet structure (`preview-journey-hero-option-a-v2.html`):
1. **Mood** (section 1) — 8 color-dot chips, pick exactly one → sets color, unlocks the rest, sprouts a live preview flower.
2. **Health/symptom chips** (section 2, unlocks after mood) — multi-select: `All normal · Eating less · Low energy · Tummy trouble · Stiff or limping · Itchy skin · Threw up`. "All normal" is **exclusive** (clears others / cleared by others). Any ≥1 → Tier 2. **NOTE (owner decision 2026-06-20): "All normal" DOES count toward Tier 2** — rationale: do not trap healthy-dog owners in permanent simple blooms, and do not create a perverse incentive to report symptoms for a prettier flower; "All normal" is a real health affirmation.
3. **Specifics** (section 3) — a **photo, video, or note** → Tier 3.
   - ⚠️ **Gating fix required:** the v2 mockup gates section 3 behind a selected symptom chip (`sec3` locked while `symptoms.size === 0`). That makes the photo/note-only → Tier 3 path UNREACHABLE, contradicting §5.1. **In the RN build, unlock Specifics after MOOD** (not after a chip) so the intended evidence-beats-breadth path holds.
- A live preview pot + a 3-dot "quick · detailed · full bloom" tier meter grows in real time. CTA label escalates "Plant Luna's flower" → "…full bloom."

> The 7 simple symptom chips are COARSER than the existing clinical check-in (§6.2). They are placeholders for whatever the clinical redesign produces; the tier mechanic keys off "≥1 health chip" and "photo/video/note," not the specific chip set.

### 5.4 Tier → visual complexity (art spec)

| Tier | Visual | Source |
|---|---|---|
| 1 | Simple wildflower, ~5 petals, single bloom | `~/Downloads/puplog_flower_prompts_v2 (1).md` |
| 2 | Fuller flower, layered petals, medium bloom | same |
| 3 | Ornate flower, multiple petal layers, elaborate bloom | same |

**Reconciliation (owner decision):** the art guide's prose ("T2 = mood + activity", "T3 = notes, photo, tags") is approximate; **the code in §5.1 is the precise rule.** Align the art-guide prose when convenient.

In the RN render, **tier scales flower HEIGHT/ornateness inside its bed, not width**, so a richly-logged day visibly rises taller/fuller.

### 5.5 In-sheet copy (Biscuit hints)

| Tier | Label | Hint |
|---|---|---|
| 0 | "Waiting to sprout" | "Pick her mood and a flower takes root." |
| 1 | "A simple bloom" | "Sweet! Add a health note and it grows fuller." |
| 2 | "A fuller bloom" | "Lovely. A photo or note makes it bloom completely — real evidence for Biscuit." |
| 3 | "Full bloom!" | "Beautiful — the detailed kind of entry Biscuit can really read patterns from." |

Source: `puplog_flower_tier_logic.md` §5.

### 5.6 Plant celebration + edit-to-upgrade

- **Celebration:** on Plant, the sheet dismisses, a new flower blooms into an open bed patch with a ~1000ms `plantPop` + petal burst and a brief ~1.02–1.6× overshoot before settling to its tier height. reanimated `withTiming` only (no springs). Biscuit may give a one-line acknowledgement.
- **Edit-to-upgrade (owner decision 2026-06-20): ALLOWED.** Editing a past day can raise its tier (reinforces "add detail = fuller flower"). An edit MUST re-run emergency-keyword detection + pattern/AI analysis — the existing revision-history system already supports this (`trg_checkin_revision`; `CLAUDE.md` "Database Triggers").

### 5.7 Weekly cycle (owner decision 2026-06-20: WEEKLY)

The two beds fill Mon–Sun. On Monday the beds reset to fresh soil, framed as a **gift** ("A fresh bed to plant"), and the prior week is "pressed" into a keepsake for the **My Dogs** tab look-back. Never reset mid-week; never an erase animation. This interlocks with the My Dogs "weekly look-back scenes" in `docs/superpowers/specs/2026-06-03-my-dogs-tab-design.md` and the shipped My Dogs polaroid look-back (`HANDOFF.md` §5).

---

## 6. Data model, backend & RN implementation

### 6.1 Data model

- **Table:** `daily_check_ins` already has `UNIQUE(dog_id, check_in_date)` (one flower/day). Source: `CLAUDE.md` "Database Tables".
- ⚠️ **A `mood` field ALREADY EXISTS on `daily_check_ins`, with DIFFERENT values.** `src/types/checkIn.ts` defines `type Mood = 'normal' | 'quiet' | 'anxious' | 'clingy' | 'hiding' | 'aggressive'` (the clinical mood, from `src/constants/checkInQuestions.ts` question id `'mood'`). The 8 **garden** moods (`joyful/playful/affectionate/calm/curious/tired/anxious/unwell`) are a DIFFERENT set — only `anxious` overlaps. **Do not assume a greenfield `mood` column and do not clobber the clinical one** (pattern detection depends on it — §6.2). Decision required: is the garden mood a NEW separate column (e.g. `garden_mood`) or does it remap/replace the clinical `mood`? Resolve this WITH the deferred clinical-flow redesign (§6.2), since they collide.
- **Engineering rule (must follow):** do NOT duplicate the closed mood enum between a TS constant and a Postgres CHECK constraint — pick one source of truth. Source: memory `feedback_no_duplicate_enums_db_and_code.md`; flagged in `puplog_flower_tier_logic.md` §7. Use `supabase-postgres-best-practices` for the migration/RLS.
- **Deterministic placement:** derive a stable per-flower position seed (from `check_in_id`, or `dog_id + check_in_date`) so a flower's bed slot/jitter is fixed forever and identical across devices. Do the jitter math client-side from the seed; do not store live pixel coords (§4.2 contract).

### 6.2 The clinical-question flow is a SEPARATE, DEFERRED redesign

Owner decision 2026-06-20: the existing 9-question clinical check-in (`src/constants/checkInQuestions.ts`, `app/check-in.tsx`) was "mock one version" and **will be redesigned** — keep what works, change what does not. It is **subject to change**; do NOT treat its current shape as fixed. This spec covers the garden + flower + tier; the clinical flow gets its own brainstorm → spec when the owner reaches it.

**Hard dependency to preserve through that redesign (safety):** whatever the clinical flow becomes, it must keep feeding:
- **Pattern detection** — 17 rules in `src/lib/patternRules.ts`, built on the granular 7-metric data (appetite/water/energy/stool/vomiting/mobility/mood with graded values).
- **AI health analysis** — `ai-health-analysis` Edge Function (daily Sonnet 4.5).
- **Emergency keyword detection** — `src/lib/emergencyKeywords.ts` on free text.

The 7 simple symptom chips (§5.3) are coarser than the current graded metrics. If the chips *replace* the metrics rather than *summarize* them, pattern detection loses precision — that is a fine trade to make ON PURPOSE, not by accident. Decide it explicitly in the clinical-flow spec.

### 6.3 Backend status (context)

Backend is COMPLETE: `check-symptoms` v10, `analyze-patterns` v1, `ai-health-analysis` v1, `weekly-summary-update` v1, `delete-account` v1; RLS hardened; weekly summary GitHub Action active since 2026-03-07. Source: `CLAUDE.md` "Backend"; `HANDOFF.md` §10 ("Backend is COMPLETE"). Use `supabase-edge-functions` only if you modify a function.

### 6.4 React Native build notes

- **Port `tier()` as a pure, unit-tested helper** — e.g. `src/lib/flowerTier.ts`, same first-match order. **TDD it** (`superpowers:test-driven-development`). **Add a `hasVideo`/`hasMedia` input to the Tier-3 branch** — the mockup `tier()` only checks `photo|note`; video is a locked product input not yet in code (§5.1).
- **Flower art = STATIC `require()` asset map** `FLOWER_ASSETS[mood][tier]` (+ doghouse/biscuit/sprout/mound). **Metro cannot do template-literal `require(\`...${mood}...\`)`** — build the literal object map for all 24 flowers + scene assets. Source: memory `feedback_rn_metro_static_require.md`; `puplog_flower_tier_logic.md` §7. (This is exactly why the doghouse was renamed away from the spaced `Dog House.png` — §4.4.)
- **Scene background:** ship a single BAKED watercolor PNG for sky/hill/lawn/path/beds — do NOT ship live SVG `feTurbulence` (react-native-svg cannot render the wobble filters; Hermes/Metro will struggle). Layer order back→front: ground PNG → doghouse → Biscuit → flowers (conditionally rendered per day's state) → foreground grass → chrome → sheet.
- **State:** drive the garden from a normalized week array (`{day, state, moodKey, tier, seed}`) so the same data powers a mockup and RN and stays resolution-independent SE→Max.
- **Animation:** reanimated `withTiming` ONLY (no springs — owner preference). Gate all idle loops behind `useReducedMotion()` (already used in 5+ components) and PAUSE them when the tab is unfocused (FPS). Reuse `checkInStore` draft/persist patterns (`src/stores/checkInStore.ts`).
- **Multi-dog:** the header chip cross-fades the bed to that dog's independent week (~320ms `withTiming`) and CLEARS the prior dog's plot state on switch (mirror `healthStore`'s clear-on-dog-switch — `CLAUDE.md` Health Calendar).
- Use `react-native-architecture` + `react-native-best-practices` for the screen + perf.

### 6.5 Accessibility (WCAG AA — use `accessibility-compliance`)

- Every interactive target ≥48dp (`MIN_TOUCH_TARGET`). Emergency chip `role="link"` + hitSlop. CTA label ink `#2a221c` on coral (6.2:1, §4.5) — never white-on-coral (2.53:1 fail).
- Day-state must not rely on color alone — bloom vs sprout vs empty differ in SHAPE.
- Expose the garden as a navigable group with per-flower VoiceOver labels: e.g. "Tuesday: playful, full bloom — double-tap to view" / "Today, not yet logged — double-tap to plant Luna's flower" (NEVER say "missed").
- Sheet preview/tier-meter announce tier changes. Error messages `role="alert"`.

### 6.6 Asset inventory & pipeline

- **24 flowers EXIST:** `assets/garden/flowers/puplog-flower-[mood]-tier[1-3].png` (8 moods × 3 tiers). Verified 24/24 on 2026-06-20. Slot map: `assets/garden/README.md`.
- **Doghouse:** `assets/garden/puplog-doghouse.png` (renamed 2026-06-20 from `Dog House.png`; ~4.7 MB — MUST downscale before bundling; likely still shows the blank name sign — §4.4). Prompt to regenerate without the sign: `puplog_garden_scene_prompts.md` §1 (which itself must be updated to drop the sign — §8 item 2).
- **Scene kit:** mound/sprout (+ optional grass tuft, butterfly) per `puplog_garden_scene_prompts.md` §2–5. The path + bed treatment may need its own baked PNG (§6.4) — a new prompt may be required.
- **Debt:** flower PNGs currently have WHITE backgrounds (mockup de-whites at runtime; RN needs true transparent + downscaled exports — sources are 1024–2048px, 1–6 MB). 82 MB of garden PNGs are **untracked** in git (decision pending — plain commit vs Git LFS vs out-of-git). Source: `HANDOFF.md` §7.5 ("Known debts (Journey)"), hazard H10.
- **Pipeline:** owner generates art in Gemini one prompt at a time; the assisting Claude identifies → canonical-names → files into `assets/garden/...` → verifies. Guides: `puplog_flower_prompts_v2 (1).md` (flowers, in `~/Downloads`), `puplog_garden_scene_prompts.md` (scene, project root). **Gemini art is a drop-in — never hand-beautify placeholders** (memory `feedback_sticker_artwork_is_drop_in.md`).

---

## 7. Process & conventions

### 7.1 Git / workflow

- Branch every feature off **`origin/main`** (`ebed28c`), NOT laptop local `main` (it carries ~27 onboarding-WIP files + diverged history — **never pull it**). Use `superpowers:using-git-worktrees`; **`cp .env <worktree>/.env`** into each worktree or the app will not boot (`supabaseUrl is required`). Source: `HANDOFF.md` §4, hazards H1/H2.
- PR-only to `main`; Conventional Commits with scope; merge via `gh pr merge <n> --merge`; commit trailer `Co-Authored-By: Claude <model> <noreply@anthropic.com>`.
- **TypeScript baseline:** on a fresh `origin/main` checkout TODAY it is **30 known errors** (24× `@expo/vector-icons` TS2307 + 6× in `app/(tabs)/{index,learn}.tsx`); verify with the filtered typecheck in `HANDOFF.md` §12 ("Conventions in force"). ⚠️ **This baseline is about to change:** once PR #23 merges (it declares `@expo/vector-icons`) the real baseline drops to **1** — re-check `npx tsc --noEmit` against `origin/main` HEAD at session start rather than assuming 30 (`HANDOFF.md` §5.5, §12). Zero NEW errors allowed either way.
- Conventions: relative imports only; ASCII apostrophes only (no smart quotes — they break TS); redesign screens use `OB_*` tokens. Source: `HANDOFF.md` §12 ("Conventions in force").

### 7.2 Testing

- **TDD** the pure logic (`flowerTier.ts`, placement/seed helper, any week-array reducer) — `superpowers:test-driven-development`. Screens are verified by device QA (no Expo Router test harness by convention); reanimated components need a local `jest.mock`. Source: `HANDOFF.md` §12.
- Before claiming done: run `npm test` and the filtered typecheck and SHOW the output — `superpowers:verification-before-completion`. Owner QAs on a physical iPhone, then says "merge."

### 7.3 The dev pipeline to follow (and the skills mandate, restated)

`superpowers:brainstorming` (DONE — this spec) → **`superpowers:writing-plans`** (NEXT — turn this into a task plan) → `superpowers:test-driven-development` → `superpowers:requesting-code-review` (or the project's `/code-review`) → `superpowers:finishing-a-development-branch`. **And per §0.1: always use skills — installed, self-created, or vetted-from-the-marketplace.** This is the owner's explicit, repeated instruction.

---

## 8. Next steps (resume here)

1. **(Recommended) Build a persisted HTML mockup of this layout** — `preview-journey-hero-garden-path.html` at project root, reusing techniques from `preview-journey-hero-option-a-v2.html`, and pin down the exact bed geometry (§4.2). The Garden-Path layout currently only exists as an ephemeral chat widget; persist it so it survives the handoff and can be QA'd in a browser. Use ink-on-coral CTA (§4.5).
2. **Update the canonical art guidance to the no-nameplate decision** — edit `puplog_garden_scene_prompts.md` §1 + its Scene Palette + `assets/garden/README.md` to remove the blank-name-sign description; then regenerate `puplog-doghouse.png` without the sign and downscale it (§4.4/§6.6).
3. **Finish the scene-kit art** (owner, in Gemini) and a flower QA squint-pass (`HANDOFF.md` §7.7).
4. **Resolve the §9 open questions** with the owner (2–3 sharp questions, low ceremony).
5. **`superpowers:writing-plans`** → a task-by-task TDD implementation plan (garden render + `flowerTier.ts` + mood data-model + log-sheet wiring + animation + a11y). Save to `docs/superpowers/plans/`.
6. Implement with TDD; device-QA; PR off `origin/main`.

---

## 9. Open questions / deferred decisions

1. **Clinical-question flow redesign** — separate brainstorm/spec (§6.2). Biggest downstream dependency. Includes the `mood` column collision (§6.1).
2. **Macro-mood greeting source** — is the one-line greeting deterministically derived from the week's logged moods (with fallback copy for a 0–1 log week / first run), or AI-generated? It must never imply diagnosis or alarm.
3. **Multi-dog default** — which dog's garden loads on tab focus (last-viewed / dog with an unlogged today / a remembered pin)? (No all-dogs overview lives on this hero — that is My Dogs.)
4. **Fence** — deferred decoration. When added, prefer a low fence line BEHIND the house at the horizon, or flanking the path entrance — NOT a full foreground fence that fights the CTA/tab bar.
5. **"Past weeks" history scope for v1** — real browsable history (and where: My Dogs vs Health) or just Monday-reset keepsake framing with history deferred?
6. **Tier thresholds** — current defaults (mood=T1, +chip=T2, +media/note=T3) are a strong default, still tunable (`puplog_flower_tier_logic.md` §6, `HANDOFF.md` §7.6).
7. **Tap-to-edit past days** — confirmed ALLOWED (§5.6); confirm whether tapping a past bloom opens read-only recap vs full editable check-in.
8. **Bed capacity / density** — confirm the ≈4-left / 3-right default (§4.2) once the persisted mockup exists; set exact px/%.
9. **Asset/art-pipeline confidence** — the diegetic illusion rests on cohesive watercolor PNGs (doghouse, Biscuit, path/bed background, 24 flowers). Lock the layout with SVG/placeholder stand-ins and swap art in, or wait for final art? (Highest-risk dependency.)

---

## 10. References & key files

| What | Path / URL |
|---|---|
| THIS spec | `docs/superpowers/specs/2026-06-20-journey-tab-hero-design.md` |
| ⭐ Flower/tier logic (source of truth) | `puplog_flower_tier_logic.md` (project root) |
| ⭐ Canonical mockup (log sheet + scene technique; garden layout superseded) | `preview-journey-hero-option-a-v2.html` (project root) |
| Scene-kit Gemini prompts (doghouse ⭐, mound, sprout) — needs no-nameplate update | `puplog_garden_scene_prompts.md` (project root) |
| Flower Gemini prompts (24 flowers) | `~/Downloads/puplog_flower_prompts_v2 (1).md` |
| 24 flower PNGs | `assets/garden/flowers/puplog-flower-[mood]-tier[1-3].png` |
| Doghouse PNG (renamed, needs downscale + no-sign regen) | `assets/garden/puplog-doghouse.png` |
| Asset slot map — needs no-nameplate update | `assets/garden/README.md` |
| Scrapbook theme tokens | `src/constants/onboardingTheme.ts` |
| Legacy theme (do not use for hero; urgency colors authoritative) | `src/constants/theme.ts`, `src/constants/CLAUDE.md` |
| Existing clinical check-in (to be redesigned) + the conflicting `mood` type | `src/constants/checkInQuestions.ts`, `app/check-in.tsx`, `src/stores/checkInStore.ts`, `src/types/checkIn.ts` |
| Pattern rules (preserve) | `src/lib/patternRules.ts` |
| Emergency detection (preserve) | `src/lib/emergencyKeywords.ts` |
| Emergency resources screen | `app/emergency.tsx` |
| Tab bar (labels) | `src/components/ui/FloatingTabBar.tsx` |
| Journey tab screen (target) | `app/(tabs)/index.tsx` |
| Biscuit placeholder (geometric, corgi art pending) | `src/components/onboarding/BiscuitMascot.tsx` |
| Coral-CTA a11y fix (CTA color) | PR #24 → https://github.com/RohitS199/dog-app-v2/pull/24 ; `HANDOFF.md` §6 |
| Adjacent: My Dogs spec/plan + shipped PR #23 | `docs/superpowers/specs/2026-06-03-my-dogs-tab-design.md`, `docs/superpowers/plans/2026-06-06-my-dogs-tab.md`; PR #23 → https://github.com/RohitS199/dog-app-v2/pull/23 |
| Session/project handoff | `HANDOFF.md` (project root) — esp. §3 Golden Rule, §7 Journey hero, §11 product decisions, §12 conventions, §13 hazards, §14 skills, §15 key files |
| Project bibles | `CLAUDE.md` (root + per-dir), `DOCUMENTATION.md` |
| Active repo | `https://github.com/RohitS199/dog-app-v2.git` |
| Supabase | `https://wwuwosuysoxihtbykwgh.supabase.co` |
| Engineering-principle memories | `feedback_no_duplicate_enums_db_and_code.md`, `feedback_rn_metro_static_require.md`, `feedback_sticker_artwork_is_drop_in.md`, `feedback_privacy_default_opt_out.md` (in `~/.claude/.../memory/`) |

---

## 11. Reminder (because it bears repeating)

**Use skills, every time** — installed (`superpowers:*`, `react-native-architecture`, `react-native-best-practices`, `accessibility-compliance`, `supabase-postgres-best-practices`, `supabase-edge-functions`, `anthropic-sdk`, `find-skills`), self-created (`superpowers:writing-skills`), or vetted from the marketplace (`npx skills find`, `npx skills add`, https://skills.sh/trending — prefer high-install, well-reviewed, reliable ones). This is the owner's standing rule and it applies to the next session from its first action. (§0.1)
