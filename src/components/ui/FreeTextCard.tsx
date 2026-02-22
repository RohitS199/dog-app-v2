import { useState, useRef, useCallback, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CHECK_IN } from '../../constants/config';
import { LIMITS } from '../../constants/config';
import { detectEmergencyKeywords } from '../../lib/emergencyKeywords';
import { EmergencyAlert } from './EmergencyAlert';

interface FreeTextCardProps {
  value: string | null;
  onChange: (text: string) => void;
}

export function FreeTextCard({ value, onChange }: FreeTextCardProps) {
  const [emergencyMatches, setEmergencyMatches] = useState<string[]>([]);
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const text = value ?? '';
  const remaining = CHECK_IN.FREE_TEXT_MAX_CHARS - text.length;

  const handleTextChange = useCallback(
    (newText: string) => {
      onChange(newText);

      // Debounced emergency keyword detection
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
        if (newText.trim()) {
          const result = detectEmergencyKeywords(newText);
          setEmergencyMatches(result.matchedPatterns);
          if (result.matchedPatterns.length > 0) {
            setEmergencyDismissed(false);
          }
        } else {
          setEmergencyMatches([]);
        }
      }, LIMITS.EMERGENCY_DEBOUNCE_MS);
    },
    [onChange]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        Anything else you want to note?
      </Text>
      <Text style={styles.hint}>
        Optional: Add any details that might be helpful
      </Text>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={handleTextChange}
        placeholder="e.g., Started after eating something in the yard..."
        placeholderTextColor={COLORS.textDisabled}
        multiline
        maxLength={CHECK_IN.FREE_TEXT_MAX_CHARS}
        accessibilityLabel="Additional notes about your dog"
      />

      <Text
        style={[
          styles.charCount,
          remaining < 50 && styles.charCountDanger,
          remaining < 100 && remaining >= 50 && styles.charCountWarning,
        ]}
      >
        {remaining} characters remaining
      </Text>

      {emergencyMatches.length > 0 && !emergencyDismissed && (
        <View style={styles.alertWrapper}>
          <EmergencyAlert
            matchedPatterns={emergencyMatches}
            onDismiss={() => setEmergencyDismissed(true)}
          />
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
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  charCountWarning: {
    color: COLORS.warning,
  },
  charCountDanger: {
    color: COLORS.error,
  },
  alertWrapper: {
    marginTop: SPACING.md,
  },
});
