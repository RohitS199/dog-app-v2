import { formatBirthdayDisplay } from '../formatBirthday';

describe('formatBirthdayDisplay', () => {
  it('formats a normal ISO date string', () => {
    expect(formatBirthdayDisplay('1992-05-14')).toBe('May 14, 1992');
  });

  it('returns empty string for null', () => {
    expect(formatBirthdayDisplay(null)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(formatBirthdayDisplay('')).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(formatBirthdayDisplay(undefined)).toBe('');
  });

  it('formats January correctly (month 1)', () => {
    expect(formatBirthdayDisplay('2000-01-01')).toBe('January 1, 2000');
  });

  it('formats December correctly (month 12)', () => {
    expect(formatBirthdayDisplay('1985-12-31')).toBe('December 31, 1985');
  });

  it('does not shift date due to UTC offset (timezone-safety)', () => {
    // "1992-05-14" must render May 14, not May 13
    const result = formatBirthdayDisplay('1992-05-14');
    expect(result).toBe('May 14, 1992');
  });
});
