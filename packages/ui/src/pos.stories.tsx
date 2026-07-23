import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BarcodeCaptureField,
  Button,
  CategoryRail,
  ConnectionStatus,
  NumericKeypad,
  PaymentMethodCard,
  POSShell,
  ProductCard,
  ProductGrid,
  SaleCart,
  SaleLine,
  SaleTotals,
  type DisplayLine,
} from './index.js';
import './styles.css';

const meta = {
  title: 'Patterns/POS',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
const line: DisplayLine = {
  id: '1',
  name: 'Café americano',
  quantity: 2,
  unitAmount: { amount: '45.00', currency: 'MXN' },
  total: { amount: '90.00', currency: 'MXN' },
};
export const OperationalShell: Story = {
  render: function Example() {
    const [quantity, setQuantity] = useState(2);
    const current = {
      ...line,
      quantity,
      total: { amount: (45 * quantity).toFixed(2), currency: 'MXN' },
    };
    return (
      <POSShell
        status={
          <>
            <ConnectionStatus online />
            <strong>Sucursal Centro · Caja 1</strong>
          </>
        }
        catalog={
          <div className="nexo-stack">
            <BarcodeCaptureField onCapture={() => undefined} />
            <CategoryRail
              categories={['Todos', 'Bebidas', 'Alimentos', 'Servicios']}
              selected="Todos"
              onSelect={() => undefined}
            />
            <ProductGrid>
              {[
                'Café americano',
                'Capuchino',
                'Té frío',
                'Corte clásico',
                'Producto sin stock',
              ].map((name, index) => (
                <ProductCard
                  key={name}
                  name={name}
                  price={{ amount: index === 3 ? '180.00' : '45.00', currency: 'MXN' }}
                  availability={index === 4 ? 'No disponible' : 'Disponible'}
                  onSelect={() => undefined}
                />
              ))}
            </ProductGrid>
          </div>
        }
        cart={
          <SaleCart>
            <SaleLine line={current} onQuantityChange={setQuantity} onRemove={() => undefined} />
            <SaleTotals
              subtotal={{ amount: (45 * quantity).toFixed(2), currency: 'MXN' }}
              discount={{ amount: '0.00', currency: 'MXN' }}
              tax={{ amount: '0.00', currency: 'MXN' }}
              total={{ amount: (45 * quantity).toFixed(2), currency: 'MXN' }}
            />
            <Button style={{ width: '100%', marginTop: '1rem' }}>Cobrar</Button>
          </SaleCart>
        }
      />
    );
  },
};
export const PaymentPatterns: Story = {
  render: () => (
    <div
      className="nexo-root nexo-stack"
      data-density="touch"
      style={{ padding: '1rem', maxWidth: '50rem' }}
    >
      <h1>Registrar pago</h1>
      <div className="nexo-grid">
        <PaymentMethodCard
          label="Efectivo"
          description="Calcula el cambio"
          selected
          onSelect={() => undefined}
        />
        <PaymentMethodCard
          label="Tarjeta externa"
          description="Registra la referencia"
          onSelect={() => undefined}
        />
      </div>
      <NumericKeypad onKey={() => undefined} />
      <Button>Confirmar MXN 250.00</Button>
    </div>
  ),
};
