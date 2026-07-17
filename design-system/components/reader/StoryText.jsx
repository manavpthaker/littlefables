import React, { useState } from 'react';
import { Icon } from '../core/Icon.jsx';
const stem = w => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '').toLowerCase();
// Reader text with word-level highlight + tap-any-word + star-save (PRD A9).
// words: [{w:'Rosa'},...]; currentIndex drives spoken-so-far/current/upcoming.
// Star-save hit area: after a word tap the WHOLE word capsule is armed as the star target (>=44px —
// 30px/1.52 line plus vertical padding); the 16px star icon is visual-only (pointer-events none).
// Persistence: the affordance stays armed until another word is tapped (which moves it) or the page
// turns; there is NO timeout — no time pressure. Reduced-motion: the star fades in (bloom collapses).
export function StoryText({ words, currentIndex = -1, starredWords = [], onHearWord, onStarWord, overArt = false }) {
  const [tapped, setTapped] = useState(null); // index showing the star affordance
  return (
    <p style={{
      fontFamily: 'var(--font-body)', fontSize: 'var(--text-reading)', lineHeight: 'var(--lh-reading)',
      color: 'var(--ink)', margin: 0,
      background: overArt ? 'var(--wash-panel)' : 'transparent',
      borderRadius: overArt ? 'var(--radius-lg)' : 0,
      padding: overArt ? 'var(--space-5) var(--space-6)' : 0,
      boxShadow: overArt ? 'var(--elev-raised)' : 'none',
    }}>
      {words.map((t, i) => {
        const state = i === currentIndex ? 'current' : i < currentIndex ? 'spoken' : 'upcoming';
        const starred = starredWords.includes(stem(t.w));
        return (
          <span key={i} style={{ position: 'relative', whiteSpace: 'nowrap' }}>
            <span role="button" tabIndex={0} data-utterance={tapped === i ? `Keep ${t.w}?` : t.w}
              aria-label={tapped === i ? `Keep the word ${t.w}` : `Hear ${t.w}`}
              onClick={() => {
                if (tapped === i) { onStarWord && onStarWord(stem(t.w), i); }
                else { setTapped(i); onHearWord && onHearWord(t.w, i); }
              }}
              style={{
                cursor: 'pointer', borderRadius: 'var(--word-current-radius)', display: 'inline-block',
                padding: state === 'current' || tapped === i ? 'var(--word-current-pad)' : '.06em .04em',
                margin: '.14em 0',
                background: state === 'current' ? 'var(--word-current-bg)' : tapped === i ? 'var(--marigold-wash)' : 'transparent',
                color: state === 'upcoming' ? 'var(--word-upcoming-ink)' : 'var(--word-spoken-ink)',
                transition: 'background var(--dur-tap) var(--ease-settle), color var(--dur-settle) var(--ease-settle)',
              }}>{t.w}</span>
            {(starred || tapped === i) && (
              <span aria-hidden="true" style={{
                  position: 'absolute', top: '-0.8em', right: '-0.35em', pointerEvents: 'none', lineHeight: 0,
                  color: 'var(--word-star-color)', animation: starred ? 'none' : 'lf-bloom var(--dur-bloom) var(--ease-settle) 1',
                }}><Icon name="star" size={16} fill={starred ? 'currentColor' : 'none'} /></span>
            )}
          </span>
        );
      }).reduce((acc, el, i) => (i ? [...acc, ' ', el] : [el]), [])}
    </p>
  );
}
