-- Intake: route the form by who is buying and what for.
--
-- The form asks one question shape — sticky_moment, "what's ONE thing that's
-- been sticky for {kid} lately?" — and authoring-doctrine.md makes that the
-- story's spine: it drives the pattern match in story-patterns.md, and a book
-- with no matched pattern does not pass `pnpm content:add`. It is the most
-- load-bearing field in the system.
--
-- Two problems with that, both structural rather than cosmetic:
--
--   1. positioning.md names grandparents as the secondary segment, and
--      delivery-flow.md confirms the buyer completes the intake — a gift
--      recipient lands on /gift/<code> and gets "one orientation screen, then
--      the book", so the book already exists when the parent redeems. A
--      grandparent who sees the child monthly cannot answer the spine
--      question, and answers it with interests instead. That is precisely the
--      "highlight reel of interests dressed as a story" the doctrine warns
--      about, arriving through the front door.
--   2. Every date in positioning.md is Christmas — listing title, Pinterest,
--      Ads Nov 1 to Dec 22, rush lifting to +$22 for late shoppers. The form
--      never asks what the book is FOR. In the highest-volume month, a
--      Christmas buyer cannot say so.
--
-- So: ask who they are and what the occasion is FIRST, and let both change
-- what gets asked afterwards.
--
-- Fields:
--   relationship       'parent' | 'grandparent' | 'other'. Routes the spine
--                      question. Grandparents get one they can answer with
--                      authority ("what have you noticed about them that
--                      you'd want them to know you see?") which still yields
--                      a spine — the noticing IS the story — and still lands
--                      in sticky_moment for the pattern match downstream.
--   occasion           Free text, not a check constraint. The list will drift
--                      with the seasons and a constraint would mean a
--                      migration every time marketing learns something. Same
--                      reasoning as age_band.
--   occasion_note      The occasion block's answer — baby's name and arrival
--                      date, which Christmas morning looks like, whatever the
--                      branch asked for.
--   name_pronunciation How the child's name is said. Narration is generated
--                      with ElevenLabs from written text, and nothing has
--                      ever captured this. A mispronounced name in the audio
--                      of a personalised book is a refund, and it is
--                      invisible until the buyer presses play.
--   pronouns           Previously inferred from the name, which is a coin
--                      flip for plenty of names and a bad miss for a product
--                      whose promise is "this is YOUR child".
--   avoid              Themes, animals, people, recent events to steer clear
--                      of. Feels like enrichment; is not. A dog on page four
--                      for a child bitten last month is not a revision round,
--                      it is a refund and a review.
--   needed_by          The date it has to land. Fulfilment-critical, and the
--                      rush upsell (+$12, +$22 in December) at the moment of
--                      highest intent.

alter table public.intakes
  add column if not exists relationship text,
  add column if not exists occasion text,
  add column if not exists occasion_note text,
  add column if not exists name_pronunciation text,
  add column if not exists pronouns text,
  add column if not exists avoid text,
  add column if not exists needed_by date;

-- Not constrained, but the values the form emits today, for whoever greps for
-- them later: relationship in (parent, grandparent, other); occasion in
-- (christmas, birthday, new-sibling, starting-school, just-because, harder).
-- 'harder' never arrives through the self-serve form — grief, adoption,
-- medical and separation route to a message-us path, because a chip field is
-- the wrong instrument for a bereavement.

create index if not exists intakes_occasion_idx
  on public.intakes (occasion)
  where occasion is not null;

-- Rows needed soonest, first. The admin queue sorts by created_at today,
-- which is wrong the moment two orders have different deadlines.
create index if not exists intakes_needed_by_idx
  on public.intakes (needed_by)
  where needed_by is not null and status not in ('delivered', 'archived');
