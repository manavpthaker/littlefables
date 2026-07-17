// Static shell precached by the service worker at install time. If a user
// hits a fresh URL while offline before any real page loads, they land here.
// The SW's networkFirstDocument strategy prefers the cached real page, so
// this is only used for cold-cache-offline cases.
export const dynamic = 'force-static';

export default function OfflineShell() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--space-4)',
        textAlign: 'center',
        gap: 'var(--space-3)',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Offline</h1>
      <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
        Open a story while online first — it will stay on this device for later.
      </p>
    </main>
  );
}
