'use client';

// Client outbox for offline-tolerant mutations. Backing store: IndexedDB
// `azad-read` v4, store `outbox`. Each entry: { id, endpoint, method,
// bodyJson, createdAt, retryCount, lastError? }.
//
// Flush strategy:
//   - Every enqueue tries an immediate POST. On failure it stays queued.
//   - Background timer flushes every 30s.
//   - `online` event triggers a flush.
//   - 4xx marks item as failed (surfaced via subscribers).
//   - 5xx/network: retry with linear backoff (max 5 attempts, then failed).

export interface OutboxItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  bodyJson: string;
  createdAt: number;
  retryCount: number;
  lastError?: string;
  status: 'pending' | 'failed';
}

const DB_NAME = 'azad-read';
const DB_VERSION = 4;
const STORE = 'outbox';
const MAX_RETRIES = 5;
const FLUSH_INTERVAL_MS = 30_000;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      dbPromise = null;
      return reject(new Error('no indexedDB'));
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      // Preserve prior stores (page-audio) — audio-cache uses v3 store name.
      if (!db.objectStoreNames.contains('page-audio')) db.createObjectStore('page-audio', { keyPath: 'key' });
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => {
      dbPromise = null;
      reject(req.error ?? new Error('idb open failed'));
    };
  });
  return dbPromise;
}

async function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const s = t.objectStore(STORE);
    const req = fn(s);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function all(): Promise<OutboxItem[]> {
  return tx('readonly', (s) => s.getAll() as IDBRequest<OutboxItem[]>);
}

async function put(item: OutboxItem): Promise<void> {
  await tx('readwrite', (s) => s.put(item) as IDBRequest<IDBValidKey>);
}

async function del(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id) as IDBRequest<undefined>);
}

// ---------- Subscribers ----------
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
}

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export interface OutboxSummary {
  pending: number;
  failed: number;
}

export async function summarize(): Promise<OutboxSummary> {
  try {
    const items = await all();
    return {
      pending: items.filter((i) => i.status === 'pending').length,
      failed: items.filter((i) => i.status === 'failed').length,
    };
  } catch {
    return { pending: 0, failed: 0 };
  }
}

// ---------- Public API ----------
function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Enqueue a mutation + try to send it immediately. Returns the parsed
 *  response JSON on immediate success, or null when queued for later. */
export async function enqueueAndSend<T>(
  endpoint: string,
  bodyJson: string,
  method: OutboxItem['method'] = 'POST',
): Promise<T | null> {
  const item: OutboxItem = {
    id: newId(),
    endpoint,
    method,
    bodyJson,
    createdAt: Date.now(),
    retryCount: 0,
    status: 'pending',
  };
  await put(item).catch(() => undefined);
  notify();
  const online = typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  if (!online) return null;
  return trySend<T>(item);
}

async function trySend<T>(item: OutboxItem): Promise<T | null> {
  try {
    const res = await fetch(item.endpoint, {
      method: item.method,
      headers: { 'content-type': 'application/json' },
      body: item.bodyJson,
    });
    if (res.ok) {
      await del(item.id).catch(() => undefined);
      notify();
      return (await res.json().catch(() => null)) as T | null;
    }
    if (res.status >= 400 && res.status < 500) {
      await put({
        ...item,
        status: 'failed',
        retryCount: item.retryCount + 1,
        lastError: `HTTP ${res.status}`,
      });
      notify();
      return null;
    }
    // 5xx — keep pending, count retry.
    await put({ ...item, retryCount: item.retryCount + 1, lastError: `HTTP ${res.status}` });
    notify();
    return null;
  } catch (err) {
    const nextRetry = item.retryCount + 1;
    const status = nextRetry >= MAX_RETRIES ? 'failed' : 'pending';
    await put({
      ...item,
      retryCount: nextRetry,
      status,
      lastError: (err as Error).message,
    });
    notify();
    return null;
  }
}

export async function flushOnce(): Promise<void> {
  let items: OutboxItem[] = [];
  try {
    items = await all();
  } catch {
    return;
  }
  for (const item of items) {
    if (item.status === 'failed') continue;
    await trySend(item);
  }
}

let timerHandle: ReturnType<typeof setInterval> | null = null;

/** Start the background flush loop. Idempotent. Call from a top-level client
 *  bootstrap (e.g. app/read/layout.tsx). */
export function startAutoFlush(): void {
  if (typeof window === 'undefined') return;
  if (timerHandle) return;
  timerHandle = setInterval(() => void flushOnce(), FLUSH_INTERVAL_MS);
  window.addEventListener('online', () => void flushOnce());
  // Fire once on start too, in case we came back online while the tab was hidden.
  void flushOnce();
}
