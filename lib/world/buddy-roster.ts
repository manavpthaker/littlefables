// Phase 2 starting roster — 5 buddies (living/nonliving mix per PRD §B1).
// Sourced from lib/prompts/canon/character-bible.json but flattened here to
// only the fields the runtime needs. Growing the roster later is code-plus-JSON.

export type BuddyPigment =
  | 'var(--teal)'
  | 'var(--marigold)'
  | 'var(--honey)'
  | 'var(--sage)'
  | 'var(--lilac)'
  | 'var(--terracotta)'
  | 'var(--river)';

export interface Buddy {
  id: string;
  name: string;
  emoji: string;
  pigment: BuddyPigment;
  species: 'plush' | 'human' | 'nonliving';
  catchphrase: string;
  greetingStyle: string;
  /** ElevenLabs voice id for this buddy's live TTS. null = use narrator voice.
   *  Cast per-buddy voices in ElevenLabs Voice Library and paste ids here. */
  voiceId: string | null;
  /** Prosody hint for live TTS (stability, style). Roughly maps to the buddy's
   *  greetingStyle — dreamy Dory drifts, ready Miko revs. */
  voiceStyle: 'warm' | 'excited' | 'dreamy' | 'ready' | 'still';
}

export const BUDDY_ROSTER: readonly Buddy[] = Object.freeze([
  {
    id: 'char_bramble',
    name: 'Bramble',
    emoji: '🧸',
    pigment: 'var(--honey)',
    species: 'plush',
    catchphrase: "We're brave together.",
    greetingStyle: 'cozy',
    voiceId: null,
    voiceStyle: 'warm',
  },
  {
    id: 'char_jujy',
    name: 'Jujy',
    emoji: '🐱',
    pigment: 'var(--marigold)',
    species: 'plush',
    catchphrase: 'Whisker-wiggle roll call!',
    greetingStyle: 'excited',
    voiceId: null,
    voiceStyle: 'excited',
  },
  {
    id: 'char_dory',
    name: 'Dory',
    emoji: '😺',
    pigment: 'var(--lilac)',
    species: 'plush',
    catchphrase: 'Um… what were we doing?',
    greetingStyle: 'dreamy',
    voiceId: null,
    voiceStyle: 'dreamy',
  },
  {
    id: 'char_miko',
    name: 'Miko',
    emoji: '🦊',
    pigment: 'var(--terracotta)',
    species: 'plush',
    catchphrase: "Vroom vroom, let's zoom!",
    greetingStyle: 'ready',
    voiceId: null,
    voiceStyle: 'ready',
  },
  {
    id: 'char_rocky',
    name: 'Rocky',
    emoji: '🪨',
    pigment: 'var(--sage)',
    species: 'nonliving',
    catchphrase: '...',
    greetingStyle: 'still',
    voiceId: null,
    voiceStyle: 'still',
  },
] as const);

export const DEFAULT_BUDDY_ID = 'char_bramble';

export function findBuddy(id: string): Buddy | null {
  return BUDDY_ROSTER.find((b) => b.id === id) ?? null;
}

export function activeBuddy(id: string): Buddy {
  return findBuddy(id) ?? (BUDDY_ROSTER[0] as Buddy);
}
