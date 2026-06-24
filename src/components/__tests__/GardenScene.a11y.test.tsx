import { render } from '@testing-library/react-native';
import { GardenScene } from '../garden/GardenScene';
import type { GardenWeek } from '../../lib/gardenWeek';

const week: GardenWeek = {
  weekStart: '2026-06-15',
  plantedCount: 1,
  days: [
    { date: '2026-06-15', weekday: 0, state: 'planted', moodKey: 'playful', tier: 2, seed: 'c1' },
    { date: '2026-06-16', weekday: 1, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-16' },
    { date: '2026-06-17', weekday: 2, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-17' },
    { date: '2026-06-18', weekday: 3, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-18' },
    { date: '2026-06-19', weekday: 4, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-19' },
    { date: '2026-06-20', weekday: 5, state: 'today', moodKey: null, tier: 0, seed: '2026-06-20' },
    { date: '2026-06-21', weekday: 6, state: 'empty', moodKey: null, tier: 0, seed: '2026-06-21' },
  ],
};

describe('GardenScene a11y', () => {
  it('labels each planted day ONCE (weekday + mood + tier), never "missed"', () => {
    const { getByLabelText, queryByLabelText } = render(<GardenScene week={week} width={390} height={300} />);
    // One accessible element per planted day (not one per bloom) — grouped cluster label.
    expect(getByLabelText(/Monday: playful, fuller bloom/i)).toBeTruthy();
    expect(queryByLabelText(/missed/i)).toBeNull();
  });

  it('labels today as not yet logged', () => {
    const { getByLabelText } = render(<GardenScene week={week} width={390} height={300} />);
    expect(getByLabelText(/today, not yet logged/i)).toBeTruthy();
  });
});
