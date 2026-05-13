import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';

interface PerkRowProps {
  text: string;
}

export function PerkRow({ text }: PerkRowProps) {
  return (
    <View style={styles.container}>
      <View style={styles.checkCircle} accessibilityLabel="Included perk">
        <Text style={styles.checkMark}>{'✓'}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: OB_COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.ink,
  },
});
