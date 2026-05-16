import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_SHADOWS } from '../../constants/onboardingTheme';

interface NavButtonProps {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
}

export function NavButton({ label, icon, onPress }: NavButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.chevron}>{'›'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: OB_COLORS.peachSoft,
    borderRadius: 14,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    ...OB_SHADOWS.card,
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    textAlign: 'left',
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
