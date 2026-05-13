import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { StickerId, getCurrentSeasonStickerId } from '../constants/achievements';

// ─── Types ────────────────────────────────────────────────────────────────────

type EarnedRecord = {
  id: StickerId;
  earned_at: string;
  metadata: unknown | null;
};

interface UserAchievementsState {
  earnedIds: Set<StickerId>;
  earnedRecords: EarnedRecord[];
  isLoading: boolean;
  error: string | null;
  lastEarned: StickerId | null;   // celebration trigger; cleared by clearLastEarned
  seasonalCheckedThisSession: boolean;

  /**
   * Reads the user_achievements table for the current auth user.
   * Defensive: empty rows (race with handle_new_user) are not an error.
   */
  fetch: () => Promise<void>;

  /**
   * Clears lastEarned after the celebration screen dismisses.
   */
  clearLastEarned: () => void;

  /**
   * Once per app session, checks whether the current seasonal sticker should
   * be awarded. No-ops if the sticker is already earned or the check has
   * already run this session.
   */
  checkSeasonal: () => Promise<void>;

  /**
   * Generic event-driven check. Invokes the check-achievements Edge Function
   * and refetches if newly_earned contains at least one sticker.
   * Sets lastEarned to the first newly-earned id (one celebration per check).
   */
  triggerEventCheck: (eventType: string, dogId?: string) => Promise<void>;

  /**
   * Resets to initial state (call on sign-out, mirrors clearProfile pattern).
   */
  clearAchievements: () => void;
}

// ─── Initial state helper ─────────────────────────────────────────────────────

const INITIAL_STATE = {
  earnedIds: new Set<StickerId>(),
  earnedRecords: [] as EarnedRecord[],
  isLoading: false,
  error: null,
  lastEarned: null,
  seasonalCheckedThisSession: false,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserAchievementsStore = create<UserAchievementsState>((set, get) => ({
  ...INITIAL_STATE,

  fetch: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        set({
          isLoading: false,
          error: authError?.message ?? 'Not authenticated',
        });
        return;
      }

      const { data, error: selectError } = await supabase
        .from('user_achievements')
        .select('sticker_id, earned_at, metadata')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (selectError) {
        set({ isLoading: false, error: selectError.message });
        return;
      }

      const rows = (data ?? []) as Array<{
        sticker_id: string;
        earned_at: string;
        metadata: unknown | null;
      }>;

      const earnedIds = new Set<StickerId>(rows.map((r) => r.sticker_id as StickerId));
      const earnedRecords: EarnedRecord[] = rows.map((r) => ({
        id: r.sticker_id as StickerId,
        earned_at: r.earned_at,
        metadata: r.metadata,
      }));

      set({ earnedIds, earnedRecords, isLoading: false, error: null });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load achievements',
      });
    }
  },

  clearLastEarned: () => {
    set({ lastEarned: null });
  },

  checkSeasonal: async () => {
    const { seasonalCheckedThisSession, earnedIds } = get();

    // Set the flag first so the second call is a no-op even if the check errors
    set({ seasonalCheckedThisSession: true });

    if (seasonalCheckedThisSession) {
      return;
    }

    const seasonalId = getCurrentSeasonStickerId();

    if (earnedIds.has(seasonalId)) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase.functions.invoke('check-achievements', {
        body: { user_id: user.id, event_type: 'app_opened' },
      });

      const newlyEarned: string[] = data?.newly_earned ?? [];

      if (newlyEarned.length > 0) {
        // Refetch to get updated records
        await get().fetch();
        set({ lastEarned: newlyEarned[0] as StickerId });
      }
    } catch {
      // Seasonal check errors are non-fatal — silently ignore
    }
  },

  triggerEventCheck: async (eventType: string, dogId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const body: Record<string, string> = {
        user_id: user.id,
        event_type: eventType,
      };
      if (dogId !== undefined) {
        body.dog_id = dogId;
      }

      const { data } = await supabase.functions.invoke('check-achievements', { body });

      const newlyEarned: string[] = data?.newly_earned ?? [];

      if (newlyEarned.length > 0) {
        // Refetch to get updated records
        await get().fetch();
        set({ lastEarned: newlyEarned[0] as StickerId });
      }
    } catch {
      // Event check errors are non-fatal — silently ignore
    }
  },

  clearAchievements: () => {
    set({
      earnedIds: new Set<StickerId>(),
      earnedRecords: [],
      isLoading: false,
      error: null,
      lastEarned: null,
      seasonalCheckedThisSession: false,
    });
  },
}));
