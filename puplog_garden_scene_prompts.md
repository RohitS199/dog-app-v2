# PupLog Garden Scene Kit — Generation Prompt Guide (v1)

A complete reference for generating PupLog's Journey-hero scene assets via Gemini Image Generation. The scene kit is the **stage** for the 24 garden flowers: the doghouse, the freshly-dug soil mound (today's empty plot), the tier-0 sprout, and two optional ambient pieces. Flowers represent the dog's days; the scene kit is the home those days grow in front of.

These assets live alongside the flower set — same watercolor storybook style, same naming discipline — so the whole yard reads as one hand-painted world.

---

## How to Use This Document

1. **One prompt at a time.** Paste each prompt into Gemini individually — do NOT batch them. Gemini generates one image per request, and each asset needs its own file.
2. **After Gemini generates the image, save it manually using the filename listed at the top of each prompt.** Gemini does not control filenames — you assign them when downloading.
3. **Use PNG format** for all downloads to preserve quality, and remove the white background in post (Figma "Remove Background" or Photoshop magic wand) so the final asset has true transparency — these pieces composite onto a painted meadow, not a white screen.
4. **Save finished assets into the app project** at `assets/garden/` (flowers go in `assets/garden/flowers/`). The mockup `preview-journey-hero-option-a-v2.html` auto-loads any file that exists and shows a placeholder for any that doesn't — drop a PNG in, refresh the browser, and it appears in the scene.
5. **Generate the doghouse first.** It is the kit's calibrator — it establishes the wood tones and brushwork the rest of the kit references. Lock its look before moving on.

---

## Visual Style Foundation

Every prompt below already includes the base style block. But for reference, here it is — paste this at the start of any custom prompts you write yourself:

> **Scene Kit Base Style Block:**
> *"Soft watercolor illustration in a children's storybook style. Hand-painted texture with visible brush strokes and subtle paper grain. Front-facing view, fully visible subject. Every illustrated element has a subtle darker watercolor outline (one or two shades deeper than its fill) so silhouettes read clearly. Clean isolated subject on a pure white background, no shadow, no border, no text. Whimsical and warm aesthetic, slightly stylized rather than photo-realistic. Centered composition with generous padding around the subject. Square 1:1 aspect ratio."*

Two style notes specific to this kit:

- **No baked-in ground or shadows.** The app paints the meadow, soil bed, and contact shadows in code — assets must end cleanly at their own silhouette.
- **These assets sit on soft sage-green washes, not white.** Mid-green fills (sprout, grass) especially need their deeper-green outlines, or they melt into the meadow.

---

## Scene Palette

| Element | Hex | Color Name |
|---|---|---|
| Doghouse body planks | `#8A5A38` | Warm Chestnut |
| Doghouse roof + outlines | `#5A3A22` | Deep Walnut |
| Doorway interior | `#2E2117` | Darkest Warm Brown |
| Blank name sign | `#FBE6CC` | Soft Cream |
| Soil mound | `#B68F66` | Warm Umber |
| Soil shading | `#8C6A48` | Deep Umber |
| Sprout / grass / leaves | `#8FB07F` | Sage Green |
| Leaf + grass shading | `#5C8A52` | Deep Forest Green |
| Butterfly wings | `#F4845F` | Soft Coral |

These are the same sage greens the flower guide uses for stems and leaves — keep them, so the kit and the flowers read as one garden.

---

## Filename Convention

`puplog-[item].png` — matches the flower naming pattern (`puplog-flower-[mood]-tier[1/2/3].png`).

---

# THE 5 SCENE ASSETS

## 1. The Doghouse ⭐ (generate this first — kit calibrator)
**Save as:** `puplog-doghouse.png`
**Used as:** The anchor of the Journey hero scene. The app overlays the dog's name on the blank sign.

```
Soft watercolor illustration in a children's storybook style. Hand-painted
texture with visible brush strokes and subtle paper grain. Front-facing view,
fully visible subject. Every illustrated element has a subtle darker
watercolor outline (one or two shades deeper than its fill) so silhouettes
read clearly. Clean isolated subject on a pure white background, no shadow,
no border, no text. Whimsical and warm aesthetic, slightly stylized rather
than photo-realistic. Centered composition with generous padding around the
subject. Square 1:1 aspect ratio.

A cozy storybook doghouse with slightly chunky, toy-like proportions. A steep
triangular roof in deep walnut brown (hex #5A3A22) with visible hand-painted
plank brushwork and a gentle overhang. The body is made of horizontal planks
in warm chestnut brown (hex #8A5A38) with subtle darker plank seams. A tall
arched doorway opening in darkest warm brown (hex #2E2117), softly rounded at
the top. Mounted above the doorway is a small rectangular wooden sign in soft
cream (hex #FBE6CC) with a thin walnut-brown frame — the sign is completely
blank, with no text, no letters, and no characters of any kind. A tiny white
dog bone motif decorates the roof gable. Sturdy, cozy, and well-loved.
```

---

## 2. Soil Mound — Today's Empty Plot
**Save as:** `puplog-mound.png`
**Used as:** The tappable "plant today's flower" spot in the garden bed.

