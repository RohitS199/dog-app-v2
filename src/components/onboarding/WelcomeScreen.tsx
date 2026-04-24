import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { BiscuitMascot } from './BiscuitMascot';
import { ScreenTransition } from './ScreenTransition';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
} from '../../constants/onboardingTheme';

interface WelcomeScreenProps {
  onNext: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onNext, onSignIn }: WelcomeScreenProps) {
  return (
    <OnboardingShell step={0} showProgress={false}>
      <ScreenTransition step={0}>
        <View style={styles.content}>
          <View style={styles.centerSection}>
            <View style={styles.mascotWrapper}>
              <BiscuitMascot size="lg" />
            </View>

            <Text style={styles.headline}>
              You just took the first step.
            </Text>

            <Text style={styles.body}>
              Dogs who have a daily observer live longer, calmer lives. You{'\''}re here. That matters.
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <ScrapbookButton
              label="Begin"
              onPress={onNext}
              hapticType="success"
              testID="welcome-begin-button"
            />

            <Pressable
              onPress={onSignIn}
              style={styles.signInLink}
              accessibilityRole="link"
              accessibilityLabel="I already have an account"
              hitSlop={12}
            >
              <Text style={styles.signInText}>
                I already have an account
              </Text>
              <View style={styles.wavyUnderline} />
            </Pressable>
          </View>
        </View>
      </ScreenTransition>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotWrapper: {
    marginBottom: OB_SPACING.mascotPadding,
    alignItems: 'center',
  },
  headline: {
    fontFamily: OB_FONTS.h1,
    fontSize: 28,
    color: OB_COLORS.ink,
    textAlign: 'center',
    lineHeight: 28 * 1.15,
    marginBottom: OB_SPACING.mt3,
  },
  body: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    textAlign: 'center',
    lineHeight: OB_FONT_SIZES.body * 1.55,
    paddingHorizontal: OB_SPACING.mt4,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: OB_SPACING.screenPaddingBottom,
    gap: OB_SPACING.mt4,
  },
  signInLink: {
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  signInText: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: 16,
    color: OB_COLORS.ink2,
  },
  wavyUnderline: {
    width: '80%',
    height: 2,
    backgroundColor: OB_COLORS.ink2,
    marginTop: 2,
    borderRadius: 1,
    opacity: 0.5,
  },
});
