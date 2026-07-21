'use client';

import { useRouter } from 'next/navigation';
import { WordJar } from '@ds/components/kid/WordJar.jsx';
import { speakUtterance } from '@/lib/voice/ui-voice';

// Home word jar (redesign brief §III.1) — replaces the old WordsDoor pill.
// Shows the freshest kept words; tap → the Word Book. Count is spoken, never
// shown as a numeral (DS rules-of-use).

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

function spokenCount(count: number): string {
  if (count <= 0) return 'Your word jar!';
  if (count === 1) return 'One word in your jar!';
  const n = NUMBER_WORDS[count] ?? 'so many';
  return `${n.charAt(0).toUpperCase()}${n.slice(1)} words in your jar!`;
}

export function HomeWordJar({
  words,
  count,
}: {
  words: Array<{ word: string; owned?: boolean }>;
  count: number;
}) {
  const router = useRouter();
  const utterance = spokenCount(count);
  return (
    <WordJar
      words={words}
      count={count}
      utterance={utterance}
      onOpen={() => {
        void speakUtterance(utterance, { voice: 'buddy', priority: 'tap' });
        router.push('/read/words');
      }}
    />
  );
}
