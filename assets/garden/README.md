# Garden Scene Assets — Gemini Drop-In Slots

Save Gemini-generated PNGs (transparent background) here with these exact filenames.
The Journey hero mockup (`preview-journey-hero-option-a-v2.html`) auto-loads any file
that exists and falls back to an SVG placeholder for any that doesn't — so you can
drop art in one file at a time and refresh the browser to see it in the scene.

## Flowers — `flowers/` (24 files)

Pattern: `puplog-flower-[mood]-tier[1|2|3].png` (from `puplog_flower_prompts_v2.md`)

Moods: `joyful` · `playful` · `affectionate` · `calm` · `curious` · `tired` · `anxious` · `unwell`

Examples:
- `flowers/puplog-flower-calm-tier1.png`
- `flowers/puplog-flower-joyful-tier3.png`

## Scene kit (prompts in `puplog_garden_scene_prompts.md`, project root)

- `puplog-doghouse.png` — front-facing doghouse, **blank** name plaque (app overlays the dog's name)
- `puplog-mound.png` — today's empty soil mound
- `puplog-sprout.png` — tier-0 sprout (pre-mood state in the log sheet preview)

## Rules

- PNG with real transparency (no white matte).
- Square-ish, generous padding, no baked-in drop shadow (per the flower guide base style).
- Don't resize/crop by hand — the mockup scales via CSS; keep source resolution.
