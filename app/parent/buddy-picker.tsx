'use client';

import { useState } from 'react';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';
import { BUDDY_ROSTER } from '@/lib/world/buddy-roster';

export function BuddyPicker({ currentBuddyId }: { currentBuddyId: string }) {
  const [active, setActive] = useState(currentBuddyId);
  const [pending, setPending] = useState<string | null>(null);

  async function pick(id: string) {
    if (id === active) return;
    setPending(id);
    try {
      const res = await fetch('/api/child/buddy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ buddyId: id }),
      });
      if (res.ok) setActive(id);
    } finally {
      setPending(null);
    }
  }

  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <SectionHeader>Buddy</SectionHeader>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-2)' }}>
        {BUDDY_ROSTER.map((b) => (
          <button
            key={b.id}
            onClick={() => pick(b.id)}
            disabled={pending === b.id}
            aria-pressed={active === b.id}
            style={{
              padding: 'var(--space-3)',
              background: active === b.id ? 'var(--wash-panel)' : 'var(--paper)',
              border: `2px solid ${active === b.id ? b.pigment : 'var(--ink-faint)'}`,
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              gap: 'var(--space-1)',
              fontFamily: 'inherit',
            }}
          >
            <div style={{ fontSize: 28 }}>{b.emoji}</div>
            <div style={{ fontFamily: 'var(--font-display)' }}>{b.name}</div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 12 }}>{b.species}</div>
          </button>
        ))}
      </div>
    </section>
  );
}
