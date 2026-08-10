export interface CheckpointTranscriptProps {
  type?: 'recall' | 'inference' | 'prediction' | 'connection';
  question: string;
  /** every spoken attempt, in order, with the judge's outcome */
  attempts: { transcript: string; judged: 'correct' | 'accepted' | 'miss' }[];
  /** mercy outcome in plain language, e.g. "accepted after 2 misses with hint" */
  outcome?: string;
  /** the comprehension signal written to the profile, e.g. "inference: developing" */
  signal?: string;
  when?: string;
}
