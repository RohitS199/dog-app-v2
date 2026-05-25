import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

// Local reanimated mock - EmptySlotMount (rendered by profile-row) uses
// withRepeat/withSequence which the global mock in jest.setup.js lacks.
jest.mock('react-native-reanimated', () => {
  const ReactInner = require('react');
  const { View } = require('react-native');

  const AnimatedView = ReactInner.forwardRef((props: unknown, ref: unknown) =>
    ReactInner.createElement(View, { ...(props as object), ref })
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

import { StickerCollection } from '../StickerCollection';
import { StickerId, STICKERS } from '../../../../constants/achievements';
import type { FeaturedSlots } from '../../../../stores/userAchievementsStore';

const EMPTY_SLOTS: FeaturedSlots = [null, null, null];

describe('StickerCollection — profile-row variant', () => {
  it('renders 3 empty mounts when featuredIds is all nulls', () => {
    const { getAllByLabelText } = render(
      <StickerCollection
        variant="profile-row"
        featuredIds={EMPTY_SLOTS}
        earnedIds={new Set()}
        onPressFilledSlot={jest.fn()}
        onPressEmptySlot={jest.fn()}
        onPressViewAll={jest.fn()}
      />,
    );
    const mounts = getAllByLabelText('Empty featured sticker slot. Tap to feature a sticker.');
    expect(mounts).toHaveLength(3);
  });

  it('renders 2 filled stickers + 1 empty mount when featuredIds has one null', () => {
    const featured: FeaturedSlots = ['welcome', 'pattern_spotter', null];
    const { getAllByLabelText, getByLabelText } = render(
      <StickerCollection
        variant="profile-row"
        featuredIds={featured}
        earnedIds={new Set<StickerId>(['welcome', 'pattern_spotter'])}
        onPressFilledSlot={jest.fn()}
        onPressEmptySlot={jest.fn()}
        onPressViewAll={jest.fn()}
      />,
    );
    expect(getByLabelText('Welcome to PupLog sticker, earned')).toBeTruthy();
    expect(getByLabelText('Pattern Spotter sticker, earned')).toBeTruthy();
    expect(getAllByLabelText('Empty featured sticker slot. Tap to feature a sticker.')).toHaveLength(1);
  });

  it('onPressFilledSlot fires with the sticker id when a filled slot is tapped', () => {
    const onPressFilled = jest.fn();
    const featured: FeaturedSlots = ['welcome', null, null];
    const { getByLabelText } = render(
      <StickerCollection
        variant="profile-row"
        featuredIds={featured}
        earnedIds={new Set<StickerId>(['welcome'])}
        onPressFilledSlot={onPressFilled}
        onPressEmptySlot={jest.fn()}
        onPressViewAll={jest.fn()}
      />,
    );
    fireEvent.press(getByLabelText('Welcome to PupLog sticker, earned'));
    expect(onPressFilled).toHaveBeenCalledWith('welcome');
  });

  it('onPressEmptySlot fires with the correct slot index', () => {
    const onPressEmpty = jest.fn();
    const { getAllByTestId } = render(
      <StickerCollection
        variant="profile-row"
        featuredIds={EMPTY_SLOTS}
        earnedIds={new Set()}
        onPressFilledSlot={jest.fn()}
        onPressEmptySlot={onPressEmpty}
        onPressViewAll={jest.fn()}
      />,
    );
    const mounts = getAllByTestId('empty-slot-mount');
    fireEvent.press(mounts[1]);
    expect(onPressEmpty).toHaveBeenCalledWith(1);
  });

  it('renders "View all 12 stickers" link and fires onPressViewAll when tapped', () => {
    const onPressViewAll = jest.fn();
    const { getByTestId } = render(
      <StickerCollection
        variant="profile-row"
        featuredIds={EMPTY_SLOTS}
        earnedIds={new Set()}
        onPressFilledSlot={jest.fn()}
        onPressEmptySlot={jest.fn()}
        onPressViewAll={onPressViewAll}
      />,
    );
    const link = getByTestId('view-all-stickers');
    expect(link.props.accessibilityLabel).toBe('View all 12 stickers');
    fireEvent.press(link);
    expect(onPressViewAll).toHaveBeenCalled();
  });
});

describe('StickerCollection — grid variants (sheet/picker/browse)', () => {
  it('sheet renders all 12 sticker tiles', () => {
    const { getAllByTestId } = render(
      <StickerCollection
        variant="sheet"
        featuredIds={EMPTY_SLOTS}
        earnedIds={new Set()}
        onPressSticker={jest.fn()}
      />,
    );
    // testID prefix "sticker-tile-" on each tile
    const tiles = Object.values(STICKERS).map((s) =>
      getAllByTestId(`sticker-tile-${s.id}`),
    );
    expect(tiles.flat()).toHaveLength(12);
  });

  it('featured tile has the orange star badge', () => {
    const featured: FeaturedSlots = ['welcome', null, null];
    const { getByTestId, queryByTestId } = render(
      <StickerCollection
        variant="sheet"
        featuredIds={featured}
        earnedIds={new Set<StickerId>(['welcome'])}
        onPressSticker={jest.fn()}
      />,
    );
    expect(getByTestId('featured-badge-welcome')).toBeTruthy();
    expect(queryByTestId('featured-badge-pattern_spotter')).toBeNull();
  });

  it('onPressSticker fires with the sticker id when a tile is tapped (sheet)', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <StickerCollection
        variant="sheet"
        featuredIds={EMPTY_SLOTS}
        earnedIds={new Set<StickerId>(['welcome'])}
        onPressSticker={onPress}
      />,
    );
    fireEvent.press(getByTestId('sticker-tile-welcome'));
    expect(onPress).toHaveBeenCalledWith('welcome');
  });

  it('picker variant: locked sticker tiles are not pickable (accessibilityState.disabled = true)', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <StickerCollection
        variant="picker"
        featuredIds={EMPTY_SLOTS}
        earnedIds={new Set<StickerId>(['welcome'])}
        onPressSticker={onPress}
      />,
    );
    // seasonal_fall is locked
    const lockedTile = getByTestId('sticker-tile-seasonal_fall');
    expect(lockedTile.props.accessibilityState).toEqual({ disabled: true });

    // welcome is earned, should be pickable
    const earnedTile = getByTestId('sticker-tile-welcome');
    expect(earnedTile.props.accessibilityState).toEqual({ disabled: false });
  });

  it('browse variant: all tiles are tappable regardless of earned state', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <StickerCollection
        variant="browse"
        featuredIds={EMPTY_SLOTS}
        earnedIds={new Set<StickerId>(['welcome'])}
        onPressSticker={onPress}
      />,
    );
    const lockedTile = getByTestId('sticker-tile-seasonal_fall');
    expect(lockedTile.props.accessibilityState).toEqual({ disabled: false });
    fireEvent.press(lockedTile);
    expect(onPress).toHaveBeenCalledWith('seasonal_fall');
  });
});
