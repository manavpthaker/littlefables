import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Book cover card for the shelf. Cover = art (or painting shimmer); progress ribbon; status corner.
// tag = developmental layer chip (Redesign 2026-07-21): capsule top-left, calm pigment dot — never terracotta.
export function BookCard({ title, cover, progress = 0, status, chapters, tag, utterance, onOpen, width = 150 }) {
  const painting = status === 'painting';
  return (
    <button data-utterance={utterance || title} onClick={onOpen} style={{
      width, border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left',
      fontFamily: 'var(--font-body)', color: 'var(--ink)',
      transition: 'transform var(--dur-tap) var(--ease-settle)',
    }}
    onPointerDown={e => e.currentTarget.style.transform = 'scale(.97)'}
    onPointerUp={e => e.currentTarget.style.transform = ''}
    onPointerLeave={e => e.currentTarget.style.transform = ''}>
      <div style={{
        aspectRatio: '3/4', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative',
        boxShadow: 'var(--elev-card)',
        background: painting
          ? 'linear-gradient(90deg,var(--marigold-wash),var(--butter-wash),var(--marigold-wash))'
          : cover ? `url(${cover}) center/cover` : 'radial-gradient(90% 80% at 30% 25%,#9db6cc,transparent 70%),radial-gradient(70% 90% at 75% 75%,#c9a06a,transparent 70%),#a8b89a',
        backgroundSize: painting ? '200% 100%' : undefined,
        animation: painting ? 'var(--motion-paint)' : undefined,
      }}>
        {painting && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'var(--bark)' }}><Icon name="brush" size={30} /></div>}
        {tag && <span style={{ position: 'absolute', top: 8, left: 8, display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--wash-capsule)', backdropFilter: 'blur(14px)', color: 'var(--ink)', borderRadius: 'var(--radius-pill)', padding: '4px 10px', fontFamily: 'var(--font-hand)', fontSize: 15, boxShadow: 'var(--elev-rest)' }}>
          {tag.emoji ? <span aria-hidden="true">{tag.emoji}</span> : <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: '50%', background: `var(${tag.pigment || '--teal'})` }}></span>}
          {tag.label}
        </span>}
        {status === 'new' && <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--marigold)', color: 'var(--ink)', borderRadius: 'var(--radius-pill)', padding: '4px 10px', fontFamily: 'var(--font-hand)', fontSize: 17, boxShadow: 'var(--elev-rest)' }}>new!</span>}
        {progress > 0 && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 8, background: 'rgba(70,54,42,.25)' }}>
          <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--marigold)', borderRadius: '0 4px 4px 0' }}></div>
        </div>}
      </div>
      <div style={{ marginTop: 'var(--space-2)', fontFamily: 'var(--font-display)', fontSize: 17, lineHeight: 1.25 }}>{title}</div>
      {chapters && <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{chapters}</div>}
    </button>
  );
}
// Horizontal shelf with a wooden-well rail.
export function Shelf({ label, children }) {
  return (
    <section>
      {label && <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title)', color: 'var(--ink)', margin: '0 0 var(--space-3)' }}>{label}</h2>}
      <div style={{ display: 'flex', gap: 'var(--card-gap)', overflowX: 'auto', padding: '4px 4px var(--space-4)', borderBottom: '6px solid var(--paper-deep)', borderRadius: '0 0 6px 6px' }}>{children}</div>
    </section>
  );
}
