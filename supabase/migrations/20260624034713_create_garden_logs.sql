-- Migration: create public.garden_logs
-- Journey "garden" feature — quick one-tap daily mood log (plants flowers). NOT a
-- daily_check_ins row. Follows daily_check_ins conventions (id/FK/timestamp/RLS,
-- verified live this session).
--
--   Flower COLOR = garden_mood.
--   Flower TIER  = DERIVED on read via computeFlowerTier(); NEVER stored. Inputs
--                  reconstructed from the row:
--                    hasHealthChip = jsonb_array_length(health_chips) > 0
--                    hasNote       = note IS NOT NULL AND char_length(note) > 0
--                    hasPhoto/hasVideo = DEFERRED (no media columns yet)
--   "Cluster of blooms" in the UI is a render-time expansion (no extra rows).
--
-- Re-run note: CREATE TABLE IF NOT EXISTS is a no-op if the table already exists;
-- later column/constraint changes must ship as a separate ALTER migration, never
-- by editing this CREATE block. The RLS-enable, policy/trigger DROP-CREATE, and
-- index IF NOT EXISTS sections are genuinely re-runnable.

-- 1) TABLE --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.garden_logs (
  id            uuid        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  dog_id        uuid        NOT NULL REFERENCES public.dogs (id) ON DELETE CASCADE,

  -- Day key: `date` (not timestamp), matching daily_check_ins.check_in_date.
  -- No DEFAULT: the app supplies the user's local "today" (as it does for
  -- draft.check_in_date), avoiding a UTC-midnight off-by-one.
  log_date      date        NOT NULL,

  -- Flower COLOR + computeFlowerTier `mood`. NOT NULL: a log is born from tapping
  -- a mood, so tier 0 ("no mood") is never persisted. NO CHECK constraint (owner
  -- rule): GARDEN_MOODS in src/constants/gardenMoods.ts is the single source of
  -- truth; gardenStore validates via isGardenMood() before insert, and the read
  -- path falls back gracefully for an unknown mood.
  garden_mood   text        NOT NULL,

  -- Reconstructs computeFlowerTier `hasHealthChip` (tier 2) via
  -- jsonb_array_length(health_chips) > 0. Stored as a jsonb array (not a bare
  -- boolean) so the bloom render can keep WHICH chips were tapped. The garden
  -- chip value set is its OWN app-validated const (NOT the clinical
  -- AdditionalSymptom enum) — keeps the garden/clinical separation intact. The
  -- jsonb_typeof guard below is a deliberate structural guard (not an enum).
  health_chips  jsonb       NOT NULL DEFAULT '[]'::jsonb,

  -- Reconstructs computeFlowerTier `hasNote` (tier 3). Optional free text, like
  -- daily_check_ins.free_text. The length bound is allowed (bounds free text, not
  -- an enum); 500 matches free_text.
  note          text,

  -- Golden Rule (safety): set by the garden write path via
  --   note ? detectEmergencyKeywords(note).isEmergency : false
  -- (same pattern as checkInStore.ts for free_text), so note-bearing garden logs
  -- are not "dark" to keyword detection. Note-less logs stay false and are
  -- covered by the always-on Emergency surface.
  emergency_flagged boolean NOT NULL DEFAULT false,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),

  -- One quick log per dog per day. Its leading-dog_id btree also serves the
  -- dominant read: this dog's garden over a week/month range.
  CONSTRAINT garden_logs_dog_date_unique UNIQUE (dog_id, log_date),
  CONSTRAINT garden_logs_note_len_check CHECK (note IS NULL OR char_length(note) <= 500),
  CONSTRAINT garden_logs_health_chips_is_array_check CHECK (jsonb_typeof(health_chips) = 'array')
);

-- 2) ROW LEVEL SECURITY -------------------------------------------------------
-- Same shape as daily_check_ins (RLS on; 4 PERMISSIVE policies to PUBLIC;
-- predicate user_id = auth.uid()) PLUS a dog-ownership guard on writes, so a user
-- cannot attach a log to another user's dog and consume their UNIQUE(dog_id,
-- log_date) slot. (daily_check_ins lacks this guard; garden_logs hardens it.)
ALTER TABLE public.garden_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own garden logs"   ON public.garden_logs;
DROP POLICY IF EXISTS "Users can insert own garden logs" ON public.garden_logs;
DROP POLICY IF EXISTS "Users can update own garden logs" ON public.garden_logs;
DROP POLICY IF EXISTS "Users can delete own garden logs" ON public.garden_logs;

CREATE POLICY "Users can read own garden logs"
  ON public.garden_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own garden logs"
  ON public.garden_logs FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND dog_id IN (SELECT id FROM public.dogs WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own garden logs"
  ON public.garden_logs FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND dog_id IN (SELECT id FROM public.dogs WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own garden logs"
  ON public.garden_logs FOR DELETE
  USING (user_id = auth.uid());

-- 3) updated_at TRIGGER (reuse the shared public.update_updated_at_column()) ---
DROP TRIGGER IF EXISTS garden_logs_updated_at ON public.garden_logs;
CREATE TRIGGER garden_logs_updated_at
  BEFORE UPDATE ON public.garden_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4) INDEXES ------------------------------------------------------------------
-- UNIQUE(dog_id, log_date) already covers the per-dog week/month read. A bare
-- user_id index (mirroring daily_check_ins' idx_checkins_user) serves the RLS
-- user_id predicate and the per-user cascade fan-out.
CREATE INDEX IF NOT EXISTS garden_logs_user_id_idx
  ON public.garden_logs (user_id);

-- DOWN (manual): DROP TABLE IF EXISTS public.garden_logs CASCADE;
--   (drops this table's policies, trigger, indexes; leaves the shared
--    update_updated_at_column() function — owned by dogs et al. — untouched)
