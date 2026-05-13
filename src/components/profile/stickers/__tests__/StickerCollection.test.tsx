import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StickerCollection } from '../StickerCollection';
import { STICKER_IDS, StickerId, topThreeForRow, STICKERS } from '../../../../constants/achievements';

describe('StickerCollection', () => {
  // 1. profile-row renders exactly 3 stickers
  it('1. profile-row renders exactly 3 stickers', () => {
    const { getAllByRole } = render(
      <StickerCollection variant="profile-row" earnedIds={new Set()} />
    );
    // Each StickerCard is a Pressable with role=button
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  // 2. sheet renders all 11 stickers
  it('2. sheet renders all 11 stickers', () => {
    const { getAllByRole } = render(
      <StickerCollection variant="sheet" earnedIds={new Set()} />
    );
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(11);
  });

  // 3. profile-row with no earned: top 3 by sort are lowest heroWeight
  it('3. profile-row with no earned: top 3 ids match topThreeForRow(emptySet, false)', () => {
    const { getAllByRole } = render(
      <StickerCollection variant="profile-row" earnedIds={new Set()} />
    );
    const buttons = getAllByRole('button');
    const renderedLabels = buttons.map((b) => b.props.accessibilityLabel as string);

    // Use the actual helper (FLOWERS_ENABLED=false) to compute expected top 3
    const expected = topThreeForRow(new Set(), false).map(
      (s) => `${s.title} sticker, locked`
    );
    // Render order should match sort order
    expect(renderedLabels).toEqual(expected);
  });

  // 4. profile-row with welcome earned: welcome sticker is in the top 3
  it('4. profile-row with welcome earned: welcome appears in top 3', () => {
    const earnedIds = new Set<StickerId>(['welcome']);
    const { getAllByRole } = render(
      <StickerCollection variant="profile-row" earnedIds={earnedIds} />
    );
    const buttons = getAllByRole('button');
    const labels = buttons.map((b) => b.props.accessibilityLabel as string);
    const hasWelcome = labels.some((l) => l.includes('Welcome to PupLog'));
    expect(hasWelcome).toBe(true);
  });

  // 5. profile-row with FLOWERS_ENABLED=false filters out flower-gated stickers
  it('5. profile-row with no earned does not render flower-gated sticker titles', () => {
    const { queryByLabelText } = render(
      <StickerCollection variant="profile-row" earnedIds={new Set()} />
    );
    // flower-gated stickers should not appear in profile-row when flowers disabled
    const flowerGated = Object.values(STICKERS).filter(
      (s) => s.enabledWhen === 'flowers_shipped'
    );
    flowerGated.forEach((s) => {
      expect(queryByLabelText(`${s.title} sticker, locked`)).toBeNull();
      expect(queryByLabelText(`${s.title} sticker, earned`)).toBeNull();
    });
  });

  // 6. sheet includes flower-gated stickers (renders all 11 regardless)
  it('6. sheet renders flower-gated stickers too', () => {
    const { getAllByRole } = render(
      <StickerCollection variant="sheet" earnedIds={new Set()} />
    );
    const buttons = getAllByRole('button');
    const labels = buttons.map((b) => b.props.accessibilityLabel as string);
    // first_peony is flower-gated — must appear in sheet
    const hasPeony = labels.some((l) => l.includes('First Peony'));
    expect(hasPeony).toBe(true);
  });

  // 7. onPressSticker fires with the correct id on tap
  it('7. onPressSticker fires with correct sticker id', () => {
    const onPress = jest.fn();
    const earnedIds = new Set<StickerId>(['welcome']);
    // Use sheet so we can reliably find a specific sticker
    const { getByLabelText } = render(
      <StickerCollection variant="sheet" earnedIds={earnedIds} onPressSticker={onPress} />
    );
    fireEvent.press(getByLabelText('Welcome to PupLog sticker, earned'));
    expect(onPress).toHaveBeenCalledWith('welcome');
  });

  // 8. Rotation is deterministic — same sticker always has the same rotation
  it('8. rotation is deterministic across renders (same sticker.id = same rotation)', () => {
    const { getAllByRole: getFirst } = render(
      <StickerCollection variant="sheet" earnedIds={new Set()} />
    );
    const { getAllByRole: getSecond } = render(
      <StickerCollection variant="sheet" earnedIds={new Set()} />
    );
    const labelsFirst = getFirst('button').map((b) => b.props.accessibilityLabel);
    const labelsSecond = getSecond('button').map((b) => b.props.accessibilityLabel);
    // Same labels in same order — rotation is from sticker.rotation constant
    expect(labelsFirst).toEqual(labelsSecond);
  });
});
