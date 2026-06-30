import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  OB_BORDERS,
  OB_COLORS,
  OB_FONTS,
  OB_RADII,
  OB_SHADOWS,
  OB_SPACING,
} from '../../constants/onboardingTheme';

const GHOST_ROTATIONS: string[] = ['-2deg', '1.5deg', '-1deg'];

export interface DogStickerShelfProps {
  dogName: string;
  earnedStickerIds?: string[];
}

export function DogStickerShelf({ dogName, earnedStickerIds = [] }: DogStickerShelfProps) {
  const hasEarned = earnedStickerIds.length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>{dogName + "'s stickers"}</Text>

      <View style={styles.card}>
        {hasEarned ? (
          // Phase-2 seam: per-dog sticker data layer does not exist yet.
          <Text style={styles.earnedText}>{earnedStickerIds.length + ' earned'}</Text>
        ) : (
          <>
            {/* Decorative ghost slots */}
            <View
              style={styles.ghostRow}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              {GHOST_ROTATIONS.map((rotation, index) => (
                <View
                  key={index}
                  style={[styles.ghostSlot, { transform: [{ rotate: rotation }] }]}
                />
              ))}
            </View>
            <Text style={styles.emptyText}>
              {'Stickers ' + dogName + ' earns as you log their days — coming soon.'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  header: {
    fontFamily: OB_FONTS.h2,
    fontSize: 19,
    color: OB_COLORS.ink,
    marginBottom: 8,
  },
  card: {
    backgroundColor: OB_COLORS.cardWhite,
    borderWidth: OB_BORDERS.standard,
    borderColor: OB_COLORS.sketch,
    borderRadius: OB_RADII.rowItem,
    padding: OB_SPACING.cardPadding,
    alignItems: 'center',
    ...OB_SHADOWS.card,
  },
  ghostRow: {
    flexDirection: 'row',
    gap: 22,
    marginBottom: 12,
  },
  ghostSlot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: OB_COLORS.sketch,
    backgroundColor: OB_COLORS.washNeutral,
  },
  emptyText: {
    fontFamily: OB_FONTS.dataValue,
    fontSize: 14,
    color: OB_COLORS.ink2,
    textAlign: 'center',
  },
  earnedText: {
    fontFamily: OB_FONTS.dataLabel,
    fontSize: 14,
    color: OB_COLORS.ink,
  },
});
