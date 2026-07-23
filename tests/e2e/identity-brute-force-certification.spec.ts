import { expect, test } from '@playwright/test';

const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';
const origin = 'http://localhost:3000';

const payload = (email: string, credential: string) => ({
  deviceFingerprint: `brute-force-certification-${email}`,
  deviceName: 'Brute force certification',
  email,
  password: credential,
  rememberDevice: false,
  rememberMe: false,
});

test.describe.serial('Part 1A abuse protection certification', () => {
  test('locks a known account durably after the configured consecutive failure threshold', async ({
    request,
  }) => {
    const email = 'alpha.employee@nexo.local';
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await request.post('/v1/auth/login', {
        data: payload(email, `wrong-password-${String(attempt)}`),
        headers: { origin },
      });
      expect(response.status()).toBe(401);
    }
    const throttled = await request.post('/v1/auth/login', {
      data: payload(email, password),
      headers: { origin },
    });
    expect(throttled.status()).toBe(429);
  });

  test('limits password spraying across distinct nonexistent accounts by source IP', async ({
    request,
  }) => {
    // Eleven requests were consumed by the preceding scenario (ten failures plus the blocked
    // correct-password attempt). The global source-IP budget is 30/minute, so nineteen more
    // generic failures are accepted and the next is blocked.
    for (let attempt = 0; attempt < 19; attempt += 1) {
      const response = await request.post('/v1/auth/login', {
        data: payload(`spray-${String(attempt)}@nexo.invalid`, 'wrong-password'),
        headers: { origin },
      });
      expect(response.status()).toBe(401);
    }
    const blocked = await request.post('/v1/auth/login', {
      data: payload('spray-blocked@nexo.invalid', 'wrong-password'),
      headers: { origin },
    });
    expect(blocked.status()).toBe(429);
  });
});
