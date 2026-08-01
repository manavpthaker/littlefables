// Title sort key. Library convention: leading "The", "A", "An" don't count
// toward alphabetization ("The Midnight Train" sorts under M, not T). Case-
// and whitespace-insensitive. Kept pure so both RSC and client sort agree.

const ARTICLES = /^\s*(the|a|an)\s+/i;

export function titleSortKey(title: string): string {
  return title.replace(ARTICLES, '').trim().toLowerCase();
}

export function compareTitles(a: string, b: string): number {
  const ka = titleSortKey(a);
  const kb = titleSortKey(b);
  return ka.localeCompare(kb, undefined, { sensitivity: 'base', numeric: true });
}
