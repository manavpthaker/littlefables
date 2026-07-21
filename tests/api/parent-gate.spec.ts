import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The parent gate has two invariants:
//   1. When PARENT_PASSWORD is unset, isParentAuthed() returns true and
//      requireParentPassword() returns null (dev bypass).
//   2. When PARENT_PASSWORD is set, isParentAuthed() returns false without a
//      cookie and requireParentPassword() returns a 401. A cookie whose
//      value matches sha-256(password) authenticates; a stale/wrong cookie
//      still fails (defense-in-depth against a rotated env var).
//
// The route-layer defense means every /api/parent/* handler independently
// rejects unauthed requests — middleware alone is not the gate.

const ORIGINAL_PASSWORD = process.env.PARENT_PASSWORD;

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  if (ORIGINAL_PASSWORD === undefined) delete process.env.PARENT_PASSWORD;
  else process.env.PARENT_PASSWORD = ORIGINAL_PASSWORD;
  vi.doUnmock('next/headers');
});

describe('parent gate', () => {
  it('falls open when PARENT_PASSWORD is unset (dev bypass)', async () => {
    delete process.env.PARENT_PASSWORD;
    vi.doMock('next/headers', () => ({
      cookies: async () => ({ get: () => undefined }),
    }));
    const gate = await import('@/lib/server/parent-gate');
    expect(await gate.isParentAuthed()).toBe(true);
    expect(await gate.requireParentPassword()).toBeNull();
    expect(gate.isGateEnabled()).toBe(false);
  });

  it('rejects unauthed requests when PARENT_PASSWORD is set', async () => {
    process.env.PARENT_PASSWORD = 'test-secret';
    vi.doMock('next/headers', () => ({
      cookies: async () => ({ get: () => undefined }),
    }));
    const gate = await import('@/lib/server/parent-gate');
    expect(await gate.isParentAuthed()).toBe(false);
    const denied = await gate.requireParentPassword();
    expect(denied?.status).toBe(401);
    expect(gate.isGateEnabled()).toBe(true);
  });

  it('authenticates when the cookie matches sha-256(password)', async () => {
    process.env.PARENT_PASSWORD = 'test-secret';
    const { createHash } = await import('node:crypto');
    const expected = createHash('sha256').update('test-secret').digest('hex');
    vi.doMock('next/headers', () => ({
      cookies: async () => ({ get: (name: string) => (name === 'lf_parent' ? { value: expected } : undefined) }),
    }));
    const gate = await import('@/lib/server/parent-gate');
    expect(await gate.isParentAuthed()).toBe(true);
    expect(await gate.requireParentPassword()).toBeNull();
  });

  it('rejects a stale cookie (env rotated)', async () => {
    process.env.PARENT_PASSWORD = 'new-secret';
    const { createHash } = await import('node:crypto');
    const staleValue = createHash('sha256').update('old-secret').digest('hex');
    vi.doMock('next/headers', () => ({
      cookies: async () => ({ get: (name: string) => (name === 'lf_parent' ? { value: staleValue } : undefined) }),
    }));
    const gate = await import('@/lib/server/parent-gate');
    expect(await gate.isParentAuthed()).toBe(false);
    const denied = await gate.requireParentPassword();
    expect(denied?.status).toBe(401);
  });

  it('verifyParentPassword accepts the exact secret and rejects others', async () => {
    process.env.PARENT_PASSWORD = 'test-secret';
    vi.doMock('next/headers', () => ({
      cookies: async () => ({ get: () => undefined }),
    }));
    const gate = await import('@/lib/server/parent-gate');
    expect(gate.verifyParentPassword('test-secret')).toEqual({ ok: true });
    expect(gate.verifyParentPassword('wrong')).toMatchObject({ ok: false });
    expect(gate.verifyParentPassword('')).toMatchObject({ ok: false });
  });
});
