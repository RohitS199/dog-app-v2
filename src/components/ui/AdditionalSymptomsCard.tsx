import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../constants/theme';
import { ADDITIONAL_SYMPTOMS_OPTIONS } from '../../constants/checkInQuestions';
import type { AdditionalSymptom } from '../../types/checkIn';

interface AdditionalSymptomsCardProps {
  selectedSymptoms: AdditionalSymptom[];
  onToggle: (symptom: AdditionalSymptom) => void;
}

export function AdditionalSymptomsCard({
  selectedSymptoms,
  onToggle,
}: AdditionalSymptomsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        Is your dog experiencing any of these additional symptoms?
      </Text>
      <Text style={styles.hint}>Select all that apply, or "None of these"</Text>

      <View style={styles.chips}>
        {ADDITIONAL_SYMPTOMS_OPTIONS.map((option) => {
          const isSelected = selectedSymptoms.includes(option.value);
          const isNone = option.value === 'none';
          return (
            <Pressable
              key={option.value}
              style={[
                styles.chip,
                isSelected && styles.selectedChip,
                isNone && styles.noneChip,
                isNone && isSelected && styles.selectedNoneChip,
              ]}
              onPress={() => onToggle(option.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={option.label}
            >
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.selectedChipText,
                  isNone && styles.noneChipText,
                  isNone && isSelected && styles.selectedNoneChipText,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  selectedChip: {
    backgroundColor: COLORS.accentLight,
    borderColor: COLORS.accent,
  },
  noneChip: {
    borderStyle: 'dashed',
  },
  selectedNoneChip: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.primary,
    borderStyle: 'solid',
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  selectedChipText: {
    fontWeight: '600',
    color: COLORS.accent,
  },
  noneChipText: {
    color: COLORS.textSecondary,
  },
  selectedNoneChipText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