```
Soft watercolor illustration in a children's storybook style. Hand-painted
texture with visible brush strokes and subtle paper grain. Front-facing view,
fully visible subject. Every illustrated element has a subtle darker
watercolor outline (one or two shades deeper than its fill) so silhouettes
read clearly. Clean isolated subject on a pure white background, no shadow,
no border, no text. Whimsical and warm aesthetic, slightly stylized rather
than photo-realistic. Centered composition with generous padding around the
subject. Square 1:1 aspect ratio.

A low, gently rounded mound of freshly turned garden soil in warm umber
(hex #B68F66), shaded underneath and at the edges with deep umber
(hex #8C6A48), with a soft lighter highlight across the top. A few small
darker speckles and tiny pebbles suggest fresh, crumbly earth. The mound is
wider than it is tall, like a little pillow of soil ready for planting.
Freshly dug and full of promise.
```

---

## 3. Sprout — Tier Zero
**Save as:** `puplog-sprout.png`
**Used as:** The "waiting to grow" state in the log sheet's live flower preview, before a mood is picked.

```
Soft watercolor illustration in a children's storybook style. Hand-painted
texture with visible brush strokes and subtle paper grain. Front-facing view,
fully visible subject. Every illustrated element has a subtle darker
watercolor outline (one or two shades deeper than its fill) so silhouettes
read clearly. Clean isolated subject on a pure white background, no shadow,
no border, no text. Whimsical and warm aesthetic, slightly stylized rather
than photo-realistic. Centered composition with generous padding around the
subject. Square 1:1 aspect ratio.

A tiny new seedling sprout with a short, slender stem and two small rounded
leaves opening outward, in sage green (hex #8FB07F) with deep forest green
(hex #5C8A52) outlines and central veins. The sprout stands alone, just
emerged. Brand new and hopeful.
```

---

## 4. Grass Tuft (optional ambient)
**Save as:** `puplog-grass-tuft.png`
**Used as:** Foreground framing in the bottom corners of the scene (drawn in code today; this asset upgrades it).

```
Soft watercolor illustration in a children's storybook style. Hand-painted
texture with visible brush strokes and subtle paper grain. Front-facing view,
fully visible subject. Every illustrated element has a subtle darker
watercolor outline (one or two shades deeper than its fill) so silhouettes
read clearly. Clean isolated subject on a pure white background, no shadow,
no border, no text. Whimsical and warm aesthetic, slightly stylized rather
than photo-realistic. Centered composition with generous padding around the
subject. Square 1:1 aspect ratio.

A loose, airy clump of meadow grass with seven to nine curved blades of
varying heights, in sage green (hex #8FB07F) with several blades in deep
forest green (hex #5C8A52) for depth. The blades bend gently as if in a
light breeze, springing from a single small base. Soft, light, and casual.
```

---

## 5. Butterfly (optional ambient)
**Save as:** `puplog-butterfly.png`
**Used as:** The small ambient flutter over the garden bed.

```
Soft watercolor illustration in a children's storybook style. Hand-painted
texture with visible brush strokes and subtle paper grain. Front-facing view,
fully visible subject. Every illustrated element has a subtle darker
watercolor outline (one or two shades deeper than its fill) so silhouettes
read clearly. Clean isolated subject on a pure white background, no shadow,
no border, no text. Whimsical and warm aesthetic, slightly stylized rather
than photo-realistic. Centered composition with generous padding around the
subject. Square 1:1 aspect ratio.

A small, simple butterfly with softly rounded open wings in soft coral
(hex #F4845F), the wing edges shaded a deeper coral, with a slender dark
warm-brown body and two tiny curled antennae. The wings are spread as if
mid-flutter. Light, cheerful, and delicate.
```

---

## Quick Reference — All 5 Filenames

- [ ] `puplog-doghouse.png` ⭐ calibrator — generate first
- [ ] `puplog-mound.png`
- [ ] `puplog-sprout.png`
- [ ] `puplog-grass-tuft.png` (optional)
- [ ] `puplog-butterfly.png` (optional)

The 24 flowers have their own guide (`puplog_flower_prompts_v2.md`) and save into `assets/garden/flowers/`. Biscuit is **not** part of this kit — the mascot is its own art effort with its own poses and expressions.

---

## Generation Tips

1. **Doghouse first, then style-lock.** Once the doghouse looks right, upload it back into Gemini together with one of your finished Tier 3 flowers as style references for the remaining prompts — "match the watercolor style and palette of these reference images." This dramatically improves consistency between the kit and the flower set.
2. **If output looks photo-realistic or 3D**, prepend: *"Stylized illustration only. NOT photo-realistic. NOT 3D render. NOT CGI."*
3. **If Gemini puts lettering on the doghouse sign**, add: *"The sign is purely decorative and completely blank — no text, no letters, no numbers, no characters of any kind on the sign."* The app overlays the dog's real name at runtime, so any baked-in text breaks the feature.
4. **If the background isn't clean**, add: *"Pure plain white background, completely empty surroundings, no ground, no grass, no decorations."* Ground and shadows come from the app's painted scene — a baked-in ground line will look like a floating sticker once composited.
5. **Background removal matters more here than for flowers.** These assets overlap painted washes, so leftover white fringing shows. After removing the background, check edges at 200% zoom. (The HTML mockup uses a multiply blend as a safety net, so a quick white-background preview still works — but the React Native app needs true transparency.)
6. **Do the phone-size squint test.** The doghouse renders around 190px wide, the mound around 75px, the sprout around 55px. Drop each PNG into `assets/garden/`, open the mockup, and step back — if details turn to mud at that size, regenerate with *"bold, simple shapes with clear silhouettes, minimal fine detail."*
7. **Aspect ratio nudge.** Gemini doesn't always honor 1:1 — crop manually before saving if the output is non-square.
8. **Regenerate rather than accept drift.** Same rule as the flowers: one off-style asset will stand out in the yard forever. If it breaks the style, regenerate before moving on.
