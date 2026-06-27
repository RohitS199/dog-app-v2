import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  useReducedMotion,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { BiscuitMascot } from '../onboarding/BiscuitMascot';

// Biscuit sits near the doghouse and gently bobs (mockup .biscuit-slot "bob 3.6s ease-in-out").
// The mascot's own wag is disabled — only this wrapper animates the vertical bob. Position is a
// starting point; tune top/left on device (the compact hero box ≠ the full-phone mockup space).
export function BiscuitBob({ width, height, paused }: { width: number; height: number; paused: boolean }) {
  const reduced = useReducedMotion();
  const active = !paused && !reduced;
  const y = useSharedValue(0);

  useEffect(() => {
    if (!active) return;
    y.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => cancelAnimation(y);
  }, [active]);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[{ position: 'absolute', top: height * 0.3, left: width * 0.62 }, style]}
    >
      <BiscuitMascot size="lg" wag={false} />
    </Animated.View>
  );
}
