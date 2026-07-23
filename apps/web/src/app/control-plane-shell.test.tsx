import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ControlPlaneShell } from './control-plane-shell';
import { IdentityProvider } from './identity-provider';

const renderShell = (surface: Parameters<typeof ControlPlaneShell>[0]['surface']) =>
  render(
    <IdentityProvider>
      <ControlPlaneShell surface={surface} />
    </IdentityProvider>,
  );

describe('ControlPlaneShell', () => {
  afterEach(cleanup);
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url.endsWith('/branches')
                ? []
                : url.endsWith('/v1/organizations')
                  ? [
                      {
                        id: '10000000-0000-4000-8000-000000000001',
                        name: 'Café Horizonte',
                        status: 'ACTIVE',
                      },
                    ]
                  : url.endsWith('/identity')
                    ? {
                        displayName: 'Alpha Owner',
                        email: 'alpha.owner@nexo.local',
                        avatarUrl: 'http://localhost:3001/v1/profile/avatar/certified',
                      }
                    : {
                        name: 'Café Horizonte',
                        defaultLocale: 'es-MX',
                        defaultCurrency: 'MXN',
                        timeZone: 'America/Mazatlan',
                        version: 1,
                      },
            ),
        }),
      ),
    );
  });

  it('keeps onboarding in the unified entry point', async () => {
    renderShell('onboarding');
    expect(
      await screen.findByRole('navigation', { name: 'Navegación principal' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a Inicio' })).toHaveAttribute('href', '/');
  });

  it('uses visible labels for organization settings', async () => {
    renderShell('settings');
    expect(await screen.findByRole('textbox', { name: /Nombre comercial/ })).toHaveValue(
      'Café Horizonte',
    );
    expect(screen.getByLabelText('Zona horaria')).toBeInTheDocument();
  });

  it('uses the authenticated personal identity and avatar without replacing it with a demo name', async () => {
    const { container } = renderShell('settings');
    expect(
      await screen.findByRole('button', { name: 'Abrir menú de usuario de Alpha Owner' }),
    ).toBeInTheDocument();
    expect(container.querySelector('.profile-trigger .avatar img')).toHaveAttribute(
      'src',
      'http://localhost:3001/v1/profile/avatar/certified',
    );
  });
});
