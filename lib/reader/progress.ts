'use client';

import type { ProgressInput, ProgressRecord } from '@/lib/models/progress';
import { enqueueAndSend } from '@/lib/sync/outbox';

// Debounced progress writer. Coalesces rapid page turns into one enqueue.
// The sync outbox owns durability — offline writes stay queued and flush on
// reconnect. Phase 2 D2 pattern: any mutation goes through outbox.

const DEBOUNCE_MS = 500;

interface Pending {
  input: ProgressInput;
  timer: ReturnType<typeof setTimeout>;
}
const pendingByBook = new Map<string, Pending>();

export function pushProgress(input: ProgressInput): void {
  const prev = pendingByBook.get(input.bookId);
  if (prev) clearTimeout(prev.timer);
  const timer = setTimeout(() => {
    pendingByBook.delete(input.bookId);
    void enqueueAndSend('/api/child/progress', JSON.stringify(input));
  }, DEBOUNCE_MS);
  pendingByBook.set(input.bookId, { input, timer });
}

export async function fetchProgress(bookId: string): Promise<ProgressRecord | null> {
  const res = await fetch(`/api/child/progress?bookId=${encodeURIComponent(bookId)}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { progress: ProgressRecord | null };
  return data.progress ?? null;
}

export async function fetchAllProgress(): Promise<ProgressRecord[]> {
  const res = await fetch(`/api/child/progress`);
  if (!res.ok) return [];
  const data = (await res.json()) as { progress: ProgressRecord[] };
  return data.progress ?? [];
}
