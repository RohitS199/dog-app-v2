import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

interface SaveButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SaveButton({ label, onPress, disabled }: SaveButtonProps) {
  const translateY = useSharedValue(0);
  const reducedMotion = useReducedMotion();

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
      <View style={[styles.slab, disabled && styles.disabledSlab]} />
      <AnimatedView style={[styles.face, disabled && styles.disabledFace, faceStyle]}>
        <Text style={[styles.label, disabled && styles.disabledLabel]}>{label}</Text>
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
  disabledSlab: { opacity: 0.5 },
  disabledFace: { opacity: 0.5 },
  disabledLabel: {},
});
