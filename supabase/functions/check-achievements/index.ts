// check-achievements Edge Function — single endpoint, fire-and-forget pattern
// matching analyze-patterns / ai-health-analysis conventions. Service role for DB writes;
// JWT validated internally (verify_jwt: false matches the project ES256/HS256 mismatch).
//
// Account-level sticker triggered by per-dog event (first_peony / bouquet_of_joy /
// full_spectrum / bloom_master): the flower belongs to ONE dog's garden, but the
// achievement is earned ONCE per account. Stored as a single row (user_id, sticker_id) —
// metadata.dog_id records which dog triggered it for celebration copy. Do not
// refactor to per-dog earning. See project_achievement_stickers.md.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const STICKER_IDS = [
  'welcome',
  'seasonal_fall',
  'seasonal_winter',
  'seasonal_spring',
  'seasonal_summer',
  'pattern_spotter',
  'first_peony',
  'bouquet_of_joy',
  'multi_pup_parent',
  'full_spectrum',
  'bloom_master',
  // tender_caretaker — added 2026-05-27 to mirror src/constants/achievements.ts.
  // NOTE: no event handler currently awards this; the ID is registered here so
  // backend code can reference it. A follow-up PR should add an event handler
  // (e.g., on first check-in submission) for the sticker to be earnable.
  'tender_caretaker',
] as const;

type StickerId = typeof STICKER_IDS[number];

// Flower system is not yet shipped. When it does, flip this to true and the
// flower_earned event will start awarding the 4 gated stickers per their predicates.
const FLOWERS_ENABLED = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function getCurrentSeasonStickerId(d: Date): StickerId {
  const m = d.getUTCMonth(); // 0-11
  if (m >= 8 && m <= 10) return 'seasonal_fall';   // Sep-Nov
  if (m === 11 || m <= 1) return 'seasonal_winter'; // Dec-Feb
  if (m >= 2 && m <= 4) return 'seasonal_spring';   // Mar-May
  return 'seasonal_summer';                          // Jun-Aug
}

async function alreadyHas(
  service: SupabaseClient,
  userId: string,
  stickerId: StickerId,
): Promise<boolean> {
  const { data } = await service
    .from('user_achievements')
    .select('sticker_id')
    .eq('user_id', userId)
    .eq('sticker_id', stickerId)
    .maybeSingle();
  return !!data;
}

async function insertAchievement(
  service: SupabaseClient,
  userId: string,
  stickerId: StickerId,
  metadata: Record<string, unknown> | null = null,
): Promise<boolean> {
  // Returns true if a new row was inserted. ON CONFLICT DO NOTHING semantics:
  // we attempt insert and treat unique-violation as a no-op.
  const { data, error } = await service
    .from('user_achievements')
    .insert({ user_id: userId, sticker_id: stickerId, metadata })
    .select('sticker_id')
    .maybeSingle();
  if (error) {
    if (error.code === '23505') return false; // unique violation
    console.error('insert error', { sticker_id: stickerId, code: error.code, message: error.message });
    return false;
  }
  return !!data;
}

async function checkDogAdded(service: SupabaseClient, userId: string): Promise<StickerId[]> {
  if (await alreadyHas(service, userId, 'multi_pup_parent')) return [];
  const { count } = await service
    .from('dogs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  if ((count ?? 0) >= 2) {
    const inserted = await insertAchievement(service, userId, 'multi_pup_parent');
    return inserted ? ['multi_pup_parent'] : [];
  }
  return [];
}

async function checkAIInsightViewed(
  service: SupabaseClient,
  userId: string,
): Promise<StickerId[]> {
  if (await alreadyHas(service, userId, 'pattern_spotter')) return [];
  const inserted = await insertAchievement(service, userId, 'pattern_spotter');
  return inserted ? ['pattern_spotter'] : [];
}

async function checkAppOpened(service: SupabaseClient, userId: string): Promise<StickerId[]> {
  const stickerId = getCurrentSeasonStickerId(new Date());
  if (await alreadyHas(service, userId, stickerId)) return [];
  const inserted = await insertAchievement(service, userId, stickerId);
  return inserted ? [stickerId] : [];
}

async function checkFlowerEarned(
  _service: SupabaseClient,
  _userId: string,
  _dogId: string | undefined,
): Promise<StickerId[]> {
  if (!FLOWERS_ENABLED) return [];
  // When flowers ship, expand this with per-sticker predicates referencing the
  // flowers table. The account-level asymmetry note at the top of this file applies.
  return [];
}

Deno.serve(async (req: Request): Promise<Response> => {
  const startMs = Date.now();

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as { event_type?: string; dog_id?: string };
    const eventType = body.event_type;

    if (typeof eventType !== 'string' || !eventType) {
      return new Response(JSON.stringify({ error: 'event_type required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate JWT and extract user_id.
    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) {
      return new Response(JSON.stringify({ error: 'Missing JWT' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: userData, error: userErr } = await authClient.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid JWT' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = userData.user.id;

    const service = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let newlyEarned: StickerId[] = [];
    switch (eventType) {
      case 'dog_added':
        newlyEarned = await checkDogAdded(service, userId);
        break;
      case 'ai_insight_viewed':
        newlyEarned = await checkAIInsightViewed(service, userId);
        break;
      case 'app_opened':
        newlyEarned = await checkAppOpened(service, userId);
        break;
      case 'flower_earned':
        newlyEarned = await checkFlowerEarned(service, userId, body.dog_id);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown event_type: ${eventType}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
    }

    const latencyMs = Date.now() - startMs;
    console.log(
      JSON.stringify({
        fn: 'check-achievements',
        event_type: eventType,
        user_id: userId,
        newly_earned: newlyEarned,
        latency_ms: latencyMs,
      }),
    );

    return new Response(JSON.stringify({ newly_earned: newlyEarned }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('check-achievements unhandled error', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
