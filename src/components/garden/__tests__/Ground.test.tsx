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

  it('draws the bed as organic blob Paths (imperfect edge, not a clean ellipse)', () => {
    const { UNSAFE_getAllByType } = render(<Ground width={390} height={359} />);
    const { Path } = require('react-native-svg');
    // The soil bed + its inner pool are blob paths (the wobbly, hand-painted edge).
    expect(UNSAFE_getAllByType(Path).length).toBeGreaterThanOrEqual(2);
  });
});
