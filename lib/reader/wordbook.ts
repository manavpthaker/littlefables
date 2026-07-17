'use client';

import type { SaveWordInput, WordbookEntry } from '@/lib/models/wordbook';

// Client-side wordbook helpers. saveWord POSTs to /api/child/wordbook and
// returns the saved entry. Errors bubble up so the caller can decide whether
// to reset the just-saved animation state. PRD C1 (audit C1 fix): failures
// must be surfaced, not silently `console.warn`d.

export async function saveWord(input: SaveWordInput): Promise<WordbookEntry> {
  const res = await fetch('/api/child/wordbook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { entry: WordbookEntry };
  return data.entry;
}
