import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BUDDY_ROSTER } from '@/lib/world/buddy-roster';

// Identity drift guard (Redesign 2026-07-21): the runtime roster is a
// flattened view of the canon character bible. Name/emoji/catchphrase must
// match for every shared id — the pre-fix state had Jujy wearing Dory's cat
// emoji and Bramble a generic teddy.

interface CanonCharacter {
  id: string;
  name: string;
  emoji: string;
  catchphrase?: string;
}

const BIBLE_PATH = path.resolve(process.cwd(), 'lib/prompts/canon/character-bible.json');

describe('buddy roster ↔ character bible', () => {
  const bible = JSON.parse(readFileSync(BIBLE_PATH, 'utf8')) as { characters: CanonCharacter[] };
  const canonById = new Map(bible.characters.map((c) => [c.id, c]));

  it('every roster buddy exists in canon', () => {
    for (const buddy of BUDDY_ROSTER) {
      expect(canonById.has(buddy.id), `${buddy.id} missing from character bible`).toBe(true);
    }
  });

  it.each(BUDDY_ROSTER.map((b) => [b.id, b] as const))('%s matches canon identity', (id, buddy) => {
    const canon = canonById.get(id);
    if (!canon) throw new Error(`${id} missing from canon`);
    expect(buddy.name).toBe(canon.name);
    expect(buddy.emoji).toBe(canon.emoji);
    if (canon.catchphrase) expect(buddy.catchphrase).toBe(canon.catchphrase);
  });
});
