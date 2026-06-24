import { getWeekStartMonday, addDaysStr, buildGardenWeek, GardenFlowerInput } from '../gardenWeek';

describe('gardenWeek date helpers', () => {
  it('getWeekStartMonday returns the Monday of the week (Sat 2026-06-20 -> Mon 2026-06-15)', () => {
    expect(getWeekStartMonday('2026-06-20')).toBe('2026-06-15');
  });
  it('getWeekStartMonday on a Monday returns that Monday', () => {
    expect(getWeekStartMonday('2026-06-15')).toBe('2026-06-15');
  });
  it('addDaysStr adds days without timezone drift', () => {
    expect(addDaysStr('2026-06-15', 6)).toBe('2026-06-21');
    expect(addDaysStr('2026-06-30', 1)).toBe('2026-07-01');
  });
});

describe('buildGardenWeek', () => {
  const flowers: GardenFlowerInput[] = [
    { id: 'c1', date: '2026-06-15', mood: 'joyful', tier: 1 },   // Mon
    { id: 'c2', date: '2026-06-17', mood: 'calm', tier: 3 },     // Wed
  ];

  it('produces 7 Mon..Sun days', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days).toHaveLength(7);
    expect(week.days[0].date).toBe('2026-06-15');
    expect(week.days[6].date).toBe('2026-06-21');
    expect(week.weekStart).toBe('2026-06-15');
  });

  it('marks planted days with mood+tier and seeds them by check-in id', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'joyful', tier: 1, seed: 'c1' });
    expect(week.days[2]).toMatchObject({ state: 'planted', moodKey: 'calm', tier: 3, seed: 'c2' });
    expect(week.plantedCount).toBe(2);
  });

  it('marks today (unlogged) as "today" and other empty days as "empty"', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days[5].date).toBe('2026-06-20');
    expect(week.days[5].state).toBe('today');   // Sat, no flower yet
    expect(week.days[1].state).toBe('empty');   // Tue, missed -> bare soil, never "missed"
  });

  it('an already-logged today is "planted", not "today"', () => {
    const week = buildGardenWeek({
      today: '2026-06-20',
      flowers: [...flowers, { id: 'c3', date: '2026-06-20', mood: 'playful', tier: 2 }],
    });
    expect(week.days[5].state).toBe('planted');
  });

  it('empty days seed by date (stable home if later planted)', () => {
    const week = buildGardenWeek({ today: '2026-06-20', flowers });
    expect(week.days[1].seed).toBe('2026-06-16');
  });
});
