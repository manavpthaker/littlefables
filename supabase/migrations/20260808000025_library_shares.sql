-- Library shares: a share row with book_id null grants /share/[token]
-- access to every kid-visible book on the household's shelf, not just one.
-- Minted from the reader menu's "All stories" action.

alter table public.book_shares alter column book_id drop not null;

comment on table public.book_shares is
  'Public share tokens. book_id set → one book; book_id null → the household''s whole shelf. Bypasses household auth; scoping enforced in-code via service role.';
