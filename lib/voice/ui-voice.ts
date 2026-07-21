'use client';

// UI voice — the module that makes the app actually speak. Every buddy
// utterance, checkpoint question, celebration line, and word-save confirmation
// funnels through speakUtterance() here.
//
// Priority (hard, PRD F1 rules-of-use): narration > checkpoint question >
// tap feedback > ambient. transport.ts calls setNarrationActive(bool) when
// playing/stopping. A checkpoint question issued during narration queues
// one-deep and speaks the moment narration ends; tap/ambient speech during
// narration is dropped (late feedback is worse than none). Policy lives in
// ./priority.ts (pure, tested); audio caching in ./utterance-cache.ts.
//
// Fallback chain per utterance:
//   1. In-memory + IndexedDB cache lookup (sha-256 of voiceId|text)
//   2. POST /api/child/tts → play audio, cache
//   3. window.speechSynthesis
//   4. Silent

import { decide, type UtterTier } from './priority';
import { getUtteranceBlob } from './utterance-cache';

export type SpeakPriority = UtterTier;

interface SpeakOpts {
  voiceId?: string | null;
  voice?: 'narrator' | 'buddy';
  /** 'checkpoint' | 'tap' | 'ambient' (default). See module header. */
  priority?: SpeakPriority;
}

let narrationActive = false;
let activeAudio: HTMLAudioElement | null = null;
let activeTier: UtterTier | null = null;
let queuedCheckpoint: { text: string; opts: SpeakOpts } | null = null;

export function setNarrationActive(active: boolean): void {
  narrationActive = active;
  if (active) {
    cancelActive();
    return;
  }
  // Narration just ended — a parked checkpoint question speaks now.
  const queued = queuedCheckpoint;
  queuedCheckpoint = null;
  if (queued) void speakUtterance(queued.text, queued.opts);
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
  activeTier = null;
}

function speakViaSynth(text: string, tier: UtterTier): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 1.0;
    activeTier = tier;
    utt.onend = () => {
      if (activeTier === tier) activeTier = null;
    };
    window.speechSynthesis.speak(utt);
  } catch {
    /* silent — better than crashing */
  }
}

function playBlob(blob: Blob, tier: UtterTier): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    activeAudio = audio;
    activeTier = tier;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (activeAudio === audio) {
        activeAudio = null;
        activeTier = null;
      }
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

// --- Public entry ---
export async function speakUtterance(text: string, opts: SpeakOpts = {}): Promise<void> {
  if (!text.trim()) return;
  const tier: UtterTier = opts.priority ?? 'ambient';

  const decision = decide({ narrationActive, activeTier, incoming: tier });
  if (decision === 'drop') return;
  if (decision === 'queue') {
    // One-deep: the latest question is the one that matters.
    queuedCheckpoint = { text, opts };
    return;
  }

  // 'play' — take the slot from whatever lesser speech held it.
  cancelActive();

  const voiceLabel = opts.voiceId ?? opts.voice ?? 'buddy';
  const blob = await getUtteranceBlob(text, voiceLabel, opts.voiceId);

  // The world may have moved while we fetched: narration may have started
  // (park a checkpoint / drop the rest) or higher-rank speech may hold the slot.
  const recheck = decide({ narrationActive, activeTier, incoming: tier });
  if (recheck === 'queue') {
    queuedCheckpoint = { text, opts };
    return;
  }
  if (recheck === 'drop') return;

  if (blob) {
    await playBlob(blob, tier);
    return;
  }

  // Final fallback: browser TTS. Better than silence.
  speakViaSynth(text, tier);
}
