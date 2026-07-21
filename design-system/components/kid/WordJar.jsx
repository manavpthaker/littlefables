import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Word jar (Redesign 2026-07-21): the Home face of the wordbook — a glass-wash
// panel holding his most recent kept words as hand-font pills. One tap target
// (the whole jar) → the Word Book. No numerals rule: the count is spoken via
// the utterance, the pills carry the visible meaning. Hidden when empty —
// the first star creates it, which is its own little event.
export function WordJar({ words, count = 0, utterance, onOpen }) {
  if (!words || words.length === 0) return null;
  return (
    <button
      type="button"
      data-utterance={utterance || 'Your word jar!'}
      onClick={onOpen}
      style={{
        border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', maxWidth: 420,
        background: 'var(--wash-capsule)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-4)',
        boxShadow: 'var(--elev-card)', display: 'grid', gap: 'var(--space-2)',
        minHeight: 'var(--tap-min)', color: 'var(--ink)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', fontFamily: 'var(--font-hand)', fontSize: 'var(--text-hand)', color: 'var(--ink-soft)' }}>
        <Icon name="star" size={18} color="var(--marigold)" fill="currentColor" />
        Word jar
      </span>
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {words.slice(0, 4).map((w) => (
          <span key={w.word} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--paper-bright)', borderRadius: 'var(--radius-pill)',
            padding: '4px 12px', fontFamily: 'var(--font-hand)', fontSize: 17,
            boxShadow: 'var(--elev-rest)',
            color: w.owned ? 'var(--ink)' : 'var(--ink-soft)',
          }}>
            {w.owned && <Icon name="star" size={13} color="var(--marigold)" fill="currentColor" />}
            {w.word}
          </span>
        ))}
        {count > 4 && (
          <span aria-hidden="true" style={{ fontFamily: 'var(--font-hand)', fontSize: 17, color: 'var(--ink-faint)', alignSelf: 'center' }}>…</span>
        )}
      </span>
    </button>
  );
}
