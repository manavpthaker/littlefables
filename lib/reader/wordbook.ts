'use client';

import type { SaveWordInput, SaveWordResponse } from '@/lib/models/wordbook';
import { enqueueAndSend } from '@/lib/sync/outbox';

// Client-side wordbook helpers. saveWord enqueues through the sync outbox
// (offline-tolerant) and returns the saved entry envelope when the network
// call succeeds. Offline calls return null — the UI has already bloomed
// optimistically, so the save is durable in the outbox for later flush.
// PRD C1 / audit C1 fix: failures never silently drop.

export async function saveWord(input: SaveWordInput): Promise<SaveWordResponse | null> {
  return enqueueAndSend<SaveWordResponse>('/api/child/wordbook', JSON.stringify(input));
}

/** Record a re-encounter with a kept word (PRD B5) — replay taps, re-hears.
 *  Fire-and-forget through the outbox; feeds the spaced scheduler. */
export function trackEncounter(word: string, kind: 'tap' | 'heard' = 'tap'): void {
  void enqueueAndSend('/api/child/wordbook/encounter', JSON.stringify({ word, kind }));
}
