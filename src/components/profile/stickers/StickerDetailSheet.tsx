import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { StickerDef } from '../../../constants/achievements';
import { COPY } from '../../../constants/profileCopy';
import { StickerDetailContent } from './StickerDetailContent';

// Standalone Modal-wrapped version of the sticker detail card. Renders nothing
// when visible=false. For nested use (inside another Modal), use
// StickerDetailContent directly to avoid iOS's one-Modal-at-a-time limit.

export type StickerDetailSheetProps = {
  visible: boolean;
  sticker: StickerDef | null;
  earned: boolean;
  earnedAt?: string | null;
  onClose: () => void;
};

export function StickerDetailSheet({
  visible,
  sticker,
  earned,
  earnedAt,
  onClose,
}: StickerDetailSheetProps) {
  if (!visible || !sticker) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityLabel="Close sticker detail"
        accessibilityRole="button"
      />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <StickerDetailContent
          sticker={sticker}
          earned={earned}
          earnedAt={earnedAt}
          onClose={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 20, 15, 0.4)',
  },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
});
