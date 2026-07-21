import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Mic & voice input orb — the same state language everywhere the app listens.
const cfg = {
  idle: { bg: 'var(--paper-bright)', fg: 'var(--river)', anim: 'none', label: null },
  listening: { bg: 'var(--river)', fg: '#FBF4E6', anim: 'lf-listening var(--dur-breath) var(--ease-drift) infinite', label: "I'm listening…" },
  processing: { bg: 'var(--dusk)', fg: '#FBF4E6', anim: 'lf-pulse 1.4s infinite', label: 'Hmm…' },
  heard: { bg: 'var(--sage)', fg: '#FBF4E6', anim: 'lf-bloom var(--dur-bloom) var(--ease-settle) 1', label: 'I heard you!' },
};
// Timing contract (state machine):
// listening: max 10s open; silent-timeout 6s -> returns to idle + gentle utterance ("We can try again whenever you like").
// processing: expected <=3s; longer LLM work hands off to the buddy's thinking state, orb returns to idle.
// during Checkpoint mercy='hint': micState is IDLE, re-armed — pass the official nudge slot ("tap the little mic to try again").
export function MicOrb({ state = 'idle', size = 64, onTap, utterance, echo, transcript, nudge }) {
  const c = cfg[state] || cfg.idle;
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-2)' }}>
      <span style={{ position: 'relative', display: 'inline-grid', placeItems: 'center' }}>
        {state === 'listening' && [0, 1].map((r) => (
          <span key={r} aria-hidden="true" style={{
            position: 'absolute', width: size, height: size, borderRadius: '50%',
            border: '3px solid var(--river)', pointerEvents: 'none',
            animation: `lf-ripple 1.6s ${r * 0.8}s var(--ease-drift) infinite`,
          }}></span>
        ))}
      <button data-utterance={utterance || c.label} onClick={onTap} aria-label={c.label || 'Talk to me'} style={{
        width: size, height: size, borderRadius: '50%', border: state === 'idle' ? '2px solid var(--river)' : 'none',
        background: state === 'idle' ? 'var(--paper-bright)' : c.bg, color: c.fg, display: 'grid', placeItems: 'center', cursor: 'pointer',
        boxShadow: 'var(--elev-card)', animation: c.anim, transition: 'background var(--dur-settle) var(--ease-settle)',
      }}>
        <Icon name={state === 'heard' ? 'check' : 'mic'} size={size * 0.44} color={state === 'idle' ? 'var(--river)' : c.fg} />
      </button>
      </span>
      {c.label && !(state === 'heard' && echo) && <span style={{ fontFamily: 'var(--font-hand)', fontSize: 19, color: 'var(--ink-soft)' }}>{c.label}</span>}
      {state === 'idle' && nudge && <span data-utterance={nudge} style={{ fontFamily: 'var(--font-hand)', fontSize: 19, color: 'var(--ink-soft)' }}>{nudge}</span>}
      {state === 'heard' && echo && (
        <div data-utterance={echo} style={{ background: 'var(--paper-bright)', borderRadius: 'var(--radius-lg)', borderTopLeftRadius: 6, padding: 'var(--space-3) var(--space-4)', boxShadow: 'var(--elev-card)', maxWidth: 280, textAlign: 'left' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 19, color: 'var(--ink)' }}>{echo}</span>
          {transcript && <div style={{ fontFamily: 'var(--font-ui)', fontStyle: 'italic', fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>&ldquo;{transcript}&rdquo;</div>}
        </div>
      )}
    </div>
  );
}
