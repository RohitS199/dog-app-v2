import { useTriageStore } from '../triageStore';
import { LIMITS } from '../../constants/config';

// Reset store between tests
beforeEach(() => {
  useTriageStore.setState({
    symptoms: '',
    isLoading: false,
    result: null,
    cachedResult: null,
    error: null,
    hasRetried: false,
    recentTriageTimestamps: [],
    nudgeDismissed: false,
  });
});

describe('triageStore', () => {
  describe('setSymptoms', () => {
    it('sets symptoms text', () => {
      useTriageStore.getState().setSymptoms('My dog is limping');
      expect(useTriageStore.getState().symptoms).toBe('My dog is limping');
    });

    it('enforces max character limit', () => {
      const longText = 'a'.repeat(LIMITS.SYMPTOM_MAX_CHARS + 100);
      useTriageStore.getState().setSymptoms(longText);
      // Should not update because text exceeds limit
      expect(useTriageStore.getState().symptoms).toBe('');
    });

    it('allows text at exactly the limit', () => {
      const exactText = 'a'.repeat(LIMITS.SYMPTOM_MAX_CHARS);
      useTriageStore.getState().setSymptoms(exactText);
      expect(useTriageStore.getState().symptoms).toBe(exactText);
    });
  });

  describe('clearResult', () => {
    it('clears result, error, and symptoms', () => {
      useTriageStore.setState({
        symptoms: 'test',
        result: { type: 'off_topic', message: 'test', reason: 'non_dog_animal' },
        error: 'some error',
      });

      useTriageStore.getState().clearResult();

      const state = useTriageStore.getState();
      expect(state.symptoms).toBe('');
      expect(state.result).toBeNull();
      expect(state.error).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('resets all state including cache and timestamps', () => {
      useTriageStore.setState({
        symptoms: 'test',
        isLoading: true,
        result: { type: 'off_topic', message: 'test', reason: 'non_dog_animal' },
        cachedResult: { type: 'triage', urgency: 'soon', headline: '', educational_info: '', what_to_tell_vet: [], sources: [], disclaimer: '' },
        error: 'err',
        hasRetried: true,
        recentTriageTimestamps: [Date.now()],
        nudgeDismissed: true,
      });

      useTriageStore.getState().clearAll();

      const state = useTriageStore.getState();
      expect(state.symptoms).toBe('');
      expect(state.isLoading).toBe(false);
      expect(state.result).toBeNull();
      expect(state.cachedResult).toBeNull();
      expect(state.error).toBeNull();
      expect(state.hasRetried).toBe(false);
      expect(state.recentTriageTimestamps).toHaveLength(0);
      expect(state.nudgeDismissed).toBe(false);
    });
  });

  describe('triage nudge', () => {
    it('returns 0 count when no triages', () => {
      expect(useTriageStore.getState().getRecentTriageCount()).toBe(0);
    });

    it('counts recent triages within 7 days', () => {
      const now = Date.now();
      useTriageStore.setState({
        recentTriageTimestamps: [
          now - 1000, // 1 second ago
          now - 60000, // 1 minute ago
          now - 3600000, // 1 hour ago
        ],
      });
      expect(useTriageStore.getState().getRecentTriageCount()).toBe(3);
    });

    it('excludes triages older than 7 days', () => {
      const now = Date.now();
      const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
      useTriageStore.setState({
        recentTriageTimestamps: [
          eightDaysAgo, // should be excluded
          now - 1000, // should be included
        ],
      });
      expect(useTriageStore.getState().getRecentTriageCount()).toBe(1);
    });

    it('dismisses nudge', () => {
      useTriageStore.getState().dismissNudge();
      expect(useTriageStore.getState().nudgeDismissed).toBe(true);
    });
  });
});
