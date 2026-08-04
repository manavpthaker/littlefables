'use client';

import { SectionHeader } from '@ds/components/parent/SectionHeader.jsx';
import { SendToDeviceButton } from './send-to-device';
import { AddChildForm } from './add-child-form';

export interface ChildRow {
  id: string;
  displayName: string;
  band: string;
}

export function ChildrenSection({ rows, householdName }: { rows: ChildRow[]; householdName: string }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <SectionHeader label={householdName} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
        {rows.map((c) => (
          <article
            key={c.id}
            style={{
              background: 'var(--paper-warm)',
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-rest)',
              display: 'grid',
              gap: 'var(--space-3)',
            }}
          >
            <header>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-title-size)', color: 'var(--ink)' }}>
                {c.displayName}
              </div>
              <div style={{ color: 'var(--ink-soft)', fontSize: 'var(--text-caption-size)' }}>
                Reading band {c.band}
              </div>
            </header>
            <SendToDeviceButton childId={c.id} childName={c.displayName} />
          </article>
        ))}
      </div>
      <AddChildForm />
    </section>
  );
}
