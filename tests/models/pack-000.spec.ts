import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { packSchema } from '@/lib/models/book';

// Every story in pack-000 must validate against bookSchema.
// If a new story is added with a shape we can't parse, this fails immediately.
describe('pack-000 conforms to bookSchema', () => {
  const raw = JSON.parse(
    readFileSync(
      path.resolve(process.cwd(), 'content/packs/pack-000-family-originals.json'),
      'utf8',
    ),
  );

  it('parses cleanly', () => {
    const result = packSchema.safeParse(raw);
    if (!result.success) {
      // Log a compact error to help fixing on CI failure.
      // eslint-disable-next-line no-console
      console.error(JSON.stringify(result.error.issues, null, 2));
    }
    expect(result.success).toBe(true);
  });

  it('has at least 7 stories (per CONVERSION-NOTES: 7 of 8 converted)', () => {
    const parsed = packSchema.parse(raw);
    expect(parsed.stories.length).toBeGreaterThanOrEqual(7);
  });
});
