---
name: pawcheck-a11y-audit
description: Audits PawCheck screens and components for WCAG AA accessibility compliance. Checks color contrast, touch targets, screen reader labels, semantic roles, and decorative element hiding. Use before releases or after adding new UI elements.
user_invocable: true
metadata:
  author: PawCheck Team
  tags: accessibility, wcag, a11y, audit, ui
---

# PawCheck Accessibility Audit

## Overview

Audits PawCheck's React Native screens and components for WCAG AA accessibility compliance. Checks color contrast ratios, minimum touch targets, screen reader labels, semantic roles, and decorative element handling.

## When to Use

- After adding new screens or UI components
- After changing colors in `theme.ts`
- Before beta releases or app store submissions
- When addressing user accessibility feedback
- After the design system changes

## Audit Checklist

### 1. Color Contrast (WCAG AA)

**Requirements:**
- Normal text (< 18pt): 4.5:1 minimum contrast ratio
- Large text (>= 18pt / 14pt bold): 3:1 minimum contrast ratio
- Non-text elements (icons, borders): 3:1 minimum

**Current Palette Verification:**

| Color | Hex | On White (#FFFFFF) | On Cream (#F8F9F5) | Status |
|-------|-----|-------------------|-------------------|--------|
| textPrimary | #1A1C19 | 16.3:1 | 15.8:1 | Pass |
| textSecondary | #5E625B | 5.4:1 | 5.2:1 | Pass |
| textDisabled | #9E9E9E | 4.6:1 | 4.5:1 | Pass (AA) |
| primary | #94A684 | 2.8:1 | 2.7:1 | **Fail for text** |
| emergency | #C62828 | 5.6:1 | 5.4:1 | Pass |
| urgent | #E65100 | 4.7:1 | 4.5:1 | Pass (AA) |
| soon | #F57C00 | 3.2:1 | 3.1:1 | Pass (large only) |
| monitor | #00897B | 4.5:1 | 4.4:1 | Pass (AA) |

**Key Rule**: The `primary` (#94A684 sage green) does NOT meet contrast requirements for text. Use it only for backgrounds, borders, or decorative elements. Use `primaryDark` (#7A8E6C) for text if sage color is needed.

### 2. Touch Targets (48dp minimum)

Search for interactive elements that may be too small:

```typescript
// Grep for these patterns in all .tsx files
Grep: pattern="TouchableOpacity|Pressable|Button" glob="**/*.tsx"

// Then check each for minHeight/minWidth >= 48
// The project uses MIN_TOUCH_TARGET constant (48dp)
```

**Checklist:**
- [ ] All buttons have `minHeight: MIN_TOUCH_TARGET` (48dp)
- [ ] All tappable cards have adequate touch area
- [ ] Close/dismiss buttons on modals are large enough
- [ ] Tab bar items meet minimum size
- [ ] Character counter is not a touch target (it shouldn't be interactive)

### 3. Screen Reader Labels

Every interactive element MUST have an `accessibilityLabel`:

```typescript
// Search for buttons/pressables missing labels
Grep: pattern="<(TouchableOpacity|Pressable)" glob="**/*.tsx" output_mode="content"
// Then verify each has accessibilityLabel or accessibilityRole
```

**Required labels:**
- [ ] Sign In / Sign Up / Submit buttons
- [ ] Navigation buttons (back, close, cancel)
- [ ] Dog card tap targets
- [ ] Edit/Delete buttons
- [ ] Emergency call buttons
- [ ] Tab bar items
- [ ] Modal dismiss buttons
- [ ] Form inputs (via `accessibilityLabel` or associated `Text`)

### 4. Semantic Roles

```typescript
// Error messages should have role="alert"
accessibilityRole="alert"

// Buttons should have role="button"
accessibilityRole="button"

// Links should have role="link"
accessibilityRole="link"

// Checkboxes (terms acceptance)
accessibilityRole="checkbox"
accessibilityState={{ checked: isChecked }}

// Radio buttons (dog selector)
accessibilityRole="radio"
accessibilityState={{ selected: isSelected }}

// Headers
accessibilityRole="header"
```

### 5. Decorative Elements

Decorative elements (emojis, arrows, icons that convey no information) should be hidden:

```typescript
// Hide from screen readers
accessibilityElementsHidden={true}
importantForAccessibility="no-hide-descendants"
```

**Known decorative elements in PawCheck:**
- Arrow icons (`→`) on settings items
- Decorative emojis (paw print in off-topic, medical symbol in disclaimer)
- Checkmark on selected dog in DogSelector
- Loading spinner (the tips text IS accessible, but the spinner itself is decorative)

### 6. Error Announcements

Error states should automatically announce to screen readers:

```typescript
// Error messages
accessibilityRole="alert"
accessibilityLiveRegion="polite"  // or "assertive" for critical errors
```

### 7. Focus Management

- [ ] After form submission errors, focus moves to the first error
- [ ] After modal opens, focus moves into the modal
- [ ] After modal closes, focus returns to the trigger element
- [ ] After navigation, focus is on the new screen's main content

## Running the Audit

### Automated Checks

```bash
# Search for missing accessibility labels on interactive elements
npx grep -rn "TouchableOpacity\|Pressable" app/ src/components/ | grep -v "accessibilityLabel"

# Search for hardcoded colors (should use theme constants)
npx grep -rn "color:\s*['\"]#" app/ src/components/ | grep -v "theme\|COLORS\|node_modules"

# Run the Jest tests (includes accessibility tests)
npm test
```

### Manual Checks (on device)

1. **iOS VoiceOver**: Settings > Accessibility > VoiceOver > Enable
   - Navigate through every screen
   - Verify all interactive elements are announced
   - Verify urgency badges announce their full description
   - Verify emergency buttons are prominently announced

2. **Android TalkBack**: Settings > Accessibility > TalkBack > Enable
   - Same navigation checks as iOS

3. **Dynamic Text**: Test with larger system font sizes
   - Verify text doesn't clip or overflow
   - Verify layouts accommodate larger text

## Previous Audit Results (Feb 2026)

27 issues fixed across 25 files:
- `textDisabled` color changed from #BDBDBD (3.4:1) to #9E9E9E (4.6:1)
- `accessibilityLabel` added to 11 buttons
- `accessibilityElementsHidden` added to decorative arrows and emojis
- All urgency badges have descriptive labels including urgency description

## Files Most Likely to Need Accessibility Updates

| Priority | File | Reason |
|----------|------|--------|
| High | `app/(tabs)/triage.tsx` | Most complex screen, 3 states |
| High | `src/components/legal/UrgencyBadge.tsx` | Safety-critical information |
| High | `app/emergency.tsx` | Emergency actions must be accessible |
| Medium | `app/(tabs)/index.tsx` | Dog cards with multiple touch targets |
| Medium | `src/components/ui/DogSelector.tsx` | Modal with radio selection |
| Medium | `app/terms.tsx` | Scroll detection + checkbox |
| Low | `app/(auth)/sign-in.tsx` | Standard form |
| Low | `app/(tabs)/settings.tsx` | Standard list |
