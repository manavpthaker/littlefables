import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Chapter map: picture-based navigation. "You are here" = marigold ring; no text required.
// size="large" = the full-screen primary-navigation variant: big art tiles (128px, far above the 56px
// primary target), wrapping grid. Tiles hold real art and degrade gracefully to tinted washes while
// art hasn't generated (a real product state, not a placeholder).
export function ChapterMap({ chapters, current = 0, onPick, size = 'row' }) {
  const large = size === 'large';
  const tile = large ? 128 : 'var(--tap-standard)';
  return (
    <div style={large
      ? { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }
      : { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', overflowX: 'auto', padding: 'var(--space-2)' }}>
      {chapters.map((c, i) => {
        const here = i === current, done = i < current;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ width: large ? 34 : 22, borderTop: '3px dotted var(--ink-faint)', flex: 'none' }}></span>}
            <button data-utterance={here ? `You are here: ${c.title}` : c.title} onClick={() => onPick && onPick(i)} style={{
              flex: 'none', width: tile, height: tile, borderRadius: large ? 'var(--radius-lg)' : 'var(--radius-md)',
              border: here ? '4px solid var(--marigold)' : 'var(--border-soft)', cursor: 'pointer',
              background: c.art ? `url(${c.art}) center/cover` : `radial-gradient(80% 80% at 30% 25%, ${c.tint || 'var(--river-wash)'}, transparent 80%), var(--paper-bright)`,
              boxShadow: here ? 'var(--elev-raised)' : 'var(--elev-rest)', position: 'relative',
              animation: here ? 'lf-breath var(--dur-breath) var(--ease-drift) infinite' : 'none',
              opacity: done || here ? 1 : 0.75,
            }}>
              {done && <span style={{ position: 'absolute', right: large ? -8 : -6, top: large ? -8 : -6, width: large ? 30 : 22, height: large ? 30 : 22, borderRadius: '50%', background: 'var(--sage)', display: 'grid', placeItems: 'center' }}><Icon name="check" size={large ? 18 : 14} color="#FBF4E6" /></span>}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
