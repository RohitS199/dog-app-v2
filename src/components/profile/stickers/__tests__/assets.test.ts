import { STICKER_ASSETS } from '../assets';
import { STICKER_IDS } from '../../../../constants/achievements';

// ─── 1. STICKER_ASSETS has same keys as STICKER_IDS ─────────────────────────

it('1. STICKER_ASSETS has exactly the same keys as STICKER_IDS (catches drift)', () => {
  const assetKeys = Object.keys(STICKER_ASSETS).sort();
  const idKeys = [...STICKER_IDS].sort();
  expect(assetKeys).toEqual(idKeys);
});
