-- =============================================================================
-- PupLog — Fill Check-In Gaps for ALL Test Users (through 2026-03-18)
-- =============================================================================
-- Run this in the Supabase SQL Editor (service role required for
-- pattern_alerts and ai_health_insights INSERT).
--
-- This script fills the gap between each dog's last check-in and today
-- with meaningful, pattern-trackable health narratives.
--
-- DOG NARRATIVES:
--   wemby    → Luna (healthy baseline) + Bear (senior, vet visit + joint supplement)
--   rsandur19→ Buddy (recovering from vomiting) + Billy (serious decline, vet, improving)
--   sandur60 → Susie (appetite/energy fluctuating, stabilizing)
--   bob      → Bill (consistently healthy)
--   testuser → Buddy (healthy) + Max (senior declining, vet visit)
--   rs       → Brother (young dog, full GI recovery)
--   rsan19   → Buddy (puppy, healthy and active)
--   a@a.com  → Buddy (very senior, gentle decline) + Jdjeh (blood scare, vet, recovering)
-- =============================================================================

DO $$
DECLARE
  v_today DATE := '2026-03-18'::DATE;
BEGIN

-- =============================================================================
-- 1. WEMBY — Luna (Golden Retriever 4yo) + Bear (German Shepherd 8yo)
--    Gap: March 13-18 (6 days)
--    Luna: Healthy, occasional scratching. Perfect baseline.
--    Bear: Vet visit March 15. Started glucosamine. Slight improvement.
-- =============================================================================

-- Luna: March 13 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', 'bfddaf63-0ce7-4ccc-b54b-0b5608ddde04', '2026-03-13', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Luna: March 14 — scratching, otherwise fine
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', 'bfddaf63-0ce7-4ccc-b54b-0b5608ddde04', '2026-03-14', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["scratching"]'::jsonb, 'Scratching at ears again, might be allergy season', false);

-- Luna: March 15 — normal, great park day
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', 'bfddaf63-0ce7-4ccc-b54b-0b5608ddde04', '2026-03-15', 'normal', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Long hike today, she loved it! Drank extra water after.', false);

-- Luna: March 16 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', 'bfddaf63-0ce7-4ccc-b54b-0b5608ddde04', '2026-03-16', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Luna: March 17 — normal, scratching
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', 'bfddaf63-0ce7-4ccc-b54b-0b5608ddde04', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["scratching"]'::jsonb, NULL, false);

-- Luna: March 18 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', 'bfddaf63-0ce7-4ccc-b54b-0b5608ddde04', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Happy girl as always!', false);

-- Bear: March 13 — low energy, stiff, quiet (continued decline)
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', '80affad7-c5ff-4c35-b9fd-8c3829b499fb', '2026-03-13', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Vet appointment is Saturday. Still eating well at least.', false);

-- Bear: March 14 — low energy, reluctant
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', '80affad7-c5ff-4c35-b9fd-8c3829b499fb', '2026-03-14', 'normal', 'normal', 'low', 'normal', 'none', 'reluctant', 'quiet', '["none"]'::jsonb, 'Barely wanted to go outside today. Vet tomorrow.', false);

-- Bear: March 15 — vet visit day, still low but got diagnosis
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', '80affad7-c5ff-4c35-b9fd-8c3829b499fb', '2026-03-15', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Saw the vet today. X-rays show mild hip dysplasia. Starting glucosamine supplement and pain management plan.', false);

-- Bear: March 16 — started supplements, still adjusting
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', '80affad7-c5ff-4c35-b9fd-8c3829b499fb', '2026-03-16', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'First full day on supplements. No change yet but vet said give it a week.', false);

-- Bear: March 17 — maybe slightly better?
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', '80affad7-c5ff-4c35-b9fd-8c3829b499fb', '2026-03-17', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Seemed a tiny bit more willing to walk today. Could be wishful thinking.', false);

-- Bear: March 18 — slightly better mobility, energy still low
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('2b18e9f1-1cf9-4490-846b-36dccbf2441f', '80affad7-c5ff-4c35-b9fd-8c3829b499fb', '2026-03-18', 'normal', 'normal', 'low', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Good morning! He actually got up without struggling. Supplements might be helping.', false);

-- Update wemby streaks
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 23 WHERE id = 'bfddaf63-0ce7-4ccc-b54b-0b5608ddde04';
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 22 WHERE id = '80affad7-c5ff-4c35-b9fd-8c3829b499fb';


-- =============================================================================
-- 2. RSANDUR19 — Buddy (Golden Retriever 3.5yo) + Billy (Lab 6yo)
--    Gap: March 13-18 (6 days)
--    Buddy: Had vomiting episode, recovering. Back to normal by March 16.
--    Billy: Serious multi-system decline. Vet March 14. Blood work done.
--           Started medication. Gradual improvement.
-- =============================================================================

-- Buddy: March 13 — recovering, soft stool, eating again
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', '06ff0427-5bd1-4e00-bc51-3f4850447ba8', '2026-03-13', 'less', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'No more vomiting. Eating about half portions. Stool still soft.', false);

-- Buddy: March 14 — improving
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', '06ff0427-5bd1-4e00-bc51-3f4850447ba8', '2026-03-14', 'normal', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Appetite back to normal! Stool firming up.', false);

