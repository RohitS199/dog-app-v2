import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';

interface StickerIconProps {
  char: string;
  bg?: string;
  size?: number;
}

export function StickerIcon({ char, bg = OB_COLORS.peach, size = 26 }: StickerIconProps) {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bg, width: size, height: size, borderRadius: size * 0.27 },
      ]}
    >
      <Text style={styles.char}>{char}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  char: {
    fontFamily: OB_FONTS.h1,
    fontSize: 16,
    color: OB_COLORS.woodDk,
    lineHeight: 18,
  },
});
