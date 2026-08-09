import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Star-save landing: a wash-capsule pill (star + word in hand font) that blooms on save and lands in the top bar.
export function WordCapsule({ word, justSaved = false, onTap }) {
  return (
    <button data-utterance={`${word} — kept!`} onClick={onTap} style={{
      display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', border: 'none', cursor: 'pointer',
      background: 'var(--wash-capsule)', backdropFilter: 'blur(14px)', borderRadius: 'var(--radius-pill)',
      padding: '8px 16px 8px 12px', minHeight: 'var(--tap-min)', boxShadow: 'var(--elev-card)',
      animation: justSaved ? 'lf-bloom var(--dur-bloom) var(--ease-settle) 1' : 'none',
    }}>
      <Icon name="star" size={18} color="var(--marigold)" fill="currentColor" />
      <span style={{ fontFamily: 'var(--font-hand)', fontSize: 'var(--text-hand)', color: 'var(--ink)' }}>{word}</span>
    </button>
  );
}
