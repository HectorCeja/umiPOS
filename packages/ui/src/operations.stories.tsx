import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { EmptyState } from './primitives.js';
import {
  NexoDataTable,
  NexoInlineNotice,
  NexoPagination,
  NexoSegmentedControl,
  NexoStockLevelIndicator,
  NexoToolbar,
} from './operations.js';

const meta = { title: 'Patterns/Operations', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { id: 'coffee', name: 'Café de la casa', sku: 'CAF-001', available: 32, minimum: 8 },
  { id: 'milk', name: 'Leche de avena', sku: 'LEC-012', available: 4, minimum: 10 },
];

export const InventoryTable: Story = {
  render: () => (
    <NexoDataTable
      caption="Inventario"
      rowKey={(row) => row.id}
      rows={rows}
      columns={[
        { id: 'name', label: 'Producto', render: (row) => row.name },
        { id: 'sku', label: 'SKU', render: (row) => row.sku },
        {
          id: 'stock',
          label: 'Estado',
          render: (row) => (
            <NexoStockLevelIndicator available={row.available} minimum={row.minimum} />
          ),
        },
      ]}
    />
  ),
};

export const Controls: Story = {
  render: function Render() {
    const [view, setView] = useState('grid');
    return (
      <>
        <NexoToolbar>
          <NexoSegmentedControl
            label="Vista"
            value={view}
            onChange={setView}
            options={[
              { value: 'grid', label: 'Cuadrícula' },
              { value: 'list', label: 'Lista' },
            ]}
          />
        </NexoToolbar>
        <NexoInlineNotice title="Datos confirmados">
          La interfaz no calcula balances ni publica eventos.
        </NexoInlineNotice>
        <NexoPagination page={1} pages={4} onChange={() => undefined} />
      </>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <EmptyState
      title="No hay resultados"
      description="Ajusta los filtros o crea el primer registro autorizado."
    />
  ),
};
