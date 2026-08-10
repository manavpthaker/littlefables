import React from 'react';
import { Buddy } from '../kid/Buddy.jsx';
// Sheet: paper rising over the bottom two-thirds of an art page — the 4th sanctioned over-art pattern.
// Slots: optional buddy + speech line (spoken verbatim), then content (ChoiceBlocks, etc). Lands content in the reach zone.
export function Sheet({ buddyColor = 'var(--teal)', buddyState = 'speaking', speech, children }) {
  return (
    <div style={{ background: 'var(--paper-bright)', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', boxShadow: 'var(--elev-float)', padding: 'var(--space-6) var(--space-5) var(--space-7)', width: '100%', boxSizing: 'border-box' }}>
      {speech && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
          <Buddy compact size={52} color={buddyColor} state={buddyState} />
          <div data-utterance={speech} style={{ fontFamily: 'var(--font-body)', fontSize: 21, lineHeight: 1.4, color: 'var(--ink)', paddingTop: 6 }}>{speech}</div>
        </div>
      )}
      {children}
    </div>
  );
}
