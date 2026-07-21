import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Persistent kid bottom navigation (Redesign 2026-07-21): Home · Library · a
// quiet Grown-ups door. Rules: ≥64px targets, no numerals, active = marigold
// ring + breath (terracotta stays action-only), per-tab utterance ('tap'
// class), hidden inside the reader (the story is immersive). Bedtime-aware via
// tokens only — no bedtime logic lives here.
export function TabBar({ items, activeKey, onSelect }) {
  return (
    <nav
      aria-label="Main"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
        display: 'flex', justifyContent: 'space-around', alignItems: 'stretch',
        background: 'var(--wash-capsule)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderTop: 'var(--line-weight) solid var(--paper-deep)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        const quiet = Boolean(item.quiet);
        const color = active ? 'var(--ink)' : quiet ? 'var(--ink-faint)' : 'var(--ink-soft)';
        return (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            data-utterance={item.utterance || item.label}
            onClick={() => onSelect && onSelect(item.key)}
            style={{
              flex: 1, minHeight: 'var(--tap-primary, 64px)', border: 'none', background: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 2, padding: 'var(--space-2) var(--space-1)', cursor: 'pointer', color,
              fontFamily: 'var(--font-hand)', fontSize: quiet ? 15 : 17,
            }}
          >
            <span
              style={{
                display: 'grid', placeItems: 'center', width: 44, height: 44, borderRadius: '50%',
                border: `3px solid ${active ? 'var(--marigold)' : 'transparent'}`,
                animation: active ? 'lf-breath var(--dur-breath) var(--ease-drift) infinite' : 'none',
                transition: 'border-color var(--dur-settle) var(--ease-settle)',
              }}
            >
              <Icon name={item.icon} size={quiet ? 22 : 26} />
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
