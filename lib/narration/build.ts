import { applyPronunciations, mergePronunciations, type PronunciationMap } from './pronunciations';
import { segmentPage, type Segment } from './segment';
import { tagsFor } from './tags';

// Compose the narration pipeline: page text → segments → per-segment
// voice + pronunciation + emotion-tag decisions. Pure — no ElevenLabs.
// The narrate-book script (and, later, the live TTS route) consumes the
// returned segments and hands each to the API.

export interface CharacterVoices {
  /** Voice for narrator prose + any unattributed / off-shelf character. */
  narratorVoiceId: string;
  /** Map of character name → voice id. Case-preserved for display; the
   *  segmenter matches case-insensitively. */
  perCharacter: Record<string, string>;
}

export interface BuildInput {
  text: string;
  voices: CharacterVoices;
  pronunciations: {
    global?: PronunciationMap | null;
    perBook?: PronunciationMap | null;
  };
  /** True when we can emit [excited]/[whispers] tags; ElevenLabs v3 only. */
  supportsBrackets: boolean;
}

export interface BuiltSegment {
  /** Text to send to ElevenLabs — pronunciation-applied, tag-prepended. */
  text: string;
  /** Voice id to render this segment with. */
  voiceId: string;
  /** Human-readable label for logs — "narrator" or the character name. */
  speaker: string;
  /** The originating segment, for debugging / offset tracking. */
  origin: Segment;
}

export function buildNarrationSegments(input: BuildInput): BuiltSegment[] {
  const dict = mergePronunciations(input.pronunciations.global ?? null, input.pronunciations.perBook ?? null);
  const characterNames = Object.keys(input.voices.perCharacter);
  const segments = segmentPage(input.text, characterNames);

  return segments.map((seg) => {
    const speaker = seg.speaker ?? 'narrator';
    const voiceId =
      seg.speaker && input.voices.perCharacter[seg.speaker]
        ? input.voices.perCharacter[seg.speaker]!
        : input.voices.narratorVoiceId;
    const withPron = applyPronunciations(seg.text, dict);
    const tag = tagsFor(seg, { supportsBrackets: input.supportsBrackets });
    return {
      text: tag + withPron,
      voiceId,
      speaker,
      origin: seg,
    };
  });
}
