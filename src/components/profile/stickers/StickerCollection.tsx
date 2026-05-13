import React from 'react';
import { StyleSheet, View } from 'react-native';
import { STICKERS, StickerId, topThreeForRow } from '../../../constants/achievements';
import { StickerCard } from './StickerCard';

// Feature flag — mirrored from the Edge Function gate.
// When false, topThreeForRow filters out flower-gated stickers.
const FLOWERS_ENABLED = false;

export type StickerCollectionProps = {
  variant: 'profile-row' | 'sheet';
  earnedIds: Set<StickerId>;
  onPressSticker?: (id: StickerId) => void;
};

export function StickerCollection({
  variant,
  earnedIds,
  onPressSticker,
}: StickerCollectionProps) {
  if (variant === 'profile-row') {
    const topThree = topThreeForRow(earnedIds, FLOWERS_ENABLED);

    return (
      <View style={styles.row}>
        {topThree.map((sticker) => (
          <StickerCard
            key={sticker.id}
            sticker={sticker}
            earned={earnedIds.has(sticker.id)}
            onPress={onPressSticker ? () => onPressSticker(sticker.id) : undefined}
            size={56}
          />
        ))}
      </View>
    );
  }

  // 'sheet' — all 11 stickers in a 3-column grid, regardless of FLOWERS_ENABLED
  const allStickers = Object.values(STICKERS);

  return (
    <View style={styles.grid}>
      {allStickers.map((sticker) => (
        <View key={sticker.id} style={styles.gridCell}>
          <StickerCard
            sticker={sticker}
            earned={earnedIds.has(sticker.id)}
            onPress={onPressSticker ? () => onPressSticker(sticker.id) : undefined}
            size={72}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  gridCell: {
    // Each cell is ~1/3 of the container; StickerCard is self-sized
  },
});
