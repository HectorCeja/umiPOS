import { describe, expect, it } from 'vitest';
import { resolveRequestId } from './request-id.js';

describe('resolveRequestId', () => {
  it('preserves a bounded safe correlation ID', () => {
    expect(resolveRequestId('client.request-01:retry')).toBe('client.request-01:retry');
  });

  it.each(['line\nbreak', 'carriage\rreturn', 'spaces are unsafe', 'x'.repeat(129)])(
    'replaces unsafe or injectable value %j',
    (value) => {
      expect(resolveRequestId(value)).toMatch(/^[0-9a-f-]{36}$/);
    },
  );

  it('replaces duplicate header arrays', () => {
    expect(resolveRequestId(['one', 'two'])).toMatch(/^[0-9a-f-]{36}$/);
  });
});
