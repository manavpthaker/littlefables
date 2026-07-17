'use client';

import type { SaveWordInput, SaveWordResponse } from '@/lib/models/wordbook';

// Client-side wordbook helpers. saveWord POSTs to /api/child/wordbook and
// returns the saved entry + any newly-earned badges (for CelebrationQueue).
// Errors bubble up so the caller can decide whether to reset the just-saved
// animation state. PRD C1 (audit C1 fix): failures must be surfaced, not
// silently `console.warn`d.

export async function saveWord(input: SaveWordInput): Promise<SaveWordResponse> {
  const res = await fetch('/api/child/wordbook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return (await res.json()) as SaveWordResponse;
}
