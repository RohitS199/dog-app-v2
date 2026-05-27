-- Pattern E PR 3: validation trigger for user_profiles.featured_stickers
--
-- Ensures every non-null sticker id in featured_stickers exists in the
-- user's user_achievements rows. Catches:
--   * Direct SQL writes that bypass the frontend auto-fill / setFeatured
--     paths
--   * Stale frontend state writing a sticker the user no longer has
--   * Multi-device race conditions where one device tries to feature a
--     sticker before the other has synced the earn record
--
-- Implemented as a BEFORE INSERT/UPDATE trigger (not a CHECK constraint)
-- because CHECK constraints cannot reference other tables in Postgres.
--
-- Each non-null slot must be either:
--   1. NULL, or
--   2. A sticker_id present in user_achievements for the same user_id
--
-- Date: 2026-05-25.

CREATE OR REPLACE FUNCTION validate_featured_stickers_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slot_value TEXT;
  slot_index INT;
BEGIN
  -- featured_stickers is JSONB array of 3 entries (StickerId | null).
  -- length is enforced by the existing CHECK in the column definition.
  FOR slot_index IN 0..2 LOOP
    slot_value := NEW.featured_stickers->>slot_index;
    IF slot_value IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.user_achievements
      WHERE user_id = NEW.user_id
        AND sticker_id = slot_value
    ) THEN
      RAISE EXCEPTION
        'featured_stickers slot % references % which is not in user_achievements for user %',
        slot_index, slot_value, NEW.user_id
        USING ERRCODE = '23514';  -- check_violation
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION validate_featured_stickers_earned() FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_validate_featured_stickers ON public.user_profiles;

CREATE TRIGGER trg_validate_featured_stickers
BEFORE INSERT OR UPDATE OF featured_stickers
ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION validate_featured_stickers_earned();

COMMENT ON FUNCTION validate_featured_stickers_earned() IS
  'Pattern E PR 3: validates that every non-null sticker_id in featured_stickers is present in user_achievements for the same user_id. Catches direct SQL writes, stale frontend state, multi-device races.';

COMMENT ON TRIGGER trg_validate_featured_stickers ON public.user_profiles IS
  'Pattern E PR 3 (2026-05-25): runs validate_featured_stickers_earned() on insert/update of featured_stickers.';
