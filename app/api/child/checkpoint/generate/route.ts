import { NextResponse, type NextRequest } from 'next/server';
import { requireChildDevice } from '@/lib/server/require-auth';
import { admin } from '@/lib/supabase/admin';
import { bookSchema } from '@/lib/models/book';
import {
  checkpointQuestionSchema,
  generateCheckpointBodySchema,
  FALLBACK_QUESTION,
  type CheckpointQuestion,
  type GeneratedCheckpointRecord,
} from '@/lib/models/checkpoint';
import { assembleCheckpointPrompt, type QuestionType } from '@/lib/prompts/templates/checkpoint';
import { BudgetExceededError, callAnthropic, extractJson } from '@/lib/anthropic';
import { loadWorldState, bumpGrowth } from '@/lib/world/state';

// Generate ONE checkpoint question for the given book + chapter. Records a
// placeholder comprehension_records row so the answer endpoint can update it.

export async function POST(request: NextRequest) {
  const ctx = await requireChildDevice();
  if (ctx instanceof NextResponse) return ctx;

  const body = generateCheckpointBodySchema.safeParse(await request.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const { bookId, chapterIdx } = body.data;

  // Fetch book (household-scoped) + chapter text.
  const { data: bookRow } = await admin()
    .from('books')
    .select('id, title, kind, book')
    .eq('id', bookId)
    .eq('household_id', ctx.householdId)
    .maybeSingle();
  if (!bookRow?.book) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const parsed = bookSchema.safeParse(bookRow.book);
  if (!parsed.success) return NextResponse.json({ error: 'book_invalid' }, { status: 500 });
  const book = parsed.data;
  const chapter = book.chapters[chapterIdx];
  if (!chapter) return NextResponse.json({ error: 'chapter_not_found' }, { status: 404 });

  const [{ data: recentRecords }, { data: savedWordsRows }, world] = await Promise.all([
    admin()
      .from('comprehension_records')
      .select('question_type')
      .eq('child_id', ctx.childId)
      .order('asked_at', { ascending: false })
      .limit(4),
    admin()
      .from('wordbook_entries')
      .select('word')
      .eq('child_id', ctx.childId)
      .order('saved_at', { ascending: false })
      .limit(6),
    loadWorldState(ctx.childId),
  ]);

  const recentTypes: QuestionType[] = ((recentRecords ?? [])
    .map((r) => r.question_type)
    .filter(Boolean) as QuestionType[]);

  const assembled = assembleCheckpointPrompt({
    book: { title: book.title, kind: book.kind },
    chapterTitle: chapter.title,
    chapterIdx,
    pagesText: chapter.pages.map((p) => p.text).join('\n\n'),
    band: '4-8',
    recentTypes,
    savedWords: (savedWordsRows ?? []).map((r) => r.word),
    worldSummary: `${world.growth.booksOpened} books opened, ${world.growth.wordsSaved} words saved.`,
  });

  let question: CheckpointQuestion = FALLBACK_QUESTION;
  try {
    const raw = await callAnthropic({
      householdId: ctx.householdId,
      kind: 'respond',
      system: assembled.system,
      user: assembled.user,
      cacheKey: assembled.cacheKey,
      maxTokens: 300,
      temperature: 0.7,
    });
    const parsedJson = extractJson<CheckpointQuestion>(raw);
    const validated = parsedJson ? checkpointQuestionSchema.safeParse(parsedJson) : null;
    if (validated?.success) question = validated.data;
  } catch (err) {
    if (err instanceof BudgetExceededError) {
      // Budget-out is not the child's problem — fall through with the safe
      // fallback question and skip persisting counters (audit §4.6).
    } else {
      console.warn('[checkpoint/generate] Anthropic call failed:', err);
    }
  }

  // Persist a placeholder record. answer route updates transcript + signal.
  const { data: record, error: insertErr } = await admin()
    .from('comprehension_records')
    .insert({
      child_id: ctx.childId,
      book_id: bookId,
      chapter_idx: chapterIdx,
      question: question.question,
      question_type: question.type,
    })
    .select('id')
    .single();
  if (insertErr || !record) {
    return NextResponse.json({ error: 'record_failed' }, { status: 500 });
  }

  await bumpGrowth(ctx.childId, 'checkpointsAsked', 1);

  const response: GeneratedCheckpointRecord = {
    recordId: record.id,
    question,
  };
  return NextResponse.json(response);
}
