import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { packSchema } from '@/lib/models/book';
import { deriveLayerTag, LAYER_TAGS } from '@/lib/models/layer-tags';

// Guard: every published story in pack-000 must resolve a layerTag either
// authored on the story or derivable from teachingGoals via the stem-aware
// keyword regex. Prior to the redesign the classifier missed every plural
// form (fears / feelings / emotional) so 0 books ever derived to Feelings or
// Courage; the shelf grouping / cover chips silently collapsed to 2 tags.
// If this test fails, either the story needs teaching goals that hit a
// keyword or the keyword palette in lib/models/layer-tags.ts needs the stem.
describe('pack-000 enrichment', () => {
  const raw = JSON.parse(
    readFileSync(
      path.resolve(process.cwd(), 'content/packs/pack-000-family-originals.json'),
      'utf8',
    ),
  );
  const pack = packSchema.parse(raw);
  const published = pack.stories.filter((s) => s.status === 'published' || s.status === 'complete');

  it('every published book resolves a layerTag (authored or derived)', () => {
    const misses: string[] = [];
    for (const story of published) {
      const tag = story.layerTag ?? deriveLayerTag(story.teachingGoals ?? [], story.originNote ?? null);
      if (!tag || !LAYER_TAGS.includes(tag)) misses.push(story.id);
    }
    expect(misses, `stories without a resolvable layerTag: ${misses.join(', ')}`).toEqual([]);
  });

  // beats[] is required for retell completion + StorySpine card. Authoring
  // needs an Anthropic call per book (scripts/backfill-books.ts), so this
  // test is opt-in — set REQUIRE_ENRICHMENT=1 in the CI environment that
  // runs after backfill to enforce it. In local dev / freshly-cloned CI
  // without keys, it reports as a skipped test rather than a hard failure.
  const requireEnrichment = process.env.REQUIRE_ENRICHMENT === '1';
  it.skipIf(!requireEnrichment)('every published book has authored beats', () => {
    const misses = published.filter((s) => !s.beats || s.beats.length === 0).map((s) => s.id);
    expect(misses, `stories missing beats — run pnpm content:backfill: ${misses.join(', ')}`).toEqual([]);
  });
});
