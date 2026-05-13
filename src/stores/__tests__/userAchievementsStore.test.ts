import { useUserAchievementsStore } from '../userAchievementsStore';
import { supabase } from '../../lib/supabase';

// Cast supabase to any for mock access
const mockSupabase = supabase as any;

const initialState = {
  earnedIds: new Set(),
  earnedRecords: [],
  isLoading: false,
  error: null,
  lastEarned: null,
  seasonalCheckedThisSession: false,
};

beforeEach(() => {
  useUserAchievementsStore.setState({ ...initialState, earnedIds: new Set() });
  jest.clearAllMocks();
});

// ─── Helper: mock auth user ───────────────────────────────────────────────────

function mockAuthUser(userId = 'user-abc') {
  mockSupabase.auth.getUser = jest.fn(() =>
    Promise.resolve({
      data: { user: { id: userId } },
      error: null,
    })
  );
}

function mockAuthFailure() {
  mockSupabase.auth.getUser = jest.fn(() =>
    Promise.resolve({
      data: { user: null },
      error: { message: 'Not authenticated' },
    })
  );
}

// ─── 1. Initial state ─────────────────────────────────────────────────────────

it('1. initial state: empty earnedIds set, not loading, lastEarned null', () => {
  const state = useUserAchievementsStore.getState();
  expect(state.earnedIds.size).toBe(0);
  expect(state.isLoading).toBe(false);
  expect(state.lastEarned).toBeNull();
  expect(state.error).toBeNull();
  expect(state.seasonalCheckedThisSession).toBe(false);
});

// ─── 2. fetch populates earnedIds from rows ───────────────────────────────────

it('2. fetch populates earnedIds from DB rows', async () => {
  mockAuthUser();

  const MOCK_ROWS = [
    { sticker_id: 'welcome', earned_at: '2026-01-01T00:00:00Z', metadata: null },
    { sticker_id: 'multi_pup_parent', earned_at: '2026-02-01T00:00:00Z', metadata: null },
  ];

  mockSupabase.from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: MOCK_ROWS, error: null })),
  }));

  await useUserAchievementsStore.getState().fetch();

  const state = useUserAchievementsStore.getState();
  expect(state.earnedIds.has('welcome')).toBe(true);
  expect(state.earnedIds.has('multi_pup_parent')).toBe(true);
  expect(state.earnedIds.size).toBe(2);
  expect(state.earnedRecords).toHaveLength(2);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
});

// ─── 3. fetch handles empty rows (no error) ───────────────────────────────────

it('3. fetch handles empty rows without setting an error', async () => {
  mockAuthUser();

  mockSupabase.from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  }));

  await useUserAchievementsStore.getState().fetch();

  const state = useUserAchievementsStore.getState();
  expect(state.earnedIds.size).toBe(0);
  expect(state.earnedRecords).toHaveLength(0);
  expect(state.error).toBeNull();
  expect(state.isLoading).toBe(false);
});

// ─── 4. fetch sets error on auth failure ──────────────────────────────────────

it('4. fetch sets error when auth fails', async () => {
  mockAuthFailure();

  await useUserAchievementsStore.getState().fetch();

  const state = useUserAchievementsStore.getState();
  expect(state.error).toBeTruthy();
  expect(state.isLoading).toBe(false);
});

// ─── 5. checkSeasonal is idempotent (second call is a no-op) ─────────────────

it('5. checkSeasonal is idempotent: second call within session is a no-op', async () => {
  mockAuthUser();

  // Sticker not yet earned → invoke will be called first time
  mockSupabase.from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  }));
  mockSupabase.functions = {
    invoke: jest.fn(() => Promise.resolve({ data: { newly_earned: [] }, error: null })),
  };

  await useUserAchievementsStore.getState().checkSeasonal();
  const invokeCalls1 = (mockSupabase.functions.invoke as jest.Mock).mock.calls.length;

  // Second call — session flag set, should be a no-op
  await useUserAchievementsStore.getState().checkSeasonal();
  const invokeCalls2 = (mockSupabase.functions.invoke as jest.Mock).mock.calls.length;

  expect(invokeCalls2).toBe(invokeCalls1); // no additional calls
});

// ─── 6. checkSeasonal does nothing if seasonal sticker already earned ─────────

