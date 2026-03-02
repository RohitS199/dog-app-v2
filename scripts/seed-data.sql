-- =============================================================================
-- PawCheck Seed Data Script
-- =============================================================================
--
-- PURPOSE: Populate realistic test data for a signed-up user so all app
-- features (home screen, health calendar, AI insights, pattern alerts,
-- mood ring, energy card, week strip) have meaningful data to display.
--
-- PREREQUISITES:
--   1. Sign up through the PawCheck app (creates auth.users row)
--   2. Accept Terms of Service in the app
--   3. Copy your user_id from Supabase Auth dashboard:
--      Dashboard → Authentication → Users → click your user → copy UUID
--   4. Replace 'YOUR_USER_ID_HERE' below with your actual UUID
--   5. Run this script in the Supabase SQL Editor (Dashboard → SQL Editor)
--
-- WHAT THIS CREATES:
--   - 2 dogs: Luna (healthy) and Bear (senior with trends)
--   - 51 daily check-ins (26 Luna + 25 Bear) spanning 28 days
--   - 3 pattern alerts (1 resolved, 2 active)
--   - 5 AI health insights with article recommendations
--   - Health summary JSONB on both dogs
--
-- IMPORTANT: This script must be run in the Supabase SQL Editor because
-- pattern_alerts and ai_health_insights have INSERT restricted to service
-- role via RLS. The SQL Editor runs with service role privileges.
--
-- TO RESET: If you need to re-run this script, first delete the existing
-- data by running:
--   DELETE FROM ai_health_insights WHERE user_id = 'YOUR_USER_ID_HERE';
--   DELETE FROM pattern_alerts WHERE user_id = 'YOUR_USER_ID_HERE';
--   DELETE FROM daily_check_ins WHERE user_id = 'YOUR_USER_ID_HERE';
--   DELETE FROM dogs WHERE user_id = 'YOUR_USER_ID_HERE';
-- =============================================================================

DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID_HERE';  -- <-- REPLACE THIS
  v_luna_id UUID;
  v_bear_id UUID;
  v_today DATE := CURRENT_DATE;
  v_luna_latest_checkin_id UUID;
  v_bear_latest_checkin_id UUID;
BEGIN

-- =============================================================================
-- STEP 1: INSERT DOGS
-- =============================================================================

-- Luna: 4-year-old Golden Retriever
-- Story: Generally healthy, active dog. Had a digestive episode ~10 days ago
-- that has since resolved. Occasional scratching (possible seasonal allergies).
INSERT INTO dogs (id, user_id, name, breed, age_years, weight_lbs, vet_phone, created_at, updated_at)
VALUES (gen_random_uuid(), v_user_id, 'Luna', 'Golden Retriever', 4, 65, '555-867-5309',
        now() - interval '60 days', now() - interval '60 days')
RETURNING id INTO v_luna_id;

-- Bear: 8-year-old German Shepherd
-- Story: Aging gracefully but showing gradual energy decline over past 2 weeks.
-- Intermittent mobility issues (stiff mornings). Still eats well. Owner concerned.
INSERT INTO dogs (id, user_id, name, breed, age_years, weight_lbs, vet_phone, created_at, updated_at)
VALUES (gen_random_uuid(), v_user_id, 'Bear', 'German Shepherd', 8, 85, '555-867-5309',
        now() - interval '55 days', now() - interval '55 days')
RETURNING id INTO v_bear_id;

-- =============================================================================
-- STEP 2: LUNA'S CHECK-INS (28 days, 2 missed = 26 entries)
-- =============================================================================
-- Story arc:
--   Days 28-15: Normal healthy dog, occasional scratching
--   Day 14:     Digestive episode begins (soft stool, less appetite)
--   Day 13:     MISSED (owner busy)
--   Days 12-11: Peak (diarrhea, vomited once, low energy, quiet)
--   Days 10-8:  Recovering (soft→normal stool, appetite returning)
--   Day 7:      MISSED (weekend trip)
--   Days 6-0:   Fully recovered, back to normal
-- =============================================================================

-- Day 28: Normal baseline
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 28, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 27: Normal, slight scratching
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 27, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["scratching"]'::jsonb, NULL, false);

-- Day 26: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 26, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 25: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 25, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 24: Normal, scratching again
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 24, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["scratching"]'::jsonb, 'She has been scratching her ears a bit lately', false);

