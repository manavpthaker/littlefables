// Phase 0 seed UUIDs. Single source of truth; Phase 5 (multi-household)
// replaces this with a picker/session. Kept in code as constants so refactors
// find them via TypeScript, not via a grep across .ts + .sql at once.
//
// These MUST match the values in supabase/migrations/20260717000003_seed.sql
// and 20260717000005_reseed_valid_uuids.sql.
export const SEED_HOUSEHOLD_ID = '4ecabfb5-dcce-4c7f-b40d-f94e84e3a427';
export const SEED_CHILD_ID = 'e27b2fa0-d16f-4c38-9d97-ed05374167de';
