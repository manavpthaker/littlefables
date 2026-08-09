import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { IconButton } from '../core/Button.jsx';
// Wordbook entry: a kept word with its meaning + the sentence it came from. Star fills when "owned" (PRD B5).
export function WordbookEntry({ word, meaning, sentence, owned = false, onPlay }) {
  return (
    <div data-utterance={`${word}. ${meaning}`} style={{
      background: 'var(--paper-bright)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--elev-card)',
      padding: 'var(--space-4) var(--space-5)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center', maxWidth: 460,
    }}>
      <span style={{ color: 'var(--marigold)', flex: 'none' }}>
        <Icon name="star" size={24} strokeWidth={2} fill={owned ? 'currentColor' : 'none'} style={{ filter: owned ? 'drop-shadow(0 0 6px rgba(227,154,50,.6))' : 'none' }} />
        </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 'calc(var(--text-hand) * 1.25)', color: 'var(--ink)', lineHeight: 1.1 }}>{word}</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--ink)' }}>{meaning}</div>
        {sentence && <div style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', marginTop: 2 }}>&ldquo;{sentence}&rdquo;</div>}
      </div>
      <IconButton name="volume-2" label={`Hear ${word}`} variant="soft" size="small" onClick={onPlay} />
    </div>
  );
}
