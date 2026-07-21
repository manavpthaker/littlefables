import { z } from 'zod';
import { analyzeImage } from '@/lib/gemini';
import { hotspotSchema, type Hotspot } from '@/lib/models/book';

// Hotspot authoring (redesign brief §VI): Gemini vision reads the approved
// scene art + the page text and places up to 3 tappable, speakable points
// ("Ember, the little dragon"). Fail-soft: any failure returns null and the
// page simply has no hotspots — never a blocked approval.

const responseSchema = z.object({
  hotspots: z.array(hotspotSchema).max(3),
});

function buildPrompt(pageText: string): string {
  return [
    'You are annotating one illustration from a children\'s picture book (reader is 4 years old).',
    'The page text is:',
    `"""${pageText}"""`,
    '',
    'Identify up to 3 clearly visible, story-relevant things in the image a child could tap.',
    'For each, give:',
    '- x, y: the center of the thing as fractions of image width/height (0..1, two decimals)',
    '- label: 1-3 words naming it (e.g. "Ember")',
    '- emoji: one emoji that matches it',
    '- spoken: one short warm sentence a narrator says when tapped, naming what it is',
    '  (e.g. "That\'s Ember, the little dragon."). Max 15 words. Never scary.',
    '',
    'Only include things actually visible in the image. Fewer is fine; zero is fine.',
    'Reply with ONLY minified JSON: {"hotspots":[{"x":0.32,"y":0.55,"label":"...","emoji":"...","spoken":"..."}]}',
  ].join('\n');
}

export async function generateHotspots(args: {
  householdId: string;
  imageUrl: string;
  pageText: string;
}): Promise<Hotspot[] | null> {
  try {
    const imgRes = await fetch(args.imageUrl);
    if (!imgRes.ok) return null;
    const mimeType = imgRes.headers.get('content-type') ?? 'image/png';
    const imageBytes = Buffer.from(await imgRes.arrayBuffer());

    const raw = await analyzeImage({
      householdId: args.householdId,
      prompt: buildPrompt(args.pageText),
      imageBytes,
      mimeType,
    });

    const jsonText = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = responseSchema.safeParse(JSON.parse(jsonText));
    if (!parsed.success) return null;
    return parsed.data.hotspots;
  } catch {
    return null;
  }
}
