import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { StickerId, getCurrentSeasonStickerId } from '../constants/achievements';

// ─── Types ────────────────────────────────────────────────────────────────────

type EarnedRecord = {
  id: StickerId;
  earned_at: string;
  metadata: unknown | null;
};

export type FeaturedSlots = [StickerId | null, StickerId | null, StickerId | null];

interface UserAchievementsState {
  earnedIds: Set<StickerId>;
  earnedRecords: EarnedRecord[];
  isLoading: boolean;
  error: string | null;
  lastEarned: StickerId | null;   // celebration trigger; cleared by clearLastEarned
  seasonalCheckedThisSession: boolean;
  featuredIds: FeaturedSlots;

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

  /**
   * Pattern E PR 1: replaces featuredIds with the array loaded from DB
   * (called by profileStore.loadFromAuthAndProfile after a successful fetch).
   * Defensive: null or wrong-length input falls back to [null, null, null].
   */
  hydrateFeatured: (ids: FeaturedSlots | null) => void;

  /**
   * Pattern E PR 1: pure function. Returns the new featuredIds after auto-filling
   * empty slots from the earnedIds list. Only fires when totalEarned <= 3 —
   * once user has 4+ earns, new earns require manual swap via the picker (PR 2).
   * Called by PR 2's wired earn flow; included in PR 1 as a tested primitive.
   */
  computeAutoFill: (currentFeatured: FeaturedSlots, earnedIds: StickerId[]) => FeaturedSlots;

  /**
   * Pattern E PR 1: fills the specified slot (0|1|2) with stickerId, then
   * persists the new featuredIds array to user_profiles.featured_stickers.
   * Optimistic: updates local state immediately, fire-and-forget DB write.
   */
  setFeatured: (slotIndex: 0 | 1 | 2, stickerId: StickerId) => Promise<void>;

  /**
   * Pattern E PR 1: finds the slot containing stickerId, nulls it out, and
   * persists the updated featuredIds array to user_profiles.featured_stickers.
   * No-op if stickerId is not in any slot. Optimistic: updates local state
   * immediately, fire-and-forget DB write.
   */
  unsetFeatured: (stickerId: StickerId) => Promise<void>;

  /**
   * Pattern E PR 1: finds the slot containing oldStickerId, replaces it with
   * newStickerId, and persists the updated featuredIds array to
   * user_profiles.featured_stickers. No-op if oldStickerId is not in any slot.
   * Optimistic: updates local state immediately, fire-and-forget DB write.
   */
  swapFeatured: (oldStickerId: StickerId, newStickerId: StickerId) => Promise<void>;
}

// ─── Initial state helper ─────────────────────────────────────────────────────

const INITIAL_STATE = {
  earnedIds: new Set<StickerId>(),
  earnedRecords: [] as EarnedRecord[],
  isLoading: false,
  error: null,
  lastEarned: null,
  seasonalCheckedThisSession: false,
  featuredIds: [null, null, null] as FeaturedSlots,
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

      // Pattern E auto-fill (PR 2): while totalEarned <= 3, fill any empty
      // featured slot with the earned stickers. Skips when user has > 3
      // earns - at that point the user is in manual control.
      const { featuredIds: currentFeatured, computeAutoFill } = get();
      const earnedIdsArray = rows
        .map((r) => r.sticker_id as StickerId)
        // Process in earned_at ascending so the OLDEST earns get slot priority,
        // matching the user's mental model of "first earned, first featured".
        .reverse();
      const nextFeatured = computeAutoFill(currentFeatured, earnedIdsArray);
      const featuredChanged =
        nextFeatured[0] !== currentFeatured[0] ||
        nextFeatured[1] !== currentFeatured[1] ||
        nextFeatured[2] !== currentFeatured[2];

      set({
        earnedIds,
        earnedRecords,
        isLoading: false,
        error: null,
        ...(featuredChanged ? { featuredIds: nextFeatured } : {}),
      });

      // Persist auto-filled slots to user_profiles (fire-and-forget).
      if (featuredChanged) {
        try {
          await supabase
            .from('user_profiles')
            .update({ featured_stickers: nextFeatured })
            .eq('user_id', user.id);
        } catch {
          // Silent - local state already updated optimistically
        }
      }
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
      featuredIds: [null, null, null],
    });
  },

  setFeatured: async (slotIndex, stickerId) => {
    const { featuredIds } = get();
    const next: FeaturedSlots = [...featuredIds] as FeaturedSlots;
    next[slotIndex] = stickerId;
    set({ featuredIds: next });

    // Persist to DB (optimistic — DB error doesn't roll back local state)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('user_profiles')
        .update({ featured_stickers: next })
        .eq('user_id', user.id);
    } catch {
      // Silent — local state is source of truth in PR 1; PR 3 adds reconciliation
    }
  },

  unsetFeatured: async (stickerId) => {
    const { featuredIds } = get();
    const slotIdx = featuredIds.indexOf(stickerId);
    if (slotIdx === -1) return;  // no-op

    const next: FeaturedSlots = [...featuredIds] as FeaturedSlots;
    next[slotIdx] = null;
    set({ featuredIds: next });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('user_profiles')
        .update({ featured_stickers: next })
        .eq('user_id', user.id);
    } catch {
      // Silent
    }
  },

  swapFeatured: async (oldId, newId) => {
    const { featuredIds } = get();
    const slotIdx = featuredIds.indexOf(oldId);
    if (slotIdx === -1) return;  // no-op if old not present

    const next: FeaturedSlots = [...featuredIds] as FeaturedSlots;
    next[slotIdx] = newId;
    set({ featuredIds: next });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('user_profiles')
        .update({ featured_stickers: next })
        .eq('user_id', user.id);
    } catch {
      // Silent
    }
  },

  hydrateFeatured: (ids) => {
    if (!Array.isArray(ids) || ids.length !== 3) {
      set({ featuredIds: [null, null, null] });
      return;
    }
    set({ featuredIds: ids as FeaturedSlots });
  },

  computeAutoFill: (currentFeatured, earnedIds) => {
    // Only auto-fill while user has 3 or fewer total earns
    if (earnedIds.length > 3) return currentFeatured;

    const next: FeaturedSlots = [...currentFeatured] as FeaturedSlots;
    const alreadyFeatured = new Set(next.filter((id): id is StickerId => id !== null));

    for (const earnId of earnedIds) {
      if (alreadyFeatured.has(earnId)) continue;
      const emptyIdx = next.indexOf(null);
      if (emptyIdx === -1) break;
      next[emptyIdx] = earnId;
      alreadyFeatured.add(earnId);
    }
    return next;
  },
}));
