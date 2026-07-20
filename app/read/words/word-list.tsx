'use client';

import { useRouter } from 'next/navigation';
import { WordCapsule } from '@ds/components/kid/WordCapsule.jsx';
import { Button } from '@ds/components/core/Button.jsx';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Client half of the kid Word Book. Tap a capsule → hear the word (and the
// sentence it came from, when we have it) in the buddy voice. Voice-slot
// rules apply: taps speak, nothing talks over anything (ui-voice priority).

export function WordList({
  words,
}: {
  words: Array<{ id: string; word: string; sentence: string | null }>;
}) {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'var(--surface-page)',
        padding: 'var(--space-6) var(--page-pad) var(--space-8)',
        display: 'grid',
        // Center the (usually small) word set in the viewport instead of
        // clustering it at the top over a large empty void on wide/tall screens.
        alignContent: 'center',
        gap: 'var(--space-5)',
        maxWidth: 720,
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
          {words.length === 0 ? 'Star a word in a story to keep it' : 'Tap a word to hear it again'}
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
          My Words
        </h1>
      </header>

      {words.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
            justifyContent: 'center',
          }}
        >
          {words.map((w) => (
            <WordCapsule
              key={w.id}
              word={w.word}
              onTap={() =>
                void speakUtterance(
                  w.sentence ? `${w.word}. From the story: ${w.sentence}` : w.word,
                  { voice: 'buddy' },
                )
              }
            />
          ))}
        </div>
      )}

      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <Button
          variant="soft"
          size="primary"
          icon="arrow-left"
          utterance="Back to your shelf"
          onClick={() => router.push('/read')}
        >
          Back to my shelf
        </Button>
      </div>
    </main>
  );
}
