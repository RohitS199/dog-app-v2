import React, { useCallback, useRef, useEffect, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import {
  OB_COLORS,
  OB_FONTS,
  OB_BORDERS,
  OB_RADII,
} from '../../constants/onboardingTheme';

// Wheel-picker internals are intentionally hardcoded — these values tune the
// scrolling feel and opacity falloff for the 3-row picker shown on BirthdayScreen.
// Not tokenized because they're not reused anywhere else in the app.
const ITEM_HEIGHT = 32;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

// Onboarding uses this picker for dog birthdays (last 25 years is plenty).
// My Information reuses it for user birthdays (needs to reach 1900). Caller
// controls the range via minYear; default preserves the original 25-year window.
const DEFAULT_YEAR_RANGE = 25;

const MONTHS = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 },
];

const DAYS = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1,
}));

function buildYears(minYear: number): { label: string; value: number }[] {
  const currentYear = new Date().getFullYear();
  const years: { label: string; value: number }[] = [];
  for (let y = currentYear; y >= minYear; y--) {
    years.push({ label: String(y), value: y });
  }
  return years;
}

interface WheelPickerProps {
  month: number;
  day: number;
  year: number;
  onChangeMonth: (month: number) => void;
  onChangeDay: (day: number) => void;
  onChangeYear: (year: number) => void;
  // Earliest year shown in the year column. Defaults to currentYear - 25 to
  // preserve the onboarding dog-birthday range. Pass 1900 for adult user birthdays.
  minYear?: number;
}

interface ColumnItem {
  label: string;
  value: number;
}

interface ColumnProps {
  label: string;
  data: ColumnItem[];
  selectedValue: number;
  onChange: (value: number) => void;
}

function Column({ label, data, selectedValue, onChange }: ColumnProps) {
  const flatListRef = useRef<FlatList>(null);
  const initialScrollDone = useRef(false);

  const selectedIndex = data.findIndex((d) => d.value === selectedValue);

  useEffect(() => {
    if (selectedIndex >= 0 && flatListRef.current && !initialScrollDone.current) {
      initialScrollDone.current = true;
      // Slight delay to ensure layout is ready
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, [selectedIndex]);

  const handleMomentumScrollEnd = useCallback(
    (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      if (data[clampedIndex]) {
        onChange(data[clampedIndex].value);
      }
    },
    [data, onChange],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: ColumnItem; index: number }) => {
      const distance = Math.abs(index - selectedIndex);
      const isSelected = distance === 0;
      const isNear = distance === 1;

      return (
        <View
          style={[
            styles.itemRow,
            isSelected && styles.itemRowSelected,
          ]}
        >
          <Text
            style={[
              styles.itemText,
              isSelected && styles.itemTextSelected,
              isNear && styles.itemTextNear,
              distance >= 2 && styles.itemTextFar,
            ]}
          >
            {item.label}
          </Text>
        </View>
      );
    },
    [selectedIndex],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <View style={styles.column}>
      <Text style={styles.columnLabel}>{label}</Text>
      <View style={styles.columnContainer}>
        {/* Selection highlight band */}
        <View style={styles.selectionBand} pointerEvents="none" />
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.value)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT, // One empty row above and below
          }}
          accessibilityRole="adjustable"
          accessibilityLabel={`${label} picker, current value ${data[selectedIndex]?.label ?? ''}`}
        />
      </View>
    </View>
  );
}

export function WheelPicker({
  month,
  day,
  year,
  onChangeMonth,
  onChangeDay,
  onChangeYear,
  minYear,
}: WheelPickerProps) {
  const resolvedMinYear =
    minYear ?? new Date().getFullYear() - DEFAULT_YEAR_RANGE;
  const years = useMemo(() => buildYears(resolvedMinYear), [resolvedMinYear]);

  return (
    <View style={styles.container} accessibilityLabel="Birthday picker">
      <Column
        label="MONTH"
        data={MONTHS}
        selectedValue={month}
        onChange={onChangeMonth}
      />
      <Column
        label="DAY"
        data={DAYS}
        selectedValue={day}
        onChange={onChangeDay}
      />
      <Column
        label="YEAR"
        data={years}
        selectedValue={year}
        onChange={onChangeYear}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flex: 1,
  },
  columnLabel: {
    fontFamily: OB_FONTS.label,
    fontSize: 9,
    color: OB_COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 4,
  },
  columnContainer: {
    height: PICKER_HEIGHT,
    backgroundColor: OB_COLORS.cream,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.field,
    overflow: 'hidden',
  },
  selectionBand: {
    position: 'absolute',
    top: ITEM_HEIGHT, // Offset by padding
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: OB_COLORS.peach,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: OB_COLORS.sketch,
    zIndex: 1,
    opacity: 0.5,
  },
  itemRow: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemRowSelected: {
    zIndex: 2,
  },
  itemText: {
    fontFamily: OB_FONTS.placeholder,
    fontSize: 11,
    color: OB_COLORS.ink,
    opacity: 0.25,
  },
  itemTextSelected: {
    fontFamily: OB_FONTS.wheelValue,
    fontSize: 16,
    opacity: 1,
  },
  itemTextNear: {
    fontSize: 12,
    opacity: 0.5,
  },
  itemTextFar: {
    fontSize: 11,
    opacity: 0.25,
  },
});
