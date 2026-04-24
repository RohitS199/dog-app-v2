import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import { TestimonialCard } from './TestimonialCard';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
} from '../../constants/onboardingTheme';

interface SocialProof2ScreenProps {
  onNext: () => void;
}

const TESTIMONIALS = [
  {
    name: 'Priya',
    subtitle: 'senior lab mom',
    stars: 5,
    quote:
      'Caught Moose\'s kidney issue 3 weeks before our next visit. The AI flagged it. I cried.',
    bgColor: OB_COLORS.cream,
  },
  {
    name: 'Sam',
    subtitle: 'anxious first-timer',
    stars: 5,
    quote:
      'I was a mess. Now I just log and trust the trend. My vet loves the PDF.',
    bgColor: OB_COLORS.cream2,
  },
  {
    name: 'Dr. Patel, DVM',
    subtitle: 'vet partner',
    stars: 5,
    quote:
      'PupLog histories let me cut 20 min off every visit and catch things owners didn\'t know were symptoms.',
    bgColor: OB_COLORS.cream,
  },
] as const;

export function SocialProof2Screen({ onNext }: SocialProof2ScreenProps) {
  return (
    <OnboardingShell step={14}>
      <ScreenTransition step={14}>
        <View style={styles.content}>
          <Text style={styles.heading}>Dog parents like you</Text>

          <View style={styles.cardList}>
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                name={testimonial.name}
                subtitle={testimonial.subtitle}
                quote={testimonial.quote}
                stars={testimonial.stars}
                bgColor={testimonial.bgColor}
              />
            ))}
          </View>

          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="I'm ready"
              onPress={onNext}
              hapticType="success"
              testID="social-proof-2-next-button"
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
  cardList: {
    gap: OB_SPACING.gap2,
  },
  buttonWrapper: {
    marginTop: OB_SPACING.gap4,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});
