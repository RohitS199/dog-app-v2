import {
  STICKER_IDS,
  STICKERS,
  getCurrentSeasonStickerId,
  topThreeForRow,
  sortKey,
  StickerCategory,
} from '../achievements';

// ─── 1. STICKER_IDS length ────────────────────────────────────────────────────

it('1. STICKER_IDS has exactly 12 entries', () => {
  expect(STICKER_IDS).toHaveLength(12);
});

// ─── 2. Every id in STICKER_IDS appears as a key in STICKERS ─────────────────

it('2. every id in STICKER_IDS appears as a key in STICKERS', () => {
  for (const id of STICKER_IDS) {
    expect(STICKERS).toHaveProperty(id);
  }
});

// ─── 3. Every STICKERS entry has a valid category ────────────────────────────

it('3. every STICKERS entry has a valid category', () => {
  const validCategories: StickerCategory[] = ['milestone', 'mastery', 'engagement', 'seasonal'];
  for (const id of STICKER_IDS) {
    expect(validCategories).toContain(STICKERS[id].category);
  }
});

// ─── 4. Every rotation value is in [-7, 7] range ─────────────────────────────

it('4. every rotation value is in [-7, 7] range', () => {
  for (const id of STICKER_IDS) {
    const { rotation } = STICKERS[id];
    expect(rotation).toBeGreaterThanOrEqual(-7);
    expect(rotation).toBeLessThanOrEqual(7);
  }
});

// ─── 5. Every heroWeight is between 0 and 100 ────────────────────────────────

it('5. every heroWeight is between 0 and 100', () => {
  for (const id of STICKER_IDS) {
    const { heroWeight } = STICKERS[id];
    expect(heroWeight).toBeGreaterThanOrEqual(0);
    expect(heroWeight).toBeLessThanOrEqual(100);
  }
});

// ─── 6. welcome has enabledWhen: 'always' ────────────────────────────────────

it("6. welcome has enabledWhen: 'always'", () => {
  expect(STICKERS['welcome'].enabledWhen).toBe('always');
});

// ─── 7. Four stickers have enabledWhen: 'flowers_shipped' ────────────────────

it("7. exactly 4 stickers have enabledWhen: 'flowers_shipped'", () => {
  const flowerGated = STICKER_IDS.filter(
    (id) => STICKERS[id].enabledWhen === 'flowers_shipped',
  );
  expect(flowerGated).toHaveLength(4);
  expect(flowerGated).toContain('first_peony');
  expect(flowerGated).toContain('bouquet_of_joy');
  expect(flowerGated).toContain('full_spectrum');
  expect(flowerGated).toContain('bloom_master');
});

// ─── 8. getCurrentSeasonStickerId returns seasonal_spring for April ───────────

it('8. getCurrentSeasonStickerId returns seasonal_spring for April (month 3)', () => {
  const april = new Date(2026, 3, 15); // month index 3 = April
  expect(getCurrentSeasonStickerId(april)).toBe('seasonal_spring');
});

// ─── 9. getCurrentSeasonStickerId returns seasonal_winter for January ─────────

it('9. getCurrentSeasonStickerId returns seasonal_winter for January (month 0)', () => {
  const january = new Date(2026, 0, 10); // month index 0 = January
  expect(getCurrentSeasonStickerId(january)).toBe('seasonal_winter');
});

// ─── 10. topThreeForRow returns 3 stickers when flowersEnabled=false ─────────

it('10. topThreeForRow returns exactly 3 stickers when flowersEnabled=false', () => {
  const earnedSet = new Set<typeof STICKER_IDS[number]>();
  const result = topThreeForRow(earnedSet, false);
  expect(result).toHaveLength(3);
  // All returned stickers must have enabledWhen='always' (flowers gated)
  for (const s of result) {
    expect(s.enabledWhen).toBe('always');
  }
});

// ─── 11. topThreeForRow returns 3 stickers when flowersEnabled=true ──────────

it('11. topThreeForRow returns exactly 3 stickers when flowersEnabled=true', () => {
  const earnedSet = new Set<typeof STICKER_IDS[number]>();
  const result = topThreeForRow(earnedSet, true);
  expect(result).toHaveLength(3);
});

// ─── 12. sortKey — earned stickers rank higher than unearned ─────────────────

it('12. sortKey: earned sticker ranks higher than unearned with same heroWeight', () => {
  const s = STICKERS['welcome'];
  const earnedKey = sortKey(s, true);
  const unearnedKey = sortKey(s, false);
  expect(earnedKey).toBeGreaterThan(unearnedKey);
});
