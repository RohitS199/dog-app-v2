import { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  useReducedMotion,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { View, StyleSheet } from 'react-native';
import { Flower } from './Flower';
import { GardenMood } from '../../constants/gardenMoods';
import type { FlowerTier } from '../../lib/flowerTier';

// ~1000ms plant pop: a gentle overshoot settling to tier height. withTiming only (no
// springs — owner preference); reduced-motion path skips the pop and resolves at once.
export function PlantCelebration({
  mood,
  tier,
  onDone,
}: {
  mood: GardenMood;
  tier: Exclude<FlowerTier, 0>;
  onDone: () => void;
}) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      onDone();
      return;
    }
    scale.value = withSequence(
      withTiming(1.16, { duration: 520, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 480, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onDone)();
      }),
    );
  }, [reduced, onDone, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <View style={styles.center} pointerEvents="none">
      <Animated.View style={animStyle} testID="plant-celebration">
        {/* decorative — a transient overlay shouldn't grab VoiceOver focus mid-animation */}
        <Flower mood={mood} tier={tier} baseSize={72} decorative />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
