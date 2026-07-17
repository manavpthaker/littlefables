import { z } from 'zod';

export const questionTypeSchema = z.enum(['recall', 'inference', 'prediction', 'connection']);
export type QuestionType = z.infer<typeof questionTypeSchema>;

export const checkpointQuestionSchema = z.object({
  question: z.string().min(1).max(300),
  type: questionTypeSchema,
  hint: z.string().max(300).optional().nullable(),
  given: z.string().max(300).optional().nullable(),
});
export type CheckpointQuestion = z.infer<typeof checkpointQuestionSchema>;

export const generateCheckpointBodySchema = z.object({
  bookId: z.string().min(1),
  chapterIdx: z.number().int().min(0),
});
export type GenerateCheckpointInput = z.infer<typeof generateCheckpointBodySchema>;

export const generatedCheckpointRecordSchema = z.object({
  recordId: z.string().uuid(),
  question: checkpointQuestionSchema,
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
};
