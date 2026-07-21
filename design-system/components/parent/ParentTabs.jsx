import React from 'react';
// Parent surface tabs (Redesign 2026-07-21): Insights · Stories · Settings.
// Adult density: plain links, numerals allowed, no voice slots. Active tab =
// ink text + terracotta underline (navigation is an action here).
export function ParentTabs({ items, activeKey }) {
  return (
    <nav
      aria-label="Parent sections"
      style={{ display: 'flex', gap: 'var(--space-5)', borderBottom: '1px solid rgba(70,54,42,.12)' }}
    >
      {items.map((item) => {
        const active = item.key === activeKey;
        return (
          <a
            key={item.key}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              padding: '10px 2px 12px',
              textDecoration: 'none',
              fontFamily: 'var(--font-ui)',
              fontSize: 'var(--text-body)',
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--text-strong)' : 'var(--text-muted)',
              borderBottom: active ? '3px solid var(--action)' : '3px solid transparent',
              marginBottom: -1,
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
