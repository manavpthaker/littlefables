-- S2.2: rejecting a candidate at grid speed benefits from a stored reason so
-- the next generation pass can steer around it. Nullable — old rows keep
-- rejecting with no reason.

alter table public.art_artifacts
  add column if not exists reject_reason text;
