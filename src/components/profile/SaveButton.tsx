import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import {
  OB_BORDERS,
  OB_BUTTON_PRESS_TRANSLATE,
  OB_COLORS,
  OB_FONTS,
} from '../../constants/onboardingTheme';

const AnimatedView = Animated.View;

const SLAB_COLOR = '#c75f3d';
const RADIUS = 14;
const DISABLED_OPACITY = 0.5;
const DISABLED_FADE_MS = 180;

interface SaveButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SaveButton({ label, onPress, disabled }: SaveButtonProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(disabled ? DISABLED_OPACITY : 1);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const target = disabled ? DISABLED_OPACITY : 1;
    if (reducedMotion) {
      opacity.value = target;
    } else {
      opacity.value = withTiming(target, { duration: DISABLED_FADE_MS });
    }
  }, [disabled, reducedMotion, opacity]);

  const handlePressIn = useCallback(() => {
    if (reducedMotion || disabled) return;
    translateY.value = withTiming(OB_BUTTON_PRESS_TRANSLATE, { duration: 80 });
  }, [reducedMotion, disabled, translateY]);

  const handlePressOut = useCallback(() => {
    if (reducedMotion || disabled) return;
    translateY.value = withTiming(0, { duration: 100 });
  }, [reducedMotion, disabled, translateY]);

  const faceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const slabStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={styles.outer}
    >
      <AnimatedView style={[styles.slab, slabStyle]} />
      <AnimatedView style={[styles.face, faceStyle]}>
        <Text style={styles.label}>{label}</Text>
      </AnimatedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    height: 52,
    width: '100%',
    position: 'relative',
  },
  slab: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: OB_BUTTON_PRESS_TRANSLATE,
    bottom: -OB_BUTTON_PRESS_TRANSLATE,
    backgroundColor: SLAB_COLOR,
    borderRadius: RADIUS,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  face: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: OB_COLORS.cta,
    borderRadius: RADIUS,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 15,
    color: OB_COLORS.ctaText,
    letterSpacing: 0.3,
  },
});
