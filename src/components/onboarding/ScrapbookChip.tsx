import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { haptic } from '../../lib/haptics';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';

interface ScrapbookChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  showCheckmark?: boolean;
  testID?: string;
}

export function ScrapbookChip({
  label,
  selected,
  onPress,
  showCheckmark = false,
  testID,
}: ScrapbookChipProps) {
  const handlePress = useCallback(() => {
    haptic('light');
    onPress();
  }, [onPress]);

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.chip,
        selected ? styles.chipSelected : styles.chipGhost,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      testID={testID}
    >
      <Text
        style={[
          styles.text,
          selected && styles.textSelected,
        ]}
      >
        {label}
      </Text>
      {showCheckmark && (
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Text style={styles.checkmark}>{'✓'}</Text>}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.chip,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 44,
  },
  chipGhost: {
    backgroundColor: OB_COLORS.cream,
  },
  chipSelected: {
    backgroundColor: OB_COLORS.selectedBg,
    borderColor: OB_COLORS.selectedBorder,
  },
  text: {
    fontFamily: OB_FONTS.option,
    fontSize: OB_FONT_SIZES.option,
    color: OB_COLORS.ink,
    flex: 1,
  },
  textSelected: {
    color: OB_COLORS.ink,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: OB_COLORS.sketch,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkboxSelected: {
    backgroundColor: OB_COLORS.accent,
    borderColor: OB_COLORS.accent,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
