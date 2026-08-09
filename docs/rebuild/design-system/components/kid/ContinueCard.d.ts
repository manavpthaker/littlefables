export interface ContinueCardProps {
  title: string;
  /** hand-font caption, e.g. "Chapter 2 · The Little Round Door" */
  chapter?: string;
  cover?: string;
  /** 0–1, same marigold ribbon as BookCard */
  progress?: number;
  /** voice slot; default `Keep reading ${title}!` */
  utterance?: string;
  onContinue?: () => void;
}
// Kid density only — never rendered inside [data-density="parent"].
// The embedded Button is the screen's ONE terracotta primary; don't add another.
// Offline: renders and behaves identically (cached book).
