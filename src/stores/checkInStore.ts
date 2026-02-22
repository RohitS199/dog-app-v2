import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import type { DailyCheckIn, CheckInDraft, MetricField, AdditionalSymptom } from '../types/checkIn';
import type { DaySummary, AnalyzePatternsResponse } from '../types/health';
import { CHECK_IN } from '../constants/config';
import { generateDaySummary } from '../lib/daySummary';
import { detectEmergencyKeywords } from '../lib/emergencyKeywords';
import { useDogStore } from './dogStore';

interface CheckInState {
  currentStep: number;
  draft: CheckInDraft | null;
  yesterdayCheckIn: DailyCheckIn | null;
  existingCheckIn: DailyCheckIn | null;
  isSubmitting: boolean;
  error: string | null;
  daySummary: DaySummary | null;
  analyzePatternsResult: AnalyzePatternsResponse | null;

  startCheckIn: (dogId: string) => Promise<void>;
  setAnswer: (field: MetricField, value: string) => void;
  toggleSymptom: (symptom: AdditionalSymptom) => void;
  setFreeText: (text: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  submitCheckIn: () => Promise<void>;
  clearDraft: () => void;
  clearAll: () => void;
}

const MAX_STEP = 8; // 0-6 = metrics, 7 = additional symptoms, 8 = free text

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function createEmptyDraft(dogId: string): CheckInDraft {
  return {
    dog_id: dogId,
    check_in_date: getTodayDateString(),
    appetite: null,
    water_intake: null,
    energy_level: null,
    stool_quality: null,
    vomiting: null,
    mobility: null,
    mood: null,
    additional_symptoms: [],
    free_text: null,
  };
}

export const useCheckInStore = create<CheckInState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      draft: null,
      yesterdayCheckIn: null,
      existingCheckIn: null,
      isSubmitting: false,
      error: null,
      daySummary: null,
      analyzePatternsResult: null,

      startCheckIn: async (dogId: string) => {
        // Wait for persist rehydration to complete before checking draft
        await new Promise<void>((resolve) => {
          const unsub = useCheckInStore.persist.onFinishHydration(() => {
            unsub();
            resolve();
          });
          // If already hydrated, resolve immediately
          if (useCheckInStore.persist.hasHydrated()) {
            unsub();
            resolve();
          }
        });

        const today = getTodayDateString();
        const yesterday = getYesterdayDateString();

        // Rehydration guard: check if persisted draft is still valid
        const currentDraft = get().draft;
        let draft: CheckInDraft;

        if (
          currentDraft &&
          currentDraft.dog_id === dogId &&
          currentDraft.check_in_date === today
        ) {
          // Valid persisted draft — reuse it
          draft = currentDraft;
        } else {
          // Stale or no draft — create fresh
          draft = createEmptyDraft(dogId);
          set({ currentStep: 0 });
        }

        set({
          draft,
          error: null,
          daySummary: null,
          analyzePatternsResult: null,
        });

        // Fetch yesterday's check-in for hints and today's for edit mode
        try {
          const [yesterdayResult, todayResult] = await Promise.all([
            supabase
              .from('daily_check_ins')
              .select('*')
              .eq('dog_id', dogId)
              .eq('check_in_date', yesterday)
              .maybeSingle(),
            supabase
              .from('daily_check_ins')
              .select('*')
              .eq('dog_id', dogId)
              .eq('check_in_date', today)
              .maybeSingle(),
          ]);

          const yesterdayCheckIn = (yesterdayResult.data as DailyCheckIn) ?? null;
          const existingCheckIn = (todayResult.data as DailyCheckIn) ?? null;

          // If today's entry already exists, populate draft from it (edit mode)
          if (existingCheckIn) {
            draft = {
              dog_id: existingCheckIn.dog_id,
              check_in_date: existingCheckIn.check_in_date,
              appetite: existingCheckIn.appetite,
              water_intake: existingCheckIn.water_intake,
              energy_level: existingCheckIn.energy_level,
              stool_quality: existingCheckIn.stool_quality,
              vomiting: existingCheckIn.vomiting,
              mobility: existingCheckIn.mobility,
              mood: existingCheckIn.mood,
              additional_symptoms: existingCheckIn.additional_symptoms,
              free_text: existingCheckIn.free_text,
            };
          }

          set({ yesterdayCheckIn, existingCheckIn, draft });
        } catch {
          // Non-blocking — hints are nice-to-have
          set({ yesterdayCheckIn: null, existingCheckIn: null });
        }
      },

