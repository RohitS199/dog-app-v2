import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useDogStore } from './dogStore';
import { computeAge, getLifeStage, ageToDecimalYears } from '../lib/lifeStage';

export type HealthBaseline =
  | 'allergies'
  | 'joint_arthritis'
  | 'anxiety'
  | 'digestive'
  | 'skin_coat'
  | 'heart_breathing'
  | 'on_meds'
  | 'none';

export interface OnboardingDogProfile {
  name: string;
  breed: string;
  photoUri: string | null;
  loveNote: string;
  birthdayMonth: number | null;
  birthdayDay: number | null;
  birthdayYear: number | null;
  lifeStage: string | null;
  healthBaseline: HealthBaseline[];
}

interface OnboardingState {
  // Persisted (AsyncStorage)
  currentStep: number;
  dogProfile: OnboardingDogProfile;
  surveyAttribution: string | null;
  surveyWorries: string[];
  surveySeverity: string | null;
  surveyHistory: string | null;
  surveyBlindsides: string[];
  signaturePathData: string | null;
  notificationHour: number | null;
  selectedPlan: 'yearly' | 'monthly' | null;
  starRating: number | null;
  startedAt: number | null;

  // Ephemeral
  isSubmitting: boolean;
  isSyncing: boolean;
  error: string | null;
  buildingStep: number;

  // Actions
  setDogField: <K extends keyof OnboardingDogProfile>(field: K, value: OnboardingDogProfile[K]) => void;
  setSurveyAttribution: (value: string) => void;
  toggleSurveyWorry: (value: string) => void;
  setSurveySeverity: (value: string) => void;
  setSurveyHistory: (value: string) => void;
  toggleSurveyBlindside: (value: string) => void;
  toggleHealthBaseline: (value: HealthBaseline) => void;
  setSignaturePathData: (data: string | null) => void;
  setNotificationHour: (hour: number | null) => void;
  setSelectedPlan: (plan: 'yearly' | 'monthly' | null) => void;
  setStarRating: (rating: number | null) => void;
  setBuildingStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  syncOnboardingData: () => Promise<void>;
  clearOnboarding: () => void;
}

const MAX_STEP = 18;
const STALE_DRAFT_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function createEmptyDogProfile(): OnboardingDogProfile {
  return {
    name: '',
    breed: '',
    photoUri: null,
    loveNote: '',
    birthdayMonth: null,
    birthdayDay: null,
    birthdayYear: null,
    lifeStage: null,
    healthBaseline: [],
  };
}

