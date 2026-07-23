import { describe, expect, it } from 'vitest';

import { canTransitionUser, transitionUser, type User } from './user.js';

const now = new Date('2026-07-12T00:00:00.000Z');
const user: User = Object.freeze({
  id: '018f47fb-54a1-7c2e-8c17-06b9358a3111',
  status: 'PENDING_VERIFICATION',
  givenName: 'Ada',
  familyName: 'Lovelace',
  displayName: 'Ada Lovelace',
  locale: 'en-GB',
  timeZone: 'Europe/London',
  regionalFormat: 'en-GB',
  preferences: {},
  metadata: {},
  featureOverrides: {},
  createdAt: now,
  updatedAt: now,
  statusChangedAt: now,
});

describe('User lifecycle', () => {
  it('allows verification and controlled security transitions', () => {
    expect(canTransitionUser('PENDING_VERIFICATION', 'ACTIVE')).toBe(true);
    expect(canTransitionUser('ACTIVE', 'LOCKED')).toBe(true);
    expect(transitionUser(user, 'ACTIVE', new Date('2026-07-13T00:00:00.000Z')).status).toBe(
      'ACTIVE',
    );
  });

  it('makes DELETED terminal and rejects invalid transitions', () => {
    expect(canTransitionUser('DELETED', 'ACTIVE')).toBe(false);
    expect(() => transitionUser(user, 'LOCKED', now)).toThrow(/Invalid user status transition/);
  });

  it('sets soft-delete evidence on deletion without mutating the source', () => {
    const deleted = transitionUser(user, 'DELETED', new Date('2026-07-14T00:00:00.000Z'));
    expect(deleted.deletedAt?.toISOString()).toBe('2026-07-14T00:00:00.000Z');
    expect(user.deletedAt).toBeUndefined();
  });
});
