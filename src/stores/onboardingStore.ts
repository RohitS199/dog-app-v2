import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useDogStore } from './dogStore';
import { generateDaySummary } from '../lib/daySummary';
import type { MetricField } from '../types/checkIn';
import type { DaySummary } from '../types/health';
import type { DailyCheckIn } from '../types/checkIn';

export type OnboardingGoal = 'peace_of_mind' | 'catch_early' | 'track_daily' | 'vet_prep';
export type OnboardingAttribution = 'social' | 'friend' | 'vet' | 'search' | 'app_store';

export interface OnboardingDogProfile {
  name: string;
  breed: string;
  ageYears: string;
  weightLbs: string;
  photoUri: string | null;
  spayedNeutered: boolean | null; // null = "Not sure"
  knownConditions: string[];
  vetPhone: string;
}

interface OnboardingState {
  // Persisted state
  currentStep: number;
  goal: OnboardingGoal | null;
  attribution: OnboardingAttribution | null;
  dogProfile: OnboardingDogProfile;
  checkInAnswers: Partial<Record<MetricField, string>>;
  startedAt: number | null;

  // Ephemeral state
  isSubmitting: boolean;
  error: string | null;
  daySummary: DaySummary | null;
  isSyncing: boolean;

  // Actions
  setGoal: (goal: OnboardingGoal) => void;
  setAttribution: (attribution: OnboardingAttribution) => void;
  setDogField: <K extends keyof OnboardingDogProfile>(field: K, value: OnboardingDogProfile[K]) => void;
  setCheckInAnswer: (field: MetricField, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  generateSnapshot: () => void;
  syncOnboardingData: () => Promise<void>;
  clearOnboarding: () => void;
}

const MAX_STEP = 18;
const STALE_DRAFT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function createEmptyDogProfile(): OnboardingDogProfile {
  return {
    name: '',
    breed: '',
    ageYears: '',
    weightLbs: '',
    photoUri: null,
    spayedNeutered: null,
    knownConditions: [],
    vetPhone: '',
  };
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      goal: null,
      attribution: null,
      dogProfile: createEmptyDogProfile(),
      checkInAnswers: {},
      startedAt: null,

      isSubmitting: false,
      error: null,
      daySummary: null,
      isSyncing: false,

      setGoal: (goal) => {
        set({ goal, startedAt: get().startedAt ?? Date.now() });
      },

      setAttribution: (attribution) => {
        set({ attribution });
      },

      setDogField: (field, value) => {
        set((state) => ({
          dogProfile: { ...state.dogProfile, [field]: value },
        }));
      },

      setCheckInAnswer: (field, value) => {
        set((state) => ({
          checkInAnswers: { ...state.checkInAnswers, [field]: value },
        }));
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

      generateSnapshot: () => {
        const { checkInAnswers, dogProfile } = get();

        // Build a synthetic DailyCheckIn for generateDaySummary
        const syntheticCheckIn: DailyCheckIn = {
          id: 'onboarding-preview',
          user_id: '',
          dog_id: '',
          check_in_date: getTodayDateString(),
          appetite: (checkInAnswers.appetite as any) ?? 'normal',
          water_intake: (checkInAnswers.water_intake as any) ?? 'normal',
          energy_level: (checkInAnswers.energy_level as any) ?? 'normal',
          stool_quality: (checkInAnswers.stool_quality as any) ?? 'normal',
          vomiting: (checkInAnswers.vomiting as any) ?? 'none',
          mobility: (checkInAnswers.mobility as any) ?? 'normal',
          mood: (checkInAnswers.mood as any) ?? 'normal',
          additional_symptoms: ['none'],
          free_text: null,
          emergency_flagged: false,
          revision_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const daySummary = generateDaySummary(syntheticCheckIn);
        set({ daySummary });
      },

      syncOnboardingData: async () => {
        const { dogProfile, checkInAnswers, goal, attribution } = get();

        if (!dogProfile.name.trim() || !dogProfile.breed.trim()) {
          set({ error: 'Dog profile is incomplete.' });
          return;
        }

        set({ isSyncing: true, error: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const ageNum = parseFloat(dogProfile.ageYears);
          const weightNum = parseFloat(dogProfile.weightLbs);

          // 1. Add dog via dogStore
          const newDog = await useDogStore.getState().addDog({
            name: dogProfile.name.trim(),
            breed: dogProfile.breed.trim(),
            age_years: isNaN(ageNum) ? 1 : ageNum,
            weight_lbs: isNaN(weightNum) ? 30 : weightNum,
            vet_phone: dogProfile.vetPhone.trim() || null,
            photo_url: null, // Will be updated after photo upload
            spayed_neutered: dogProfile.spayedNeutered,
            known_conditions: dogProfile.knownConditions,
          });

          // 2. Upload photo if present
          if (dogProfile.photoUri) {
            try {
              await useDogStore.getState().updateDogPhoto(newDog.id, dogProfile.photoUri);
            } catch {
              // Photo upload failure is non-blocking
            }
          }

          // 3. Insert daily check-in
          const checkInData = {
            user_id: user.id,
            dog_id: newDog.id,
            check_in_date: getTodayDateString(),
            appetite: checkInAnswers.appetite ?? 'normal',
            water_intake: checkInAnswers.water_intake ?? 'normal',
            energy_level: checkInAnswers.energy_level ?? 'normal',
            stool_quality: checkInAnswers.stool_quality ?? 'normal',
            vomiting: checkInAnswers.vomiting ?? 'none',
            mobility: checkInAnswers.mobility ?? 'normal',
            mood: checkInAnswers.mood ?? 'normal',
            additional_symptoms: ['none'],
            free_text: null,
            emergency_flagged: false,
          };

          const { data: checkInResult, error: checkInError } = await supabase
            .from('daily_check_ins')
            .insert(checkInData)
            .select()
            .single();

          if (checkInError) throw checkInError;

          // 4. Fire post-save tasks (non-blocking)
          supabase.functions
            .invoke('analyze-patterns', { body: { dog_id: newDog.id } })
            .catch(() => {});

          supabase.functions
            .invoke('ai-health-analysis', {
              body: { dog_id: newDog.id, check_in_id: checkInResult.id },
            })
            .catch(() => {});

          // 5. Re-fetch dogs for streak update
          useDogStore.getState().fetchDogs().catch(() => {});

          // 6. Mark onboarding complete
          await AsyncStorage.setItem('puplog-onboarding-complete', 'true');

          // 7. Store goal/attribution as user metadata (non-blocking)
          if (goal || attribution) {
            supabase.auth.updateUser({
              data: {
                ...(goal ? { onboarding_goal: goal } : {}),
                ...(attribution ? { onboarding_attribution: attribution } : {}),
              },
            }).catch(() => {});
          }

          // 8. Clear store
          get().clearOnboarding();

          set({ isSyncing: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to save onboarding data.',
            isSyncing: false,
          });
        }
      },

      clearOnboarding: () => {
        set({
          currentStep: 0,
          goal: null,
          attribution: null,
          dogProfile: createEmptyDogProfile(),
          checkInAnswers: {},
          startedAt: null,
          isSubmitting: false,
          error: null,
          daySummary: null,
          isSyncing: false,
        });
      },
    }),
    {
      name: 'puplog-onboarding-draft',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        goal: state.goal,
        attribution: state.attribution,
        dogProfile: state.dogProfile,
        checkInAnswers: state.checkInAnswers,
        startedAt: state.startedAt,
      }),
      onRehydrateStorage: () => (state) => {
        // Stale draft guard: discard if > 7 days old
        if (state?.startedAt && Date.now() - state.startedAt > STALE_DRAFT_MS) {
          state.currentStep = 0;
          state.goal = null;
          state.attribution = null;
          state.dogProfile = createEmptyDogProfile();
          state.checkInAnswers = {};
          state.startedAt = null;
        }
      },
    }
  )
);