-- Buddy: March 15 — almost normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', '06ff0427-5bd1-4e00-bc51-3f4850447ba8', '2026-03-15', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Back to himself! Playing fetch again.', false);

-- Buddy: March 16 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', '06ff0427-5bd1-4e00-bc51-3f4850447ba8', '2026-03-16', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Buddy: March 17 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', '06ff0427-5bd1-4e00-bc51-3f4850447ba8', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Buddy: March 18 — normal, great day
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', '06ff0427-5bd1-4e00-bc51-3f4850447ba8', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Completely recovered. Good boy!', false);

-- Billy: March 13 — continued decline, limping worse
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d', '2026-03-13', 'less', 'more', 'low', 'normal', 'none', 'limping', 'quiet', '["lumps"]'::jsonb, 'Limping is worse today. The lump near his hip feels the same size. Vet tomorrow.', false);

-- Billy: March 14 — vet visit
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d', '2026-03-14', 'less', 'more', 'low', 'normal', 'none', 'limping', 'quiet', '["lumps"]'::jsonb, 'Vet did blood work and aspiration of the lump. Lump is a lipoma (benign fatty tumor). Blood work shows mild inflammation. Started anti-inflammatory meds.', false);

-- Billy: March 15 — started meds, same symptoms
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d', '2026-03-15', 'less', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'First day on anti-inflammatories. No change yet.', false);

-- Billy: March 16 — slight improvement in mobility
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d', '2026-03-16', 'less', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Limping less! Meds seem to help with pain. Appetite still down.', false);

-- Billy: March 17 — improving more
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d', '2026-03-17', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Eating normally again! Still low energy but moving better.', false);

-- Billy: March 18 — gradual improvement
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cf8fcfbc-4598-464e-820a-732802346345', 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Energy coming back! Still a bit stiff in mornings but so much better than last week. Follow-up vet visit next week.', false);

-- Update rsandur19 streaks
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 36 WHERE id = '06ff0427-5bd1-4e00-bc51-3f4850447ba8';
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 36 WHERE id = 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d';


-- =============================================================================
-- 3. SANDUR60 — Susie (Lab 5yo)
--    Gap: March 13-18 (6 days)
--    Story: Appetite/thirst/energy fluctuating. Vet visit March 16.
--    Thyroid panel ordered. Stabilizing on new diet.
-- =============================================================================

-- March 13 — appetite still variable, more thirsty
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('f453495b-6a24-4f31-b53d-467cbcb3e074', '12b46a8f-cbc3-4e38-af03-14c8e50f543d', '2026-03-13', 'more', 'more', 'low', 'normal', 'none', 'normal', 'quiet', '["none"]'::jsonb, 'Eating a lot but seems tired. Drinking more water again.', false);

-- March 14 — less appetite today, anxious
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('f453495b-6a24-4f31-b53d-467cbcb3e074', '12b46a8f-cbc3-4e38-af03-14c8e50f543d', '2026-03-14', 'less', 'more', 'low', 'normal', 'none', 'normal', 'anxious', '["excessive_panting"]'::jsonb, 'Panting and restless tonight. Not eating much. Vet booked for Monday.', false);

-- March 15 — missed (weekend, no check-in)

