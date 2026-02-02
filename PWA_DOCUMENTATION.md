# TrackiFi PWA Documentation

TrackiFi has been converted into a Progressive Web App (PWA) to provide a seamless, installable, and offline-capable experience.

## Features

- **Installable**: Users can add TrackiFi to their home screen on Android, iOS, and Desktop.
- **Offline Support**: The app caches essential assets (HTML, JS, CSS, images) and provides cached data for key API requests when offline.
- **Network Status Indicator**: A floating indicator appears when the device loses internet connectivity.
- **Auto-Update**: The service worker automatically updates when a new version of the app is deployed.

## Implementation Details

### 1. Configuration (`vite.config.ts`)

We use `vite-plugin-pwa` for PWA management.

- **Manifest**: Located in the Vite config, it defines the app name, icons, and theme colors.
- **Workbox**: Handles service worker generation and caching strategies.
  - `CacheFirst`: Used for static assets (images, fonts).
  - `NetworkFirst`: Used for API calls to Supabase and the TrackiFi Backend, ensuring the latest data is shown if available, with offline fallback.

### 2. Service Worker Registration

The service worker is automatically injected into the build by `vite-plugin-pwa`. It is configured with `registerType: 'autoUpdate'`.

### 3. Offline Indicator (`src/components/OfflineIndicator.tsx`)

A modular React component that listens to `online` and `offline` window events to notify the user of their connectivity status.

### 4. Icons

The app uses `public/TrackiFi-logo.png` as the primary icon source. For production, it is recommended to provide specifically sized icons:

- `192x192`
- `512x512`
- Maskable icons for Android.

## Maintenance

To update the PWA settings:

1. Modify `client/vite.config.ts` in the `VitePWA` plugin section.
2. If adding new static asset types, update `globPatterns` in the `workbox` configuration.
3. If adding new API endpoints that require offline support, add a new rule to `runtimeCaching`.

## Advanced PWA Features

### 1. App Shortcuts

TrackiFi supports home screen shortcuts on compatible devices. Long-press the app icon to:

- **Add Transaction**: Jump directly to the Quick Entry dialog.
- **View Analytics**: Navigate straight to the insights page.

### 2. Custom Install Experience

Instead of relying on browser-default prompts, we use a custom `InstallBanner` component.

- **Hook**: `usePWAInstall.ts` manages the `beforeinstallprompt` event.
- **Persistence**: The banner can be dismissed, and it only appears if the app is installable and not yet installed.

### 3. Offline-First Mutations (Optimistic Updates)

TrackiFi now handles data changes gracefully even with a spotty connection:

- **Optimistic UI**: When adding a transaction, the dashboard totals and history update **instantly** before the server responds.
- **Rollback**: If the transaction fails to save, the UI automatically reverts to the previous accurate state.
- **Background Sync**: Mutations are handled via TanStack Query, which manages refetching upon reconnection.

### 4. Persistent Cache

We use `@tanstack/react-query-persist-client` to save the application state to `localStorage`.

- **Benefit**: If a user opens the app while completely offline, they will see the data from their last session immediately, rather than a loading spinner or empty state.
- **Configuration**: Managed in `src/providers.tsx` with a 24-hour garbage collection time for the persistent cache.

## Verification Checklist

1. [ ] **Shortcuts**: Verify shortcuts appear in Android/Chrome "App Info" or context menu.
2. [ ] **Install**: Verify the `Install TrackiFi` banner appears on first visit (non-installed).
3. [ ] **Persistence**: Load the app, go offline, close the tab, and reopen. Data should still be visible.
4. [ ] **Optimistic**: Add a transaction while the Network tab is throttled to "Slow 3G". The UI should update before the request finishes.
