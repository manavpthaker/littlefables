-- Intake form refinements.
--
-- Parents pick exact age (half-year granularity) on a slider — we still
-- want the band for pacing, but the numeric value lets us make finer
-- narrative choices (a 4.5-year-old sits differently from a 3-year-old
-- inside the "3–4" bucket).
--
-- Interests-note / traits-note let a parent add specifics that the pill
-- selection can't carry ("horses, but only Icelandic ones", "curious
-- about tiny things").

alter table public.intakes
  add column if not exists age_years numeric(3,1),
  add column if not exists interests_note text,
  add column if not exists traits_note text;
