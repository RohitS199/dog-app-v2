# Profile Avatar Upload Implementation Plan ✅ (Complete 2026-05-28)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Coming soon" avatar placeholder on the Profile → My Information screen with a functional photo picker that uploads to Supabase Storage and writes to both `user_profiles.avatar_url` and `auth.user.user_metadata.avatar_url` so both the screen and the FloatingTabBar settings tab avatar stay in sync.

**Architecture:** New `profileStore.updateAvatar(uri | null)` method handles upload-to-storage + dual-write to DB + auth metadata + local state with optimistic UI and rollback on failure. UI uses platform-specific source picker (`ActionSheetIOS` on iOS / `Alert.alert` on Android) with three actions: Take Photo, Choose from Library, Remove Photo. Camera flow includes permission request + Settings deep-link on denial.

**Tech Stack:** Zustand, expo-image-picker, Supabase Storage (`avatars` bucket), Supabase Postgres (`user_profiles` table), Supabase Auth user_metadata, React Native `ActionSheetIOS`, React Native `Linking`, TypeScript strict mode.

**Spec:** [docs/superpowers/specs/2026-05-27-profile-avatar-upload-design.md](../specs/2026-05-27-profile-avatar-upload-design.md)

---

## File Structure

| File | Action | Responsibility |
| --- | --- | --- |
| `src/constants/profileCopy.ts` | Modify | Remove `MY_INFO_AVATAR_COMING_SOON_*` constants; add 12 new strings for the picker, confirm dialog, error, permission alert |
| `src/stores/authStore.ts` | Modify | Add `setUser(user)` setter so `profileStore` can update the auth user without re-running auth methods |
| `src/stores/profileStore.ts` | Modify | Add `updateAvatar(uri \| null)` method; extend `ProfileState` interface |
| `src/stores/__tests__/profileStore.test.ts` | Modify | Add 5 tests covering upload success/failure, remove success, remove DB-failure, remove storage-delete-failure-non-blocking |
| `jest.setup.js` | Modify | Add mocks for `launchCameraAsync`, `requestCameraPermissionsAsync` to existing `expo-image-picker` mock; add `Linking.openSettings` to existing Linking mock |
| `app/(tabs)/profile/my-information.tsx` | Modify | Replace `handleAvatarPress` with platform-specific picker (Action Sheet / Alert); wire library/camera/remove actions; add `isUploading` loading state; wrap `WoodPortrait` in a `Pressable` |

---

## Notes for the executing engineer

- **Storage bucket exists**: `avatars` bucket already exists in Supabase Storage; the `authStore.updateAvatar` method has been uploading to it successfully in production.
- **DB column name**: The `user_profiles` table uses `user_id` (not `id`) as the FK to `auth.users`. All queries in `profileStore.ts` already follow this pattern — match it.
- **Upsert, not update**: `profileStore.save()` uses `.upsert({ user_id, ... }, { onConflict: 'user_id' })`. Use the same pattern for avatar writes.
- **Optimistic UI uses local URI**: When the user picks an image, `expo-image-picker` returns a local `file://` URI. Set this on `loaded.avatar_url` immediately so the wood portrait shows the new image right away. After the upload succeeds, replace with the public URL (with `?t=${Date.now()}` cache-buster).
- **FormData pattern is React Native specific**: Don't try to `fetch(uri).then(r => r.blob())` — it doesn't work reliably in RN. The `FormData` pattern from `authStore.updateAvatar` (lines 87-103) is the proven approach.
- **Run tests with**: `npm test -- --testPathPattern=profileStore` for fast feedback during TDD. Run `npm test` once at the end to confirm no regressions.

---

## Task 1: Update copy constants

**Files:**
- Modify: `src/constants/profileCopy.ts`
- Modify: `app/(tabs)/profile/my-information.tsx`

- [ ] **Step 1: Remove the "Coming soon" constants**

Find these two lines in `src/constants/profileCopy.ts` and delete them:

```typescript
MY_INFO_AVATAR_COMING_SOON_TITLE: 'Coming soon',
MY_INFO_AVATAR_COMING_SOON_BODY: 'Avatar uploads will arrive in a future update.',
```

- [ ] **Step 2: Add the 12 new constants**

Add these constants in the `// My Information screen` section of `src/constants/profileCopy.ts`, after the existing `MY_INFO_*` block:

```typescript
MY_INFO_AVATAR_SHEET_TITLE: 'Profile Photo',
MY_INFO_AVATAR_TAKE_PHOTO: 'Take Photo',
MY_INFO_AVATAR_CHOOSE_LIBRARY: 'Choose from Library',
MY_INFO_AVATAR_REMOVE: 'Remove Photo',
MY_INFO_AVATAR_CANCEL: 'Cancel',
MY_INFO_AVATAR_REMOVE_CONFIRM_TITLE: 'Remove photo?',
MY_INFO_AVATAR_REMOVE_CONFIRM_BODY: 'Your profile will use your initials again.',
MY_INFO_AVATAR_UPLOAD_ERROR_TITLE: "Couldn't upload",
MY_INFO_AVATAR_UPLOAD_ERROR_BODY: 'Please try again.',
MY_INFO_AVATAR_PERMISSION_TITLE: 'Camera access needed',
MY_INFO_AVATAR_PERMISSION_BODY: 'Enable camera access in Settings to take a photo.',
MY_INFO_AVATAR_OPEN_SETTINGS: 'Open Settings',
```

