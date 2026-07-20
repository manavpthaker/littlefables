import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Chapter map: picture-based navigation. "You are here" = marigold ring.
// size="large" = the full-screen primary-navigation variant: big tiles (128px),
// wrapping grid. Tiles hold real art; while art hasn't generated they degrade to
// a *titled*, tinted wash — a chapter number + name — so the map is navigable
// before art exists instead of a row of identical blank squares.
const FALLBACK_TINTS = ['#EBCB9E', '#C9DCC0', '#D7C4E2', '#B9D1DF', '#EEC6BD', '#E5D6A6', '#CBD9C4', '#E0C3D0'];

export function ChapterMap({ chapters, current = 0, onPick, size = 'row' }) {
  const large = size === 'large';
  const tile = large ? 128 : 'var(--tap-standard)';
  return (
    <div style={large
      ? { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)' }
      : { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', overflowX: 'auto', padding: 'var(--space-2)' }}>
      {chapters.map((c, i) => {
        const here = i === current, done = i < current;
        const tint = c.tint || FALLBACK_TINTS[i % FALLBACK_TINTS.length];
        return (
          <React.Fragment key={i}>
            {/* connector dots only in the compact inline strip — in the large grid
                they wrapped into stray "…" runs that read as leftover placeholder. */}
            {i > 0 && !large && <span style={{ width: 22, borderTop: '3px dotted var(--ink-faint)', flex: 'none' }}></span>}
            <button data-utterance={here ? `You are here: ${c.title}` : c.title} onClick={() => onPick && onPick(i)} style={{
              flex: 'none', width: tile, height: tile, borderRadius: large ? 'var(--radius-lg)' : 'var(--radius-md)',
              border: here ? '4px solid var(--marigold)' : 'var(--border-soft)', cursor: 'pointer',
              background: c.art ? `url(${c.art}) center/cover` : `radial-gradient(80% 80% at 30% 25%, ${tint}, transparent 80%), var(--paper-bright)`,
              boxShadow: here ? 'var(--elev-raised)' : 'var(--elev-rest)', position: 'relative',
              animation: here ? 'lf-breath var(--dur-breath) var(--ease-drift) infinite' : 'none',
              opacity: done || here ? 1 : 0.9,
              display: 'grid', placeItems: 'center', padding: large ? 10 : 0,
            }}>
              {/* chapter number chip — always visible so tiles are orientable */}
              {large && <span style={{ position: 'absolute', left: 8, top: 8, minWidth: 22, height: 22, padding: '0 6px', borderRadius: 'var(--radius-pill)', background: 'rgba(255,255,255,.75)', color: 'var(--ink)', fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center' }}>{i + 1}</span>}
              {/* chapter title — shown when there's no art to carry the tile */}
              {large && !c.art && c.title && <span style={{ fontFamily: 'var(--font-hand)', fontSize: 14, lineHeight: 1.15, color: 'var(--ink)', textAlign: 'center', textShadow: '0 1px 0 rgba(255,255,255,.5)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{c.title}</span>}
              {done && <span style={{ position: 'absolute', right: large ? -8 : -6, top: large ? -8 : -6, width: large ? 30 : 22, height: large ? 30 : 22, borderRadius: '50%', background: 'var(--sage)', display: 'grid', placeItems: 'center' }}><Icon name="check" size={large ? 18 : 14} color="#FBF4E6" /></span>}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}
