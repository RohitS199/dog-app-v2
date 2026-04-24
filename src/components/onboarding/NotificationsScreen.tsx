import React, { useCallback } from 'react';
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

interface NotificationsScreenProps {
  onNext: () => void;
}

const TIME_OPTIONS = [
  { label: '7am', hour: 7 },
  { label: '8am', hour: 8 },
  { label: '9am', hour: 9 },
  { label: '12pm', hour: 12 },
  { label: '6pm', hour: 18 },
  { label: '9pm', hour: 21 },
] as const;

export function NotificationsScreen({ onNext }: NotificationsScreenProps) {
  const notificationHour = useOnboardingStore((s) => s.notificationHour);
  const setNotificationHour = useOnboardingStore((s) => s.setNotificationHour);

  const handleSelectTime = useCallback(
    (hour: number) => {
      haptic('light');
      setNotificationHour(hour);
    },
    [setNotificationHour],
  );

  const handleContinue = useCallback(() => {
    // In a real implementation, this would request notification permissions
    onNext();
  }, [onNext]);

  return (
    <OnboardingShell step={16}>
      <ScreenTransition step={16}>
        <View style={styles.content}>
          <Text style={styles.h2}>Never miss a flower</Text>
          <Text style={styles.body}>One gentle nudge a day. Never spammy.</Text>

          {/* Time picker card */}
          <View style={styles.card}>
            <View style={styles.timeHeader}>
              <View style={styles.bellWrapper}>
                <Text
                  style={styles.bellEmoji}
                  accessibilityElementsHidden
                >
                  {'\uD83D\uDD14'}
                </Text>
              </View>
              <View style={styles.timeHeaderText}>
                <Text style={styles.timeTitle}>Daily check-in time</Text>
                <Text style={styles.timeSubtitle}>pick one</Text>
              </View>
            </View>

            <View style={styles.chipRow}>
              {TIME_OPTIONS.map((option) => {
                const isSelected = notificationHour === option.hour;
                return (
                  <Pressable
                    key={option.hour}
                    onPress={() => handleSelectTime(option.hour)}
                    style={[
                      styles.timeChip,
                      isSelected && styles.timeChipSelected,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${option.label} check-in time`}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        isSelected && styles.timeChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Mock notification card */}
          <View style={styles.mockNotification}>
            <Text style={styles.mockTitle}>
              PupLog would like to send you notifications
            </Text>
            <View style={styles.mockButtonRow}>
              <Pressable
                style={styles.mockButton}
                accessibilityRole="button"
                accessibilityLabel="Don't allow notifications"
              >
                <Text style={styles.mockButtonText}>Don{'\''}t allow</Text>
              </Pressable>
              <Pressable
                style={styles.mockButton}
                accessibilityRole="button"
                accessibilityLabel="Allow notifications"
              >
                <Text style={[styles.mockButtonText, styles.mockButtonAllow]}>
                  Allow
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.buttonWrapper}>
            <ScrapbookButton
              label="Enable & continue"
              onPress={handleContinue}
              testID="notifications-next-button"
            />
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
  card: {
    backgroundColor: OB_COLORS.cream,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    marginBottom: OB_SPACING.gap4,
    ...OB_SHADOWS.card,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: OB_SPACING.gap3,
  },
  bellWrapper: {
    width: 44,
    height: 44,
    borderRadius: OB_RADII.iconBackground,
    backgroundColor: OB_COLORS.peach,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: OB_SPACING.mt4,
  },
  bellEmoji: {
    fontSize: 18,
  },
  timeHeaderText: {
    flex: 1,
  },
  timeTitle: {
    fontFamily: OB_FONTS.h3,
    fontSize: OB_FONT_SIZES.h3,
    color: OB_COLORS.ink,
  },
  timeSubtitle: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: OB_SPACING.mt2,
  },
  timeChip: {
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.buttonSm,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: OB_COLORS.cream,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeChipSelected: {
    backgroundColor: OB_COLORS.selectedBg,
    borderColor: OB_COLORS.selectedBorder,
    borderWidth: OB_BORDERS.selected,
  },
  timeChipText: {
    fontFamily: OB_FONTS.option,
    fontSize: OB_FONT_SIZES.option,
    color: OB_COLORS.ink,
  },
  timeChipTextSelected: {
    color: OB_COLORS.accent,
  },
  mockNotification: {
    backgroundColor: OB_COLORS.cream2,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.card,
    padding: OB_SPACING.cardPadding,
    marginBottom: OB_SPACING.gap4,
  },
  mockTitle: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: OB_SPACING.mt3,
    lineHeight: OB_FONT_SIZES.body * 1.55,
  },
  mockButtonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: OB_SPACING.gap4,
  },
  mockButton: {
    paddingVertical: OB_SPACING.mt1,
    paddingHorizontal: OB_SPACING.mt3,
    minHeight: 32,
    justifyContent: 'center',
  },
  mockButtonText: {
    fontFamily: OB_FONTS.option,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.muted,
  },
  mockButtonAllow: {
    color: OB_COLORS.accent,
  },
  buttonWrapper: {
    marginTop: 'auto' as any,
    paddingBottom: OB_SPACING.screenPaddingBottom,
  },
});
