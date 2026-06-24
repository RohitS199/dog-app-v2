import { useGardenStore } from '../gardenStore';

describe('gardenStore', () => {
  beforeEach(() => {
    useGardenStore.setState({ week: null, isLoading: false, error: null, dogId: null });
  });

  it('starts empty', () => {
    const s = useGardenStore.getState();
    expect(s.week).toBeNull();
    expect(s.isLoading).toBe(false);
  });

  it('deriveWeek builds a GardenWeek and derives tier from row fields', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: 'joyful', health_chips: [], note: null },
      { id: 'c2', log_date: '2026-06-17', garden_mood: 'calm', health_chips: ['scratching'], note: 'itchy' },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.days).toHaveLength(7);
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'joyful', tier: 1 }); // mood only -> T1
    expect(week.days[2]).toMatchObject({ state: 'planted', moodKey: 'calm', tier: 3 });   // note -> T3
    expect(week.plantedCount).toBe(2);
  });

  it('derives tier 2 from a health chip alone (no note)', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: 'playful', health_chips: ['x'], note: null },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'playful', tier: 2 });
  });

  it('skips rows with a null/invalid garden_mood (un-planted in the garden)', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: null, health_chips: [], note: null },
      { id: 'c2', log_date: '2026-06-16', garden_mood: 'not_a_mood', health_chips: [], note: null },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.plantedCount).toBe(0);
    expect(week.days[0].state).toBe('empty');
  });

  it('clearGarden resets state', () => {
    useGardenStore.setState({ week: { weekStart: 'x', days: [], plantedCount: 0 }, dogId: 'd1' });
    useGardenStore.getState().clearGarden();
    expect(useGardenStore.getState().week).toBeNull();
    expect(useGardenStore.getState().dogId).toBeNull();
  });
});
