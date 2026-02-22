import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import { CHECK_IN_QUESTIONS, ADDITIONAL_SYMPTOMS_OPTIONS } from '../../constants/checkInQuestions';
import type { DailyCheckIn } from '../../types/checkIn';

interface DayDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  checkIn: DailyCheckIn | null;
  previousCheckIn?: DailyCheckIn | null;
  dateString: string;
}

function getLabel(questionIndex: number, value: string): string {
  const question = CHECK_IN_QUESTIONS[questionIndex];
  return question.options.find((o) => o.value === value)?.label ?? value;
}

function FieldRow({
  label,
  value,
  previousValue,
}: {
  label: string;
  value: string;
  previousValue?: string;
}) {
  const changed = previousValue && previousValue !== value;
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldValueRow}>
        <Text style={styles.fieldValue}>{value}</Text>
        {changed && (
          <Text style={styles.changeIndicator}>
            (was: {previousValue})
          </Text>
        )}
      </View>
    </View>
  );
}

export function DayDetailSheet({
  visible,
  onClose,
  checkIn,
  previousCheckIn,
  dateString,
}: DayDetailSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} accessibilityLabel="Close day details">
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          <View style={styles.handle} />
          <Text style={styles.title}>{dateString}</Text>

          {!checkIn ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No check-in recorded for this day.</Text>
            </View>
          ) : (
            <ScrollView style={styles.scroll}>
              {CHECK_IN_QUESTIONS.map((q, i) => (
                <FieldRow
                  key={q.id}
                  label={q.question}
                  value={getLabel(i, checkIn[q.id])}
                  previousValue={previousCheckIn ? getLabel(i, previousCheckIn[q.id]) : undefined}
                />
              ))}

              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Additional symptoms</Text>
                <Text style={styles.fieldValue}>
                  {checkIn.additional_symptoms.length === 0
                    ? 'None'
                    : checkIn.additional_symptoms
                        .map((s) => ADDITIONAL_SYMPTOMS_OPTIONS.find((o) => o.value === s)?.label ?? s)
                        .join(', ')}
                </Text>
              </View>

              {checkIn.free_text && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Notes</Text>
                  <Text style={styles.fieldValue}>{checkIn.free_text}</Text>
                </View>
              )}
            </ScrollView>
          )}

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  scroll: {
    flex: 1,
  },
  fieldRow: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  fieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  fieldValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  changeIndicator: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
    fontStyle: 'italic',
  },
  emptyState: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  closeButton: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
