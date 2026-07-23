import type { FormEvent, ReactNode } from 'react';
import { ActivityFeed, MetricCard } from './admin.js';
import { Table } from './data.js';
import {
  Alert,
  Button,
  Card,
  MoneyInput,
  Select,
  StatusBadge,
  TextArea,
  type Tone,
} from './primitives.js';

const statusTone = (status: string): Tone =>
  ['OPEN', 'AVAILABLE', 'MATCHED', 'APPROVED', 'COMPLETED', 'PUBLISHED'].includes(status)
    ? 'success'
    : ['FAILED', 'REJECTED', 'QUARANTINED', 'SHORT'].includes(status)
      ? 'danger'
      : ['PENDING', 'COUNTING', 'SUSPENDED', 'RETRYING'].some((value) => status.includes(value))
        ? 'warning'
        : 'info';

export const CashSessionStatus = ({ status }: { status: string }) => (
  <StatusBadge tone={statusTone(status)}>{cashStatusLabel(status)}</StatusBadge>
);
const cashStatusLabel = (status: string) =>
  (
    ({
      OPEN: 'Abierta',
      CLOSED: 'Cerrada',
      SUSPENDED: 'Suspendida',
      REOPENED: 'Reabierta',
      AVAILABLE: 'Disponible',
      ASSIGNED: 'Asignado',
      PENDING: 'Pendiente',
      APPROVED: 'Aprobada',
      REJECTED: 'Rechazada',
      COMPLETED: 'Completada',
      CANCELLED: 'Cancelada',
      HANDED_OVER: 'Entregado',
      CONFIRMED_MANUALLY: 'Confirmado manualmente',
      NO_ACTIVE_SESSION: 'Sin sesión abierta',
      UNAVAILABLE: 'Sin configurar',
      EMPTY: 'Sin registros',
      IN_PROGRESS: 'En proceso',
      INITIATED: 'Iniciada',
    }) as Record<string, string>
  )[status] ?? 'Estado disponible';
export const DrawerStatus = CashSessionStatus;
export const DepositStatus = CashSessionStatus;
export const VarianceBadge = ({ amount, currency }: { amount: string; currency: string }) => (
  <StatusBadge tone={amount.startsWith('-') ? 'danger' : amount === '0' ? 'success' : 'warning'}>
    Diferencia {currency} {amount}
  </StatusBadge>
);

export function RegisterCard({
  code,
  name,
  status,
}: {
  code: string;
  name: string;
  status: string;
}) {
  return (
    <Card>
      <CashSessionStatus status={status} />
      <h3>{name}</h3>
      <p>Código {code}</p>
    </Card>
  );
}

export function CashOperationalSummary({
  currency,
  expected,
  movements,
  opening,
}: {
  currency: string;
  expected: string;
  movements: string;
  opening: string;
}) {
  return (
    <section className="nexo-grid" aria-label="Resumen operativo calculado por el servidor">
      <MetricCard label="Fondo inicial" value={`${currency} ${opening}`} />
      <MetricCard label="Movimientos" value={`${currency} ${movements}`} />
      <MetricCard label="Efectivo esperado" value={`${currency} ${expected}`} />
    </section>
  );
}

export function CashMovementForm({
  disabled = false,
  onSubmit,
}: {
  disabled?: boolean;
  onSubmit?: () => void;
}) {
  return (
    <form
      className="nexo-stack"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Select
        label="Tipo de movimiento"
        options={[
          { label: 'Ingreso de efectivo', value: 'CASH_IN' },
          { label: 'Salida de efectivo', value: 'CASH_OUT' },
        ]}
      />
      <MoneyInput label="Monto" currency="MXN" required disabled={disabled} />
      <TextArea label="Motivo" required disabled={disabled} />
      <Button type="submit" disabled={disabled}>
        Registrar movimiento
      </Button>
    </form>
  );
}

