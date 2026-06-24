import { Text, StyleSheet } from 'react-native';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES } from '../../constants/onboardingTheme';

// Deferred decision (spec §16.5): derive from the week's moods vs AI. v1 = a safe
// static line. Never imply diagnosis or alarm.
export function GardenGreeting({ dogName, plantedCount }: { dogName: string; plantedCount: number }) {
  const line = plantedCount === 0 ? `${dogName}'s garden is ready to grow —` : `${dogName}'s garden this week —`;
  return (
    <Text style={styles.text} accessibilityRole="header">
      {line}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: OB_COLORS.ink,
    fontFamily: OB_FONTS.handwritten,
    fontSize: OB_FONT_SIZES.h1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
});
