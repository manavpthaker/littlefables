'use client';

// Speech layer for the reader. Phase 1a: device speechSynthesis only —
// word-boundary approximation via SpeechSynthesisEvent.charIndex. Phase 1b
// (Slice 5) adds ElevenLabs pre-generated audio + IndexedDB cache under a
// TtsSource interface that speak() below can consume.
//
// The interface here matches what the ported useReaderTransport expects
// (SpeakHandle with .cancel(); onWord / onEnd / onBlocked callbacks).

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface TtsFetchResult {
  audio: Blob;
  mimeType: string;
  timestamps: WordTimestamp[];
}

export interface TtsSource {
  fetch(text: string, opts?: { voice?: 'narrator' | 'buddy' }): Promise<TtsFetchResult>;
}

export interface SpeakOptions {
  source?: TtsSource;
  allowSpeechSynthFallback?: boolean;
  continuous?: boolean;
  startOffset?: number;
  /** Playback rate multiplier (bedtime ≈ 0.9). Word timestamps stay aligned —
   *  the highlight tick reads audio.currentTime, which is media time. */
  rate?: number;
  /** 0..1 output volume (bedtime ≈ 0.85). */
  volume?: number;
  onWord?: (wordIdx: number) => void;
  onEnd?: () => void;
  onBlocked?: () => void;
}

export interface SpeakHandle {
  cancel(): void;
}

// ---------- Public entry point ----------

export function speak(text: string, opts: SpeakOptions = {}): SpeakHandle {
  let cancelled = false;
  const handle: SpeakHandle = {
    cancel() {
      cancelled = true;
      cancelSpeechSynth();
    },
  };

  const run = async () => {
    if (opts.source) {
      try {
        const result = await opts.source.fetch(text);
        if (cancelled) return;
        return playAudio(result, opts, () => cancelled);
      } catch {
        // Fall through to speechSynth.
      }
    }
    if (cancelled) return;
    if (opts.allowSpeechSynthFallback !== false) {
      speakViaSpeechSynth(text, opts, () => cancelled);
    } else {
      opts.onEnd?.();
    }
  };
  void run();
  return handle;
}

// ---------- Layer 1: pre-generated audio playback ----------
//
// Mobile-Safari trap: iOS only lets an <audio> element auto-play if that
// SPECIFIC element was directly touched by a user gesture. A fresh
// `new Audio()` created inside a page-turn timeout is a different element
// than the one the user tapped — iOS blocks its .play() call, transport
// sees onBlocked, and playback silently pauses at every chapter/page break.
//
// The standard workaround is a persistent audio element: create ONE
// <audio> lazily, unlock it on the first user-gesture play, then swap
// its `src` for each subsequent page. iOS remembers the unlock across
// src changes on the same element.

let sharedAudioEl: HTMLAudioElement | null = null;
let activeAudioUrl: string | null = null;
let activeTickRaf: number | null = null;

function getSharedAudio(): HTMLAudioElement {
  if (sharedAudioEl) return sharedAudioEl;
  const el = new Audio();
  // Playing inline (not fullscreen) matters on iOS Safari.
  el.setAttribute('playsinline', '');
  el.preload = 'auto';
  sharedAudioEl = el;
  return el;
}

function releaseAudioUrl(): void {
  if (activeAudioUrl) {
    try {
      URL.revokeObjectURL(activeAudioUrl);
    } catch {
      /* ignore */
    }
    activeAudioUrl = null;
  }
}

