'use client';

// UI voice — the module that makes the app actually speak. Every buddy
// utterance, checkpoint question, celebration line, and word-save confirmation
// funnels through speakUtterance() here.
//
// Priority rule (hard, PRD F1 rules-of-use): narration > UI speech.
// transport.ts calls setNarrationActive(bool) when playing/stopping; UI
// utterances issued during narration are dropped (a queued-one-deep pattern
// would be fine too — we start with strict drop and can upgrade later).
//
// Fallback chain per utterance:
//   1. In-memory + IndexedDB cache lookup (sha-256 of voiceId|text)
//   2. POST /api/child/tts → play audio, cache
//   3. window.speechSynthesis
//   4. Silent

interface SpeakOpts {
  voiceId?: string | null;
  voice?: 'narrator' | 'buddy';
}

interface CachedUtterance {
  key: string;
  mimeType: string;
  audio: Blob;
}

let narrationActive = false;
let activeAudio: HTMLAudioElement | null = null;

export function setNarrationActive(active: boolean): void {
  narrationActive = active;
  if (active) cancelActive();
}

function cancelActive(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
    } catch {
      /* ignore */
    }
    activeAudio = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
  }
}

// --- Hash helper (SubtleCrypto) ---
async function sha256(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return input;
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// --- In-memory cache ---
const memCache = new Map<string, CachedUtterance>();

// --- IndexedDB (isolated DB — no version dance with azad-read) ---
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

// --- Speech synth fallback ---
function speakViaSynth(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    window.speechSynthesis.speak(utt);
  } catch {
    /* silent — better than crashing */
  }
}

// --- Play blob ---
function playBlob(blob: Blob): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeAudio = audio;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) activeAudio = null;
    };
    audio.onended = () => {
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      resolve();
    };
    audio.play().catch(() => {
      cleanup();
      resolve();
    });
  });
}

// --- Fetch from /api/child/tts ---
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

// --- Public entry ---
export async function speakUtterance(text: string, opts: SpeakOpts = {}): Promise<void> {
  if (!text.trim()) return;
  // UI speech never rides over narration.
  if (narrationActive) return;

  // Cancel any prior UI utterance; one audio at a time.
  cancelActive();

  const voiceLabel = opts.voiceId ?? opts.voice ?? 'buddy';
  const key = await sha256(`${voiceLabel}|${text}`);

  // Cache lookup.
  const fromMem = memCache.get(key);
  if (fromMem) {
    await playBlob(fromMem.audio);
    return;
  }
  const fromIdb = await idbGet(key);
  if (fromIdb) {
    memCache.set(key, fromIdb);
    await playBlob(fromIdb.audio);
    return;
  }

  // Fresh fetch.
  const blob = await fetchFromApi(text, opts.voiceId);
  if (blob) {
    const entry: CachedUtterance = { key, mimeType: blob.type, audio: blob };
    memCache.set(key, entry);
    void idbPut(entry);
    await playBlob(blob);
    return;
  }

  // Final fallback: browser TTS. Better than silence.
  speakViaSynth(text);
}
