'use client';

import { useEffect, useRef } from 'react';
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
  onLibrary: () => void;
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
          overflowY: 'auto',
          background: 'var(--paper)',
          borderRadius: 20,
          padding: 'var(--space-5) var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom, 0px))',
          boxShadow: 'var(--shadow-raised)',
          animation: 'lf-sheet-up var(--motion-settle) var(--ease-pendulum) both',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-4)' }}>
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
          <>
            <Label>Chapters</Label>
            <div
              style={{
                display: 'grid',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-5)',
              }}
            >
              {chapters.map((c, i) => {
                const current = i === currentChapter;
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
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
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
                  </button>
                );
              })}
            </div>
          </>
        )}

        <Label>Reading speed</Label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)' }}>
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
      </div>
    </div>
  );
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
