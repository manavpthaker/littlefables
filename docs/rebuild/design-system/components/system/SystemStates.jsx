import React from 'react';
import { Icon } from '../core/Icon.jsx';
// System-state banners. Kid variant is warm & pictorial; parent variant is informative.
const states = {
  offline: { color: 'var(--state-offline)', icon: 'cloud-off', kid: 'No internet right now — your books are still here!', parent: 'Offline — changes queued, will sync when back.' },
  syncing: { color: 'var(--state-syncing)', icon: 'refresh-cw', kid: 'Your new pages are flying home!', parent: 'Syncing…', anim: 'lf-pulse 2.6s infinite' },
  synced: { color: 'var(--state-syncing)', icon: 'check', kid: null, parent: 'All changes synced' },
  syncfail: { color: 'var(--life-review)', icon: 'triangle-alert', kid: null, parent: 'Sync failed — 3 changes queued, retrying.' },
};
export function StateBanner({ state = 'offline', density = 'kid', message }) {
  const s = states[state] || states.offline;
  const text = message || (density === 'kid' ? s.kid : s.parent) || s.parent;
  if (density === 'kid' && (state === 'syncing' || state === 'synced')) {
    // quiet kid syncing: wash capsule + sage pulse dot; utterance spoken ONCE, dropped if narration/question active
    return (
      <span data-utterance={text} aria-label={text} role="status" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--wash-capsule)', backdropFilter: 'blur(14px)', borderRadius: 'var(--radius-pill)', padding: '9px 14px', boxShadow: 'var(--elev-rest)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--state-syncing)', animation: state === 'syncing' ? 'lf-pulse 2.6s infinite' : 'none' }}></span>
      </span>
    );
  }
  if (density === 'kid') {
    return (
      <div data-utterance={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-3)', background: 'var(--bark-wash)', border: `2px solid ${s.color}`, borderRadius: 'var(--radius-pill)', padding: '10px 18px', fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--ink)', boxShadow: 'var(--elev-rest)' }}>
        <span style={{ width: 34, height: 34, borderRadius: '50%', background: s.color, display: 'grid', placeItems: 'center', animation: s.anim || 'none' }}><Icon name={s.icon} size={18} color="#FBF4E6" /></span>
        {text}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', padding: '6px 10px', background: 'var(--paper-deep)', borderRadius: 'var(--radius-sm)' }}>
      <span style={{ animation: s.anim || 'none', display: 'inline-flex' }}><Icon name={s.icon} size={14} color={s.color} /></span>{text}
    </div>
  );
}
// "Painting this page…" loading state — the marigold shimmer, never a spinner on kid surfaces.
export function PaintingWash({ label = 'painting this page…', height = 160, fullBleed = false }) {
  // fullBleed: a page mid-generation — edge-to-edge, no radius; when art arrives, the incoming image
  // animates with var(--motion-develop) over this wash (handoff: wash stays until develop completes).
  return (
    <div data-utterance={label} style={{ height: fullBleed ? '100%' : height, minHeight: fullBleed ? '100%' : undefined, borderRadius: fullBleed ? 0 : 'var(--radius-lg)', display: 'grid', placeItems: 'center', background: 'linear-gradient(90deg,var(--marigold-wash),var(--butter-wash),var(--marigold-wash))', backgroundSize: '200% 100%', animation: 'var(--motion-paint)', color: 'var(--bark)' }}>
      <div style={{ textAlign: 'center' }}>
        <Icon name="brush" size={34} />
        <div style={{ fontFamily: 'var(--font-hand)', fontSize: 22, marginTop: 6 }}>{label}</div>
      </div>
    </div>
  );
}
// Warm error character — never a dialog, always a way onward.
export function ErrorCharacter({ message = "The story kitchen is resting. Let's read one from the shelf!", action }) {
  return (
    <div data-utterance={message} style={{ textAlign: 'center', maxWidth: 320, margin: '0 auto', fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <div style={{ width: 96, height: 96, margin: '0 auto var(--space-4)', borderRadius: '46% 54% 52% 48% / 52% 46% 54% 48%', background: 'radial-gradient(70% 70% at 35% 30%, color-mix(in oklch, var(--bark) 45%, white), var(--bark))', boxShadow: 'var(--elev-card)', display: 'grid', placeItems: 'center', animation: 'lf-breath var(--dur-breath) var(--ease-drift) infinite' }}>
        <span style={{ display: 'flex', gap: 12 }}>
          <span style={{ width: 8, height: 5, borderBottom: '3px solid var(--ink)', borderRadius: '0 0 8px 8px' }}></span>
          <span style={{ width: 8, height: 5, borderBottom: '3px solid var(--ink)', borderRadius: '0 0 8px 8px' }}></span>
        </span>
      </div>
      <p style={{ fontSize: 20, lineHeight: 1.45, margin: '0 0 var(--space-5)' }}>{message}</p>
      {action}
    </div>
  );
}

export const SystemStates = { StateBanner, PaintingWash, ErrorCharacter };
