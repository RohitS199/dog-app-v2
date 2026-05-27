import { fireEvent, render } from '@testing-library/react-native';

// Local reanimated mock
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

import { SwapPanel } from '../SwapPanel';
import { STICKERS } from '../../../../constants/achievements';
import { COPY } from '../../../../constants/profileCopy';
import type { FeaturedSlots } from '../../../../stores/userAchievementsStore';

const FEATURED_FULL: FeaturedSlots = ['welcome', 'pattern_spotter', 'multi_pup_parent'];
const EARNED = new Set(['welcome', 'pattern_spotter', 'multi_pup_parent', 'tender_caretaker'] as const);

describe('SwapPanel', () => {
  it('renders the swap title and the new sticker name in the subtitle', () => {
    const { getByText } = render(
      <SwapPanel
        newStickerId="tender_caretaker"
        featuredIds={FEATURED_FULL}
        earnedIds={EARNED}
        onPick={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText(COPY.STICKER_SWAP_TITLE)).toBeTruthy();
    expect(getByText(STICKERS.tender_caretaker.title)).toBeTruthy();
  });

  it('renders one tile per currently-featured sticker (3 in this case)', () => {
    const { getByTestId } = render(
      <SwapPanel
        newStickerId="tender_caretaker"
        featuredIds={FEATURED_FULL}
        earnedIds={EARNED}
        onPick={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByTestId('swap-tile-welcome')).toBeTruthy();
    expect(getByTestId('swap-tile-pattern_spotter')).toBeTruthy();
    expect(getByTestId('swap-tile-multi_pup_parent')).toBeTruthy();
  });

  it('fires onPick with the chosen sticker id when a tile is tapped', () => {
    const onPick = jest.fn();
    const { getByTestId } = render(
      <SwapPanel
        newStickerId="tender_caretaker"
        featuredIds={FEATURED_FULL}
        earnedIds={EARNED}
        onPick={onPick}
        onCancel={jest.fn()}
      />,
    );
    fireEvent.press(getByTestId('swap-tile-pattern_spotter'));
    expect(onPick).toHaveBeenCalledWith('pattern_spotter');
  });

  it('fires onCancel when the scrim is tapped', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <SwapPanel
        newStickerId="tender_caretaker"
        featuredIds={FEATURED_FULL}
        earnedIds={EARNED}
        onPick={jest.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.press(getByTestId('swap-panel-scrim'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('fires onCancel when the X button is tapped', () => {
    const onCancel = jest.fn();
    const { getByTestId } = render(
      <SwapPanel
        newStickerId="tender_caretaker"
        featuredIds={FEATURED_FULL}
        earnedIds={EARNED}
        onPick={jest.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.press(getByTestId('swap-panel-cancel'));
    expect(onCancel).toHaveBeenCalled();
  });
});
