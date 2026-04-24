import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookChip } from './ScrapbookChip';
import { ScreenTransition } from './ScreenTransition';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_SPACING } from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';

const OPTIONS = [
  'Yes \u2014 recently',
  'Yes \u2014 years ago, still carry it',
  'Yes \u2014 it was their time',
  'No, this is my first',
  'Prefer not to say',
] as const;

interface SurveyHistoryScreenProps {
  onNext: () => void;
}

export function SurveyHistoryScreen({ onNext }: SurveyHistoryScreenProps) {
  const surveyHistory = useOnboardingStore((s) => s.surveyHistory);
  const setSurveyHistory = useOnboardingStore((s) => s.setSurveyHistory);

  const handleSelect = useCallback(
    (value: string) => {
      setSurveyHistory(value);
      setTimeout(() => {
        onNext();
      }, 300);
    },
    [setSurveyHistory, onNext],
  );

  return (
    <OnboardingShell step={6}>
      <ScreenTransition step={6}>
        <Text style={styles.label}>{'your story \u00B7 4 of 6'}</Text>
        <Text style={styles.h2}>Have you lost a dog before?</Text>
        <Text style={styles.body}>
          {"You don\u2019t have to share details. It helps us be gentle."}
        </Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <ScrapbookChip
              key={option}
              label={option}
              selected={surveyHistory === option}
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
