import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import { SignaturePad } from './SignaturePad';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
  OB_SPACING,
} from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface PromiseScreenProps {
  onNext: () => void;
}

const MIN_SIGNATURE_POINTS = 10;

function hasEnoughPoints(pathData: string | null): boolean {
  if (!pathData) return false;
  // Count the number of control points: M counts as 1, each Q adds 1, L adds 1
  const matches = pathData.match(/[MQL]/g);
  return matches ? matches.length >= MIN_SIGNATURE_POINTS : false;
}

export function PromiseScreen({ onNext }: PromiseScreenProps) {
  const dogName = useOnboardingStore((s) => s.dogProfile.name) || 'your pup';
  const signaturePathData = useOnboardingStore((s) => s.signaturePathData);
  const setSignaturePathData = useOnboardingStore((s) => s.setSignaturePathData);

  const canContinue = hasEnoughPoints(signaturePathData);

  const handlePathChange = useCallback(
    (pathData: string) => {
      setSignaturePathData(pathData || null);
    },
    [setSignaturePathData],
  );

  return (
    <OnboardingShell step={15}>
      <ScreenTransition step={15}>
        <View style={styles.content}>
          <Text style={styles.h2}>A small promise</Text>

          <View style={styles.card}>
            <Text style={styles.promiseText}>
              I promise to show up for{' '}
              <Text style={styles.nameHighlight}>{dogName}</Text>
              {' '}for two minutes a day {'\u2014'} because the small things are the whole thing.
            </Text>

            <View style={styles.signatureArea}>
              <SignaturePad
                onPathChange={handlePathChange}
                pathData={signaturePathData}
              />
            </View>

            <Text style={styles.signLabel}>sign with your fingertip</Text>
          </View>

          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="I promise"
              onPress={onNext}
              disabled={!canContinue}
              hapticType="success"
              testID="promise-next-button"
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
  h2: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    marginBottom: OB_SPACING.gap4,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
  },
  card: {
    backgroundColor: OB_COLORS.cream2,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    ...OB_SHADOWS.card,
  },
  promiseText: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.45,
    marginBottom: OB_SPACING.gap4,
  },
  nameHighlight: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: OB_FONT_SIZES.body + 1,
    color: OB_COLORS.accent,
  },
  signatureArea: {
    marginBottom: OB_SPACING.mt2,
  },
  signLabel: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginTop: 'auto' as any,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});
