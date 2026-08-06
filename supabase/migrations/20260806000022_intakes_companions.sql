-- Intake: capture who else appears in the book.
--
-- We only draw humans the buyer explicitly named. Otherwise it's just the
-- child — the mentor voice belongs to objects and nature (see the "no
-- fabricated humans" rule in fulfillment).
--
-- Free text; a photo per companion isn't required at intake — we ask by
-- email if the buyer names people we don't have references for.

alter table public.intakes
  add column if not exists companions text;
