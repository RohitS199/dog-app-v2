import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { isGardenMood, GardenMood } from '../constants/gardenMoods';
import { computeFlowerTier } from '../lib/flowerTier';
import { detectEmergencyKeywords } from '../lib/emergencyKeywords';
import {
  buildGardenWeek,
  getWeekStartMonday,
  addDaysStr,
  GardenFlowerInput,
  GardenWeek,
} from '../lib/gardenWeek';

// Minimal row shape this store reads from garden_logs (explicit column select keeps
// payloads small). tier is DERIVED here — never stored (see the migration).
interface GardenRow {
  id: string;
  log_date: string;
  garden_mood: string | null;
  health_chips: unknown[] | null;
  note: string | null;
}

// What the LogSheet hands the store to plant/edit a day's flower.
export interface GardenDraft {
  log_date: string;
  garden_mood: GardenMood;
  health_chips: string[];
  note: string | null;
}

interface GardenState {
  week: GardenWeek | null;
  dogId: string | null;
  isLoading: boolean;
  error: string | null;
  deriveWeek: (today: string, rows: GardenRow[]) => GardenWeek;
  fetchWeek: (dogId: string, today?: string) => Promise<void>;
  plantFlower: (dogId: string, draft: GardenDraft) => Promise<boolean>;
  clearGarden: () => void;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const useGardenStore = create<GardenState>((set, get) => ({
  week: null,
  dogId: null,
  isLoading: false,
  error: null,

  deriveWeek: (today, rows) => {
    const flowers: GardenFlowerInput[] = [];
    for (const row of rows) {
      // No DB CHECK on garden_mood (TS const is source of truth) — validate here so a
      // bad/unknown mood is simply un-planted rather than crashing the render.
      if (!isGardenMood(row.garden_mood)) continue;
      const tier = computeFlowerTier({
        mood: row.garden_mood,
        hasHealthChip: (row.health_chips?.length ?? 0) > 0,
        hasPhoto: false, // media deferred (no storage columns yet)
        hasVideo: false,
        hasNote: !!row.note,
      });
      flowers.push({ id: row.id, date: row.log_date, mood: row.garden_mood, tier });
    }
    return buildGardenWeek({ today, flowers });
  },

  fetchWeek: async (dogId, today = todayStr()) => {
    // Clear stale data immediately on dog switch (mirror healthStore).
    set({ isLoading: true, error: null, dogId, week: null });
    const weekStart = getWeekStartMonday(today);
    const weekEnd = addDaysStr(weekStart, 6);
    try {
      const { data, error } = await supabase
        .from('garden_logs')
        .select('id, log_date, garden_mood, health_chips, note')
        .eq('dog_id', dogId)
        .gte('log_date', weekStart)
        .lte('log_date', weekEnd);
      if (error) throw error;
      // Guard against a race: ignore if the user switched dogs mid-fetch.
      if (get().dogId !== dogId) return;
      set({ week: get().deriveWeek(today, (data ?? []) as GardenRow[]), isLoading: false });
    } catch (err) {
      if (get().dogId !== dogId) return;
      set({ error: err instanceof Error ? err.message : 'Failed to load garden.', isLoading: false });
    }
  },

  plantFlower: async (dogId, draft) => {
    // App-side validation stands in for the (intentionally absent) DB CHECK on garden_mood.
    if (!isGardenMood(draft.garden_mood)) {
      set({ error: 'Invalid mood.' });
      return false;
    }
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const note = draft.note?.trim() || null;
      const { error } = await supabase
        .from('garden_logs')
        .upsert(
          {
            user_id: user.id,
            dog_id: dogId,
            log_date: draft.log_date,
            garden_mood: draft.garden_mood,
            health_chips: draft.health_chips,
            note,
            // Golden Rule: re-run emergency detection on the note (note-less logs stay
            // false; the always-on Emergency surface covers them).
            emergency_flagged: note ? detectEmergencyKeywords(note).isEmergency : false,
          },
          { onConflict: 'dog_id,log_date' },
        )
        .select()
        .single();
      if (error) throw error;
      // Refresh the week so the new/updated flower appears.
      await get().fetchWeek(dogId, draft.log_date);
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Could not plant the flower.' });
      return false;
    }
  },

  clearGarden: () => set({ week: null, dogId: null, isLoading: false, error: null }),
}));
