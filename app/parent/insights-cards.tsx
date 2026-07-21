import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';
import type { StoryLayer } from '@/lib/parent/insights';

// "This week's story layers" + "Say this tomorrow" (brief §III.5) — the
// multiplier surface: what the stories were quietly working on, and the exact
// line that bridges a story moment into real life.

export function InsightsCards({
  bridgeLine,
  layers,
}: {
  bridgeLine: string | null;
  layers: StoryLayer[] | null;
}) {
  if (!bridgeLine && !layers?.length) return null;
  return (
    <section style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {layers && layers.length > 0 && (
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            boxShadow: 'var(--elev-rest)',
            display: 'grid',
            gap: 'var(--space-2)',
          }}
        >
          <SectionHeader>This week&rsquo;s story layers</SectionHeader>
          {layers.map((l) => (
            <p key={l.title} style={{ margin: 0, fontSize: 'var(--text-body)', color: 'var(--text-body)' }}>
              <strong>{l.title}</strong> quietly worked on <strong>{l.teaches}</strong>. {l.note}
            </p>
          ))}
        </div>
      )}
      {bridgeLine && (
        <div
          style={{
            background: 'var(--teal-wash)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-4)',
            display: 'grid',
            gap: 'var(--space-1)',
          }}
        >
          <SectionHeader>Say this tomorrow</SectionHeader>
          <p style={{ margin: 0, fontSize: 'var(--text-body)', color: 'var(--text-strong)', fontStyle: 'italic' }}>
            &ldquo;{bridgeLine}&rdquo;
          </p>
        </div>
      )}
    </section>
  );
}
