import { useGardenStore } from '../gardenStore';
import { supabase } from '../../lib/supabase';
import { uploadGardenMedia } from '../../lib/uploadGardenMedia';

jest.mock('../../lib/uploadGardenMedia', () => ({ uploadGardenMedia: jest.fn() }));

// Stub the supabase chain plantFlower uses: from().upsert().select().single() for the
// write, then from().select().eq().gte().lte() for the fetchWeek refresh. Returns the
// upsert spy so tests can assert the payload.
function mockPlantSupabase() {
  const single = jest.fn().mockResolvedValue({ data: { id: 'g9' }, error: null });
  const upsert = jest.fn(() => ({ select: () => ({ single }) }));
  (supabase.from as jest.Mock) = jest.fn(() => ({
    upsert,
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockResolvedValue({ data: [], error: null }),
  }));
  (supabase.auth as unknown as { getUser: jest.Mock }).getUser = jest
    .fn()
    .mockResolvedValue({ data: { user: { id: 'u1' } } });
  return upsert;
}

describe('gardenStore', () => {
  beforeEach(() => {
    useGardenStore.setState({ week: null, isLoading: false, error: null, dogId: null });
    (uploadGardenMedia as jest.Mock).mockReset();
  });

  it('starts empty', () => {
    const s = useGardenStore.getState();
    expect(s.week).toBeNull();
    expect(s.isLoading).toBe(false);
  });

  it('deriveWeek builds a GardenWeek and derives tier from row fields', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: 'joyful', health_chips: [], note: null },
      { id: 'c2', log_date: '2026-06-17', garden_mood: 'calm', health_chips: ['scratching'], note: 'itchy' },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.days).toHaveLength(7);
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'joyful', tier: 1 }); // mood only -> T1
    expect(week.days[2]).toMatchObject({ state: 'planted', moodKey: 'calm', tier: 3 });   // note -> T3
    expect(week.plantedCount).toBe(2);
  });

  it('derives tier 3 from a stored photo_url alone (no note/chip)', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: 'joyful', health_chips: [], note: null, photo_url: 'https://cdn/x.jpg', video_url: null },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'joyful', tier: 3 });
  });

  it('derives tier 3 from a stored video_url alone', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: 'playful', health_chips: [], note: null, photo_url: null, video_url: 'https://cdn/v.mp4' },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'playful', tier: 3 });
  });

  it('derives tier 2 from a health chip alone (no note)', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: 'playful', health_chips: ['x'], note: null },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.days[0]).toMatchObject({ state: 'planted', moodKey: 'playful', tier: 2 });
  });

  it('skips rows with a null/invalid garden_mood (un-planted in the garden)', () => {
    const rows = [
      { id: 'c1', log_date: '2026-06-15', garden_mood: null, health_chips: [], note: null },
      { id: 'c2', log_date: '2026-06-16', garden_mood: 'not_a_mood', health_chips: [], note: null },
    ];
    const week = useGardenStore.getState().deriveWeek('2026-06-20', rows as any);
    expect(week.plantedCount).toBe(0);
    expect(week.days[0].state).toBe('empty');
  });

  it('clearGarden resets state', () => {
    useGardenStore.setState({ week: { weekStart: 'x', days: [], plantedCount: 0 }, dogId: 'd1' });
    useGardenStore.getState().clearGarden();
    expect(useGardenStore.getState().week).toBeNull();
    expect(useGardenStore.getState().dogId).toBeNull();
  });

  it('plantFlower upserts to garden_logs (emergency_flagged false when no note)', async () => {
    const upsert = mockPlantSupabase();
    const ok = await useGardenStore.getState().plantFlower('dog-1', {
      log_date: '2026-06-23', garden_mood: 'playful', health_chips: [], note: null,
    });
    expect(ok).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('garden_logs');
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', dog_id: 'dog-1', garden_mood: 'playful', emergency_flagged: false }),
      expect.objectContaining({ onConflict: 'dog_id,log_date' }),
    );
  });

  it('plantFlower re-runs emergency detection on the note (Golden Rule)', async () => {
    const upsert = mockPlantSupabase();
    await useGardenStore.getState().plantFlower('dog-1', {
      log_date: '2026-06-23', garden_mood: 'unwell', health_chips: [], note: 'ate rat poison',
    });
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ emergency_flagged: true }),
      expect.anything(),
    );
  });

  it('plantFlower uploads media and writes its URL onto the row', async () => {
    const upsert = mockPlantSupabase();
    (uploadGardenMedia as jest.Mock).mockResolvedValue({ kind: 'photo', url: 'https://cdn/u1/p.jpg', path: 'u1/dog-1/x' });
    const ok = await useGardenStore.getState().plantFlower('dog-1', {
      log_date: '2026-06-23', garden_mood: 'joyful', health_chips: [], note: null,
      media: { uri: 'file:///p.jpg', kind: 'photo' },
    });
    expect(ok).toBe(true);
    expect(uploadGardenMedia).toHaveBeenCalledWith(
      { uri: 'file:///p.jpg', kind: 'photo' },
      expect.objectContaining({ userId: 'u1', dogId: 'dog-1', logDate: '2026-06-23' }),
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ photo_url: 'https://cdn/u1/p.jpg' }),
      expect.anything(),
    );
  });

  it('plantFlower without media does not upload or set media columns', async () => {
    const upsert = mockPlantSupabase();
    await useGardenStore.getState().plantFlower('dog-1', {
      log_date: '2026-06-23', garden_mood: 'calm', health_chips: [], note: null,
    });
    expect(uploadGardenMedia).not.toHaveBeenCalled();
    const payload = (upsert.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty('photo_url');
    expect(payload).not.toHaveProperty('video_url');
  });

  it('plantFlower fails (no upsert) when media upload throws', async () => {
    const upsert = mockPlantSupabase();
    (uploadGardenMedia as jest.Mock).mockRejectedValue(new Error('upload boom'));
    const ok = await useGardenStore.getState().plantFlower('dog-1', {
      log_date: '2026-06-23', garden_mood: 'joyful', health_chips: [], note: null,
      media: { uri: 'file:///p.jpg', kind: 'photo' },
    });
    expect(ok).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('plantFlower rejects an invalid garden_mood without touching supabase', async () => {
    const upsert = mockPlantSupabase();
    const ok = await useGardenStore.getState().plantFlower('dog-1', {
      log_date: '2026-06-23', garden_mood: 'happy' as never, health_chips: [], note: null,
    });
    expect(ok).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('plantFlower rejects an over-long note without touching supabase', async () => {
    const upsert = mockPlantSupabase();
    const ok = await useGardenStore.getState().plantFlower('dog-1', {
      log_date: '2026-06-23', garden_mood: 'calm', health_chips: [], note: 'x'.repeat(501),
    });
    expect(ok).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });
});
