export interface QARecordProps {
  question: string;
  /** The child's answer, verbatim */
  answer: string;
  /** e.g. "answered on the first try · 7:42pm" */
  meta?: string;
}
