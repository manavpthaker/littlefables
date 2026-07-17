'use client';

import { SunsRow } from '@ds/components/world/SunsRow.jsx';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';

export function SunsParent({ earned, today }: { earned: number[]; today: number }) {
  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <SectionHeader>Reading days</SectionHeader>
      <SunsRow earned={earned} today={today} />
    </section>
  );
}
