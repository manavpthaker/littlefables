export interface ChapterMapProps {
  chapters: Array<{ id: string; label: string; done?: boolean; locked?: boolean; utterance?: string }>;
  currentId?: string;
  onSelect?: (id: string) => void;
}
