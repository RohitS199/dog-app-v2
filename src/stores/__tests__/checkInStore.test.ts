import { useCheckInStore } from '../checkInStore';
import type { AdditionalSymptom } from '../../types/checkIn';

// Reset store state before each test
beforeEach(() => {
  useCheckInStore.setState({
    currentStep: 0,
    draft: null,
    yesterdayCheckIn: null,
    existingCheckIn: null,
    isSubmitting: false,
    error: null,
    daySummary: null,
    analyzePatternsResult: null,
  });
});

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

describe('checkInStore', () => {
  describe('startCheckIn', () => {
    it('creates an empty draft for the given dog', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      const state = useCheckInStore.getState();
      expect(state.draft).not.toBeNull();
      expect(state.draft!.dog_id).toBe('dog-1');
      expect(state.draft!.check_in_date).toBe(getTodayDateString());
      expect(state.draft!.appetite).toBeNull();
    });

    it('resets error and daySummary', async () => {
      useCheckInStore.setState({ error: 'old error', daySummary: { type: 'all_normal', message: 'test', abnormalities: [] } });
      await useCheckInStore.getState().startCheckIn('dog-1');
      const state = useCheckInStore.getState();
      expect(state.error).toBeNull();
      expect(state.daySummary).toBeNull();
    });
  });

  describe('setAnswer', () => {
    it('sets a metric field on the draft', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().setAnswer('appetite', 'less');
      expect(useCheckInStore.getState().draft!.appetite).toBe('less');
    });

    it('does nothing if no draft exists', () => {
      useCheckInStore.getState().setAnswer('appetite', 'less');
      expect(useCheckInStore.getState().draft).toBeNull();
    });
  });

  describe('step navigation', () => {
    it('nextStep increments from 0 to 1', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().nextStep();
      expect(useCheckInStore.getState().currentStep).toBe(1);
    });

    it('nextStep does not exceed max step (8)', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.setState({ currentStep: 8 });
      useCheckInStore.getState().nextStep();
      expect(useCheckInStore.getState().currentStep).toBe(8);
    });

    it('prevStep decrements from 3 to 2', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.setState({ currentStep: 3 });
      useCheckInStore.getState().prevStep();
      expect(useCheckInStore.getState().currentStep).toBe(2);
    });

    it('prevStep does not go below 0', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().prevStep();
      expect(useCheckInStore.getState().currentStep).toBe(0);
    });

    it('goToStep sets specific step', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().goToStep(5);
      expect(useCheckInStore.getState().currentStep).toBe(5);
    });

    it('goToStep ignores out-of-range values', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().goToStep(10);
      expect(useCheckInStore.getState().currentStep).toBe(0);
      useCheckInStore.getState().goToStep(-1);
      expect(useCheckInStore.getState().currentStep).toBe(0);
    });
  });

  describe('toggleSymptom', () => {
    it('adds a symptom to the list', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().toggleSymptom('coughing');
      expect(useCheckInStore.getState().draft!.additional_symptoms).toContain('coughing');
    });

    it('removes a symptom when toggled again', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().toggleSymptom('coughing');
      useCheckInStore.getState().toggleSymptom('coughing');
      expect(useCheckInStore.getState().draft!.additional_symptoms).not.toContain('coughing');
    });

    it('selecting none deselects all other symptoms', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().toggleSymptom('coughing');
      useCheckInStore.getState().toggleSymptom('sneezing');
      useCheckInStore.getState().toggleSymptom('none');
      expect(useCheckInStore.getState().draft!.additional_symptoms).toEqual(['none']);
    });

    it('selecting a symptom removes none', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().toggleSymptom('none');
      useCheckInStore.getState().toggleSymptom('coughing');
      const symptoms = useCheckInStore.getState().draft!.additional_symptoms;
      expect(symptoms).toContain('coughing');
      expect(symptoms).not.toContain('none');
    });
  });

  describe('setFreeText', () => {
    it('sets free text on the draft', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().setFreeText('My dog seems tired');
      expect(useCheckInStore.getState().draft!.free_text).toBe('My dog seems tired');
    });

    it('enforces 500 character limit', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      const longText = 'x'.repeat(501);
      useCheckInStore.getState().setFreeText(longText);
      // Should not update — previous value stays
      expect(useCheckInStore.getState().draft!.free_text).toBeNull();
    });

    it('allows exactly 500 characters', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      const exactText = 'x'.repeat(500);
      useCheckInStore.getState().setFreeText(exactText);
      expect(useCheckInStore.getState().draft!.free_text).toBe(exactText);
    });

    it('sets free_text to null for empty string', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.getState().setFreeText('some text');
      useCheckInStore.getState().setFreeText('');
      expect(useCheckInStore.getState().draft!.free_text).toBeNull();
    });
  });

  describe('clearDraft', () => {
    it('resets all check-in state', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.setState({ currentStep: 5 });
      useCheckInStore.getState().clearDraft();
      const state = useCheckInStore.getState();
      expect(state.draft).toBeNull();
      expect(state.currentStep).toBe(0);
      expect(state.daySummary).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('resets entire store state', async () => {
      await useCheckInStore.getState().startCheckIn('dog-1');
      useCheckInStore.setState({ isSubmitting: true, error: 'some error' });
      useCheckInStore.getState().clearAll();
      const state = useCheckInStore.getState();
      expect(state.draft).toBeNull();
      expect(state.isSubmitting).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('rehydration guards', () => {
    it('discards draft if dog_id does not match', async () => {
      useCheckInStore.setState({
        draft: {
          dog_id: 'different-dog',
          check_in_date: getTodayDateString(),
          appetite: 'normal',
          water_intake: null,
          energy_level: null,
          stool_quality: null,
          vomiting: null,
          mobility: null,
          mood: null,
          additional_symptoms: [],
          free_text: null,
        },
        currentStep: 3,
      });

      await useCheckInStore.getState().startCheckIn('dog-1');
      const state = useCheckInStore.getState();
      expect(state.draft!.dog_id).toBe('dog-1');
      expect(state.currentStep).toBe(0); // Reset since draft was discarded
    });

    it('discards draft if check_in_date is stale', async () => {
      useCheckInStore.setState({
        draft: {
          dog_id: 'dog-1',
          check_in_date: '2020-01-01', // stale date
          appetite: 'less',
          water_intake: null,
          energy_level: null,
          stool_quality: null,
          vomiting: null,
          mobility: null,
          mood: null,
          additional_symptoms: [],
          free_text: null,
        },
        currentStep: 5,
      });

      await useCheckInStore.getState().startCheckIn('dog-1');
      const state = useCheckInStore.getState();
      expect(state.draft!.check_in_date).toBe(getTodayDateString());
      expect(state.draft!.appetite).toBeNull(); // Fresh draft
      expect(state.currentStep).toBe(0);
    });

    it('preserves valid draft on rehydration', async () => {
      const today = getTodayDateString();
      useCheckInStore.setState({
        draft: {
          dog_id: 'dog-1',
          check_in_date: today,
          appetite: 'less',
          water_intake: 'normal',
          energy_level: null,
          stool_quality: null,
          vomiting: null,
          mobility: null,
          mood: null,
          additional_symptoms: [],
          free_text: null,
        },
        currentStep: 2,
      });

      await useCheckInStore.getState().startCheckIn('dog-1');
      const state = useCheckInStore.getState();
      expect(state.draft!.appetite).toBe('less'); // Preserved
      expect(state.currentStep).toBe(2); // Preserved
    });
  });
});
