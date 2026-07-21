'use client';

import type { VocabEntry } from '@/lib/models/book';

// Word popover (pixel-parity II.4): tap a word → card with the word, 🔊,
// syllables, kid definition, and Again / Keep it. Springs up; tapping the
// backdrop dismisses without keeping.

export function WordPopover({
  word,
  entry,
  onAgain,
  onKeep,
  onClose,
}: {
  word: string;
  entry?: VocabEntry;
  onAgain: () => void;
  onKeep: () => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 44, display: 'grid', alignItems: 'end', justifyItems: 'center' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          marginBottom: 132,
          background: '#FFFFFF',
          border: '1.5px solid var(--sand-line)',
          borderRadius: 22,
          boxShadow: 'var(--elev-float)',
          padding: 'var(--space-4) var(--space-5)',
          display: 'grid',
          gap: 'var(--space-2)',
          justifyItems: 'center',
          maxWidth: 320,
          animation: 'lf-sheet-up 380ms cubic-bezier(.2,.9,.3,1.2) 1',
        }}
      >
        <button
          onClick={onAgain}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--marigold-deep)', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          {word} <span aria-hidden="true" style={{ fontSize: 17 }}>🔊</span>
        </button>
        {entry?.syllables && entry.syllables.length > 1 && (
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-faint)' }}>
            {entry.syllables.join(' · ')}
          </span>
        )}
        {(entry?.kidDefinition ?? entry?.meaning) && (
          <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-soft)', textAlign: 'center' }}>
            {entry?.kidDefinition ?? entry?.meaning}
          </p>
        )}
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
          <button
            onClick={onAgain}
            style={{ border: 'none', cursor: 'pointer', background: 'var(--paper-deep)', color: 'var(--ink)', borderRadius: 'var(--radius-pill)', padding: '10px 16px', fontFamily: 'var(--font-hand)', fontSize: 14, minHeight: 'var(--tap-min)' }}
          >
            🔁 Again
          </button>
          <button
            onClick={onKeep}
            style={{ border: 'none', cursor: 'pointer', background: 'var(--sage)', color: '#FFFFFF', borderRadius: 'var(--radius-pill)', padding: '10px 16px', fontFamily: 'var(--font-hand)', fontSize: 14, fontWeight: 700, minHeight: 'var(--tap-min)' }}
          >
            ⭐ Keep it
          </button>
        </div>
      </div>
    </div>
  );
}
