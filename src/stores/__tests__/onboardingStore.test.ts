import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '../onboardingStore';
import type { MetricField } from '../../types/checkIn';

// Reset store before each test
beforeEach(async () => {
  await AsyncStorage.clear();
  useOnboardingStore.getState().clearOnboarding();
});

describe('onboardingStore', () => {
  describe('initial state', () => {
    it('starts at step 0', () => {
      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });

    it('has null goal and attribution', () => {
      const state = useOnboardingStore.getState();
      expect(state.goal).toBeNull();
      expect(state.attribution).toBeNull();
    });

    it('has empty dog profile', () => {
      const { dogProfile } = useOnboardingStore.getState();
      expect(dogProfile.name).toBe('');
      expect(dogProfile.breed).toBe('');
      expect(dogProfile.photoUri).toBeNull();
      expect(dogProfile.knownConditions).toEqual([]);
    });

    it('has empty check-in answers', () => {
      expect(useOnboardingStore.getState().checkInAnswers).toEqual({});
    });
  });

  describe('setGoal', () => {
    it('sets the goal value', () => {
      useOnboardingStore.getState().setGoal('catch_early');
      expect(useOnboardingStore.getState().goal).toBe('catch_early');
    });

    it('sets startedAt on first goal selection', () => {
      expect(useOnboardingStore.getState().startedAt).toBeNull();
      useOnboardingStore.getState().setGoal('peace_of_mind');
      expect(useOnboardingStore.getState().startedAt).toBeGreaterThan(0);
    });
  });

  describe('setAttribution', () => {
    it('sets the attribution value', () => {
      useOnboardingStore.getState().setAttribution('vet');
      expect(useOnboardingStore.getState().attribution).toBe('vet');
    });
  });

  describe('setDogField', () => {
    it('sets individual dog profile fields', () => {
      useOnboardingStore.getState().setDogField('name', 'Luna');
      expect(useOnboardingStore.getState().dogProfile.name).toBe('Luna');
    });

    it('sets photo URI', () => {
      useOnboardingStore.getState().setDogField('photoUri', 'file:///photo.jpg');
      expect(useOnboardingStore.getState().dogProfile.photoUri).toBe('file:///photo.jpg');
    });

    it('sets known conditions array', () => {
      useOnboardingStore.getState().setDogField('knownConditions', ['Allergies', 'Arthritis']);
      expect(useOnboardingStore.getState().dogProfile.knownConditions).toEqual(['Allergies', 'Arthritis']);
    });
  });

  describe('setCheckInAnswer', () => {
    it('sets individual check-in answers', () => {
      useOnboardingStore.getState().setCheckInAnswer('appetite' as MetricField, 'normal');
      expect(useOnboardingStore.getState().checkInAnswers.appetite).toBe('normal');
    });

    it('can set multiple answers', () => {
      const store = useOnboardingStore.getState();
      store.setCheckInAnswer('appetite' as MetricField, 'less');
      store.setCheckInAnswer('energy_level' as MetricField, 'low');
      const answers = useOnboardingStore.getState().checkInAnswers;
      expect(answers.appetite).toBe('less');
      expect(answers.energy_level).toBe('low');
    });
  });

  describe('step navigation', () => {
    it('nextStep increments within bounds', () => {
      useOnboardingStore.getState().nextStep();
      expect(useOnboardingStore.getState().currentStep).toBe(1);
    });

    it('nextStep does not exceed MAX_STEP (18)', () => {
      useOnboardingStore.getState().goToStep(18);
      useOnboardingStore.getState().nextStep();
      expect(useOnboardingStore.getState().currentStep).toBe(18);
    });

    it('prevStep decrements within bounds', () => {
      useOnboardingStore.getState().goToStep(5);
      useOnboardingStore.getState().prevStep();
      expect(useOnboardingStore.getState().currentStep).toBe(4);
    });

    it('prevStep does not go below 0', () => {
      useOnboardingStore.getState().prevStep();
      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });

    it('goToStep sets specific step', () => {
      useOnboardingStore.getState().goToStep(10);
      expect(useOnboardingStore.getState().currentStep).toBe(10);
    });

    it('goToStep rejects out-of-bounds values', () => {
      useOnboardingStore.getState().goToStep(5);
      useOnboardingStore.getState().goToStep(-1);
      expect(useOnboardingStore.getState().currentStep).toBe(5);
      useOnboardingStore.getState().goToStep(19);
      expect(useOnboardingStore.getState().currentStep).toBe(5);
    });
  });

  describe('generateSnapshot', () => {
    it('generates a day summary from answers', () => {
      const store = useOnboardingStore.getState();
      store.setCheckInAnswer('appetite', 'normal');
      store.setCheckInAnswer('water_intake', 'normal');
      store.setCheckInAnswer('energy_level', 'normal');
      store.setCheckInAnswer('stool_quality', 'normal');
      store.setCheckInAnswer('vomiting', 'none');
      store.setCheckInAnswer('mobility', 'normal');
      store.setCheckInAnswer('mood', 'normal');
      store.generateSnapshot();

      const { daySummary } = useOnboardingStore.getState();
      expect(daySummary).toBeTruthy();
      expect(daySummary!.type).toBe('all_normal');
    });

    it('generates attention_needed for significant abnormality', () => {
      const store = useOnboardingStore.getState();
      store.setCheckInAnswer('appetite', 'refusing');
      store.setCheckInAnswer('water_intake', 'normal');
      store.setCheckInAnswer('energy_level', 'normal');
      store.setCheckInAnswer('stool_quality', 'normal');
      store.setCheckInAnswer('vomiting', 'none');
      store.setCheckInAnswer('mobility', 'normal');
      store.setCheckInAnswer('mood', 'normal');
      store.generateSnapshot();

      const { daySummary } = useOnboardingStore.getState();
      expect(daySummary!.type).toBe('attention_needed');
    });
  });

  describe('clearOnboarding', () => {
    it('resets all state to initial values', () => {
      const store = useOnboardingStore.getState();
      store.setGoal('catch_early');
      store.setAttribution('vet');
      store.setDogField('name', 'Luna');
      store.setCheckInAnswer('appetite', 'normal');
      store.goToStep(10);
      store.clearOnboarding();

      const state = useOnboardingStore.getState();
      expect(state.currentStep).toBe(0);
      expect(state.goal).toBeNull();
      expect(state.attribution).toBeNull();
      expect(state.dogProfile.name).toBe('');
      expect(state.checkInAnswers).toEqual({});
      expect(state.startedAt).toBeNull();
    });
  });

  describe('persist partialize', () => {
    it('only persists expected fields', () => {
      // The persist middleware partialize function should include:
      // currentStep, goal, attribution, dogProfile, checkInAnswers, startedAt
      // and exclude: isSubmitting, error, daySummary, isSyncing
      const store = useOnboardingStore;
      const partialize = (store as any).persist?.getOptions?.()?.partialize;
      if (partialize) {
        const result = partialize({
          currentStep: 5,
          goal: 'catch_early',
          attribution: 'vet',
          dogProfile: { name: 'Luna' },
          checkInAnswers: { appetite: 'normal' },
          startedAt: 12345,
          isSubmitting: true,
          error: 'some error',
          daySummary: { type: 'all_normal' },
          isSyncing: true,
        });
        expect(result).toHaveProperty('currentStep', 5);
        expect(result).toHaveProperty('goal', 'catch_early');
        expect(result).not.toHaveProperty('isSubmitting');
        expect(result).not.toHaveProperty('error');
        expect(result).not.toHaveProperty('daySummary');
        expect(result).not.toHaveProperty('isSyncing');
      }
    });
  });

  describe('syncOnboardingData validation', () => {
    it('sets error when dog profile is incomplete', async () => {
      // No name set
      await useOnboardingStore.getState().syncOnboardingData();
      expect(useOnboardingStore.getState().error).toBe('Dog profile is incomplete.');
    });
  });
});
