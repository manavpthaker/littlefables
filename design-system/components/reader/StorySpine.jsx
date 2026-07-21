import React from 'react';
// Story spine (Redesign 2026-07-21): the retell checklist — story beats fill
// in as the child recounts the arc. Hit beats develop like watercolor (sage,
// filled drawn star); unhit beats wait as quiet silhouettes. Never numbered,
// never scored — numbered beat circles per the mockup (changelog'd exception
// to the numerals rule: list ordering, not a score).
export function StorySpine({ beats }) {
  if (!beats || beats.length === 0) return null;
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--space-2)' }}>
      {beats.map((b, i) => (
        <li
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
            background: b.hit ? 'var(--sage-wash)' : 'var(--paper-deep)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-3)',
            fontFamily: 'var(--font-body)', fontSize: 17, lineHeight: 1.35,
            color: b.hit ? 'var(--ink)' : 'var(--ink-faint)',
            animation: b.hit ? 'var(--motion-develop)' : 'none',
            animationDelay: b.hit ? `${i * 140}ms` : '0ms',
            animationFillMode: 'backwards',
            transition: 'background var(--dur-settle) var(--ease-settle), color var(--dur-settle) var(--ease-settle)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 28, height: 28, flex: 'none', borderRadius: '50%', display: 'grid', placeItems: 'center',
              background: b.hit ? 'var(--sage)' : 'transparent',
              border: b.hit ? 'none' : '2px solid var(--ink-faint)',
              color: b.hit ? 'var(--paper-bright)' : 'var(--ink-faint)',
              fontFamily: 'var(--font-hand)', fontSize: 15, fontWeight: 700,
            }}
          >
            {i + 1}
          </span>
          {b.label}
        </li>
      ))}
    </ol>
  );
}
