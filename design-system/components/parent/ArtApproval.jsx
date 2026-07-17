import React from 'react';
import { Icon } from '../core/Icon.jsx';
import { Button } from '../core/Button.jsx';
// Art approval queue row: candidate vs approved side-by-side. Approve/reject are authenticated parent actions.
export function ArtApproval({ pageLabel, candidate, approved, onApprove, onReject }) {
  const frame = (src, label, empty) => (
    <figure style={{ margin: 0, flex: 1 }}>
      <div style={{
        aspectRatio: '3/4', borderRadius: 'var(--radius-md)', overflow: 'hidden',
        background: src ? `url(${src}) center/cover` : empty ? 'var(--paper-deep)' : 'radial-gradient(80% 90% at 30% 20%,#8fb0c9,transparent 70%),radial-gradient(70% 80% at 80% 70%,#c9a06a,transparent 70%),#a8b89a',
        display: 'grid', placeItems: 'center', color: 'var(--ink-faint)', boxShadow: 'var(--elev-rest)',
      }}>{empty && <Icon name="image" size={28} color="var(--ink-faint)" />}</div>
      <figcaption style={{ fontFamily: 'var(--font-ui)', fontSize: 'var(--text-caption)', color: 'var(--ink-soft)', marginTop: 4 }}>{label}</figcaption>
    </figure>
  );
  return (
    <div style={{ background: 'var(--paper-bright)', border: 'var(--border-soft)', borderRadius: 'var(--radius-lg)', padding: 14, maxWidth: 420, fontFamily: 'var(--font-ui)' }}>
      <div style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{pageLabel}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        {frame(candidate, 'Candidate (private)')}
        {frame(approved, approved ? 'Approved (live)' : 'Nothing approved yet', !approved)}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button variant="primary" icon="check" onClick={onApprove}>Approve</Button>
        <Button variant="ghost" icon="rotate-ccw" onClick={onReject}>Reject &amp; repaint</Button>
      </div>
    </div>
  );
}
