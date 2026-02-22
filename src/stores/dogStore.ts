import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Dog } from '../types/api';

interface DogState {
  dogs: Dog[];
  selectedDogId: string | null;
  isLoading: boolean;
  error: string | null;
  lastTriageDates: Record<string, string>; // dog_id -> ISO date string

  fetchDogs: () => Promise<void>;
  fetchLastTriageDates: () => Promise<void>;
  addDog: (dog: Omit<Dog, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_checkin_date' | 'checkin_streak'>) => Promise<Dog>;
  updateDog: (id: string, updates: Partial<Pick<Dog, 'name' | 'breed' | 'age_years' | 'weight_lbs' | 'vet_phone'>>) => Promise<void>;
  deleteDog: (id: string) => Promise<void>;
  selectDog: (id: string) => void;
  clearDogs: () => void;
}

export const useDogStore = create<DogState>((set, get) => ({
  dogs: [],
  selectedDogId: null,
  isLoading: false,
  error: null,
  lastTriageDates: {},

  fetchDogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dogs = (data ?? []) as Dog[];
      set({ dogs, isLoading: false });

      // Auto-select first dog if none selected
      if (!get().selectedDogId && dogs.length > 0) {
        set({ selectedDogId: dogs[0].id });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load dogs',
        isLoading: false,
      });
    }
  },

  fetchLastTriageDates: async () => {
    const dogs = get().dogs;
    if (dogs.length === 0) return;

    const { data } = await supabase
      .from('triage_audit_log')
      .select('dog_id, created_at')
      .in('dog_id', dogs.map((d) => d.id))
      .order('created_at', { ascending: false });

    if (!data) return;

    const dates: Record<string, string> = {};
    for (const row of data) {
      // Keep only the most recent per dog
      if (!dates[row.dog_id]) {
        dates[row.dog_id] = row.created_at;
      }
    }
    set({ lastTriageDates: dates });
  },

  addDog: async (dog) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dogs')
      .insert({ ...dog, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    const newDog = data as Dog;

    set((state) => ({
      dogs: [...state.dogs, newDog],
      selectedDogId: state.selectedDogId ?? newDog.id,
    }));

    return newDog;
  },

  updateDog: async (id, updates) => {
    const { error } = await supabase
      .from('dogs')
      .update(updates)
      .eq('id', id);

    if (error) throw error;

    set((state) => ({
      dogs: state.dogs.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    }));
  },

  deleteDog: async (id) => {
    const { error } = await supabase.from('dogs').delete().eq('id', id);
    if (error) throw error;

    set((state) => {
      const remaining = state.dogs.filter((d) => d.id !== id);
      return {
        dogs: remaining,
        selectedDogId:
          state.selectedDogId === id
            ? remaining[0]?.id ?? null
            : state.selectedDogId,
      };
    });
  },

  selectDog: (id) => set({ selectedDogId: id }),
  clearDogs: () => set({ dogs: [], selectedDogId: null, lastTriageDates: {} }),
}));
