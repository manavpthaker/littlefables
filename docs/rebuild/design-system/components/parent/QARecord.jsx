import React from 'react';
import { Icon } from '../core/Icon.jsx';
// QA record display: the real gate outcomes, evidence-forward.
export function QARecord({ stages }) {
  const mark = { pass: ['check', 'var(--sage)'], fail: ['x', 'var(--berry)'], skip: ['minus', 'var(--ink-faint)'], unverified: ['circle-help', 'var(--ink-faint)'] };
  return (
    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-body)', color: 'var(--ink)', background: 'var(--paper-bright)', borderRadius: 'var(--radius-md)', border: 'var(--border-soft)', overflow: 'hidden' }}>
      {stages.map((st, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderTop: i ? '1px solid rgba(70,54,42,.1)' : 'none' }}>
          <Icon name={mark[st.result][0]} size={16} color={mark[st.result][1]} style={{ marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{st.name}</div>
            {st.detail && <div style={{ color: 'var(--ink-soft)', fontSize: 'var(--text-caption)' }}>{st.detail}</div>}
            {st.violations && st.violations.map((v, j) => (
              <div key={j} style={{ marginTop: 4, background: 'var(--berry-wash)', borderRadius: 6, padding: '4px 8px', fontSize: 'var(--text-caption)' }}>{v}</div>
            ))}
          </div>
          {st.score != null && <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{st.score}</span>}
        </div>
      ))}
    </div>
  );
}