-- March 16 — vet visit day
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('f453495b-6a24-4f31-b53d-467cbcb3e074', '12b46a8f-cbc3-4e38-af03-14c8e50f543d', '2026-03-16', 'normal', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Vet visit today. Blood drawn for thyroid panel and metabolic check. Vet thinks it could be thyroid related given the appetite/thirst fluctuations. Results in 3 days.', false);

-- March 17 — better day, normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('f453495b-6a24-4f31-b53d-467cbcb3e074', '12b46a8f-cbc3-4e38-af03-14c8e50f543d', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Good day today. Waiting on blood work results.', false);

-- March 18 — normal, waiting on results
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('f453495b-6a24-4f31-b53d-467cbcb3e074', '12b46a8f-cbc3-4e38-af03-14c8e50f543d', '2026-03-18', 'normal', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Eating well, energy good. Still drinking a bit more than usual. Blood results should be back tomorrow.', false);

-- Update sandur60 streak (missed March 15)
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 3 WHERE id = '12b46a8f-cbc3-4e38-af03-14c8e50f543d';


-- =============================================================================
-- 4. BOB — Bill (Golden Retriever 3yo)
--    Gap: March 13-18 (6 days)
--    Story: Healthy, happy dog. All alerts resolved. One soft stool day.
-- =============================================================================

-- March 13 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cc5af60b-a2ed-4835-8ab8-2cd41056c8f3', 'c469233e-f3f7-4ba8-84a2-520ddd908215', '2026-03-13', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- March 14 — normal, extra playful
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cc5af60b-a2ed-4835-8ab8-2cd41056c8f3', 'c469233e-f3f7-4ba8-84a2-520ddd908215', '2026-03-14', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Played with the neighbor dog for hours. So happy!', false);

-- March 15 — soft stool (ate something at the park)
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cc5af60b-a2ed-4835-8ab8-2cd41056c8f3', 'c469233e-f3f7-4ba8-84a2-520ddd908215', '2026-03-15', 'normal', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Soft stool this morning. Probably ate something at the park yesterday.', false);

-- March 16 — normal, stool back to normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cc5af60b-a2ed-4835-8ab8-2cd41056c8f3', 'c469233e-f3f7-4ba8-84a2-520ddd908215', '2026-03-16', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- March 17 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cc5af60b-a2ed-4835-8ab8-2cd41056c8f3', 'c469233e-f3f7-4ba8-84a2-520ddd908215', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- March 18 — normal
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged)
VALUES ('cc5af60b-a2ed-4835-8ab8-2cd41056c8f3', 'c469233e-f3f7-4ba8-84a2-520ddd908215', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Another great day. Bill is thriving!', false);

-- Update bob streak
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 36 WHERE id = 'c469233e-f3f7-4ba8-84a2-520ddd908215';


-- =============================================================================
-- 5. TESTUSER — Buddy (Golden Retriever 3.5yo) + Max (Golden Retriever 10yo)
--    Gap: March 4-18 (15 days)
--    Buddy: Healthy baseline. Occasional anxious day (thunderstorms).
--    Max: Senior declining — energy, appetite, mobility worsening. Vet March 10.
--         Diagnosed with early arthritis + possible Cushings. Started treatment.
--         Gradual stabilization March 12-18.
-- =============================================================================

-- Buddy: March 4-18 (healthy baseline with occasional variation)
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged) VALUES
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-04', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-05', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-06', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'anxious', '["none"]'::jsonb, 'Thunderstorm tonight, he was shaking. Calmed down after it passed.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-07', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-08', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Great weekend walk!', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-09', 'normal', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Hot day, extra water', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-10', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-11', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-12', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'anxious', '["none"]'::jsonb, 'Another storm, poor guy. Otherwise fine.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-13', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-14', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-15', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Dog park day! He made a new friend.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-16', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Buddy is the happiest dog. Nothing to worry about!', false);

-- Max: March 4-18 (senior declining, vet visit, treatment, stabilization)
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged) VALUES
-- March 4-6: Continued decline
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-04', 'less', 'more', 'low', 'normal', 'none', 'stiff', 'quiet', '["excessive_panting"]'::jsonb, 'Panting a lot even indoors. Drinking way more than usual.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-05', 'less', 'excessive', 'low', 'normal', 'none', 'reluctant', 'quiet', '["excessive_panting"]'::jsonb, 'Excessive drinking today. Barely wanted to go outside. Calling vet.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-06', 'less', 'more', 'low', 'soft', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Soft stool today. Vet appointment set for Monday.', false),
-- March 7-9: Continuing, waiting for vet
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-07', 'less', 'more', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-08', 'less', 'more', 'low', 'normal', 'none', 'reluctant', 'quiet', '["excessive_panting"]'::jsonb, 'Hard day. Didnt want to get up much.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-09', 'less', 'more', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Ate a bit more today. Still stiff.', false),
-- March 10: VET VISIT
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-10', 'less', 'more', 'low', 'normal', 'none', 'stiff', 'quiet', '["excessive_panting"]'::jsonb, 'Vet visit today. Full blood panel and X-rays. Mild arthritis in both hips. Vet suspects early Cushings disease due to the excessive drinking and panting. Starting joint supplement and monitoring.', false),
-- March 11-13: On treatment, early days
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-11', 'less', 'more', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Started joint supplement. No change yet.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-12', 'normal', 'more', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Ate all his food today! First time in a while.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-13', 'normal', 'more', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Mood seems better even though energy is still low.', false),
-- March 14-16: Gradual stabilization
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-14', 'normal', 'more', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-15', 'normal', 'normal', 'low', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Walked the whole block today! First time in weeks. Water intake seems more normal.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-16', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Stiff this morning but loosened up. Eating well.', false),
-- March 17-18: Some improvement
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Best energy in weeks! Played a little with Buddy in the yard.', false),
('cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009', '2026-03-18', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Back to low energy today but appetite and water are normal. Follow-up vet appointment next week for Cushings blood work.', false);

-- Update testuser streaks
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 36 WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 36 WHERE id = 'e9e9e9e9-0000-0000-0000-000000000009';


-- =============================================================================
-- 6. RS — Brother (Lab 2yo)
--    Gap: March 4-18 (15 days)
--    Story: Young Lab recovering from acute GI episode. Full recovery by
--    March 8. Then healthy and very active. One missed day (March 11).
-- =============================================================================

INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged) VALUES
-- March 4-6: Tail end of GI recovery
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-04', 'normal', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Appetite fully back. Stool still a little soft.', false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-05', 'normal', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-06', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Stool normal again! He is back to his crazy self.', false),
-- March 7-10: Fully healthy, active puppy
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-07', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-08', 'more', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Big hike today! He was SO happy. Ate extra dinner and drank tons of water.', false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-09', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-10', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
-- March 11: MISSED
-- March 12-18: Healthy, energetic
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-12', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-13', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Learning new tricks! He can shake now.', false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-14', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-15', 'normal', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Park day! He loves other dogs.', false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-16', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["scratching"]'::jsonb, 'Scratching his belly a bit. Might need a bath.', false),
('f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Happy healthy boy!', false);