- [ ] **Step 3: Stub out `handleAvatarPress` so typecheck stays green**

Open `app/(tabs)/profile/my-information.tsx`. Find `handleAvatarPress` (around line 121-126) and replace its body so it no longer references the removed `COMING_SOON_*` constants. Task 9 replaces this stub with the real picker:

```typescript
  function handleAvatarPress() {
    // Picker implementation lands in Task 9
  }
```

- [ ] **Step 4: Run typecheck — expect clean**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/constants/profileCopy.ts app/\(tabs\)/profile/my-information.tsx
git commit -m "feat(profile): add avatar picker copy strings, stub out picker handler

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Add `setUser` setter to authStore

**Files:**
- Modify: `src/stores/authStore.ts`

The `profileStore.updateAvatar` method needs to update the `authStore.user` after the auth metadata changes, so the `FloatingTabBar` (which reads `user.user_metadata.avatar_url`) re-renders. Adding a clean setter is better than reaching into `useAuthStore.setState({ user })` from another store.

- [ ] **Step 1: Locate the `AuthState` interface**

Open `src/stores/authStore.ts`. Find the interface declaring the store shape (it has fields like `session`, `user`, `signIn`, `signOut`, etc.).

- [ ] **Step 2: Add `setUser` to the interface**

Add this line to the `AuthState` interface (or whatever the interface name is — match the file's existing pattern), grouped with the other setter methods:

```typescript
setUser: (user: User | null) => void;
```

If `User` is not already imported from `@supabase/supabase-js`, add it to the existing import.

- [ ] **Step 3: Add the implementation**

In the `create<AuthState>((set, get) => ({ ... }))` body, add the implementation alongside the existing setters (e.g., near `setSession`):

```typescript
setUser: (user) => set({ user }),
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: same two pre-existing errors from Task 1 only (the `COMING_SOON_*` refs). No new errors.

- [ ] **Step 5: Commit**

```bash
git add src/stores/authStore.ts
git commit -m "feat(auth): expose setUser setter for cross-store updates

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Extend jest mocks for camera + Linking.openSettings

**Files:**
- Modify: `jest.setup.js`

- [ ] **Step 1: Extend the `expo-image-picker` mock**

In `jest.setup.js`, find the existing `jest.mock('expo-image-picker', ...)` block (around line 102) and replace it with:

```javascript
// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true })
  ),
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true })
  ),
}));
```

- [ ] **Step 2: Extend the Linking mock**

Find the existing `jest.mock('react-native/Libraries/Linking/Linking', ...)` block (around line 119) and replace it with:

```javascript
// Mock Linking
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(),
  openSettings: jest.fn(() => Promise.resolve()),
}));
```

- [ ] **Step 3: Run the existing test suite to confirm no breakage**

Run: `npm test`
Expected: same pass count as before this task. No new failures.

- [ ] **Step 4: Commit**

```bash
git add jest.setup.js
git commit -m "test(setup): mock launchCameraAsync, requestCameraPermissionsAsync, Linking.openSettings

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: TDD — `updateAvatar` upload success path

**Files:**
- Modify: `src/stores/profileStore.ts`
- Modify: `src/stores/__tests__/profileStore.test.ts`

- [ ] **Step 1: Write the failing test**

Add a new `describe` block at the end of `src/stores/__tests__/profileStore.test.ts`, before the final closing of the outer `describe('profileStore')` block:

```typescript
  // ─── updateAvatar ──────────────────────────────────────────────────────────

  describe('updateAvatar', () => {
    const seedAvatarState = (existingUrl: string | null = null) => {
      useProfileStore.setState({
        loaded: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-0000',
          birthday: '1992-05-14',
          location: 'NYC',
          avatar_url: existingUrl,
        },
        draft: {
          first_name: 'Alice',
          last_name: 'Smith',
          email: 'alice@example.com',
          phone: '555-0000',
          birthday: '1992-05-14',
          location: 'NYC',
        },
      });
    };

    it('uploads to Storage, writes to user_profiles and auth metadata, and updates loaded.avatar_url', async () => {
      seedAvatarState(null);

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })
      );

      const uploadMock = jest.fn(() => Promise.resolve({ error: null }));
      const getPublicUrlMock = jest.fn(() => ({
        data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/avatars/user-123/avatar.jpg' },
      }));
      const upsertMock = jest.fn(() => Promise.resolve({ error: null }));

      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: uploadMock,
          getPublicUrl: getPublicUrlMock,
          remove: jest.fn(),
        })),
      };
      mockSupabase.from = jest.fn(() => ({
        upsert: upsertMock,
      }));
      mockSupabase.auth.updateUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123', user_metadata: { avatar_url: 'final-url' } } }, error: null })
      );

      const result = await useProfileStore.getState().updateAvatar('file:///local/img.jpg');

      expect(result.success).toBe(true);
      expect(uploadMock).toHaveBeenCalledTimes(1);
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-123', avatar_url: expect.stringContaining('avatars/user-123/avatar.jpg') }),
        expect.objectContaining({ onConflict: 'user_id' })
      );
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ avatar_url: expect.stringContaining('avatars/user-123/avatar.jpg') }) })
      );
      const loaded = useProfileStore.getState().loaded!;
      expect(loaded.avatar_url).toContain('avatars/user-123/avatar.jpg');
      expect(loaded.avatar_url).toContain('?t=');
    });
  });
