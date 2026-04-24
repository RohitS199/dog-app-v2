import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
} from '../../constants/onboardingTheme';

interface LifeStageLabelProps {
  name: string;
  lifeStage: string;
  ageText: string;
}

export function LifeStageLabel({ name, lifeStage, ageText }: LifeStageLabelProps) {
  return (
    <View style={styles.container} accessibilityLabel={`${name} is a ${lifeStage}, ${ageText}`}>
      <Text style={styles.emoji} accessibilityElementsHidden>
        {'🐕'}
      </Text>
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {'That makes '}
          {name}
          {' a '}
          <Text style={styles.lifeStage}>{lifeStage}</Text>
        </Text>
        <Text style={styles.age}>{ageText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  textContainer: {
    flexShrink: 1,
  },
  text: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  lifeStage: {
    color: OB_COLORS.accent,
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.body,
  },
  age: {
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
    marginTop: 2,
  },
});
