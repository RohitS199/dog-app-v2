import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { haptic } from '../../lib/haptics';
import {
  OB_BUTTON_PRESS_TRANSLATE,
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScrapbookButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'small';
  disabled?: boolean;
  style?: ViewStyle;
  hapticType?: 'medium' | 'success';
  testID?: string;
}

export function ScrapbookButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  hapticType = 'medium',
  testID,
}: ScrapbookButtonProps) {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const shadowOffsetY = useSharedValue<number>(OB_SHADOWS.button.shadowOffset.height);
  const shadowOpacity = useSharedValue<number>(OB_SHADOWS.button.shadowOpacity);
  const reducedMotion = useReducedMotion();

  const handlePressIn = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withTiming(0.98, { duration: 80 });
    translateY.value = withTiming(OB_BUTTON_PRESS_TRANSLATE, { duration: 80 });
    shadowOffsetY.value = withTiming(0, { duration: 80 });
    shadowOpacity.value = withTiming(0, { duration: 80 });
  }, [reducedMotion]);

  const handlePressOut = useCallback(() => {
    if (reducedMotion) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    shadowOffsetY.value = withSpring(OB_SHADOWS.button.shadowOffset.height, {
      damping: 15,
      stiffness: 300,
    });
    shadowOpacity.value = withSpring(OB_SHADOWS.button.shadowOpacity, {
      damping: 15,
      stiffness: 300,
    });
  }, [reducedMotion]);

  const handlePress = useCallback(() => {
    if (disabled) return;
    haptic(hapticType);
    onPress();
  }, [disabled, hapticType, onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    shadowOffset: { width: 0, height: shadowOffsetY.value },
    shadowOpacity: shadowOpacity.value,
  }));

  const isPrimary = variant === 'primary';
  const isSmall = variant === 'small';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.ghost,
        isSmall && styles.small,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          isPrimary ? styles.primaryText : styles.ghostText,
          isSmall && styles.smallText,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.button,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    shadowColor: OB_SHADOWS.button.shadowColor,
    shadowOpacity: OB_SHADOWS.button.shadowOpacity,
    shadowRadius: OB_SHADOWS.button.shadowRadius,
    elevation: OB_SHADOWS.button.elevation,
  },
  primary: {
    backgroundColor: OB_COLORS.cta,
  },
  ghost: {
    backgroundColor: OB_COLORS.cream,
  },
  small: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: OB_RADII.buttonSm,
    minHeight: 36,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: OB_FONTS.cta,
    fontSize: OB_FONT_SIZES.cta,
  },
  primaryText: {
    color: OB_COLORS.ctaText,
  },
  ghostText: {
    color: OB_COLORS.ink,
  },
  smallText: {
    fontSize: 13,
  },
});
