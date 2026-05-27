import { fireEvent, render } from '@testing-library/react-native';

// Local reanimated mock (matches LightWashOverlay pattern)
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View } = require('react-native');

  const AnimatedView = React.forwardRef((props: unknown, ref: unknown) =>
    React.createElement(View, { ...(props as object), ref })
  );

  const noopEasing = (v: number) => v;
  const noopEasingFn = () => noopEasing;

  return {
    __esModule: true,
    default: {
      View: AnimatedView,
      createAnimatedComponent: (component: unknown) => component,
    },
    useSharedValue: (init: unknown) => ({ value: init }),
    useAnimatedStyle: (fn: () => object) => fn(),
    useReducedMotion: () => false,
    withTiming: (toValue: unknown) => toValue,
    withSpring: (toValue: unknown) => toValue,
    withSequence: (...values: unknown[]) => values[values.length - 1],
    withRepeat: (value: unknown) => value,
    withDelay: (_delay: unknown, value: unknown) => value,
    runOnJS: (fn: (...args: unknown[]) => unknown) => fn,
    Easing: {
      linear: noopEasing,
      ease: noopEasing,
      bezier: noopEasingFn,
      inOut: noopEasingFn,
      in: noopEasingFn,
      out: noopEasingFn,
      cubic: noopEasing,
    },
    Extrapolation: { CLAMP: 'clamp' },
  };
});

import { EmptySlotMount } from '../EmptySlotMount';

describe('EmptySlotMount', () => {
  it('renders the + symbol', () => {
    const { getByText } = render(<EmptySlotMount />);
    expect(getByText('+')).toBeTruthy();
  });

  it('renders the "tap to feature" caption', () => {
    const { getByText } = render(<EmptySlotMount />);
    expect(getByText('tap to feature')).toBeTruthy();
  });

  it('fires onPress when the mount is tapped', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<EmptySlotMount onPress={onPress} />);
    fireEvent.press(getByTestId('empty-slot-mount'));
    expect(onPress).toHaveBeenCalled();
  });

  it('exposes a button-role accessibility label', () => {
    const { getByTestId } = render(<EmptySlotMount />);
    const mount = getByTestId('empty-slot-mount');
    expect(mount.props.accessibilityRole).toBe('button');
    expect(mount.props.accessibilityLabel).toBe('Empty featured sticker slot. Tap to feature a sticker.');
  });
});
