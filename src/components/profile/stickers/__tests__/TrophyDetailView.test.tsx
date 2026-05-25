import { fireEvent, render } from '@testing-library/react-native';

// Local reanimated mock - global lacks withSequence/withRepeat. Same pattern as
// LightWashOverlay.test.tsx and StickerEarnCelebration.test.tsx.
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

import { TrophyDetailView } from '../TrophyDetailView';
import { STICKERS } from '../../../../constants/achievements';
import { COPY } from '../../../../constants/profileCopy';

const baseProps = {
  sticker: STICKERS.welcome,
  earned: true,
  featured: true,
  earnedAt: '2026-05-09T12:00:00Z',
  onDismiss: jest.fn(),
};

describe('TrophyDetailView', () => {
  beforeEach(() => {
    (baseProps.onDismiss as jest.Mock).mockClear();
  });

  it('renders title, unlockCriteria, description for earned + featured sticker', () => {
    const { getByText } = render(<TrophyDetailView {...baseProps} />);
    expect(getByText(STICKERS.welcome.title)).toBeTruthy();
    expect(getByText(STICKERS.welcome.unlockCriteria)).toBeTruthy();
    // Flavor uses curly-quoted description
    expect(getByText(new RegExp(STICKERS.welcome.description))).toBeTruthy();
  });

  it('shows "Bloomed (date)" stamp for earned sticker', () => {
    const { getByText } = render(<TrophyDetailView {...baseProps} />);
    expect(getByText(/Bloomed.*May 9, 2026/)).toBeTruthy();
  });

  it('shows "Not yet bloomed" for locked sticker', () => {
    const { getByText, queryByText } = render(
      <TrophyDetailView
        {...baseProps}
        earned={false}
        featured={false}
        earnedAt={null}
      />,
    );
    expect(getByText(COPY.STICKER_NOT_YET_BLOOMED)).toBeTruthy();
    expect(queryByText(/Bloomed/)).toBeNull();
  });

  it('renders ribbon stamp in featured state when earned + featured', () => {
    const { getByText } = render(<TrophyDetailView {...baseProps} />);
    expect(getByText(COPY.STICKER_RIBBON_FEATURED)).toBeTruthy();
  });

  it('renders ribbon stamp in unfeatured state when earned + not featured', () => {
    const { getByText } = render(
      <TrophyDetailView {...baseProps} featured={false} />,
    );
    expect(getByText(COPY.STICKER_RIBBON_TAP_TO_FEATURE)).toBeTruthy();
  });

  it('does NOT render ribbon stamp for locked sticker', () => {
    const { queryByTestId } = render(
      <TrophyDetailView
        {...baseProps}
        earned={false}
        featured={false}
        earnedAt={null}
      />,
    );
    expect(queryByTestId('ribbon-stamp')).toBeNull();
  });

  it('calls onDismiss when backdrop is pressed', () => {
    const { getByTestId } = render(<TrophyDetailView {...baseProps} />);
    fireEvent.press(getByTestId('trophy-backdrop'));
    expect(baseProps.onDismiss).toHaveBeenCalled();
  });

  it('shows "Coming soon" stamp for locked sticker with no artwork yet', () => {
    const { getByText, queryByText } = render(
      <TrophyDetailView
        {...baseProps}
        sticker={STICKERS.seasonal_fall}
        earned={false}
        featured={false}
        earnedAt={null}
      />,
    );
    expect(getByText(COPY.STICKER_COMING_SOON)).toBeTruthy();
    expect(queryByText(COPY.STICKER_NOT_YET_BLOOMED)).toBeNull();
  });
});
