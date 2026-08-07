-- Intake: capture the story spine.
--
-- interests + traits + look + inspirations describe the child's *world*, but
-- they do not give the story anything to *do*. Every book that has worked
-- (Moose Who Knew About Bigness, Bus Detour, Midnight Train, Papa Gets the
-- Moon) started from a specific developmental thing the parent was living
-- with: hitting/yelling, transitions, bedtime, big feelings, separation.
-- Without that, the book is a highlight reel of the child's interests
-- dressed as a story.
--
-- Two open text fields:
--   sticky_moment  — "What's ONE thing that's been sticky for {kid} lately?"
--                    The child's current developmental knot. Drives the arc
--                    and the metaphor.
--   hoped_lesson   — "What's one thing you hope {kid} learns from this book?"
--                    The parent's intended takeaway. Names the tool the book
--                    should put in the family's shared vocabulary.

alter table public.intakes
  add column if not exists sticky_moment text,
  add column if not exists hoped_lesson text;
