import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { Mushrooms } from '../Mushrooms';

describe('Mushrooms', () => {
  it('renders the configured decorative mushroom images', () => {
    const { UNSAFE_getAllByType } = render(<Mushrooms width={390} height={844} />);
    expect(UNSAFE_getAllByType(Image).length).toBeGreaterThanOrEqual(5);
  });

  it('does not crash at small/large canvases', () => {
    expect(() => render(<Mushrooms width={320} height={700} />)).not.toThrow();
    expect(() => render(<Mushrooms width={430} height={932} />)).not.toThrow();
  });
});
