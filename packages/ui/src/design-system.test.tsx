import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button, Dialog, PermissionGuard, QuantityInput, SaleTotals } from './index.js';

describe('NEXO design system contracts', () => {
  it('prevents a second submit while loading', () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Guardar
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
  it('clamps quantity at the minimum', () => {
    const Wrapper = () => {
      const [value, setValue] = useState(1);
      return <QuantityInput value={value} min={1} onValueChange={setValue} />;
    };
    render(<Wrapper />);
    fireEvent.click(screen.getByRole('button', { name: 'Disminuir cantidad' }));
    expect(screen.getByRole('spinbutton')).toHaveValue(1);
  });
  it('shows authoritative totals without calculating them', () => {
    render(
      <SaleTotals
        subtotal={{ amount: '100.00', currency: 'MXN' }}
        discount={{ amount: '10.00', currency: 'MXN' }}
        tax={{ amount: '14.40', currency: 'MXN' }}
        total={{ amount: '104.40', currency: 'MXN' }}
      />,
    );
    expect(screen.getByText('MXN 104.40')).toBeInTheDocument();
  });
  it('does not reveal guarded content', () => {
    render(
      <PermissionGuard allowed={false}>
        <span>Dato sensible</span>
      </PermissionGuard>,
    );
    expect(screen.queryByText('Dato sensible')).not.toBeInTheDocument();
  });
  it('closes a modal with Escape through its cancel contract', () => {
    const onClose = vi.fn();
    render(
      <Dialog open title="Confirmar acción" onClose={onClose}>
        Detalle
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
