import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookChip } from './ScrapbookChip';
import { ScreenTransition } from './ScreenTransition';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_SPACING } from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';

const OPTIONS = [
  'Rarely \u2014 they seem fine',
  'A few times a month',
  'Weekly',
  'Most days',
  'Constantly \u2014 it keeps me up',
] as const;

interface SurveySeverityScreenProps {
  onNext: () => void;
}

export function SurveySeverityScreen({ onNext }: SurveySeverityScreenProps) {
  const surveySeverity = useOnboardingStore((s) => s.surveySeverity);
  const setSurveySeverity = useOnboardingStore((s) => s.setSurveySeverity);

  const handleSelect = useCallback(
    (value: string) => {
      setSurveySeverity(value);
      setTimeout(() => {
        onNext();
      }, 300);
    },
    [setSurveySeverity, onNext],
  );

  return (
    <OnboardingShell step={5}>
      <ScreenTransition step={5}>
        <Text style={styles.label}>{'how intense \u00B7 3 of 6'}</Text>
        <Text style={styles.h2}>{"How often do you worry about your dog\u2019s health?"}</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <ScrapbookChip
              key={option}
              label={option}
              selected={surveySeverity === option}
              onPress={() => handleSelect(option)}
              showCheckmark={false}
            />
          ))}
        </View>

        <Text style={styles.footer} accessibilityElementsHidden>
          {'\u2727 Users like you saw worry drop 42% after 4 weeks.'}
        </Text>
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
    marginBottom: OB_SPACING.gap4,
  },
  options: {
    gap: OB_SPACING.gap2,
  },
  footer: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    marginTop: OB_SPACING.gap4,
    textAlign: 'center',
  },
});
