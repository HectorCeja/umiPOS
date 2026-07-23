import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CashMovementForm, DenominationCounter, QuarantineDetail } from './cash.js';

describe('Cash presentational components', () => {
  it('emits a movement intention without calculating an authoritative balance', () => {
    const submit = vi.fn();
    render(<CashMovementForm onSubmit={submit} />);
    const form = screen.getByRole('button', { name: 'Registrar movimiento' }).closest('form');
    expect(form).not.toBeNull();
    if (form === null) throw new Error('Cash movement form is missing');
    fireEvent.submit(form);
    expect(submit).toHaveBeenCalledOnce();
    expect(screen.queryByText(/saldo resultante/i)).not.toBeInTheDocument();
  });

  it('labels denomination subtotals as server results', () => {
    render(
      <DenominationCounter rows={[{ denomination: '$100', quantity: 2, subtotal: '$200' }]} />,
    );
    expect(screen.getByRole('columnheader', { name: 'Subtotal del servidor' })).toBeVisible();
  });

  it('shows only a sanitized quarantine message and disables manual replay', () => {
    render(
      <QuarantineDetail
        item={{
          eventId: 'event-1',
          eventType: 'RefundApproved',
          sourceModule: 'SALES',
          attempts: 10,
          errorCode: 'CASH_SESSION_NOT_OPEN',
          message: 'No existe una sesión compatible.',
          status: 'QUARANTINED',
        }}
      />,
    );
    expect(screen.getByText('Replay manual no disponible.')).toBeVisible();
    expect(screen.queryByText(/stack/i)).not.toBeInTheDocument();
  });
});
