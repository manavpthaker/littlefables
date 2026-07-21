import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Star-save landing: a wash-capsule pill (star + word in hand font) that blooms on save and lands in the top bar.
// owned (Redesign 2026-07-21): the word was re-encountered + understood at a checkpoint — sage ring, full-strength star.
export function WordCapsule({ word, justSaved = false, owned = false, onTap }) {
  return (
    <button data-utterance={owned ? `${word} — yours now!` : `${word} — kept!`} onClick={onTap} style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', border: 'none', cursor: 'pointer',
      background: 'var(--wash-capsule)', backdropFilter: 'blur(14px)', borderRadius: 'var(--radius-pill)',
      padding: '8px 16px 8px 12px', minHeight: 'var(--tap-min)',
      boxShadow: owned ? '0 0 0 3px var(--sage), var(--elev-card)' : 'var(--elev-card)',
      animation: justSaved ? 'lf-bloom var(--dur-bloom) var(--ease-settle) 1' : 'none',
    }}>
      <Icon name="star" size={18} color="var(--marigold)" fill="currentColor" />
      <span style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--text-hand)', color: 'var(--ink)' }}>{word}</span>
    </button>
  );
}
