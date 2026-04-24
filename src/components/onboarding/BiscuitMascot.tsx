import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { OB_COLORS, OB_BORDERS } from '../../constants/onboardingTheme';

interface BiscuitMascotProps {
  size?: 'sm' | 'md' | 'lg';
  wag?: boolean;
}

const SIZES = {
  sm: 44,
  md: 64,
  lg: 96,
};

const EAR_SIZES = {
  sm: 12,
  md: 18,
  lg: 24,
};

export function BiscuitMascot({ size = 'md', wag = true }: BiscuitMascotProps) {
  const dimension = SIZES[size];
  const earSize = EAR_SIZES[size];
  const rotate = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!wag || reducedMotion) return;

    // Wag: rotate -4 -> +4 -> 0 over 1.2s, then pause 4.8s, repeat
    rotate.value = withRepeat(
      withSequence(
        withDelay(
          4800,
          withSequence(
            withTiming(-4, { duration: 300, easing: Easing.inOut(Easing.ease) }),
            withTiming(4, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(-2, { duration: 250, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 250, easing: Easing.inOut(Easing.ease) })
          )
        )
      ),
      -1,
      false
    );
  }, [wag, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[animatedStyle, { width: dimension, height: dimension }]}
      accessibilityLabel="Biscuit the mascot"
      accessibilityElementsHidden
    >
      {/* Left ear */}
      <View
        style={[
          styles.ear,
          {
            width: earSize,
            height: earSize,
            top: -earSize * 0.3,
            left: dimension * 0.1,
            transform: [{ rotate: '-25deg' }],
          },
        ]}
      />
      {/* Right ear */}
      <View
        style={[
          styles.ear,
          {
            width: earSize,
            height: earSize,
            top: -earSize * 0.3,
            right: dimension * 0.1,
            transform: [{ rotate: '25deg' }],
          },
        ]}
      />
      {/* Body */}
      <View
        style={[
          styles.body,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension * 0.45,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  body: {
    backgroundColor: OB_COLORS.peach2,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  ear: {
    position: 'absolute',
    backgroundColor: OB_COLORS.peach2,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: 6,
    zIndex: -1,
  },
});
