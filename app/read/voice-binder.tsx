'use client';

import { useEffect } from 'react';
import { bindBuddyVoiceId, speakUtterance } from '@/lib/voice/ui-voice';

/** Binds the child's active buddy voiceId at the kid subtree root so every
 *  `speakUtterance({ voice: 'buddy' })` picks it up without threading props
 *  through every checkpoint / retell / tab-tap / word-save call site. */
export function BuddyVoiceBinder({ voiceId }: { voiceId: string | null }) {
  useEffect(() => {
    bindBuddyVoiceId(voiceId ?? null);
    return () => bindBuddyVoiceId(null);
  }, [voiceId]);
  return null;
}

/** Delegated tap listener for `data-utterance` re-hear. A child taps a speech
 *  bubble, checkpoint question, or retell prompt and it speaks again. Kept
 *  narrow: skips interactive owners (buttons, MicOrb, links) so we never
 *  double-speak on top of their own onClick utterance. */
export function UtteranceTapListener() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Interactive owners handle their own utterance via onClick — do not
      // double-speak. The DS Button emits data-utterance on itself; its
      // onClick already fires, so treating buttons as tap-listener targets
      // would race with (and often speak on top of) the intended flow.
      if (target.closest('button, a[href], [role="button"], [data-mic-orb]')) return;
      const node = target.closest<HTMLElement>('[data-utterance]');
      const text = node?.dataset.utterance?.trim();
      if (!text) return;
      void speakUtterance(text, { priority: 'tap', voice: 'buddy' });
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
