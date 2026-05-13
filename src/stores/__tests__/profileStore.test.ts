import { useProfileStore, splitName } from '../profileStore';
import { supabase } from '../../lib/supabase';

// Cast supabase to any for mock access
const mockSupabase = supabase as any;

const initialState = {
  loaded: null,
  draft: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

beforeEach(() => {
  useProfileStore.setState(initialState);
  jest.clearAllMocks();
});

// ─── splitName helper ────────────────────────────────────────────────────────

describe('splitName', () => {
  it('splits "Mary Anne Smith" into first="Mary" and last="Anne Smith"', () => {
    const result = splitName('Mary Anne Smith');
    expect(result.first).toBe('Mary');
    expect(result.last).toBe('Anne Smith');
  });

  it('handles a single-word name (last is empty string)', () => {
    const result = splitName('Madonna');
    expect(result.first).toBe('Madonna');
    expect(result.last).toBe('');
  });

  it('handles empty string (both empty)', () => {
    const result = splitName('');
    expect(result.first).toBe('');
    expect(result.last).toBe('');
  });

  it('handles leading/trailing whitespace trimming', () => {
    const result = splitName('  John  Doe  ');
    expect(result.first).toBe('John');
    expect(result.last).toBe('Doe');
  });
});

// ─── loadFromAuthAndProfile ──────────────────────────────────────────────────

describe('profileStore', () => {
  describe('loadFromAuthAndProfile', () => {
    it('populates loaded and draft from auth user + user_profiles row', async () => {
      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'user-123',
              email: 'test@example.com',
              user_metadata: { first_name: 'Alice', last_name: 'Smith' },
            },
          },
          error: null,
        })
      );

      const mockProfile = {
        user_id: 'user-123',
        phone: '555-1234',
        birthday: '1992-05-14',
        location: 'San Francisco',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      // Mock chained builder: from().select().eq().maybeSingle()
      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({ data: mockProfile, error: null })),
      }));

      await useProfileStore.getState().loadFromAuthAndProfile();

      const state = useProfileStore.getState();
      expect(state.loaded).not.toBeNull();
      expect(state.loaded!.email).toBe('test@example.com');
      expect(state.loaded!.first_name).toBe('Alice');
      expect(state.loaded!.last_name).toBe('Smith');
      expect(state.loaded!.phone).toBe('555-1234');
      expect(state.loaded!.birthday).toBe('1992-05-14');
      expect(state.loaded!.location).toBe('San Francisco');
      expect(state.isLoading).toBe(false);

      // draft should mirror loaded (nulls become empty strings for editable fields)
      expect(state.draft).not.toBeNull();
      expect(state.draft!.first_name).toBe('Alice');
      expect(state.draft!.last_name).toBe('Smith');
      expect(state.draft!.phone).toBe('555-1234');
      expect(state.draft!.birthday).toBe('1992-05-14');
      expect(state.draft!.location).toBe('San Francisco');
    });

    it('handles missing user_profiles row with defensive INSERT then re-fetch', async () => {
      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'user-456',
              email: 'new@example.com',
              user_metadata: {},
            },
          },
          error: null,
        })
      );

      const insertMock = jest.fn().mockReturnThis();
      const upsertMock = jest.fn(() => Promise.resolve({ error: null }));
      let callCount = 0;

      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(() => {
          callCount += 1;
          if (callCount === 1) {
            // First call — row missing
            return Promise.resolve({ data: null, error: null });
          }
          // Second call after insert
          return Promise.resolve({
            data: {
              user_id: 'user-456',
              phone: null,
              birthday: null,
              location: null,
              avatar_url: null,
            },
            error: null,
          });
        }),
        insert: insertMock,
        upsert: upsertMock,
        single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      }));

      await useProfileStore.getState().loadFromAuthAndProfile();

      const state = useProfileStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.loaded).not.toBeNull();
      // Fields missing from profile should be null in loaded
      expect(state.loaded!.phone).toBeNull();
    });

    it('sets error on auth failure', async () => {
      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: { user: null },
          error: { message: 'Not authenticated' },
        })
      );

      await useProfileStore.getState().loadFromAuthAndProfile();

      const state = useProfileStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
    });

    it('converts null fields to empty strings in draft', async () => {
      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: 'user-789',
              email: 'empty@example.com',
              user_metadata: {},
            },
          },
          error: null,
        })
      );

      mockSupabase.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(() =>
          Promise.resolve({
            data: {
              user_id: 'user-789',
              phone: null,
              birthday: null,
              location: null,
              avatar_url: null,
            },
            error: null,
          })
        ),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn(() => Promise.resolve({ error: null })),
        single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
      }));

      await useProfileStore.getState().loadFromAuthAndProfile();

      const state = useProfileStore.getState();
      expect(state.draft!.phone).toBe('');
      expect(state.draft!.birthday).toBe('');
      expect(state.draft!.location).toBe('');
      expect(state.draft!.first_name).toBe('');
      expect(state.draft!.last_name).toBe('');
    });
  });

  // ─── setDraftField ─────────────────────────────────────────────────────────

  describe('setDraftField', () => {
    it('mutates one field without disturbing others', () => {
      useProfileStore.setState({
        draft: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-0000',
          birthday: '1992-05-14',
          location: 'NYC',
        },
      });

      useProfileStore.getState().setDraftField('phone', '555-9999');

      const draft = useProfileStore.getState().draft!;
      expect(draft.phone).toBe('555-9999');
      // Others untouched
      expect(draft.first_name).toBe('Alice');
      expect(draft.last_name).toBe('Smith');
      expect(draft.birthday).toBe('1992-05-14');
      expect(draft.location).toBe('NYC');
    });

    it('does nothing when draft is null', () => {
      useProfileStore.setState({ draft: null });
      useProfileStore.getState().setDraftField('phone', '555-9999');
      expect(useProfileStore.getState().draft).toBeNull();
    });
  });

  // ─── save ──────────────────────────────────────────────────────────────────

  describe('save', () => {
    const seedSaveState = () => {
      useProfileStore.setState({
        loaded: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-0000',
          birthday: '1992-05-14',
          location: 'NYC',
          avatar_url: null,
        },
        draft: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-9999',
          birthday: '1990-01-01',
          location: 'LA',
        },
      });
    };

    it('succeeds when both Supabase calls return without error', async () => {
      seedSaveState();

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'user-123' } },
          error: null,
        })
      );
      mockSupabase.auth.updateUser = jest.fn(() =>
        Promise.resolve({ data: { user: {} }, error: null })
      );

      const upsertMock = jest.fn(() => Promise.resolve({ error: null }));
      mockSupabase.from = jest.fn(() => ({
        upsert: upsertMock,
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
      }));

      const result = await useProfileStore.getState().save();

      expect(result.success).toBe(true);
      expect(useProfileStore.getState().isSaving).toBe(false);
      // loaded should refresh from draft values
      const loaded = useProfileStore.getState().loaded!;
      expect(loaded.phone).toBe('555-9999');
      expect(loaded.location).toBe('LA');
    });

    it('returns error when auth.updateUser fails', async () => {
      seedSaveState();

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'user-123' } },
          error: null,
        })
      );
      mockSupabase.auth.updateUser = jest.fn(() =>
        Promise.resolve({ data: null, error: { message: 'Auth update failed' } })
      );

      const upsertMock = jest.fn(() => Promise.resolve({ error: null }));
      mockSupabase.from = jest.fn(() => ({
        upsert: upsertMock,
      }));

      const result = await useProfileStore.getState().save();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(useProfileStore.getState().isSaving).toBe(false);
    });

    it('returns error when user_profiles.upsert fails', async () => {
      seedSaveState();

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: { user: { id: 'user-123' } },
          error: null,
        })
      );
      mockSupabase.auth.updateUser = jest.fn(() =>
        Promise.resolve({ data: { user: {} }, error: null })
      );

      const upsertMock = jest.fn(() =>
        Promise.resolve({ error: { message: 'DB upsert failed' } })
      );
      mockSupabase.from = jest.fn(() => ({
        upsert: upsertMock,
      }));

      const result = await useProfileStore.getState().save();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('returns error when no user (not authenticated)', async () => {
      seedSaveState();

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({
          data: { user: null },
          error: null,
        })
      );

      const result = await useProfileStore.getState().save();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  // ─── discardDraft ──────────────────────────────────────────────────────────

  describe('discardDraft', () => {
    it('resets draft to match loaded values', () => {
      useProfileStore.setState({
        loaded: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-0000',
          birthday: '1992-05-14',
          location: 'NYC',
          avatar_url: null,
        },
        draft: {
          first_name: 'Changed',
          last_name: 'Name',
          email: 'alice@example.com',
          phone: '999-9999',
          birthday: '2000-01-01',
          location: 'LA',
        },
      });

      useProfileStore.getState().discardDraft();

      const draft = useProfileStore.getState().draft!;
      expect(draft.first_name).toBe('Alice');
      expect(draft.last_name).toBe('Smith');
      expect(draft.phone).toBe('555-0000');
      expect(draft.birthday).toBe('1992-05-14');
      expect(draft.location).toBe('NYC');
    });

    it('does nothing when loaded is null', () => {
      useProfileStore.setState({ loaded: null, draft: null });
      useProfileStore.getState().discardDraft();
      expect(useProfileStore.getState().draft).toBeNull();
    });
  });

  // ─── clearProfile ──────────────────────────────────────────────────────────

  describe('clearProfile', () => {
    it('resets entire state to initial values', () => {
      useProfileStore.setState({
        loaded: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-0000',
          birthday: '1992-05-14',
          location: 'NYC',
          avatar_url: null,
        },
        draft: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-0000',
          birthday: '1992-05-14',
          location: 'NYC',
        },
        isLoading: true,
        isSaving: true,
        error: 'some error',
      });

      useProfileStore.getState().clearProfile();

      const state = useProfileStore.getState();
      expect(state.loaded).toBeNull();
      expect(state.draft).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
