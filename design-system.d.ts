// Ambient type declarations for design-system JSX components.
// design-system/ ships .d.ts files that declare Props interfaces but do not
// re-declare the .jsx exports themselves. This file supplements those types
// without modifying the design-system package (verbatim consumption per PRD F1).
//
// Declare a module here ONLY when the app actually imports it. A declaration
// for a module that no longer exists will typecheck fine and fail at runtime —
// that is exactly what happened during the v4 Heritage swap, where the old
// SystemStates.jsx and ParentPrimitives.jsx barrels were split into per-
// component files but their stale declarations kept the build green.

declare module '@ds/components/kid/BookCard.jsx' {
  import type { BookCardProps, ShelfProps } from '@ds/components/kid/BookCard';
  export function BookCard(props: BookCardProps): JSX.Element;
  export function Shelf(props: ShelfProps): JSX.Element;
}

declare module '@ds/components/kid/Transport.jsx' {
  import type { TransportProps } from '@ds/components/kid/Transport';
  export function Transport(props: TransportProps): JSX.Element;
}

declare module '@ds/components/core/Wordmark.jsx' {
  import type { WordmarkProps } from '@ds/components/core/Wordmark';
  export function Wordmark(props: WordmarkProps): JSX.Element;
}

declare module '@ds/components/core/Ornament.jsx' {
  import type { OrnamentProps } from '@ds/components/core/Ornament';
  export function Ornament(
    props: Partial<OrnamentProps> & { style?: React.CSSProperties },
  ): JSX.Element;
}

declare module '@ds/components/outward/TrustRow.jsx' {
  import type { TrustRowProps } from '@ds/components/outward/TrustRow';
  export function TrustRow(props?: TrustRowProps): JSX.Element;
}

declare module '@ds/components/outward/BuyerFooter.jsx' {
  import type { BuyerFooterProps } from '@ds/components/outward/BuyerFooter';
  export function BuyerFooter(props?: BuyerFooterProps): JSX.Element;
}

declare module '@ds/components/reader/ChapterMap.jsx' {
  import type { ChapterMapProps } from '@ds/components/reader/ChapterMap';
  export function ChapterMap(props: ChapterMapProps): JSX.Element;
}

declare module '@ds/components/reader/PaintingWash.jsx' {
  import type { PaintingWashProps } from '@ds/components/reader/PaintingWash';
  // height is typed number upstream but flows straight into style, so a
  // percentage works — the reader needs it to fill an absolutely-positioned
  // parent rather than the default 220px.
  export function PaintingWash(
    props: Omit<PaintingWashProps, 'height'> & { height?: number | string },
  ): JSX.Element;
}

declare module '@ds/components/parent/SectionHeader.jsx' {
  import type { SectionHeaderProps } from '@ds/components/parent/SectionHeader';
  export function SectionHeader(props: SectionHeaderProps): JSX.Element;
}

declare module '@ds/components/parent/Field.jsx' {
  import type { FieldProps } from '@ds/components/parent/Field';
  export function Field(props: FieldProps): JSX.Element;
}
