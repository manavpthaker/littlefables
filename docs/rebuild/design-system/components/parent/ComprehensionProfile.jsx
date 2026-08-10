import React from 'react';
// Comprehension profile: plain-language strengths + per-type bars + transcript rows. Evidence, not scores.
const TYPES = [['recall', 'var(--river)'], ['inference', 'var(--plum)'], ['prediction', 'var(--marigold)'], ['connection', 'var(--sage)']];
export function ComprehensionProfile({ summary, levels = {}, transcripts = [] }) {
  return (
    <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink)' }}>
      {summary && <p style={{ fontSize: 'var(--text-body)', margin: '0 0 12px', fontWeight: 500 }}>{summary}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
        {TYPES.map(([t, c]) => (
          <div key={t}>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', marginBottom: 3, textTransform: 'capitalize' }}>{t}</div>
            <div style={{ height: 8, background: 'var(--paper-deep)', borderRadius: 4 }}>
              <div style={{ width: `${(levels[t] ?? 0) * 100}%`, height: '100%', background: c, borderRadius: 4 }}></div>
            </div>
          </div>
        ))}
      </div>
      {transcripts.map((tr, i) => (
        <details key={i} style={{ borderTop: '1px solid rgba(70,54,42,.1)', padding: '8px 0' }}>
          <summary style={{ cursor: 'pointer', fontSize: 'var(--text-body)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: (TYPES.find(x => x[0] === tr.type) || [])[1], flex: 'none' }}></span>
            <span style={{ flex: 1 }}>{tr.q}</span>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-soft)' }}>{tr.when}</span>
          </summary>
          <div style={{ fontSize: 'var(--text-body)', color: 'var(--ink-soft)', padding: '6px 0 2px 16px', fontStyle: 'italic' }}>&ldquo;{tr.a}&rdquo;</div>
        </details>
      ))}
    </div>
  );
}
