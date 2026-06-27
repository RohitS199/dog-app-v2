import { computeFlowerTier, FlowerTierInput } from '../flowerTier';

function input(overrides: Partial<FlowerTierInput> = {}): FlowerTierInput {
  return { mood: 'calm', hasHealthChip: false, hasPhoto: false, hasVideo: false, hasNote: false, ...overrides };
}

describe('computeFlowerTier', () => {
  it('tier 0 when no mood is picked', () => {
    expect(computeFlowerTier(input({ mood: null }))).toBe(0);
  });

  it('tier 1 for mood only', () => {
    expect(computeFlowerTier(input())).toBe(1);
  });

  it('tier 2 for mood + a health chip', () => {
    expect(computeFlowerTier(input({ hasHealthChip: true }))).toBe(2);
  });

  it('tier 3 for a note even with zero health chips (evidence beats breadth)', () => {
    expect(computeFlowerTier(input({ hasHealthChip: false, hasNote: true }))).toBe(3);
  });

  it('tier 3 for a photo', () => {
    expect(computeFlowerTier(input({ hasPhoto: true }))).toBe(3);
  });

  it('tier 3 for a video (the branch the literal mockup port would drop)', () => {
    expect(computeFlowerTier(input({ hasVideo: true }))).toBe(3);
  });

  it('photo/note/video outrank health chips (first-match order)', () => {
    expect(computeFlowerTier(input({ hasHealthChip: true, hasNote: true }))).toBe(3);
  });
});
