import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { SalesAdministrationConsole } from './sales-administration-console';
vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve(
      new Response(
        JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          pageSize: 25,
          statuses: [],
          pendingOutbox: 0,
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    ),
  ),
);
describe('Sales administration console', () => {
  test('presents friendly business context without exposing a checkout action', () => {
    render(<SalesAdministrationConsole />);
    expect(screen.getByRole('heading', { name: 'Ventas' })).toBeInTheDocument();
    expect(screen.getByText('Organización activa')).toBeInTheDocument();
    expect(screen.getByText(/dispositivos de cobro autorizados/i)).toBeInTheDocument();
    expect(screen.queryByText(/cobrar ahora/i)).not.toBeInTheDocument();
  });
});
