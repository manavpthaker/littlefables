import React from 'react';
// Continue hero (mockup-fidelity, Redesign 2026-07-21): big rounded card —
// art on top (cover or night-sky wash), white panel below with the caps
// eyebrow, serif title, and the screen's ONE primary ("📖 Keep reading",
// action gradient). Kid density only.
export function ContinueCard({ title, chapter, cover, progress = 0, utterance, onContinue }) {
  return (
    <article style={{
      background: 'var(--paper-bright)', borderRadius: 28, overflow: 'hidden',
      boxShadow: 'var(--elev-raised)', display: 'grid',
    }}>
      <div aria-hidden="true" style={{
        height: 'clamp(150px, 24dvh, 230px)', position: 'relative',
        background: cover
          ? `url(${cover}) center/cover no-repeat`
          : 'linear-gradient(160deg,#3D4E7C 0%,#2E3A61 100%)',
      }}>
        {!cover && (
          <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 44, opacity: .9 }}>✨</span>
        )}
        {progress > 0 && (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 6, background: 'rgba(70,54,42,.3)' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--marigold)' }}></div>
          </div>
        )}
      </div>
      <div style={{ padding: 'var(--space-5)', display: 'grid', gap: 'var(--space-2)', justifyItems: 'start' }}>
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: 15, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--marigold)', fontWeight: 700 }}>
          Continue{chapter ? ` · ${chapter}` : ''}
        </span>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 26, lineHeight: 1.2, color: 'var(--ink)' }}>{title}</h3>
        <button
          data-utterance={utterance || `Keep reading ${title}!`}
          onClick={onContinue}
          style={{
            marginTop: 6, border: 'none', cursor: 'pointer',
            background: 'var(--action-grad)', color: 'var(--action-ink)',
            borderRadius: 'var(--radius-pill)', padding: '14px 26px',
            minHeight: 'var(--tap-standard)', fontFamily: 'var(--font-hand)', fontSize: 20, fontWeight: 700,
            boxShadow: 'var(--elev-card)',
          }}
        >
          📖 Keep reading
        </button>
      </div>
    </article>
  );
}
