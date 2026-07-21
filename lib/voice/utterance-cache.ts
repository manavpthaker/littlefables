'use client';

// Utterance audio plumbing extracted from ui-voice.ts (Redesign 2026-07-21):
// cache lookup (memory → IndexedDB) → /api/child/tts fetch → store. Playback
// and priority policy stay in ui-voice.ts; this module only produces blobs.

interface CachedUtterance {
  key: string;
  mimeType: string;
  audio: Blob;
}

async function sha256(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return input;
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const memCache = new Map<string, CachedUtterance>();

// Isolated DB — no version dance with azad-read.
const DB_NAME = 'azad-utterances';
const DB_VERSION = 1;
const STORE = 'ui-utterances';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'key' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error('idb open failed'));
  });
}

async function idbGet(key: string): Promise<CachedUtterance | null> {
  try {
    const db = await openDb();
    return await new Promise<CachedUtterance | null>((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve((req.result as CachedUtterance | undefined) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbPut(entry: CachedUtterance): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).put(entry);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    /* ignore — utterance cache is best-effort */
  }
}

async function fetchFromApi(text: string, voiceId?: string | null): Promise<Blob | null> {
  try {
    const body: { text: string; voiceId?: string; voice?: 'narrator' | 'buddy' } = { text };
    if (voiceId) body.voiceId = voiceId;
    else body.voice = 'buddy';
    const res = await fetch('/api/child/tts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { audioBase64: string; mimeType?: string };
    if (!data.audioBase64) return null;
    const bytes = Uint8Array.from(atob(data.audioBase64), (c) => c.charCodeAt(0));
    return new Blob([bytes], { type: data.mimeType ?? 'audio/mpeg' });
  } catch {
    return null;
  }
}

/** Cache → API. Null means every audio layer failed (caller falls back to synth). */
export async function getUtteranceBlob(text: string, voiceLabel: string, voiceId?: string | null): Promise<Blob | null> {
  const key = await sha256(`${voiceLabel}|${text}`);

  const fromMem = memCache.get(key);
  if (fromMem) return fromMem.audio;

  const fromIdb = await idbGet(key);
  if (fromIdb) {
    memCache.set(key, fromIdb);
    return fromIdb.audio;
  }

  const blob = await fetchFromApi(text, voiceId);
  if (blob) {
    const entry: CachedUtterance = { key, mimeType: blob.type, audio: blob };
    memCache.set(key, entry);
    void idbPut(entry);
    return blob;
  }
  return null;
}
