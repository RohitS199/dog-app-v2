import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScrapbookChip } from './ScrapbookChip';
import { ScreenTransition } from './ScreenTransition';
import { useOnboardingStore, type HealthBaseline } from '../../stores/onboardingStore';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
} from '../../constants/onboardingTheme';

interface HealthBaselineScreenProps {
  onNext: () => void;
}

const BASELINE_OPTIONS: { label: string; value: HealthBaseline }[] = [
  { label: 'Allergies / itchiness', value: 'allergies' },
  { label: 'Joint / arthritis', value: 'joint_arthritis' },
  { label: 'Anxiety / reactivity', value: 'anxiety' },
  { label: 'Digestive / GI', value: 'digestive' },
  { label: 'Skin / coat', value: 'skin_coat' },
  { label: 'Heart / breathing', value: 'heart_breathing' },
  { label: 'Currently on meds', value: 'on_meds' },
  { label: 'None of these', value: 'none' },
];

export function HealthBaselineScreen({ onNext }: HealthBaselineScreenProps) {
  const store = useOnboardingStore();
  const { healthBaseline } = store.dogProfile;

  const canContinue = healthBaseline.length > 0;

  return (
    <OnboardingShell step={11}>
      <ScreenTransition step={11}>
        <View style={styles.content}>
          <Text style={styles.heading}>Starting point</Text>

          <Text style={styles.body}>
            So we notice when anything shifts. Based on AAHA vet screening.
          </Text>

          <View style={styles.chipList}>
            {BASELINE_OPTIONS.map((option) => (
              <ScrapbookChip
                key={option.value}
                label={option.label}
                selected={healthBaseline.includes(option.value)}
                onPress={() => store.toggleHealthBaseline(option.value)}
                showCheckmark
                testID={`baseline-chip-${option.value}`}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <ScrapbookButton
              label="Continue"
              onPress={onNext}
              disabled={!canContinue}
              testID="baseline-continue-button"
            />
          </View>
        </View>
      </ScreenTransition>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  heading: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
    textAlign: 'center',
    marginBottom: OB_SPACING.paragraphGap,
  },
  body: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.55,
    textAlign: 'center',
    marginBottom: OB_SPACING.sectionGap,
  },
  chipList: {
    gap: OB_SPACING.gap2,
  },
  buttonContainer: {
    marginTop: OB_SPACING.sectionGap,
  },
});
