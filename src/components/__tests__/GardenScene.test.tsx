import { render } from '@testing-library/react-native';
import { GardenScene } from '../garden/GardenScene';
import type { GardenWeek } from '../../lib/gardenWeek';

const week: GardenWeek = {
  weekStart: '2026-06-15',
  plantedCount: 2,
  days: [
    { date: '2026-06-15', weekday: 0, state: 'planted', moodKey: 'joyful', tier: 1, seed: 'c1' },
    { date: '2026-06-16', weekday: 1, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-16' },
    { date: '2026-06-17', weekday: 2, state: 'planted', moodKey: 'calm', tier: 3, seed: 'c2' },
    { date: '2026-06-18', weekday: 3, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-18' },
    { date: '2026-06-19', weekday: 4, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-19' },
    { date: '2026-06-20', weekday: 5, state: 'today', moodKey: null, tier: 0, seed: '2026-06-20' },
    { date: '2026-06-21', weekday: 6, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-21' },
  ],
};

describe('GardenScene', () => {
  it('plants a cluster per planted day, denser for a higher tier ("rewarded for specifics")', () => {
    const { queryAllByTestId } = render(<GardenScene week={week} width={390} height={300} />);
    // Blooms are hidden from VoiceOver (the per-day markers speak for them) -> count by testID.
    const joyful = queryAllByTestId('bloom-joyful', { includeHiddenElements: true }).length; // tier 1 -> small cluster
    const calm = queryAllByTestId('bloom-calm', { includeHiddenElements: true }).length; // tier 3 -> bigger cluster
    expect(joyful).toBeGreaterThan(0);
    expect(calm).toBeGreaterThan(joyful);
  });

  it('renders no blooms for an empty week', () => {
    const empty: GardenWeek = {
      ...week,
      plantedCount: 0,
      days: week.days.map((d) => ({ ...d, state: 'empty' as const, moodKey: null, tier: 0 as const })),
    };
    const { queryAllByTestId } = render(<GardenScene week={empty} width={390} height={300} />);
    expect(queryAllByTestId(/^bloom-/, { includeHiddenElements: true })).toHaveLength(0);
  });
});
