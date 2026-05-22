-- Pattern E follow-up: enforce NOT NULL on user_profiles.featured_stickers.
-- The column was added with a default of '[null, null, null]'::jsonb (see
-- 20260522192648_pattern_e_add_featured_stickers.sql), so every existing
-- row already has the default; SET NOT NULL is cheap and won't fail.
--
-- Why we need this: the CHECK constraint on this column does NOT catch SQL
-- NULL (jsonb_typeof(NULL) returns NULL, AND-conjunctions with NULL are
-- treated as passing CHECKs by Postgres). Without NOT NULL, an admin tool
-- or a buggy client write of SQL NULL would land silently and break the
-- FeaturedSlots tuple contract the app relies on.

ALTER TABLE public.user_profiles
  ALTER COLUMN featured_stickers SET NOT NULL;
