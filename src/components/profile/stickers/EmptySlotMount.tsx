import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
import { COPY } from '../../../constants/profileCopy';

export type EmptySlotMountProps = {
  onPress?: () => void;
};

const CONTAINER = 74;
const RING = 64;
const SLOT_OUTLINE = '#9F8E7A';
const INNER_OUTLINE = 'rgba(159, 142, 122, 0.35)';

/**
 * Empty featured-sticker slot mount (Pattern E PR 2).
 * 74x74 container with two counter-rotated dashed rings and a STRAIGHT
 * Caveat "+" symbol (user explicitly: no tilt on the +). Caption below
 * at -1.5deg. Subtle 3s breathe scale. Respects useReducedMotion.
 *
 * Design ref: HANDOFF.md section 4.3.
 */
export function EmptySlotMount({ onPress }: EmptySlotMountProps) {
  const reducedMotion = useReducedMotion();
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [reducedMotion, breathe]);

  const breatheStyle = useAnimatedStyle(() => {
    // gentle 1.0 -> 1.03 scale
    const scale = 1 + breathe.value * 0.03;
    return { transform: [{ scale }] };
  });

  return (
    <View style={styles.outer}>
      <Pressable
        testID="empty-slot-mount"
        accessibilityRole="button"
        accessibilityLabel="Empty featured sticker slot. Tap to feature a sticker."
        onPress={onPress}
        hitSlop={6}
        style={styles.pressable}
      >
        <Animated.View style={[styles.ringWrap, breatheStyle]}>
          {/* Outer ring: -3deg */}
          <View style={[styles.outerRing, { transform: [{ rotate: '-3deg' }] }]} />
          {/* Inner ring: inset 4, +7deg */}
          <View style={[styles.innerRing, { transform: [{ rotate: '7deg' }] }]} />
          {/* Plus symbol — STRAIGHT, only translateY */}
          <Text style={styles.plus}>+</Text>
        </Animated.View>
      </Pressable>
      <Text style={styles.caption}>{COPY.STICKER_EMPTY_SLOT_CAPTION}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: CONTAINER,
    height: CONTAINER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    width: RING,
    height: RING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: SLOT_OUTLINE,
  },
  innerRing: {
    position: 'absolute',
    width: RING - 8,
    height: RING - 8,
    borderRadius: (RING - 8) / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: INNER_OUTLINE,
  },
  plus: {
    fontFamily: OB_FONTS.h1,
    fontSize: 42,
    fontWeight: '500',
    color: SLOT_OUTLINE,
    transform: [{ translateY: -2 }],
    // no rotation - user explicit
  },
  caption: {
    fontFamily: OB_FONTS.body,
    fontSize: 12,
    color: OB_COLORS.sketch,
    opacity: 0.6,
    marginTop: 4,
    transform: [{ rotate: '-1.5deg' }],
  },
});
