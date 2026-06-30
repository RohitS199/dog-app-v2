import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
} from '../../constants/onboardingTheme';
import { MIN_TOUCH_TARGET } from '../../constants/theme';

interface AskBiscuitCardProps {
  dogName: string;
  onPress: () => void;
}

export function AskBiscuitCard({ dogName, onPress }: AskBiscuitCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={'Ask Biscuit about ' + dogName + "'s health"}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View
        style={styles.iconCircle}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <MaterialCommunityIcons name="paw" size={26} color={OB_COLORS.cream} />
      </View>
      <View style={styles.textColumn}>
        <Text style={styles.title}>{'Ask Biscuit about ' + dogName}</Text>
        <Text style={styles.subtitle}>
          {'Peek at ' + dogName + "'s health story"}
        </Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={24}
        color={OB_COLORS.wood}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OB_COLORS.cardWhite,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.rowItem,
    padding: 14,
    minHeight: MIN_TOUCH_TARGET,
    ...OB_SHADOWS.card,
  },
  pressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: OB_COLORS.featuredBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontFamily: OB_FONTS.h2,
    fontSize: 17,
    color: OB_COLORS.ink,
  },
  subtitle: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 13,
    color: OB_COLORS.ink2,
    marginTop: 2,
  },
});
