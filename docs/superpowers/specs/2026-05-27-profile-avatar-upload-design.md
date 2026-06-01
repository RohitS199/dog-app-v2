# Profile Avatar Upload — Design Spec

**Date:** 2026-05-27
**Status:** Approved (design only — implementation plan to follow)
**Scope:** Replace the "Coming soon" placeholder on the My Information screen with a fully functional profile photo picker that uploads to Supabase Storage and updates all consumers of the avatar URL.

---

## 1. Problem

The Profile → My Information screen has a wood-framed portrait with a pencil overlay. Tapping either currently shows an `Alert.alert("Coming soon", "Avatar uploads will arrive in a future update.")`. This is a placeholder. We need to make it functional, matching industry-standard mobile avatar-upload UX.

## 2. Goal

Tapping the portrait or pencil opens a native-feeling source picker. The user can take a photo with the camera, choose one from their library, or remove the existing photo. Selected images upload immediately to Supabase Storage and the new URL is written to both data sources that the app reads avatars from. The change reflects everywhere (this screen, the FloatingTabBar settings tab) without a page refresh.

## 3. Constraints discovered during exploration

### 3.1 Existing infrastructure (reuse, don't rebuild)

- **`WoodPortrait` component** — already renders the SVG wood frame with an `avatar` prop and a placeholder when null. No changes needed.
- **`authStore.updateAvatar(uri)`** — already implements the full Supabase Storage upload pattern (FormData with file, `avatars/${userId}/avatar.jpg`, `upsert: true`, public URL with `?t=${Date.now()}` cache-buster, writes to `auth.user.user_metadata.avatar_url`). The storage upload logic should be replicated, not extended, because we need an additional write target.
- **`AddPupScreen` photo picker** — established library-picker pattern with `mediaTypes: 'images'`, `allowsEditing: true`, `aspect: [1, 1]`, `quality: 0.8`. Match this exactly for consistency.
- **`expo-image-picker`** — already installed and used in two stores.

### 3.2 Data location split (must be reconciled)

There are two places in the app that hold `avatar_url`, and they currently get read by different consumers:

| Source | Written by | Read by |
| --- | --- | --- |
| `user_profiles.avatar_url` (DB table row) | nobody (until this work) | `profileStore.loaded.avatar_url` → My Information screen |
| `auth.user.user_metadata.avatar_url` | `authStore.updateAvatar()` | `FloatingTabBar` (settings tab avatar) |

The new upload flow MUST write to both locations in a single user-facing action. This avoids a second silent refactor (changing what FloatingTabBar reads) and keeps the existing read paths working unchanged.

## 4. Architecture

### 4.1 New method: `useProfileStore.updateAvatar(uri | null)`

Single method on the profile store. Handles upload, removal, optimistic UI, and dual-write to both storage locations.

**Signature:**

```typescript
updateAvatar: (uri: string | null) => Promise<{ success: boolean; error?: string }>
```

**Upload path (`uri` is a string):**

1. Capture the previous `loaded.avatar_url` for rollback.
2. Optimistically set `loaded.avatar_url = uri` in local state so the UI reflects the new image immediately.
3. Build `FormData` with `{ uri, name: 'avatar.jpg', type: 'image/jpeg' }`.
4. Upload to Supabase Storage: bucket `avatars`, path `${userId}/avatar.jpg`, `upsert: true`, `contentType: 'multipart/form-data'`.
5. On upload failure: revert `loaded.avatar_url` to previous value, return `{ success: false, error }`.
6. Get the public URL and append `?t=${Date.now()}` cache-buster → `newAvatarUrl`.
7. Update `user_profiles` table: `UPDATE user_profiles SET avatar_url = newAvatarUrl WHERE id = userId`.
8. Update auth metadata: `supabase.auth.updateUser({ data: { avatar_url: newAvatarUrl } })`.
9. Set `loaded.avatar_url = newAvatarUrl` locally (replacing the optimistic local URI with the public URL).
10. Update `authStore.user` so `FloatingTabBar` re-renders immediately (call `authStore.setState({ user: data.user })` or expose a setter on authStore — implementation detail).
11. Return `{ success: true }`.

