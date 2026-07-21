'use client';

import { ChapterMap } from '@ds/components/reader/ChapterMap.jsx';

// Chapter-book entry: title + picture chapter map. Extracted from reader.tsx
// (composition only) to keep the orchestrator under the ~400-line ceiling.

export function MapSection({
  title,
  chapters,
  onPick,
}: {
  title: string;
  chapters: Array<{ title: string; tint?: string }>;
  onPick: (i: number) => void;
}) {
  return (
    <section
      style={{
        padding: 'var(--space-7) var(--page-pad) var(--space-6)',
        display: 'grid',
        gap: 'var(--space-5)',
        maxWidth: 720,
        width: '100%',
        marginInline: 'auto',
      }}
    >
      <header style={{ display: 'grid', gap: 'var(--space-2)', justifyItems: 'center', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-hand)',
            color: 'var(--text-muted)',
            margin: 0,
            fontSize: 'var(--text-hand)',
          }}
        >
          Pick a chapter to start
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            margin: 0,
            fontSize: 'var(--text-display)',
            lineHeight: 'var(--lh-display)',
            color: 'var(--text-strong)',
          }}
        >
          {title}
        </h1>
      </header>
      <ChapterMap size="large" chapters={chapters} current={0} onPick={onPick} />
    </section>
  );
}
