import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StickerDetailSheet } from '../StickerDetailSheet';
import { STICKERS, StickerDef } from '../../../../constants/achievements';

const welcomeSticker: StickerDef = STICKERS.welcome;
const patternSticker: StickerDef = STICKERS.pattern_spotter;
const flowerSticker: StickerDef = STICKERS.first_peony; // enabledWhen: 'flowers_shipped'

describe('StickerDetailSheet', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  // 1. Renders nothing when visible=false
  it('1. renders nothing when visible=false', () => {
    const { queryByText } = render(
      <StickerDetailSheet
        visible={false}
        sticker={welcomeSticker}
        earned={false}
        onClose={onClose}
      />
    );
    expect(queryByText(welcomeSticker.title)).toBeNull();
  });

  // 2. Renders nothing when sticker=null
  it('2. renders nothing when sticker=null', () => {
    const { queryByText } = render(
      <StickerDetailSheet
        visible
        sticker={null}
        earned={false}
        onClose={onClose}
      />
    );
    // No title to find — just check nothing meaningful appears
    expect(queryByText('Welcome to PupLog')).toBeNull();
    expect(queryByText('Pattern Spotter')).toBeNull();
  });

  // 3. Earned: shows formatted earned date
  it('3. shows formatted earned date when earned=true and earnedAt is provided', () => {
    const { getByText } = render(
      <StickerDetailSheet
        visible
        sticker={welcomeSticker}
        earned
        earnedAt="2026-05-12T10:30:00Z"
        onClose={onClose}
      />
    );
    // formatEarnedDate("2026-05-12T10:30:00Z") -> "May 12, 2026"
    expect(getByText('Earned May 12, 2026')).toBeTruthy();
  });

  // 4. Ghost non-flower-gated: shows unlockCriteria text
  it('4. ghost non-flower-gated sticker shows unlockCriteria', () => {
    const { getByText } = render(
      <StickerDetailSheet
        visible
        sticker={patternSticker}
        earned={false}
        onClose={onClose}
      />
    );
    expect(getByText(patternSticker.unlockCriteria)).toBeTruthy();
  });

  // 5. Ghost flower-gated: shows "Coming with the flower system"
  it('5. ghost flower-gated sticker shows STICKER_FLOWER_GATED_TEXT', () => {
    const { getByText } = render(
      <StickerDetailSheet
        visible
        sticker={flowerSticker}
        earned={false}
        onClose={onClose}
      />
    );
    expect(getByText('Coming with the flower system')).toBeTruthy();
  });

  // 6. Tapping close button calls onClose
  it('6. tapping the close button calls onClose', () => {
    const { getByLabelText } = render(
      <StickerDetailSheet
        visible
        sticker={welcomeSticker}
        earned={false}
        onClose={onClose}
      />
    );
    fireEvent.press(getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
