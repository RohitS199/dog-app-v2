import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserPreferences = {
  notify_daily_log_reminder: boolean;
  notify_weekly_insight: boolean;
  notify_vet_appointments: boolean;
  notify_garden_milestones: boolean;
  notify_quiet_hours_enabled: boolean;
  notify_quiet_hours_start: string;  // "22:00" format
  notify_quiet_hours_end: string;    // "07:00" format
  face_id_enabled: boolean;
  two_factor_enabled: boolean;
  privacy_anonymous_analytics: boolean;
  privacy_personalized_tips: boolean;
  privacy_marketing_emails: boolean;
  timezone: string;
};

// All boolean keys in UserPreferences (excludes string fields)
export type BooleanPrefKey =
  | 'notify_daily_log_reminder'
  | 'notify_weekly_insight'
  | 'notify_vet_appointments'
  | 'notify_garden_milestones'
  | 'notify_quiet_hours_enabled'
  | 'face_id_enabled'
  | 'two_factor_enabled'
  | 'privacy_anonymous_analytics'
  | 'privacy_personalized_tips'
  | 'privacy_marketing_emails';

interface NotificationsState {
  prefs: UserPreferences | null;
  isLoading: boolean;
  error: string | null;

  /**
   * Reads user_preferences row for the current auth user.
   * If the row doesn't exist (race with handle_new_user trigger),
   * does a defensive INSERT ON CONFLICT DO NOTHING then re-fetches.
   */
  fetch: () => Promise<void>;

  /**
   * Optimistically flips a boolean preference locally, then persists
   * to Supabase in the background. Reverts on error.
   */
  toggle: (key: BooleanPrefKey) => Promise<void>;

  /**
   * Resets store state to initial (call on sign-out).
   */
  clearNotifications: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  prefs: null,
  isLoading: false,
  error: null,

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

      const userId = user.id;

      // First attempt: fetch existing row
      let row = await fetchPrefsRow(userId);

      // Defensive: if row is missing (race with handle_new_user), insert + re-fetch
      if (row === null) {
        await supabase
          .from('user_preferences')
          .insert({ user_id: userId })
          // ON CONFLICT DO NOTHING — handled by the upsert pattern below
          .select();

        row = await fetchPrefsRow(userId);
      }

      if (row === null) {
        set({ isLoading: false, error: 'Could not load preferences' });
        return;
      }

      set({ prefs: row, isLoading: false, error: null });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load preferences',
      });
    }
  },

  toggle: async (key) => {
    const { prefs } = get();
    if (!prefs) return;

    const oldValue = prefs[key];
    const newValue = !oldValue;

    // Optimistic update
    set({ prefs: { ...prefs, [key]: newValue } });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Revert if not authenticated
        set({ prefs: { ...prefs, [key]: oldValue }, error: 'Not authenticated' });
        return;
      }

      const { error } = await supabase
        .from('user_preferences')
        .update({ [key]: newValue })
        .eq('user_id', user.id);

      if (error) {
        // Revert on error
        set({ prefs: { ...prefs, [key]: oldValue }, error: error.message });
      }
    } catch (err) {
      // Revert on unexpected error
      set({
        prefs: { ...prefs, [key]: oldValue },
        error: err instanceof Error ? err.message : 'Update failed',
      });
    }
  },

  clearNotifications: () => {
    set({ prefs: null, isLoading: false, error: null });
  },
}));

// ─── Private helpers ──────────────────────────────────────────────────────────

async function fetchPrefsRow(userId: string): Promise<UserPreferences | null> {
  const { data } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return (data as UserPreferences | null) ?? null;
}
