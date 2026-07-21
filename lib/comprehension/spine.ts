// Retell story-spine matching (redesign brief §IV.2): map a messy 4-year-old
// transcript onto authored story beats. Pure keyword prematch — the semantic
// judge (retell-judge.ts) refines; results merge. Generous by design.

import { stemOf } from '@/lib/reader/state';

const STOPWORDS = new Set([
  'the', 'and', 'was', 'were', 'his', 'her', 'had', 'has', 'have', 'with', 'that', 'this',
  'then', 'they', 'them', 'she', 'him', 'its', 'for', 'but', 'not', 'you', 'all', 'are',
  'when', 'what', 'who', 'how', 'why', 'very', 'into', 'out', 'about', 'their', 'there',
  'said', 'says', 'one', 'little', 'big', 'went', 'got', 'get', 'did', 'own', 'made', 'make',
]);

function contentStems(text: string): string[] {
  return text
    .split(/\s+/)
    .map((w) => stemOf(w))
    .filter((s) => s.length >= 3 && !STOPWORDS.has(s));
}

/** Beat indices hit by the transcript: a beat counts when at least half its
 *  content words (minimum 1) appear in the child's words. */
export function matchBeats(transcript: string, beats: string[]): number[] {
  const spoken = new Set(contentStems(transcript));
  if (spoken.size === 0) return [];
  const hits: number[] = [];
  beats.forEach((beat, i) => {
    const needed = contentStems(beat);
    if (needed.length === 0) return;
    const found = needed.filter((s) => spoken.has(s)).length;
    if (found >= Math.max(1, Math.ceil(needed.length / 2))) hits.push(i);
  });
  return hits;
}

/** Union of hit sets (keyword ∪ judge, or across retell turns), sorted. */
export function mergeHits(...hitSets: number[][]): number[] {
  const merged = new Set<number>();
  for (const hits of hitSets) for (const h of hits) merged.add(h);
  return [...merged].sort((a, b) => a - b);
}
