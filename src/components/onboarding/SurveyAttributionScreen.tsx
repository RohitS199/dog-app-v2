import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookChip } from './ScrapbookChip';
import { ScreenTransition } from './ScreenTransition';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_SPACING } from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';

const OPTIONS = [
  'A friend told me',
  'TikTok / Instagram',
  'My vet',
  'App Store search',
  'Lost-a-dog community',
  'Podcast or article',
] as const;

interface SurveyAttributionScreenProps {
  onNext: () => void;
}

export function SurveyAttributionScreen({ onNext }: SurveyAttributionScreenProps) {
  const surveyAttribution = useOnboardingStore((s) => s.surveyAttribution);
  const setSurveyAttribution = useOnboardingStore((s) => s.setSurveyAttribution);

  const handleSelect = useCallback(
    (value: string) => {
      setSurveyAttribution(value);
      setTimeout(() => {
        onNext();
      }, 300);
    },
    [setSurveyAttribution, onNext],
  );

  return (
    <OnboardingShell step={3}>
      <ScreenTransition step={3}>
        <Text style={styles.label}>{'tell us about you \u00B7 1 of 6'}</Text>
        <Text style={styles.h2}>How did you find PupLog?</Text>
        <Text style={styles.body}>Honestly. No wrong answers.</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <ScrapbookChip
              key={option}
              label={option}
              selected={surveyAttribution === option}
              onPress={() => handleSelect(option)}
              showCheckmark={false}
            />
          ))}
        </View>
      </ScreenTransition>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
    textTransform: 'uppercase',
    marginBottom: OB_SPACING.mt2,
  },
  h2: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    marginBottom: OB_SPACING.mt2,
  },
  body: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    marginBottom: OB_SPACING.gap4,
  },
  options: {
    gap: OB_SPACING.gap2,
  },
});
