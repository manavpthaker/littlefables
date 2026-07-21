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

let activeAudioEl: HTMLAudioElement | null = null;
let activeTickRaf: number | null = null;

function playAudio(
  result: TtsFetchResult,
  opts: SpeakOptions,
  isCancelled: () => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(result.audio);
    const audio = new Audio(url);
    activeAudioEl = audio;
    if (opts.rate && opts.rate > 0) audio.playbackRate = opts.rate;
    if (typeof opts.volume === 'number') audio.volume = Math.min(1, Math.max(0, opts.volume));
    if (opts.startOffset && opts.startOffset > 0) audio.currentTime = opts.startOffset;

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

    audio.onended = () => {
      cleanup();
      if (!isCancelled()) opts.onEnd?.();
      resolve();
    };
    audio.onerror = () => {
      cleanup();
      if (!isCancelled() && opts.allowSpeechSynthFallback !== false) {
        speakViaSpeechSynth('', opts, isCancelled); // best-effort — no source text here
      }
      resolve();
    };

    const cleanup = () => {
      URL.revokeObjectURL(url);
      if (activeTickRaf) cancelAnimationFrame(activeTickRaf);
      activeTickRaf = null;
      activeAudioEl = null;
    };

    audio.play().then(
      () => {
        activeTickRaf = requestAnimationFrame(tick);
      },
      () => {
        // Autoplay blocked (iOS outside a user gesture). Signal the transport
        // to pause + keep the play-intent so a subsequent tap resumes.
        cleanup();
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
  if (activeAudioEl) {
    try {
      activeAudioEl.pause();
    } catch {
      /* ignore */
    }
    activeAudioEl = null;
  }
  if (activeTickRaf) {
    cancelAnimationFrame(activeTickRaf);
    activeTickRaf = null;
  }
}
