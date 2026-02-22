import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import { CHECK_IN_QUESTIONS, ADDITIONAL_SYMPTOMS_OPTIONS } from '../../constants/checkInQuestions';
import type { CheckInDraft } from '../../types/checkIn';

interface CheckInReviewProps {
  draft: CheckInDraft;
  onEditStep: (step: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function CheckInReview({
  draft,
  onEditStep,
  onSubmit,
  isSubmitting,
}: CheckInReviewProps) {
  const getDisplayLabel = (questionIndex: number): string => {
    const question = CHECK_IN_QUESTIONS[questionIndex];
    const value = draft[question.id];
    if (!value) return 'Not answered';
    return question.options.find((o) => o.value === value)?.label ?? String(value);
  };

  const getSymptomsLabel = (): string => {
    if (draft.additional_symptoms.length === 0) return 'None selected';
    if (draft.additional_symptoms.includes('none')) return 'None of these';
    return draft.additional_symptoms
      .map((s) => ADDITIONAL_SYMPTOMS_OPTIONS.find((o) => o.value === s)?.label ?? s)
      .join(', ');
  };

  const allAnswered = CHECK_IN_QUESTIONS.every((q) => draft[q.id] !== null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Review Your Check-In</Text>
      <Text style={styles.subtitle}>Tap any answer to edit</Text>

      <ScrollView style={styles.scroll}>
        {CHECK_IN_QUESTIONS.map((question, index) => (
          <Pressable
            key={question.id}
            style={({ pressed }) => [
              styles.reviewRow,
              pressed && styles.pressedRow,
            ]}
            onPress={() => onEditStep(index)}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${question.question}: ${getDisplayLabel(index)}`}
          >
            <Text style={styles.rowLabel}>{question.question}</Text>
            <Text
              style={[
                styles.rowValue,
                !draft[question.id] && styles.rowValueMissing,
              ]}
            >
              {getDisplayLabel(index)}
            </Text>
          </Pressable>
        ))}

        {/* Additional symptoms - step 7 */}
        <Pressable
          style={({ pressed }) => [
            styles.reviewRow,
            pressed && styles.pressedRow,
          ]}
          onPress={() => onEditStep(7)}
          accessibilityRole="button"
          accessibilityLabel={`Edit additional symptoms: ${getSymptomsLabel()}`}
        >
          <Text style={styles.rowLabel}>Additional symptoms</Text>
          <Text style={styles.rowValue}>{getSymptomsLabel()}</Text>
        </Pressable>

        {/* Free text - step 8 */}
        <Pressable
          style={({ pressed }) => [
            styles.reviewRow,
            pressed && styles.pressedRow,
          ]}
          onPress={() => onEditStep(8)}
          accessibilityRole="button"
          accessibilityLabel={`Edit notes: ${draft.free_text ?? 'No notes added'}`}
        >
          <Text style={styles.rowLabel}>Additional notes</Text>
          <Text style={styles.rowValue} numberOfLines={2}>
            {draft.free_text ?? 'No notes added'}
          </Text>
        </Pressable>
      </ScrollView>

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          pressed && styles.buttonPressed,
          (!allAnswered || isSubmitting) && styles.buttonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!allAnswered || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={isSubmitting ? 'Saving check-in' : 'Save check-in'}
      >
        <Text style={styles.submitText}>
          {isSubmitting ? 'Saving...' : 'Save Check-In'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  scroll: {
    flex: 1,
  },
  reviewRow: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  pressedRow: {
    backgroundColor: COLORS.divider,
  },
  rowLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  rowValueMissing: {
    color: COLORS.error,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
