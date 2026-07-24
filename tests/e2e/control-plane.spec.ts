import { expect, request, test, type APIRequestContext } from '@playwright/test';
import { createCleanUser } from './dynamic-context.helpers';

const betaOwner = 'beta.owner@nexo.local';
const password = process.env.TEST_PERSONA_PASSWORD ?? 'Nexo Test Persona 2026!';

async function login(email: string, baseURL = 'http://127.0.0.1:3001') {
  const context = await request.newContext({
    baseURL,
    extraHTTPHeaders: { origin: 'http://localhost:3000' },
  });
  const response = await context.post('/v1/auth/login', {
    data: {
      deviceFingerprint: `prompt6-${email}-device`,
      deviceName: 'Prompt 6 E2E',
      email,
      password,
    },
  });
  expect(response.status()).toBe(200);
  const cookies = await context.storageState();
  const csrf = cookies.cookies.find(({ name }) => name === 'nexo_csrf')?.value;
  expect(csrf).toBeTruthy();
  return { context, csrf: csrf! };
}

const write = (csrf: string) => ({ origin: 'http://localhost:3000', 'x-csrf-token': csrf });

async function invitationToken(email: string) {
  await expect
    .poll(
      async () =>
        (
          (await (
            await fetch(`http://127.0.0.1:8025/api/v1/search?query=to:${encodeURIComponent(email)}`)
          ).json()) as { messages?: unknown[] }
        ).messages?.length ?? 0,
    )
    .toBeGreaterThan(0);
  const search = (await (
    await fetch(`http://127.0.0.1:8025/api/v1/search?query=to:${encodeURIComponent(email)}`)
  ).json()) as { messages: { ID: string }[] };
  const message = (await (
    await fetch(`http://127.0.0.1:8025/api/v1/message/${search.messages[0]!.ID}`)
  ).json()) as { Text: string };
  const match = message.Text.match(/[?&]token=([^\s&]+)/);
  expect(match).toBeTruthy();
  return decodeURIComponent(match![1]!);
}

