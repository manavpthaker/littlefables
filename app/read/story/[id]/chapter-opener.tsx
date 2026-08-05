'use client';

import { useEffect, useState } from 'react';

// Brief "Chapter N · Title" caption that fades in over the first page
// whenever the reader enters a new chapter. Fades out on its own after
// SHOW_MS so nothing lingers.
//
// pointer-events: none — it never blocks the tap-to-hear layer.
// Skipped for single-chapter (quick) books because there's no chapter
// context to announce there.

const SHOW_MS = 2600;

export function ChapterOpener({
  chapterIdx,
  pageIdx,
  chapterCount,
  chapterTitle,
}: {
  chapterIdx: number | null;
  pageIdx: number;
  chapterCount: number;
  chapterTitle: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (chapterIdx === null) return;
    if (pageIdx !== 0) return; // Only announce on chapter arrival, not on back-navigation
    if (chapterCount <= 1) return; // Quick book — no chapter identity to announce
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), SHOW_MS);
    return () => window.clearTimeout(t);
    // Deliberately re-fires only when chapterIdx changes; pageIdx=0 gates
    // to arrivals, and downstream props are read at render time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterIdx]);

  if (chapterIdx === null || !chapterTitle) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 'calc(var(--space-6) + env(safe-area-inset-top, 0px))',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <span
        style={{
          padding: '10px 22px',
          background: 'var(--wash-panel)',
          border: '1px solid var(--border-soft)',
          borderRadius: 999,
          fontFamily: 'var(--font-sc, var(--font-body))',
          fontSize: 13,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--ink-soft)',
          boxShadow: 'var(--shadow-rest)',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-6px)',
          transition:
            'opacity 480ms var(--ease-mechanical), transform 480ms var(--ease-mechanical)',
          whiteSpace: 'nowrap',
          maxWidth: 'calc(100vw - 32px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Chapter {(chapterIdx ?? 0) + 1} · {chapterTitle}
      </span>
    </div>
  );
}
