import { describe, expect, it } from 'vitest';
import { tagsFor } from '@/lib/narration/tags';
import type { Segment } from '@/lib/narration/segment';

function seg(overrides: Partial<Segment>): Segment {
  return {
    text: 'x',
    speaker: null,
    quoted: false,
    reportingVerb: null,
    endsWith: '.',
    ...overrides,
  };
}

describe('tagsFor', () => {
  it('returns "" when supportsBrackets is false (no v3)', () => {
    const s = seg({ quoted: true, endsWith: '!', reportingVerb: 'shouted' });
    expect(tagsFor(s, { supportsBrackets: false })).toBe('');
  });

  it('returns "" for narrator prose even with strong signals', () => {
    const s = seg({ quoted: false, endsWith: '!' });
    expect(tagsFor(s, { supportsBrackets: true })).toBe('');
  });

  it('whisper verbs → [whispers]', () => {
    expect(tagsFor(seg({ quoted: true, reportingVerb: 'whispered' }), { supportsBrackets: true })).toBe('[whispers] ');
    expect(tagsFor(seg({ quoted: true, reportingVerb: 'murmured' }), { supportsBrackets: true })).toBe('[whispers] ');
    expect(tagsFor(seg({ quoted: true, reportingVerb: 'sighed' }), { supportsBrackets: true })).toBe('[whispers] ');
  });

  it('loud verbs + ! → [shouting], loud verbs without ! → [louder]', () => {
    expect(tagsFor(seg({ quoted: true, reportingVerb: 'shouted', endsWith: '!' }), { supportsBrackets: true })).toBe('[shouting] ');
    expect(tagsFor(seg({ quoted: true, reportingVerb: 'shouted', endsWith: '.' }), { supportsBrackets: true })).toBe('[louder] ');
  });

  it('laughing verbs → [laughing]', () => {
    expect(tagsFor(seg({ quoted: true, reportingVerb: 'giggled' }), { supportsBrackets: true })).toBe('[laughing] ');
  });

  it('bare ! in a quote (no verb) → [excited]', () => {
    expect(tagsFor(seg({ quoted: true, endsWith: '!' }), { supportsBrackets: true })).toBe('[excited] ');
  });

  it('question mark in a quote → "" (let v3 handle intonation)', () => {
    expect(tagsFor(seg({ quoted: true, endsWith: '?' }), { supportsBrackets: true })).toBe('');
  });

  it('normal declarative quote → ""', () => {
    expect(tagsFor(seg({ quoted: true, reportingVerb: 'said', endsWith: '.' }), { supportsBrackets: true })).toBe('');
  });
});
