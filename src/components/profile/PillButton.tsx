import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
} from '../../constants/onboardingTheme';

type PillVariant = 'logout' | 'primary' | 'ghost';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  variant?: PillVariant;
  disabled?: boolean;
}

export function PillButton({ label, onPress, variant = 'logout', disabled }: PillButtonProps) {
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        isPrimary && styles.primary,
        (variant === 'logout' || isGhost) && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary && styles.primaryText,
          (variant === 'logout' || isGhost) && styles.ghostText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: OB_RADII.pillBtn,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
  },
  primary: { backgroundColor: OB_COLORS.cta },
  ghost: {
    backgroundColor: OB_COLORS.cream,
    borderColor: OB_COLORS.cta,
    borderWidth: 2.5,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  label: {
    fontFamily: OB_FONTS.h3,
    fontSize: 17,
  },
  primaryText: { color: OB_COLORS.ctaText },
  ghostText: { color: OB_COLORS.cta },
});