-- Resolve the old multi_symptom_acute alert for Brother (since he recovered)
UPDATE pattern_alerts SET is_active = false, resolved_at = '2026-03-06'::timestamptz
WHERE dog_id = '699f3a62-1210-4aef-bcdc-767a5d7d6dc7' AND pattern_type = 'multi_symptom_acute' AND is_active = true;

-- Update rs streak (missed March 11)
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 7 WHERE id = '699f3a62-1210-4aef-bcdc-767a5d7d6dc7';


-- =============================================================================
-- 7. RSAN19 — Buddy (Golden Retriever 1yo)
--    Gap: March 4-18 (15 days)
--    Story: Puppy, healthy and growing. Very active. One day of sneezing.
--    Missed 2 days (March 8, March 14).
-- =============================================================================

INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged) VALUES
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-04', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-05', 'more', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Growing puppy! Eating like a horse.', false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-06', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-07', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["sneezing"]'::jsonb, 'Sneezing a few times after playing in the grass', false),
-- March 8: MISSED
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-09', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'No more sneezing!', false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-10', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-11', 'normal', 'more', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Puppy class today! He did so well. Extra water after all the running.', false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-12', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-13', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
-- March 14: MISSED
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-15', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-16', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Perfect day!', false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-17', 'more', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Growing boy, always hungry!', false),
('a44a667f-f484-4d1d-90f5-5799726d8371', '3a70efc3-fc3b-4574-879e-a54d8e49c6ee', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false);

-- Update rsan19 streak (missed March 14)
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 4 WHERE id = '3a70efc3-fc3b-4574-879e-a54d8e49c6ee';


-- =============================================================================
-- 8. A@A.COM — Buddy (15yo) + Jdjeh (Lab 5yo)
--    Gap: Feb 28 - March 18 (19 days)
--    Buddy: Very senior dog. Gentle age-related decline. Eating less some days.
--           Stiff. Still happy. Missed 3 days.
--    Jdjeh: Had blood in stool + acute symptoms. Emergency vet Feb 28.
--           Diagnosed with colitis. Meds + bland diet. Steady recovery.
--           Missed 2 days.
-- =============================================================================

-- Buddy (15yo senior): Feb 28 - March 18
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged) VALUES
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-02-28', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Slow morning but perked up after breakfast.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-01', 'less', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, 'Didnt finish dinner. Took a long nap.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-02', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false),
-- March 3: MISSED
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-04', 'normal', 'normal', 'normal', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Good day! Got up without help.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-05', 'normal', 'normal', 'low', 'normal', 'none', 'difficulty_rising', 'normal', '["none"]'::jsonb, 'Needed help getting off the couch. His back legs are weaker.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-06', 'less', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-07', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Ate well today. Slow but steady on his walk.', false),
-- March 8: MISSED
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-09', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-10', 'less', 'normal', 'low', 'normal', 'none', 'difficulty_rising', 'quiet', '["none"]'::jsonb, 'Tough day. He is 15 though, so some days are harder.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-11', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-12', 'normal', 'normal', 'normal', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Pretty good day! Tail wagging when I got home.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-13', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false),
-- March 14: MISSED
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-15', 'less', 'normal', 'low', 'normal', 'none', 'stiff', 'quiet', '["bad_breath"]'::jsonb, 'Breath smells off. Less appetite. Will mention to vet.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-16', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, 'Better today. Ate all his food.', false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-17', 'normal', 'normal', 'low', 'normal', 'none', 'stiff', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56', '2026-03-18', 'normal', 'normal', 'low', 'normal', 'none', 'difficulty_rising', 'normal', '["none"]'::jsonb, 'Needed help getting up this morning. Otherwise happy old man.', false);

