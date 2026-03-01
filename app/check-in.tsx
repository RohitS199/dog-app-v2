import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCheckInStore } from '../src/stores/checkInStore';
import { useDogStore } from '../src/stores/dogStore';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, FONTS, MIN_TOUCH_TARGET } from '../src/constants/theme';
import { CHECK_IN_QUESTIONS } from '../src/constants/checkInQuestions';
import { CHECK_IN } from '../src/constants/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ProgressDots } from '../src/components/ui/ProgressDots';
import { CheckInCard } from '../src/components/ui/CheckInCard';
import { AdditionalSymptomsCard } from '../src/components/ui/AdditionalSymptomsCard';
import { FreeTextCard } from '../src/components/ui/FreeTextCard';
import { CheckInReview } from '../src/components/ui/CheckInReview';
import { DaySummaryCard } from '../src/components/ui/DaySummaryCard';
import { DogSelector } from '../src/components/ui/DogSelector';
import { Button } from '../src/components/ui/Button';
import type { MetricField } from '../src/types/checkIn';

type FlowState = 'questions' | 'review' | 'summary';

export default function CheckInScreen() {
  const router = useRouter();
  const [flowState, setFlowState] = useState<FlowState>('questions');
  const [showDogSelector, setShowDogSelector] = useState(false);

  const { dogs, selectedDogId } = useDogStore();
  const selectedDog = dogs.find((d) => d.id === selectedDogId);

  const {
    currentStep,
    draft,
    yesterdayCheckIn,
    isSubmitting,
    error,
    daySummary,
    analyzePatternsResult,
    startCheckIn,
    setAnswer,
    toggleSymptom,
    setFreeText,
    nextStep,
    prevStep,
    goToStep,
    submitCheckIn,
    clearDraft,
  } = useCheckInStore();

  useEffect(() => {
    if (selectedDogId) {
      setFlowState('questions');
      startCheckIn(selectedDogId);
    }
  }, [selectedDogId]);

  const handleNext = () => {
    if (currentStep === 8) {
      setFlowState('review');
    } else {
      nextStep();
    }
  };

  const handleBack = () => {
    if (flowState === 'review') {
      setFlowState('questions');
    } else if (currentStep === 0) {
      router.back();
    } else {
      prevStep();
    }
  };

  const handleEditFromReview = (step: number) => {
    goToStep(step);
    setFlowState('questions');
  };

  const handleSubmit = async () => {
    await submitCheckIn();
    // Only transition to summary if submission succeeded (no error set)
    if (!useCheckInStore.getState().error) {
      setFlowState('summary');
    }
  };

  const handleDone = () => {
    clearDraft();
    router.back();
  };

  // Get inline alert for current question
  const getInlineAlert = (): { message: string } | null => {
    if (!draft) return null;
    if (currentStep === 3 && draft.stool_quality === 'blood') {
      return { message: 'Blood in stool should be evaluated by a vet. Please note this for your next vet visit.' };
    }
    if (currentStep === 4 && draft.vomiting === 'dry_heaving') {
      return { message: 'Dry heaving can be a sign of bloat (GDV), which is a life-threatening emergency. If your dog is actively dry heaving, contact your vet immediately.' };
    }
    return null;
  };

  if (!selectedDog || !draft) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Please select a dog first.</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          {flowState === 'summary' ? (
            <View style={styles.headerSpacer} />
          ) : (
            <Pressable
              style={styles.headerButton}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={flowState === 'review' ? 'Back to questions' : currentStep === 0 ? 'Cancel check-in' : 'Previous question'}
            >
              {currentStep === 0 && flowState === 'questions' ? (
                <Text style={styles.headerButtonText}>Cancel</Text>
              ) : (
                <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.textPrimary} />
              )}
            </Pressable>
          )}

          <View style={styles.headerCenter}>
            {dogs.length > 1 ? (
              <Pressable
                onPress={() => setShowDogSelector(true)}
                accessibilityRole="button"
                accessibilityLabel={`Checking in ${selectedDog.name}. Tap to switch dogs.`}
              >
                <Text style={styles.dogName}>{selectedDog.name}</Text>
              </Pressable>
            ) : (
              <Text style={styles.dogName}>{selectedDog.name}</Text>
            )}
          </View>

          <View style={styles.headerSpacer} />
        </View>

        {/* Progress dots - only during questions */}
        {flowState === 'questions' && (
          <ProgressDots totalSteps={CHECK_IN.QUESTIONS_COUNT} currentStep={currentStep} />
        )}

        {/* Content */}
        <View style={styles.content}>
          {flowState === 'summary' && daySummary ? (
            <DaySummaryCard
              summary={daySummary}
              streak={selectedDog.checkin_streak ?? 0}
              alertsResult={analyzePatternsResult}
              onDone={handleDone}
            />
          ) : flowState === 'review' ? (
            <CheckInReview
              draft={draft}
              onEditStep={handleEditFromReview}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          ) : currentStep <= 6 ? (
            <CheckInCard
              question={CHECK_IN_QUESTIONS[currentStep]}
              selectedValue={draft[CHECK_IN_QUESTIONS[currentStep].id] as string | null}
              yesterdayValue={
                yesterdayCheckIn
                  ? (yesterdayCheckIn[CHECK_IN_QUESTIONS[currentStep].id] as string)
                  : null
              }
              onSelect={(value) =>
                setAnswer(CHECK_IN_QUESTIONS[currentStep].id as MetricField, value)
              }
              showAlert={getInlineAlert()}
            />
          ) : currentStep === 7 ? (
            <AdditionalSymptomsCard
              selectedSymptoms={draft.additional_symptoms}
              onToggle={toggleSymptom}
            />
          ) : (
            <FreeTextCard
              value={draft.free_text}
              onChange={setFreeText}
            />
          )}
        </View>

        {/* Error display */}
        {error && (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}

        {/* Navigation buttons - only during questions */}
        {flowState === 'questions' && (
          <View style={styles.footer}>
            <Button
              title={currentStep === 8 ? 'Review' : 'Next'}
              onPress={handleNext}
              icon="arrow-right"
            />
          </View>
        )}
      </ScrollView>

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
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  headerButton: {
    width: 60,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerButtonText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 60,
  },
  dogName: {
    fontFamily: FONTS.heading,
    fontSize: FONT_SIZES.lg,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  error: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
  footer: {
    paddingTop: SPACING.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  backButton: {
    padding: SPACING.md,
    minHeight: MIN_TOUCH_TARGET,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
