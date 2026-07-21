import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { BOOK_KINDS, BOOK_SOURCES, BOOK_STATUSES } from '@/lib/models/book';
import { RECORD_QUESTION_TYPES } from '@/lib/models/checkpoint';

// AUDIT C2 drift-prevention: the CHECK constraint enum strings in
// supabase/migrations/*_multitenant.sql MUST equal the arrays in lib/models/book.ts.
// If someone changes one without the other, this test fails loudly on CI —
// no more silent drops of `draft` / `family` rows.

const MIGRATION_PATH = path.resolve(
  process.cwd(),
  'supabase/migrations/20260717000001_multitenant.sql',
);

function extractCheckList(sql: string, column: string): string[] {
  const re = new RegExp(`${column}\\s+text\\s+not\\s+null\\s+check\\s*\\(\\s*${column}\\s+in\\s*\\(([^)]+)\\)`, 'i');
  const match = sql.match(re);
  if (!match || !match[1]) throw new Error(`Could not find CHECK list for column "${column}" in migration`);
  return match[1]
    .split(',')
    .map((s) => s.trim().replace(/^'/, '').replace(/'$/, ''))
    .filter(Boolean);
}

describe('schema sync: model enums vs migration CHECK constraints', () => {
  const sql = readFileSync(MIGRATION_PATH, 'utf8');

  it('book kinds match', () => {
    expect(extractCheckList(sql, 'kind').sort()).toEqual([...BOOK_KINDS].sort());
  });

  it('book sources match', () => {
    expect(extractCheckList(sql, 'source').sort()).toEqual([...BOOK_SOURCES].sort());
  });

  it('book statuses match', () => {
    expect(extractCheckList(sql, 'status').sort()).toEqual([...BOOK_STATUSES].sort());
  });
});

// The redesign migration swaps comprehension_records' question_type CHECK
// (adds 'retell'). The LATEST constraint is the source of truth, so this test
// reads the redesign migration, not multitenant.
const REDESIGN_MIGRATION_PATH = path.resolve(
  process.cwd(),
  'supabase/migrations/20260721000012_redesign_core.sql',
);

describe('schema sync: comprehension record question types', () => {
  const sql = readFileSync(REDESIGN_MIGRATION_PATH, 'utf8');

  it('question_type CHECK matches RECORD_QUESTION_TYPES', () => {
    const re = /add\s+constraint\s+comprehension_records_question_type_check\s+check\s*\(\s*question_type\s+in\s*\(([^)]+)\)/i;
    const match = sql.match(re);
    if (!match || !match[1]) throw new Error('Could not find question_type CHECK in redesign migration');
    const dbList = match[1]
      .split(',')
      .map((s) => s.trim().replace(/^'/, '').replace(/'$/, ''))
      .filter(Boolean);
    expect(dbList.sort()).toEqual([...RECORD_QUESTION_TYPES].sort());
  });
});
