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
// The mascot's own wag is disabled — only this wrapper animates the vertical bob. Position is
// given as fractions of the scene box (topFrac/leftFrac) so the full-bleed scene can place
// Biscuit on the meadow; tune on device.
export function BiscuitBob({
  width,
  height,
  paused,
  topFrac = 0.3,
  leftFrac = 0.62,
}: {
  width: number;
  height: number;
  paused: boolean;
  topFrac?: number;
  leftFrac?: number;
}) {
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
      style={[{ position: 'absolute', top: height * topFrac, left: width * leftFrac }, style]}
    >
      <BiscuitMascot size="lg" wag={false} />
    </Animated.View>
  );
}