```

- [ ] **Step 2: Run the test — expect FAIL**

Run: `npm test -- --testPathPattern=profileStore`
Expected: FAIL. Message will be something like `TypeError: useProfileStore.getState().updateAvatar is not a function`.

- [ ] **Step 3: Add `updateAvatar` to the `ProfileState` interface**

In `src/stores/profileStore.ts`, find the `ProfileState` interface (around line 28) and add this method signature with the other methods:

```typescript
  updateAvatar: (uri: string | null) => Promise<{ success: boolean; error?: string }>;
```

- [ ] **Step 4: Implement the upload happy path**

In `src/stores/profileStore.ts`, add the following implementation inside the `create<ProfileState>((set, get) => ({ ... }))` body, after the `clearProfile` method (i.e., as the last method on the store). Also add the import for `useAuthStore` at the top if not already present:

Add to the top imports:

```typescript
import { useAuthStore } from './authStore';
```

Add the method (only the happy upload path for now — error handling comes in Task 5):

```typescript
  updateAvatar: async (uri) => {
    const { loaded } = get();
    const previousAvatarUrl = loaded?.avatar_url ?? null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      if (uri !== null) {
        // Optimistic UI — show the local URI immediately
        if (loaded) {
          set({ loaded: { ...loaded, avatar_url: uri } });
        }

        const filePath = `${user.id}/avatar.jpg`;
        const formData = new FormData();
        formData.append('file', {
          uri,
          name: 'avatar.jpg',
          type: 'image/jpeg',
        } as any);

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, formData, {
            upsert: true,
            contentType: 'multipart/form-data',
          });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

        const { error: upsertError } = await supabase
          .from('user_profiles')
          .upsert({ user_id: user.id, avatar_url: avatarUrl }, { onConflict: 'user_id' });
        if (upsertError) throw upsertError;

        const { data: authData, error: authError } = await supabase.auth.updateUser({
          data: { avatar_url: avatarUrl },
        });
        if (authError) throw authError;

        if (loaded) {
          set({ loaded: { ...loaded, avatar_url: avatarUrl } });
        }
        useAuthStore.getState().setUser(authData.user);

        return { success: true };
      }

      // Remove path comes in Task 6
      return { success: false, error: 'Remove not yet implemented' };
    } catch (err) {
      // Revert handling comes in Task 5
      const message = err instanceof Error ? err.message : 'Avatar update failed';
      return { success: false, error: message };
    }
  },
```

- [ ] **Step 5: Run the test — expect PASS**

Run: `npm test -- --testPathPattern=profileStore`
Expected: PASS for the new `updateAvatar` test. All previously-passing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add src/stores/profileStore.ts src/stores/__tests__/profileStore.test.ts
git commit -m "feat(profile): add updateAvatar upload happy path with TDD

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: TDD — Upload failure reverts optimistic local state

**Files:**
- Modify: `src/stores/profileStore.ts`
- Modify: `src/stores/__tests__/profileStore.test.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('updateAvatar', ...)` block, after the existing test:

```typescript
    it('reverts loaded.avatar_url to previous value when storage.upload fails', async () => {
      const previous = 'https://example.com/old-avatar.jpg';
      seedAvatarState(previous);

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })
      );

      const uploadMock = jest.fn(() =>
        Promise.resolve({ error: { message: 'Network error' } })
      );

      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: uploadMock,
          getPublicUrl: jest.fn(),
          remove: jest.fn(),
        })),
      };
      mockSupabase.from = jest.fn(() => ({ upsert: jest.fn() }));
      mockSupabase.auth.updateUser = jest.fn();

      const result = await useProfileStore.getState().updateAvatar('file:///local/img.jpg');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      const loaded = useProfileStore.getState().loaded!;
      expect(loaded.avatar_url).toBe(previous);
    });
