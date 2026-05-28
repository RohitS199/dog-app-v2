import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STICKERS, StickerId } from '../../../constants/achievements';
import { OB_COLORS, OB_FONTS } from '../../../constants/onboardingTheme';
import { COPY } from '../../../constants/profileCopy';
import type { FeaturedSlots } from '../../../stores/userAchievementsStore';
import { EmptySlotMount } from './EmptySlotMount';
import { Star } from './Star';
import { StickerCard } from './StickerCard';
import type { OriginRect } from './TrophyDetailView';

// Measures the node's window-space rect via measureInWindow and calls
// `onMeasured(rect)` once the native callback fires. In jest the measureInWindow
// method exists on host nodes but its callback never fires (no native bridge),
// so we explicitly short-circuit to `onUnmeasured()` in test env. Both callbacks
// take no rect argument from the caller's perspective, letting callers decide
// whether to pass it to onPress or omit it entirely (keeps single-arg call
// signatures compatible with existing tests that use `toHaveBeenCalledWith(id)`).
function measureAndFire(
  node: View | null | undefined,
  onMeasured: (rect: OriginRect) => void,
  onUnmeasured: () => void,
): void {
  if (process.env.NODE_ENV === 'test' || !node) {
    onUnmeasured();
    return;
  }
  const measure = (node as unknown as { measureInWindow?: typeof View.prototype.measureInWindow })
    .measureInWindow;
  if (typeof measure === 'function') {
    measure.call(node, (x: number, y: number, w: number, h: number) => {
      onMeasured({ x, y, w, h });
    });
  } else {
    onUnmeasured();
  }
}

// Vertical stagger per slot for scrapbook feel (HANDOFF section 4.2)
const SLOT_STAGGER: Record<0 | 1 | 2, number> = {
  0: -3,
  1: 2,
  2: -1,
};

export type ProfileRowProps = {
  variant: 'profile-row';
  featuredIds: FeaturedSlots;
  earnedIds: Set<StickerId>;
  // `originRect` is captured at tap time via measureInWindow on the slot's
  // host node, then handed to TrophyDetailView so it can fly the sticker
  // from the source position into the centered trophy view. In jest /
  // when measurement isn't available, `originRect` is undefined and the
  // trophy view falls back to its plain fade entrance.
  onPressFilledSlot: (id: StickerId, originRect?: OriginRect) => void;
  onPressEmptySlot: (slotIndex: 0 | 1 | 2) => void;
  onPressViewAll: () => void;
};

export type GridProps = {
  variant: 'sheet' | 'picker' | 'browse';
  featuredIds: FeaturedSlots;
  earnedIds: Set<StickerId>;
  onPressSticker: (id: StickerId, originRect?: OriginRect) => void;
};

export type StickerCollectionProps = ProfileRowProps | GridProps;