export function DenominationCounter({
  rows,
}: {
  rows: readonly { denomination: string; quantity: number; subtotal: string }[];
}) {
  return (
    <Table aria-label="Conteo por denominaciones">
      <thead>
        <tr>
          <th>Denominación</th>
          <th>Cantidad</th>
          <th>Subtotal del servidor</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.denomination}>
            <td>{row.denomination}</td>
            <td>{row.quantity}</td>
            <td>{row.subtotal}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export function ReconciliationSummary({
  counted,
  expected,
  variance,
}: {
  counted: string;
  expected: string;
  variance: string;
}) {
  return (
    <Card aria-label="Reconciliación autoritativa">
      <h3>Reconciliación</h3>
      <p>Esperado: {expected}</p>
      <p>Contado: {counted}</p>
      <VarianceBadge amount={variance} currency="MXN" />
    </Card>
  );
}

export function ApprovalCard({
  action,
  requester,
  status,
  onApprove,
  onReject,
}: {
  action: string;
  requester: string;
  status: string;
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <Card>
      <CashSessionStatus status={status} />
      <h3>{action}</h3>
      <p>Solicitado por {requester}</p>
      {onApprove && onReject && (
        <div className="nexo-cluster">
          <Button onClick={onApprove}>Aprobar</Button>
          <Button variant="danger" onClick={onReject}>
            Rechazar
          </Button>
        </div>
      )}
    </Card>
  );
}

export function DepositLifecycle({ status }: { status: string }) {
  const steps = ['PREPARED', 'HANDED_OVER', 'CONFIRMED_MANUALLY'];
  const labels = ['Disponible', 'Entregado', 'Confirmado manualmente'];
  const current = Math.max(0, steps.indexOf(status));
  return (
    <ol aria-label="Ciclo del depósito" className="nexo-stepper">
      {steps.map((step, index) => (
        <li
          key={step}
          className={
            index < current ? 'is-complete' : index === current ? 'is-current' : 'is-pending'
          }
          aria-current={index === current ? 'step' : undefined}
        >
          <span className="nexo-stepper__marker">{index < current ? '✓' : index + 1}</span>
          <span>{labels[index]}</span>
        </li>
      ))}
    </ol>
  );
}

export function TransferSummary({
  amount,
  destination,
  source,
}: {
  amount: string;
  destination: string;
  source: string;
}) {
  return (
    <Card>
      <h3>Transferencia</h3>
      <p>
        {source} → {destination}
      </p>
      <strong>{amount}</strong>
    </Card>
  );
}

export function HandoffStepper({ status }: { status: string }) {
  const steps = ['INITIATED', 'COUNT_REQUIRED', 'PENDING_ACCEPTANCE', 'ACCEPTED', 'COMPLETED'];
  return (
    <ol aria-label="Cambio de custodia" className="nexo-stack">
      {steps.map((step) => (
        <li key={step} aria-current={step === status ? 'step' : undefined}>
          <CashSessionStatus status={step} />
        </li>
      ))}
    </ol>
  );
}

export function CashTimeline({
  events,
}: {
  events: readonly { id: string; title: string; detail: string }[];
}) {
  return <ActivityFeed events={events} />;
}

export function OutboxStatus({ pending, quarantined }: { pending: number; quarantined: number }) {
  return (
    <Alert
      title="Publicación de eventos"
      tone={quarantined ? 'danger' : pending ? 'warning' : 'success'}
    >
      <p aria-live="polite">
        {pending} pendientes · {quarantined} en quarantine
      </p>
    </Alert>
  );
}

export interface QuarantineItem {
  eventId: string;
  eventType: string;
  sourceModule: string;
  attempts: number;
  errorCode: string;
  message: string;
  status: string;
}
export function QuarantineTable({ items }: { items: readonly QuarantineItem[] }) {
  return (
    <Table aria-label="Eventos en quarantine">
      <thead>
        <tr>
          <th>Evento</th>
          <th>Módulo</th>
          <th>Intentos</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.eventId}>
            <td>{item.eventType}</td>
            <td>{item.sourceModule}</td>
            <td>{item.attempts}</td>
            <td>
              <CashSessionStatus status={item.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
export function QuarantineDetail({ item }: { item: QuarantineItem }) {
  return (
    <Card>
      <h3>{item.eventType}</h3>
      <p>ID {item.eventId}</p>
      <p>Código {item.errorCode}</p>
      <Alert title="Detalle sanitizado" tone="danger">
        {item.message}
      </Alert>
      <p>Replay manual no disponible.</p>
    </Card>
  );
}
export function IntegrationSinkStatus({
  deliveries,
  status,
}: {
  deliveries: number;
  status: string;
}) {
  return (
    <Card>
      <CashSessionStatus status={status} />
      <h3>Sink local UMI</h3>
      <p>{deliveries} entregas idempotentes</p>
    </Card>
  );
}

export function CashSurface({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="nexo-stack">
      <header>
        <h2>{title}</h2>
        <p>Consulta el estado confirmado y las acciones disponibles para tu cuenta.</p>
      </header>
      {children}
    </section>
  );
}
