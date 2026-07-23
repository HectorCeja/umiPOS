'use client';
import { useState, type ReactNode } from 'react';

export function SalesMetric({ label, value }: { label: string; value: string }) {
  return (
    <article className="nexo-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
export function SaleStatusBadge({ status }: { status: string }) {
  const label =
    (
      {
        COMPLETED: 'Completada',
        CANCELLED: 'Cancelada',
        EXPIRED: 'Vencida',
        SUSPENDED: 'Suspendida',
        OPEN: 'Abierta',
        DRAFT: 'Borrador',
        FAILED: 'Por revisar',
        PARTIALLY_REFUNDED: 'Reembolsada parcialmente',
        REFUNDED: 'Reembolsada',
      } as Record<string, string>
    )[status] ?? 'Estado disponible';
  return (
    <span className="nexo-badge" aria-label={`Estado ${label}`}>
      {label}
    </span>
  );
}
export function SalesPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="nexo-card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function DiagnosticBundle({
  value,
  onCopy,
}: {
  value: string;
  onCopy?: () => void | Promise<void>;
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const copy = async () => {
    try {
      if (onCopy) await onCopy();
      else await navigator.clipboard.writeText(value);
      setStatus('copied');
      window.setTimeout(() => {
        setStatus('idle');
      }, 2500);
    } catch {
      setStatus('error');
    }
  };
  return (
    <div className="nexo-diagnostic">
      <details>
        <summary>Ver diagnóstico técnico</summary>
        <p>Información sanitizada para soporte autorizado.</p>
        <pre tabIndex={0} aria-label="Paquete de diagnóstico sanitizado">
          {value}
        </pre>
      </details>
      <button type="button" onClick={() => void copy()}>
        {status === 'copied' ? '✓ Copiado' : 'Copiar diagnóstico'}
      </button>
      <span role="status" aria-live="polite">
        {status === 'copied'
          ? 'Diagnóstico copiado al portapapeles.'
          : status === 'error'
            ? 'No pudimos copiarlo. Abre el diagnóstico y selecciónalo manualmente.'
            : ''}
      </span>
    </div>
  );
}
export function SaleTimelineView({
  items,
}: {
  items: readonly { eventType?: string; occurredAt?: string; correlationId?: string }[];
}) {
  const labels: Record<string, string> = {
    SaleCreated: 'Venta creada',
    SaleOpened: 'Venta abierta',
    SaleItemAdded: 'Producto agregado',
    CheckoutPrepared: 'Cobro preparado',
    InventoryReservationRequested: 'Inventario reservado',
    PaymentRecorded: 'Pago registrado',
    SaleCompleted: 'Venta completada',
    ReceiptGenerated: 'Recibo generado',
    SaleSuspended: 'Venta suspendida',
    SaleResumed: 'Venta reanudada',
    SaleCancelled: 'Venta cancelada',
    RefundRequested: 'Reembolso solicitado',
    RefundCompleted: 'Reembolso completado',
    ReceiptRegenerated: 'Recibo regenerado',
  };
  return (
    <ol className="nexo-sale-timeline" aria-label="Historial de la venta">
      {items.map((item, index) => (
        <li key={`${item.correlationId ?? 'event'}-${String(index)}`}>
          <span aria-hidden="true">✓</span>
          <div>
            <strong>{labels[item.eventType ?? ''] ?? 'Actividad de la venta'}</strong>
            <time dateTime={item.occurredAt}>
              {item.occurredAt
                ? new Intl.DateTimeFormat('es-MX', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  }).format(new Date(item.occurredAt))
                : 'Hora no disponible'}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
