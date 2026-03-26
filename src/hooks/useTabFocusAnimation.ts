import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

/**
 * Returns a Reanimated animated style that creates a subtle
 * scale dip when a tab screen gains focus — scale-only, no opacity
 * to avoid flash artifacts on back-navigation.
 *
 * Skips the animation on first focus (initial mount) to avoid
 * choppiness when the component tree is still being constructed.
 */
export function useTabFocusAnimation() {
  const scale = useSharedValue(1);
  const hasMounted = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }
      scale.value = 0.997;
      scale.value = withSpring(1, { damping: 25, stiffness: 400, mass: 0.5 });
    }, [scale]),
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return animatedStyle;
}
