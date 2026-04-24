import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { OnboardingShell } from './OnboardingShell';
import { ScrapbookButton } from './ScrapbookButton';
import { ScreenTransition } from './ScreenTransition';
import { LifeStageLabel } from './LifeStageLabel';
import { WheelPicker } from './WheelPicker';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { computeAge, getLifeStage, formatAge } from '../../lib/lifeStage';
import {
  OB_COLORS,
  OB_FONTS,
  OB_FONT_SIZES,
  OB_SPACING,
} from '../../constants/onboardingTheme';

interface BirthdayScreenProps {
  onNext: () => void;
}

function getDefaultBirthday() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    year: now.getFullYear() - 2,
  };
}

export function BirthdayScreen({ onNext }: BirthdayScreenProps) {
  const store = useOnboardingStore();
  const { name, birthdayMonth, birthdayDay, birthdayYear } = store.dogProfile;

  const defaults = useMemo(() => getDefaultBirthday(), []);
  const month = birthdayMonth ?? defaults.month;
  const day = birthdayDay ?? defaults.day;
  const year = birthdayYear ?? defaults.year;

  const age = useMemo(() => computeAge(month, day, year), [month, day, year]);
  const lifeStage = useMemo(
    () => getLifeStage(age.years + age.months / 12),
    [age],
  );
  const ageText = useMemo(() => formatAge(age), [age]);

  const handleChangeMonth = (value: number) => {
    store.setDogField('birthdayMonth', value);
  };

  const handleChangeDay = (value: number) => {
    store.setDogField('birthdayDay', value);
  };

  const handleChangeYear = (value: number) => {
    store.setDogField('birthdayYear', value);
  };

  return (
    <OnboardingShell step={10} scrollable={false}>
      <ScreenTransition step={10}>
        <View style={styles.content}>
          <Text style={styles.stepLabel}>about them {'·'} 6 of 6</Text>

          <View style={styles.headingRow}>
            <View style={styles.iconPlaceholder} accessibilityElementsHidden>
              <Text style={styles.iconEmoji}>{'🎂'}</Text>
            </View>
            <Text style={styles.heading}>
              {'When\'s '}
              {name || 'your pup'}
              {'\'s birthday?'}
            </Text>
          </View>

          <Text style={styles.body}>
            Your best guess is fine {'—'} rescues, shelter dogs, lost paperwork, we get it.
          </Text>

          <View style={styles.pickerContainer}>
            <WheelPicker
              month={month}
              day={day}
              year={year}
              onChangeMonth={handleChangeMonth}
              onChangeDay={handleChangeDay}
              onChangeYear={handleChangeYear}
            />
          </View>

          <View style={styles.lifeStageContainer}>
            <LifeStageLabel
              name={name || 'your pup'}
              lifeStage={lifeStage}
              ageText={ageText}
            />
          </View>

          <View style={styles.buttonContainer}>
            <ScrapbookButton
              label="Continue"
              onPress={onNext}
              testID="birthday-continue-button"
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
  stepLabel: {
    fontFamily: OB_FONTS.label,
    fontSize: OB_FONT_SIZES.label,
    color: OB_COLORS.muted,
    textAlign: 'center',
    marginBottom: OB_SPACING.mt3,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: OB_SPACING.mt2,
    marginBottom: OB_SPACING.paragraphGap,
  },
  iconPlaceholder: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 22,
  },
  heading: {
    fontFamily: OB_FONTS.h2,
    fontSize: OB_FONT_SIZES.h2,
    color: OB_COLORS.ink,
    lineHeight: OB_FONT_SIZES.h2 * 1.25,
    flexShrink: 1,
  },
  body: {
    fontFamily: OB_FONTS.body,
    fontSize: OB_FONT_SIZES.body,
    color: OB_COLORS.ink2,
    lineHeight: OB_FONT_SIZES.body * 1.55,
    textAlign: 'center',
    marginBottom: OB_SPACING.sectionGap,
  },
  pickerContainer: {
    marginBottom: OB_SPACING.gap4,
  },
  lifeStageContainer: {
    alignItems: 'center',
    marginBottom: OB_SPACING.gap4,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
});
