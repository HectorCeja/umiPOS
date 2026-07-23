import { describe, expect, it } from 'vitest';

import { foundationWorkerStatus } from './lifecycle.js';

describe('foundationWorkerStatus', () => {
  it('starts idle before business jobs exist', () => {
    expect(foundationWorkerStatus()).toEqual({ name: 'nexo-worker', status: 'idle' });
  });
});
