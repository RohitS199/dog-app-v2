import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { OffTopicResponse } from '../../types/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';

interface OffTopicResultProps {
  result: OffTopicResponse;
  onTryAgain: () => void;
}

export function OffTopicResult({ result, onTryAgain }: OffTopicResultProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon} accessibilityElementsHidden>🐾</Text>
        <Text style={styles.message}>{result.message}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.tryAgainButton,
          pressed && styles.pressed,
        ]}
        onPress={onTryAgain}
        accessibilityRole="button"
        accessibilityLabel="Try again with different symptoms"
      >
        <Text style={styles.tryAgainText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  message: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  tryAgainButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  tryAgainText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
