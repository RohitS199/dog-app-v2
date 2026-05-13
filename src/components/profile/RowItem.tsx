import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII, OB_SHADOWS } from '../../constants/onboardingTheme';

interface RowItemProps {
  label: string;
  icon?: React.ReactNode;
  chevron?: boolean;
  onPress?: () => void;
}

export function RowItem({ label, icon, chevron = true, onPress }: RowItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.container,
        pressed && onPress && styles.pressed,
      ]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      {chevron ? <Text style={styles.chevron}>{'›'}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: OB_RADII.rowItem,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    ...OB_SHADOWS.card,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    color: OB_COLORS.ink,
  },
  chevron: {
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.cta,
    marginLeft: 8,
  },
});
