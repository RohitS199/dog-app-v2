import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { LEGAL } from '../../constants/config';

interface DisclaimerFooterProps {
  text?: string;
}

export function DisclaimerFooter({ text }: DisclaimerFooterProps) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={styles.icon}>⚕️</Text>
      <Text style={styles.text}>{text ?? LEGAL.DISCLAIMER_TEXT}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  icon: {
    fontSize: FONT_SIZES.md,
    marginRight: SPACING.sm,
  },
  text: {
    flex: 1,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
