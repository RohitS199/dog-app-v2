import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import type { CheckInQuestion } from '../../constants/checkInQuestions';
import type { DailyCheckIn } from '../../types/checkIn';

interface CheckInCardProps {
  question: CheckInQuestion;
  selectedValue: string | null;
  yesterdayValue?: string | null;
  onSelect: (value: string) => void;
  showAlert?: { message: string } | null;
}

export function CheckInCard({
  question,
  selectedValue,
  yesterdayValue,
  onSelect,
  showAlert,
}: CheckInCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question.question}</Text>

      {yesterdayValue && (
        <Text style={styles.hint}>
          Yesterday: {question.options.find((o) => o.value === yesterdayValue)?.label ?? yesterdayValue}
        </Text>
      )}

      <View style={styles.options}>
        {question.options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.option,
                isSelected && styles.selectedOption,
                pressed && styles.pressedOption,
              ]}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[styles.optionText, isSelected && styles.selectedOptionText]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showAlert && (
        <View style={styles.alertCard} accessibilityRole="alert">
          <Text style={styles.alertText}>{showAlert.message}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  question: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  options: {
    gap: SPACING.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  selectedOption: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentLight,
  },
  pressedOption: {
    opacity: 0.8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  optionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    flex: 1,
  },
  selectedOptionText: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  alertCard: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.md,
  },
  alertText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.emergency,
    fontWeight: '500',
  },
});