it('6. checkSeasonal does not invoke edge function when seasonal sticker already earned', async () => {
  mockAuthUser();

  // Pre-seed with the current season sticker already earned
  // May 2026 is "seasonal_spring"
  useUserAchievementsStore.setState({
    earnedIds: new Set(['seasonal_spring']),
    earnedRecords: [],
    isLoading: false,
    error: null,
    lastEarned: null,
    seasonalCheckedThisSession: false,
  });

  const invokeMock = jest.fn();
  mockSupabase.functions = { invoke: invokeMock };

  // Date mock: May (month 4) → seasonal_spring
  const realDateNow = Date;
  global.Date = class extends realDateNow {
    constructor(...args: any[]) {
      if (args.length === 0) {
        super(2026, 4, 12); // May 12 2026
      } else {
        super(...(args as [any]));
      }
    }
  } as any;

  await useUserAchievementsStore.getState().checkSeasonal();

  global.Date = realDateNow;

  // invoke should NOT have been called
  expect(invokeMock).not.toHaveBeenCalled();
  // Session flag should be set regardless
  expect(useUserAchievementsStore.getState().seasonalCheckedThisSession).toBe(true);
});

// ─── 7. triggerEventCheck calls invoke with correct payload ──────────────────

it('7. triggerEventCheck calls supabase.functions.invoke with correct event payload', async () => {
  mockAuthUser('user-xyz');

  mockSupabase.from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  }));

  const invokeMock = jest.fn(() =>
    Promise.resolve({ data: { newly_earned: [] }, error: null })
  );
  mockSupabase.functions = { invoke: invokeMock };

  await useUserAchievementsStore.getState().triggerEventCheck('dog_added', 'dog-123');

  expect(invokeMock).toHaveBeenCalledWith('check-achievements', {
    body: { user_id: 'user-xyz', event_type: 'dog_added', dog_id: 'dog-123' },
  });
});

// ─── 8. triggerEventCheck updates earnedIds when newly_earned returned ────────

it('8. triggerEventCheck updates earnedIds when newly_earned is returned', async () => {
  mockAuthUser();

  // After invoke, refetch returns the new sticker
  let fetchCallCount = 0;
  mockSupabase.from = jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn(() => {
      fetchCallCount += 1;
      if (fetchCallCount === 1) {
        // First fetch: returns multi_pup_parent as newly earned
        return Promise.resolve({
          data: [
            { sticker_id: 'multi_pup_parent', earned_at: '2026-05-12T00:00:00Z', metadata: null },
          ],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    }),
  }));

  mockSupabase.functions = {
    invoke: jest.fn(() =>
      Promise.resolve({ data: { newly_earned: ['multi_pup_parent'] }, error: null })
    ),
  };

  await useUserAchievementsStore.getState().triggerEventCheck('dog_added');

  const state = useUserAchievementsStore.getState();
  expect(state.earnedIds.has('multi_pup_parent')).toBe(true);
  expect(state.lastEarned).toBe('multi_pup_parent');
});

// ─── 9. clearLastEarned zeros only lastEarned ────────────────────────────────

it('9. clearLastEarned sets lastEarned to null without touching other state', () => {
  useUserAchievementsStore.setState({
    earnedIds: new Set(['welcome']),
    earnedRecords: [{ id: 'welcome', earned_at: '2026-01-01T00:00:00Z', metadata: null }],
    isLoading: false,
    error: null,
    lastEarned: 'welcome',
    seasonalCheckedThisSession: true,
  });

  useUserAchievementsStore.getState().clearLastEarned();

  const state = useUserAchievementsStore.getState();
  expect(state.lastEarned).toBeNull();
  // Other state untouched
  expect(state.earnedIds.has('welcome')).toBe(true);
  expect(state.earnedRecords).toHaveLength(1);
  expect(state.seasonalCheckedThisSession).toBe(true);
});

// ─── 10. clearAchievements zeros everything ───────────────────────────────────

it('10. clearAchievements resets all state to initial values', () => {
  useUserAchievementsStore.setState({
    earnedIds: new Set(['welcome', 'multi_pup_parent']),
    earnedRecords: [
      { id: 'welcome', earned_at: '2026-01-01T00:00:00Z', metadata: null },
    ],
    isLoading: true,
    error: 'some error',
    lastEarned: 'welcome',
    seasonalCheckedThisSession: true,
  });

  useUserAchievementsStore.getState().clearAchievements();

  const state = useUserAchievementsStore.getState();
  expect(state.earnedIds.size).toBe(0);
  expect(state.earnedRecords).toHaveLength(0);
  expect(state.isLoading).toBe(false);
  expect(state.error).toBeNull();
  expect(state.lastEarned).toBeNull();
  expect(state.seasonalCheckedThisSession).toBe(false);
});
