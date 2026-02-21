import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { CheckSymptomsResponse } from '../types/api';
import { LIMITS, API } from '../constants/config';

interface TriageState {
  symptoms: string;
  isLoading: boolean;
  result: CheckSymptomsResponse | null;
  cachedResult: CheckSymptomsResponse | null;
  error: string | null;
  hasRetried: boolean;
  recentTriageTimestamps: number[]; // timestamps of triages in last 7 days
  nudgeDismissed: boolean;

  setSymptoms: (text: string) => void;
  submitSymptoms: (dogId: string) => Promise<void>;
  clearResult: () => void;
  clearAll: () => void;
  dismissNudge: () => void;
  getRecentTriageCount: () => number;
}

export const useTriageStore = create<TriageState>((set, get) => ({
  symptoms: '',
  isLoading: false,
  result: null,
  cachedResult: null,
  error: null,
  hasRetried: false,
  recentTriageTimestamps: [],
  nudgeDismissed: false,

  setSymptoms: (text) => {
    if (text.length <= LIMITS.SYMPTOM_MAX_CHARS) {
      set({ symptoms: text });
    }
  },

  submitSymptoms: async (dogId) => {
    const { symptoms, hasRetried } = get();
    if (!symptoms.trim()) return;

    set({ isLoading: true, error: null, result: null });

    const loadingStart = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke(
        'check-symptoms',
        {
          body: { dog_id: dogId, symptoms },
        }
      );

      if (error) {
        // Rate limit handling
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          throw new Error(
            "You've reached the maximum number of checks. Please try again later."
          );
        }
        throw error;
      }

      // Enforce minimum loading display time
      const elapsed = Date.now() - loadingStart;
      if (elapsed < LIMITS.LOADING_MIN_DISPLAY_MS) {
        await new Promise((r) =>
          setTimeout(r, LIMITS.LOADING_MIN_DISPLAY_MS - elapsed)
        );
      }

      const response = data as CheckSymptomsResponse;

      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const updatedTimestamps = [
        ...get().recentTriageTimestamps.filter((t) => t > sevenDaysAgo),
        Date.now(),
      ];

      set({
        result: response,
        cachedResult: response.type !== 'off_topic' ? response : get().cachedResult,
        isLoading: false,
        hasRetried: false,
        recentTriageTimestamps: updatedTimestamps,
        nudgeDismissed: false,
      });
    } catch (err) {
      const elapsed = Date.now() - loadingStart;
      if (elapsed < LIMITS.LOADING_MIN_DISPLAY_MS) {
        await new Promise((r) =>
          setTimeout(r, LIMITS.LOADING_MIN_DISPLAY_MS - elapsed)
        );
      }

      if (!hasRetried) {
        // Auto-retry once
        set({ hasRetried: true });
        try {
          const { data } = await supabase.functions.invoke('check-symptoms', {
            body: { dog_id: dogId, symptoms },
          });
          if (data) {
            const response = data as CheckSymptomsResponse;
            set({
              result: response,
              cachedResult: response.type !== 'off_topic' ? response : get().cachedResult,
              isLoading: false,
              hasRetried: false,
            });
            return;
          }
        } catch {
          // Fall through to error state
        }
      }

      set({
        error:
          err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        isLoading: false,
      });
    }
  },

  clearResult: () => set({ result: null, error: null, symptoms: '' }),
  clearAll: () =>
    set({
      symptoms: '',
      isLoading: false,
      result: null,
      cachedResult: null,
      error: null,
      hasRetried: false,
      recentTriageTimestamps: [],
      nudgeDismissed: false,
    }),
  dismissNudge: () => set({ nudgeDismissed: true }),
  getRecentTriageCount: () => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return get().recentTriageTimestamps.filter((t) => t > sevenDaysAgo).length;
  },
}));
