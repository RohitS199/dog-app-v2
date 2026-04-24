import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookChip } from './ScrapbookChip';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_SPACING } from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';

const OPTIONS = [
  'Getting older',
  'Behavior change I noticed',
  'Something I can\'t name',
  'A diagnosis we manage',
  'Allergies / skin / gut',
  'Staying ahead of problems',
] as const;

interface SurveyWorriesScreenProps {
  onNext: () => void;
}

export function SurveyWorriesScreen({ onNext }: SurveyWorriesScreenProps) {
  const surveyWorries = useOnboardingStore((s) => s.surveyWorries);
  const toggleSurveyWorry = useOnboardingStore((s) => s.toggleSurveyWorry);

  return (
    <OnboardingShell step={4}>
      <ScreenTransition step={4}>
        <Text style={styles.label}>{'about them \u00B7 2 of 6'}</Text>
        <Text style={styles.h2}>{"What\u2019s on your mind about them?"}</Text>
        <Text style={styles.body}>Pick all that apply. Shapes your check-ins.</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <ScrapbookChip
              key={option}
              label={option}
              selected={surveyWorries.includes(option)}
              onPress={() => toggleSurveyWorry(option)}
              showCheckmark
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <ScrapbookButton
            label="Continue"
            onPress={onNext}
            disabled={surveyWorries.length === 0}
          />
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
  buttonContainer: {
    marginTop: OB_SPACING.sectionGap,
  },
});
