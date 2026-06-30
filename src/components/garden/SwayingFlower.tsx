import { ReactNode } from 'react';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

// A single bloom that sways in the wind. The stem base stays planted because the view pivots
// at its bottom-center (transformOrigin: 'bottom') — only the flower head rocks. All blooms
// share ONE ramping clock (cheap), but each gets its own `phase` + `freq`, so the bed moves
// ASYNCHRONOUSLY rather than in unison. `active` (0..1) scales the sway to zero when the scene
// is unfocused or Reduce Motion is on, leaving the flower upright.
export function SwayingFlower({
  clock,
  active,
  phase,
  freq,
  amp,
  left,
  top,
  testID,
  children,
}: {
  clock: SharedValue<number>;
  active: SharedValue<number>;
  phase: number; // radians — staggers each bloom
  freq: number; // per-bloom angular multiplier — desyncs speed
  amp: number; // degrees of rock at full strength
  left: number;
  top: number;
  testID?: string;
  children: ReactNode;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${active.value * amp * Math.sin(clock.value * freq + phase)}deg` }],
  }));

  return (
    <Animated.View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ position: 'absolute', left, top, transformOrigin: 'bottom' }, style]}
    >
      {children}
    </Animated.View>
  );
}
