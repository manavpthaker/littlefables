import { z } from 'zod';

// Reader progress wire schema.
export const progressBodySchema = z.object({
  bookId: z.string().min(1).max(120),
  chapterIdx: z.number().int().min(0),
  pageIdx: z.number().int().min(0),
});
export type ProgressInput = z.infer<typeof progressBodySchema>;

export interface ProgressRecord {
  bookId: string;
  chapterIdx: number;
  pageIdx: number;
  updatedAt: string;
}