-- Jdjeh (Lab 5yo, colitis recovery): Feb 28 - March 18
INSERT INTO daily_check_ins (user_id, dog_id, check_in_date, appetite, water_intake, energy_level, stool_quality, vomiting, mobility, mood, additional_symptoms, free_text, emergency_flagged) VALUES
-- Feb 28-March 1: Emergency vet, started treatment
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-02-28', 'barely', 'less', 'low', 'blood', 'multiple', 'normal', 'quiet', '["none"]'::jsonb, 'Took to emergency vet. Blood in stool and vomiting. Diagnosed with acute colitis. Got IV fluids and anti-nausea meds. Prescribed metronidazole and bland diet.', true),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-01', 'barely', 'less', 'low', 'diarrhea', 'once', 'normal', 'quiet', '["none"]'::jsonb, 'Still not great. One vomit this morning. Diarrhea but no blood today. Started meds.', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-02', 'less', 'normal', 'low', 'diarrhea', 'none', 'normal', 'quiet', '["none"]'::jsonb, 'No vomiting today. Still has diarrhea. Eating small amounts of boiled chicken and rice.', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-03', 'less', 'normal', 'low', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Stool firming up! Still soft but no diarrhea. Eating more.', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-04', 'less', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Energy coming back. Playing a little. Stool still soft.', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-05', 'normal', 'normal', 'normal', 'soft', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Eating normal portions of bland diet. Getting better!', false),
-- March 6: MISSED
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-07', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Stool normal! Starting to transition back to regular food slowly.', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-08', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, '50/50 bland and regular food. No issues.', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-09', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-10', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Back on regular food. No problems!', false),
-- March 11: MISSED
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-12', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Last day of antibiotics. Feeling great!', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-13', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-14', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-15', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Vet follow-up: all clear! Colitis fully resolved.', false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-16', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-17', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, NULL, false),
('e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0', '2026-03-18', 'normal', 'normal', 'normal', 'normal', 'none', 'normal', 'normal', '["none"]'::jsonb, 'Happy and healthy! Fully recovered.', false);

-- Resolve Jdjeh's acute alerts (recovered)
UPDATE pattern_alerts SET is_active = false, resolved_at = '2026-03-07'::timestamptz
WHERE dog_id = 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0' AND is_active = true;

-- Update a@a.com streaks (Buddy missed March 14, Jdjeh missed March 11)
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 4 WHERE id = '26c852dd-8ec5-47d5-864e-c89bf0366f56';
UPDATE dogs SET last_checkin_date = '2026-03-18', checkin_streak = 7 WHERE id = 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0';


-- =============================================================================
-- 9. NEW AI INSIGHTS (recent, for all users with interesting patterns)
-- =============================================================================

-- wemby: Bear — vet visit insight
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  '2b18e9f1-1cf9-4490-846b-36dccbf2441f', '80affad7-c5ff-4c35-b9fd-8c3829b499fb',
  'improving', 'info',
  ARRAY['mobility'], 7,
  'Early Signs of Improvement After Treatment',
  'Bear''s mobility has shown a small but encouraging improvement over the past 3 days since starting glucosamine and the vet''s pain management plan. Today he got up without struggling for the first time in weeks. While energy levels remain low, the mobility trend is heading in the right direction. Continue the treatment plan and monitor for further improvement.',
  true,
  '[{"slug": "exercise-enrichment", "reason": "Gentle exercise ideas appropriate for a senior dog on a joint health plan"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 3100, "output_tokens": 280, "latency_ms": 1900, "json_parse_success": true, "observations_count": 2, "max_severity": "info", "articles_recommended": 1, "had_annotation": false}'::jsonb,
  '2026-03-18'::timestamptz
);

-- rsandur19: Billy — treatment response
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  'cf8fcfbc-4598-464e-820a-732802346345', 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d',
  'improving', 'watch',
  ARRAY['energy_level', 'mobility', 'appetite'], 7,
  'Responding Well to Treatment',
  'Billy is showing clear improvement since starting anti-inflammatory medication on March 15. His appetite has returned to normal, energy is coming back, and the limping has reduced to mild stiffness. The lipoma (benign lump) is being monitored. Continue the current treatment plan and attend the follow-up appointment next week.',
  true,
  '[{"slug": "prepare-for-vet", "reason": "How to prepare for Billy''s follow-up appointment and what questions to ask"}, {"slug": "what-vet-wishes", "reason": "Tracking trends like these helps your vet make better decisions"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 3400, "output_tokens": 340, "latency_ms": 2100, "json_parse_success": true, "observations_count": 2, "max_severity": "watch", "articles_recommended": 2, "had_annotation": false}'::jsonb,
  '2026-03-18'::timestamptz
);

-- rsandur19: Buddy — full recovery
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  'cf8fcfbc-4598-464e-820a-732802346345', '06ff0427-5bd1-4e00-bc51-3f4850447ba8',
  'resolved', 'info',
  ARRAY['stool_quality', 'appetite'], 7,
  'Vomiting Episode Fully Resolved',
  'Buddy has made a complete recovery from his recent GI episode. His appetite, stool quality, and energy have all returned to normal baseline for the past 4 consecutive days. No signs of recurrence.',
  true,
  '[{"slug": "digestion-foods", "reason": "Foods that support digestive health and help prevent future episodes"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 2600, "output_tokens": 180, "latency_ms": 1400, "json_parse_success": true, "observations_count": 1, "max_severity": "info", "articles_recommended": 1, "had_annotation": false}'::jsonb,
  '2026-03-17'::timestamptz
);

