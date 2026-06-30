import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { Clouds } from '../Clouds';

describe('Clouds', () => {
  it('renders three decorative cloud images', () => {
    const { UNSAFE_getAllByType } = render(<Clouds width={390} height={359} paused={false} />);
    expect(UNSAFE_getAllByType(Image).length).toBe(3);
  });

  it('does not crash with reduced motion / paused', () => {
    expect(() => render(<Clouds width={390} height={359} paused />)).not.toThrow();
  });
});
