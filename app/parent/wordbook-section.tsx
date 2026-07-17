'use client';

import { WordbookEntry } from '@ds/components/world/WordbookEntry.jsx';
import { SectionHeader } from '@ds/components/parent/ParentPrimitives.jsx';

export interface ParentWordbookEntry {
  id: string;
  word: string;
  meaning: string | null;
  sentence: string | null;
  owned: boolean;
}

export function WordbookSection({ entries }: { entries: ParentWordbookEntry[] }) {
  if (entries.length === 0) {
    return (
      <section>
        <SectionHeader>Wordbook</SectionHeader>
        <p style={{ color: 'var(--ink-soft)' }}>No words saved yet.</p>
      </section>
    );
  }
  return (
    <section style={{ display: 'grid', gap: 'var(--space-3)' }}>
      <SectionHeader>Wordbook</SectionHeader>
      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        {entries.map((w) => (
          <WordbookEntry
            key={w.id}
            word={w.word}
            meaning={w.meaning ?? 'a word Azad chose to keep'}
            sentence={w.sentence ?? undefined}
            owned={w.owned}
          />
        ))}
      </div>
    </section>
  );
}
