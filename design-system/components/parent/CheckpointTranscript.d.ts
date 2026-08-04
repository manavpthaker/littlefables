export interface CheckpointTranscriptProps {
  /** e.g. "Chapter three checkpoints" */
  title: string;
  date?: string;
  records: Array<{ question: string; answer: string; meta?: string }>;
}
