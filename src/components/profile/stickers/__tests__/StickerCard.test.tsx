import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StickerCard } from '../StickerCard';
import { STICKERS, StickerDef } from '../../../../constants/achievements';
import * as assets from '../assets';

// Helper: grab a sticker we know has null asset
const welcomeSticker: StickerDef = STICKERS.welcome;
const patternSticker: StickerDef = STICKERS.pattern_spotter;

describe('StickerCard', () => {
  // 1. Renders with earned styling
  it('1. renders earned state — accessibilityLabel says earned', () => {
    const { getByLabelText } = render(
      <StickerCard sticker={welcomeSticker} earned />
    );
    expect(getByLabelText('Welcome to PupLog sticker, earned')).toBeTruthy();
  });

  // 2. Renders ghost styling when earned=false
  it('2. renders ghost state — accessibilityLabel says locked', () => {
    const { getByLabelText } = render(
      <StickerCard sticker={welcomeSticker} earned={false} />
    );
    expect(getByLabelText('Welcome to PupLog sticker, locked')).toBeTruthy();
  });

  // 3. Fires onPress when tapped
  it('3. fires onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <StickerCard sticker={welcomeSticker} earned onPress={onPress} />
    );
    fireEvent.press(getByLabelText('Welcome to PupLog sticker, earned'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  // 4. Falls back to placeholder (first letter) when STICKER_ASSETS[id] is null
  it('4. shows first letter of title as placeholder when asset is null', () => {
    // All assets are null in this codebase currently
    const { getByText } = render(
      <StickerCard sticker={welcomeSticker} earned />
    );
    // First letter of "Welcome to PupLog" is "W"
    expect(getByText('W')).toBeTruthy();
  });

  // 5. accessibilityLabel reflects earned state correctly for both values
  it('5. accessibilityLabel changes based on earned prop', () => {
    const { getByLabelText: getEarned } = render(
      <StickerCard sticker={patternSticker} earned />
    );
    expect(getEarned('Pattern Spotter sticker, earned')).toBeTruthy();

    const { getByLabelText: getLocked } = render(
      <StickerCard sticker={patternSticker} earned={false} />
    );
    expect(getLocked('Pattern Spotter sticker, locked')).toBeTruthy();
  });

  // 6. Applies rotation transform from sticker.rotation
  it('6. renders the pressable with rotation style from sticker.rotation', () => {
    const { getByLabelText } = render(
      <StickerCard sticker={welcomeSticker} earned />
    );
    // welcomeSticker.rotation === -3
    const pressable = getByLabelText('Welcome to PupLog sticker, earned');
    const flatStyle = pressable.props.style;
    const styles = Array.isArray(flatStyle) ? flatStyle.flat(Infinity) : [flatStyle];
    const found = styles.some((s: unknown) => {
      if (typeof s === 'object' && s !== null && 'transform' in (s as object)) {
        const t = (s as { transform: Array<Record<string, unknown>> }).transform;
        return Array.isArray(t) &&
          t.some((entry) => entry.rotate === `${welcomeSticker.rotation}deg`);
      }
      return false;
    });
    expect(found).toBe(true);
  });
});
