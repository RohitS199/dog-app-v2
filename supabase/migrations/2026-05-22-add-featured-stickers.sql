-- Pattern E: add featured_stickers JSONB array to user_profiles.
-- Each user has a 3-slot featured array, populated by client (PR 1)
-- and mirrored by Edge Function on first 3 earns (PR 3).
-- Length must be 3. Each element is a sticker_id string or null.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS featured_stickers JSONB DEFAULT '[null, null, null]'::jsonb;

-- Length sanity (advisory — JSONB lets you violate this, so client enforces too).
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_featured_stickers_length_check;
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_featured_stickers_length_check
  CHECK (jsonb_typeof(featured_stickers) = 'array' AND jsonb_array_length(featured_stickers) = 3);

COMMENT ON COLUMN public.user_profiles.featured_stickers IS
  'Pattern E (2026-05-22): 3-slot array of sticker_id strings or nulls. Length 3 enforced by CHECK constraint. Source of truth for the user-chosen 3 featured stickers shown on the profile row.';
