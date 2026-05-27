import { render } from '@testing-library/react-native';

// Override the global reanimated mock to add withRepeat + an overridable
// useReducedMotion. The global mock in jest.setup.js lacks withSequence,
// withRepeat, and treats useReducedMotion as a plain () => false. We follow
// the same local-mock pattern used in StickerEarnCelebration.test.tsx.
const mockUseReducedMotion = jest.fn(() => false);

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
    useReducedMotion: () => mockUseReducedMotion(),
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

import { LightWashOverlay } from '../LightWashOverlay';

describe('LightWashOverlay', () => {
  beforeEach(() => {
    mockUseReducedMotion.mockReturnValue(false);
  });

  it('renders the overlay View when reduced motion is off', () => {
    const { getByTestId } = render(<LightWashOverlay />);
    expect(getByTestId('light-wash-overlay')).toBeTruthy();
  });

  it('renders null when reduced motion is on', () => {
    mockUseReducedMotion.mockReturnValueOnce(true);
    const { queryByTestId } = render(<LightWashOverlay />);
    expect(queryByTestId('light-wash-overlay')).toBeNull();
  });
});
