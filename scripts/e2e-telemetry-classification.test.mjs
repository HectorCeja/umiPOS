import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isExpectedNavigationCancellation } from '../tests/e2e/owner-corrective.helpers.ts';

const navigationCancellation = {
  method: 'GET',
  url: 'http://localhost:3001/v1/organizations/example/authorization/context',
  errorText: 'net::ERR_ABORTED',
  requestStartedAt: 10,
  navigationStartedAt: 20,
};

test('accepts a safe read superseded by a later document navigation', () => {
  assert.equal(isExpectedNavigationCancellation(navigationCancellation), true);
});

test('rejects an aborted mutation', () => {
  assert.equal(
    isExpectedNavigationCancellation({ ...navigationCancellation, method: 'POST' }),
    false,
  );
});

test('rejects a genuine failed request', () => {
  assert.equal(
    isExpectedNavigationCancellation({
      ...navigationCancellation,
      errorText: 'net::ERR_CONNECTION_REFUSED',
    }),
    false,
  );
});

test('rejects an abort without a corresponding later navigation', () => {
  assert.equal(
    isExpectedNavigationCancellation({
      ...navigationCancellation,
      navigationStartedAt: 5,
    }),
    false,
  );
});

test('accepts a safe read when the destination frame has replaced its source route', () => {
  assert.equal(
    isExpectedNavigationCancellation({
      ...navigationCancellation,
      navigationStartedAt: 5,
      frameUrlAtStart: 'http://localhost:3000/products',
      currentFrameUrl: 'http://localhost:3000/reports',
    }),
    true,
  );
});

test('rejects cancellation of authentication reads', () => {
  assert.equal(
    isExpectedNavigationCancellation({
      ...navigationCancellation,
      url: 'http://localhost:3001/v1/auth/session',
    }),
    false,
  );
});

test('accepts a superseded safe read after the same URL succeeds', () => {
  assert.equal(
    isExpectedNavigationCancellation({
      ...navigationCancellation,
      navigationStartedAt: 5,
      replacementSucceeded: true,
    }),
    true,
  );
});

test('a successful replacement never makes a mutation cancellation acceptable', () => {
  assert.equal(
    isExpectedNavigationCancellation({
      ...navigationCancellation,
      method: 'PATCH',
      navigationStartedAt: 5,
      replacementSucceeded: true,
    }),
    false,
  );
});
