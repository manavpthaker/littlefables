import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Multi-tenant guard (PRD binding rule §7 + CLAUDE.md): "Azad" is data, not
// code. Any occurrence of the literal name in the running app or lib code
// re-introduces the archive anti-pattern that hardcoded him in 13 files and
// ships wrong the moment a second household exists.
//
// Legitimate uses that this guard tolerates:
//   - "Azi-Verse" / "azi-verse" — the character universe / project name
//   - IndexedDB names that predate the redesign ("azad-read", "azad-utterances")
//   - Comments in the character bible referencing an art-bible archive
// Everything else fails loud.
describe('no hardcoded child name in app/ or lib/', () => {
  it('grep for the literal name returns no runtime references', () => {
    const root = path.resolve(process.cwd());
    let output = '';
    try {
      output = execFileSync(
        'rg',
        [
          '--word-regexp',
          '-n',
          '-g', '*.ts',
          '-g', '*.tsx',
          'Azad',
          'app',
          'lib',
        ],
        { cwd: root, encoding: 'utf8' },
      );
    } catch (err) {
      const e = err as { status?: number; stdout?: string };
      // ripgrep exits 1 when no matches (the desired outcome).
      if (e.status === 1) return;
      throw err;
    }
    // If we got output, it's a real match; every runtime callsite has been
    // detenanted. If this ever fails, thread child.display_name (or use
    // neutral copy) instead of restoring the literal.
    expect(output.trim(), `hardcoded child name found — thread child.display_name:\n${output}`).toBe('');
  });
});
