import React from 'react';
const COLORS={draft:'var(--lc-draft)',checking:'var(--lc-checking)',published:'var(--lc-published)',needsReview:'var(--lc-needs-review)',blocked:'var(--lc-blocked)'};
const LABELS={draft:'draft',checking:'checking',published:'published',needsReview:'needs review',blocked:'blocked'};
export function LifecycleChip({ state='draft', label }) {
  return <span className="lf-lcchip"><i style={{background:COLORS[state]}}></i>{label||LABELS[state]}</span>;
}
