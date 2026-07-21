import React from 'react';
// Parent surface tabs (mockup-fidelity): a segmented pill control — deep-paper
// track, the active segment lifts as a bright pill. Adult density, no voice slots.
export function ParentTabs({ items, activeKey }) {
  return (
    <nav
      aria-label="Parent sections"
      style={{
        display: 'flex',
        background: 'var(--paper-deep)',
        borderRadius: 'var(--radius-pill)',
        padding: 4,
        gap: 4,
      }}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <a
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '10px 8px',
              borderRadius: 'var(--radius-pill)',
              textDecoration: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-body)',
              fontWeight: 600,
              color: active ? 'var(--text-strong)' : 'var(--text-muted)',
              background: active ? 'var(--paper-bright)' : 'transparent',
              boxShadow: active ? 'var(--elev-rest)' : 'none',
              transition: 'background 160ms ease, color 160ms ease',
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
