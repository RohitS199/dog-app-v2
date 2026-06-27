import { render } from '@testing-library/react-native';
import { GardenScene } from '../GardenScene';
import type { GardenWeek } from '../../../lib/gardenWeek';

const emptyWeek: GardenWeek = {
  days: [{ date: '2026-06-22', weekday: 0, state: 'today', moodKey: null, tier: 0, seed: 's0' } as any],
} as GardenWeek;

describe('GardenScene doghouse name', () => {
  it('renders the dog name on the doghouse sign', () => {
    // The sign is decorative (accessibilityElementsHidden) — the dog's name is already
    // announced by the home dog card, so we assert it renders in the visual tree, not a11y.
    const { getByText } = render(
      <GardenScene week={emptyWeek} width={390} height={359} dogName="Luna" />
    );
    expect(getByText('Luna', { includeHiddenElements: true })).toBeTruthy();
  });

  it('omits the doghouse sign when no dog name is provided', () => {
    const { queryByText } = render(
      <GardenScene week={emptyWeek} width={390} height={359} />
    );
    expect(queryByText('Luna', { includeHiddenElements: true })).toBeNull();
  });
});
