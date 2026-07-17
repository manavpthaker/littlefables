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