function playAudio(
  result: TtsFetchResult,
  opts: SpeakOptions,
  isCancelled: () => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    const audio = getSharedAudio();

    // Detach any prior listeners so the previous page's callbacks don't
    // fire again on the shared element after we swap src.
    audio.onended = null;
    audio.onerror = null;

    releaseAudioUrl();
    const url = URL.createObjectURL(result.audio);
    activeAudioUrl = url;
    audio.src = url;

    if (opts.rate && opts.rate > 0) audio.playbackRate = opts.rate;
    else audio.playbackRate = 1;
    if (typeof opts.volume === 'number') audio.volume = Math.min(1, Math.max(0, opts.volume));
    else audio.volume = 1;
    // Reset before applying startOffset — otherwise a page turn could
    // inherit the previous page's currentTime for a frame.
    try {
      audio.currentTime = opts.startOffset && opts.startOffset > 0 ? opts.startOffset : 0;
    } catch {
      /* Some browsers throw if currentTime is set before the metadata loads;
         it'll re-apply on canplay. */
    }

    const ts = result.timestamps;
    let idx = -1;
    const tick = () => {
      if (isCancelled()) return;
      const t = audio.currentTime;
      // Linear advance — pages are ~40–70 words, no need for binary search.
      while (idx + 1 < ts.length && ts[idx + 1] && t >= (ts[idx + 1] as WordTimestamp).start) {
        idx += 1;
        opts.onWord?.(idx);
      }
      activeTickRaf = requestAnimationFrame(tick);
    };

    const stopTick = () => {
      if (activeTickRaf) cancelAnimationFrame(activeTickRaf);
      activeTickRaf = null;
    };

    audio.onended = () => {
      stopTick();
      if (!isCancelled()) opts.onEnd?.();
      resolve();
    };
    audio.onerror = () => {
      stopTick();
      if (!isCancelled() && opts.allowSpeechSynthFallback !== false) {
        speakViaSpeechSynth('', opts, isCancelled); // best-effort — no source text here
      }
      resolve();
    };

    audio.play().then(
      () => {
        activeTickRaf = requestAnimationFrame(tick);
      },
      () => {
        // Autoplay blocked. On iOS this happens if the shared element
        // has never been unlocked (fresh reader, never tapped ▶) OR
        // rarely if the browser released the unlock (e.g. long silence).
        // Signal the transport to pause; the next terracotta play tap
        // will unlock and start fresh.
        stopTick();
        if (!isCancelled()) opts.onBlocked?.();
        resolve();
      },
    );
  });
}

// ---------- Layer 2: device SpeechSynthesis ----------

function speakViaSpeechSynth(text: string, opts: SpeakOptions, isCancelled: () => boolean): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    opts.onEnd?.();
    return;
  }
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95 * (opts.rate ?? 1);
  utt.pitch = 1.0;
  if (typeof opts.volume === 'number') utt.volume = Math.min(1, Math.max(0, opts.volume));

  // Word-boundary approximation via charIndex. Not as precise as real
  // timestamps but enough to move the highlight during fallback.
  const wordStarts: number[] = [];
  {
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) wordStarts.push(m.index);
  }
  utt.onboundary = (event) => {
    if (isCancelled()) return;
    if (event.name !== 'word') return;
    // Find the greatest wordStarts <= event.charIndex.
    let idx = -1;
    for (let i = 0; i < wordStarts.length; i++) {
      const start = wordStarts[i];
      if (start !== undefined && start <= event.charIndex) idx = i;
      else break;
    }
    if (idx >= 0) opts.onWord?.(idx);
  };
  utt.onend = () => {
    if (isCancelled()) return;
    opts.onEnd?.();
  };
  utt.onerror = () => {
    if (isCancelled()) return;
    opts.onEnd?.();
  };

  try {
    window.speechSynthesis.speak(utt);
  } catch {
    opts.onEnd?.();
  }
}

function cancelSpeechSynth(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* iOS may throw on cancel — ignore */
    }
  }
  if (sharedAudioEl) {
    try {
      sharedAudioEl.pause();
    } catch {
      /* ignore */
    }
    // Do NOT null out sharedAudioEl — we want to KEEP the element around
    // so its iOS unlock persists across pages/chapters. Just detach
    // handlers so a lingering onended can't fire the previous page's
    // callbacks against a new-page play.
    sharedAudioEl.onended = null;
    sharedAudioEl.onerror = null;
  }
  releaseAudioUrl();
  if (activeTickRaf) {
    cancelAnimationFrame(activeTickRaf);
    activeTickRaf = null;
  }
}
