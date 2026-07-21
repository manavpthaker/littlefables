import type { VocabEntry } from '@/lib/models/book';

// Collectable-word speech (redesign brief, extends PRD A9): when a word is
// authored in the book's vocab, tapping/saving it teaches — word, syllables,
// kid-language definition — instead of just echoing. Pure string composition;
// the caller speaks the result through ui-voice.

function syllableLine(word: string, entry?: VocabEntry | null): string | null {
  if (!entry?.syllables || entry.syllables.length < 2) return null;
  return entry.syllables.join(' — ');
}

function definitionLine(entry?: VocabEntry | null): string | null {
  const def = entry?.kidDefinition ?? entry?.meaning;
  return def ? def.trim().replace(/\.?$/, '.') : null;
}

/** Word replay (wordbook, "say again"): word, syllables, kid definition. */
export function composeWordUtterance(word: string, entry?: VocabEntry | null): string {
  const parts = [`${word}.`];
  const syl = syllableLine(word, entry);
  if (syl) parts.push(`${syl}.`);
  const def = definitionLine(entry);
  if (def) parts.push(def);
  return parts.join(' ');
}

/** Star-save confirmation: teach, then confirm the keep. */
export function composeSaveUtterance(word: string, entry?: VocabEntry | null): string {
  const syl = syllableLine(word, entry);
  const def = definitionLine(entry);
  const parts = [`${word}!`];
  if (syl) parts.push(`${syl}.`);
  if (def) parts.push(def);
  parts.push(`${word} is in your word book!`);
  return parts.join(' ');
}