-- Day 23: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 23, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 22: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 22, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 21: Good day at the park, extra water
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 21, 'normal', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Played fetch at the park for an hour, drank extra water after', false);

-- Day 20: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 20, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 19: Normal, scratching
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 19, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["scratching"]'::jsonb, NULL, false);

-- Day 18: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 18, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 17: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 17, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 16: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 16, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 15: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 15, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 14: *** DIGESTIVE EPISODE BEGINS *** Soft stool, appetite dip
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 14, 'less', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Stool was softer than usual this morning', false);

-- Day 13: MISSED (owner busy)

-- Day 12: Episode worsens — diarrhea, vomited once, low energy, quiet
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 12, 'less', 'less', 'low', 'diarrhea', 'once', 'normal', 'quiet', '["none"]'::jsonb, 'Had diarrhea twice today and vomited this morning. Seems tired.', false);

-- Day 11: Peak — diarrhea continues, barely eating
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 11, 'barely', 'less', 'low', 'diarrhea', 'none', 'normal', 'quiet', '["none"]'::jsonb, 'Still has diarrhea but no vomiting today. Not interested in food much.', false);

-- Day 10: Improving — soft stool (not diarrhea), eating a bit more
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 10, 'less', 'normal', 'low', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Stool firming up. Ate about half her breakfast.', false);

-- Day 9: Improving — appetite returning
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 9, 'normal', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Ate all her food today! Stool still a bit soft.', false);

-- Day 8: Almost normal — stool normalizing
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 8, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Back to normal stools. She seems like herself again.', false);

-- Day 7: MISSED (weekend trip)

-- Day 6: Back to normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 6, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 5: Normal, scratching
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 5, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["scratching"]'::jsonb, NULL, false);

-- Day 4: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 4, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 3: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 3, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 2: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 2, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 1 (yesterday): Normal, great park day
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today - 1, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Great day at the dog park! Played with her friends for over an hour.', false);

-- Day 0 (today): Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_luna_id, v_today, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false)
RETURNING id INTO v_luna_latest_checkin_id;


-- =============================================================================
-- STEP 3: BEAR'S CHECK-INS (28 days, 3 missed = 25 entries)
-- =============================================================================
-- Story arc:
--   Days 28-22: Mostly normal for senior dog. Occasional morning stiffness.
--   Day 21:     Energy starts dipping
--   Day 20:     MISSED
--   Days 19-15: Energy intermittent (low/normal), more stiff days
--   Day 14:     MISSED
--   Days 13-7:  Energy clearly declining, mobility worse, quiet moods
--   Day 6:      MISSED
--   Days 5-0:   Low energy most days, stiff, quiet. Owner scheduling vet.
-- =============================================================================

-- Day 28: Normal older dog, slight morning stiffness
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 28, 'normal', 'normal', 'normal', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'A bit stiff getting up this morning but loosened up after a walk', false);

-- Day 27: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 27, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 26: Normal, good mobility
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 26, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 25: Stiff morning
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 25, 'normal', 'normal', 'normal', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 24: Normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 24, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 23: Normal, enjoyed walk
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 23, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Good boy today, enjoyed his evening walk', false);

-- Day 22: Stiff
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 22, 'normal', 'normal', 'normal', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 21: *** ENERGY DIP BEGINS *** First sign of declining energy
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 21, 'normal', 'normal', 'low', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Seemed a bit tired today, didnt want to go on the second walk', false);

-- Day 20: MISSED

-- Day 19: Low energy, stiff
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 19, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 18: Normal energy (intermittent)
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 18, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 17: Low energy, quiet mood
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 17, 'normal', 'normal', 'low', 'normal', 'none', 'normal', 'quiet', '["none"]'::jsonb, 'He just laid around most of the day', false);

-- Day 16: Stiff, low energy
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 16, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 15: Good day (normal energy)
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 15, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Good day! Played with his ball in the yard', false);

-- Day 14: MISSED

-- Day 13: Low energy, stiff, quiet
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 13, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Seems more tired than usual lately', false);

-- Day 12: Low energy
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 12, 'normal', 'normal', 'low', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 11: Low energy, stiff, quiet, drinking more
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 11, 'normal', 'more', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Drinking more water than usual. Still eating fine though.', false);

-- Day 10: Low energy, reluctant to walk, panting
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 10, 'normal', 'normal', 'low', 'normal', 'none', 'reluctant', 'quiet', '["excessive_panting"]'::jsonb, 'Didnt want to go on his walk. Was panting even though it wasnt hot.', false);

