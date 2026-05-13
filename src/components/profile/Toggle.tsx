import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { OB_BORDERS, OB_COLORS } from '../../constants/onboardingTheme';

const TRACK_W = 36;
const TRACK_H = 20;
const THUMB = 14;
const PAD = 1;
const BORDER = OB_BORDERS.standard;
// React Native uses border-box, so TRACK_W INCLUDES the 2px border on each side.
// Inner area for the thumb = TRACK_W - 2*BORDER - 2*PAD.
// Max translateX so the thumb sits flush with the right edge of that inner area:
const ON_X = TRACK_W - THUMB - PAD * 2 - BORDER * 2;

interface ToggleProps {
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, {
      duration: 150,
      easing: Easing.inOut(Easing.ease),
    });
  }, [value, progress]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: progress.value > 0.5 ? OB_COLORS.orangeSoft : OB_COLORS.cream,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * ON_X }],
    backgroundColor: progress.value > 0.5 ? '#ffffff' : OB_COLORS.sketch,
    borderWidth: progress.value > 0.5 ? 1 : 0,
    borderColor: OB_COLORS.sketch,
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      style={({ pressed }) => [pressed && styles.pressed, disabled && styles.disabled]}
      hitSlop={8}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_W,
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    padding: PAD,
    justifyContent: 'center',
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.4 },
});
