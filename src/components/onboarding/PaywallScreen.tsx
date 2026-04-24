import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_RADII,
  OB_BORDERS,
  OB_SHADOWS,
  OB_SPACING,
} from '../../constants/onboardingTheme';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { haptic } from '../../lib/haptics';

interface PaywallScreenProps {
  onNext: () => void;
  onSkip: () => void;
  onRestore: () => void;
}

export function PaywallScreen({ onNext, onSkip, onRestore }: PaywallScreenProps) {
  const dogName = useOnboardingStore((s) => s.dogProfile.name) || 'Your pup';
  const selectedPlan = useOnboardingStore((s) => s.selectedPlan);
  const setSelectedPlan = useOnboardingStore((s) => s.setSelectedPlan);

  // Default to yearly pre-selected
  useEffect(() => {
    if (selectedPlan === null) {
      setSelectedPlan('yearly');
    }
  }, []);

  const handleSelectPlan = useCallback(
    (plan: 'yearly' | 'monthly') => {
      haptic('light');
      setSelectedPlan(plan);
    },
    [setSelectedPlan],
  );

  return (
    <OnboardingShell step={18} showSkip={false}>
      <ScreenTransition step={18}>
        <View style={styles.content}>
          <Text style={styles.h2}>{dogName}{'\''}s plan is ready</Text>
          <Text style={styles.body}>
            Start with 7 free days. No charge until then.
          </Text>

          {/* Yearly plan card */}
          <Pressable
            onPress={() => handleSelectPlan('yearly')}
            style={[
              styles.planCard,
              styles.yearlyCard,
              selectedPlan === 'yearly' && styles.planCardSelected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === 'yearly' }}
            accessibilityLabel="Yearly plan, 39 dollars per year, 3.25 per month, save 33 percent, best value"
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Yearly</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>save 33%</Text>
              </View>
            </View>
            <Text style={styles.planPrice}>$39/yr {'\u00B7'} $3.25/mo</Text>
            <Text style={styles.planAnnotation}>
              {'\u2726'} best value {'\u00B7'} most picked
            </Text>
          </Pressable>

          {/* Monthly plan card */}
          <Pressable
            onPress={() => handleSelectPlan('monthly')}
            style={[
              styles.planCard,
              styles.monthlyCard,
              selectedPlan === 'monthly' && styles.planCardSelected,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPlan === 'monthly' }}
            accessibilityLabel="Monthly plan, 4.99 dollars per month"
          >
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Monthly</Text>
              <Text style={styles.selectLabel}>select</Text>
            </View>
            <Text style={styles.planPrice}>$4.99/mo</Text>
          </Pressable>

          {/* Trial info card */}
          <View style={styles.trialCard}>
            <Text style={styles.trialText}>
              {'\u2726'} 7-day free trial {'\u00B7'} we{'\''}ll remind you 2 days before it ends {'\u00B7'} cancel in 2 taps
            </Text>
          </View>

          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="Start free trial"
              onPress={onNext}
              hapticType="success"
              testID="paywall-next-button"
            />

            <View style={styles.linkRow}>
              <Pressable
                onPress={onRestore}
                style={styles.link}
                accessibilityRole="button"
                accessibilityLabel="Restore purchases"
                hitSlop={8}
              >
                <Text style={styles.linkText}>restore</Text>
              </Pressable>
              <Pressable
                onPress={onSkip}
                style={styles.link}
                accessibilityRole="button"
                accessibilityLabel="Skip, not now"
                hitSlop={8}
              >
                <Text style={styles.linkText}>not now</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScreenTransition>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  h2: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    marginBottom: OB_SPACING.paragraphGap,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
  },
  body: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    marginBottom: OB_SPACING.gap4,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  planCard: {
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    marginBottom: OB_SPACING.mt4,
    ...OB_SHADOWS.card,
  },
  planCardSelected: {
    borderColor: OB_COLORS.selectedBorder,
    borderWidth: OB_BORDERS.selected,
  },
  yearlyCard: {
    backgroundColor: OB_COLORS.peach,
    borderWidth: 3,
  },
  monthlyCard: {
    backgroundColor: OB_COLORS.cream,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: OB_SPACING.mt1,
  },
  planTitle: {
    fontFamily: OB_FONTS.h3,
    fontSize: OB_FONT_SIZES.h3,
    color: OB_COLORS.ink,
  },
  saveBadge: {
    backgroundColor: OB_COLORS.accent,
    borderRadius: OB_RADII.buttonSm,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  saveBadgeText: {
    fontFamily: OB_FONTS.option,
    fontSize: OB_FONT_SIZES.label,
    color: '#ffffff',
  },
  selectLabel: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
  },
  planPrice: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.ink2,
    marginBottom: OB_SPACING.mt1,
  },
  planAnnotation: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
  },
  trialCard: {
    backgroundColor: OB_COLORS.cream2,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    marginBottom: OB_SPACING.sectionGap,
  },
  trialText: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.55,
    textAlign: 'center',
  },
  buttonWrapper: {
    marginTop: 'auto' as any,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: OB_SPACING.gap4,
    marginTop: OB_SPACING.mt3,
  },
  link: {
    paddingVertical: OB_SPACING.mt2,
    paddingHorizontal: OB_SPACING.mt3,
    minHeight: 32,
    justifyContent: 'center',
  },
  linkText: {
    fontFamily: OB_FONTS.handwritten,
    fontSize: 14,
    color: OB_COLORS.muted,
    textDecorationLine: 'underline',
  },
});