-- Day 9: Low energy, stiff
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 9, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 8: Low energy, stiff, quiet
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 8, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Starting to worry about his energy levels', false);

-- Day 7: Rare good day
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 7, 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Seemed more like himself today. Went on a full walk.', false);

-- Day 6: MISSED

-- Day 5: Low energy, stiff, quiet
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 5, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, NULL, false);

-- Day 4: Low energy, reluctant
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 4, 'normal', 'normal', 'low', 'normal', 'none', 'reluctant', 'quiet', '["none"]'::jsonb, 'Had trouble getting up from his bed this morning. Took a while to warm up.', false);

-- Day 3: Low energy, stiff
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 3, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false);

-- Day 2: Low energy, quiet
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 2, 'normal', 'normal', 'low', 'normal', 'none', 'normal', 'quiet', '["none"]'::jsonb, NULL, false);

-- Day 1 (yesterday): Low energy, stiff, quiet — vet scheduled
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today - 1, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Vet appointment scheduled for next week. Want to discuss his energy and stiffness.', false);

-- Day 0 (today): Low energy, stiff
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES (v_user_id, v_bear_id, v_today, 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Same as yesterday. At least he ate all his food.', false)
RETURNING id INTO v_bear_latest_checkin_id;


-- =============================================================================
-- STEP 4: PATTERN ALERTS
-- =============================================================================

-- Luna: digestive_issues — RESOLVED (detected during episode, auto-resolved)
INSERT INTO pattern_alerts (user_id, dog_id, pattern_type, alert_level, title, message, ai_insight, data_window, is_active, dismissed_by_user, triggered_triage, first_detected, last_confirmed, resolved_at)
VALUES (
  v_user_id, v_luna_id, 'digestive_issues', 'watch',
  'Digestive Issues Detected',
  'Luna has had digestive problems (diarrhea or abnormal stool) for 2+ days in the past 5 days. Monitor her closely and contact your vet if symptoms persist.',
  'Luna experienced a self-limiting digestive episode that resolved within 5 days. Her appetite and stool quality have returned to baseline. No further intervention appears needed unless symptoms recur.',
  '{"window_days": 5, "abnormal_days": 3, "fields": ["stool_quality", "vomiting"]}'::jsonb,
  false, false, false,
  v_today - 12, v_today - 10, (v_today - 8)::timestamptz
);

-- Bear: energy_decline — ACTIVE (watch level)
INSERT INTO pattern_alerts (user_id, dog_id, pattern_type, alert_level, title, message, ai_insight, data_window, is_active, dismissed_by_user, triggered_triage, first_detected, last_confirmed, resolved_at)
VALUES (
  v_user_id, v_bear_id, 'energy_decline', 'watch',
  'Energy Level Declining',
  'Bear has shown low energy or lethargy for 3+ days in the past 5 days. This pattern may indicate an underlying issue worth discussing with your vet.',
  'Bear''s energy decline has been gradual over approximately 2 weeks, which is more consistent with an age-related change or developing condition than an acute illness. His maintained appetite is a positive sign. Recommend discussing with your vet at his upcoming appointment.',
  '{"window_days": 5, "abnormal_days": 4, "fields": ["energy_level"]}'::jsonb,
  true, false, false,
  v_today - 13, v_today, NULL
);

-- Bear: mobility_issues — ACTIVE (concern level, escalated due to duration)
INSERT INTO pattern_alerts (user_id, dog_id, pattern_type, alert_level, title, message, ai_insight, data_window, is_active, dismissed_by_user, triggered_triage, first_detected, last_confirmed, resolved_at)
VALUES (
  v_user_id, v_bear_id, 'mobility_issues', 'concern',
  'Recurring Mobility Issues',
  'Bear has shown stiffness, reluctance to move, or difficulty rising for 3+ days in the past 5 days. At 8 years old, this pattern warrants a vet discussion about joint health.',
  'Bear''s mobility issues are intermittent but trending more frequent, with stiffness now appearing most days and occasional reluctance to walk. Combined with his declining energy, this pattern is consistent with age-related joint changes. Discuss pain management options with your vet.',
  '{"window_days": 5, "abnormal_days": 3, "fields": ["mobility"]}'::jsonb,
  true, false, false,
  v_today - 16, v_today, NULL
);


-- =============================================================================
-- STEP 5: AI HEALTH INSIGHTS
-- =============================================================================
-- Article slugs verified against blog_articles table:
--   digestion-foods, age-appropriate-feeding, urgent-vs-routine,
--   exercise-enrichment, what-vet-wishes, prepare-for-vet
-- =============================================================================

-- Luna: Digestive recovery (improving) — 5 days ago
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  v_user_id, v_luna_id, 'improving', 'info',
  ARRAY['stool_quality', 'appetite', 'energy_level'], 7,
  'Digestive Episode Resolved',
  'Luna''s digestive episode from last week has fully resolved. Her stool quality returned to normal 4 days ago, and her appetite and energy have been consistently normal since. This pattern is consistent with a self-limiting gastric upset, which is common in dogs and typically resolves within 3-5 days.',
  true,
  '[{"slug": "digestion-foods", "reason": "Understanding which foods help vs. harm your dog''s digestion can help prevent future episodes"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 2847, "output_tokens": 312, "latency_ms": 1842, "json_parse_success": true, "observations_count": 2, "max_severity": "info", "articles_recommended": 1, "had_annotation": false}'::jsonb,
  now() - interval '5 days'
);