```

- [ ] **Step 2: Run the test — expect FAIL**

Run: `npm test -- --testPathPattern=profileStore`
Expected: FAIL. The current implementation throws, but the catch block does NOT revert the optimistically-set `loaded.avatar_url`, so the test fails on the final assertion.

- [ ] **Step 3: Add the revert logic**

In `src/stores/profileStore.ts`, update the `catch` block at the bottom of `updateAvatar`:

```typescript
    } catch (err) {
      // Revert optimistic UI to the previous avatar URL
      const currentLoaded = get().loaded;
      if (currentLoaded) {
        set({ loaded: { ...currentLoaded, avatar_url: previousAvatarUrl } });
      }
      const message = err instanceof Error ? err.message : 'Avatar update failed';
      return { success: false, error: message };
    }
```

- [ ] **Step 4: Run the test — expect PASS**

Run: `npm test -- --testPathPattern=profileStore`
Expected: PASS for both `updateAvatar` tests.

- [ ] **Step 5: Commit**

```bash
git add src/stores/profileStore.ts src/stores/__tests__/profileStore.test.ts
git commit -m "feat(profile): revert avatar optimistic state on upload failure

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: TDD — `updateAvatar(null)` remove happy path

**Files:**
- Modify: `src/stores/profileStore.ts`
- Modify: `src/stores/__tests__/profileStore.test.ts`

- [ ] **Step 1: Write the failing test**

Add this test inside the `describe('updateAvatar', ...)` block:

```typescript
    it('removes the avatar: deletes storage file, clears user_profiles and auth metadata', async () => {
      seedAvatarState('https://example.com/existing.jpg');

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })
      );

      const removeMock = jest.fn(() => Promise.resolve({ error: null }));
      const upsertMock = jest.fn(() => Promise.resolve({ error: null }));

      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
          remove: removeMock,
        })),
      };
      mockSupabase.from = jest.fn(() => ({ upsert: upsertMock }));
      mockSupabase.auth.updateUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123', user_metadata: {} } }, error: null })
      );

      const result = await useProfileStore.getState().updateAvatar(null);

      expect(result.success).toBe(true);
      expect(removeMock).toHaveBeenCalledWith(['user-123/avatar.jpg']);
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-123', avatar_url: null }),
        expect.objectContaining({ onConflict: 'user_id' })
      );
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ avatar_url: null }) })
      );
      const loaded = useProfileStore.getState().loaded!;
      expect(loaded.avatar_url).toBeNull();
    });
```

- [ ] **Step 2: Run the test — expect FAIL**

Run: `npm test -- --testPathPattern=profileStore`
Expected: FAIL. The current implementation returns `{ success: false, error: 'Remove not yet implemented' }`.

- [ ] **Step 3: Implement the remove path**

In `src/stores/profileStore.ts`, replace the `// Remove path comes in Task 6` line and the placeholder return below it with:

```typescript
      // Remove path
      if (loaded) {
        set({ loaded: { ...loaded, avatar_url: null } });
      }

      const filePath = `${user.id}/avatar.jpg`;
      try {
        await supabase.storage.from('avatars').remove([filePath]);
      } catch {
        // Storage delete failure is non-blocking — DB writes are the source of truth
      }

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, avatar_url: null }, { onConflict: 'user_id' });
      if (upsertError) throw upsertError;

      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
      if (authError) throw authError;

      useAuthStore.getState().setUser(authData.user);

      return { success: true };
```

- [ ] **Step 4: Run the test — expect PASS**

Run: `npm test -- --testPathPattern=profileStore`
Expected: PASS for all 3 `updateAvatar` tests.

- [ ] **Step 5: Commit**

```bash
git add src/stores/profileStore.ts src/stores/__tests__/profileStore.test.ts
git commit -m "feat(profile): updateAvatar removes file from Storage and clears DB writes when uri is null

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: TDD — Remove path reverts state on DB write failure

**Files:**
- Modify: `src/stores/__tests__/profileStore.test.ts`

The revert logic from Task 5 already lives in the shared `catch` block. This task adds a test to confirm the remove path benefits from the same revert — no implementation change expected.

- [ ] **Step 1: Write the test**

Add this test inside the `describe('updateAvatar', ...)` block:

```typescript
    it('reverts loaded.avatar_url to previous value when DB upsert fails during remove', async () => {
      const previous = 'https://example.com/existing.jpg';
      seedAvatarState(previous);

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })
      );

      const removeMock = jest.fn(() => Promise.resolve({ error: null }));
      const upsertMock = jest.fn(() =>
        Promise.resolve({ error: { message: 'DB write failed' } })
      );

      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
          remove: removeMock,
        })),
      };
      mockSupabase.from = jest.fn(() => ({ upsert: upsertMock }));
      mockSupabase.auth.updateUser = jest.fn();

      const result = await useProfileStore.getState().updateAvatar(null);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      const loaded = useProfileStore.getState().loaded!;
      expect(loaded.avatar_url).toBe(previous);
    });
```

- [ ] **Step 2: Run the test — expect PASS**

Run: `npm test -- --testPathPattern=profileStore`
Expected: PASS. The shared `catch` block reverts to `previousAvatarUrl` (set at the top of `updateAvatar`).

If this test FAILS, the bug is in Task 5's revert logic — debug there.

- [ ] **Step 3: Commit**

```bash
git add src/stores/__tests__/profileStore.test.ts
git commit -m "test(profile): confirm remove path reverts state on DB upsert failure

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: TDD — Storage delete failure is non-blocking during remove

