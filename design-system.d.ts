// Ambient type declarations for design-system JSX components.
// design-system/ ships .d.ts files that declare Props interfaces but do not
// re-declare the .jsx exports themselves. This file supplements those types
// without modifying the design-system package (verbatim consumption per PRD F1).
//
// Add a new declaration here when the app first imports a new component.

declare module '@ds/components/core/Button.jsx' {
  import type { ButtonProps } from '@ds/components/core/Button';
  export function Button(props: ButtonProps): JSX.Element;
  export function IconButton(props: ButtonProps): JSX.Element;
}

declare module '@ds/components/core/Icon.jsx' {
  import type { IconProps } from '@ds/components/core/Icon';
  export function Icon(props: IconProps): JSX.Element;
}

declare module '@ds/components/kid/BookCard.jsx' {
  import type { BookCardProps } from '@ds/components/kid/BookCard';
  export function BookCard(props: BookCardProps): JSX.Element;
}

declare module '@ds/components/kid/Buddy.jsx' {
  import type { BuddyProps } from '@ds/components/kid/Buddy';
  export function Buddy(props: BuddyProps): JSX.Element;
}

declare module '@ds/components/kid/Transport.jsx' {
  import type { TransportProps } from '@ds/components/kid/Transport';
  export function Transport(props: TransportProps): JSX.Element;
}

declare module '@ds/components/kid/WordCapsule.jsx' {
  import type { WordCapsuleProps } from '@ds/components/kid/WordCapsule';
  export function WordCapsule(props: WordCapsuleProps): JSX.Element;
}

declare module '@ds/components/kid/TabBar.jsx' {
  import type { TabBarProps } from '@ds/components/kid/TabBar';
  export function TabBar(props: TabBarProps): JSX.Element;
}

declare module '@ds/components/kid/ContinueCard.jsx' {
  import type { ContinueCardProps } from '@ds/components/kid/ContinueCard';
  export function ContinueCard(props: ContinueCardProps): JSX.Element;
}

declare module '@ds/components/reader/StoryText.jsx' {
  import type { StoryTextProps } from '@ds/components/reader/StoryText';
  export function StoryText(props: StoryTextProps): JSX.Element;
}

declare module '@ds/components/reader/ChoiceBlocks.jsx' {
  import type { ChoiceBlocksProps } from '@ds/components/reader/ChoiceBlocks';
  export function ChoiceBlocks(props: ChoiceBlocksProps): JSX.Element;
}

declare module '@ds/components/reader/Sheet.jsx' {
  import type { SheetProps } from '@ds/components/reader/Sheet';
  export function Sheet(props: SheetProps): JSX.Element;
}

declare module '@ds/components/reader/ChapterMap.jsx' {
  import type { ChapterMapProps } from '@ds/components/reader/ChapterMap';
  export function ChapterMap(props: ChapterMapProps): JSX.Element;
}

declare module '@ds/components/reader/ReaderTopBar.jsx' {
  import type { ReaderTopBarProps } from '@ds/components/reader/ReaderTopBar';
  export function ReaderTopBar(props: ReaderTopBarProps): JSX.Element;
}

declare module '@ds/components/reader/Checkpoint.jsx' {
  import type { CheckpointProps } from '@ds/components/reader/Checkpoint';
  export function Checkpoint(props: CheckpointProps): JSX.Element;
}

declare module '@ds/components/kid/MicOrb.jsx' {
  import type { MicOrbProps } from '@ds/components/kid/MicOrb';
  export function MicOrb(props: MicOrbProps): JSX.Element;
}

declare module '@ds/components/world/SunsRow.jsx' {
  import type { SunsRowProps } from '@ds/components/world/SunsRow';
  export function SunsRow(props: SunsRowProps): JSX.Element;
}

declare module '@ds/components/world/BadgeShelf.jsx' {
  import type { BadgeShelfProps } from '@ds/components/world/BadgeShelf';
  export function BadgeShelf(props: BadgeShelfProps): JSX.Element;
}

declare module '@ds/components/world/Celebration.jsx' {
  import type { CelebrationProps, CelebrationQueueProps } from '@ds/components/world/Celebration';
  export function Celebration(props: CelebrationProps): JSX.Element;
  export function CelebrationQueue(props: CelebrationQueueProps): JSX.Element;
}

declare module '@ds/components/world/WordbookEntry.jsx' {
  import type { WordbookEntryProps } from '@ds/components/world/WordbookEntry';
  export function WordbookEntry(props: WordbookEntryProps): JSX.Element;
}

declare module '@ds/components/system/SystemStates.jsx' {
  import type { StateBannerProps, PaintingWashProps, ErrorCharacterProps } from '@ds/components/system/SystemStates';
  export function StateBanner(props: StateBannerProps): JSX.Element;
  export function PaintingWash(props: PaintingWashProps & { fullBleed?: boolean }): JSX.Element;
  export function ErrorCharacter(props: ErrorCharacterProps): JSX.Element;
}

declare module '@ds/components/parent/CheckpointTranscript.jsx' {
  import type { CheckpointTranscriptProps } from '@ds/components/parent/CheckpointTranscript';
  export function CheckpointTranscript(props: CheckpointTranscriptProps): JSX.Element;
}

declare module '@ds/components/parent/ChoiceRecord.jsx' {
  import type { ChoiceRecordProps } from '@ds/components/parent/ChoiceRecord';
  export function ChoiceRecord(props: ChoiceRecordProps): JSX.Element;
}

declare module '@ds/components/parent/ArtApproval.jsx' {
  import type { ArtApprovalProps } from '@ds/components/parent/ArtApproval';
  export function ArtApproval(props: ArtApprovalProps): JSX.Element;
}

declare module '@ds/components/parent/ParentPrimitives.jsx' {
  import type { SectionHeaderProps } from '@ds/components/parent/ParentPrimitives';
  export function SectionHeader(props: SectionHeaderProps): JSX.Element;
  export function ListRow(props: { children: React.ReactNode }): JSX.Element;
  export function Field(props: { label: string; children: React.ReactNode }): JSX.Element;
  export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element;
  export function RetellingPlayer(props: { src: string; transcript?: string }): JSX.Element;
}
