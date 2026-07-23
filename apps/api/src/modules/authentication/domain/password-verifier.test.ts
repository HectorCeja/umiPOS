import { describe, expect, it } from 'vitest';

import type { PasswordPolicy } from '@nexo/identity';

import {
  hashPassword,
  PasswordPolicyError,
  validatePassword,
  verifyPassword,
} from './password-verifier.js';

const policy: PasswordPolicy = {
  algorithm: 'argon2id',
  algorithmVersion: 1,
  historyDepth: 0,
  maximumLength: 128,
  memoryKiB: 19_456,
  minimumLength: 15,
  parallelism: 1,
  passes: 2,
};

describe('native password verifier', () => {
  it('uses configured Argon2id work factors and a unique salt', async () => {
    const password = 'Correct Horse Battery NEXO';
    const first = await hashPassword(password, policy);
    const second = await hashPassword(password, policy);
    expect(first.hash).not.toBe(second.hash);
    await expect(verifyPassword(password, first)).resolves.toBe(true);
    await expect(verifyPassword('wrong but long enough', first)).resolves.toBe(false);
  });

  it('enforces length without composition rules', () => {
    expect(() => {
      validatePassword('una frase larga segura', policy);
    }).not.toThrow();
    expect(() => {
      validatePassword('too short', policy);
    }).toThrow(PasswordPolicyError);
  });
});