**Files:**
- Modify: `src/stores/__tests__/profileStore.test.ts`

The "swallow storage delete error" implementation already exists from Task 6. This task adds a test to lock that behavior in.

- [ ] **Step 1: Write the test**

Add this test inside the `describe('updateAvatar', ...)` block:

```typescript
    it('returns success on remove even if storage.remove throws (non-blocking)', async () => {
      seedAvatarState('https://example.com/existing.jpg');

      mockSupabase.auth.getUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123' } }, error: null })
      );

      const removeMock = jest.fn(() => Promise.reject(new Error('Storage offline')));
      const upsertMock = jest.fn(() => Promise.resolve({ error: null }));

      mockSupabase.storage = {
        from: jest.fn(() => ({
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
          remove: removeMock,
        })),
      };
      mockSupabase.from = jest.fn(() => ({ upsert: upsertMock }));
      mockSupabase.auth.updateUser = jest.fn(() =>
        Promise.resolve({ data: { user: { id: 'user-123', user_metadata: {} } }, error: null })
      );

      const result = await useProfileStore.getState().updateAvatar(null);

      expect(result.success).toBe(true);
      expect(upsertMock).toHaveBeenCalled();
      const loaded = useProfileStore.getState().loaded!;
      expect(loaded.avatar_url).toBeNull();
    });
```

- [ ] **Step 2: Run the test — expect PASS**

Run: `npm test -- --testPathPattern=profileStore`
Expected: PASS. All 5 `updateAvatar` tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/stores/__tests__/profileStore.test.ts
git commit -m "test(profile): confirm storage delete failure during remove is non-blocking

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: UI — Replace `handleAvatarPress` with platform-specific picker menu

**Files:**
- Modify: `app/(tabs)/profile/my-information.tsx`

This task replaces the `Alert.alert('Coming soon')` with a real picker menu. The action handlers are stubbed for this task — actual library/camera/remove wiring comes in Tasks 10-12.

- [ ] **Step 1: Update imports**

In `app/(tabs)/profile/my-information.tsx`, update the React Native import to add `ActionSheetIOS` and `Linking`:

```typescript
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
```

(Add a new import line at the top, alongside the existing ones:)

```typescript
import * as ImagePicker from 'expo-image-picker';
```

- [ ] **Step 2: Replace `handleAvatarPress` with the picker menu**

Locate `handleAvatarPress` (around line 121-126) and replace it with this implementation. Add the three stub handlers above it:

```typescript
  function handleTakePhotoStub() {
    // Wired in Task 11
  }

  function handleChooseFromLibraryStub() {
    // Wired in Task 10
  }

  function handleRemovePhotoStub() {
    // Wired in Task 12
  }

  function handleAvatarPress() {
    const hasAvatar = (loaded?.avatar_url ?? null) !== null;

    if (Platform.OS === 'ios') {
      const iosOptions = hasAvatar
        ? [
            COPY.MY_INFO_AVATAR_TAKE_PHOTO,
            COPY.MY_INFO_AVATAR_CHOOSE_LIBRARY,
            COPY.MY_INFO_AVATAR_REMOVE,
            COPY.MY_INFO_AVATAR_CANCEL,
          ]
        : [
            COPY.MY_INFO_AVATAR_TAKE_PHOTO,
            COPY.MY_INFO_AVATAR_CHOOSE_LIBRARY,
            COPY.MY_INFO_AVATAR_CANCEL,
          ];
      const cancelButtonIndex = iosOptions.length - 1;
      const destructiveButtonIndex = hasAvatar ? 2 : undefined;

      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: COPY.MY_INFO_AVATAR_SHEET_TITLE,
          options: iosOptions,
          cancelButtonIndex,
          destructiveButtonIndex,
        },
        (selectedIndex) => {
          if (selectedIndex === 0) {
            handleTakePhotoStub();
          } else if (selectedIndex === 1) {
            handleChooseFromLibraryStub();
          } else if (selectedIndex === 2 && hasAvatar) {
            handleRemovePhotoStub();
          }
          // Cancel button: no-op
        },
      );
      return;
    }

    // Android — use Alert.alert with buttons array
    const androidButtons: { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void }[] = [
      { text: COPY.MY_INFO_AVATAR_TAKE_PHOTO, onPress: handleTakePhotoStub },
      { text: COPY.MY_INFO_AVATAR_CHOOSE_LIBRARY, onPress: handleChooseFromLibraryStub },
    ];
    if (hasAvatar) {
      androidButtons.push({
        text: COPY.MY_INFO_AVATAR_REMOVE,
        style: 'destructive',
        onPress: handleRemovePhotoStub,
      });
    }
    androidButtons.push({ text: COPY.MY_INFO_AVATAR_CANCEL, style: 'cancel' });

    Alert.alert(COPY.MY_INFO_AVATAR_SHEET_TITLE, undefined, androidButtons, { cancelable: true });
  }
```