**Remove path (`uri === null`):**

1. Capture previous `loaded.avatar_url` for rollback.
2. Optimistically set `loaded.avatar_url = null`.
3. Delete the storage object at `avatars/${userId}/avatar.jpg`. If this fails, log but continue — DB writes are the source of truth.
4. Update `user_profiles.avatar_url = null` in DB.
5. Update auth metadata: `supabase.auth.updateUser({ data: { avatar_url: null } })`.
6. Update `authStore.user`.
7. On DB write failure: revert local state, return `{ success: false, error }`.
8. Return `{ success: true }`.

**Error semantics:**

- Storage upload failure → revert local state, return error. User sees previous avatar and an alert.
- DB write failure after successful upload → leave the uploaded file in storage (orphaned, acceptable), revert local state, return error. The next successful upload will overwrite it anyway via `upsert`.

### 4.2 UI changes in `app/(tabs)/profile/my-information.tsx`

**Replace `handleAvatarPress`** with a source picker.

**Platform-specific picker:**

- **iOS**: `ActionSheetIOS.showActionSheetWithOptions` with `cancelButtonIndex` and `destructiveButtonIndex` (Remove is destructive).
- **Android**: `Alert.alert` with a `buttons` array. Same options, native styling.

**Options:**

1. **Take Photo** — request camera permission via `ImagePicker.requestCameraPermissionsAsync()`. If granted, call `ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 })`. If denied, show permission alert (see §4.5).
2. **Choose from Library** — call `ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 })`. Library access is handled inline by the picker on iOS.
3. **Remove Photo** — only included when `loaded?.avatar_url` is non-null. Tapping shows a confirmation `Alert.alert` (Remove / Cancel). On Remove confirm, call `store.updateAvatar(null)`.
4. **Cancel** — closes the sheet, no action.

**On image selection (camera or library):**

- If `result.canceled`, do nothing.
- Otherwise, set local `isUploading: true` and call `await store.updateAvatar(result.assets[0].uri)`.
- Set `isUploading: false`.
- If `!result.success`, show upload error alert (revert is already handled inside the store).

**Trigger surface:** Both the wood portrait itself AND the pencil pill should open the picker. Currently only the pencil does. Decision: wrap `WoodPortrait` in a `Pressable` that calls the same handler, and keep the existing pencil `Pressable` as a separate child for the visual affordance. Both press handlers call the same `handleAvatarPress` function. The pencil sits above the portrait `Pressable` due to z-order, so taps on the pencil don't bubble — both work correctly. Use `accessibilityLabel="Change profile photo"` on the portrait Pressable, keep `"Edit profile photo"` on the pencil.

### 4.3 Loading state UI

- Add local component state: `const [isUploading, setIsUploading] = useState(false)`.
- While `isUploading`:
  - Pencil pill renders `<ActivityIndicator size="small" color={OB_COLORS.ctaText} />` instead of the `✎` glyph.
  - The portrait `Pressable` has `disabled={isUploading}` to prevent double-taps.
  - The pencil `Pressable` has `disabled={isUploading}`.
- The wood portrait itself does not need an overlay spinner — the pencil pill spinner is sufficient feedback, since the new image already appears optimistically.

### 4.4 Permission flow (camera only)

- Photo library access is handled implicitly by `ImagePicker.launchImageLibraryAsync` on iOS — no permission request needed in our code.
- Camera access requires explicit permission. First "Take Photo" tap:
  - Call `ImagePicker.requestCameraPermissionsAsync()`.
  - If `status === 'granted'`, proceed to `launchCameraAsync`.
  - If `status === 'denied'`:
    - Show `Alert.alert(COPY.MY_INFO_AVATAR_PERMISSION_TITLE, COPY.MY_INFO_AVATAR_PERMISSION_BODY, [{ text: COPY.MY_INFO_AVATAR_CANCEL }, { text: COPY.MY_INFO_AVATAR_OPEN_SETTINGS, onPress: () => Linking.openSettings() }])`.

### 4.5 Copy changes in `src/constants/profileCopy.ts`

**Remove (no longer used):**

