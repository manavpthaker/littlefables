'use client';

import { useState } from 'react';
import { InstallSteps, useAddToHomeScreen } from './install-prompt';

// The reader menu's action sections, split out to keep reader-menu.tsx
// under the module size limit. Label lives here because both sections and
// the menu itself set their headings the same way.

// Share actions. Each tap mints a fresh /share link via the child-device
// session (POST /api/child/share) and hands it to the OS share sheet where
// one exists, otherwise the clipboard. "This story" grants one book;
// "All stories" grants the household's whole shelf.
export function ShareSection({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const [busy, setBusy] = useState<'book' | 'library' | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function share(scope: 'book' | 'library') {
    setBusy(scope);
    setNote(null);
    try {
      const res = await fetch('/api/child/share', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(scope === 'book' ? { bookId } : {}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { path } = (await res.json()) as { path: string };
      const url = `${window.location.origin}${path}`;
      const title = scope === 'book' ? bookTitle : 'Our Little Fables stories';
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        setNote('Shared');
      } else {
        await navigator.clipboard.writeText(url);
        setNote('Link copied — send it to anyone');
      }
    } catch (err) {
      // Closing the OS share sheet is a choice, not a failure.
      if ((err as Error).name === 'AbortError') setNote(null);
      else setNote("Couldn't make a share link — try again");
    } finally {
      setBusy(null);
    }
  }

  const pill: React.CSSProperties = {
    flex: 1,
    border: '1px solid var(--pill-edge)',
    borderRadius: 'var(--radius-pill)',
    padding: '10px 0',
    fontFamily: 'var(--font-body)',
    fontSize: 15,
    background: 'transparent',
    color: 'var(--ink-soft)',
    cursor: 'pointer',
  };

  return (
    <>
      <Label>Share</Label>
      <div style={{ display: 'flex', gap: 8, marginBottom: note ? 6 : 'var(--space-4)' }}>
        <button type="button" onClick={() => void share('book')} disabled={busy !== null} style={pill}>
          {busy === 'book' ? 'Making a link…' : 'This story'}
        </button>
        <button type="button" onClick={() => void share('library')} disabled={busy !== null} style={pill}>
          {busy === 'library' ? 'Making a link…' : 'All stories'}
        </button>
      </div>
      {note && (
        <p
          role="status"
          style={{
            margin: '0 0 var(--space-3)',
            fontSize: 13,
            color: 'var(--ink-soft)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {note}
        </p>
      )}
    </>
  );
}

// Add-to-home-screen, reachable any time rather than only at the end of a
// book. Renders nothing when there's no install path (already installed,
// or a browser with neither the native prompt nor iOS's manual route).
export function InstallRow() {
  const install = useAddToHomeScreen();
  const [showSteps, setShowSteps] = useState(false);

  if (!install.available) return null;

  return (
    <>
      <Label>On this device</Label>
      <button
        type="button"
        onClick={() => {
          if (install.needsManualSteps) setShowSteps((s) => !s);
          else void install.promptNative();
        }}
        aria-expanded={install.needsManualSteps ? showSteps : undefined}
        style={{
          width: '100%',
          border: '1px solid var(--pill-edge)',
          borderRadius: 'var(--radius-pill)',
          padding: '10px 0',
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          background: 'transparent',
          color: 'var(--ink-soft)',
          cursor: 'pointer',
          marginBottom: showSteps ? 8 : 'var(--space-4)',
        }}
      >
        Keep it on the home screen
      </button>
      {showSteps && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <InstallSteps />
        </div>
      )}
    </>
  );
}


export function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-sc, var(--font-body))',
        fontSize: 12,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--ink-faint)',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}
