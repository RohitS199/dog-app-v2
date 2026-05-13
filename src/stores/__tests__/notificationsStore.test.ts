import { useNotificationsStore } from '../notificationsStore';
import { supabase } from '../../lib/supabase';

// Cast supabase to any for mock access
const mockSupabase = supabase as any;

const MOCK_PREFS = {
  notify_daily_log_reminder: true,
  notify_weekly_insight: true,
  notify_vet_appointments: true,
  notify_garden_milestones: false,
  notify_quiet_hours_enabled: true,
  notify_quiet_hours_start: '22:00',
  notify_quiet_hours_end: '07:00',
  face_id_enabled: false,
  two_factor_enabled: false,
  privacy_anonymous_analytics: true,
  privacy_personalized_tips: false,
  privacy_marketing_emails: false,
  timezone: 'America/Los_Angeles',
};

const initialState = {
  prefs: null,
  isLoading: false,
  error: null,
};

beforeEach(() => {
  useNotificationsStore.setState(initialState);
  jest.clearAllMocks();
});

// ─── Helper: sets up a successful auth + from() mock ─────────────────────────

function mockAuthUser(userId = 'user-123') {
  mockSupabase.auth.getUser = jest.fn(() =>
    Promise.resolve({
      data: { user: { id: userId } },
      error: null,
    })
  );
}

function mockFromWithRow(row: typeof MOCK_PREFS | null) {
  mockSupabase.from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(() => Promise.resolve({ data: row, error: null })),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }));
}

// ─── 1. Initial state ─────────────────────────────────────────────────────────