-- testuser: Max — treatment response with cautious optimism
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  'cd8b0bc0-5d73-4f31-b477-8a6c12270b1e', 'e9e9e9e9-0000-0000-0000-000000000009',
  'improving', 'watch',
  ARRAY['appetite', 'water_intake', 'mobility'], 14,
  'Stabilizing After Vet Treatment',
  'Max is showing improvement since his vet visit on March 10. His appetite has returned to normal, and his excessive water intake has decreased — both positive signs if Cushings disease is being managed. Mobility remains an issue (stiff most mornings) but he had one day of normal energy this week. The follow-up blood work next week will be important for confirming the Cushings diagnosis.',
  false,
  '[{"slug": "age-appropriate-feeding", "reason": "Nutrition considerations for senior dogs with health conditions"}, {"slug": "what-vet-wishes", "reason": "Bringing these tracked trends to Max''s follow-up appointment"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 3500, "output_tokens": 380, "latency_ms": 2200, "json_parse_success": true, "observations_count": 3, "max_severity": "watch", "articles_recommended": 2, "had_annotation": false}'::jsonb,
  '2026-03-18'::timestamptz
);

-- sandur60: Susie — vet visit, awaiting results
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  'f453495b-6a24-4f31-b53d-467cbcb3e074', '12b46a8f-cbc3-4e38-af03-14c8e50f543d',
  'fluctuating', 'watch',
  ARRAY['appetite', 'water_intake', 'energy_level'], 14,
  'Appetite and Thirst Fluctuations Under Investigation',
  'Susie''s appetite and thirst have been swinging between increased and decreased over the past 2 weeks, which is an unusual pattern. Her vet visit on March 16 was the right call — blood work for thyroid and metabolic panels will help identify the underlying cause. The past 2 days have been better (normal appetite and energy), but the increased water intake persists. Share these logged trends with your vet when results come in.',
  false,
  '[{"slug": "urgent-vs-routine", "reason": "Understanding when fluctuating symptoms need attention"}, {"slug": "what-vet-wishes", "reason": "Your tracked data will be invaluable for Susie''s diagnosis"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 3200, "output_tokens": 320, "latency_ms": 2000, "json_parse_success": true, "observations_count": 2, "max_severity": "watch", "articles_recommended": 2, "had_annotation": false}'::jsonb,
  '2026-03-18'::timestamptz
);

-- a@a.com: Jdjeh — full recovery from colitis
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  'e94605af-d7f1-4ad9-9778-305324436029', 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0',
  'resolved', 'info',
  ARRAY['stool_quality', 'appetite', 'vomiting'], 14,
  'Colitis Fully Resolved — Great Recovery',
  'Jdjeh has made a complete recovery from acute colitis. After emergency treatment on February 28, he progressed through diarrhea to soft stool to fully normal within 7 days. He has been consistently healthy for the past 11 days on regular food with no recurrence. The vet confirmed full recovery on March 15. Excellent outcome!',
  true,
  '[{"slug": "digestion-foods", "reason": "Understanding which foods are gentle on recovery and help prevent colitis recurrence"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 2900, "output_tokens": 260, "latency_ms": 1700, "json_parse_success": true, "observations_count": 1, "max_severity": "info", "articles_recommended": 1, "had_annotation": false}'::jsonb,
  '2026-03-18'::timestamptz
);

-- a@a.com: Buddy (15yo senior) — age-related patterns
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  'e94605af-d7f1-4ad9-9778-305324436029', '26c852dd-8ec5-47d5-864e-c89bf0366f56',
  'stable_concern', 'watch',
  ARRAY['energy_level', 'mobility', 'appetite'], 14,
  'Age-Related Changes in a Very Senior Dog',
  'Buddy consistently shows low energy and stiffness, with occasional difficulty rising — all expected patterns for a 15-year-old dog. His appetite fluctuates between normal and reduced days. The new bad breath noted on March 15 is worth mentioning to his vet, as dental issues are common in senior dogs and can affect appetite. Overall, Buddy has good days mixed with harder days, which is a normal pattern for his age.',
  false,
  '[{"slug": "age-appropriate-feeding", "reason": "Nutrition tips for very senior dogs to maintain weight and energy"}, {"slug": "exercise-enrichment", "reason": "Gentle enrichment ideas for dogs with limited mobility"}]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 3100, "output_tokens": 300, "latency_ms": 1900, "json_parse_success": true, "observations_count": 2, "max_severity": "watch", "articles_recommended": 2, "had_annotation": false}'::jsonb,
  '2026-03-18'::timestamptz
);

