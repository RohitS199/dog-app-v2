import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';

type StepperDotsProps = {
  totalSteps: number;
  currentStep: number; // 0-indexed
  label?: string;
};

export function StepperDots({ totalSteps, currentStep, label }: StepperDotsProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;

          return (
            <View
              key={i}
              style={[
                styles.dot,
                isCompleted && styles.completed,
                isActive && styles.active,
                !isCompleted && !isActive && styles.inactive,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: '500',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  completed: {
    width: 8,
    backgroundColor: COLORS.accent,
  },
  active: {
    width: 24,
    backgroundColor: COLORS.accent,
  },
  inactive: {
    width: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
});
