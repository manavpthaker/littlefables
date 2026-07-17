import React from 'react';
// Full checkpoint exchange for Parent Corner (A11 evidence): question, every attempt, mercy outcome, signal recorded.
const typeDot = { recall: 'var(--river)', inference: 'var(--plum)', prediction: 'var(--marigold)', connection: 'var(--sage)' };
const judgeChip = {
  correct: ['var(--sage)', 'got it'],
  accepted: ['var(--butter)', 'accepted with hint'],
  miss: ['var(--bark)', 'miss — hint given'],
};
export function CheckpointTranscript({ type = 'recall', question, attempts = [], outcome, signal, when }) {
  return (
    <div style={{ fontFamily: 'var(--font-ui)', color: 'var(--ink)', background: 'var(--paper-bright)', border: 'var(--border-soft)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: typeDot[type], flex: 'none', alignSelf: 'center' }}></span>
        <span style={{ flex: 1, fontSize: 'var(--text-body)', fontWeight: 600 }}>{question}</span>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', textTransform: 'capitalize' }}>{type}{when ? ` · ${when}` : ''}</span>
      </div>
      <div style={{ margin: '8px 0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {attempts.map((a, i) => {
          const [c, label] = judgeChip[a.judged] || judgeChip.miss;
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
              <span style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', flex: 'none' }}>attempt {i + 1}</span>
              <span style={{ flex: 1, fontSize: 'var(--text-body)', fontStyle: 'italic', color: 'var(--ink-soft)' }}>&ldquo;{a.transcript}&rdquo;</span>
              <span style={{ fontSize: 'var(--text-caption)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c }}></span>{label}
              </span>
            </div>
          );
        })}
      </div>
      {(outcome || signal) && <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(70,54,42,.1)', fontSize: 'var(--text-caption)', color: 'var(--ink-soft)' }}>
        {outcome && <span>{outcome}</span>}{outcome && signal && ' · '}{signal && <span>signal recorded: <b style={{ color: 'var(--ink)' }}>{signal}</b></span>}
      </div>}
    </div>
  );
}
