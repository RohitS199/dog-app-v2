import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { BiscuitMascot } from './BiscuitMascot';
import { TypewriterText } from './TypewriterText';
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

interface BiscuitIntroScreenProps {
  onNext: () => void;
}

export function BiscuitIntroScreen({ onNext }: BiscuitIntroScreenProps) {
  return (
    <OnboardingShell step={8}>
      <ScreenTransition step={8}>
        <View style={styles.content}>
          <View style={styles.mascotWrapper}>
            <BiscuitMascot size="md" />
          </View>

          {/* First speech bubble */}
          <View style={styles.bubbleWrapper}>
            <View style={styles.bubbleTail} />
            <View style={styles.bubble}>
              <Text style={styles.bubbleTitle}>I{'\''}m Biscuit.</Text>
              <TypewriterText
                text="My first human missed the signs. My second didn't — that's the whole reason this app exists."
                charDelay={24}
                style={styles.typewriterStyle}
              />
            </View>
          </View>

          {/* Second speech bubble */}
          <View style={styles.bubbleWrapper}>
            <View style={styles.bubbleTail} />
            <View style={styles.bubble}>
              <Text style={styles.bubbleBody}>
                I won{'\''}t nag. I{'\''}ll only speak up when your pup{'\''}s flowers tell me to.
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />
          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="Hi Biscuit"
              onPress={onNext}
              hapticType="success"
              testID="biscuit-intro-next-button"
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
  mascotWrapper: {
    alignItems: 'flex-start',
    marginBottom: OB_SPACING.mascotPadding,
  },
  bubbleWrapper: {
    marginLeft: OB_SPACING.gap4,
    marginBottom: OB_SPACING.gap3,
    position: 'relative',
  },
  bubble: {
    backgroundColor: OB_COLORS.cream,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    ...OB_SHADOWS.card,
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 14,
    width: 14,
    height: 14,
    backgroundColor: OB_COLORS.cream,
    borderLeftWidth: OB_BORDERS.standard,
    borderBottomWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    transform: [{ rotate: '45deg' }],
    zIndex: 1,
  },
  bubbleTitle: {
    fontFamily: OB_FONTS.h3,
    fontSize: OB_FONT_SIZES.h3,
    color: OB_COLORS.ink,
    marginBottom: OB_SPACING.mt2,
  },
  typewriterStyle: {
    minHeight: 40,
  },
  bubbleBody: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  spacer: {
    flex: 1,
  },
  buttonWrapper: {
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});
