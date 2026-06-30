import { render } from '@testing-library/react-native';
import { Ground } from '../Ground';

describe('Ground (meadow depth)', () => {
  it('renders the layered meadow without crashing (decorative)', () => {
    expect(() => render(<Ground width={390} height={359} />)).not.toThrow();
  });

  it('renders an svg canvas', () => {
    const { UNSAFE_getAllByType } = render(<Ground width={390} height={359} />);
    const { Svg } = require('react-native-svg');
    expect(UNSAFE_getAllByType(Svg).length).toBeGreaterThan(0);
  });

  it('layers the meadow with soft ellipses (hill, mottles, highlights)', () => {
    const { UNSAFE_getAllByType } = render(<Ground width={390} height={359} />);
    const { Ellipse } = require('react-native-svg');
    expect(UNSAFE_getAllByType(Ellipse).length).toBeGreaterThanOrEqual(5);
  });
});
