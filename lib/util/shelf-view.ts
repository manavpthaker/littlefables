/** How the library is laid out. */
export type ViewMode = 'single' | 'grid' | 'list';

export const VIEW_MODES: readonly ViewMode[] = ['single', 'grid', 'list'];

/**
 * The shelf picks its own shape, until the reader picks one.
 *
 * A custom-order buyer starts with a single book, and one cover in a grid
 * reads as an empty shop. A family shelf of forty is a lot of scrolling for
 * something a list answers in one screen. Only the middle really wants a grid.
 *
 * This is a default, not a rule: an explicit choice is stored and always wins,
 * including on a shelf that later grows past the next threshold.
 */
export const SINGLE_UP_TO = 3;
export const GRID_UP_TO = 24;

export function defaultView(count: number): ViewMode {
  if (count <= SINGLE_UP_TO) return 'single';
  if (count <= GRID_UP_TO) return 'grid';
  return 'list';
}
