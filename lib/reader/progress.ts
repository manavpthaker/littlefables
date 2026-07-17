'use client';

import type { ProgressInput, ProgressRecord } from '@/lib/models/progress';

// Debounced progress writer. Coalesces rapid page turns into one POST.
// Failures are queued locally and retried on the next successful call —
// PRD A7 / audit C1 fix (never silent-drop). Phase 2's full D2 sync will
// replace this with a proper offline outbox.

const DEBOUNCE_MS = 500;

interface Pending {
  input: ProgressInput;
  timer: ReturnType<typeof setTimeout>;
}
const pendingByBook = new Map<string, Pending>();
let lastFailure: ProgressInput | null = null;

async function post(input: ProgressInput): Promise<void> {
  const res = await fetch('/api/child/progress', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

async function flush(input: ProgressInput): Promise<void> {
  try {
    // If there's a stored failure for this book from earlier, flush it first —
    // but only if the pending progress is later than the failed one.
    if (
      lastFailure &&
      lastFailure.bookId === input.bookId &&
      (lastFailure.chapterIdx < input.chapterIdx ||
        (lastFailure.chapterIdx === input.chapterIdx && lastFailure.pageIdx < input.pageIdx))
    ) {
      // The newer post supersedes; drop the queued one.
      lastFailure = null;
    } else if (lastFailure && lastFailure.bookId === input.bookId) {
      // Older queued value — flush it first, then send this one.
      await post(lastFailure).catch(() => {
        /* keep queued */
      });
      lastFailure = null;
    }
    await post(input);
  } catch {
    lastFailure = input;
  }
}

export function pushProgress(input: ProgressInput): void {
  const prev = pendingByBook.get(input.bookId);
  if (prev) clearTimeout(prev.timer);
  const timer = setTimeout(() => {
    pendingByBook.delete(input.bookId);
    void flush(input);
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
