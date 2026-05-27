import { fireEvent, render } from '@testing-library/react-native';
import { RibbonStamp } from '../RibbonStamp';

describe('RibbonStamp', () => {
  it('renders Featured label in featured state', () => {
    const { getByText } = render(<RibbonStamp state="featured" tilt={12} />);
    expect(getByText('Featured')).toBeTruthy();
  });

  it('renders Tap to feat label in unfeatured state', () => {
    const { getByText } = render(<RibbonStamp state="unfeatured" tilt={-10} />);
    expect(getByText('Tap to feat')).toBeTruthy();
  });

  it('renders null in locked state', () => {
    const { queryByTestId } = render(<RibbonStamp state="locked" tilt={8} />);
    expect(queryByTestId('ribbon-stamp')).toBeNull();
  });

  it('fires onPress when pressed (forward-compat with PR 2)', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <RibbonStamp state="featured" tilt={12} onPress={onPress} />,
    );
    fireEvent.press(getByTestId('ribbon-stamp'));
    expect(onPress).toHaveBeenCalled();
  });

  it('applies correct accessibilityLabel per state', () => {
    const { getByTestId, rerender } = render(
      <RibbonStamp state="featured" tilt={12} />,
    );
    expect(getByTestId('ribbon-stamp').props.accessibilityLabel).toBe('Featured. Tap to unpin.');

    rerender(<RibbonStamp state="unfeatured" tilt={12} />);
    expect(getByTestId('ribbon-stamp').props.accessibilityLabel).toBe('Tap to feature this sticker.');
  });
});
