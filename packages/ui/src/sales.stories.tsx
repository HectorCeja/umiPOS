import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DiagnosticBundle,
  SaleStatusBadge,
  SaleTimelineView,
  SalesMetric,
  SalesPanel,
} from './sales.js';
const meta = { title: 'Sales/Administration', component: SalesPanel } satisfies Meta<
  typeof SalesPanel
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  args: { title: 'Resumen de ventas', children: <SalesMetric label="Ventas de hoy" value="12" /> },
};
export const States: Story = {
  args: {
    title: 'Estados',
    children: (
      <>
        <SaleStatusBadge status="COMPLETED" />
        <SaleStatusBadge status="SUSPENDED" />
      </>
    ),
  },
};
export const Timeline: Story = {
  args: {
    title: 'Timeline',
    children: (
      <SaleTimelineView
        items={[
          { eventType: 'SaleCompleted', occurredAt: '2026-07-15T10:00:00Z', correlationId: 'demo' },
        ]}
      />
    ),
  },
};
export const Diagnostic: Story = {
  args: {
    title: 'Soporte',
    children: <DiagnosticBundle value={'{"saleId":"demo","secrets":false}'} />,
  },
};