- [ ] **Step 3: Run typecheck — expect clean**

Run: `npx tsc --noEmit`
Expected: no errors. (The Task 1 stale references are gone now — `handleAvatarPress` no longer uses `COMING_SOON_*`.)

- [ ] **Step 4: Run the test suite — confirm no regressions**

Run: `npm test`
Expected: same pass count + 5 new tests from Tasks 4-8.

- [ ] **Step 5: Manual QA**

Run the app: `npx expo start`. Navigate to Settings → Profile → My Information. Tap the pencil pill on the avatar.

Expected:
- **iOS simulator**: Action sheet slides up from the bottom with "Profile Photo" title and 3 options (no existing avatar) or 4 options ("Remove Photo" shown if avatar exists). Cancel button at the bottom.
- **Android emulator**: Native alert dialog with the same buttons. "Remove Photo" appears in red (destructive).

Tapping any option closes the sheet/dialog (stubs do nothing yet). Tapping Cancel closes without action.

- [ ] **Step 6: Commit**

```bash
git add app/\(tabs\)/profile/my-information.tsx
git commit -m "feat(profile): replace 'Coming soon' avatar alert with picker menu (iOS + Android)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: UI — Wire "Choose from Library" with loading state

**Files:**
- Modify: `app/(tabs)/profile/my-information.tsx`

- [ ] **Step 1: Add `isUploading` local state**

Inside `MyInformationScreen()`, near the other `useState` calls (around line 80-87), add:

```typescript
  const [isUploading, setIsUploading] = useState(false);
```

- [ ] **Step 2: Implement the library handler**

Replace the `handleChooseFromLibraryStub` function with the real implementation:

```typescript
  async function handleChooseFromLibrary() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      setIsUploading(true);
      const uploadResult = await store.updateAvatar(result.assets[0].uri);
      setIsUploading(false);

      if (!uploadResult.success) {
        Alert.alert(
          COPY.MY_INFO_AVATAR_UPLOAD_ERROR_TITLE,
          COPY.MY_INFO_AVATAR_UPLOAD_ERROR_BODY,
        );
      }
    } catch {
      setIsUploading(false);
      Alert.alert(
        COPY.MY_INFO_AVATAR_UPLOAD_ERROR_TITLE,
        COPY.MY_INFO_AVATAR_UPLOAD_ERROR_BODY,
      );
    }
  }
```

- [ ] **Step 3: Update the picker callbacks to call the real handler**

In `handleAvatarPress`, replace the two references to `handleChooseFromLibraryStub` (one in the iOS callback, one in the Android buttons array) with `handleChooseFromLibrary`. Also delete the `handleChooseFromLibraryStub` function declaration.

- [ ] **Step 4: Swap the pencil pill content for a spinner during upload**

Locate the pencil pill `Pressable` (around line 212-220). Change its `children` content from the static `Text` to conditional rendering:

```typescript
              <Pressable
                style={styles.pencilPill}
                onPress={handleAvatarPress}
                accessibilityRole="button"
                accessibilityLabel={isUploading ? 'Uploading photo' : 'Edit profile photo'}
                hitSlop={8}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={OB_COLORS.ctaText} />
                ) : (
                  <Text style={styles.pencilText}>{'✎'}</Text>
                )}
              </Pressable>
```

- [ ] **Step 5: Run typecheck and tests**

Run: `npx tsc --noEmit && npm test`
Expected: typecheck clean, all tests pass.

- [ ] **Step 6: Manual QA**

Run the app. On the My Information screen, tap the pencil → "Choose from Library":
- The native photo picker opens.
- Selecting an image triggers upload — the wood portrait shows the new photo IMMEDIATELY (optimistic update from local URI).
- The pencil pill swaps to a spinner during upload (typically ~1-3 seconds on wifi).
- After upload, the spinner returns to `✎`. The image is now the public URL (you can verify by closing and reopening the app — the avatar persists).
- The FloatingTabBar settings tab should ALSO show the new avatar (re-render via `authStore.user` update).
- Cancel from the picker → no change, no upload.

Test the error case: turn off wifi BEFORE tapping "Choose from Library", select an image. The upload should fail and an alert ("Couldn't upload, Please try again.") appears. The wood portrait should REVERT to its previous state (or remain blank if no prior avatar).

- [ ] **Step 7: Commit**

```bash
git add app/\(tabs\)/profile/my-information.tsx
git commit -m "feat(profile): wire 'Choose from Library' to updateAvatar with loading state

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: UI — Wire "Take Photo" with camera permission flow

**Files:**
- Modify: `app/(tabs)/profile/my-information.tsx`

- [ ] **Step 1: Implement the camera handler**

Replace the `handleTakePhotoStub` function with:

