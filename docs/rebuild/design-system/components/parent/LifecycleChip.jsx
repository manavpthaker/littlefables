import React from 'react';
// Parent lifecycle chip: Draft → Checking → Published → Needs review / Blocked. Truth, not reassurance.
const map = {
  draft: { c: 'var(--life-draft)', label: 'Draft' },
  checking: { c: 'var(--life-checking)', label: 'Checking', anim: 'lf-pulse 1.4s infinite' },
  published: { c: 'var(--life-published)', label: 'Published' },
  review: { c: 'var(--life-review)', label: 'Needs review' },
  blocked: { c: 'var(--life-blocked)', label: 'Blocked' },
  unverified: { c: 'var(--ink-faint)', label: 'Unverified' },
};
export function LifecycleChip({ status = 'draft', detail }) {
  const s = map[status] || map.draft;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-ui)', fontSize: 'var(--text-label)', fontWeight: 600, color: 'var(--ink)', background: 'var(--paper-bright)', border: `1.5px solid ${s.c}`, borderRadius: 'var(--radius-pill)', padding: '3px 10px 3px 7px' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.c, animation: s.anim || 'none', flex: 'none' }}></span>
      {s.label}{detail && <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>· {detail}</span>}
    </span>
  );
}
