import { render } from '@testing-library/react-native';
import { Ground } from '../Ground';

describe('Ground', () => {
  it('renders the layered ground without crashing (decorative)', () => {
    expect(() => render(<Ground width={390} height={359} />)).not.toThrow();
  });

  it('renders an svg canvas for the painted ground', () => {
    const { UNSAFE_getAllByType } = render(<Ground width={390} height={359} />);
    const { Svg } = require('react-native-svg');
    expect(UNSAFE_getAllByType(Svg).length).toBeGreaterThan(0);
  });

  it('paints a radial-gradient soil bed (the richer ground, not a flat fill)', () => {
    const { UNSAFE_getAllByType } = render(<Ground width={390} height={359} />);
    const { RadialGradient } = require('react-native-svg');
    expect(UNSAFE_getAllByType(RadialGradient).length).toBeGreaterThan(0);
  });
});