```typescript
  async function handleTakePhoto() {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert(
          COPY.MY_INFO_AVATAR_PERMISSION_TITLE,
          COPY.MY_INFO_AVATAR_PERMISSION_BODY,
          [
            { text: COPY.MY_INFO_AVATAR_CANCEL, style: 'cancel' },
            { text: COPY.MY_INFO_AVATAR_OPEN_SETTINGS, onPress: () => Linking.openSettings() },
          ],
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      setIsUploading(true);
      const uploadResult = await store.updateAvatar(result.assets[0].uri);
      setIsUploading(false);

      if (!uploadResult.success) {
        Alert.alert(
          COPY.MY_INFO_AVATAR_UPLOAD_ERROR_TITLE,
          COPY.MY_INFO_AVATAR_UPLOAD_ERROR_BODY,
        );
      }
    } catch {
      setIsUploading(false);
      Alert.alert(
        COPY.MY_INFO_AVATAR_UPLOAD_ERROR_TITLE,
        COPY.MY_INFO_AVATAR_UPLOAD_ERROR_BODY,
      );
    }
  }
```

- [ ] **Step 2: Update the picker callbacks**

In `handleAvatarPress`, replace the two references to `handleTakePhotoStub` with `handleTakePhoto`. Delete the stub.

- [ ] **Step 3: Run typecheck and tests**

Run: `npx tsc --noEmit && npm test`
Expected: typecheck clean, tests pass.

- [ ] **Step 4: Manual QA**

⚠ **Camera does not work in the iOS simulator.** Test on a physical device via `npx expo run:ios --device` or Expo Go on a connected phone.

- Tap pencil → "Take Photo":
  - **First time**: iOS prompts for camera permission. Tap "Allow" → camera opens. Capture a photo → crop UI → "Use Photo" → upload begins (spinner appears) → new avatar shows.
  - **Subsequent times**: camera opens directly.
  - **If you tap "Don't Allow"**: app shows the "Camera access needed" alert with "Open Settings" button. Tap "Open Settings" → iOS Settings opens to the PupLog app permissions page.

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/profile/my-information.tsx
git commit -m "feat(profile): wire 'Take Photo' with camera permission and Settings deep-link

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: UI — Wire "Remove Photo" with confirm dialog

**Files:**
- Modify: `app/(tabs)/profile/my-information.tsx`

- [ ] **Step 1: Implement the remove handler**

Replace the `handleRemovePhotoStub` function with:

```typescript
  function handleRemovePhoto() {
    Alert.alert(
      COPY.MY_INFO_AVATAR_REMOVE_CONFIRM_TITLE,
      COPY.MY_INFO_AVATAR_REMOVE_CONFIRM_BODY,
      [
        { text: COPY.MY_INFO_AVATAR_CANCEL, style: 'cancel' },
        {
          text: COPY.MY_INFO_AVATAR_REMOVE,
          style: 'destructive',
          onPress: async () => {
            setIsUploading(true);
            const result = await store.updateAvatar(null);
            setIsUploading(false);
            if (!result.success) {
              Alert.alert(
                COPY.MY_INFO_AVATAR_UPLOAD_ERROR_TITLE,
                COPY.MY_INFO_AVATAR_UPLOAD_ERROR_BODY,
              );
            }
          },
        },
      ],
    );
  }
```

- [ ] **Step 2: Update the picker callbacks**

In `handleAvatarPress`, replace the two references to `handleRemovePhotoStub` with `handleRemovePhoto`. Delete the stub.

- [ ] **Step 3: Run typecheck and tests**

Run: `npx tsc --noEmit && npm test`
Expected: typecheck clean, tests pass.

- [ ] **Step 4: Manual QA**

Pre-condition: an avatar is set (from Task 10 or 11).

- Tap pencil → "Remove Photo" (this option ONLY appears when an avatar is set):
  - Confirmation alert: "Remove photo? Your profile will use your initials again." with Cancel + Remove buttons (Remove in red).
  - Tap Cancel → no change.
  - Tap Remove → spinner appears briefly → wood portrait reverts to placeholder (cream circle). Avatar is now `null` everywhere: tab bar settings icon, profile screen.
- Tap pencil again — the menu should no longer show "Remove Photo" (since `loaded.avatar_url` is now null).

- [ ] **Step 5: Commit**

```bash
git add app/\(tabs\)/profile/my-information.tsx
git commit -m "feat(profile): wire 'Remove Photo' with confirm dialog

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: UI — Make the wood portrait itself tappable

**Files:**
- Modify: `app/(tabs)/profile/my-information.tsx`

Currently only the pencil pill opens the picker. Per the spec §4.2, the entire portrait should also be tappable. Z-order keeps the pencil on top, so taps on the pencil still route through the pencil handler (both call the same function anyway).

- [ ] **Step 1: Wrap the WoodPortrait in a Pressable**

Locate this block (around lines 204-222):

```typescript
          <View style={styles.avatarRow}>
            <View accessibilityRole="none">
              <WoodPortrait
                size={116}
                avatar={loaded?.avatar_url ?? null}
                testID="my-info-avatar"
              />
              {/* Pencil pill overlay */}
              <Pressable
                style={styles.pencilPill}
                onPress={handleAvatarPress}
                ...
              >
                ...
              </Pressable>
            </View>
          </View>
