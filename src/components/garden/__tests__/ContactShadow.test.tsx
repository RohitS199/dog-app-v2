import { render } from '@testing-library/react-native';
import { ContactShadow } from '../ContactShadow';

describe('ContactShadow', () => {
  it('renders a single elliptical shadow', () => {
    const { UNSAFE_getAllByType } = render(<ContactShadow cx={100} cy={200} rx={60} ry={8} />);
    const { Ellipse } = require('react-native-svg');
    expect(UNSAFE_getAllByType(Ellipse).length).toBe(1);
  });

  it('uses a radial gradient for soft falloff (not a flat fill)', () => {
    const { UNSAFE_getAllByType } = render(<ContactShadow cx={100} cy={200} rx={60} ry={8} />);
    const { RadialGradient } = require('react-native-svg');
    expect(UNSAFE_getAllByType(RadialGradient).length).toBe(1);
  });

  it('does not crash with zero radii', () => {
    expect(() => render(<ContactShadow cx={0} cy={0} rx={0} ry={0} />)).not.toThrow();
  });
});
