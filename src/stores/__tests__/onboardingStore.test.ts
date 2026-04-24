import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboardingStore } from '../onboardingStore';
import type { HealthBaseline } from '../onboardingStore';

beforeEach(async () => {
  await AsyncStorage.clear();
  useOnboardingStore.getState().clearOnboarding();
});

describe('onboardingStore', () => {
  describe('initial state', () => {
    it('starts at step 0', () => {
      expect(useOnboardingStore.getState().currentStep).toBe(0);
    });

    it('has null survey fields', () => {
      const state = useOnboardingStore.getState();
      expect(state.surveyAttribution).toBeNull();
      expect(state.surveySeverity).toBeNull();
      expect(state.surveyHistory).toBeNull();
      expect(state.surveyWorries).toEqual([]);
      expect(state.surveyBlindsides).toEqual([]);
    });

    it('has empty dog profile', () => {
      const { dogProfile } = useOnboardingStore.getState();
      expect(dogProfile.name).toBe('');
      expect(dogProfile.breed).toBe('');
      expect(dogProfile.photoUri).toBeNull();
      expect(dogProfile.loveNote).toBe('');
      expect(dogProfile.birthdayMonth).toBeNull();
      expect(dogProfile.birthdayDay).toBeNull();
      expect(dogProfile.birthdayYear).toBeNull();
      expect(dogProfile.lifeStage).toBeNull();
      expect(dogProfile.healthBaseline).toEqual([]);
    });

    it('has null engagement fields', () => {
      const state = useOnboardingStore.getState();
      expect(state.signaturePathData).toBeNull();
      expect(state.notificationHour).toBeNull();
      expect(state.selectedPlan).toBeNull();
      expect(state.starRating).toBeNull();
      expect(state.startedAt).toBeNull();
    });
  });

  describe('survey actions', () => {
    it('sets attribution', () => {
      useOnboardingStore.getState().setSurveyAttribution('friend');
      expect(useOnboardingStore.getState().surveyAttribution).toBe('friend');
    });

    it('sets startedAt on first attribution', () => {
      expect(useOnboardingStore.getState().startedAt).toBeNull();
      useOnboardingStore.getState().setSurveyAttribution('social');
      expect(useOnboardingStore.getState().startedAt).toBeGreaterThan(0);
    });

    it('toggles survey worries on/off', () => {
      const store = useOnboardingStore.getState();
      store.toggleSurveyWorry('aging');
      expect(useOnboardingStore.getState().surveyWorries).toEqual(['aging']);
      useOnboardingStore.getState().toggleSurveyWorry('behavior');
      expect(useOnboardingStore.getState().surveyWorries).toEqual(['aging', 'behavior']);
      useOnboardingStore.getState().toggleSurveyWorry('aging');
      expect(useOnboardingStore.getState().surveyWorries).toEqual(['behavior']);
    });

    it('sets severity', () => {
      useOnboardingStore.getState().setSurveySeverity('weekly');
      expect(useOnboardingStore.getState().surveySeverity).toBe('weekly');
    });

    it('sets history', () => {
      useOnboardingStore.getState().setSurveyHistory('yes_recently');
      expect(useOnboardingStore.getState().surveyHistory).toBe('yes_recently');
    });

    it('toggles blindsides on/off', () => {
      useOnboardingStore.getState().toggleSurveyBlindside('cancer');
      expect(useOnboardingStore.getState().surveyBlindsides).toEqual(['cancer']);
      useOnboardingStore.getState().toggleSurveyBlindside('cancer');
      expect(useOnboardingStore.getState().surveyBlindsides).toEqual([]);
    });
  });

  describe('dog profile', () => {
    it('sets individual dog fields', () => {
      useOnboardingStore.getState().setDogField('name', 'Luna');
      expect(useOnboardingStore.getState().dogProfile.name).toBe('Luna');
    });

    it('sets photo URI', () => {
      useOnboardingStore.getState().setDogField('photoUri', 'file:///photo.jpg');
      expect(useOnboardingStore.getState().dogProfile.photoUri).toBe('file:///photo.jpg');
    });

    it('sets love note', () => {
      useOnboardingStore.getState().setDogField('loveNote', 'Best snuggler');
      expect(useOnboardingStore.getState().dogProfile.loveNote).toBe('Best snuggler');
    });

    it('auto-computes life stage when birthday is complete', () => {
      const store = useOnboardingStore.getState();
      store.setDogField('birthdayMonth', 4);
      store.setDogField('birthdayDay', 12);
      // lifeStage still null (year not set)
      expect(useOnboardingStore.getState().dogProfile.lifeStage).toBeNull();
      useOnboardingStore.getState().setDogField('birthdayYear', 2023);
      expect(useOnboardingStore.getState().dogProfile.lifeStage).not.toBeNull();
    });
  });

  describe('health baseline', () => {
    it('toggles health conditions', () => {
      useOnboardingStore.getState().toggleHealthBaseline('allergies');
      expect(useOnboardingStore.getState().dogProfile.healthBaseline).toEqual(['allergies']);
      useOnboardingStore.getState().toggleHealthBaseline('anxiety');
      expect(useOnboardingStore.getState().dogProfile.healthBaseline).toEqual(['allergies', 'anxiety']);
    });

    it('selecting none clears all others', () => {
      useOnboardingStore.getState().toggleHealthBaseline('allergies');
      useOnboardingStore.getState().toggleHealthBaseline('anxiety');
      useOnboardingStore.getState().toggleHealthBaseline('none');
      expect(useOnboardingStore.getState().dogProfile.healthBaseline).toEqual(['none']);
    });

    it('selecting a condition removes none', () => {
      useOnboardingStore.getState().toggleHealthBaseline('none');
      useOnboardingStore.getState().toggleHealthBaseline('digestive');
      expect(useOnboardingStore.getState().dogProfile.healthBaseline).toEqual(['digestive']);
    });

    it('toggles off a selected condition', () => {
      useOnboardingStore.getState().toggleHealthBaseline('allergies');
      useOnboardingStore.getState().toggleHealthBaseline('allergies');
      expect(useOnboardingStore.getState().dogProfile.healthBaseline).toEqual([]);
    });
  });

  describe('engagement fields', () => {
    it('sets signature path data', () => {
      useOnboardingStore.getState().setSignaturePathData('M 0 0 L 100 100');
      expect(useOnboardingStore.getState().signaturePathData).toBe('M 0 0 L 100 100');
    });

    it('sets notification hour', () => {
      useOnboardingStore.getState().setNotificationHour(8);
      expect(useOnboardingStore.getState().notificationHour).toBe(8);
    });

    it('sets selected plan', () => {
      useOnboardingStore.getState().setSelectedPlan('yearly');
      expect(useOnboardingStore.getState().selectedPlan).toBe('yearly');
    });

    it('sets star rating', () => {
      useOnboardingStore.getState().setStarRating(5);
      expect(useOnboardingStore.getState().starRating).toBe(5);
    });

    it('sets building step', () => {
      useOnboardingStore.getState().setBuildingStep(2);
      expect(useOnboardingStore.getState().buildingStep).toBe(2);
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

  describe('clearOnboarding', () => {
    it('resets all state to initial values', () => {
      const store = useOnboardingStore.getState();
      store.setSurveyAttribution('vet');
      store.setDogField('name', 'Luna');
      store.toggleSurveyWorry('aging');
      store.setSignaturePathData('M 0 0');
      store.goToStep(10);
      store.clearOnboarding();

      const state = useOnboardingStore.getState();
      expect(state.currentStep).toBe(0);
      expect(state.surveyAttribution).toBeNull();
      expect(state.dogProfile.name).toBe('');
      expect(state.surveyWorries).toEqual([]);
      expect(state.signaturePathData).toBeNull();
      expect(state.startedAt).toBeNull();
    });
  });

  describe('persist partialize', () => {
    it('only persists expected fields', () => {
      const store = useOnboardingStore;
      const partialize = (store as any).persist?.getOptions?.()?.partialize;
      if (partialize) {
        const result = partialize({
          currentStep: 5,
          dogProfile: { name: 'Luna' },
          surveyAttribution: 'friend',
          surveyWorries: ['aging'],
          surveySeverity: 'weekly',
          surveyHistory: 'yes_recently',
          surveyBlindsides: ['cancer'],
          signaturePathData: 'M 0 0',
          notificationHour: 8,
          selectedPlan: 'yearly',
          starRating: 5,
          startedAt: 12345,
          isSubmitting: true,
          isSyncing: true,
          error: 'some error',
          buildingStep: 2,
        });
        expect(result).toHaveProperty('currentStep', 5);
        expect(result).toHaveProperty('surveyAttribution', 'friend');
        expect(result).toHaveProperty('signaturePathData', 'M 0 0');
        expect(result).not.toHaveProperty('isSubmitting');
        expect(result).not.toHaveProperty('error');
        expect(result).not.toHaveProperty('isSyncing');
        expect(result).not.toHaveProperty('buildingStep');
      }
    });
  });

  describe('syncOnboardingData validation', () => {
    it('sets error when dog profile is incomplete', async () => {
      await useOnboardingStore.getState().syncOnboardingData();
      expect(useOnboardingStore.getState().error).toBe('Dog profile is incomplete.');
    });
  });
});
