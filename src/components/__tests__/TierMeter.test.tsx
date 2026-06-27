import { render } from '@testing-library/react-native';
import { TierMeter } from '../garden/TierMeter';

describe('TierMeter', () => {
  it('shows the tier-0 sprout copy when no mood is chosen', () => {
    const { getByText } = render(<TierMeter tier={0} mood={null} />);
    expect(getByText(/Waiting to sprout/i)).toBeTruthy();
  });

  it('shows the tier-3 full-bloom copy', () => {
    const { getByText } = render(<TierMeter tier={3} mood="joyful" />);
    expect(getByText(/Full bloom/i)).toBeTruthy();
  });
});
