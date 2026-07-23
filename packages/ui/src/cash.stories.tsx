import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './primitives.js';
import {
  ApprovalCard,
  CashMovementForm,
  CashOperationalSummary,
  CashSessionStatus,
  CashSurface,
  CashTimeline,
  DenominationCounter,
  DepositLifecycle,
  HandoffStepper,
  IntegrationSinkStatus,
  OutboxStatus,
  QuarantineDetail,
  QuarantineTable,
  ReconciliationSummary,
  RegisterCard,
  TransferSummary,
} from './cash.js';

const meta: Meta<typeof CashSessionStatus> = {
  title: 'Patterns/Cash',
  component: CashSessionStatus,
};
export default meta;
type Story = StoryObj<typeof meta>;
const quarantine = {
  eventId: 'evt_01',
  eventType: 'RefundApproved',
  sourceModule: 'SALES',
  attempts: 10,
  errorCode: 'CASH_SESSION_NOT_OPEN',
  message:
    'No existe una sesión compatible. Revisa la sucursal y vuelve a intentar mediante el procedimiento autorizado.',
  status: 'QUARANTINED',
};

export const Overview: Story = {
  render: () => (
    <CashSurface title="Caja">
      <CashOperationalSummary
        currency="MXN"
        opening="1,000.00"
        movements="2,450.00"
        expected="3,450.00"
      />
      <div className="nexo-grid">
        <RegisterCard name="Caja principal" code="REG-01" status="OPEN" />
        <IntegrationSinkStatus deliveries={18} status="HEALTHY" />
      </div>
      <OutboxStatus pending={0} quarantined={0} />
    </CashSurface>
  ),
};
export const Operations: Story = {
  render: () => (
    <CashSurface title="Operación">
      <CashMovementForm />
      <DenominationCounter
        rows={[
          { denomination: '$500', quantity: 4, subtotal: '$2,000' },
          { denomination: '$100', quantity: 10, subtotal: '$1,000' },
        ]}
      />
      <ReconciliationSummary expected="$3,000" counted="$3,000" variance="0" />
    </CashSurface>
  ),
};
export const ApprovalsAndDeposits: Story = {
  render: () => (
    <CashSurface title="Aprobaciones y depósitos">
      <ApprovalCard action="Retiro de efectivo" requester="Ana Operadora" status="PENDING" />
      <DepositLifecycle status="HANDED_OVER" />
      <TransferSummary source="Caja 1" destination="Caja 2" amount="MXN 500.00" />
    </CashSurface>
  ),
};
export const Handoff: Story = {
  render: () => (
    <CashSurface title="Cambio de turno">
      <HandoffStepper status="PENDING_ACCEPTANCE" />
      <CashTimeline
        events={[
          { id: '1', title: 'Conteo completado', detail: 'El backend confirmó MXN 3,000.00.' },
        ]}
      />
    </CashSurface>
  ),
};
export const Quarantine: Story = {
  render: () => (
    <CashSurface title="Quarantine">
      <OutboxStatus pending={2} quarantined={1} />
      <QuarantineTable items={[quarantine]} />
      <QuarantineDetail item={quarantine} />
    </CashSurface>
  ),
};
export const LoadingAndError: Story = {
  render: () => (
    <CashSurface title="Estados">
      <Card aria-busy="true">Cargando estado autoritativo…</Card>
      <OutboxStatus pending={1} quarantined={1} />
      <CashMovementForm disabled />
    </CashSurface>
  ),
};
