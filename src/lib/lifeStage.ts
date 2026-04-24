export type LifeStage = 'Puppy' | 'Young Adult' | 'Adult' | 'Mature' | 'Senior';

export interface BirthdayAge {
  years: number;
  months: number;
}

export function computeAge(
  month: number,
  day: number,
  year: number,
  now: Date = new Date()
): BirthdayAge {
  let years = now.getFullYear() - year;
  let months = now.getMonth() + 1 - month;

  if (now.getDate() < day) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months) };
}

export function getLifeStage(ageYears: number): LifeStage {
  if (ageYears < 1) return 'Puppy';
  if (ageYears < 4) return 'Young Adult';
  if (ageYears < 8) return 'Adult';
  if (ageYears < 11) return 'Mature';
  return 'Senior';
}

export function formatAge(age: BirthdayAge): string {
  if (age.years === 0 && age.months === 0) return 'Less than a month';
  const parts: string[] = [];
  if (age.years > 0) {
    parts.push(`${age.years} yr${age.years !== 1 ? 's' : ''}`);
  }
  if (age.months > 0) {
    parts.push(`${age.months} mo`);
  }
  return parts.join(', ');
}

export function ageToDecimalYears(age: BirthdayAge): number {
  return age.years + age.months / 12;
}
