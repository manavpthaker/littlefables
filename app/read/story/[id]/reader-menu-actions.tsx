'use client';

import { useState } from 'react';
import { InstallSteps, useAddToHomeScreen } from './install-prompt';

// The reader menu's action sections, split out to keep reader-menu.tsx
// under the module size limit. Label lives here because both sections and
// the menu itself set their headings the same way.

// Share actions. A tap mints a /share link via the child-device session
// (POST /api/child/share); "This story" grants one book, "All stories" the
// whole shelf.
//
// Handing that link to the OS is the fiddly part. Safari only allows
// navigator.share() while a user gesture is still "live", and awaiting the
// mint spends it — so sharing straight after the fetch throws
// NotAllowedError even though the link is perfectly good. The first version
// of this reported that as "couldn't make a share link", which was wrong
// twice over: the link existed, and every retry minted another orphan token.
//
// So the mint and the handoff are now separate. Tapping mints and shows the
// link; Share and Copy sit on the result and run inside their own gesture,
// where both APIs are allowed. The link is kept per scope, so tapping twice
// reuses it rather than minting again.
export function ShareSection({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
  const [busy, setBusy] = useState<'book' | 'library' | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [link, setLink] = useState<{ scope: 'book' | 'library'; url: string } | null>(null);

  const titleFor = (scope: 'book' | 'library') =>
    scope === 'book' ? bookTitle : 'Our Little Fables stories';

  async function makeLink(scope: 'book' | 'library') {
    if (link?.scope === scope) {
      setNote(null);
      return;
    }
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
      setLink({ scope, url: `${window.location.origin}${path}` });
    } catch {
      setNote("Couldn't make a share link — try again");
    } finally {
      setBusy(null);
    }
  }

  // Called straight from a tap, with the URL already in hand.
  async function handOff(kind: 'share' | 'copy') {
    if (!link) return;
    try {
      if (kind === 'share' && typeof navigator.share === 'function') {
        await navigator.share({ title: titleFor(link.scope), url: link.url });
        setNote(null);
        return;
      }
      await navigator.clipboard.writeText(link.url);
      setNote('Link copied');
    } catch (err) {
      // Dismissing the OS sheet is a choice, not a failure. Anything else
      // still leaves the link on screen to copy by hand.
      if ((err as Error).name !== 'AbortError') setNote('Copy the link below');
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

  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  return (
    <>
      <Label>Share</Label>
      <div style={{ display: 'flex', gap: 8, marginBottom: link || note ? 8 : 'var(--space-4)' }}>
        {(['book', 'library'] as const).map((scope) => (
          <button
            key={scope}
            type="button"
            onClick={() => void makeLink(scope)}
            disabled={busy !== null}
            aria-pressed={link?.scope === scope}
            style={{
              ...pill,
              background: link?.scope === scope ? 'var(--oxblood-wash)' : 'transparent',
              color: link?.scope === scope ? 'var(--oxblood-text)' : 'var(--ink-soft)',
            }}
          >
            {busy === scope ? 'Making a link…' : scope === 'book' ? 'This story' : 'All stories'}
          </button>
        ))}
      </div>

      {link && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 'var(--space-4)' }}>
          <code
            style={{
              fontSize: 12,
              color: 'var(--ink-soft)',
              background: 'var(--paper-warm)',
              border: '1px solid var(--pill-edge)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              overflowWrap: 'anywhere',
              userSelect: 'all',
            }}
          >
            {link.url}
          </code>
          <div style={{ display: 'flex', gap: 8 }}>
            {canShare && (
              <button type="button" onClick={() => void handOff('share')} style={pill}>
                Share…
              </button>
            )}
            <button type="button" onClick={() => void handOff('copy')} style={pill}>
              Copy link
            </button>
          </div>
        </div>
      )}

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
