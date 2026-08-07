-- Intake: capture the buyer's lastname so the household folder / DB slug
-- doesn't have to be invented at fulfillment time.
--
-- Optional. If left blank the fulfillment operator picks a slug at
-- publish time (e.g. from the child's first name + order id).

alter table public.intakes
  add column if not exists parent_lastname text;
