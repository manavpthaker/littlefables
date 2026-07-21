import React from 'react';
import { Icon } from '../core/Icon.jsx';
// Persistent kid bottom navigation (Redesign 2026-07-21, mockup-fidelity pass):
// emoji icons over hand-font labels — Home 🏠 · Library 📚 · quiet Grown-ups 🔒.
// Active tab = marigold label + full-strength emoji (terracotta stays
// action-only). Inner row constrained to the phone frame. The bar renders on
// every surface except inside the reader (the story stays immersive).
export function TabBar({ items, activeKey, onSelect }) {
  return (
    <nav
      aria-label="Main"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40,
        background: 'var(--wash-capsule)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderTop: 'var(--line-weight) solid var(--paper-deep)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', justifyContent: 'space-around', alignItems: 'stretch' }}>
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              data-utterance={item.utterance || item.label}
              onClick={() => onSelect && onSelect(item.key)}
              style={{
                flex: 1, minHeight: 64, border: 'none', background: 'none',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 3, padding: '8px 4px', cursor: 'pointer',
                color: active ? 'var(--marigold)' : 'var(--ink-faint)',
                fontFamily: 'var(--font-hand)', fontSize: 16, fontWeight: active ? 600 : 400,
              }}
            >
              {item.emoji ? (
                <span aria-hidden="true" style={{ fontSize: 26, lineHeight: 1, filter: active ? 'none' : 'grayscale(.35) opacity(.75)', transition: 'filter var(--dur-settle) var(--ease-settle)' }}>
                  {item.emoji}
                </span>
              ) : (
                <Icon name={item.icon} size={24} />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
