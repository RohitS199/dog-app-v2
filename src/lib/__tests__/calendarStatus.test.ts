import { computeDayStatuses } from '../calendarStatus';
import type { DailyCheckIn } from '../../types/checkIn';

function makeCheckIn(date: string): DailyCheckIn {
  return {
    id: `id-${date}`,
    user_id: 'u1',
    dog_id: 'd1',
    check_in_date: date,
    appetite: 'normal',
    water_intake: 'normal',
    energy_level: 'normal',
    stool_quality: 'normal',
    vomiting: 'none',
    mobility: 'normal',
    mood: 'normal',
    additional_symptoms: [],
    free_text: null,
    emergency_flagged: false,
    revision_history: [],
    created_at: `${date}T00:00:00Z`,
    updated_at: `${date}T00:00:00Z`,
  };
}

describe('computeDayStatuses', () => {
  const today = '2026-06-15';

  it('marks days after today as future', () => {
    const statuses = computeDayStatuses({}, 2026, 6, today);
    expect(statuses['2026-06-16']).toBe('future');
    expect(statuses['2026-06-30']).toBe('future');
  });

  it('marks past days with no check-in as missed', () => {
    const statuses = computeDayStatuses({}, 2026, 6, today);
    expect(statuses['2026-06-10']).toBe('missed');
  });

  it('marks a logged day with fewer than 5 trailing days as new', () => {
    const data: Record<string, DailyCheckIn> = {
      '2026-06-10': makeCheckIn('2026-06-10'),
    };
    const statuses = computeDayStatuses(data, 2026, 6, today);
    expect(statuses['2026-06-10']).toBe('new');
  });

  it('marks a logged day with 5+ consistent trailing days as good', () => {
    const data: Record<string, DailyCheckIn> = {};
    for (const d of ['06', '07', '08', '09', '10']) {
      data[`2026-06-${d}`] = makeCheckIn(`2026-06-${d}`);
    }
    const statuses = computeDayStatuses(data, 2026, 6, today);
    expect(statuses['2026-06-10']).toBe('good');
  });
});
