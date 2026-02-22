import { useHealthStore } from '../healthStore';

// Reset store state before each test
beforeEach(() => {
  useHealthStore.setState({
    calendarData: {},
    activeAlerts: [],
    selectedDate: null,
    isLoading: false,
    error: null,
  });
});

describe('healthStore', () => {
  describe('initial state', () => {
    it('starts with empty calendar data', () => {
      const state = useHealthStore.getState();
      expect(state.calendarData).toEqual({});
      expect(state.activeAlerts).toEqual([]);
      expect(state.selectedDate).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchMonthData', () => {
    it('sets isLoading to false after fetch completes', async () => {
      await useHealthStore.getState().fetchMonthData('dog-1', 2026, 2);
      expect(useHealthStore.getState().isLoading).toBe(false);
    });

    it('clears error on successful fetch', async () => {
      useHealthStore.setState({ error: 'old error' });
      await useHealthStore.getState().fetchMonthData('dog-1', 2026, 2);
      expect(useHealthStore.getState().error).toBeNull();
    });

    it('sets calendarData to empty object when no data returned', async () => {
      await useHealthStore.getState().fetchMonthData('dog-1', 2026, 2);
      expect(useHealthStore.getState().calendarData).toEqual({});
    });
  });

  describe('setSelectedDate', () => {
    it('sets the selected date', () => {
      useHealthStore.getState().setSelectedDate('2026-02-21');
      expect(useHealthStore.getState().selectedDate).toBe('2026-02-21');
    });

    it('clears the selected date with null', () => {
      useHealthStore.getState().setSelectedDate('2026-02-21');
      useHealthStore.getState().setSelectedDate(null);
      expect(useHealthStore.getState().selectedDate).toBeNull();
    });
  });

  describe('dismissAlert', () => {
    it('removes alert from activeAlerts list', async () => {
      useHealthStore.setState({
        activeAlerts: [
          {
            id: 'alert-1',
            user_id: 'user-1',
            dog_id: 'dog-1',
            pattern_type: 'appetite_decline',
            alert_level: 'watch',
            title: 'Test Alert',
            message: 'Test message',
            ai_insight: null,
            data_window: {},
            is_active: true,
            dismissed_by_user: false,
            triggered_triage: false,
            first_detected: '2026-02-20',
            last_confirmed: '2026-02-21',
            resolved_at: null,
            created_at: '2026-02-20T10:00:00Z',
          },
        ],
      });

      await useHealthStore.getState().dismissAlert('alert-1');
      expect(useHealthStore.getState().activeAlerts).toHaveLength(0);
    });
  });

  describe('clearHealth', () => {
    it('resets all health state', () => {
      useHealthStore.setState({
        calendarData: { '2026-02-21': {} as any },
        activeAlerts: [{ id: 'alert-1' } as any],
        selectedDate: '2026-02-21',
        isLoading: true,
        error: 'some error',
      });

      useHealthStore.getState().clearHealth();
      const state = useHealthStore.getState();
      expect(state.calendarData).toEqual({});
      expect(state.activeAlerts).toEqual([]);
      expect(state.selectedDate).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
