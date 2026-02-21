import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTriageStore } from '../../src/stores/triageStore';
import { useDogStore } from '../../src/stores/dogStore';
import { useNetworkStatus } from '../../src/hooks/useNetworkStatus';
import {
  detectEmergencyKeywords,
  type EmergencyDetectionResult,
} from '../../src/lib/emergencyKeywords';
import { DogSelector } from '../../src/components/ui/DogSelector';
import { EmergencyAlert } from '../../src/components/ui/EmergencyAlert';
import { LoadingScreen } from '../../src/components/ui/LoadingScreen';
import { TriageResult } from '../../src/components/ui/TriageResult';
import { OffTopicResult } from '../../src/components/ui/OffTopicResult';
import { OfflineBanner } from '../../src/components/ui/OfflineBanner';
import { TriageNudge } from '../../src/components/ui/TriageNudge';
import { DisclaimerFooter } from '../../src/components/legal';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MIN_TOUCH_TARGET } from '../../src/constants/theme';
import { LIMITS } from '../../src/constants/config';

export default function TriageScreen() {
  const router = useRouter();
  const isConnected = useNetworkStatus();
  const [showDogSelector, setShowDogSelector] = useState(false);
  const [emergencyDetection, setEmergencyDetection] =
    useState<EmergencyDetectionResult>({ isEmergency: false, matchedPatterns: [] });
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);

  const { symptoms, isLoading, result, error, nudgeDismissed, setSymptoms, submitSymptoms, clearResult, dismissNudge, getRecentTriageCount } =
    useTriageStore();
  const { dogs, selectedDogId } = useDogStore();
  const selectedDog = dogs.find((d) => d.id === selectedDogId);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced emergency keyword detection
  const handleSymptomsChange = useCallback(
    (text: string) => {
      setSymptoms(text);
      setEmergencyDismissed(false);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        const detection = detectEmergencyKeywords(text);
        setEmergencyDetection(detection);
      }, LIMITS.EMERGENCY_DEBOUNCE_MS);
    },
    [setSymptoms]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSubmit = () => {
    if (!selectedDogId || !symptoms.trim() || isLoading) return;
    submitSymptoms(selectedDogId);
  };

  const handleNewCheck = () => {
    clearResult();
    setEmergencyDetection({ isEmergency: false, matchedPatterns: [] });
    setEmergencyDismissed(false);
  };

  // Show loading screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show result screen
  if (result) {
    if (result.type === 'off_topic') {
      return (
        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <View style={styles.resultHeader}>
            <Pressable
              style={styles.newCheckButton}
              onPress={handleNewCheck}
              accessibilityRole="button"
              accessibilityLabel="Start a new symptom check"
            >
              <Text style={styles.newCheckText}>← New Check</Text>
            </Pressable>
          </View>
          <OffTopicResult result={result} onTryAgain={handleNewCheck} />
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.resultHeader}>
          <Pressable
            style={styles.newCheckButton}
            onPress={handleNewCheck}
            accessibilityRole="button"
            accessibilityLabel="Start a new symptom check"
          >
            <Text style={styles.newCheckText}>← New Check</Text>
          </Pressable>
          {result.urgency === 'emergency' && (
            <Pressable
              style={styles.emergencyButton}
              onPress={() => router.push('/emergency')}
              accessibilityRole="button"
              accessibilityLabel="Go to emergency resources"
            >
              <Text style={styles.emergencyButtonText}>Emergency</Text>
            </Pressable>
          )}
        </View>
        <TriageResult result={result} vetPhone={selectedDog?.vet_phone ?? null} />
      </SafeAreaView>
    );
  }

  // Symptom input screen
  const charsRemaining = LIMITS.SYMPTOM_MAX_CHARS - symptoms.length;
  const canSubmit = symptoms.trim().length > 0 && selectedDogId && isConnected;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {!isConnected && <OfflineBanner />}

      {!nudgeDismissed && (
        <TriageNudge
          triageCount={getRecentTriageCount()}
          onDismiss={dismissNudge}
        />
      )}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        {/* Dog selector */}
        <Pressable
          style={styles.dogSelectorRow}
          onPress={() => dogs.length > 1 && setShowDogSelector(true)}
          accessibilityRole={dogs.length > 1 ? 'button' : 'text'}
          accessibilityLabel={
            selectedDog
              ? `Checking symptoms for ${selectedDog.name}. ${dogs.length > 1 ? 'Tap to change.' : ''}`
              : 'No dog selected'
          }
        >
          <Text style={styles.checkingFor}>Checking for: </Text>
          <Text style={styles.dogName}>
            {selectedDog?.name ?? 'No dog selected'}
          </Text>
          {dogs.length > 1 && <Text style={styles.changeText}> (change)</Text>}
        </Pressable>

        {/* Emergency alert */}
        {emergencyDetection.isEmergency && !emergencyDismissed && (
          <EmergencyAlert
            matchedPatterns={emergencyDetection.matchedPatterns}
            onDismiss={() => setEmergencyDismissed(true)}
          />
        )}

        {/* Symptom input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={symptoms}
            onChangeText={handleSymptomsChange}
            placeholder="Describe what's going on with your dog...&#10;&#10;For example: &quot;My dog has been vomiting since this morning and won't eat. She seems tired and her gums look pale.&quot;"
            placeholderTextColor={COLORS.textDisabled}
            multiline
            maxLength={LIMITS.SYMPTOM_MAX_CHARS}
            textAlignVertical="top"
            accessibilityLabel="Describe your dog's symptoms"
          />

          <View style={styles.charCounter}>
            <Text
              style={[
                styles.charText,
                charsRemaining < 200 && styles.charWarning,
                charsRemaining < 50 && styles.charDanger,
              ]}
            >
              {charsRemaining} characters remaining
            </Text>
          </View>
        </View>

        {/* Error message */}
        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        {/* Submit button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && canSubmit && styles.submitPressed,
            !canSubmit && styles.submitDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Check symptoms"
        >
          <Text style={styles.submitText}>Check Symptoms</Text>
        </Pressable>

        <DisclaimerFooter />
      </KeyboardAvoidingView>

      <DogSelector
        visible={showDogSelector}
        onClose={() => setShowDogSelector(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.md,
  },
  dogSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  checkingFor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  dogName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  changeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  inputContainer: {
    flex: 1,
    marginVertical: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    minHeight: 150,
  },
  charCounter: {
    alignItems: 'flex-end',
    marginTop: SPACING.xs,
  },
  charText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textDisabled,
  },
  charWarning: {
    color: COLORS.warning,
  },
  charDanger: {
    color: COLORS.error,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  submitPressed: {
    opacity: 0.8,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  newCheckButton: {
    padding: SPACING.sm,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  newCheckText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  emergencyButton: {
    backgroundColor: COLORS.emergency,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
  },
});
