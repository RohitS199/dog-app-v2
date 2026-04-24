import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
  OB_SPACING,
} from '../../constants/onboardingTheme';

interface SocialProofScreenProps {
  onNext: () => void;
}

export function SocialProofScreen({ onNext }: SocialProofScreenProps) {
  return (
    <OnboardingShell step={2}>
      <ScreenTransition step={2}>
        <View style={styles.content}>
          <Text style={styles.heading}>
            You{'\''}re in good company
          </Text>

          {/* Two stat cards side by side */}
          <View style={styles.statRow}>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>180k</Text>
              <Text style={styles.statLabel}>dogs logged daily</Text>
            </View>
            <View style={[styles.statCard, styles.statCardHalf]}>
              <Text style={styles.statValue}>4.9{'\u2605'}</Text>
              <Text style={styles.statLabel}>41k reviews</Text>
            </View>
          </View>

          {/* Full-width stat card */}
          <View style={[styles.statCard, styles.statCardFull]}>
            <Text style={styles.statValue}>73%</Text>
            <Text style={styles.statLabel}>
              caught something early their vet confirmed
            </Text>
          </View>

          {/* Quote */}
          <View style={styles.quoteWrapper}>
            <Text style={styles.quote}>
              {'"Finally an app that listens to dog parents."'}
            </Text>
            <Text style={styles.attribution}>
              {'— Dr. Laila Shah, DVM'}
            </Text>
          </View>

          <View style={styles.spacer} />
          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="Let's start"
              onPress={onNext}
              testID="social-proof-next-button"
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
    marginBottom: OB_SPACING.gap4,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
  },
  statRow: {
    flexDirection: 'row',
    gap: OB_SPACING.gap2,
    marginBottom: OB_SPACING.gap2,
  },
  statCard: {
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    backgroundColor: OB_COLORS.cream,
    padding: OB_SPACING.cardPadding,
    alignItems: 'center',
    ...OB_SHADOWS.card,
  },
  statCardHalf: {
    flex: 1,
  },
  statCardFull: {
    marginBottom: OB_SPACING.gap4,
  },
  statValue: {
    fontFamily: OB_FONTS.h1,
    fontSize: 26,
    color: OB_COLORS.accent,
    lineHeight: 26 * 1.15,
    marginBottom: OB_SPACING.mt1,
  },
  statLabel: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    textAlign: 'center',
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  quoteWrapper: {
    alignItems: 'center',
    marginBottom: OB_SPACING.gap4,
    paddingHorizontal: OB_SPACING.mt4,
  },
  quote: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: OB_FONT_SIZES.body * 1.55,
    marginBottom: OB_SPACING.mt2,
  },
  attribution: {
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
    textAlign: 'center',
  },
  spacer: {
    flex: 1,
  },
  buttonWrapper: {
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});
