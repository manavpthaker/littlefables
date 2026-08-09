import React from 'react';
// Choice-moment evidence for Parent Corner (A11): what was offered, what he chose or said, how the story used it.
export function ChoiceRecord({ where, options = [], chose, saidTranscript, usedAs, when }) {
  return (
    <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink)', background: 'var(--paper-bright)', border: 'var(--border-soft)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--terracotta)', flex: 'none', alignSelf: 'center' }}></span>
        <span style={{ flex: 1, fontSize: 'var(--text-body)', fontWeight: 600 }}>{where}</span>
        {when && <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-soft)' }}>{when}</span>}
      </div>
      <div style={{ margin: '8px 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 'var(--text-body)' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {options.map((o, i) => (
            <span key={i} style={{ fontSize: 'var(--text-caption)', padding: '3px 10px', borderRadius: 'var(--radius-pill)', border: o === chose ? '1.5px solid var(--terracotta)' : 'var(--border-soft)', background: o === chose ? 'var(--terracotta-wash)' : 'transparent', color: 'var(--ink)' }}>{o}</span>
          ))}
        </div>
        {saidTranscript && <div style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>said: &ldquo;{saidTranscript}&rdquo;</div>}
        {usedAs && <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-soft)' }}>used in the story: <b style={{ color: 'var(--ink)' }}>{usedAs}</b></div>}
      </div>
    </div>
  );
}
