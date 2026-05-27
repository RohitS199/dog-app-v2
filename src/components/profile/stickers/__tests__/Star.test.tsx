import { render } from '@testing-library/react-native';
import { Star } from '../Star';

describe('Star', () => {
  it('renders an Svg sized to the given prop', () => {
    const { getByTestId } = render(<Star size={22} color="#fff" />);
    const svg = getByTestId('Svg');
    expect(svg.props.width).toBe(22);
    expect(svg.props.height).toBe(22);
  });

  it('renders a Path filled with the given color', () => {
    const { getByTestId } = render(<Star size={14} color="#3F6E8F" />);
    expect(getByTestId('Path').props.fill).toBe('#3F6E8F');
  });
});
