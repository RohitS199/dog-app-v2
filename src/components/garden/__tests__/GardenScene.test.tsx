import { render } from '@testing-library/react-native';
import { GardenScene } from '../GardenScene';
import type { GardenWeek } from '../../../lib/gardenWeek';

const emptyWeek: GardenWeek = {
  days: [{ date: '2026-06-22', weekday: 0, state: 'today', moodKey: null, tier: 0, seed: 's0' } as any],
} as GardenWeek;

describe('GardenScene', () => {
  it('renders the scene without crashing', () => {
    expect(() => render(<GardenScene week={emptyWeek} width={390} height={359} />)).not.toThrow();
  });

  it('does not render a dog-name sign on the doghouse (removed by request)', () => {
    // The dog's name lives in the header chip + greeting, not on the doghouse art.
    const { queryByText } = render(<GardenScene week={emptyWeek} width={390} height={359} />);
    expect(queryByText('Luna', { includeHiddenElements: true })).toBeNull();
  });

  it('handles a full-screen (tall) canvas', () => {
    expect(() => render(<GardenScene week={emptyWeek} width={390} height={844} />)).not.toThrow();
  });
});