```

Replace with:

```typescript
          <View style={styles.avatarRow}>
            <View accessibilityRole="none">
              <Pressable
                onPress={handleAvatarPress}
                accessibilityRole="button"
                accessibilityLabel={
                  loaded?.avatar_url
                    ? 'Change profile photo'
                    : 'Add profile photo'
                }
                disabled={isUploading}
              >
                <WoodPortrait
                  size={116}
                  avatar={loaded?.avatar_url ?? null}
                  testID="my-info-avatar"
                />
              </Pressable>
              {/* Pencil pill overlay */}
              <Pressable
                style={styles.pencilPill}
                onPress={handleAvatarPress}
                accessibilityRole="button"
                accessibilityLabel={isUploading ? 'Uploading photo' : 'Edit profile photo'}
                hitSlop={8}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator size="small" color={OB_COLORS.ctaText} />
                ) : (
                  <Text style={styles.pencilText}>{'✎'}</Text>
                )}
              </Pressable>
            </View>
          </View>
```

- [ ] **Step 2: Run typecheck and tests**

Run: `npx tsc --noEmit && npm test`
Expected: typecheck clean, tests pass.

- [ ] **Step 3: Manual QA**

- Tap the wood portrait body (not the pencil) → picker menu opens. ✓
- Tap the pencil pill → picker menu opens. ✓
- Both surfaces feel equally tappable.
- VoiceOver: portrait announces as "Change profile photo, button" (or "Add profile photo, button" if no avatar); pencil announces as "Edit profile photo, button".

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/profile/my-information.tsx
git commit -m "feat(profile): make wood portrait itself tappable, not just the pencil

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Task 14: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: All previous tests pass + 5 new `updateAvatar` tests pass. Pre-existing pass count + 5.

- [ ] **Step 2: Typecheck the whole project**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Full manual QA pass**

On a real iOS device (camera flow requires it):

1. **Fresh state** — log in as a user with no avatar. Open My Information. Portrait shows cream placeholder. Pencil shows `✎`.
2. **Tap portrait** → action sheet appears with 3 options (no Remove). Tap Cancel → dismisses.
3. **Tap pencil** → same action sheet appears.
4. **Choose from Library** → pick a photo → crop UI → confirm → spinner briefly → new avatar appears in portrait AND in the bottom tab bar's Settings tab avatar.
5. **Tap portrait again** → action sheet now has 4 options including Remove Photo (in red on iOS).
6. **Take Photo** → permission prompt first time → grant → camera opens → capture → crop → confirm → new avatar replaces previous.
7. **Remove Photo** → confirm alert → tap Remove → spinner → portrait reverts to placeholder. Tab bar settings tab loses avatar (reverts to initials).
8. **Action sheet now shows 3 options again** (no Remove) since `loaded.avatar_url` is null.
9. **Error case** — turn off wifi, Choose from Library, pick image → "Couldn't upload" alert, portrait stays at previous state.
10. **Permission denial** — uninstall app (or revoke camera permission in Settings), Take Photo → tap Don't Allow → see "Camera access needed" alert → tap Open Settings → iOS Settings opens to PupLog permissions.

- [ ] **Step 4: Confirm no untracked files were left behind**

Run: `git status`
Expected: clean working tree (no uncommitted changes from the 6 modified files).

- [ ] **Step 5: Mark the plan complete**

Update this plan file: change the title from `Profile Avatar Upload Implementation Plan` to `Profile Avatar Upload Implementation Plan ✅ (Complete YYYY-MM-DD)`. Commit:

```bash
git add docs/superpowers/plans/2026-05-27-profile-avatar-upload.md
git commit -m "docs: mark profile avatar upload plan complete

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

## Spec coverage map

| Spec section | Implemented by |
| --- | --- |
| §4.1 `updateAvatar` upload path | Tasks 4 (happy), 5 (revert) |
| §4.1 `updateAvatar` remove path | Tasks 6 (happy), 7 (DB-fail revert), 8 (storage delete non-blocking) |
| §4.1 Optimistic UI with local URI | Task 4 step 4 + Task 6 step 3 |
| §4.1 Dual-write to `user_profiles` + auth metadata | Task 4 (upload), Task 6 (remove) |
| §4.1 `authStore.user` update so FloatingTabBar re-renders | Task 2 (setUser setter) + Task 4 + Task 6 |
| §4.2 Platform-specific picker (Action Sheet / Alert) | Task 9 |
| §4.2 "Take Photo" + "Choose from Library" + "Remove Photo" + "Cancel" | Tasks 9, 10, 11, 12 |
| §4.2 Both portrait and pencil are tappable | Task 13 |
| §4.3 `isUploading` loading state in pencil pill | Task 10 step 4 |
| §4.4 Camera permission flow + Settings deep-link | Task 11 |
| §4.5 Copy constants | Task 1 |
| §6 Test coverage (5 cases) | Tasks 4, 5, 6, 7, 8 |
