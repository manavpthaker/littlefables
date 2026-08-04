export interface BookCardProps {
  title: string;
  /** The child's name — always data, never hardcoded copy */
  childName?: string;
  coverSrc?: string;
  /** Describe the scene for the child */
  coverAlt?: string;
  /** 0-1 reading progress; renders a brass bar on the cover */
  progress?: number;
  /** Oxblood ribbon marker */
  isNew?: boolean;
  utterance?: string;
  onOpen?: () => void;
}
