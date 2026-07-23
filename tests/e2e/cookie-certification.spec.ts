import { expect, test } from '@playwright/test';
import { createCleanBusiness, loginClean } from './dynamic-context.helpers';

test('cookies locales conservan HttpOnly, SameSite estricto y CSRF legible', async ({ page }) => {
  const business = createCleanBusiness();
  await loginClean(page, business.email);
  const cookies = await page.context().cookies();
  const session = cookies.find((cookie) => cookie.name === 'nexo_session');
  const refresh = cookies.find((cookie) => cookie.name === 'nexo_refresh');
  const csrf = cookies.find((cookie) => cookie.name === 'nexo_csrf');
  expect(session).toMatchObject({ httpOnly: true, sameSite: 'Strict', secure: false });
  expect(refresh).toMatchObject({ httpOnly: true, sameSite: 'Strict', secure: false });
  expect(csrf).toMatchObject({ httpOnly: false, sameSite: 'Strict', secure: false });
});
