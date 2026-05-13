import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StickerDef } from '../../../constants/achievements';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
} from '../../../constants/onboardingTheme';
import { COPY } from '../../../constants/profileCopy';
import { StickerCard } from './StickerCard';

// Detail card — same visual as StickerDetailSheet but without the outer Modal.
// Used by Profile root to render the detail INSIDE the existing collection
// Modal (iOS only supports one Modal at a time; nesting Modals freezes the UI).
//
// StickerDetailSheet remains as a Modal-wrapped convenience for standalone use
// and existing tests; it now composes this component internally.

export type StickerDetailContentProps = {
  sticker: StickerDef;
  earned: boolean;
  earnedAt?: string | null;
  onClose: () => void;
};

function formatEarnedDate(iso: string): string {
  const datePart = iso.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) return datePart;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return datePart;
  const date = new Date(year, month, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function categoryLabel(category: StickerDef['category']): string {
  switch (category) {
    case 'milestone':
      return COPY.STICKER_CATEGORY_MILESTONE;
    case 'mastery':
      return COPY.STICKER_CATEGORY_MASTERY;
    case 'engagement':
      return COPY.STICKER_CATEGORY_ENGAGEMENT;
    case 'seasonal':
      return COPY.STICKER_CATEGORY_SEASONAL;
  }
}

export function StickerDetailContent({
  sticker,
  earned,
  earnedAt,
  onClose,
}: StickerDetailContentProps) {
  const isFlowerGated = sticker.enabledWhen === 'flowers_shipped';

  return (
    <View style={styles.sheet}>
      {/* Close button */}
      <Pressable
        style={styles.closeBtn}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={COPY.STICKER_DETAIL_CLOSE_LABEL}
        hitSlop={8}
      >
        <Text style={styles.closeBtnText}>{'x'}</Text>
      </Pressable>

      {/* Big sticker */}
      <View style={styles.stickerWrap}>
        <StickerCard sticker={sticker} earned={earned} size={120} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{sticker.title}</Text>

      {/* Category badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{categoryLabel(sticker.category)}</Text>
      </View>

      {/* Description */}
      <Text style={styles.description}>{sticker.description}</Text>

      {/* Earned date or criteria */}
      {earned && earnedAt ? (
        <Text style={styles.earned}>
          {COPY.STICKER_EARNED_PREFIX}
          {formatEarnedDate(earnedAt)}
        </Text>
      ) : isFlowerGated ? (
        <Text style={styles.flowerGated}>{COPY.STICKER_FLOWER_GATED_TEXT}</Text>
      ) : (
        <Text style={styles.criteria}>{sticker.unlockCriteria}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: OB_COLORS.cream,
    borderTopLeftRadius: OB_RADII.modal,
    borderTopRightRadius: OB_RADII.modal,
    borderWidth: OB_BORDERS.standard,
    borderBottomWidth: 0,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 36,
    alignItems: 'center',
    ...OB_SHADOWS.card,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  closeBtnText: {
    fontFamily: OB_FONTS.h1,
    fontSize: 20,
    color: OB_COLORS.ink2,
  },
  stickerWrap: {
    marginBottom: 14,
    marginTop: 4,
  },
  title: {
    fontFamily: OB_FONTS.h1,
    fontSize: 22,
    color: OB_COLORS.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: OB_COLORS.peach,
    borderRadius: OB_RADII.chip,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: OB_FONTS.body,
    fontSize: 12,
    color: OB_COLORS.ink,
  },
  description: {
    fontFamily: OB_FONTS.body,
    fontSize: 14,
    color: OB_COLORS.muted,
    textAlign: 'center',
    marginBottom: 10,
  },
  earned: {
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.ink2,
    textAlign: 'center',
  },
  flowerGated: {
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.muted,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  criteria: {
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.muted,
    textAlign: 'center',
  },
});
