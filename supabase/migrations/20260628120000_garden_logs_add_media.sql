-- Migration: garden_logs media (photo_url/video_url) + garden-media storage bucket
-- Persists the Journey "Plant" flow's optional photo/video. Flower TIER stays
-- DERIVED on read via computeFlowerTier():
--   hasPhoto = photo_url IS NOT NULL
--   hasVideo = video_url IS NOT NULL
-- Mirrors the existing public dog-photos bucket convention (public read; write
-- scoped to the user's own top-level folder = auth.uid()).
--
-- Storage path layout: {user_id}/{dog_id}/{log_date}-{photo|video}.{ext}
--   => (storage.foldername(name))[1] = user_id  (the RLS predicate below)
--
-- Re-runnable: ADD COLUMN IF NOT EXISTS; bucket upsert via ON CONFLICT; policy
-- DROP/CREATE. Pairs with the original create_garden_logs migration (which left
-- hasPhoto/hasVideo "DEFERRED — no media columns yet").

-- 1) COLUMNS ------------------------------------------------------------------
-- We store the public object URL (the bucket is public, matching dog-photos), so
-- the read path needs no signed-URL round trip; presence => the flower blooms full.
ALTER TABLE public.garden_logs
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS video_url text;

-- garden_logs RLS is column-agnostic — the existing own-row SELECT/INSERT/UPDATE/
-- DELETE policies already cover these new columns; no garden_logs policy change.

-- 2) STORAGE BUCKET -----------------------------------------------------------
-- Public read (matches dog-photos / avatars); 50 MB cap leaves room for short clips.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('garden-media', 'garden-media', true, 52428800, ARRAY['image/*', 'video/*'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3) STORAGE RLS — writes scoped to own folder (like dog-photos). SELECT is also
-- own-folder scoped (stricter than dog-photos' broad public read) to avoid the
-- public_bucket_allows_listing advisory: clients can't enumerate other users'
-- media. Public-URL display still works because the bucket is public (the public
-- /object/public/ path bypasses RLS); SELECT only governs the authenticated/list API.
DROP POLICY IF EXISTS "Public read access for garden media"        ON storage.objects;
DROP POLICY IF EXISTS "Users can read own garden media"           ON storage.objects;
DROP POLICY IF EXISTS "Users can upload garden media to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own garden media"          ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own garden media"          ON storage.objects;

CREATE POLICY "Users can read own garden media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'garden-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can upload garden media to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'garden-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can update own garden media"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'garden-media' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Users can delete own garden media"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'garden-media' AND (storage.foldername(name))[1] = (auth.uid())::text);