-- rs: Brother — healthy after recovery
INSERT INTO ai_health_insights (user_id, dog_id, insight_type, severity, fields_involved, timespan_days, title, message, is_positive, recommended_articles, triggered_by_check_in_id, model_used, metadata, created_at)
VALUES (
  'f9f65e38-a622-4234-9834-9621cf8b6dc8', '699f3a62-1210-4aef-bcdc-767a5d7d6dc7',
  'positive', 'info',
  ARRAY['stool_quality', 'energy_level', 'appetite'], 14,
  'Thriving Young Dog',
  'Brother has been consistently healthy for the past 2 weeks following his full GI recovery. All metrics are normal, he is active and eating well. At 2 years old, his resilience and quick recovery are typical of a young, healthy Lab. Keep up the great daily check-ins!',
  true, '[]'::jsonb,
  NULL, 'claude-sonnet-4-5-20250929',
  '{"input_tokens": 2500, "output_tokens": 170, "latency_ms": 1300, "json_parse_success": true, "observations_count": 1, "max_severity": "info", "articles_recommended": 0, "had_annotation": false}'::jsonb,
  '2026-03-18'::timestamptz
);


-- =============================================================================
-- 10. UPDATE HEALTH SUMMARIES for dogs with significant new data
-- =============================================================================

-- Bear (wemby) — updated with vet diagnosis
UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Bear is an 8-year-old German Shepherd diagnosed with mild hip dysplasia on March 15, 2026. He has been experiencing gradual energy decline and intermittent mobility issues over the past 4 weeks. Energy levels remain consistently low, but mobility showed early improvement after starting glucosamine supplement and pain management on March 15. Appetite has remained consistently normal throughout, which is a positive sign. Vet follow-up pending.',
  'notable_events', jsonb_build_array(
    'Gradual energy decline beginning approximately 4 weeks ago: from mostly normal to predominantly low energy.',
    'Intermittent mobility issues: morning stiffness, occasional reluctance. One episode of excessive panting.',
    'Vet visit March 15: X-rays show mild hip dysplasia. Started glucosamine and pain management plan.',
    'Early positive response: mobility improving March 17-18, got up without struggling.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'normal',
    'typical_water_intake', 'normal',
    'typical_energy', 'below_normal',
    'typical_stool', 'normal',
    'typical_mobility', 'limited',
    'typical_mood', 'quiet_to_normal',
    'vomiting_history_note', NULL,
    'known_sensitivities', '[]'::jsonb
  ),
  'annotations', jsonb_build_array('March 15: Diagnosed mild hip dysplasia. Treatment started.'),
  'last_updated', '2026-03-18T03:00:00Z'
), updated_at = now()
WHERE id = '80affad7-c5ff-4c35-b9fd-8c3829b499fb';

-- Billy (rsandur19) — updated with vet results
UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Billy is a 6-year-old Lab who experienced a multi-system decline over the past month: progressive limping, appetite loss, behavioral changes, and low energy. Vet visit March 14 revealed mild inflammation (blood work) and a benign lipoma near his hip. Started anti-inflammatory medication with clear positive response: appetite returned to normal, energy improving, limping reduced to mild stiffness. Follow-up vet appointment scheduled.',
  'notable_events', jsonb_build_array(
    'Progressive limping detected approximately 3 weeks ago, escalated to reluctant movement.',
    'New lump near hip: aspirated March 14, confirmed benign lipoma (fatty tumor).',
    'Blood work shows mild inflammation. Anti-inflammatory medication started March 14.',
    'Clear treatment response: appetite normal by March 17, energy returning by March 18.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'normal',
    'typical_water_intake', 'normal',
    'typical_energy', 'below_normal',
    'typical_stool', 'normal',
    'typical_mobility', 'limited',
    'typical_mood', 'normal',
    'vomiting_history_note', NULL,
    'known_sensitivities', '[]'::jsonb
  ),
  'annotations', jsonb_build_array('March 14: Vet visit. Lipoma benign. Anti-inflammatory started. March 17-18: Clear improvement.'),
  'last_updated', '2026-03-18T03:00:00Z'
), updated_at = now()
WHERE id = 'ff7e1fc3-e76e-4d06-820d-f754901c1a3d';

-- Max (testuser) — updated with Cushings investigation
UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Max is a 10-year-old Golden Retriever under investigation for possible early Cushings disease. Over the past 3 weeks, he showed declining energy, reduced appetite, excessive water intake, excessive panting, and progressive stiffness. Vet visit March 10: X-rays show mild arthritis in both hips. Blood panel pending Cushings confirmation. Started joint supplement. Showing stabilization: appetite and water intake normalizing, energy had one good day. Mobility remains an issue. Follow-up blood work scheduled.',
  'notable_events', jsonb_build_array(
    'Multi-system decline over 3 weeks: energy, appetite, water intake, mobility all affected.',
    'Excessive water intake and panting raised Cushings disease concern.',
    'Vet visit March 10: Mild arthritis confirmed. Cushings blood panel pending.',
    'Stabilization March 12-18: Appetite returned, water intake decreasing, one good energy day.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'normal',
    'typical_water_intake', 'slightly_elevated',
    'typical_energy', 'below_normal',
    'typical_stool', 'normal',
    'typical_mobility', 'limited',
    'typical_mood', 'normal',
    'vomiting_history_note', NULL,
    'known_sensitivities', '[]'::jsonb
  ),
  'annotations', jsonb_build_array('March 10: Vet visit. Arthritis + suspected Cushings. Treatment started. March 15-18: Stabilizing.'),
  'last_updated', '2026-03-18T03:00:00Z'
), updated_at = now()
WHERE id = 'e9e9e9e9-0000-0000-0000-000000000009';

