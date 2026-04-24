import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import { RiskSignalCircle } from './RiskSignalCircle';
import { GardenView } from './GardenView';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { getBreedHealthConcerns } from '../../constants/breedHealthData';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';

interface PersonalizedPlanScreenProps {
  onNext: () => void;
}

function getFocusChips(breed: string): string[] {
  if (breed && breed.trim()) {
    const concerns = getBreedHealthConcerns(breed);
    // Check if these are breed-specific (not generic) by comparing first title
    if (concerns.length > 0 && concerns[0].title !== 'Joint Health') {
      return concerns.slice(0, 3).map((c) => c.title);
    }
  }
  return ['daily trends', 'subtle changes', 'wellness baseline'];
}

function getRiskText(
  lifeStage: string | null,
  surveySeverity: string | null
): string {
  const stageLabel = lifeStage ? lifeStage.charAt(0).toUpperCase() + lifeStage.slice(1) : 'Adult';
  const severityNote = surveySeverity === 'high' || surveySeverity === 'very_high'
    ? `${stageLabel} + worry-level high.`
    : `${stageLabel} profile.`;
  return `${severityNote} 72% of dogs in your profile benefit from daily logging.`;
}

export function PersonalizedPlanScreen({ onNext }: PersonalizedPlanScreenProps) {
  const { dogProfile, surveySeverity } = useOnboardingStore();
  const name = dogProfile.name || 'your pup';
  const focusChips = getFocusChips(dogProfile.breed);
  const riskText = getRiskText(dogProfile.lifeStage, surveySeverity);

  return (
    <OnboardingShell step={13}>
      <ScreenTransition step={13}>
        <View style={styles.content}>
          <Text style={styles.heading}>
            {name}{'\''}s plan, ready.
          </Text>
          <Text style={styles.body}>Based on your answers.</Text>

          {/* Card 1: Focus Areas */}
          <View style={[styles.card, { backgroundColor: OB_COLORS.cream }]}>
            <Text style={styles.cardLabel}>focus areas</Text>
            <View style={styles.chipRow}>
              {focusChips.map((chip) => (
                <View key={chip} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Card 2: Risk Signal */}
          <View style={[styles.card, { backgroundColor: OB_COLORS.cream2 }]}>
            <Text style={styles.cardLabel}>your risk signal</Text>
            <View style={styles.riskRow}>
              <RiskSignalCircle percentage={72} />
              <Text style={styles.riskText}>{riskText}</Text>
            </View>
          </View>

          {/* Card 3: Projected Garden */}
          <View style={[styles.card, { backgroundColor: OB_COLORS.cream }]}>
            <Text style={styles.cardLabel}>projected garden</Text>
            <GardenView stage="bloom" />
          </View>

          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="This feels right"
              onPress={onNext}
              testID="personalized-plan-next-button"
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
    textAlign: 'center',
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
  },
  body: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    textAlign: 'center',
    marginTop: OB_SPACING.mt1,
    marginBottom: OB_SPACING.gap4,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  card: {
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    marginBottom: OB_SPACING.mt4,
    ...OB_SHADOWS.card,
  },
  cardLabel: {
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
    textTransform: 'uppercase',
    marginBottom: OB_SPACING.mt2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: OB_SPACING.mt2,
  },
  chip: {
    backgroundColor: OB_COLORS.selectedBg,
    borderWidth: 1,
    borderColor: OB_COLORS.selectedBorder,
    borderRadius: OB_RADII.buttonSm,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  chipText: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.accent,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: OB_SPACING.mt3,
  },
  riskText: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.55,
    flex: 1,
  },
  buttonWrapper: {
    marginTop: OB_SPACING.gap4,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});
