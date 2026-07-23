import { describe, expect, it } from 'vitest';

import { isDependencyUnavailable } from './problem-details.filter.js';

describe('dependency failure classification', () => {
  it.each([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'ENOTFOUND',
    'P1001',
    'P1002',
    'P2028',
  ])('classifies %s as dependency unavailable', (code) => {
    expect(isDependencyUnavailable(Object.assign(new Error('redacted'), { code }))).toBe(true);
  });

  it('does not turn arbitrary defects into dependency failures', () => {
    expect(isDependencyUnavailable(new Error('business defect'))).toBe(false);
  });
});
