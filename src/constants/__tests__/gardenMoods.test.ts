import { GARDEN_MOODS, GARDEN_MOOD_COLORS, GARDEN_MOOD_LABELS, isGardenMood } from '../gardenMoods';

describe('gardenMoods', () => {
  it('defines exactly the 8 canonical moods in order', () => {
    expect(GARDEN_MOODS).toEqual([
      'joyful', 'playful', 'affectionate', 'calm', 'curious', 'tired', 'anxious', 'unwell',
    ]);
  });

  it('has a hex color and a label for every mood', () => {
    for (const mood of GARDEN_MOODS) {
      expect(GARDEN_MOOD_COLORS[mood]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(GARDEN_MOOD_LABELS[mood].length).toBeGreaterThan(0);
    }
  });

  it('does NOT overlap the clinical mood enum except for "anxious"', () => {
    const clinical = ['normal', 'quiet', 'anxious', 'clingy', 'hiding', 'aggressive'];
    const overlap = GARDEN_MOODS.filter((m) => (clinical as string[]).includes(m));
    expect(overlap).toEqual(['anxious']);
  });

  it('isGardenMood narrows correctly', () => {
    expect(isGardenMood('joyful')).toBe(true);
    expect(isGardenMood('aggressive')).toBe(false); // clinical-only value
    expect(isGardenMood(null)).toBe(false);
    expect(isGardenMood(42)).toBe(false);
  });
});
