'use client';

import { useEffect, useRef, useState } from 'react';
import { Wordmark } from '@ds/components/core/Wordmark.jsx';

// Everything that used to live in the reader's top bar and footer, folded
// behind one mark button beside the play capsule.
//
// The reading surface should hold the story and nothing else. Back, chapters
// and reading speed are all things a child reaches for once a session at most,
// so they cost a tap rather than permanent screen space — and the book title,
// which was taking the widest slot in the old header, turns out to be
// something you only need when you are leaving.

export type PlaybackRate = 0.85 | 1 | 1.15;

const RATES: { value: PlaybackRate; label: string }[] = [
  { value: 0.85, label: 'slower' },
  { value: 1, label: 'normal' },
  { value: 1.15, label: 'faster' },
];

export interface ReaderMenuChapter {
  title: string;
  pageCount: number;
  /** First illustrated page in the chapter, or the book cover as a
   *  fallback. Used as the card thumbnail. */
  thumbnail: string | null;
}

export interface ReaderMenuProps {
  open: boolean;
  bookTitle: string;
  chapters: ReaderMenuChapter[] | null;
  currentChapter: number | null;
  rate: PlaybackRate;
  onRate: (r: PlaybackRate) => void;
  onPickChapter: (i: number) => void;
  /** Enables the share actions. Null on surfaces without a child-device
   *  session (public shares, samples) — minting would 401 there anyway. */
  shareBookId?: string | null;
  /** Null hides "Choose another story" (a single-book share has no shelf). */
  onLibrary: (() => void) | null;
  onClose: () => void;
}

export function ReaderMenu({
  open,
  bookTitle,
  chapters,
  currentChapter,
  rate,
  onRate,
  onPickChapter,
  shareBookId = null,
  onLibrary,
  onClose,
}: ReaderMenuProps) {
  const panel = useRef<HTMLDivElement | null>(null);

  // Escape closes, and focus moves into the sheet so a keyboard user is not
  // left tabbing through the page behind it.
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const row: React.CSSProperties = {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    border: 'none',
    background: 'transparent',
    color: 'var(--ink)',
    fontFamily: 'var(--font-body)',
    fontSize: 17,
    padding: '13px 4px',
    borderRadius: 'var(--radius-sm)',
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'rgba(28, 19, 14, 0.42)',
        display: 'grid',
        placeItems: 'end center',
        padding: 'var(--space-4)',
      }}
    >
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={bookTitle}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(460px, 100%)',
          maxHeight: '78dvh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--paper)',
          borderRadius: 20,
          boxShadow: 'var(--shadow-raised)',
          animation: 'lf-sheet-up var(--motion-settle) var(--ease-pendulum) both',
          outline: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 'var(--space-5) var(--space-5) var(--space-3)',
            flex: '0 0 auto',
          }}
        >
          <Wordmark layout="mark-only" markSize={30} />
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 22,
              color: 'var(--ink)',
              flex: 1,
              minWidth: 0,
            }}
          >
            {bookTitle}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" style={{ ...row, width: 'auto', fontSize: 20, padding: 6 }}>
            ✕
          </button>
        </div>

        {chapters && chapters.length > 0 && (
          <div
            style={{
              flex: '1 1 auto',
              minHeight: 0,
              overflowY: 'auto',
              padding: '0 var(--space-5)',
            }}
          >
            <Label>Chapters</Label>
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-2)',
                paddingBottom: 'var(--space-3)',
              }}
            >
              {chapters.map((c, i) => {
                const current = i === currentChapter;
                // Linear-read model: anything before current is "read".
                // Doesn't handle skipping around perfectly, but for a
                // parent glancing at "how far are we" it's the right
                // read most of the time — and cheap to compute without
                // a per-chapter progress store.
                const read = currentChapter !== null && i < currentChapter;
                const status: 'current' | 'read' | 'unread' = current
                  ? 'current'
                  : read
                    ? 'read'
                    : 'unread';
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onPickChapter(i);
                      onClose();
                    }}
                    aria-current={current}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      width: '100%',
                      textAlign: 'left',
                      padding: 'var(--space-2) var(--space-2)',
                      borderRadius: 'var(--radius-md)',
                      border: current ? '1px solid var(--oxblood)' : '1px solid var(--pill-edge)',
                      background: current ? 'var(--oxblood-wash)' : 'var(--paper-warm)',
                      color: 'var(--ink)',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        flex: '0 0 auto',
                        width: 48,
                        height: 60,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: c.thumbnail
                          ? `center / cover no-repeat url(${c.thumbnail})`
                          : 'var(--paper-deep)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                        opacity: status === 'unread' ? 0.85 : 1,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          fontFamily: 'var(--font-sc, var(--font-body))',
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                          color: current ? 'var(--oxblood-text)' : 'var(--ink-faint)',
                        }}
                      >
                        chapter {i + 1}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: 17,
                          lineHeight: 1.2,
                          color: 'var(--ink)',
                        }}
                      >
                        {c.title}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--ink-faint)' }}>
                        {c.pageCount} page{c.pageCount === 1 ? '' : 's'}
                      </span>
                    </div>
                    <StatusChip status={status} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div
          style={{
            flex: '0 0 auto',
            padding: 'var(--space-4) var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid var(--pill-edge)',
            background: 'var(--paper)',
          }}
        >
          <Label>Reading speed</Label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-4)' }}>
            {RATES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => onRate(r.value)}
                aria-pressed={rate === r.value}
                style={{
                  flex: 1,
                  border: '1px solid var(--pill-edge)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '10px 0',
                  fontFamily: 'var(--font-body)',
                  fontSize: 15,
                  background: rate === r.value ? 'var(--oxblood-wash)' : 'transparent',
                  color: rate === r.value ? 'var(--oxblood-text)' : 'var(--ink-soft)',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {shareBookId && <ShareSection bookId={shareBookId} bookTitle={bookTitle} />}

          {onLibrary && (
            <button
              type="button"
              onClick={onLibrary}
              style={{
                ...row,
                textAlign: 'center',
                border: '1px solid var(--pill-edge)',
                borderRadius: 'var(--radius-pill)',
                color: 'var(--oxblood-text)',
              }}
            >
              Choose another story
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Share actions. Each tap mints a fresh /share link via the child-device
// session (POST /api/child/share) and hands it to the OS share sheet where
// one exists, otherwise the clipboard. "This story" grants one book;
// "All stories" grants the household's whole shelf.
function ShareSection({ bookId, bookTitle }: { bookId: string; bookTitle: string }) {
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

function StatusChip({ status }: { status: 'current' | 'read' | 'unread' }) {
  if (status === 'current') {
    return (
      <span
        aria-label="reading"
        style={{
          flex: '0 0 auto',
          fontFamily: 'var(--font-sc, var(--font-body))',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--oxblood-text)',
          padding: '3px 8px',
          borderRadius: 999,
          background: 'var(--paper)',
          border: '1px solid var(--oxblood)',
          whiteSpace: 'nowrap',
        }}
      >
        reading
      </span>
    );
  }
  if (status === 'read') {
    return (
      <span
        aria-label="read"
        title="Read"
        style={{
          flex: '0 0 auto',
          width: 20,
          height: 20,
          borderRadius: 999,
          background: 'var(--forest-wash)',
          color: 'var(--forest)',
          display: 'grid',
          placeItems: 'center',
          fontSize: 12,
          lineHeight: 1,
        }}
      >
        ✓
      </span>
    );
  }
  return null;
}

function Label({ children }: { children: React.ReactNode }) {
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
