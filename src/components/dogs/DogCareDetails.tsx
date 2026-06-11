import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OB_COLORS, OB_FONTS, OB_RADII, OB_SHADOWS } from '../../constants/onboardingTheme';
import { MIN_TOUCH_TARGET } from '../../constants/theme';
import type { Dog } from '../../types/api';

interface DogCareDetailsProps {
  dog: Dog;
  onEdit: () => void;
}

interface RowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function Row({ label, value, isLast = false }: RowProps) {
  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function DogCareDetails({ dog, onEdit }: DogCareDetailsProps) {
  const weightValue = `${dog.weight_lbs} lbs`;
  const conditionsValue =
    dog.known_conditions.length > 0 ? dog.known_conditions.join(', ') : 'None on file';
  const trimmedVetPhone = dog.vet_phone ? dog.vet_phone.trim() : '';
  const vetValue = trimmedVetPhone.length > 0 ? trimmedVetPhone : 'Not added';

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Care</Text>
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={'Edit ' + dog.name + "'" + 's details'}
          style={styles.editButton}
        >
          <Text style={styles.editLabel}>{'Edit ›'}</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <Row label="Weight" value={weightValue} />
        <Row label="Conditions" value={conditionsValue} />
        <Row label="Vet" value={vetValue} isLast />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heading: {
    fontFamily: OB_FONTS.h2,
    fontSize: 19,
    color: OB_COLORS.ink,
  },
  editButton: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  editLabel: {
    fontFamily: OB_FONTS.btnLabel,
    fontSize: 15,
    // Spec addendum 4.7 named coral here, but coral #F4845F fails WCAG AA at
    // 15px on cream; wood is the established AA-safe link color (matches
    // WeekLookBack's See-more link).
    color: OB_COLORS.wood,
  },
  card: {
    backgroundColor: OB_COLORS.cardWhite,
    borderWidth: 2,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.rowItem,
    ...OB_SHADOWS.card,
    paddingHorizontal: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: OB_COLORS.hairline,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontFamily: OB_FONTS.dataLabel,
    fontSize: 13,
    color: OB_COLORS.ink2,
  },
  rowValue: {
    fontFamily: OB_FONTS.dataLabel,
    fontSize: 15,
    color: OB_COLORS.ink,
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
});
