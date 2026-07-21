import { z } from 'zod';

// Question types the generator can produce (PRD A10 rotation). The brief's
// ladder maps: literal=recall, inferential=inference, predictive=prediction;
// 'connection' stays as an occasional bonus rung.
export const questionTypeSchema = z.enum(['recall', 'inference', 'prediction', 'connection']);
export type QuestionType = z.infer<typeof questionTypeSchema>;

// Record-level types — superset of the generated types: 'retell' rows are
// written by the retell flow, never by the checkpoint generator.
// AUDIT C2: must equal the question_type CHECK in
// supabase/migrations/20260721000012_redesign_core.sql (schema-sync test).
export const RECORD_QUESTION_TYPES = [
  'recall',
  'inference',
  'prediction',
  'connection',
  'retell',
] as const;
export type RecordQuestionType = (typeof RECORD_QUESTION_TYPES)[number];

// A tap-choice fallback option (brief §IV.2): shown when the mic is denied or
// after mercy is exhausted. Exactly one option should carry best: true.
export const fallbackChoiceSchema = z.object({
  label: z.string().min(1).max(60),
  best: z.boolean().optional(),
});
export type FallbackChoice = z.infer<typeof fallbackChoiceSchema>;

export const checkpointQuestionSchema = z.object({
  question: z.string().min(1).max(300),
  type: questionTypeSchema,
  hint: z.string().max(300).optional().nullable(),
  given: z.string().max(300).optional().nullable(),
  // Judge grounding — held server-side in comprehension_records.payload,
  // never sent to the client.
  expectedConcepts: z.array(z.string().max(80)).max(6).default([]),
  fallbackChoices: z.array(fallbackChoiceSchema).max(4).default([]),
});
export type CheckpointQuestion = z.infer<typeof checkpointQuestionSchema>;

// Client-facing question shape: judge material stripped, tap choices kept.
export const clientCheckpointQuestionSchema = checkpointQuestionSchema.omit({
  expectedConcepts: true,
});
export type ClientCheckpointQuestion = z.infer<typeof clientCheckpointQuestionSchema>;

export const generateCheckpointBodySchema = z.object({
  bookId: z.string().min(1),
  chapterIdx: z.number().int().min(0),
});
export type GenerateCheckpointInput = z.infer<typeof generateCheckpointBodySchema>;

export const generatedCheckpointRecordSchema = z.object({
  recordId: z.string().uuid(),
  question: clientCheckpointQuestionSchema,
});
export type GeneratedCheckpointRecord = z.infer<typeof generatedCheckpointRecordSchema>;

export const judgeSignalSchema = z.enum(['correct', 'partial', 'mercy_hint', 'mercy_given', 'skipped']);
export type JudgeSignal = z.infer<typeof judgeSignalSchema>;

// Fallback if Anthropic times out / errors — never says "wrong" and is on-topic
// enough to keep the flow warm (PRD F3 fail-soft on joy).
export const FALLBACK_QUESTION: CheckpointQuestion = {
  question: 'What was your favorite part of that chapter?',
  type: 'connection',
  hint: 'Was there a page that made you smile?',
  given: 'Every chapter has a moment worth remembering — that one had one too.',
  expectedConcepts: [],
  fallbackChoices: [
    { label: 'The exciting part', best: true },
    { label: 'The funny part' },
    { label: 'All of it!' },
  ],
};
