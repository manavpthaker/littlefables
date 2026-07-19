'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [removing, setRemoving] = useState<string | null>(null);

  // Unstar lives HERE, not on the kid surface — his Word Book is additive
  // only; a parent tidies typos and mis-taps.
  async function remove(entryId: string) {
    setRemoving(entryId);
    try {
      const res = await fetch('/api/parent/wordbook', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entryId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setRemoving(null);
    }
  }

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
          <div
            key={w.id}
            style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 'var(--space-2)', alignItems: 'center' }}
          >
            <WordbookEntry
              word={w.word}
              meaning={w.meaning ?? 'a word Azad chose to keep'}
              sentence={w.sentence ?? undefined}
              owned={w.owned}
            />
            <button
              aria-label={`Remove ${w.word} from the wordbook`}
              disabled={removing === w.id}
              onClick={() => void remove(w.id)}
              style={{
                border: 'var(--border-soft)',
                background: 'transparent',
                borderRadius: 'var(--radius-pill)',
                padding: '6px 12px',
                cursor: removing === w.id ? 'wait' : 'pointer',
                color: 'var(--ink-soft)',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
              }}
            >
              {removing === w.id ? 'Removing…' : 'Remove'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
