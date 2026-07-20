import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Buddy presence: watercolor blob avatar + state ring + optional speech bubble. The buddy IS the state indicator.
const stateRing = {
  speaking: { color: 'var(--state-speaking)', anim: 'lf-breath var(--dur-breath) var(--ease-drift) infinite' },
  listening: { color: 'var(--state-listening)', anim: 'lf-listening var(--dur-breath) var(--ease-drift) infinite' },
  thinking: { color: 'var(--state-thinking)', anim: 'lf-pulse 1.4s var(--ease-drift) infinite' },
  idle: { color: 'transparent', anim: 'lf-breath var(--dur-breath) var(--ease-drift) infinite' },
};
export function Buddy({ name = 'Buddy', color = 'var(--teal)', state = 'idle', size = 96, compact = false, speech, utterance, emoji }) {
  const ring = stateRing[state] || stateRing.idle;
  const avatar = (
    <div data-utterance={utterance} style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `3px solid ${ring.color}`, animation: ring.anim, opacity: state === 'idle' ? 0 : 1, transition: 'opacity var(--dur-settle) var(--ease-settle)' }}></div>
      <div style={{ width: '100%', height: '100%', borderRadius: '46% 54% 52% 48% / 52% 46% 54% 48%', background: `radial-gradient(70% 70% at 35% 30%, color-mix(in oklch, ${color} 55%, white), ${color})`, boxShadow: 'var(--elev-card)', animation: 'lf-breath var(--dur-breath) var(--ease-drift) infinite', display: 'grid', placeItems: 'center', color: 'rgba(70,54,42,.75)' }}>
        {emoji ? (
          <span aria-hidden="true" style={{ fontSize: size * 0.56, lineHeight: 1, filter: 'drop-shadow(0 1px 1px rgba(70,54,42,.28))' }}>{emoji}</span>
        ) : (
          <div style={{ display: 'flex', gap: size * 0.14 }}>
            <span style={{ width: size * 0.09, height: size * 0.13, background: 'var(--ink)', borderRadius: '50%' }}></span>
            <span style={{ width: size * 0.09, height: size * 0.13, background: 'var(--ink)', borderRadius: '50%' }}></span>
          </div>
        )}
      </div>
      {state === 'thinking' && <span style={{ position: 'absolute', top: -6, right: -10, fontFamily: 'var(--font-hand)', fontSize: 22, color: 'var(--state-thinking)', animation: 'lf-pulse 1.4s infinite' }}>···</span>}
      {state === 'speaking' && <span style={{ position: 'absolute', bottom: -2, right: -8, display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
        {[8, 14, 10].map((h, i) => <span key={i} style={{ width: 3, height: h, background: 'var(--state-speaking)', borderRadius: 2, animation: `lf-pulse ${0.9 + i * 0.2}s infinite` }}></span>)}
      </span>}
    </div>
  );
  if (compact) return avatar;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      {avatar}
      {speech && <div style={{ background: 'var(--paper-bright)', borderRadius: 'var(--radius-lg)', borderTopLeftRadius: 6, padding: 'var(--space-4) var(--space-5)', boxShadow: 'var(--elev-card)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--ink)', maxWidth: 300 }}>
        {speech}
        <div style={{ marginTop: 4, fontFamily: 'var(--font-hand)', fontSize: 17, color: 'var(--ink-soft)' }}>— {name}</div>
      </div>}
    </div>
  );
}
