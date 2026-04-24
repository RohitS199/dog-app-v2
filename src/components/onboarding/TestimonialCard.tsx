import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
  OB_SPACING,
} from '../../constants/onboardingTheme';

interface TestimonialCardProps {
  name: string;
  subtitle: string;
  quote: string;
  stars: number;
  bgColor?: string;
}

export function TestimonialCard({
  name,
  subtitle,
  quote,
  stars,
  bgColor = OB_COLORS.cream,
}: TestimonialCardProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <View
      style={[styles.card, { backgroundColor: bgColor }]}
      accessibilityRole="none"
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      <View style={styles.starRow} accessibilityLabel={`${stars} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, i) => (
          <Text
            key={i}
            style={[styles.star, i < stars && styles.starFilled]}
            accessibilityElementsHidden
          >
            {'\u2605'}
          </Text>
        ))}
      </View>

      <Text style={styles.quote}>{`"${quote}"`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.mt4,
    ...OB_SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: OB_SPACING.mt2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: OB_COLORS.peach,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: OB_SPACING.mt2,
  },
  avatarText: {
    fontFamily: OB_FONTS.h3,
    fontSize: OB_FONT_SIZES.h3,
    color: OB_COLORS.ink,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontFamily: OB_FONTS.h3,
    fontSize: OB_FONT_SIZES.h3,
    color: OB_COLORS.ink,
  },
  subtitle: {
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.ink2,
  },
  starRow: {
    flexDirection: 'row',
    marginBottom: OB_SPACING.mt2,
  },
  star: {
    fontSize: 14,
    color: OB_COLORS.muted,
    marginRight: 2,
  },
  starFilled: {
    color: OB_COLORS.accent,
  },
  quote: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    fontStyle: 'italic',
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
});
