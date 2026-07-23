'use client';
import { openApiOperations } from '@nexo/sdk';
import {
  Alert,
  Button,
  DiagnosticBundle,
  SaleStatusBadge,
  SaleTimelineView,
  SalesMetric,
  SalesPanel,
  TextField,
  PremiumToastPortal,
} from '@nexo/ui';
import { NexoEditorialHeader } from '../nexo-editorial-header';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SectionNavigation } from '../section-navigation';
import { apiFetch, browserUuid } from '../../lib/api-client';
import { useActiveOrganization } from '../active-organization';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const route = (template: string, values: Record<string, string>) =>
  Object.entries(values).reduce(
    (path, [key, value]) => path.replace(`{${key}}`, encodeURIComponent(value)),
    template,
  );
interface Sale {
  id: string;
  folio?: string;
  status: string;
  branchId: string;
  currency: string;
  version: number;
  createdAt: string;
}
interface Page {
  items: Sale[];
  total: number;
  page: number;
  pageSize: number;
}
export function SalesAdministrationConsole() {
  const activeContext = useActiveOrganization();
  const organizationId = activeContext.organization?.id ?? '';
  const branchId = activeContext.branch?.id ?? '';
  const [search, setSearch] = useState('');
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null),
    [history, setHistory] = useState<Page>({ items: [], total: 0, page: 1, pageSize: 25 }),
    [detail, setDetail] = useState<{
      items?: Record<string, unknown>[];
      payments?: Record<string, unknown>[];
      receipts?: Record<string, unknown>[];
    } | null>(null),
    [timeline, setTimeline] = useState<
      { eventType?: string; occurredAt?: string; correlationId?: string }[]
    >([]),
    [exceptions, setExceptions] = useState<unknown[]>([]),
    [diagnostic, setDiagnostic] = useState('');
  const [selected, setSelected] = useState<Sale | null>(null),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [loading, setLoading] = useState(false);
  const [organizationName, setOrganizationName] = useState('Organización activa');
  const [branchName, setBranchName] = useState('Sucursal activa');
  const detailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!organizationId || !branchId) return;
    void Promise.all([
      apiFetch(`${apiBase}/v1/organizations/${organizationId}`),
      apiFetch(`${apiBase}/v1/organizations/${organizationId}/branches`),
    ]).then(async ([organizationResponse, branchesResponse]) => {
      if (organizationResponse.ok) {
        const organization = (await organizationResponse.json()) as { name?: unknown };
        if (typeof organization.name === 'string') setOrganizationName(organization.name);
      }
      if (branchesResponse.ok) {
        const payload: unknown = await branchesResponse.json();
        const active = Array.isArray(payload)
          ? (payload as { id?: unknown; name?: unknown }[]).find((branch) => branch.id === branchId)
          : undefined;
        if (typeof active?.name === 'string') setBranchName(active.name);
      }
    });
  }, [branchId, organizationId]);
  const get = useCallback(
    async (template: string, extra: Record<string, string> = {}) => {
      const url = new URL(`${apiBase}${route(template, { organizationId, ...extra })}`);
      url.searchParams.set('branchId', branchId);
      if (search) url.searchParams.set('search', search);
      const response = await apiFetch(url, { credentials: 'include' });
      if (!response.ok)
        throw new Error(
          response.status === 403
            ? 'No tienes permiso para consultar esta información.'
            : 'El servicio de Ventas no está disponible en este momento. Intenta de nuevo.',
        );
      return response.json() as Promise<unknown>;
    },
    [branchId, organizationId, search],
  );
  const refresh = useCallback(async () => {
    if (!organizationId || !branchId) return;
    setLoading(true);
    setError('');
    try {
      const [o, h, e] = await Promise.all([
        get(openApiOperations.getSalesOverview.path),
        get(openApiOperations.searchSalesAdministration.path),
        get(openApiOperations.getSalesOperationalExceptions.path),
      ]);
      setOverview(o as Record<string, unknown>);
      setHistory(h as Page);
      setExceptions((e as { items: unknown[] }).items);
    } catch (c) {
      setError(c instanceof Error ? c.message : 'No pudimos cargar Ventas.');
    } finally {
      setLoading(false);
    }
  }, [get]);
  const refreshAndReveal = async () => {
    await refresh();
    const node = document.getElementById('sales-overview');
    if (!node) return;
    node.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    node.setAttribute('tabindex', '-1');
    node.focus({ preventScroll: true });
    node.classList.add('is-revealed');
    window.setTimeout(() => {
      node.classList.remove('is-revealed');
    }, 1800);
  };
  const open = async (sale: Sale) => {
    setSelected(sale);
    setError('');
    try {
      const [d, t, b] = await Promise.all([
        get(openApiOperations.getSaleAdministrationDetail.path, { saleId: sale.id }),
        get(openApiOperations.getSaleAdministrationTimeline.path, { saleId: sale.id }),
        get(openApiOperations.getSaleDiagnosticBundle.path, { saleId: sale.id }),
      ]);
      setDetail(d as typeof detail);
      setTimeline((t as { items: typeof timeline }).items);
      setDiagnostic(JSON.stringify(b, null, 2));
      requestAnimationFrame(() => {
        detailRef.current?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        });
        detailRef.current?.focus({ preventScroll: true });
      });
    } catch (c) {
      setError(c instanceof Error ? c.message : 'No pudimos abrir la venta.');
    }
  };
  const csrf = () =>
    document.cookie
      .split('; ')
      .find((v) => v.startsWith('nexo_csrf='))
      ?.slice(10) ?? '';
  const command = async (template: string, body: Record<string, unknown>, version?: number) => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch(
        `${apiBase}${route(template, { organizationId, saleId: selected.id })}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'content-type': 'application/json',
            'x-csrf-token': csrf(),
            'idempotency-key': browserUuid(),
            ...(version ? { 'if-match': String(version) } : {}),
          },
          body: JSON.stringify(body),
        },
      );
      if (!response.ok)
        throw new Error(
          response.status === 409
            ? 'La venta cambió. Actualiza antes de reintentar.'
            : response.status === 403
              ? 'La operación no está autorizada.'
              : 'No pudimos completar la operación. Intenta de nuevo.',
        );
      const result: unknown = await response.json();
      const updated =
        result && typeof result === 'object' && 'id' in result && 'status' in result
          ? ({ ...selected, ...(result as Partial<Sale>) } as Sale)
          : selected;
      setSelected(updated);
      const receipt = template === openApiOperations.generateSaleReceipt.path;
      setNotice(receipt ? 'Recibo recuperado para reimpresión.' : 'La operación fue confirmada.');
      await refresh();
      await open(updated);
    } catch (c) {
      setError(c instanceof Error ? c.message : 'No pudimos completar la operación.');
    } finally {
      setLoading(false);
    }
  };
  const counts =
    (overview?.statuses as { status: string; _count: { _all: number } }[] | undefined) ?? [];
  const canSuspend = selected?.status === 'OPEN';
  const canResume = selected?.status === 'SUSPENDED';
  const canCancel = selected?.status === 'OPEN' || selected?.status === 'SUSPENDED';
  const canReceipt = selected?.status === 'COMPLETED' || selected?.status === 'PARTIALLY_REFUNDED';
  return (
    <section className="module-surface sales-premium" data-module="sales">
      <NexoEditorialHeader
        eyebrow="OPERACIÓN COMERCIAL"
        title="Ventas"
        description="Consulta, auditoría y acciones administrativas sobre resultados autoritativos."
        statement={
          <>
            Cada venta,
            <br />
            bajo control.
          </>
        }
        tone="sales"
        actions={
          <Button loading={loading} onClick={() => void refreshAndReveal()}>
            Actualizar
          </Button>
        }
      />
      <SectionNavigation
        items={[
          { id: 'sales-overview', label: 'Resumen' },
          { id: 'sales-history', label: 'Historial' },
          { id: 'sales-detail', label: 'Detalle' },
          { id: 'sales-exceptions', label: 'Excepciones' },
        ]}
      />
      <div className="business-context" aria-label="Contexto de operación">
        <span>
          <small>Organización</small>
          <strong>{organizationName}</strong>
        </span>
        <span>
          <small>Sucursal</small>
          <strong>{branchName}</strong>
        </span>
        <span>
          <small>Sesión</small>
          <strong>En línea</strong>
        </span>
      </div>
      <div className="nexo-grid">
        <TextField
          label="Folio, SKU, código de barras o producto"
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
          }}
        />
      </div>
      {error && (
        <PremiumToastPortal
          title="No se pudo completar"
          detail={error}
          tone="danger"
          onDismiss={() => {
            setError('');
          }}
        />
      )}
      {notice && (
        <PremiumToastPortal
          title="Operación completada"
          detail={notice}
          tone="success"
          onDismiss={() => {
            setNotice('');
          }}
          action={
            notice === 'Recibo recuperado para reimpresión.' && selected ? (
              <a className="sales-receipt-link" href={`/sales/${selected.id}/receipt`}>
                Ver recibo
              </a>
            ) : null
          }
        />
      )}
      <div id="sales-overview">
        <SalesPanel title="Resumen operativo">
          <div className="nexo-grid">
            {counts.map((row) => (
              <SalesMetric
                key={row.status}
                label={statusLabel(row.status)}
                value={String(row._count._all)}
              />
            ))}
            <SalesMetric
              label="Operaciones por procesar"
              value={
                typeof overview?.pendingOutbox === 'number'
                  ? String(overview.pendingOutbox)
                  : 'Sin datos todavía'
              }
            />
          </div>
        </SalesPanel>
      </div>
      <div id="sales-history">
        <SalesPanel title={`Historial (${String(history.total)})`}>
          <div role="region" aria-label="Historial de ventas" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Moneda</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {history.items.map((s) => (
                  <tr key={s.id}>
                    <td>{s.folio ?? 'Folio pendiente'}</td>
                    <td>{formatDate(s.createdAt)}</td>
                    <td>
                      <SaleStatusBadge status={s.status} />
                    </td>
                    <td>{s.currency}</td>
                    <td>
                      <Button onClick={() => void open(s)}>Revisar</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SalesPanel>
      </div>
      {selected && (
        <div id="sales-detail" ref={detailRef} tabIndex={-1} className="sales-detail-focus">
          <SalesPanel title={`Detalle ${selected.folio ?? 'seleccionado'}`}>
            <p>
              Información confirmada de la venta. Los detalles técnicos están disponibles para
              soporte.
            </p>
            <div className="sales-summary" aria-label="Resumen de la venta">
              <div>
                <span>Folio</span>
                <strong>{selected.folio ?? 'Pendiente'}</strong>
              </div>
              <div>
                <span>Estado</span>
                <SaleStatusBadge status={selected.status} />
              </div>
              <div>
                <span>Fecha</span>
                <strong>{formatDate(selected.createdAt)}</strong>
              </div>
              <div>
                <span>Moneda</span>
                <strong>{selected.currency}</strong>
              </div>
              <div>
                <span>Productos</span>
                <strong>{String(detail?.items?.length ?? 0)}</strong>
              </div>
              <div>
                <span>Pagos</span>
                <strong>{String(detail?.payments?.length ?? 0)}</strong>
              </div>
              <div>
                <span>Recibos</span>
                <strong>{String(detail?.receipts?.length ?? 0)}</strong>
              </div>
            </div>
            <h3>Productos</h3>
            {detail?.items?.length ? (
              <div className="sales-line-list">
                {detail.items.map((item, index) => {
                  const snapshot = (item.displaySnapshot ?? {}) as Record<string, unknown>;
                  const itemId = typeof item.id === 'string' ? item.id : String(index);
                  const productName =
                    typeof snapshot.name === 'string'
                      ? snapshot.name
                      : typeof item.name === 'string'
                        ? item.name
                        : 'Producto';
                  const variantName =
                    typeof snapshot.variantName === 'string'
                      ? snapshot.variantName
                      : typeof item.sku === 'string'
                        ? item.sku
                        : 'Presentación estándar';
                  const quantity =
                    typeof item.quantity === 'string' || typeof item.quantity === 'number'
                      ? String(item.quantity)
                      : '1';
                  return (
                    <article key={itemId}>
                      <div>
                        <strong>{productName}</strong>
                        <small>{variantName}</small>
                      </div>
                      <span>{quantity} unidad(es)</span>
                      <strong>
                        {formatMinor(item.lineTotalMinor ?? item.totalMinor, selected.currency)}
                      </strong>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="human-empty">Esta venta no tiene productos disponibles para mostrar.</p>
            )}
            <h3>Acciones disponibles</h3>
            <div className="sales-actions">
              <Button
                disabled={!canSuspend || loading}
                title={!canSuspend ? 'Solo puedes suspender una venta abierta.' : undefined}
                onClick={() =>
                  void command(openApiOperations.suspendSale.path, {}, selected.version)
                }
              >
                Suspender
              </Button>
              <Button
                disabled={!canResume || loading}
                title={!canResume ? 'Solo puedes reanudar una venta suspendida.' : undefined}
                onClick={() =>
                  void command(openApiOperations.resumeSale.path, {}, selected.version)
                }
              >
                Reanudar
              </Button>
              <Button
                disabled={!canCancel || loading}
                title={
                  !canCancel ? 'Esta venta ya no puede cancelarse como venta abierta.' : undefined
                }
                onClick={() =>
                  void command(
                    openApiOperations.cancelSale.path,
                    { reason: 'Cancelación administrativa autorizada' },
                    selected.version,
                  )
                }
              >
                Cancelar abierta
              </Button>
              <Button
                disabled={!canReceipt || loading}
                title={
                  !canReceipt
                    ? 'El recibo está disponible después de completar la venta.'
                    : undefined
                }
                onClick={() => void command(openApiOperations.generateSaleReceipt.path, {})}
              >
                Preparar reimpresión
              </Button>
            </div>
            <p className="disabled-action-help">
              Las acciones no compatibles con el estado actual permanecen deshabilitadas para evitar
              conflictos.
            </p>
            <h3>Historial</h3>
            <SaleTimelineView items={timeline} />
            <DiagnosticBundle
              value="Diagnóstico disponible para soporte autorizado."
              onCopy={() => navigator.clipboard.writeText(diagnostic)}
            />
          </SalesPanel>
        </div>
      )}
      <div id="sales-exceptions">
        <SalesPanel title="Excepciones operativas">
          {exceptions.length ? (
            <div className="sales-exception-list">
              {exceptions.map((_, index) => (
                <article key={index}>
                  <strong>Operación que necesita atención</strong>
                  <p>Revisa el estado de la venta y sigue la acción recomendada.</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="human-empty">
              <strong>No hay excepciones por revisar</strong>
              <p>Cuando una operación necesite atención aparecerá aquí con una acción clara.</p>
            </div>
          )}
          <p>Mostramos sólo la información necesaria para resolver cada caso.</p>
        </SalesPanel>
      </div>
      <Alert title="Ventas desde dispositivos autorizados" tone="info">
        Este panel administrativo no es terminal POS. Venta manual deshabilitada: la creación de
        ventas está reservada para dispositivos de cobro autorizados.
      </Alert>
    </section>
  );
}

function statusLabel(value: string) {
  return (
    (
      {
        COMPLETED: 'Completadas',
        CANCELLED: 'Canceladas',
        EXPIRED: 'Vencidas',
        SUSPENDED: 'Suspendidas',
        OPEN: 'Abiertas',
        DRAFT: 'Borradores',
        FAILED: 'Por revisar',
      } as Record<string, string>
    )[value] ?? 'Estado por revisar'
  );
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Mazatlan',
  }).format(new Date(value));
}
function formatMinor(value: unknown, currency: string) {
  const minor = typeof value === 'string' || typeof value === 'number' ? Number(value) : 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(minor / 100);
}