-- Luna: Consistent appetite (positive) — 2 days ago
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  v_user_id, v_luna_id, 'positive', 'info',
  ARRAY['appetite'], 14,
  'Consistent Healthy Appetite',
  'Luna has maintained a normal, healthy appetite for the past 2 weeks (aside from the brief digestive episode). Consistent appetite is one of the best indicators of overall health in dogs. Keep up the great work with her nutrition routine!',
  true,
  '[]'::jsonb,
  v_luna_latest_checkin_id, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 2651, "output_tokens": 198, "latency_ms": 1523, "json_parse_success": true, "observations_count": 1, "max_severity": "info", "articles_recommended": 0, "had_annotation": false}'::jsonb,
  now() - interval '2 days'
);

-- Bear: Energy decline (worsening) — 3 days ago
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  v_user_id, v_bear_id, 'worsening', 'watch',
  ARRAY['energy_level'], 14,
  'Gradual Energy Decline',
  'Bear''s energy levels have been trending downward over the past 2 weeks. He has logged low energy on 10 of his last 14 check-in days, compared to mostly normal energy in the weeks prior. While some energy variation is normal in senior dogs, this sustained decline warrants attention. Discuss this trend with your vet, especially in combination with his mobility changes.',
  false,
  '[{"slug": "urgent-vs-routine", "reason": "Understanding when changes in your dog warrant an urgent visit vs. a routine appointment"}, {"slug": "what-vet-wishes", "reason": "What to track and bring to Bear''s upcoming vet appointment"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 3102, "output_tokens": 387, "latency_ms": 2104, "json_parse_success": true, "observations_count": 3, "max_severity": "watch", "articles_recommended": 2, "had_annotation": false}'::jsonb,
  now() - interval '3 days'
);

-- Bear: Mobility stable concern — 3 days ago
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  v_user_id, v_bear_id, 'stable_concern', 'watch',
  ARRAY['mobility'], 14,
  'Intermittent Mobility Issues',
  'Bear has been experiencing intermittent stiffness and occasional reluctance to move over the past 2 weeks. The pattern shows he has good days mixed with stiff days, which is typical of age-related joint changes in German Shepherds. His stiffness appears worse in the mornings and after rest. Joint supplements and appropriate exercise may help manage this pattern.',
  false,
  '[{"slug": "exercise-enrichment", "reason": "Exercise and enrichment ideas appropriate for senior dogs with mobility considerations"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 3102, "output_tokens": 342, "latency_ms": 2104, "json_parse_success": true, "observations_count": 3, "max_severity": "watch", "articles_recommended": 1, "had_annotation": false}'::jsonb,
  now() - interval '3 days'
);

-- Bear: Good appetite (positive) — 1 day ago
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  v_user_id, v_bear_id, 'positive', 'info',
  ARRAY['appetite'], 28,
  'Strong Appetite Maintained',
  'Despite his declining energy and mobility issues, Bear has maintained a consistently normal appetite throughout all 25 check-in days. A maintained appetite in a senior dog experiencing other changes is a very positive sign and suggests his overall health foundation remains solid.',
  true,
  '[]'::jsonb,
  v_bear_latest_checkin_id, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 2890, "output_tokens": 215, "latency_ms": 1678, "json_parse_success": true, "observations_count": 1, "max_severity": "info", "articles_recommended": 0, "had_annotation": false}'::jsonb,
  now() - interval '1 day'
);


