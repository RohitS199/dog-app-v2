import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { DailyCheckIn } from '../types/checkIn';
import type { PatternAlert } from '../types/health';

interface HealthState {
  calendarData: Record<string, DailyCheckIn>; // date string -> check-in
  activeAlerts: PatternAlert[];
  selectedDate: string | null;
  isLoading: boolean;
  error: string | null;

  fetchMonthData: (dogId: string, year: number, month: number) => Promise<void>;
  fetchActiveAlerts: (dogId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  clearHealth: () => void;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  calendarData: {},
  activeAlerts: [],
  selectedDate: null,
  isLoading: false,
  error: null,

  fetchMonthData: async (dogId, year, month) => {
    set({ isLoading: true, error: null, calendarData: {} });

    try {
      // Fetch from 7 days before month start (for trailing window consistency scoring)
      // through end of the requested month
      const monthStart = new Date(year, month - 1, 1);
      const trailingStart = new Date(monthStart);
      trailingStart.setDate(trailingStart.getDate() - 7);
      const startDate = `${trailingStart.getFullYear()}-${String(trailingStart.getMonth() + 1).padStart(2, '0')}-${String(trailingStart.getDate()).padStart(2, '0')}`;

      const lastDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const { data, error } = await supabase
        .from('daily_check_ins')
        .select('*')
        .eq('dog_id', dogId)
        .gte('check_in_date', startDate)
        .lte('check_in_date', endDate)
        .order('check_in_date', { ascending: true });

      if (error) throw error;

      const calendarData: Record<string, DailyCheckIn> = {};
      for (const checkIn of (data ?? []) as DailyCheckIn[]) {
        calendarData[checkIn.check_in_date] = checkIn;
      }

      set({ calendarData, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load health data',
        isLoading: false,
      });
    }
  },

  fetchActiveAlerts: async (dogId) => {
    try {
      const { data, error } = await supabase
        .from('pattern_alerts')
        .select('*')
        .eq('dog_id', dogId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ activeAlerts: (data ?? []) as PatternAlert[] });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load alerts',
      });
    }
  },

  dismissAlert: async (alertId) => {
    try {
      const { error } = await supabase
        .from('pattern_alerts')
        .update({ dismissed_by_user: true, is_active: false })
        .eq('id', alertId);

      if (error) throw error;

      set((state) => ({
        activeAlerts: state.activeAlerts.filter((a) => a.id !== alertId),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to dismiss alert',
      });
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),

  clearHealth: () =>
    set({
      calendarData: {},
      activeAlerts: [],
      selectedDate: null,
      isLoading: false,
      error: null,
    }),
}));
