import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Celebration moment: badge earn / book complete / star-word collect.
// Confetti = watercolor petals in pigments, gentle fall. Reduced-motion: single butter glow, no particles.
const PETALS = ['var(--marigold)', 'var(--butter)', 'var(--river)', 'var(--sage)', 'var(--berry)', 'var(--plum)'];
export function Celebration({ kind = 'badge', title, subtitle, icon = 'award', color = 'var(--marigold)', children, reducedMotion }) {
  // reducedMotion prop/context override makes the preference testable; undefined falls back to the media query
  const reduced = reducedMotion !== undefined ? reducedMotion : (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  return (
    <div data-utterance={title} style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', background: 'var(--paper-bright)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--elev-float)', padding: 'var(--space-8) var(--space-6)', maxWidth: 380 }}>
      {!reduced && [...Array(14)].map((_, i) => (
        <span key={i} style={{
          position: 'absolute', left: `${(i * 71) % 100}%`, top: -14, width: 10 + (i % 3) * 4, height: 14 + (i % 4) * 4,
          background: PETALS[i % PETALS.length], opacity: .8, borderRadius: '60% 40% 55% 45%',
          animation: `lf-fall ${2.8 + (i % 5) * 0.5}s linear ${i * 0.25}s infinite`,
        }}></span>
      ))}
      <div style={{
        width: 110, height: 110, margin: '0 auto var(--space-4)', borderRadius: '50%', display: 'grid', placeItems: 'center',
        background: `radial-gradient(70% 70% at 35% 30%, color-mix(in oklch, ${color} 45%, white), ${color})`,
        boxShadow: `0 0 40px color-mix(in oklch, ${color} 60%, transparent), var(--elev-raised)`,
        animation: 'lf-bloom var(--dur-bloom) var(--ease-settle) 1',
      }}>
        <Icon name={icon} size={54} color="#FBF4E6" />
      </div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--ink)', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--ink-soft)', margin: 'var(--space-2) 0 0' }}>{subtitle}</p>}
      {children && <div style={{ marginTop: 'var(--space-5)' }}>{children}</div>}
      <style>{`@keyframes lf-fall{0%{transform:translateY(-20px) rotate(0)}100%{transform:translateY(420px) rotate(200deg)}}`}</style>
    </div>
  );
}

// Celebration queue: one at a time, fixed order (sun-moment -> badge -> wordbook-milestone),
// next starts only after the previous settles + a gap. Never stack celebrations.
const KIND_ORDER = { sun: 0, badge: 1, book: 1, word: 2 };
export function CelebrationQueue({ items = [], gap = 600, onEmpty, reducedMotion }) {
  const [i, setI] = React.useState(0);
  const [resting, setResting] = React.useState(false);
  const ordered = React.useMemo(() => [...items].sort((a, b) => (KIND_ORDER[a.kind] ?? 1) - (KIND_ORDER[b.kind] ?? 1)), [items]);
  if (i >= ordered.length) { onEmpty && onEmpty(); return null; }
  if (resting) return null; // the gap between celebrations
  const item = ordered[i];
  const advance = () => { setResting(true); setTimeout(() => { setResting(false); setI(n => n + 1); }, gap); };
  return (
    <Celebration {...item} reducedMotion={reducedMotion}>
      {item.children}
      <div style={{ marginTop: 'var(--space-4)' }}>
        <button data-utterance={i + 1 < ordered.length ? 'And there is more!' : 'Back to your books!'} onClick={advance} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 'var(--tap-standard)', padding: '0 24px', borderRadius: 'var(--radius-pill)', border: 'none', background: 'var(--terracotta)', color: 'var(--action-ink)', fontFamily: 'var(--font-display)', fontSize: 'var(--text-label)', cursor: 'pointer', boxShadow: 'var(--elev-card)' }}>
        {i + 1 < ordered.length ? 'What else?' : 'All done!'}</button>
      </div>
    </Celebration>
  );
}