describe('notificationsStore', () => {
  it('1. initial state: prefs is null, not loading, no error', () => {
    const state = useNotificationsStore.getState();
    expect(state.prefs).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ─── 2. fetch populates prefs ───────────────────────────────────────────────

  it('2. fetch populates prefs from the user_preferences row', async () => {
    mockAuthUser();
    mockFromWithRow(MOCK_PREFS);

    await useNotificationsStore.getState().fetch();

    const state = useNotificationsStore.getState();
    expect(state.prefs).not.toBeNull();
    expect(state.prefs!.notify_daily_log_reminder).toBe(true);
    expect(state.prefs!.face_id_enabled).toBe(false);
    expect(state.prefs!.privacy_personalized_tips).toBe(false);
    expect(state.prefs!.timezone).toBe('America/Los_Angeles');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ─── 3. fetch handles missing row ──────────────────────────────────────────

  it('3. fetch handles missing row with defensive INSERT then re-fetch', async () => {
    mockAuthUser();

    let callCount = 0;
    mockSupabase.from = jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(() => {
        callCount += 1;
        if (callCount === 1) {
          // First call: row is missing
          return Promise.resolve({ data: null, error: null });
        }
        // Second call: after insert
        return Promise.resolve({ data: { ...MOCK_PREFS }, error: null });
      }),
      insert: jest.fn(() => ({
        select: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      update: jest.fn().mockReturnThis(),
    }));

    await useNotificationsStore.getState().fetch();

    const state = useNotificationsStore.getState();
    expect(state.prefs).not.toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ─── 4. fetch sets error on auth failure ───────────────────────────────────

  it('4. fetch sets error on auth failure', async () => {
    mockSupabase.auth.getUser = jest.fn(() =>
      Promise.resolve({
        data: { user: null },
        error: { message: 'Not authenticated' },
      })
    );

    await useNotificationsStore.getState().fetch();

    const state = useNotificationsStore.getState();
    expect(state.prefs).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeTruthy();
  });

  // ─── 5. toggle flips value optimistically ──────────────────────────────────

  it('5. toggle flips value optimistically before Supabase resolves', async () => {
    useNotificationsStore.setState({ prefs: { ...MOCK_PREFS } });

    mockAuthUser();

    let resolveUpdate: (val: any) => void;
    const pendingUpdate = new Promise((res) => { resolveUpdate = res; });

    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => pendingUpdate),
      })),
    }));

    const togglePromise = useNotificationsStore.getState().toggle('notify_daily_log_reminder');

    // While still in flight, the optimistic update should be applied
    const midState = useNotificationsStore.getState();
    expect(midState.prefs!.notify_daily_log_reminder).toBe(false); // was true, now flipped

    // Resolve the update
    resolveUpdate!({ error: null });
    await togglePromise;

    // Still flipped after resolution
    expect(useNotificationsStore.getState().prefs!.notify_daily_log_reminder).toBe(false);
  });

  // ─── 6. toggle calls supabase update with correct key ──────────────────────

  it('6. toggle calls supabase.from.update with the correct key and new value', async () => {
    useNotificationsStore.setState({ prefs: { ...MOCK_PREFS } });
    mockAuthUser();

    const updateMock = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    }));
    mockSupabase.from = jest.fn(() => ({ update: updateMock }));

    await useNotificationsStore.getState().toggle('notify_weekly_insight');

    expect(mockSupabase.from).toHaveBeenCalledWith('user_preferences');
    expect(updateMock).toHaveBeenCalledWith({ notify_weekly_insight: false }); // was true, toggled to false
  });

  // ─── 7. toggle reverts on supabase error ───────────────────────────────────

  it('7. toggle reverts local state on Supabase error', async () => {
    useNotificationsStore.setState({ prefs: { ...MOCK_PREFS } });
    mockAuthUser();

    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: { message: 'DB error' } })),
      })),
    }));

    await useNotificationsStore.getState().toggle('face_id_enabled');

    // face_id_enabled was false, toggled to true (optimistic), then reverted to false
    expect(useNotificationsStore.getState().prefs!.face_id_enabled).toBe(false);
    expect(useNotificationsStore.getState().error).toBeTruthy();
  });

  // ─── 8. toggle is no-op when prefs is null ─────────────────────────────────

  it('8. toggle is a no-op when prefs is null (guard)', async () => {
    useNotificationsStore.setState({ prefs: null });
    mockAuthUser();

    const fromSpy = jest.fn();
    mockSupabase.from = fromSpy;

    await useNotificationsStore.getState().toggle('two_factor_enabled');

    // from() should never have been called
    expect(fromSpy).not.toHaveBeenCalled();
    expect(useNotificationsStore.getState().prefs).toBeNull();
  });

  // ─── 9. clearNotifications zeros state ─────────────────────────────────────

  it('9. clearNotifications resets state to initial', () => {
    useNotificationsStore.setState({
      prefs: { ...MOCK_PREFS },
      isLoading: true,
      error: 'some error',
    });

    useNotificationsStore.getState().clearNotifications();

    const state = useNotificationsStore.getState();
    expect(state.prefs).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  // ─── 10. Multiple toggles work independently ───────────────────────────────

  it('10. toggling one key does not affect other keys', async () => {
    useNotificationsStore.setState({ prefs: { ...MOCK_PREFS } });
    mockAuthUser();

    mockSupabase.from = jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    }));

    await useNotificationsStore.getState().toggle('notify_garden_milestones');

    const state = useNotificationsStore.getState();
    // The toggled key changed (false -> true)
    expect(state.prefs!.notify_garden_milestones).toBe(true);
    // Other keys remain untouched
    expect(state.prefs!.notify_daily_log_reminder).toBe(true);
    expect(state.prefs!.notify_weekly_insight).toBe(true);
    expect(state.prefs!.notify_vet_appointments).toBe(true);
    expect(state.prefs!.face_id_enabled).toBe(false);
    expect(state.prefs!.timezone).toBe('America/Los_Angeles');
  });

  // ─── 11. Toggle of notify_daily_log_reminder (sanity check) ───────────────

  it('11. toggle of notify_daily_log_reminder updates that key correctly', async () => {
    useNotificationsStore.setState({ prefs: { ...MOCK_PREFS, notify_daily_log_reminder: true } });
    mockAuthUser();

    const updateMock = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    }));
    mockSupabase.from = jest.fn(() => ({ update: updateMock }));

    await useNotificationsStore.getState().toggle('notify_daily_log_reminder');

    expect(useNotificationsStore.getState().prefs!.notify_daily_log_reminder).toBe(false);
    expect(updateMock).toHaveBeenCalledWith({ notify_daily_log_reminder: false });
  });

  // ─── 12. Toggle of privacy_personalized_tips (sanity check) ───────────────

  it('12. toggle of privacy_personalized_tips updates that key correctly', async () => {
    useNotificationsStore.setState({ prefs: { ...MOCK_PREFS, privacy_personalized_tips: false } });
    mockAuthUser();

    const updateMock = jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null })),
    }));
    mockSupabase.from = jest.fn(() => ({ update: updateMock }));

    await useNotificationsStore.getState().toggle('privacy_personalized_tips');

    expect(useNotificationsStore.getState().prefs!.privacy_personalized_tips).toBe(true);
    expect(updateMock).toHaveBeenCalledWith({ privacy_personalized_tips: true });
  });
});
