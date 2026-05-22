import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

/**
 * 6-second horizontal light-wash sweep used on the trophy detail sticker.
 * Sweeps left-to-right with an opacity peak in the middle (0 -> 0.85 -> 0).
 * Respects reduced motion: returns null in that case (no animation, no
 * static overlay - the sticker speaks for itself).
 *
 * Design ref: HANDOFF.md section 4.4 (Trophy detail view, Light-wash sweep).
 */
export function LightWashOverlay() {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    progress.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 800 }),
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [reducedMotion, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const tx = -1.3 + progress.value * 2.6;
    const opacity = progress.value < 0.5
      ? progress.value * 2 * 0.85
      : (1 - progress.value) * 2 * 0.85;
    return {
      transform: [{ translateX: `${tx * 100}%` }],
      opacity,
    };
  });

  if (reducedMotion) return null;

  return (
    <AnimatedGradient
      testID="light-wash-overlay"
      pointerEvents="none"
      colors={['rgba(255,240,200,0)', 'rgba(255,240,200,0.55)', 'rgba(255,240,200,0)']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={[styles.overlay, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: '-8%',
    left: '-8%',
    right: '-8%',
    bottom: '-8%',
  },
});
