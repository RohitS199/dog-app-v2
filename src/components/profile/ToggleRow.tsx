import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_BORDERS, OB_COLORS, OB_FONTS, OB_RADII, OB_SHADOWS } from '../../constants/onboardingTheme';
import { Toggle } from './Toggle';

interface ToggleRowProps {
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  value: boolean;
  onValueChange: (next: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({ label, sub, icon, value, onValueChange, disabled }: ToggleRowProps) {
  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled: !!disabled }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.container, pressed && !disabled && styles.pressed]}
    >
      {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      <View style={styles.textStack}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {sub ? (
          <Text style={styles.sub} numberOfLines={1}>
            {sub}
          </Text>
        ) : null}
      </View>
      {/* pointerEvents="none" kills the nested-Pressable containment trap.
          accessibilityElementsHidden + importantForAccessibility hide the inner
          Toggle's own switch role from the accessibility tree on iOS and Android
          respectively, so screen readers see exactly one switch per row. */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden={true}
        importantForAccessibility="no-hide-descendants"
      >
        <Toggle value={value} onValueChange={onValueChange} disabled={disabled} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
  textStack: { flex: 1 },
  label: {
    fontFamily: OB_FONTS.body,
    fontSize: 15,
    color: OB_COLORS.ink,
  },
  sub: {
    fontFamily: OB_FONTS.body,
    fontSize: 12,
    color: OB_COLORS.ink2,
    marginTop: 2,
  },
});
