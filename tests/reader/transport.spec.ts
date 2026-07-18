import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReaderTransport } from '@/lib/reader/transport';
import * as speechModule from '@/lib/reader/speech';

// Verify PRD §A3 invariants. speech.speak is mocked so we don't actually
// call the browser TTS in tests.

let lastOpts: speechModule.SpeakOptions | null = null;
let lastText: string | null = null;
const cancelCalls: number[] = [];

beforeEach(() => {
  lastOpts = null;
  lastText = null;
  cancelCalls.length = 0;
  vi.spyOn(speechModule, 'speak').mockImplementation((text, opts) => {
    lastText = text;
    lastOpts = opts ?? null;
    return {
      cancel: () => cancelCalls.push(Date.now()),
    };
  });
});

function setup(overrides: Partial<Parameters<typeof useReaderTransport>[0]> = {}) {
  const onAutoNext = vi.fn();
  const props = {
    page: { text: 'The paper boat sailed on.' },
    gated: false,
    onAutoNext,
    isLastPage: false,
    ...overrides,
  };
  const hook = renderHook((p: Parameters<typeof useReaderTransport>[0]) => useReaderTransport(p), {
    initialProps: props,
  });
  return { hook, onAutoNext };
}

describe('useReaderTransport §A3 invariants', () => {
  it('start state: not playing, wordIdx -1', () => {
    const { hook } = setup();
    expect(hook.result.current.playing).toBe(false);
    expect(hook.result.current.wordIdx).toBe(-1);
  });

  it('play starts speech (never navigates)', () => {
    const { hook, onAutoNext } = setup();
    act(() => hook.result.current.play());
    expect(hook.result.current.playing).toBe(true);
    expect(lastText).toContain('paper boat');
    expect(onAutoNext).not.toHaveBeenCalled();
  });

  it('play is idempotent — a second play() does not restart', () => {
    const { hook } = setup();
    act(() => hook.result.current.play());
    const firstCallCount = vi.mocked(speechModule.speak).mock.calls.length;
    act(() => hook.result.current.play());
    expect(vi.mocked(speechModule.speak).mock.calls.length).toBe(firstCallCount);
  });

  it('pause cancels playback but keeps wordIdx (so highlight persists visually)', () => {
    const { hook } = setup();
    act(() => hook.result.current.play());
    act(() => lastOpts?.onWord?.(3));
    expect(hook.result.current.wordIdx).toBe(3);
    act(() => hook.result.current.pause());
    expect(hook.result.current.playing).toBe(false);
    expect(hook.result.current.wordIdx).toBe(3);
    expect(cancelCalls.length).toBeGreaterThan(0);
  });

  it('seekToWord restarts playback at the requested word', () => {
    const { hook } = setup({
      page: {
        text: 'a b c d',
        timestamps: [
          { word: 'a', start: 0, end: 0.2 },
          { word: 'b', start: 0.2, end: 0.4 },
          { word: 'c', start: 0.4, end: 0.6 },
          { word: 'd', start: 0.6, end: 0.8 },
        ],
      },
    });
    act(() => hook.result.current.seekToWord(2));
    expect(hook.result.current.playing).toBe(true);
    expect(hook.result.current.wordIdx).toBe(2);
    expect(lastOpts?.startOffset).toBeCloseTo(0.4);
  });

  it('seekToWord with timestamps present does NOT restart from index 0', () => {
    // Regression: pre-fix, timestamps never threaded into transportPage meant
    // page.timestamps was undefined and seek fell through to startOffset=undefined
    // (restart at word 0). This test locks in the wire.
    const { hook } = setup({
      page: {
        text: 'a b c d',
        timestamps: [
          { word: 'a', start: 0, end: 0.2 },
          { word: 'b', start: 0.2, end: 0.4 },
          { word: 'c', start: 0.4, end: 0.6 },
          { word: 'd', start: 0.6, end: 0.8 },
        ],
      },
    });
    act(() => hook.result.current.seekToWord(3));
    expect(lastOpts?.startOffset).toBeDefined();
    expect(lastOpts?.startOffset).not.toBe(0);
    expect(hook.result.current.wordIdx).toBe(3);
  });

  it('seekToWord without timestamps falls back to restart (word idx only)', () => {
    const { hook } = setup({ page: { text: 'a b c d' } }); // no timestamps
    act(() => hook.result.current.seekToWord(2));
    expect(hook.result.current.wordIdx).toBe(2);
    expect(lastOpts?.startOffset).toBeUndefined();
  });

  it('speakOne pauses main narration and speaks the word alone', () => {
    const { hook } = setup();
    act(() => hook.result.current.play());
    expect(hook.result.current.playing).toBe(true);
    act(() => hook.result.current.speakOne('paper'));
    // Main narration paused
    expect(hook.result.current.playing).toBe(false);
    // Last speak() call was for the word alone
    expect(lastText).toBe('paper');
  });

  it('onEnd on non-last page schedules auto-next; on last page just stops', () => {
    vi.useFakeTimers();
    try {
      const { hook, onAutoNext } = setup({ isLastPage: false });
      act(() => hook.result.current.play());
      act(() => lastOpts?.onEnd?.());
      expect(onAutoNext).not.toHaveBeenCalled();
      act(() => vi.advanceTimersByTime(1500));
      expect(onAutoNext).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('onEnd on the last page stops without auto-next', () => {
    vi.useFakeTimers();
    try {
      const { hook, onAutoNext } = setup({ isLastPage: true });
      act(() => hook.result.current.play());
      act(() => lastOpts?.onEnd?.());
      act(() => vi.advanceTimersByTime(5000));
      expect(onAutoNext).not.toHaveBeenCalled();
      expect(hook.result.current.playing).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('onBlocked (iOS autoplay refusal) pauses but preserves intent', () => {
    const { hook, onAutoNext } = setup();
    act(() => hook.result.current.play());
    act(() => lastOpts?.onBlocked?.());
    expect(hook.result.current.playing).toBe(false);
    expect(onAutoNext).not.toHaveBeenCalled();
  });

  it('unmount cancels any active speech', () => {
    const { hook } = setup();
    act(() => hook.result.current.play());
    hook.unmount();
    expect(cancelCalls.length).toBeGreaterThan(0);
  });
});
