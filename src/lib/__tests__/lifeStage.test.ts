import { computeAge, getLifeStage, formatAge, ageToDecimalYears } from '../lifeStage';

describe('computeAge', () => {
  it('computes age for a birthday 3 years ago', () => {
    const now = new Date(2026, 3, 24); // April 24, 2026
    const age = computeAge(4, 12, 2023, now);
    expect(age.years).toBe(3);
    expect(age.months).toBe(0);
  });

  it('computes age when birthday has not occurred yet this year', () => {
    const now = new Date(2026, 1, 15); // Feb 15, 2026
    const age = computeAge(6, 10, 2023, now);
    expect(age.years).toBe(2);
    expect(age.months).toBe(8);
  });

  it('computes age for a puppy under 1 year', () => {
    const now = new Date(2026, 3, 24);
    const age = computeAge(10, 1, 2025, now);
    expect(age.years).toBe(0);
    expect(age.months).toBe(6);
  });

  it('computes age when day has not passed yet in the month', () => {
    const now = new Date(2026, 3, 5); // April 5, 2026
    const age = computeAge(4, 20, 2024, now); // Birthday April 20
    expect(age.years).toBe(1);
    expect(age.months).toBe(11);
  });

  it('returns 0 years 0 months for same month and year', () => {
    const now = new Date(2026, 3, 24);
    const age = computeAge(4, 24, 2026, now);
    expect(age.years).toBe(0);
    expect(age.months).toBe(0);
  });

  it('never returns negative values', () => {
    const now = new Date(2026, 0, 1);
    const age = computeAge(6, 15, 2026, now);
    expect(age.years).toBeGreaterThanOrEqual(0);
    expect(age.months).toBeGreaterThanOrEqual(0);
  });
});

describe('getLifeStage', () => {
  it('returns Puppy for under 1 year', () => {
    expect(getLifeStage(0)).toBe('Puppy');
    expect(getLifeStage(0.5)).toBe('Puppy');
  });

  it('returns Young Adult for 1-3 years', () => {
    expect(getLifeStage(1)).toBe('Young Adult');
    expect(getLifeStage(3)).toBe('Young Adult');
  });

  it('returns Adult for 4-7 years', () => {
    expect(getLifeStage(4)).toBe('Adult');
    expect(getLifeStage(7)).toBe('Adult');
  });

  it('returns Mature for 8-10 years', () => {
    expect(getLifeStage(8)).toBe('Mature');
    expect(getLifeStage(10)).toBe('Mature');
  });

  it('returns Senior for 11+ years', () => {
    expect(getLifeStage(11)).toBe('Senior');
    expect(getLifeStage(15)).toBe('Senior');
  });
});

describe('formatAge', () => {
  it('formats years and months', () => {
    expect(formatAge({ years: 3, months: 2 })).toBe('3 yrs, 2 mo');
  });

  it('formats years only', () => {
    expect(formatAge({ years: 5, months: 0 })).toBe('5 yrs');
  });

  it('formats months only', () => {
    expect(formatAge({ years: 0, months: 8 })).toBe('8 mo');
  });

  it('formats singular year', () => {
    expect(formatAge({ years: 1, months: 0 })).toBe('1 yr');
  });

  it('handles zero age', () => {
    expect(formatAge({ years: 0, months: 0 })).toBe('Less than a month');
  });
});

describe('ageToDecimalYears', () => {
  it('converts age to decimal', () => {
    expect(ageToDecimalYears({ years: 3, months: 6 })).toBe(3.5);
  });

  it('handles zero months', () => {
    expect(ageToDecimalYears({ years: 5, months: 0 })).toBe(5);
  });
});
