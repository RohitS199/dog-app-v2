import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OB_COLORS, OB_FONTS, OB_FONT_SIZES } from '../../constants/onboardingTheme';

// Always-on Golden-Rule surface on the Journey screen — routes to the emergency
// resources screen. Never let an owner walk away from a genuine emergency (spec §13).
export function EmergencyChip() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/emergency')}
      hitSlop={12}
      accessibilityRole="link"
      accessibilityLabel="Emergency help"
      style={styles.chip}
    >
      <Text style={styles.text}>⚠ Emergency</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 6, minHeight: 32, justifyContent: 'center' },
  text: { color: OB_COLORS.red, fontFamily: OB_FONTS.label, fontSize: OB_FONT_SIZES.label + 2 },
});