-- Jdjeh (a@a.com) — updated with colitis recovery
UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Jdjeh is a 5-year-old Lab who experienced acute colitis on February 28, presenting with blood in stool and multiple vomiting episodes. Emergency vet treated with IV fluids and prescribed metronidazole and bland diet. Recovery was steady: diarrhea resolved within 5 days, back on regular food by day 10, antibiotics completed day 13. Vet confirmed full recovery March 15. Has been consistently healthy since.',
  'notable_events', jsonb_build_array(
    'Acute colitis episode February 28: blood in stool, multiple vomiting. Emergency vet visit.',
    'Treatment: metronidazole + bland diet. IV fluids at ER.',
    'Full recovery by March 7 (stool normal). Back on regular food March 10.',
    'Vet follow-up March 15: all clear.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'normal',
    'typical_water_intake', 'normal',
    'typical_energy', 'normal',
    'typical_stool', 'normal',
    'typical_mobility', 'normal',
    'typical_mood', 'normal',
    'vomiting_history_note', 'Acute colitis episode Feb 28 — resolved',
    'known_sensitivities', '[]'::jsonb
  ),
  'annotations', jsonb_build_array('Feb 28: Acute colitis. ER vet. March 15: Full recovery confirmed.'),
  'last_updated', '2026-03-18T03:00:00Z'
), updated_at = now()
WHERE id = 'bb950e10-6ba1-4fe2-bdd9-5f35cdd90dc0';

-- Buddy (a@a.com, 15yo) — senior summary
UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Buddy is a 15-year-old dog showing typical age-related patterns: consistently low energy, morning stiffness with occasional difficulty rising, and intermittent appetite fluctuations. His mood is generally positive despite physical limitations. New bad breath noted March 15 may indicate dental issues worth investigating. Good days and harder days are mixed, which is normal for his advanced age.',
  'notable_events', jsonb_build_array(
    'Consistent low energy and stiffness throughout observation period.',
    'Occasional difficulty rising (March 5, 10, 18) — hind leg weakness.',
    'Intermittent appetite dips (March 1, 6, 15).',
    'New bad breath March 15 — possible dental issue.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'mostly_normal',
    'typical_water_intake', 'normal',
    'typical_energy', 'below_normal',
    'typical_stool', 'normal',
    'typical_mobility', 'limited',
    'typical_mood', 'normal',
    'vomiting_history_note', NULL,
    'known_sensitivities', '[]'::jsonb
  ),
  'annotations', '[]'::jsonb,
  'last_updated', '2026-03-18T03:00:00Z'
), updated_at = now()
WHERE id = '26c852dd-8ec5-47d5-864e-c89bf0366f56';

-- Brother (rs) — healthy summary
UPDATE dogs SET health_summary = jsonb_build_object(
  'summary_text', 'Brother is a healthy, active 2-year-old Lab. He fully recovered from an acute GI episode in early March (multi-symptom acute + digestive issues). Since March 6, all metrics have been consistently normal. He is energetic, eating well, and thriving.',
  'notable_events', jsonb_build_array(
    'Acute GI episode late February — resolved by March 6.',
    'Consistently healthy since recovery — 12+ days all normal.'
  ),
  'baseline_profile', jsonb_build_object(
    'typical_appetite', 'normal',
    'typical_water_intake', 'normal',
    'typical_energy', 'normal',
    'typical_stool', 'normal',
    'typical_mobility', 'normal',
    'typical_mood', 'normal',
    'vomiting_history_note', 'GI episode late Feb — fully resolved',
    'known_sensitivities', '[]'::jsonb
  ),
  'annotations', '[]'::jsonb,
  'last_updated', '2026-03-18T03:00:00Z'
), updated_at = now()
WHERE id = '699f3a62-1210-4aef-bcdc-767a5d7d6dc7';


-- =============================================================================
-- DONE
-- =============================================================================
RAISE NOTICE '=== Seed complete! ===';
RAISE NOTICE 'Check-ins added for all 8 test users (12 dogs) through 2026-03-18';
RAISE NOTICE 'AI insights added: 8 new insights';
RAISE NOTICE 'Health summaries updated: 6 dogs';
RAISE NOTICE 'Pattern alerts resolved: Brother (multi_symptom_acute), Jdjeh (blood_in_stool, multi_symptom_acute, vomiting_plus_other)';
RAISE NOTICE 'Streaks updated for all dogs';

END $$;