-- =============================================================================
-- STEP 6: HEALTH SUMMARIES (dogs.health_summary JSONB)
-- =============================================================================
-- Matches HealthSummary interface from src/types/api.ts:
--   summary_text, notable_events[], baseline_profile (BaselineProfile),
--   annotations[], last_updated
-- =============================================================================

UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Luna is a 4-year-old Golden Retriever in generally excellent health. She experienced a brief digestive episode approximately 10 days ago (soft stool progressing to diarrhea over 3 days) that resolved on its own within 5 days. Her appetite, energy, and stool have been consistently normal since recovery. She has occasional scratching that may indicate mild seasonal allergies. Overall, Luna presents as a healthy, active dog with no ongoing concerns.',
  'notable_events', jsonb_build_array(
    'Self-limiting digestive episode (days 14-8 ago): soft stool to diarrhea to resolved. Appetite dipped briefly. No recurrence.',
    'Occasional ear scratching noted on multiple check-ins — possible seasonal allergies.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'normal',
    'typical_water_intake', 'normal',
    'typical_energy', 'normal',
    'typical_stool', 'normal',
    'typical_mobility', 'normal',
    'typical_mood', 'normal',
    'vomiting_history_note', 'Single vomiting episode during digestive upset, not recurring',
    'known_sensitivities', jsonb_build_array('possible seasonal allergies (scratching)')
  ),
  'annotations', '[]'::jsonb,
  'last_updated', to_char(now() - interval '1 day', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
), updated_at = now()
WHERE id = v_luna_id;

UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Bear is an 8-year-old German Shepherd showing age-related changes over the past 2-3 weeks. His energy levels have gradually declined from normal to consistently low, and he experiences intermittent mobility issues (morning stiffness, occasional reluctance to walk). His appetite remains consistently normal, which is a positive sign. His mood has trended toward quieter days, likely correlated with his reduced energy. These patterns are consistent with age-related joint and energy changes common in senior German Shepherds. A vet appointment has been scheduled by the owner.',
  'notable_events', jsonb_build_array(
    'Gradual energy decline beginning approximately 2 weeks ago: transitioned from mostly normal to predominantly low energy days.',
    'Intermittent mobility issues: stiffness most mornings, with occasional reluctance to move. One episode of excessive panting without heat exposure.',
    'Owner has scheduled vet appointment to discuss energy and mobility concerns.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'normal',
    'typical_water_intake', 'normal',
    'typical_energy', 'below_normal',
    'typical_stool', 'normal',
    'typical_mobility', 'limited',
    'typical_mood', 'quiet',
    'vomiting_history_note', NULL,
    'known_sensitivities', '[]'::jsonb
  ),
  'annotations', '[]'::jsonb,
  'last_updated', to_char(now() - interval '1 day', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
), updated_at = now()
WHERE id = v_bear_id;


-- =============================================================================
-- STEP 7: CORRECT STREAK VALUES
-- =============================================================================
-- The trg_checkin_streak trigger fires on each INSERT but may not compute
-- correctly for historical batch inserts. Manually set correct values.
--
-- Luna: Last missed day 7. Consecutive days 6,5,4,3,2,1,0 = 7-day streak
-- Bear: Last missed day 6. Consecutive days 5,4,3,2,1,0 = 6-day streak
-- =============================================================================

UPDATE dogs SET last_checkin_date = v_today, checkin_streak = 7 WHERE id = v_luna_id;
UPDATE dogs SET last_checkin_date = v_today, checkin_streak = 6 WHERE id = v_bear_id;


-- =============================================================================
-- DONE!
-- =============================================================================
RAISE NOTICE '✓ Seed data created successfully!';
RAISE NOTICE '  Luna (Golden Retriever, 4yo): % — 26 check-ins, 7-day streak', v_luna_id;
RAISE NOTICE '  Bear (German Shepherd, 8yo): % — 25 check-ins, 6-day streak', v_bear_id;
RAISE NOTICE '  Pattern alerts: 3 (1 resolved, 2 active)';
RAISE NOTICE '  AI insights: 5 (2 Luna, 3 Bear)';
RAISE NOTICE '  Health summaries: set on both dogs';

END $$;
