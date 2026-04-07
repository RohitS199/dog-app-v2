# PupLog Journey Home Screen - UI/UX Design Handoff

> Comprehensive specification for redesigning the PupLog home screen into a gamified "journey map" with a beach theme. This document is self-contained: a designer can create Figma frames from it alone, and a developer can implement from it alone.

---

## Table of Contents

1. [Problem Statement & Goals](#1-problem-statement--goals)
2. [Inspiration & References](#2-inspiration--references)
3. [Information Architecture](#3-information-architecture)
4. [Screen Inventory](#4-screen-inventory)
5. [Component Specifications](#5-component-specifications)
6. [Color Palette](#6-color-palette)
7. [Node States](#7-node-states)
8. [Mascot Specification](#8-mascot-specification)
9. [Scene Layout](#9-scene-layout)
10. [SVG Path](#10-svg-path)
11. [Header & Progress Card](#11-header--progress-card)
12. [Animation Inventory](#12-animation-inventory)
13. [Edge Cases & States](#13-edge-cases--states)
14. [Accessibility Requirements](#14-accessibility-requirements)
15. [What Changes vs. Stays](#15-what-changes-vs-stays)
16. [Existing Assets](#16-existing-assets)

---

## 1. Problem Statement & Goals

### The Retention Barrier

PupLog's current home screen is informational but not motivational. It displays dog profile cards, a streak counter, an energy bar, and an article carousel. Users see data, but they do not feel a pull to return tomorrow. The screen answers "what happened" but never asks "what's next?"

Daily health check-ins are the engine of PupLog's value proposition: pattern detection requires consistent data, AI health analysis improves with more history, and streak-based engagement drives the habit loop that keeps dogs healthier. But the current UI treats check-ins as a transactional task rather than a journey worth completing.

### Why Gamification

The Ahead app and Duolingo have proven that journey-map metaphors and streak gamification convert passive users into habitual ones. A winding path with nodes, a mascot that celebrates progress, and a visible week-to-complete creates three psychological hooks:

1. **Progress visibility** -- seeing completed nodes behind you creates sunk-cost motivation
2. **Anticipation** -- upcoming nodes and a milestone trophy create goal-directed behavior
3. **Companionship** -- a mascot floating above "today" makes the experience feel personal and alive

### Metrics to Move

| Metric | Current Baseline | Target | Measurement |
|--------|-----------------|--------|-------------|
| 7-day retention | TBD (pre-beta) | +30% vs. old home screen | Percentage of users active 7 days after first check-in |
| Daily check-in completion rate | TBD | +40% vs. old home screen | Check-ins per DAU |
| DAU/WAU ratio | TBD | 0.6+ (4.2 days/week) | Daily active / weekly active users |
| Average streak length | TBD | 5+ days | Mean `dogs.checkin_streak` across active users |
| Time-to-first-check-in | TBD | <60 seconds from home screen | Time from home screen mount to check-in submission |

### Design Principles

1. **The journey IS the home screen** -- no separate dashboard; the path replaces all informational widgets
2. **Today's node is the hero** -- the eye should land on today's node and the mascot within 1 second of screen load
3. **Completion begets continuation** -- every completed node should feel rewarding, every upcoming node should feel achievable
4. **Beach, not battlefield** -- the tone is warm, organic, and relaxing (consistent with PupLog's "Earthy Dog Park" identity); never competitive or stressful

---

## 2. Inspiration & References

### Ahead App (Primary Reference)

The Ahead app uses a vertical journey path with circular nodes, a floating mascot, and speech bubbles. Key patterns borrowed:

- **Winding SVG path** connecting sequential nodes down the screen
- **Node states** (completed with checkmark, current with glow, upcoming with muted style)
- **Mascot floating above current node** with a gentle bob animation
- **Speech bubble** with contextual messaging and dismiss button
- **Progress card** at the top showing fraction completed and a progress bar
- **Ground-plane depth** -- subtle perspective tilt and gradient to create a feeling of walking forward

Divergence from Ahead: PupLog uses a beach/sand theme instead of Ahead's abstract space theme, and nodes show calendar dates instead of lesson numbers.

### Duolingo (Streak Gamification)

Duolingo's streak system is the gold standard for habit formation in mobile apps:

- **Fire emoji + count** in a prominent pill badge
- **Streak freeze** visual when a day is missed (PupLog shows "missed" node state instead)
- **Weekly goal framing** ("5/7 days this week") rather than unbounded streaks
- **Celebration animations** on milestone completion

Divergence from Duolingo: PupLog's journey is time-based (Mon-Sun) rather than skill-based, and there is no "hearts" or punishment mechanic.

### User's Mockup Analysis (preview-journey-home.html)

The existing HTML prototype establishes the following patterns that carry forward into the final spec:

- **Angled ground plane** with perspective tilt (8deg) and gradient from #EDE7E3 to #B5A298
- **Dirt path texture** running down the center with CSS mask-image
- **Node positions** alternating left-right in a zigzag pattern
- **Lottie dog mascot** (gray meditation dog) -- to be replaced with custom SVG dog
- **Speech bubble** positioned to the right of the mascot with left-pointing arrow
- **Tab bar** with centered FAB (Check In button)
- **Parallax scroll** on background at 0.25x rate
- **Ground decorations**: emojis (paw prints, bones, leaves), grass tufts (CSS), small stones

The prototype uses an earthy ground-plane theme. The final design pivots to a **beach scene** with sky, water, sand, and tropical decorations while preserving the same structural layout and interaction patterns.

---

## 3. Information Architecture

### Data Model to Visual State Mapping

| Data Source | Store | Field | Visual Element |
|-------------|-------|-------|----------------|
| `dogStore` | `useDogStore()` | `dogs` | Dog chip (header), dog selector bottom sheet |
| `dogStore` | `useDogStore()` | `selectedDogId` | Which dog's journey is shown |
| `dogStore` | `useDogStore()` | `selectedDog.name` | Dog chip label, mascot speech bubble |
| `dogStore` | `useDogStore()` | `selectedDog.checkin_streak` | Streak pill count, milestone logic |
| `dogStore` | `useDogStore()` | `selectedDog.last_checkin_date` | Determines if today's node is "completed" vs "current" |
| `healthStore` | `useHealthStore()` | `calendarData` | Map of `YYYY-MM-DD` to check-in records; determines completed/missed node states |
| `authStore` | `useAuthStore()` | `user.user_metadata.first_name` | Not used in new design (greeting removed) |

### Week Calculation

The week runs **Monday through Sunday**. Seven nodes, one per day.

```
Monday = node 0
Tuesday = node 1
Wednesday = node 2
Thursday = node 3
Friday = node 4
Saturday = node 5
Sunday = node 6
```

To compute the current week's Monday:

```typescript
const today = new Date();
const dayOfWeek = today.getDay(); // 0 = Sunday
const monday = new Date(today);
monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
```

For each node, compute the date string (`YYYY-MM-DD`) and look up `calendarData[dateStr]` to determine if a check-in exists.

### Node State Decision Tree

```
For each day i (0-6):
  dateStr = computeDateStr(monday + i days)

  if dateStr > todayStr:
    state = "upcoming"
  else if dateStr === todayStr:
    if calendarData[dateStr] exists:
      state = "completed"     // today, checked in
    else:
      state = "current"       // today, not yet checked in
  else:  // dateStr < todayStr (past)
    if calendarData[dateStr] exists:
      state = "completed"
    else:
      state = "missed"
```

### Node Label Format

Each node displays a calendar date formatted as ordinal: "Mar 24th", "Mar 25th", etc.

```typescript
function formatNodeLabel(date: Date): string {
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
    day === 3 || day === 23 ? 'rd' : 'th';
  return `${month} ${day}${suffix}`;
}
```

---

## 4. Screen Inventory

### State 1: First Launch (No Dogs)

**Trigger:** `dogs.length === 0 && !isLoading`

**Layout:**
- Full-screen empty state (no beach scene, no journey path)
- Centered vertically within safe area
- PupLog logo icon: 96x96px rounded square, Orange Collar (#FF6F00) background, white paw icon (48px)
- Title: "Welcome to PupLog!" -- DMSerifDisplay, 24px, Dark Loam
- Subtitle: "Add your first dog to start your health journey." -- system font, 16px, Medium Brown, center-aligned, 22px line height
- CTA button: "Add Your Dog" + right arrow icon, Orange Collar background, white text, full-width, 20px border radius, 14px vertical padding

**No journey map elements are rendered.** The beach scene, path, nodes, mascot, and progress card are all hidden.

### State 2: New Week (0/7 Completed)

**Trigger:** It is Monday (or any day where no check-ins exist for the current Mon-Sun window) and `calendarData` has no entries for this week.

**Layout from top to bottom:**
1. Status bar (54px, transparent/gradient fade)
2. Header row: dog chip (left) + streak pill + profile button (right)
3. Progress card: "This Week's Journey", "0 / 7 days", empty progress bar, subtitle "Start your journey! Check in to begin."
4. Beach scene background (sky gradient, clouds, water strip, sand area, decorations)
5. Journey path: all 7 nodes in "upcoming" state (white/sand background, gray border)
6. Mascot floating above node 0 (Monday) with speech bubble: "A new week begins! Let's get {dogName} started."
7. Milestone trophy node after node 6 (faded, locked state)
8. Faded Week 2 preview (1-2 locked nodes at 50% and 30% opacity)
9. Tab bar at bottom

### State 3: Mid-Week (e.g., 4/7 Completed)

**Trigger:** Some days completed, today is not checked in yet.

**Layout from top to bottom:**
1. Status bar
2. Header row
3. Progress card: "This Week's Journey", "4 / 7 days", progress bar at 57%, subtitle "Check in daily to build your health baseline"
4. Beach scene background
5. Journey path: nodes 0-3 in "completed" state (orange, checkmarks), node 4 in "current" state (orange, pulsing glow, larger), nodes 5-6 in "upcoming" state
6. SVG path: completed portion in orange dashes up to current node, upcoming portion in gray dashes
7. Mascot floating above the current node with speech bubble: "Time for {dogName}'s check-in! Let's keep the streak going."
8. Milestone trophy node (locked)
9. Faded Week 2 preview
10. Tab bar

### State 4: Week Complete (7/7)

**Trigger:** All 7 days of the current Mon-Sun week have check-in entries in `calendarData`.

**Layout from top to bottom:**
1. Status bar
2. Header row (streak pill shows full streak count)
3. Progress card: "This Week's Journey", "7 / 7 days", full progress bar (gradient orange), subtitle "Perfect week! You're building a great health baseline."
4. Beach scene background (slightly brighter/more vibrant -- increase sky saturation by 10%)
5. Journey path: all 7 nodes in "completed" state
6. SVG path: entirely orange dashes
7. Mascot floating above the milestone trophy node with celebration speech bubble: "Amazing week! {dogName}'s health data is looking great!"
8. Milestone trophy node: UNLOCKED state (gold gradient, trophy emoji, star badge, subtle glow animation)
9. Week 2 preview becomes slightly more visible (60% opacity instead of 30%)
10. Tab bar

### State 5: Missed Days

**Trigger:** Today is past Monday and some previous days have no check-in entries.

**Layout:** Same as State 3, but with missed nodes showing the "missed" state visual (darker sand background with subtle dash/X indicator, muted date label). The mascot remains at the current (today) node regardless of missed days. The speech bubble may show an encouraging message: "Every check-in counts! Let's log today."

The completed portion of the SVG path skips over missed nodes -- it still draws orange dashes up to the last completed node, then gray dashes from there forward. There is no "broken path" visual; missed days are communicated solely through node state.

---

## 5. Component Specifications

### 5.1 Header Row

**Container:**
- `flexDirection: 'row'`
- `alignItems: 'center'`
- `justifyContent: 'space-between'`
- `paddingHorizontal: 20px`
- `paddingBottom: 16px`
- `position: 'relative'`
- `zIndex: 20`

**Dog Chip (left side):**
- Pill shape: `borderRadius: 20px`
- `backgroundColor: #FFFFFF`
- `padding: 6px 14px 6px 8px`
- `boxShadow: 0 2px 10px rgba(0,0,0,0.07)`
- Inner layout: `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 6px`
- Avatar circle: 26x26px, `borderRadius: 13px`, `backgroundColor: rgba(255, 111, 0, 0.12)` (accentLight), centered paw emoji (14px) or dog photo thumbnail
- Name text: system font, 14px, weight 700, Dark Loam (#3E2723)
- Dropdown arrow: 10px, #795548 (textDisabled), `marginLeft: 2px`
- Touch target: entire chip is tappable, minimum 48px height
- `accessibilityRole: "button"`
- `accessibilityLabel: "Viewing {dogName}. Tap to switch dogs."`
- Only shows dropdown arrow when `dogs.length > 1`

**Header Right (right side):**
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 10px`

**Streak Pill:**
- Pill shape: `borderRadius: 20px`
- `backgroundColor: #FFFFFF`
- `padding: 6px 14px`
- `boxShadow: 0 2px 10px rgba(0,0,0,0.07)`
- Fire emoji: 18px
- Count text: system font, 16px, weight 700, Dark Loam (#3E2723)
- `accessibilityLabel: "{count}-day check-in streak"`
- Hidden when streak is 0 (returns null)

**Profile Button:**
- Circle: 38x38px, `borderRadius: 19px`
- `backgroundColor: #FFFFFF`
- `boxShadow: 0 2px 10px rgba(0,0,0,0.07)`
- Content: user avatar image (if available) or person icon (16px)
- Touch target: 48x48px (invisible hit area extends beyond visible circle)
- `accessibilityRole: "button"`
- `accessibilityLabel: "View profile and settings"`
- Navigates to Settings tab on press

### 5.2 Progress Card

**Container:**
- `marginHorizontal: 20px`
- `marginBottom: 20px`
- `backgroundColor: #FFFFFF`
- `borderRadius: 16px`
- `padding: 14px 16px`
- `boxShadow: 0 2px 14px rgba(0,0,0,0.06)`
- `zIndex: 20` (floats above beach scene)

**Progress Header Row:**
- `flexDirection: 'row'`
- `justifyContent: 'space-between'`
- `alignItems: 'center'`
- `marginBottom: 8px`

**Title:** "This Week's Journey"
- Font: DMSerifDisplay (heading font), 15px, weight 700, Dark Loam

**Fraction:** "{X} / 7 days"
- System font, 13px, weight 600, Orange Collar (#FF6F00)

**Progress Bar Background:**
- `height: 8px`
- `borderRadius: 4px`
- `backgroundColor: #E8E0DC` (divider color)

**Progress Bar Fill:**
- `height: 8px`
- `borderRadius: 4px`
- `background: linear-gradient(90deg, #FF6F00, #FF8F00)` (Orange Collar gradient)
- Width: `(completedCount / 7) * 100%`
- Animated fill on value change (see Animation Inventory)

**Subtitle:**
- System font, 12px, #795548 (textDisabled)
- `marginTop: 6px`
- Dynamic text:
  - 0/7: "Start your journey! Check in to begin."
  - 1-6/7: "Check in daily to build your health baseline"
  - 7/7: "Perfect week! You're building a great health baseline."

### 5.3 Journey Path Container

**Outer Container:**
- `position: 'relative'`
- `zIndex: 10`
- `width: '100%'`
- `minHeight: 1200px` (enough vertical space for 7 nodes + milestone + preview)

**Inner Container (perspective tilt):**
- `position: 'relative'`
- `width: '100%'`
- `minHeight: 1200px`
- `transformOrigin: 'center 200px'`
- `transform: rotateX(3deg)` (subtle 3D depth illusion on the journey area)

### 5.4 Step Nodes

See Section 7 (Node States) for full visual specifications per state.

**General node structure:**
```
<Pressable> (touch target)
  <View> (step-circle: the colored circle)
    <Text> or <Icon> (day number or checkmark)
  </View>
  <View> (step-shadow: elliptical ground shadow)
  <Text> (step-label: date text)
</Pressable>
```

**Positioning:** Nodes are absolutely positioned within the journey container. See Section 10 (SVG Path) for exact coordinates.

### 5.5 Milestone Node

**Container:**
- `position: 'absolute'`
- `zIndex: 10`
- `flexDirection: 'column'`
- `alignItems: 'center'`

**Circle:**
- 72x72px, `borderRadius: 36px`
- `background: linear-gradient(135deg, #FF6F00, #FF8F00)`
- `boxShadow: 0 6px 24px rgba(255, 111, 0, 0.3)`
- `border: 3px solid rgba(255, 255, 255, 0.5)`
- Content: trophy emoji (28px) centered

**Reward Badge (top-right corner):**
- 22x22px, `borderRadius: 11px`
- `backgroundColor: #4CAF50` (success green)
- `color: #FFFFFF`
- Star icon or checkmark, 11px
- `boxShadow: 0 2px 6px rgba(76, 175, 80, 0.4)`
- Offset: `top: -4px`, `right: -4px` relative to circle

**Label:**
- "Week Complete!" (when unlocked) or "Week 1" (when locked)
- DMSerifDisplay (heading font), 12px, weight 700, Orange Collar (#FF6F00)
- `marginTop: 6px`

**Locked State:** Circle uses muted gradient with 40% opacity, no reward badge, no glow.

**Unlocked State:** Full gradient, reward badge visible, subtle pulsing glow animation (see Animation Inventory).

### 5.6 Tab Bar

The existing `FloatingTabBar` component is unchanged. It remains absolutely positioned at the bottom of the screen with 5 tabs and a centered FAB. The FAB navigates to check-in (or add-dog if no dogs exist).

Reference: `src/components/ui/FloatingTabBar.tsx`

---

## 6. Color Palette

### Core Earthy Dog Park Tokens (Existing -- No Changes)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` (Dark Loam) | `#3E2723` | Text, buttons, primary actions |
| `primaryLight` | `#5D4037` | Lighter text contexts |
| `primaryDark` | `#1B0F0A` | Darkest brown |
| `accent` (Orange Collar) | `#FF6F00` | Completed nodes, active states, FAB, progress bar, streak |
| `accentLight` | `rgba(255, 111, 0, 0.12)` | Dog chip avatar background, tinted areas |
| `background` (Limestone) | `#FAFAFA` | Base app background (behind beach scene) |
| `surface` (Topsoil) | `#D7CCC8` | Missed node background, decorative elements |
| `card` | `#EFEBE9` | Card backgrounds (not used on new home screen; replaced by #FFFFFF) |
| `textPrimary` | `#3E2723` | Maximum readability text |
| `textSecondary` | `#5D4037` | Softer text, breed labels |
| `textDisabled` | `#795548` | Muted labels, upcoming node text (WCAG AA: 5.1:1 on #FAFAFA) |
| `border` | `#BCAAA4` | Upcoming node border |
| `divider` | `#C8B8B0` | Upcoming node border (alternative), path upcoming dash |
| `error` | `#D32F2F` | Error states |
| `success` | `#388E3C` | Milestone badge, positive indicators |
| `overlay` | `rgba(62, 39, 35, 0.5)` | Modal overlays |

### New Beach Scene Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `skyBlue` | `#87CEEB` | Top of sky gradient |
| `deepSky` | `#4A90D9` | Bottom of sky gradient (horizon) |
| `sand` | `#F5E6C8` | Primary sand area background |
| `wetSand` | `#E8D5B0` | Sand near water line, slightly darker |
| `waterTeal` | `#26C6DA` | Shallow water color |
| `waterDeep` | `#00BCD4` | Deeper water accent |
| `palmGreen` | `#4CAF50` | Palm frond fills |
| `palmDark` | `#2E7D32` | Palm frond shadows, darker fronds |
| `coconutBrown` | `#795548` | Palm trunk, coconuts |
| `shellPink` | `#FFCCBC` | Seashell decorations |
| `beachTowelRed` | `#EF5350` | Beach towel stripe |
| `beachBallWhite` | `#FFFFFF` | Beach ball base |
| `beachBallStripe1` | `#EF5350` | Red stripe |
| `beachBallStripe2` | `#42A5F5` | Blue stripe |
| `beachBallStripe3` | `#FFEE58` | Yellow stripe |
| `beachBallStripe4` | `#66BB6A` | Green stripe |

### Progress Bar Gradient

```
linear-gradient(90deg, #FF6F00, #FF8F00)
```

### Completed Path Gradient

Orange Collar at 40% opacity: `rgba(255, 111, 0, 0.4)` -- used for the SVG path's completed portion dashes.

### Upcoming Path

`rgba(62, 39, 35, 0.1)` -- very faint earthy gray for upcoming path dashes.

### White Card Background

Header chips, progress card, speech bubble all use `#FFFFFF` (pure white) with `boxShadow: 0 2px 10px rgba(0,0,0,0.07)`. This is a departure from the existing `#EFEBE9` card token to ensure these elements pop against the beach scene background.

---

## 7. Node States

### 7.1 Completed Node

| Property | Value |
|----------|-------|
| Circle size | 58x58px |
| Border radius | 29px |
| Background | `#FF6F00` (Orange Collar) |
| Border | none |
| Content | White checkmark icon, 24px |
| Box shadow | `0 6px 18px rgba(255, 111, 0, 0.3)` |
| Ground shadow | 60x14px ellipse, `radial-gradient(ellipse, rgba(62,39,35,0.12), transparent)` |
| Label color | `#FF6F00` (Orange Collar) |
| Label font | System font, 11px, weight 600, uppercase, letter-spacing 0.3px |
| Animation | None (static) |
| Interaction | Tap shows day detail bottom sheet (same as Health tab `DayDetailSheet`) |
| Accessibility | `accessibilityRole: "button"`, `accessibilityLabel: "Completed check-in for {date}. Tap to view details."` |
| Color-independent indicator | Checkmark icon -- distinguishable without color |

### 7.2 Current / Today (Not Checked In)

| Property | Value |
|----------|-------|
| Circle size | 66x66px (larger than standard 58px) |
| Border radius | 33px |
| Background | `#FF6F00` (Orange Collar) |
| Border | none |
| Content | Day number (e.g., "5"), white, 24px, weight 800 |
| Box shadow | Pulsing: alternates between `0 6px 24px rgba(255,111,0,0.45)` and `0 6px 32px rgba(255,111,0,0.6), 0 0 0 10px rgba(255,111,0,0.08)` |
| Ground shadow | 68x14px ellipse (slightly wider to match larger circle) |
| Label color | `#FF6F00`, weight 700, 12px (slightly larger than other labels) |
| Label text | "Today" (not the date) |
| Animation | `stepPulse` -- 2s ease-in-out infinite (see Animation Inventory) |
| Interaction | Tap navigates to check-in flow (`router.push('/check-in')`) |
| Accessibility | `accessibilityRole: "button"`, `accessibilityLabel: "Today's check-in. Not yet completed. Tap to start check-in."` |
| Color-independent indicator | Pulsing glow ring + larger size -- distinguishable without color |

### 7.3 Current / Today (Checked In)

Identical to **Completed Node** (Section 7.1). The pulsing animation stops, the circle shrinks from 66px to 58px, and the day number is replaced with a checkmark. The label changes from "Today" to the formatted date.

Transition from 7.2 to 7.3 should be animated: scale down from 66px to 58px over 300ms with an ease-out curve, then a brief "pop" scale to 62px and back to 58px (celebration micro-animation).

### 7.4 Upcoming Node

| Property | Value |
|----------|-------|
| Circle size | 58x58px |
| Border radius | 29px |
| Background | `#FFFFFF` (white / sand) |
| Border | 2.5px solid `#C8B8B0` (divider color) |
| Content | Day number, `#795548` (textDisabled), 20px, weight 800 |
| Box shadow | `0 4px 12px rgba(0,0,0,0.05)` (very subtle) |
| Ground shadow | 60x14px ellipse, `radial-gradient(ellipse, rgba(62,39,35,0.08), transparent)` (lighter than completed) |
| Label color | `#795548` (textDisabled) |
| Label font | System font, 11px, weight 600, uppercase, letter-spacing 0.3px |
| Animation | None (static) |
| Interaction | Non-interactive (no onPress handler). Visual feedback: press opacity 0.7 but no navigation. |
| Accessibility | `accessibilityLabel: "Upcoming check-in for {date}."` (no role=button, since not actionable) |
| Color-independent indicator | Border outline (vs. filled for completed) -- distinguishable without color |

### 7.5 Missed Node

| Property | Value |
|----------|-------|
| Circle size | 58x58px |
| Border radius | 29px |
| Background | `#D7CCC8` (Topsoil / darker sand) |
| Border | none |
| Content | Small dash "---" or subtle X mark, `#BCAAA4` (border color), 16px |
| Box shadow | none |
| Ground shadow | 60x14px ellipse at 60% opacity (dimmer than completed) |
| Label color | `#BCAAA4` (border color -- muted) |
| Label font | System font, 11px, weight 500, uppercase, letter-spacing 0.3px |
| Animation | None (static) |
| Interaction | Non-interactive |
| Accessibility | `accessibilityLabel: "Missed check-in for {date}."` |
| Color-independent indicator | Dash/X icon inside circle + absence of checkmark -- distinguishable without color |

### Summary Table

| State | Size | BG | Border | Content | Shadow | Label Color | Animated |
|-------|------|----|--------|---------|--------|-------------|----------|
| Completed | 58px | #FF6F00 | none | White checkmark | Orange glow | #FF6F00 | No |
| Current (not done) | 66px | #FF6F00 | none | White day number | Pulsing orange | #FF6F00 | Yes (pulse) |
| Current (done) | 58px | #FF6F00 | none | White checkmark | Orange glow | #FF6F00 | No |
| Upcoming | 58px | #FFFFFF | 2.5px #C8B8B0 | Gray day number | Subtle | #795548 | No |
| Missed | 58px | #D7CCC8 | none | Gray dash | None | #BCAAA4 | No |

---

## 8. Mascot Specification

### SVG Structure (Recolored from preview-dog-mascot.html)

The mascot is a sitting dog built from SVG groups. The original blue (#6B8CFF) body fill is recolored to earthy brown/tan tones to match the PupLog "Earthy Dog Park" palette.

**Recolored Palette:**

| Part | Original Color | New Color | Token |
|------|---------------|-----------|-------|
| Body fill | `#6B8CFF` (blue) | `#D7CCC8` (Topsoil) | Body base |
| Body lighter areas | `#6B8CFF` | `#E8DDD8` (lighter Topsoil) | Belly, inner areas |
| Outlines | `#2D2D2D` (near-black) | `#5D4037` (primaryLight) | All stroke lines |
| Eyes | `#2D2D2D` | `#3E2723` (primary / Dark Loam) | Eye fills |
| Nose | `#2D2D2D` | `#3E2723` | Nose fill |
| Ears inner | -- | `#C4B5AD` (slightly darker Topsoil) | Inner ear shading |
| Tail tip | -- | `#BCAAA4` (border color) | Lighter tail tip |

**SVG Groups (from preview-dog-mascot.html):**

```
<svg viewBox="0 0 500 450">
  <g class="tail">           // Tail curves
  <g class="body-group">     // Torso, legs, paws
  <g class="head-group">     // Head circle
    <g class="ear-left">     // Left ear
    <g class="ear-right">    // Right ear
    <g class="eye-left">     // Left eye circle
    <g class="eye-right">    // Right eye circle
    <g class="nose">          // Nose ellipse
    // Mouth paths
  <g class="butterfly-group"> // Butterfly (optional decoration)
```

**Display Size:** The mascot container is 120x120px on screen. The SVG viewBox (0 0 500 450) scales proportionally within this container.

### Mascot Animations

All animations use `react-native-reanimated` `useSharedValue` + `withRepeat` + `withSequence`.

| Animation | Target | Type | Duration | Amplitude | Timing | Details |
|-----------|--------|------|----------|-----------|--------|---------|
| **Tail Wag** | `.tail` group | Rotation | 0.6s per cycle | -15deg to +20deg | ease-in-out, infinite | Transform origin: base of tail (148, 270 in SVG coordinates) |
| **Body Breathe** | `.body-group` | Scale Y | 3s per cycle | scaleY 1.0 to 1.012 + translateY 0 to -1px | ease-in-out, infinite | Transform origin: center of body (230, 300) |
| **Head Tilt** | `.head-group` | Rotation | 4s per cycle | 0deg to +2deg to -1.5deg | ease-in-out, infinite | Transform origin: neck pivot (235, 195) |
| **Ear Flop Left** | `.ear-left` | Rotation | 4s per cycle | 0deg to -3deg | ease-in-out, infinite | Transform origin: ear base (195, 175) |
| **Ear Flop Right** | `.ear-right` | Rotation | 4s per cycle | 0deg to +3deg | ease-in-out, infinite | Transform origin: ear base (270, 175) |
| **Blink** | `.eye-left`, `.eye-right` | Scale Y | 4s per cycle | scaleY 1.0 to 0.1 at 43% | ease-in-out, infinite | Right eye offset by 0.05s. Quick close/open at the 43% mark of each 4s cycle |
| **Nose Twitch** | `.nose` | Scale | 5s per cycle | scale(1.08, 0.95) at 93%, scale(0.95, 1.05) at 96% | ease-in-out, infinite | Quick twitch near end of cycle |
| **Float Bob** | Mascot container | Translate Y | 3s per cycle | 0px to -12px | ease-in-out, infinite | Mascot gently bobs up and down above the current node |

### Ground Shadow (below mascot)

- 60x12px ellipse
- `radial-gradient(ellipse, rgba(62, 39, 35, 0.18), transparent)`
- `marginTop: -6px` (overlaps slightly with mascot bottom)
- Synchronized animation with float bob:
  - When mascot is at lowest point (translateY: 0): shadow scaleX 1.0, opacity 1.0
  - When mascot is at highest point (translateY: -12px): shadow scaleX 0.65, opacity 0.5
  - Duration: 3s, ease-in-out, infinite (matches float bob)

### Speech Bubble

**Visual:**
- `backgroundColor: #FFFFFF`
- `borderRadius: 16px`
- `padding: 12px 30px 12px 14px` (extra right padding for dismiss button)
- `maxWidth: 190px`
- `boxShadow: 0 4px 16px rgba(0,0,0,0.08)`
- Text: system font, 13px, weight 500, Dark Loam (#3E2723), line-height 1.45
- Left-pointing triangle tail: 10px wide, positioned at `left: -8px`, `top: 24px`

**Dismiss Button:**
- "X" icon, positioned `top: 6px`, `right: 10px`
- 16px, color: #795548 (textDisabled)
- Touch target: 32x32px (padded invisible area)
- `accessibilityRole: "button"`, `accessibilityLabel: "Dismiss message"`

**Positioning:**
- Relative to mascot container
- `top: -10px` (above mascot center)
- `left: 110px` (to the right of mascot)
- When mascot is on the right side of the path, bubble flips to `right: 110px` with a right-pointing triangle tail
- `zIndex: 31` (above mascot's zIndex 30)
- `pointerEvents: 'box-none'` on mascot wrapper, `pointerEvents: 'auto'` on bubble

**Entrance Animation:**
- `opacity: 0 -> 1` + `scale: 0.9 -> 1.0` + `translateY: -4px -> 0`
- Duration: 0.3s
- Timing: spring (damping: 15, stiffness: 150)
- Triggers after mascot float bob completes first cycle (3s delay from mount)

**Dismiss Animation:**
- `opacity: 1 -> 0` + `scale: 1.0 -> 0.9` + `translateY: 0 -> -4px`
- Duration: 0.2s
- Timing: ease-out
- After animation completes, component unmounts (`display: none`)

**Message Rules:**

| Condition | Message |
|-----------|---------|
| 0/7 completed, start of week | "A new week begins! Let's get {dogName} started." |
| Today not checked in, streak > 0 | "Time for {dogName}'s check-in! Let's keep the streak going." |
| Today not checked in, streak === 0 | "Ready to check in on {dogName}?" |
| Today already checked in | "Great job! {dogName}'s data is logged for today." |
| 7/7 completed | "Amazing week! {dogName}'s health data is looking great!" |
| Missed days exist, today not done | "Every check-in counts! Let's log today." |
| After check-in completion (re-entering screen) | "All done for today! See you tomorrow." |

The speech bubble is **dismissable per session**. Once dismissed, it does not reappear until the next app launch or tab switch. Store dismissed state in a local `useState` (not persisted).

---

## 9. Scene Layout

### Layer Stack (Bottom to Top)

| Z-Index | Layer | Description |
|---------|-------|-------------|
| 0 | Sky gradient | Full-screen background gradient |
| 1 | Clouds | 2-3 decorative cloud shapes |
| 2 | Water strip | Horizontal band with wave animation |
| 3 | Sand area | Main beach sand with gradient |
| 4 | Beach decorations | Palm trees, towel, ball, shells, pool |
| 5 | Ground shadows | Elliptical shadow patches on sand |
| 6 | SVG path (upcoming) | Gray dotted trail |
| 7 | SVG path (completed) | Orange dotted trail |
| 8 | Ground decorations | Paw prints, bones, leaves (subtle emojis at 25% opacity) |
| 9 | Grass tufts / stones | CSS-rendered vegetation and pebbles |
| 10 | Step nodes | Day circles with labels |
| 20 | Header + progress card | Sticky/floating UI elements |
| 30 | Mascot | Dog SVG with float animation |
| 31 | Speech bubble | Message card with dismiss |
| 50 | Tab bar | Fixed bottom navigation |

### Sky Gradient Background

Full viewport height, behind all other elements.

```
linear-gradient(180deg,
  #87CEEB 0%,        // Sky Blue at top
  #4A90D9 30%,       // Deep Sky at horizon
  #26C6DA 35%,       // Water teal transition
  #00BCD4 40%,       // Deeper water
  #E8D5B0 42%,       // Wet sand at waterline
  #F5E6C8 50%,       // Sand starts
  #F5E6C8 100%       // Sand continues to bottom
)
```

The gradient covers the entire scrollable content area (1800px+ height). The sky portion is visible at the very top of the scroll, and the sand dominates the journey area.

### Clouds

2-3 simple white cloud shapes positioned in the sky area.

- Cloud 1: `top: 70px`, `left: 30px`, 80x30px, `borderRadius: 15px`, `backgroundColor: rgba(255,255,255,0.7)`
- Cloud 2: `top: 100px`, `right: 50px`, 100x35px, `borderRadius: 18px`, `backgroundColor: rgba(255,255,255,0.5)`
- Cloud 3 (smaller): `top: 85px`, `left: 180px`, 50x20px, `borderRadius: 10px`, `backgroundColor: rgba(255,255,255,0.4)`

Clouds are purely decorative and non-interactive. They scroll with the content (no parallax -- they are part of the scene, not the background).

### Water Strip

A horizontal band approximately 20px tall, positioned at about 38-42% of the scene height (roughly y=700px in the scroll content).

- `backgroundColor: #26C6DA` with horizontal wave pattern
- Subtle wave animation: `translateX` oscillating +/-5px over 4s, ease-in-out, infinite
- `opacity: 0.6` -- the sand gradient beneath shows through slightly
- Purely decorative, no interaction

### Sand Area

The primary surface where the journey path is drawn. Occupies roughly 50-100% of the scene height.

- Base color: `#F5E6C8`
- Subtle horizontal "depth lines" every 150-200px: `1px solid rgba(62, 39, 35, 0.04)` (extremely faint, same pattern as the existing prototype)
- Near the water line (top of sand): slightly darker `#E8D5B0` (wet sand) gradient fading to `#F5E6C8` over 60px

### Beach Decorations

All decorations are positioned at the **edges** of the screen (left 0-60px or right 0-60px) to avoid overlapping with the journey path in the center. Each is purely decorative with `accessibilityElementsHidden: true`.

**Palm Trees (2):**

Palm Tree Left:
- Position: `top: 280px`, `left: 5px`
- Trunk: 8px wide, 80px tall, `#795548` (coconutBrown), slight curve via `borderRadius`
- Fronds: 3-4 SVG arc paths, fills `#4CAF50` and `#2E7D32`, radiating from trunk top
- Coconuts: 2-3 circles, 8px diameter, `#795548`, clustered at frond base
- Total footprint: ~50x140px
- `opacity: 0.35` (subtle, not distracting)

Palm Tree Right:
- Position: `top: 600px`, `right: 5px`
- Mirrored version of left palm, slightly smaller (70px trunk)
- `opacity: 0.30`

**Beach Towel:**
- Position: `top: 450px`, `left: 12px`
- 35x55px rectangle, `borderRadius: 4px`
- Alternating horizontal stripes: `#EF5350` (red) and `#FFFFFF` (white), each 8px tall
- Rotated `transform: rotate(-12deg)` for casual placement
- `opacity: 0.25`

**Beach Ball:**
- Position: `top: 750px`, `right: 20px`
- 24px diameter circle
- Quartered with 4 colors: `#EF5350`, `#42A5F5`, `#FFEE58`, `#66BB6A`
- White cross lines separating quarters
- `opacity: 0.25`

**Seashells (3):**
- Shell 1: `top: 350px`, `right: 15px`, 12px, `#FFCCBC` (shellPink), simple fan SVG shape
- Shell 2: `top: 550px`, `left: 20px`, 10px, `#FFCCBC`
- Shell 3: `top: 900px`, `right: 25px`, 14px, `#FFCCBC`
- `opacity: 0.20`

**Tide Pool (optional):**
- Position: `top: 850px`, `left: 15px`
- Irregular ellipse ~40x25px
- `backgroundColor: rgba(38, 198, 218, 0.15)` (waterTeal at 15%)
- `borderRadius: 50%`
- `border: 1px solid rgba(38, 198, 218, 0.10)`

### Parallax Scrolling

The beach background layers scroll at different rates than the foreground content to create depth:

- **Sky + clouds**: scroll at `0.4x` rate (40% of content scroll speed)
- **Water strip + sand gradient**: scroll at `0.6x` rate
- **Decorations (palms, towel, ball)**: scroll at `0.8x` rate
- **Journey path + nodes + mascot**: scroll at `1.0x` rate (normal)

Implementation: Apply `Animated.event` scroll handler and use `interpolate` on scroll offset to compute `translateY` offsets for each layer.

---

## 10. SVG Path

### Winding Path Specification

The path is drawn as an SVG `<path>` element within a `<Svg viewBox="0 0 390 1200">` container. The viewBox matches the screen width (390px for iPhone 14 Pro) and extends 1200px vertically.

The path winds in a gentle S-curve, alternating left and right, connecting 7 node positions.

### Node Positions (Approximate)

| Node | Day | X Center | Y Center | CSS Position |
|------|-----|----------|----------|--------------|
| 0 | Monday | 195 | 60 | `top: 40px; left: calc(50% - 29px)` |
| 1 | Tuesday | 261 | 150 | `top: 130px; left: calc(67% - 29px)` |
| 2 | Wednesday | 101 | 270 | `top: 245px; left: calc(26% - 29px)` |
| 3 | Thursday | 257 | 400 | `top: 370px; left: calc(66% - 29px)` |
| 4 | Friday | 105 | 510 | `top: 490px; left: calc(27% - 33px)` |
| 5 | Saturday | 257 | 640 | `top: 620px; left: calc(66% - 29px)` |
| 6 | Sunday | 109 | 770 | `top: 745px; left: calc(28% - 29px)` |
| Milestone | -- | 257 | 910 | `top: 880px; left: calc(66% - 36px)` |

Note: For "current" node (66px wide), adjust left offset by `-33px` instead of `-29px` to center.

### Bezier Curve Coordinates

**Full path (all 7 nodes + milestone):**

```svg
M 195 60
C 195 60, 285 110, 280 150
C 275 190, 115 220, 110 270
C 105 320, 275 360, 280 400
C 285 440, 125 480, 120 510
C 115 550, 275 590, 275 640
C 275 690, 115 720, 120 770
C 125 820, 280 860, 275 910
```

This is drawn as TWO overlapping `<path>` elements:

1. **Completed path** -- from M 195 60 to the current node position. Orange dashes.
2. **Upcoming path** -- from the current node position to the end. Gray dashes.

The split point changes dynamically based on how many nodes are completed.

### Path Styling

**Completed Path:**
```
fill: none
stroke: #FF6F00 (accent / Orange Collar)
stroke-width: 5
stroke-linecap: round
stroke-dasharray: 14 10
opacity: 0.4
```

**Upcoming Path:**
```
fill: none
stroke: rgba(62, 39, 35, 0.1)
stroke-width: 5
stroke-linecap: round
stroke-dasharray: 14 10
```

### Path Segment Splitting

To split the path at the current node position, compute the SVG path segments between each pair of nodes and render them conditionally:

```typescript
const PATH_SEGMENTS = [
  // Segment 0: Start -> Node 0
  'M 195 60',
  // Segment 1: Node 0 -> Node 1
  'C 195 60, 285 110, 280 150',
  // Segment 2: Node 1 -> Node 2
  'C 275 190, 115 220, 110 270',
  // Segment 3: Node 2 -> Node 3
  'C 105 320, 275 360, 280 400',
  // Segment 4: Node 3 -> Node 4
  'C 285 440, 125 480, 120 510',
  // Segment 5: Node 4 -> Node 5
  'C 115 550, 275 590, 275 640',
  // Segment 6: Node 5 -> Node 6
  'C 275 690, 115 720, 120 770',
  // Segment 7: Node 6 -> Milestone
  'C 125 820, 280 860, 275 910',
];

// Completed path = segments 0 through currentNodeIndex + 1
// Upcoming path = segments currentNodeIndex + 1 through end
```

The simpler approach (used in the prototype) is to just have two pre-defined path strings and set the split at the appropriate node's coordinates.

---

## 11. Header & Progress Card

### Header Layout (Full Specification)

```
[Dog Chip]                    [Streak Pill] [Profile Btn]
```

**Exact dimensions:**

| Element | Width | Height | Position |
|---------|-------|--------|----------|
| Header container | 390px (full width) | auto | Below status bar (54px) |
| Left padding | 20px | -- | -- |
| Right padding | 20px | -- | -- |
| Dog chip | auto (content width) | 38px | Left-aligned |
| Streak pill | auto | 30px | Right group |
| Profile button | 38px | 38px | Rightmost |
| Gap between streak and profile | 10px | -- | -- |
| Bottom padding | 16px | -- | -- |

**Dog Chip Internal Layout:**

```
[Avatar 26px] [Name] [Arrow]
```

- Total height: 38px
- Horizontal padding: 8px (left, around avatar) + 14px (right)
- Avatar: 26x26px circle, accentLight background, paw emoji or dog photo
- Gap between avatar and name: 6px
- Name: 14px bold, Dark Loam
- Arrow (chevron down): 10px, textDisabled, 2px left margin
- Arrow hidden when only 1 dog

**Streak Pill Internal Layout:**

```
[Fire 18px] [Count]
```

- Horizontal padding: 14px each side
- Vertical padding: 6px each
- Gap between fire and count: 6px
- Fire emoji: 18px
- Count text: 16px, weight 700, Dark Loam

### Progress Card (Full Specification)

**Exact dimensions:**

| Element | Width | Height/Size | Spacing |
|---------|-------|-------------|---------|
| Card container | 350px (390 - 2*20px margins) | auto | margin: 0 20px 20px |
| Card padding | -- | -- | 14px 16px |
| Title "This Week's Journey" | auto | 15px line height | -- |
| Fraction "X / 7 days" | auto | 13px line height | -- |
| Header row bottom margin | -- | -- | 8px |
| Progress bar | 100% of card inner width | 8px | -- |
| Subtitle | auto | 12px line height | marginTop: 6px |

**Progress Bar Width Calculation:**

```typescript
const completedCount = weekDays.filter(day => calendarData[day.date]).length;
const progressPercent = (completedCount / 7) * 100;
// Minimum width when > 0: 8px (so bar tip is visible at 1/7)
```

---

## 12. Animation Inventory

### Node Pulse (Current Day)

```
Name:           stepPulse
Target:         Current node circle box-shadow
Property:       boxShadow
Duration:       2s per cycle
Timing:         ease-in-out
Repeat:         infinite
Keyframes:
  0%:   boxShadow: 0 6px 24px rgba(255, 111, 0, 0.45)
  50%:  boxShadow: 0 6px 32px rgba(255, 111, 0, 0.6),
                   0 0 0 10px rgba(255, 111, 0, 0.08)
  100%: boxShadow: 0 6px 24px rgba(255, 111, 0, 0.45)
```

In React Native (no boxShadow animation), implement as an `Animated.View` wrapper with `opacity` and `scale` interpolation on a semi-transparent orange ring behind the circle:

```
Ring opacity:  0.3 -> 0.6 -> 0.3 (2s cycle)
Ring scale:    1.0 -> 1.25 -> 1.0 (2s cycle)
Ring size:     76x76px (10px larger than 66px node on each side)
Ring color:    rgba(255, 111, 0, 0.15)
Ring borderRadius: 38px
```

### Dog Float Bob

```
Name:           dogFloat
Target:         Mascot container translateY
Property:       translateY
Duration:       3s per cycle
Timing:         ease-in-out
Repeat:         infinite
Amplitude:      0px to -12px
Keyframes:
  0%:   translateY(0)
  50%:  translateY(-12px)
  100%: translateY(0)
```

### Mascot Ground Shadow Breath

```
Name:           shadowBreath
Target:         Mascot ground shadow
Properties:     scaleX, opacity
Duration:       3s per cycle (synchronized with dogFloat)
Timing:         ease-in-out
Repeat:         infinite
Keyframes:
  0%:   scaleX(1.0), opacity(1.0)
  50%:  scaleX(0.65), opacity(0.5)
  100%: scaleX(1.0), opacity(1.0)
```

### Tail Wag

```
Name:           tailWag
Target:         .tail group rotation
Property:       rotate
Duration:       0.6s per cycle
Timing:         ease-in-out
Repeat:         infinite
Origin:         148px, 270px (SVG coordinates)
Keyframes:
  0%:   rotate(-15deg)
  50%:  rotate(20deg)
  100%: rotate(-15deg)
```

### Body Breathe

```
Name:           bodyBreathe
Target:         .body-group scaleY + translateY
Properties:     scaleY, translateY
Duration:       3s per cycle
Timing:         ease-in-out
Repeat:         infinite
Origin:         230px, 300px (SVG coordinates)
Keyframes:
  0%:   scaleY(1.0), translateY(0)
  50%:  scaleY(1.012), translateY(-1px)
  100%: scaleY(1.0), translateY(0)
```

### Blink

```
Name:           blink
Target:         .eye-left, .eye-right scaleY
Property:       scaleY
Duration:       4s per cycle
Timing:         ease-in-out
Repeat:         infinite
Origin:         Eye center (218,192 left; 248,192 right)
Keyframes:
  0%:   scaleY(1.0)
  42%:  scaleY(1.0)
  43%:  scaleY(0.1)   // eyes close
  44%:  scaleY(1.0)   // eyes open
  100%: scaleY(1.0)
Right eye offset: 0.05s delay
```

### Head Tilt

```
Name:           headTilt
Target:         .head-group rotation
Property:       rotate
Duration:       4s per cycle
Timing:         ease-in-out
Repeat:         infinite
Origin:         235px, 195px (SVG coordinates)
Keyframes:
  0%:   rotate(0deg)
  30%:  rotate(2deg)
  70%:  rotate(-1.5deg)
  100%: rotate(0deg)
```

### Ear Flop

```
Name:           earFlop
Target:         .ear-left rotation (left), .ear-right rotation (right)
Property:       rotate
Duration:       4s per cycle
Timing:         ease-in-out
Repeat:         infinite
Left origin:    195px, 175px
Right origin:   270px, 175px
Left keyframes:
  0%:   rotate(0deg)
  40%:  rotate(-3deg)
  100%: rotate(0deg)
Right keyframes:
  0%:   rotate(0deg)
  40%:  rotate(3deg)
  100%: rotate(0deg)
```

### Nose Twitch

```
Name:           noseTwitch
Target:         .nose scale
Property:       scaleX, scaleY
Duration:       5s per cycle
Timing:         ease-in-out
Repeat:         infinite
Origin:         233px, 205px (SVG coordinates)
Keyframes:
  0%:   scale(1.0, 1.0)
  90%:  scale(1.0, 1.0)
  93%:  scale(1.08, 0.95)
  96%:  scale(0.95, 1.05)
  100%: scale(1.0, 1.0)
```

### Speech Bubble Entrance

```
Name:           bubbleEntrance
Target:         Speech bubble container
Properties:     opacity, scale, translateY
Duration:       0.3s
Timing:         spring (damping: 15, stiffness: 150)
Repeat:         once (on mount, with 3s delay)
Keyframes:
  From: opacity(0), scale(0.9), translateY(-4px)
  To:   opacity(1), scale(1.0), translateY(0)
```

### Speech Bubble Dismiss

```
Name:           bubbleDismiss
Target:         Speech bubble container
Properties:     opacity, scale, translateY
Duration:       0.2s
Timing:         ease-out
Repeat:         once (on dismiss tap)
Keyframes:
  From: opacity(1), scale(1.0), translateY(0)
  To:   opacity(0), scale(0.9), translateY(-4px)
```

### Progress Bar Fill

```
Name:           progressFill
Target:         Progress bar fill width
Property:       width (percentage)
Duration:       0.5s
Timing:         ease-out
Repeat:         once (on value change)
Keyframes:
  From: previous width percentage
  To:   new width percentage
```

### Node Completion Celebration

```
Name:           nodeComplete
Target:         Node that just became "completed" (when returning from check-in)
Properties:     scale
Duration:       0.5s total
Timing:         spring
Repeat:         once
Keyframes:
  0ms:    scale(66/58 = 1.14)  // starts at current-node size
  150ms:  scale(1.0)            // shrinks to completed size
  300ms:  scale(1.08)           // brief pop
  500ms:  scale(1.0)            // settle
```

### Milestone Unlock Glow

```
Name:           milestoneGlow
Target:         Milestone circle shadow ring
Properties:     opacity, scale
Duration:       2s per cycle
Timing:         ease-in-out
Repeat:         infinite (only when all 7 complete)
Keyframes:
  0%:   ring opacity(0.2), ring scale(1.0)
  50%:  ring opacity(0.4), ring scale(1.15)
  100%: ring opacity(0.2), ring scale(1.0)
Ring: 82x82px, rgba(255, 111, 0, 0.12), borderRadius: 41px
```

### Parallax Scroll Factor

```
Background layer translate factor: 0.4x
- For every 100px the content scrolls, background layers move 40px
Implementation:
  backgroundTranslateY = scrollOffset * -0.4
  (Negative because background moves opposite to scroll direction to create depth)
```

For water and decorations, the factor is 0.6x and 0.8x respectively (see Section 9).

---

## 13. Edge Cases & States

### No Dogs (Empty State)

**Trigger:** `dogs.length === 0 && !isLoading`

**Behavior:**
- Do not render the beach scene, journey path, nodes, mascot, or progress card
- Render centered empty state (same as current home screen empty state):
  - PupLog logo (96x96px, Orange Collar bg, white paw)
  - "Welcome to PupLog!"
  - "Add your first dog to start your health journey."
  - "Add Your Dog" CTA button
- The tab bar FAB shows "+" and navigates to `/add-dog`

### Missed Days

**Visual:** Missed nodes use the "missed" state (Section 7.5): Topsoil background, dash icon, muted label.

**Path rendering:** The completed path draws orange dashes through all past nodes that have check-ins, then transitions to gray at the first gap. If days 1 and 3 are completed but day 2 is missed, the path is orange from node 0 to node 0, then gray from node 0 onward. (Simplification: the completed path runs from start to the LAST completed node before the current node, not skipping.)

Alternative (simpler): The completed path simply stops at the highest consecutive completed node from the start. So if Mon+Tue are done but Wed is missed, the orange path goes Mon->Tue then gray from Tue onward, even if Thu is also done. This emphasizes streaks.

### Multiple Dogs

**Dog selector chip** in the header shows the currently selected dog's name. Tapping it opens the existing `DogSelector` bottom sheet component.

**Per-dog data:** Each dog has its own `calendarData`, `checkin_streak`, and `last_checkin_date`. When the user switches dogs:
1. Clear existing node states
2. Fetch `calendarData` for the new dog's current month
3. Recompute all 7 node states from the new dog's data
4. Update mascot speech bubble with new dog's name
5. Reset speech bubble dismissed state (show it again for new dog)

The journey path layout (node positions, SVG curves) does NOT change between dogs -- only the node states and progress card values change.

### Week Complete (Celebration)

When the 7th check-in is submitted (transitioning to 7/7):
1. The node changes from "current" to "completed" with the celebration animation (scale pop)
2. Progress bar fills to 100% with animation
3. Progress card subtitle changes to "Perfect week!"
4. Mascot moves from the last node to hover above the milestone trophy
5. Milestone node transitions from locked to unlocked (glow animation starts)
6. Speech bubble shows "Amazing week! {dogName}'s health data is looking great!"
7. Optional: confetti burst animation (subtle, 1-2 seconds, not blocking)

### Week Rollover (Sunday -> Monday)

When the current date transitions from Sunday to Monday (detected on screen mount or app foreground):
1. Previous week's journey is discarded (not shown -- there is no "history" view on the home screen)
2. All 7 nodes reset to "upcoming" state
3. Progress card resets to "0 / 7 days"
4. Mascot moves to node 0 (Monday)
5. Speech bubble shows the "new week" message
6. Streak count in the pill updates from `dog.checkin_streak` (which is maintained server-side and is independent of the weekly journey view)

Note: The streak counter and the 7-day journey are independent concepts. A dog with a 14-day streak starting a new week still shows 0/7 on the progress card, but 14 in the streak pill.

### Reduced Motion (Accessibility)

When `useReducedMotion()` returns `true` (from `react-native-reanimated`):

**All animations are disabled.** Specifically:
- Node pulse: static orange glow (no animation)
- Dog float bob: static position (translateY: -6px, halfway point)
- Tail wag: static position (rotate: 2.5deg, neutral)
- Body breathe: static (no scale)
- Blink: eyes always open (no scaleY change)
- Head tilt: static (no rotation)
- Ear flop: static (no rotation)
- Nose twitch: static (no scale)
- Shadow breath: static (scaleX: 0.82, opacity: 0.75, halfway point)
- Speech bubble: appears instantly (no spring animation)
- Progress bar: fills instantly (no animated width)
- Node completion: no scale pop, instant state change
- Milestone glow: static ring at 30% opacity, no pulse
- Parallax: disabled, all layers scroll at 1.0x

All static equivalents maintain the same visual appearance as the "resting" mid-point of each animation, ensuring the screen looks correct without motion.

### Loading State

While `calendarData` is being fetched:
- Show the header and progress card with placeholder values ("-- / 7 days")
- Show the beach scene and path with all nodes in "upcoming" state (skeleton)
- Once data loads, animate nodes to their correct states over 300ms with staggered delays (50ms between each node)

### Error State

If `calendarData` fetch fails:
- Show the beach scene with all nodes in "upcoming" state
- Show a small error banner below the progress card: "Couldn't load check-in data. Pull to refresh."
- Pull-to-refresh on the ScrollView retries the fetch

---

## 14. Accessibility Requirements

### WCAG AA Compliance

| Requirement | Implementation |
|-------------|---------------|
| Text contrast ratio >= 4.5:1 | Dark Loam (#3E2723) on white (#FFFFFF) = 13.5:1. textDisabled (#795548) on Limestone (#FAFAFA) = 5.1:1. Both pass AA. |
| Large text contrast >= 3:1 | Orange Collar (#FF6F00) on white (#FFFFFF) = 4.0:1. Passes AA for large text (>=18px bold). Node labels are 11-12px, so they use textDisabled instead. |
| Touch targets >= 48dp | All nodes: 58px or 66px (exceeds 48dp). Dog chip: 38px visible height but 48dp invisible hit area. Profile button: 38px visible with 48dp hit area. Dismiss button on speech bubble: 32px visible with 48dp hit area. |
| Focus indicators | Pressable components show press feedback (opacity: 0.85 or scale: 0.92). VoiceOver focus ring renders natively. |

### Accessibility Labels

| Element | Role | Label |
|---------|------|-------|
| Dog chip | `button` | "Viewing {dogName}. Tap to switch dogs." (multi-dog) or "Viewing {dogName}." (single dog) |
| Streak pill | none (info) | "{count}-day check-in streak" |
| Profile button | `button` | "View profile and settings" |
| Progress card | none (info) | "This week's journey. {X} of 7 days completed." |
| Completed node | `button` | "Completed check-in for {date}. Tap to view details." |
| Current node (not done) | `button` | "Today's check-in. Not yet completed. Tap to start check-in." |
| Current node (done) | `button` | "Completed check-in for today. Tap to view details." |
| Upcoming node | none | "Upcoming check-in for {date}." |
| Missed node | none | "Missed check-in for {date}." |
| Milestone (locked) | none | "Week completion milestone. Not yet unlocked." |
| Milestone (unlocked) | none | "Week completion milestone unlocked! Perfect week." |
| Speech bubble dismiss | `button` | "Dismiss message" |
| Mascot | none (decorative) | `accessibilityElementsHidden: true` |
| Beach decorations | none (decorative) | `accessibilityElementsHidden: true` |
| Palm trees | none (decorative) | `accessibilityElementsHidden: true` |
| SVG path | none (decorative) | `accessibilityElementsHidden: true` |

### Color-Independent State Indicators

Every node state is distinguishable without color:

| State | Color-Independent Indicator |
|-------|---------------------------|
| Completed | Checkmark icon inside circle |
| Current (not done) | Pulsing glow ring + larger size (66px vs 58px) |
| Current (done) | Checkmark icon (same as completed) |
| Upcoming | Border outline (unfilled circle) + day number visible |
| Missed | Dash/X icon inside circle + no border |

### Screen Reader Announcements

- When navigating to the home screen, announce: "Home screen. {dogName}'s health journey. {X} of 7 check-ins completed this week."
- When a node state changes (e.g., after completing a check-in and returning), announce: "Check-in completed for {date}. {X} of 7 days this week."
- When switching dogs, announce: "Switched to {dogName}. {X} of 7 check-ins this week."

### Reduced Motion

See Section 13 (Edge Cases) -- all animations disabled, static equivalents displayed.

---

## 15. What Changes vs. Stays

### Components Removed from Home Screen

| Current Component | File | What Happens |
|-------------------|------|-------------|
| `FlippableDogCard` | `src/components/ui/FlippableDogCard.tsx` | **Removed from home.** Dog info (name, breed) moves to dog chip in header. Detail view accessible via dog selector or edit screen. Component file remains (may be used elsewhere). |
| `StreakCounter` (inline widget) | `src/components/ui/StreakCounter.tsx` | **Replaced** by streak pill in header. The pill reuses `dog.checkin_streak` data. Component file remains for Health tab use. |
| `EnergyCard` | Inline in `app/(tabs)/index.tsx` | **Removed entirely.** Energy data is still available in check-ins but not displayed on home screen. |
| Week strip (inline) | Inline in `app/(tabs)/index.tsx` | **Replaced** by the 7-node journey path. Same data (`calendarData` + `getWeekDays()`) drives the new journey nodes. |
| `GettingStartedCard` | `src/components/ui/GettingStartedCard.tsx` | **Removed from home.** Its purpose (motivate first check-ins) is now served by the journey path's empty state + mascot speech bubble. Component file remains. |
| Sniff Around article carousel | Inline in `app/(tabs)/index.tsx` | **Removed from home.** Articles are accessible via the Learn tab. Home screen focuses solely on the journey. |
| `DisclaimerFooter` | `src/components/legal/DisclaimerFooter.tsx` | **Removed from home screen.** Still present on triage results, article detail, and other screens as legally required. The home screen is not a triage surface and does not need a medical disclaimer. |
| Greeting row ("Good morning, friend") | Inline in `app/(tabs)/index.tsx` | **Removed.** The mascot speech bubble serves the personal greeting function. |
| Animated header (scroll hide/show) | Inline in `app/(tabs)/index.tsx` | **Replaced** by a simpler sticky header that scrolls with the content. The journey path has enough vertical content that header hiding is not needed. |

### Components Added to Home Screen

| New Component | Purpose | New File |
|---------------|---------|----------|
| `JourneyPath` | SVG winding dotted path (completed + upcoming) | `src/components/ui/JourneyPath.tsx` |
| `JourneyNode` | Individual day circle with 5 states | `src/components/ui/JourneyNode.tsx` |
| `JourneyMascot` | SVG dog with animations + speech bubble | `src/components/ui/JourneyMascot.tsx` |
| `MascotSpeechBubble` | Contextual message with dismiss | `src/components/ui/MascotSpeechBubble.tsx` |
| `WeekProgressCard` | "This Week's Journey" card with progress bar | `src/components/ui/WeekProgressCard.tsx` |
| `JourneyHeader` | Dog chip + streak pill + profile button row | `src/components/ui/JourneyHeader.tsx` |
| `BeachScene` | Background layers (sky, clouds, water, sand, decorations) | `src/components/ui/BeachScene.tsx` |
| `MilestoneNode` | Trophy node at end of week | `src/components/ui/MilestoneNode.tsx` |

### Components Unchanged

| Component | Status | Notes |
|-----------|--------|-------|
| `FloatingTabBar` | **No changes** | Still 5 tabs with centered FAB |
| `DogSelector` | **No changes** | Bottom sheet, triggered by dog chip tap instead of dedicated row |
| Tab bar navigation | **No changes** | Home, Health, Learn, Triage, Settings |
| Check-in flow | **No changes** | `app/check-in.tsx` still pushed as full-screen modal |

### Data Flows Reused

| Data | Source | Current Usage | New Usage |
|------|--------|---------------|-----------|
| `dogs` | `useDogStore()` | Dog cards, selector | Dog chip, selector |
| `selectedDogId` | `useDogStore()` | Card highlighting | Journey data filtering |
| `selectedDog.name` | `useDogStore()` | Card title | Dog chip label, speech bubble |
| `selectedDog.checkin_streak` | `useDogStore()` | StreakCounter | Streak pill |
| `selectedDog.last_checkin_date` | `useDogStore()` | FlippableDogCard back | Today node state |
| `calendarData` | `useHealthStore()` | Week strip dots | Node state computation |
| `fetchMonthData()` | `useHealthStore()` | Week strip | Node state computation |
| `fetchDogs()` | `useDogStore()` | Pull-to-refresh | Pull-to-refresh |

### New Data Requirements

None. All data needed for the journey map already exists in `dogStore` and `healthStore`. No new Supabase queries, Edge Functions, or database columns are required.

---

## 16. Existing Assets

### HTML Prototypes

| File | Path | Contents |
|------|------|----------|
| Journey Home Prototype | `/Users/rohitsandur/Documents/Projects/dog_app_ui/preview-journey-home.html` | Full interactive prototype with angled ground plane, winding SVG path, 7 nodes (4 completed, 1 current, 2 upcoming), Lottie dog mascot, speech bubble, progress card, parallax scrolling. Uses earthy ground theme (pre-beach pivot). |
| Dog Mascot SVG | `/Users/rohitsandur/Documents/Projects/dog_app_ui/preview-dog-mascot.html` | Standalone SVG dog with all animation keyframes (tail wag, body breathe, head tilt, ear flop, blink, nose twitch). Currently blue (#6B8CFF) body, needs recoloring to earthy brown/tan. Butterfly companion included. |

### Theme File

| File | Path | Contents |
|------|------|----------|
| Theme tokens | `/Users/rohitsandur/Documents/Projects/dog_app_ui/src/constants/theme.ts` | All `COLORS`, `SPACING`, `FONT_SIZES`, `BORDER_RADIUS`, `FONTS`, `SHADOWS`, `MIN_TOUCH_TARGET` constants. The source of truth for existing design tokens. |

### Current Home Screen

| File | Path | Contents |
|------|------|----------|
| Home screen | `/Users/rohitsandur/Documents/Projects/dog_app_ui/app/(tabs)/index.tsx` | Current implementation: FlippableDogCard, StreakCounter, EnergyCard, week strip, Sniff Around carousel, GettingStartedCard, animated header. Contains `getWeekDays()` utility function that can be reused for journey node date computation. |

### Current Components (To Be Reused/Referenced)

| Component | Path | Reuse Strategy |
|-----------|------|---------------|
| `StreakCounter` | `src/components/ui/StreakCounter.tsx` | Data pattern reused in streak pill. Component may remain for Health tab. |
| `GettingStartedCard` | `src/components/ui/GettingStartedCard.tsx` | Motivation messaging pattern reused in speech bubble rules. Component remains for potential use. |
| `FlippableDogCard` | `src/components/ui/FlippableDogCard.tsx` | `formatLastCheckIn()` utility can be extracted and reused. Flip animation pattern not reused. |
| `DogSelector` | `src/components/ui/DogSelector.tsx` | Used as-is. Triggered by dog chip tap. |
| `FloatingTabBar` | `src/components/ui/FloatingTabBar.tsx` | Used as-is. No modifications. |
| `DayDetailSheet` | `src/components/ui/DayDetailSheet.tsx` | Reused when tapping a completed node to view that day's check-in details. |

### Stores (Unchanged, Data Sources)

| Store | Path | Relevant State |
|-------|------|---------------|
| `dogStore` | `src/stores/dogStore.ts` | `dogs`, `selectedDogId`, `selectDog()`, `fetchDogs()` |
| `healthStore` | `src/stores/healthStore.ts` | `calendarData`, `fetchMonthData()` |
| `authStore` | `src/stores/authStore.ts` | `user` (for profile button avatar) |
| `checkInStore` | `src/stores/checkInStore.ts` | `startCheckIn()` (triggered by tapping current node) |

### Font

- **Heading font:** `DMSerifDisplay_400Regular` (used in progress card title, milestone labels)
- **Body font:** System font (used everywhere else)
- Font loading is already configured in the app's root layout.

---

## Appendix: Quick Reference Card

For rapid implementation reference:

```
Screen:           iPhone 14 Pro (390x844pt)
Safe area:        54px top, 34px bottom
Tab bar:          100px reserved at bottom

Header height:    ~54px (padding included)
Progress card:    ~80px
Journey area:     ~1200px (scrollable)

Node size:        58px (standard), 66px (current)
Node spacing:     ~120-130px vertical between nodes
Path width:       5px stroke
Path dash:        14px dash, 10px gap

Mascot size:      120x120px
Speech bubble:    max 190px wide
Milestone:        72x72px

Key colors:
  Completed:      #FF6F00
  Upcoming border: #C8B8B0
  Missed bg:      #D7CCC8
  Sky:            #87CEEB -> #4A90D9
  Sand:           #F5E6C8
  Water:          #26C6DA
```