```typescript
MY_INFO_AVATAR_COMING_SOON_TITLE: 'Coming soon',
MY_INFO_AVATAR_COMING_SOON_BODY: 'Avatar uploads will arrive in a future update.',
```

**Add:**

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

## 5. Data flow diagram

```
User taps portrait / pencil
  └─ ActionSheet / Alert (Take Photo | Choose from Library | Remove | Cancel)
     ├─ Take Photo
     │   └─ Request camera permission
     │      ├─ Granted → launchCameraAsync → result
     │      └─ Denied → Permission alert (Open Settings)
     ├─ Choose from Library
     │   └─ launchImageLibraryAsync → result
     ├─ Remove Photo
     │   └─ Confirm alert
     │      └─ Confirm → updateAvatar(null)
     └─ Cancel → no-op

On result (not canceled):
  setIsUploading(true)
  → store.updateAvatar(uri)
     ├─ Optimistic local update (loaded.avatar_url = uri)
     ├─ Upload to Storage [avatars/{userId}/avatar.jpg]
     │   └─ Fail → revert local, return error
     ├─ Get public URL + cache-buster
     ├─ UPDATE user_profiles SET avatar_url = newUrl
     ├─ supabase.auth.updateUser({ data: { avatar_url: newUrl } })
     ├─ Update authStore.user (so FloatingTabBar re-renders)
     └─ Update local loaded.avatar_url to public URL
  setIsUploading(false)
  → On error: Alert.alert("Couldn't upload", "Please try again.")
```

## 6. Testing

Extend `src/stores/__tests__/profileStore.test.ts` with `updateAvatar` cases:

- **success**: returns `{ success: true }`, updates `loaded.avatar_url` to the new public URL with cache-buster suffix, calls `supabase.storage.from('avatars').upload`, calls `supabase.from('user_profiles').update`, calls `supabase.auth.updateUser`.
- **storage upload failure**: returns `{ success: false, error }`, `loaded.avatar_url` is reverted to the previous value.
- **DB update failure**: returns `{ success: false, error }`, `loaded.avatar_url` is reverted.
- **remove success**: passing `null`, storage delete is attempted, `loaded.avatar_url` becomes `null`, both DB writes happen.
- **remove with storage delete failure**: DB writes still succeed (storage failure is non-blocking), returns `{ success: true }`.

UI test for `my-information.tsx` is out of scope for this spec — covered by manual QA. (The screen already has a test file. If the existing test file covers `handleAvatarPress`, update it; otherwise leave alone.)

## 7. Out of scope (explicit non-goals)

- **Default-avatar gallery** (pre-canned avatars to pick from) — separate feature.
- **Gravatar lookup** — privacy implications, separate feature.
- **Animated avatars** (GIF/video) — not supported by `WoodPortrait` SVG mask.
- **Dog photo as profile** (carousel of user's dog photos) — separate feature.
- **Refactoring `FloatingTabBar` to read from `profileStore`** — would simplify the dual-write, but expands the blast radius. Acceptable tech debt — the dual-write is contained in one method.
- **Cropping / filters beyond `allowsEditing: true`** — native iOS/Android cropper is sufficient.
- **Image compression beyond `quality: 0.8`** — matches existing pattern.

## 8. Risk register

| Risk | Mitigation |
| --- | --- |
| Upload succeeds but auth metadata write fails → My Information shows new avatar, tab bar still shows old | Use a try/catch sequence — if auth metadata write fails after DB write, log error but still return success. UI is consistent on next session-refresh. Acceptable for v1. |
| User taps Remove on no avatar (edge case) | Remove option is only rendered when `loaded?.avatar_url` exists. Defensive null check inside `updateAvatar(null)` handler in the store. |
| Orphaned storage file on DB write failure | Acceptable — `upsert: true` ensures next upload overwrites. No storage cleanup job needed for MVP. |
| Camera permission permanently denied | Permission alert directs user to system Settings. Standard pattern; no in-app workaround. |
| FormData upload pattern incompatible with future RN version | The exact pattern is already used in `authStore.updateAvatar` and `dogStore`. If one breaks, all three break — fix is centralized. |
