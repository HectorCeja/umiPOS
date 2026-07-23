'use client';

import { Button, EmptyState, ErrorBoundarySurface, KpiCard, NexoIcon, Skeleton } from '@nexo/ui';
import { useEffect, useState } from 'react';
import { NexoAppShell } from '../global-shell';
import { apiFetch } from '../../lib/api-client';
import { useActiveOrganization } from '../active-organization';

const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface Overview {
  revenue: {
    grossMinor: string;
    refundedMinor: string;
    netMinor: string;
    collectedMinor: string;
  };
  sales: {
    count: number;
    averageTicketMinor: string;
    byStatus: { status: string; count: number }[];
  };
  products: {
    productId: string | null;
    productName: string | null;
    quantitySold: string;
    netMinor: string;
  }[];
}

export default function ReportsPage() {
  const activeContext = useActiveOrganization();
  const organizationId = activeContext.organization?.id ?? '';
  const branchId = activeContext.branch?.id ?? '';
  const [overview, setOverview] = useState<Overview>();
  const [error, setError] = useState(false);
  const load = async () => {
    if (!organizationId || !branchId) return;
    setError(false);
    try {
      const response = await apiFetch(
        `${api}/v1/organizations/${organizationId}/analytics/overview?branchId=${branchId}&timezone=America%2FMazatlan&interval=day`,
        { credentials: 'include' },
      );
      if (!response.ok) {
        setError(true);
        return;
      }
      setOverview((await response.json()) as Overview);
    } catch {
      setError(true);
    }
  };
  useEffect(() => {
    void load();
  }, [organizationId, branchId]);
  const completed = overview?.sales.count ?? 0;
  return (
    <NexoAppShell active="reports">
      <main className="module-page reports-page">
        <header className="module-hero">
          <div>
            <p className="overline">INTELIGENCIA OPERATIVA</p>
            <h1>Reportes</h1>
            <p>Comprende lo confirmado por tu operación sin estimaciones inventadas.</p>
          </div>
          <div className="report-period" aria-label="Periodo del reporte">
            <span>Periodo</span>
            <strong>Desde el inicio</strong>
          </div>
        </header>
        {error ? (
          <ErrorBoundarySurface
            title="No pudimos preparar los reportes"
            detail="Conservamos tu contexto. Intenta consultar nuevamente."
            action={<Button onClick={() => void load()}>Reintentar</Button>}
          />
        ) : !overview ? (
          <div className="report-loading">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : (
          <>
            <section className="report-kpis" aria-label="Indicadores confirmados">
              <KpiCard
                icon={<NexoIcon name="receipt" decorative />}
                label="Ingresos confirmados"
                value={formatMinor(overview.revenue.netMinor)}
                detail="Ventas menos devoluciones aprobadas"
                tone="accent"
              />
              <KpiCard
                icon={<NexoIcon name="chart" decorative />}
                label="Ventas"
                value={String(completed)}
                detail="Operaciones completadas"
                tone="success"
              />
              <KpiCard
                icon={<NexoIcon name="cash-register" decorative />}
                label="Ticket promedio"
                value={completed ? formatMinor(overview.sales.averageTicketMinor) : 'Sin ventas'}
                detail="Promedio de operaciones"
                tone="info"
              />
              <KpiCard
                icon={<NexoIcon name="chart" decorative />}
                label="Devoluciones"
                value={formatMinor(overview.revenue.refundedMinor)}
                detail="Compensaciones aprobadas"
                tone="warning"
              />
            </section>
            <section className="reports-grid">
              <article className="premium-card report-primary-chart">
                <header>
                  <div>
                    <p className="overline">INGRESOS</p>
                    <h2>{formatMinor(overview.revenue.netMinor)}</h2>
                  </div>
                  <span>Datos confirmados</span>
                </header>
                <EmptyState
                  title="La gráfica aparecerá con más actividad"
                  description="El total confirmado ya está arriba. Cuando existan ventas suficientes podrás comparar su evolución por periodo."
                />
              </article>
              <article className="premium-card report-statuses">
                <header>
                  <h2>Estado de ventas</h2>
                </header>
                <ul>
                  {overview.sales.byStatus.map((status) => (
                    <li key={status.status}>
                      <span>{statusLabel(status.status)}</span>
                      <strong>{status.count}</strong>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="premium-card report-insight">
                <p className="overline">LECTURA HONESTA</p>
                <h2>Tu operación está conectada</h2>
                <p>
                  Las recomendaciones aparecerán únicamente cuando exista evidencia suficiente. NEXO
                  no presenta conclusiones simuladas.
                </p>
              </article>
            </section>
          </>
        )}
      </main>
    </NexoAppShell>
  );
}

function statusLabel(value: string) {
  return (
    (
      {
        COMPLETED: 'Completadas',
        CANCELLED: 'Canceladas',
        SUSPENDED: 'Suspendidas',
        OPEN: 'Abiertas',
        EXPIRED: 'Expiradas',
      } as Record<string, string>
    )[value] ?? 'Otro estado'
  );
}

function formatMinor(value: string) {
  const minor = BigInt(value.split('.')[0] ?? '0');
  const negative = minor < 0n;
  const absolute = negative ? -minor : minor;
  const whole = new Intl.NumberFormat('es-MX').format(absolute / 100n);
  return `${negative ? '-' : ''}$${whole}.${String(absolute % 100n).padStart(2, '0')}`;
}