// Map health baseline chips to known_conditions for dog profile
function baselineToConditions(baseline: HealthBaseline[]): string[] {
  const map: Record<string, string> = {
    allergies: 'Allergies / itchiness',
    joint_arthritis: 'Joint / arthritis',
    anxiety: 'Anxiety / reactivity',
    digestive: 'Digestive / GI',
    skin_coat: 'Skin / coat',
    heart_breathing: 'Heart / breathing',
    on_meds: 'Currently on meds',
  };
  return baseline.filter((b) => b !== 'none').map((b) => map[b] || b);
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      dogProfile: createEmptyDogProfile(),
      surveyAttribution: null,
      surveyWorries: [],
      surveySeverity: null,
      surveyHistory: null,
      surveyBlindsides: [],
      signaturePathData: null,
      notificationHour: null,
      selectedPlan: null,
      starRating: null,
      startedAt: null,

      isSubmitting: false,
      isSyncing: false,
      error: null,
      buildingStep: 0,

      setDogField: (field, value) => {
        set((state) => {
          const newProfile = { ...state.dogProfile, [field]: value };
          // Auto-compute life stage when birthday fields change
          if (
            field === 'birthdayMonth' ||
            field === 'birthdayDay' ||
            field === 'birthdayYear'
          ) {
            const { birthdayMonth, birthdayDay, birthdayYear } = newProfile;
            if (birthdayMonth && birthdayDay && birthdayYear) {
              const age = computeAge(birthdayMonth, birthdayDay, birthdayYear);
              newProfile.lifeStage = getLifeStage(age.years + age.months / 12);
            }
          }
          return {
            dogProfile: newProfile,
            startedAt: state.startedAt ?? Date.now(),
          };
        });
      },

      setSurveyAttribution: (value) => {
        set({ surveyAttribution: value, startedAt: get().startedAt ?? Date.now() });
      },

      toggleSurveyWorry: (value) => {
        set((state) => {
          const exists = state.surveyWorries.includes(value);
          return {
            surveyWorries: exists
              ? state.surveyWorries.filter((w) => w !== value)
              : [...state.surveyWorries, value],
          };
        });
      },

      setSurveySeverity: (value) => {
        set({ surveySeverity: value });
      },

      setSurveyHistory: (value) => {
        set({ surveyHistory: value });
      },

      toggleSurveyBlindside: (value) => {
        set((state) => {
          const exists = state.surveyBlindsides.includes(value);
          return {
            surveyBlindsides: exists
              ? state.surveyBlindsides.filter((b) => b !== value)
              : [...state.surveyBlindsides, value],
          };
        });
      },

      toggleHealthBaseline: (value) => {
        set((state) => {
          const current = state.dogProfile.healthBaseline;
          if (value === 'none') {
            return {
              dogProfile: { ...state.dogProfile, healthBaseline: ['none'] },
            };
          }
          const withoutNone = current.filter((b) => b !== 'none');
          const exists = withoutNone.includes(value);
          return {
            dogProfile: {
              ...state.dogProfile,
              healthBaseline: exists
                ? withoutNone.filter((b) => b !== value)
                : [...withoutNone, value],
            },
          };
        });
      },

      setSignaturePathData: (data) => {
        set({ signaturePathData: data });
      },

      setNotificationHour: (hour) => {
        set({ notificationHour: hour });
      },

      setSelectedPlan: (plan) => {
        set({ selectedPlan: plan });
      },

      setStarRating: (rating) => {
        set({ starRating: rating });
      },

      setBuildingStep: (step) => {
        set({ buildingStep: step });
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

      syncOnboardingData: async () => {
        const { dogProfile, surveyAttribution, surveyWorries, surveySeverity, surveyHistory, surveyBlindsides } = get();

        if (!dogProfile.name.trim() || !dogProfile.breed.trim()) {
          set({ error: 'Dog profile is incomplete.' });
          return;
        }

        set({ isSyncing: true, error: null });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          // Compute age from birthday
          let ageYears = 1;
          if (dogProfile.birthdayMonth && dogProfile.birthdayDay && dogProfile.birthdayYear) {
            const age = computeAge(dogProfile.birthdayMonth, dogProfile.birthdayDay, dogProfile.birthdayYear);
            ageYears = ageToDecimalYears(age);
          }

          // 1. Add dog via dogStore
          const newDog = await useDogStore.getState().addDog({
            name: dogProfile.name.trim(),
            breed: dogProfile.breed.trim(),
            age_years: ageYears,
            weight_lbs: 30, // Default — not collected in new flow
            vet_phone: null,
            photo_url: null,
            spayed_neutered: null,
            known_conditions: baselineToConditions(dogProfile.healthBaseline),
          });

          // 2. Upload photo if present
          if (dogProfile.photoUri) {
            try {
              await useDogStore.getState().updateDogPhoto(newDog.id, dogProfile.photoUri);
            } catch {
              // Photo upload failure is non-blocking
            }
          }

          // 3. Store survey data as user metadata (non-blocking)
          const surveyData: Record<string, unknown> = {};
          if (surveyAttribution) surveyData.onboarding_attribution = surveyAttribution;
          if (surveyWorries.length) surveyData.onboarding_worries = surveyWorries;
          if (surveySeverity) surveyData.onboarding_severity = surveySeverity;
          if (surveyHistory) surveyData.onboarding_history = surveyHistory;
          if (surveyBlindsides.length) surveyData.onboarding_blindsides = surveyBlindsides;

          if (Object.keys(surveyData).length > 0) {
            supabase.auth.updateUser({ data: surveyData }).catch(() => {});
          }

          // 4. Re-fetch dogs for UI update
          useDogStore.getState().fetchDogs().catch(() => {});

          // 5. Mark onboarding complete
          await AsyncStorage.setItem('puplog-onboarding-complete', 'true');

          // 6. Clear store
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
          dogProfile: createEmptyDogProfile(),
          surveyAttribution: null,
          surveyWorries: [],
          surveySeverity: null,
          surveyHistory: null,
          surveyBlindsides: [],
          signaturePathData: null,
          notificationHour: null,
          selectedPlan: null,
          starRating: null,
          startedAt: null,
          isSubmitting: false,
          isSyncing: false,
          error: null,
          buildingStep: 0,
        });
      },
    }),
    {
      name: 'puplog-onboarding-draft',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        dogProfile: state.dogProfile,
        surveyAttribution: state.surveyAttribution,
        surveyWorries: state.surveyWorries,
        surveySeverity: state.surveySeverity,
        surveyHistory: state.surveyHistory,
        surveyBlindsides: state.surveyBlindsides,
        signaturePathData: state.signaturePathData,
        notificationHour: state.notificationHour,
        selectedPlan: state.selectedPlan,
        starRating: state.starRating,
        startedAt: state.startedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.startedAt && Date.now() - state.startedAt > STALE_DRAFT_MS) {
          state.currentStep = 0;
          state.dogProfile = createEmptyDogProfile();
          state.surveyAttribution = null;
          state.surveyWorries = [];
          state.surveySeverity = null;
          state.surveyHistory = null;
          state.surveyBlindsides = [];
          state.signaturePathData = null;
          state.notificationHour = null;
          state.selectedPlan = null;
          state.starRating = null;
          state.startedAt = null;
        }
      },
    }
  )
);
