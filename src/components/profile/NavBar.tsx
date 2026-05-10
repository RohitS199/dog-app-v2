import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS } from '../../constants/onboardingTheme';

interface NavBarProps {
  title: string;
  back?: boolean;
  onBackPress?: () => void;
}

const HEADER_HEIGHT = 44;

export function NavBar({ title, back = true, onBackPress }: NavBarProps) {
  return (
    <View style={styles.container} accessibilityRole="header">
      <View style={styles.side}>
        {back ? (
          <Pressable
            onPress={onBackPress}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
          >
            <Text style={styles.chevron}>{'‹'}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  side: {
    width: 44,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backBtn: {
    width: 44,
    height: HEADER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backPressed: {
    opacity: 0.6,
  },
  chevron: {
    fontFamily: OB_FONTS.h1,
    fontSize: 24,
    color: OB_COLORS.cta,
    lineHeight: 24,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: OB_FONTS.h2,
    fontSize: 18,
    color: OB_COLORS.ink,
  },
});
