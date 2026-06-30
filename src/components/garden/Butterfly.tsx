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
import Svg, { Path } from 'react-native-svg';

// Decorative butterfly (2026-06-23 §9.3): drifts across the scene and flaps its wings. No art needed
// — coral (#F4845F) wings with a sketch outline to match the app's hand-drawn aesthetic / mockup.
const WING = '#F4845F';
const SKETCH = '#1a140f';

export function Butterfly({ width, height, paused }: { width: number; height: number; paused: boolean }) {
  const reduced = useReducedMotion();
  const active = !paused && !reduced;
  const t = useSharedValue(0); // 0..1 drift across the scene
  const flap = useSharedValue(1);

  useEffect(() => {
    if (!active) return;
    t.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.ease) }), -1, false);
    flap.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 220, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 220, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    return () => {
      cancelAnimation(t);
      cancelAnimation(flap);
    };
  }, [active]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: t.value * width * 0.8 + width * 0.1 },
      { translateY: height * 0.4 + Math.sin(t.value * Math.PI * 4) * 18 },
    ],
  }));
  const leftWing = useAnimatedStyle(() => ({ transform: [{ scaleX: flap.value }] }));
  const rightWing = useAnimatedStyle(() => ({ transform: [{ scaleX: flap.value }] }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, width: 18, height: 14 }, containerStyle]}
    >
      {/* Each wing pivots at its INNER edge (the body centerline where the two wings meet) so the
          scaleX flap folds the outer wing while the inner tips stay glued — the middle stays intact.
          Left wing's attach point is at 90% of its box; the right wing's at 10%. */}
      <Animated.View
        testID="butterfly-wing-left"
        style={[{ position: 'absolute', left: 0, width: 10, height: 14, transformOrigin: '90% 50%' }, leftWing]}
      >
        <Svg width={10} height={14}>
          <Path d="M9 7 C2 0 0 4 1 7 C0 10 2 14 9 7 Z" fill={WING} fillOpacity={0.7} stroke={SKETCH} strokeWidth={1} />
        </Svg>
      </Animated.View>
      <Animated.View
        testID="butterfly-wing-right"
        style={[{ position: 'absolute', left: 8, width: 10, height: 14, transformOrigin: '10% 50%' }, rightWing]}
      >
        <Svg width={10} height={14}>
          <Path d="M1 7 C8 0 10 4 9 7 C10 10 8 14 1 7 Z" fill={WING} fillOpacity={0.7} stroke={SKETCH} strokeWidth={1} />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}
