import React, { useEffect } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_OFFSET = SCREEN_WIDTH * 0.12;

interface ScreenTransitionProps {
  step: number;
  children: React.ReactNode;
}

export function ScreenTransition({ step, children }: ScreenTransitionProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(SLIDE_OFFSET);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Reset for entrance
    translateX.value = SLIDE_OFFSET;
    opacity.value = 0;

    if (reducedMotion) {
      opacity.value = withTiming(1, { duration: 150 });
      translateX.value = 0;
    } else {
      opacity.value = withTiming(1, {
        duration: 280,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      });
      translateX.value = withTiming(0, {
        duration: 280,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
      });
    }
  }, [step, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
