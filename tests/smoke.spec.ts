import { describe, expect, it } from 'vitest';
import { CHILD_TOKEN_COOKIE, CHILD_TOKEN_TTL_DAYS } from '@/lib/auth/child-token';

// Smoke test — proves the alias resolves and vitest is wired.
// Real tests land per-slice; this file will be superseded once Slice 3 lands
// with the full child-token spec.
describe('scaffold smoke', () => {
  it('child-token constants are defined', () => {
    expect(CHILD_TOKEN_COOKIE).toBe('lf_child_token');
    expect(CHILD_TOKEN_TTL_DAYS).toBeGreaterThan(0);
  });
});
