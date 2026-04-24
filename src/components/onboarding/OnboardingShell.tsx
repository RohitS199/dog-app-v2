import React, { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OB_COLORS, OB_SPACING } from '../../constants/onboardingTheme';
import { OnboardingProgressBar } from './OnboardingProgressBar';
import { BackChevron } from './BackChevron';
import { useOnboardingStore } from '../../stores/onboardingStore';

interface OnboardingShellProps {
  step: number;
  showProgress?: boolean;
  showSkip?: boolean;
  onSkip?: () => void;
  scrollable?: boolean;
  children: React.ReactNode;
}

export function OnboardingShell({
  step,
  showProgress = true,
  showSkip = false,
  onSkip,
  scrollable = true,
  children,
}: OnboardingShellProps) {
  const currentStep = useOnboardingStore((s) => s.currentStep);
  const prevStep = useOnboardingStore((s) => s.prevStep);
  const showBack = currentStep > 0;

  const handleBack = useCallback(() => {
    prevStep();
  }, [prevStep]);

  const content = (
    <View style={styles.inner}>
      {showProgress && (
        <View style={styles.header}>
          {showBack && (
            <Pressable
              onPress={handleBack}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
            >
              <BackChevron />
            </Pressable>
          )}
          <OnboardingProgressBar
            step={step}
            showSkip={showSkip}
            onSkip={onSkip}
          />
        </View>
      )}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        <View style={styles.nonScrollContent}>{content}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OB_COLORS.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: OB_SPACING.screenPaddingTop,
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
  nonScrollContent: {
    flex: 1,
    paddingTop: OB_SPACING.screenPaddingTop,
    paddingHorizontal: OB_SPACING.screenPaddingH,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
  inner: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: OB_SPACING.mt2,
    marginBottom: OB_SPACING.mt3,
  },
  backButton: {
    width: 44,
    height: 44,
    marginLeft: OB_SPACING.backChevronOffset,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
