import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

// Override the reanimated mock to add missing Easing.back + withSequence
// The global mock in jest.setup.js doesn't include them.
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
    withTiming: (toValue: unknown) => toValue,
    withSpring: (toValue: unknown) => toValue,
    withSequence: (...values: unknown[]) => values[values.length - 1],
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
      back: () => noopEasing,
    },
    Extrapolation: { CLAMP: 'clamp' },
    useReducedMotion: () => false,
  };
});

import { StickerEarnCelebration } from '../StickerEarnCelebration';
import { useUserAchievementsStore } from '../../../../stores/userAchievementsStore';

// Reset store before each test
beforeEach(() => {
  useUserAchievementsStore.setState({
    earnedIds: new Set(),
    earnedRecords: [],
    isLoading: false,
    error: null,
    lastEarned: null,
    seasonalCheckedThisSession: false,
  });
  jest.clearAllMocks();
});

describe('StickerEarnCelebration', () => {
  // 1. Renders nothing when store.lastEarned is null
  it('1. renders nothing when lastEarned is null', () => {
    const { queryByText } = render(<StickerEarnCelebration />);
    expect(queryByText('Awesome')).toBeNull();
    expect(queryByText('Welcome to PupLog')).toBeNull();
  });

  // 2. Renders sticker title + description when store.lastEarned is set
  it('2. renders sticker title and description when lastEarned is set', () => {
    act(() => {
      useUserAchievementsStore.setState({ lastEarned: 'welcome' });
    });
    const { getByText } = render(<StickerEarnCelebration />);
    expect(getByText('Welcome to PupLog')).toBeTruthy();
    expect(getByText("You're here. Your dog is lucky.")).toBeTruthy();
    expect(getByText('Awesome')).toBeTruthy();
  });

  // 3. Tapping "Awesome" eventually calls clearLastEarned
  it('3. tapping Awesome button eventually calls clearLastEarned', () => {
    jest.useFakeTimers();

    const clearLastEarned = jest.fn();
    useUserAchievementsStore.setState({
      lastEarned: 'pattern_spotter',
      clearLastEarned,
    } as unknown as Parameters<typeof useUserAchievementsStore.setState>[0]);

    const { getByLabelText } = render(<StickerEarnCelebration />);
    fireEvent.press(getByLabelText('Awesome'));

    // Advance past the 260ms dismiss timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(clearLastEarned).toHaveBeenCalled();

    jest.useRealTimers();
  });

  // 4. Tapping backdrop eventually calls clearLastEarned
  it('4. tapping backdrop eventually calls clearLastEarned', () => {
    jest.useFakeTimers();

    const clearLastEarned = jest.fn();
    useUserAchievementsStore.setState({
      lastEarned: 'welcome',
      clearLastEarned,
    } as unknown as Parameters<typeof useUserAchievementsStore.setState>[0]);

    const { getByLabelText } = render(<StickerEarnCelebration />);
    fireEvent.press(getByLabelText('Dismiss celebration'));

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(clearLastEarned).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
