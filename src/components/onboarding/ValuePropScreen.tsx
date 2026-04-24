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

interface ValuePropScreenProps {
  onNext: () => void;
}

const VALUE_PROPS = [
  {
    icon: '\uD83D\uDCD4',
    title: '2-min daily journal',
    description: '4 questions, tuned to your dog',
  },
  {
    icon: '\uD83C\uDF3B',
    title: 'Grow their garden',
    description: 'A flower each day \u2014 a year of love',
  },
  {
    icon: '\uD83E\uDDE0',
    title: 'Weekly AI reads',
    description: 'We spot trends you\'d miss',
  },
  {
    icon: '\uD83E\uDE7A',
    title: 'Vet-ready PDF',
    description: 'One tap share with your vet',
  },
] as const;

export function ValuePropScreen({ onNext }: ValuePropScreenProps) {
  return (
    <OnboardingShell step={1}>
      <ScreenTransition step={1}>
        <View style={styles.content}>
          <Text style={styles.heading}>
            Here{'\''}s what we{'\''}ll do together
          </Text>

          <View style={styles.cardList}>
            {VALUE_PROPS.map((prop, index) => (
              <View
                key={prop.title}
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      index % 2 === 0 ? OB_COLORS.cream : OB_COLORS.cream2,
                  },
                ]}
                accessibilityRole="none"
              >
                <Text
                  style={styles.icon}
                  accessibilityElementsHidden
                >
                  {prop.icon}
                </Text>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>{prop.title}</Text>
                  <Text style={styles.cardDescription}>
                    {prop.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="Sounds good"
              onPress={onNext}
              testID="value-prop-next-button"
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    ...OB_SHADOWS.card,
  },
  icon: {
    fontSize: 24,
    marginRight: OB_SPACING.mt4,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: OB_FONTS.h3,
    fontSize: OB_FONT_SIZES.h3,
    color: OB_COLORS.ink,
    marginBottom: 2,
  },
  cardDescription: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  buttonWrapper: {
    marginTop: OB_SPACING.gap4,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});
