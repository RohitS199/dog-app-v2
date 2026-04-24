import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_PROGRESS,
  OB_SPACING,
  OB_TOTAL_STEPS,
} from '../../constants/onboardingTheme';

interface OnboardingProgressBarProps {
  step: number;
  showSkip?: boolean;
  onSkip?: () => void;
}

export function OnboardingProgressBar({
  step,
  showSkip = false,
  onSkip,
}: OnboardingProgressBarProps) {
  const progress = Math.min(100, Math.max(0, ((step + 1) / OB_TOTAL_STEPS) * 100));

  return (
    <View style={styles.container}>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={`Onboarding progress, step ${step + 1} of ${OB_TOTAL_STEPS}`}
        accessibilityValue={{ now: step + 1, min: 1, max: OB_TOTAL_STEPS }}
      >
        <View style={[styles.fill, { width: `${progress}%` }]} />
      </View>
      {showSkip && onSkip && (
        <Pressable
          onPress={onSkip}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Skip this step"
        >
          <Text style={styles.skipText}>skip</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: OB_SPACING.mt3,
  },
  track: {
    flex: 1,
    height: OB_PROGRESS.height,
    backgroundColor: OB_PROGRESS.trackColor,
    borderRadius: OB_PROGRESS.height / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: OB_PROGRESS.filledColor,
    borderRadius: OB_PROGRESS.height / 2,
  },
  skipText: {
    fontFamily: OB_FONTS.h1,
    fontSize: OB_FONT_SIZES.skip,
    color: OB_COLORS.ink2,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
});
