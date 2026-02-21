# src/hooks/ — Custom React Hooks

Two hooks for app lifecycle and network monitoring.

## useAppState.ts

Manages app foreground/background transitions. Mounted once in `app/_layout.tsx` (root layout).

**What it does:**
1. **Foreground detection**: When app transitions from `inactive`/`background` to `active`, validates the session by calling `supabase.auth.getSession()`. If the session is gone (expired, revoked), updates the auth store which triggers redirect to sign-in.
2. **Auto-refresh management**: Calls `supabase.auth.startAutoRefresh()` when active, `stopAutoRefresh()` when backgrounded. This prevents unnecessary network requests when the app is in the background.

**Implementation**: Uses `AppState.addEventListener('change', ...)` with a `useRef` to track the previous state. Cleanup removes the subscription on unmount.

## useNetworkStatus.ts

Polls for network connectivity and returns a boolean.

**What it does:**
- Returns `isConnected: boolean` (defaults to `true` optimistically)
- Polls `Network.getNetworkStateAsync()` every 5 seconds
- `expo-network` does NOT have a listener/subscription API, hence polling

**Where it's used:**
- `triage.tsx` — Disables submit button and shows `OfflineBanner` when offline
- `emergency.tsx` — Shows offline card reassuring phone dialer works without internet

**Error handling**: If `getNetworkStateAsync()` throws (e.g., on web), assumes connected. This prevents false offline states from blocking the UI.

**Cleanup**: Uses a `mounted` flag pattern to prevent state updates after unmount, plus `clearInterval` on cleanup.
