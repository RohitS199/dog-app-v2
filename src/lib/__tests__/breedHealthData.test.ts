import { getBreedHealthConcerns } from '../../constants/breedHealthData';

describe('getBreedHealthConcerns', () => {
  it('returns specific concerns for a known breed', () => {
    const concerns = getBreedHealthConcerns('Golden Retriever');
    expect(concerns.length).toBeGreaterThanOrEqual(3);
    expect(concerns.length).toBeLessThanOrEqual(4);
    expect(concerns[0].title).toBe('Hip & Elbow Dysplasia');
  });

  it('is case-insensitive', () => {
    const lower = getBreedHealthConcerns('golden retriever');
    const upper = getBreedHealthConcerns('GOLDEN RETRIEVER');
    expect(lower[0].title).toBe(upper[0].title);
  });

  it('trims whitespace', () => {
    const concerns = getBreedHealthConcerns('  golden retriever  ');
    expect(concerns[0].title).toBe('Hip & Elbow Dysplasia');
  });

  it('returns generic fallback for unknown breed', () => {
    const concerns = getBreedHealthConcerns('Xoloitzcuintli');
    expect(concerns.length).toBe(4);
    expect(concerns[0].title).toBe('Joint Health');
  });

  it('returns generic fallback for empty string', () => {
    const concerns = getBreedHealthConcerns('');
    expect(concerns.length).toBe(4);
    expect(concerns[0].title).toBe('Joint Health');
  });

  it('each concern has required fields', () => {
    const concerns = getBreedHealthConcerns('Beagle');
    for (const concern of concerns) {
      expect(concern.title).toBeTruthy();
      expect(concern.description).toBeTruthy();
      expect(concern.icon).toBeTruthy();
    }
  });

  it('returns max 4 concerns', () => {
    const breeds = ['golden retriever', 'beagle', 'pug', 'german shepherd'];
    for (const breed of breeds) {
      expect(getBreedHealthConcerns(breed).length).toBeLessThanOrEqual(4);
    }
  });

  it('matches partial breed names', () => {
    const concerns = getBreedHealthConcerns('lab');
    // Should match 'labrador retriever'
    expect(concerns.some((c) => c.title === 'Obesity')).toBe(true);
  });
});
