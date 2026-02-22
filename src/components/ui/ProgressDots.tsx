import { StyleSheet, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

interface ProgressDotsProps {
  totalSteps: number;
  currentStep: number;
}

export function ProgressDots({ totalSteps, currentStep }: ProgressDotsProps) {
  return (
    <View style={styles.container} accessibilityLabel={`Step ${currentStep + 1} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === currentStep && styles.activeDot,
            i < currentStep && styles.completedDot,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
  },
  completedDot: {
    backgroundColor: COLORS.primary,
  },
});
