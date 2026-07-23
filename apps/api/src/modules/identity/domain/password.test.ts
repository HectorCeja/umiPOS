import { describe, expect, it } from 'vitest';

import { hashPassword, PasswordPolicyError, validatePassword, verifyPassword } from './password.js';

describe('password policy and Argon2id', () => {
  it('accepts long passphrases without composition rules', () => {
    expect(() => {
      validatePassword('una frase larga segura');
    }).not.toThrow();
  });

  it('rejects short and blocked passwords', () => {
    expect(() => {
      validatePassword('short');
    }).toThrow(PasswordPolicyError);
    expect(() => {
      validatePassword('passwordpassword');
    }).toThrow(PasswordPolicyError);
  });

  it('hashes with a unique salt and compares in constant-time primitive', async () => {
    const password = 'Correct Horse Battery NEXO';
    const first = await hashPassword(password);
    const second = await hashPassword(password);
    expect(first.hash).not.toBe(second.hash);
    await expect(verifyPassword(password, first.hash, first.salt)).resolves.toBe(true);
    await expect(verifyPassword('wrong but long enough', first.hash, first.salt)).resolves.toBe(
      false,
    );
  });
});