      setAnswer: (field, value) => {
        const { draft } = get();
        if (!draft) return;
        set({ draft: { ...draft, [field]: value } });
      },

      toggleSymptom: (symptom) => {
        const { draft } = get();
        if (!draft) return;

        let symptoms = [...draft.additional_symptoms];

        if (symptom === 'none') {
          // 'none' deselects all others
          symptoms = ['none'];
        } else {
          // Remove 'none' if it was selected
          symptoms = symptoms.filter((s) => s !== 'none');

          if (symptoms.includes(symptom)) {
            symptoms = symptoms.filter((s) => s !== symptom);
          } else {
            symptoms.push(symptom);
          }

          // If nothing selected, default to empty array
          if (symptoms.length === 0) {
            symptoms = [];
          }
        }

        set({ draft: { ...draft, additional_symptoms: symptoms } });
      },

      setFreeText: (text) => {
        const { draft } = get();
        if (!draft) return;
        if (text.length <= CHECK_IN.FREE_TEXT_MAX_CHARS) {
          set({ draft: { ...draft, free_text: text || null } });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < MAX_STEP) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      goToStep: (step) => {
        if (step >= 0 && step <= MAX_STEP) {
          set({ currentStep: step });
        }
      },

      submitCheckIn: async () => {
        const { draft, existingCheckIn } = get();
        if (!draft) return;

        // Validate all required fields are filled
        if (
          !draft.appetite || !draft.water_intake || !draft.energy_level ||
          !draft.stool_quality || !draft.vomiting || !draft.mobility || !draft.mood
        ) {
          set({ error: 'Please answer all questions before submitting.' });
          return;
        }

        set({ isSubmitting: true, error: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const checkInData = {
            user_id: user.id,
            dog_id: draft.dog_id,
            check_in_date: draft.check_in_date,
            appetite: draft.appetite,
            water_intake: draft.water_intake,
            energy_level: draft.energy_level,
            stool_quality: draft.stool_quality,
            vomiting: draft.vomiting,
            mobility: draft.mobility,
            mood: draft.mood,
            additional_symptoms: draft.additional_symptoms.length > 0 ? draft.additional_symptoms : [],
            free_text: draft.free_text,
            emergency_flagged: draft.free_text ? detectEmergencyKeywords(draft.free_text).isEmergency : false,
          };

          // UPSERT: insert or update if same dog+date exists
          let result;
          if (existingCheckIn) {
            const { data, error } = await supabase
              .from('daily_check_ins')
              .update(checkInData)
              .eq('id', existingCheckIn.id)
              .select()
              .single();
            if (error) throw error;
            result = data as DailyCheckIn;
          } else {
            const { data, error } = await supabase
              .from('daily_check_ins')
              .insert(checkInData)
              .select()
              .single();
            if (error) throw error;
            result = data as DailyCheckIn;
          }

          // Generate client-side day summary
          const daySummary = generateDaySummary(result);

          set({ daySummary, isSubmitting: false });

          // Fire post-save tasks in parallel (non-blocking)
          // 1. analyze-patterns Edge Function
          // 2. Re-fetch dogs for updated streak
          const analyzePromise = supabase.functions
            .invoke('analyze-patterns', {
              body: { dog_id: draft.dog_id },
            })
            .then(({ data, error }) => {
              if (!error && data) {
                set({ analyzePatternsResult: data as AnalyzePatternsResponse });
              }
            })
            .catch(() => {
              // Silent failure — pattern analysis is non-critical
            });

          const fetchDogsPromise = useDogStore.getState().fetchDogs().catch(() => {});

          // Don't await — these run in background
          Promise.all([analyzePromise, fetchDogsPromise]);
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to save check-in. Please try again.',
            isSubmitting: false,
          });
        }
      },

      clearDraft: () =>
        set({
          currentStep: 0,
          draft: null,
          yesterdayCheckIn: null,
          existingCheckIn: null,
          error: null,
          daySummary: null,
          analyzePatternsResult: null,
        }),

      clearAll: () =>
        set({
          currentStep: 0,
          draft: null,
          yesterdayCheckIn: null,
          existingCheckIn: null,
          isSubmitting: false,
          error: null,
          daySummary: null,
          analyzePatternsResult: null,
        }),
    }),
    {
      name: 'pawcheck-checkin-draft',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist draft and currentStep — everything else is ephemeral
      partialize: (state) => ({
        draft: state.draft,
        currentStep: state.currentStep,
      }),
    }
  )
);