test.describe.serial('Control Plane with real services', () => {
  let owner: APIRequestContext;
  let csrf: string;
  let organizationId: string;
  let branchId: string;
  let fixtureOwner: string;

  test.beforeAll(() => {
    fixtureOwner = createCleanUser('OWNER').email;
  });

  test('creates an organization and completes data-driven onboarding', async () => {
    ({ context: owner, csrf } = await login(fixtureOwner));
    const templates = await owner.get('/v1/business-templates');
    expect(templates.status()).toBe(200);
    expect((await templates.json()) as unknown[]).toHaveLength(8);
    const response = await owner.post('/v1/organizations', {
      headers: write(csrf),
      data: {
        businessType: 'COFFEE_SHOP',
        countryCode: 'MX',
        defaultCurrency: 'MXN',
        defaultLocale: 'es-MX',
        name: 'Café E2E',
        slug: `cafe-e2e-${Date.now()}`,
        templateKey: 'coffee-shop',
        timeZone: 'America/Mexico_City',
      },
    });
    expect(response.status()).toBe(201);
    organizationId = ((await response.json()) as { id: string }).id;
    const state = (await (
      await owner.get(`/v1/organizations/${organizationId}/onboarding`)
    ).json()) as { version: number };
    const prepared = await owner.put(`/v1/organizations/${organizationId}/onboarding`, {
      headers: write(csrf),
      data: {
        answers: {
          branchName: 'Sucursal Principal',
          businessName: 'Café E2E',
          catalogChoice: 'custom',
          country: 'MX',
          currency: 'MXN',
          journeyStep: 10,
          locale: 'es-MX',
          timeZone: 'America/Mexico_City',
        },
        businessType: 'COFFEE_SHOP',
        currentStep: 4,
        templateKey: 'coffee-shop',
        version: state.version,
      },
    });
    expect(prepared.status()).toBe(200);
    const preparedState = (await prepared.json()) as { version: number };
    const complete = await owner.post(`/v1/organizations/${organizationId}/onboarding/complete`, {
      headers: write(csrf),
      data: { version: preparedState.version },
    });
    expect(complete.status()).toBe(200);
    expect(((await complete.json()) as { status: string }).status).toBe('COMPLETED');
  });

  test('updates settings and manages a branch and a feature', async () => {
    const organization = (await (
      await owner.get(`/v1/organizations/${organizationId}`)
    ).json()) as { version: number };
    expect(
      (
        await owner.patch(`/v1/organizations/${organizationId}`, {
          headers: write(csrf),
          data: {
            legalTaxId: 'XAXX010101000',
            name: 'Café E2E México',
            version: organization.version,
          },
        })
      ).status(),
    ).toBe(200);
    const branch = await owner.post(`/v1/organizations/${organizationId}/branches`, {
      headers: write(csrf),
      data: {
        businessHours: { schemaVersion: 1 },
        code: 'NORTE',
        name: 'Sucursal Norte',
        timeZone: 'America/Mazatlan',
      },
    });
    expect(branch.status()).toBe(201);
    const body = (await branch.json()) as { id: string; version: number };
    branchId = body.id;
    const archived = await owner.delete(
      `/v1/organizations/${organizationId}/branches/${branchId}?version=${body.version}`,
      { headers: write(csrf) },
    );
    expect(archived.status()).toBe(200);
    const archivedBody = (await archived.json()) as { version: number };
    expect(
      (
        await owner.post(`/v1/organizations/${organizationId}/branches/${branchId}/restore`, {
          headers: write(csrf),
          data: { version: archivedBody.version },
        })
      ).status(),
    ).toBe(200);
    const features = (await (
      await owner.get(`/v1/organizations/${organizationId}/feature-flags`)
    ).json()) as { key: string; version: number }[];
    const pos = features.find(({ key }) => key === 'POS')!;
    expect(
      (
        await owner.patch(`/v1/organizations/${organizationId}/features/POS`, {
          headers: write(csrf),
          data: { enabled: false, version: pos.version },
        })
      ).status(),
    ).toBe(200);
  });

  test('invites, resends, accepts and resolves the new Membership', async () => {
    await fetch('http://127.0.0.1:8025/api/v1/messages', { method: 'DELETE' });
    const invitation = await owner.post(`/v1/organizations/${organizationId}/invitations`, {
      headers: write(csrf),
      data: {
        accessScope: 'RESTRICTED',
        branchIds: [branchId],
        email: betaOwner,
        roleKey: 'CASHIER',
      },
    });
    expect(invitation.status()).toBe(201);
    const invitationBody = (await invitation.json()) as { id: string };
    expect(
      (
        await owner.post(
          `/v1/organizations/${organizationId}/invitations/${invitationBody.id}/resend`,
          { headers: write(csrf) },
        )
      ).status(),
    ).toBe(200);
    const token = await invitationToken(betaOwner);
    const invited = await login(betaOwner);
    expect(
      (
        await invited.context.post(`/v1/organizations/${organizationId}/invitations/accept`, {
          headers: write(invited.csrf),
          data: { token },
        })
      ).status(),
    ).toBe(201);
    expect(
      (
        await invited.context.get(
          `/v1/organizations/${organizationId}/authorization/context?branchId=${branchId}`,
        )
      ).status(),
    ).toBe(200);
    const memberships = (await (
      await owner.get(`/v1/organizations/${organizationId}/memberships`)
    ).json()) as { id: string; principalId: string; version: number }[];
    const membership = memberships.find(
      ({ principalId }) => principalId === '42000000-0000-4000-8000-000000000001',
    )!;
    expect(
      (
        await owner.patch(`/v1/organizations/${organizationId}/memberships/${membership.id}`, {
          headers: write(csrf),
          data: {
            accessScope: 'ALL_BRANCHES',
            branchIds: [],
            roleKey: 'EMPLOYEE',
            status: 'ACTIVE',
            version: membership.version,
          },
        })
      ).status(),
    ).toBe(200);
    await invited.context.dispose();
  });

  test.afterAll(async () => owner?.dispose());
});

test.describe('Control Plane visual regression', () => {
  let visualSession: APIRequestContext;
  let visualCookies: Awaited<ReturnType<APIRequestContext['storageState']>>['cookies'];
  test.beforeAll(async () => {
    const authenticated = await login(alphaOwner, 'http://localhost:3001');
    visualSession = authenticated.context;
    visualCookies = (await visualSession.storageState()).cookies;
  });
  test.afterAll(async () => visualSession.dispose());
  for (const surface of ['onboarding', 'organizations', 'branches', 'invitations', 'settings']) {
    test(`${surface} surface`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.context().addCookies(visualCookies);
      await page.goto(`http://localhost:3000/control-plane/${surface}`);
      if (surface === 'onboarding') {
        await page.waitForURL('http://localhost:3000/');
        await expect(page.locator('.product-splash')).toBeHidden();
      } else {
        await expect(page.getByRole('link', { name: 'NEXO, inicio' })).toBeVisible();
      }
      await page.evaluate(() => {
        (document.activeElement as HTMLElement | null)?.blur();
        for (const image of document.querySelectorAll<HTMLElement>('.avatar img'))
          image.style.display = 'none';
        for (const fallback of document.querySelectorAll<HTMLElement>('.avatar__fallback'))
          fallback.style.display = 'grid';
        const profileName = document.querySelector<HTMLElement>('.profile-trigger strong');
        if (profileName) profileName.textContent = 'Alpha Owner';
        for (const skip of document.querySelectorAll<HTMLElement>('.nexo-skip-link'))
          skip.style.display = 'none';
      });
      await page.evaluate(async () => {
        await Promise.all(
          document.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
        );
      });
      await expect(page).toHaveScreenshot(`${surface}.png`, {
        animations: 'disabled',
        fullPage: true,
      });
    });
  }
});
