import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookChip } from './ScrapbookChip';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES, OB_SPACING } from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';

const ALL_ABOVE = 'All of the above';

const OPTIONS = [
  'Cancer we missed',
  'A silent internal condition',
  'Pain they couldn\'t tell me about',
  'Losing them younger than expected',
  ALL_ABOVE,
] as const;

const INDIVIDUAL_OPTIONS = OPTIONS.filter((o) => o !== ALL_ABOVE);

interface SurveyBlindsideScreenProps {
  onNext: () => void;
}

export function SurveyBlindsideScreen({ onNext }: SurveyBlindsideScreenProps) {
  const surveyBlindsides = useOnboardingStore((s) => s.surveyBlindsides);
  const toggleSurveyBlindside = useOnboardingStore((s) => s.toggleSurveyBlindside);

  const handleToggle = useCallback(
    (value: string) => {
      if (value === ALL_ABOVE) {
        const allSelected = INDIVIDUAL_OPTIONS.every((o) => surveyBlindsides.includes(o));
        if (allSelected && surveyBlindsides.includes(ALL_ABOVE)) {
          // Deselecting "All of the above" clears everything
          for (const opt of [...surveyBlindsides]) {
            toggleSurveyBlindside(opt);
          }
        } else {
          // Selecting "All of the above" selects all
          for (const opt of OPTIONS) {
            if (!surveyBlindsides.includes(opt)) {
              toggleSurveyBlindside(opt);
            }
          }
        }
      } else {
        toggleSurveyBlindside(value);
        // If deselecting an individual option, also deselect "All of the above"
        if (surveyBlindsides.includes(value) && surveyBlindsides.includes(ALL_ABOVE)) {
          toggleSurveyBlindside(ALL_ABOVE);
        }
        // If selecting this option completes the set, also select "All of the above"
        if (
          !surveyBlindsides.includes(value) &&
          INDIVIDUAL_OPTIONS.every(
            (o) => o === value || surveyBlindsides.includes(o),
          ) &&
          !surveyBlindsides.includes(ALL_ABOVE)
        ) {
          toggleSurveyBlindside(ALL_ABOVE);
        }
      }
    },
    [surveyBlindsides, toggleSurveyBlindside],
  );

  return (
    <OnboardingShell step={7}>
      <ScreenTransition step={7}>
        <Text style={styles.label}>{'last one \u00B7 5 of 6'}</Text>
        <Text style={styles.h2}>What would break your heart to discover too late?</Text>
        <Text style={styles.body}>The question nobody wants to answer out loud.</Text>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <ScrapbookChip
              key={option}
              label={option}
              selected={surveyBlindsides.includes(option)}
              onPress={() => handleToggle(option)}
              showCheckmark
            />
          ))}
        </View>

        <Text style={styles.note}>This is exactly why we built PupLog.</Text>

        <View style={styles.buttonContainer}>
          <ScrapbookButton
            label="Submit answers"
            onPress={onNext}
            hapticType="success"
            disabled={surveyBlindsides.length === 0}
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
  note: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: 14,
    fontStyle: 'italic',
    color: OB_COLORS.ink2,
    marginTop: OB_SPACING.gap3,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: OB_SPACING.sectionGap,
  },
});
