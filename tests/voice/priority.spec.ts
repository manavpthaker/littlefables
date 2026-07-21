import { describe, expect, it } from 'vitest';
import { decide, type UtterTier } from '@/lib/voice/priority';

// DS rules-of-use: narration > checkpoint question > tap feedback > ambient.
// Checkpoint questions queue behind narration (never lost); everything else
// is drop-not-delay.

describe('voice priority policy', () => {
  it('narration parks checkpoint questions one-deep', () => {
    expect(decide({ narrationActive: true, activeTier: null, incoming: 'checkpoint' })).toBe('queue');
  });

  it('narration drops tap and ambient', () => {
    expect(decide({ narrationActive: true, activeTier: null, incoming: 'tap' })).toBe('drop');
    expect(decide({ narrationActive: true, activeTier: null, incoming: 'ambient' })).toBe('drop');
  });

  it('anything plays into an empty slot', () => {
    for (const tier of ['checkpoint', 'tap', 'ambient'] as UtterTier[]) {
      expect(decide({ narrationActive: false, activeTier: null, incoming: tier })).toBe('play');
    }
  });

  it('checkpoint interrupts lesser speech', () => {
    expect(decide({ narrationActive: false, activeTier: 'tap', incoming: 'checkpoint' })).toBe('play');
    expect(decide({ narrationActive: false, activeTier: 'ambient', incoming: 'checkpoint' })).toBe('play');
  });

  it('tap never talks over a checkpoint question', () => {
    expect(decide({ narrationActive: false, activeTier: 'checkpoint', incoming: 'tap' })).toBe('drop');
  });

  it('ambient yields to checkpoint and tap', () => {
    expect(decide({ narrationActive: false, activeTier: 'checkpoint', incoming: 'ambient' })).toBe('drop');
    expect(decide({ narrationActive: false, activeTier: 'tap', incoming: 'ambient' })).toBe('drop');
  });

  it('within a tier, the latest utterance wins', () => {
    expect(decide({ narrationActive: false, activeTier: 'tap', incoming: 'tap' })).toBe('play');
    expect(decide({ narrationActive: false, activeTier: 'ambient', incoming: 'ambient' })).toBe('play');
    expect(decide({ narrationActive: false, activeTier: 'checkpoint', incoming: 'checkpoint' })).toBe('play');
  });
});