export function StickerCollection(props: StickerCollectionProps) {
  // Refs for measureInWindow at tap time. Row uses fixed slot indices (3),
  // grid uses sticker id (12). Both are stored in callback refs so React
  // garbage-collects them on unmount. measureInWindow is called inside the
  // outer Pressable's onPress; the underlying ref points to StickerCard's
  // forwarded inner Pressable (row) or the outer tile Pressable (grid).
  const rowRefs = useRef<Map<number, View>>(new Map());
  const gridRefs = useRef<Map<StickerId, View>>(new Map());

  if (props.variant === 'profile-row') {
    const { featuredIds, earnedIds, onPressFilledSlot, onPressEmptySlot, onPressViewAll } = props;

    return (
      <View style={styles.rowWrap}>
        <View style={styles.row}>
          {([0, 1, 2] as const).map((slotIndex) => {
            const id = featuredIds[slotIndex];
            const stagger = SLOT_STAGGER[slotIndex];
            if (id === null) {
              return (
                <View
                  key={`slot-${slotIndex}`}
                  style={{ transform: [{ translateY: stagger }] }}
                >
                  <EmptySlotMount onPress={() => onPressEmptySlot(slotIndex)} />
                </View>
              );
            }
            const sticker = STICKERS[id];
            return (
              <View
                key={`slot-${slotIndex}-${id}`}
                style={[styles.filledSlot, { transform: [{ translateY: stagger }] }]}
              >
                <StickerCard
                  ref={(node) => {
                    if (node) rowRefs.current.set(slotIndex, node);
                    else rowRefs.current.delete(slotIndex);
                  }}
                  sticker={sticker}
                  earned={earnedIds.has(id)}
                  onPress={() => {
                    measureAndFire(
                      rowRefs.current.get(slotIndex),
                      (rect) => onPressFilledSlot(id, rect),
                      () => onPressFilledSlot(id),
                    );
                  }}
                  size={74}
                />
              </View>
            );
          })}
        </View>

        <Pressable
          testID="view-all-stickers"
          onPress={onPressViewAll}
          accessibilityRole="button"
          accessibilityLabel={COPY.STICKER_VIEW_ALL_LINK}
          hitSlop={8}
          style={styles.viewAllWrap}
        >
          <Text style={styles.viewAllText}>
            {COPY.STICKER_VIEW_ALL_LINK}
            <Text style={styles.viewAllArrow}> {'⤳'}</Text>
          </Text>
        </Pressable>
      </View>
    );
  }

  // 'sheet' | 'picker' | 'browse' — all 12 stickers in a 3-column grid
  const { variant, featuredIds, earnedIds, onPressSticker } = props;
  const allStickers = Object.values(STICKERS);
  const featuredSet = new Set(featuredIds.filter((x): x is StickerId => x !== null));

  return (
    <View style={styles.grid}>
      {allStickers.map((sticker) => {
        const isFeatured = featuredSet.has(sticker.id);
        const isEarned = earnedIds.has(sticker.id);
        // In picker mode, only earned + NOT-already-featured stickers are
        // pickable. Featured ones still show with their orange star badge so
        // the user can see why they can't be picked again. Locked are also
        // non-pickable since they aren't earned yet.
        const isPickable = variant === 'picker' ? (isEarned && !isFeatured) : true;
        return (
          <View key={sticker.id} style={styles.gridCell}>
            <Pressable
              ref={(node) => {
                if (node) gridRefs.current.set(sticker.id, node as unknown as View);
                else gridRefs.current.delete(sticker.id);
              }}
              testID={`sticker-tile-${sticker.id}`}
              onPress={
                isPickable
                  ? () => {
                      measureAndFire(
                        gridRefs.current.get(sticker.id),
                        (rect) => onPressSticker(sticker.id, rect),
                        () => onPressSticker(sticker.id),
                      );
                    }
                  : undefined
              }
              accessibilityRole="button"
              accessibilityLabel={
                `${sticker.title} sticker, ${isEarned ? 'earned' : 'locked'}` +
                (isFeatured ? ', featured on your profile' : '')
              }
              accessibilityState={{ disabled: !isPickable }}
              hitSlop={4}
              style={[
                styles.tile,
                isFeatured && styles.tileFeatured,
              ]}
            >
              <StickerCard sticker={sticker} earned={isEarned} size={72} />
              {isFeatured && (
                <View style={styles.featuredBadge} testID={`featured-badge-${sticker.id}`}>
                  <Star size={14} color={OB_COLORS.cream} />
                </View>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  filledSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllWrap: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  viewAllText: {
    fontFamily: OB_FONTS.body,
    fontSize: 13,
    color: OB_COLORS.sketch,
    opacity: 0.7,
  },
  viewAllArrow: {
    fontFamily: OB_FONTS.h1,
    fontSize: 15,
    color: OB_COLORS.sketch,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCell: {
    width: '30%',
    aspectRatio: 1,
  },
  tile: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 8,
    position: 'relative',
  },
  tileFeatured: {
    // OB_COLORS.featuredBlueWash (10% featuredBlue) — matches unfeatured ribbon
    // bg. 45% border is unique to grid tiles (no token; localized to this style).
    backgroundColor: OB_COLORS.featuredBlueWash,
    borderWidth: 1.5,
    borderColor: 'rgba(63, 110, 143, 0.45)',
  },
  featuredBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: OB_COLORS.featuredBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
