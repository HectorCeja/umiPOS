'use client';
import { Button, KpiCard, NexoIcon, NexoSelect } from '@nexo/ui';
import { useEffect, useRef, useState } from 'react';
import { NexoAppShell } from '../global-shell';
import { apiFetch, browserReachableUrl } from '../../lib/api-client';
import { useActiveOrganization } from '../active-organization';
const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
export default function InventoryPage() {
  const activeContext = useActiveOrganization();
  const org = activeContext.organization?.id ?? '';
  const [products, setProducts] = useState<
    {
      id: string;
      name: string;
      sku?: string | null;
      type?: string;
      status: string;
      category?: { name: string } | null;
      barcodes?: { value: string }[];
      media?: { id: string; status: string; isPrimary?: boolean }[];
      variants: { id: string; name: string; sku?: string | null }[];
    }[]
  >([]);
  const [locations, setLocations] = useState<
    { id: string; name: string; code: string; type: string; active: boolean }[]
  >([]);
  const [variant, setVariant] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState<Record<string, unknown> | null>(null);
  const [movements, setMovements] = useState<unknown[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const availabilityRef = useRef<HTMLElement>(null);
  const selectedLocation = locations.find((item) => item.id === location);
  const selectedProduct = products.find((product) =>
    product.variants.some((item) => item.id === variant),
  );
  useEffect(() => {
    if (!org) return;
    void Promise.all([
      apiFetch(`${api}/v1/organizations/${org}/products`, { credentials: 'include' }),
      apiFetch(`${api}/v1/organizations/${org}/inventory/locations`, { credentials: 'include' }),
    ]).then(async ([productResponse, locationResponse]) => {
      if (productResponse.ok) setProducts((await productResponse.json()) as typeof products);
      if (locationResponse.ok) setLocations((await locationResponse.json()) as typeof locations);
      if (!productResponse.ok || !locationResponse.ok)
        setError('No pudimos cargar productos y ubicaciones autorizadas.');
    });
  }, [org]);
  async function load() {
    setError('');
    if (!variant || !location) {
      setError('Selecciona una variante y una ubicación para consultar existencias.');
      return;
    }
    setLoading(true);
    const query = `?variantId=${encodeURIComponent(variant)}&locationId=${encodeURIComponent(location)}`;
    const [a, m] = await Promise.all([
      apiFetch(`${api}/v1/organizations/${org}/inventory/availability${query}`, {
        credentials: 'include',
      }),
      apiFetch(`${api}/v1/organizations/${org}/inventory/movements${query}`, {
        credentials: 'include',
      }),
    ]);
    if (a.ok) setAvailability((await a.json()) as Record<string, unknown>);
    if (m.ok) setMovements((await m.json()) as unknown[]);
    if (!a.ok || !m.ok)
      setError(
        'No encontramos información para esa combinación. Revisa los datos e intenta de nuevo.',
      );
    setLoading(false);
    if (a.ok) {
      window.requestAnimationFrame(() => {
        const target = availabilityRef.current;
        if (!target) return;
        target.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
          block: 'start',
        });
        target.focus({ preventScroll: true });
        setHighlighted(true);
        window.setTimeout(() => {
          setHighlighted(false);
        }, 1800);
      });
    }
  }
  return (
    <NexoAppShell active="inventory">
      <main className="module-page inventory-page">
        <header className="module-hero">
          <div>
            <p className="overline">CONTROL DE EXISTENCIAS</p>
            <h1>Inventario</h1>
            <p>Disponibilidad y movimientos confirmados por Inventory.</p>
          </div>
          <a
            className="nexo-button nexo-button--secondary module-hero__optical-action"
            href="/products"
          >
            Abrir productos
          </a>
        </header>
        <section className="inventory-kpis" aria-label="Resumen de inventario">
          <KpiCard
            icon={<NexoIcon name="package" decorative />}
            label="Producto consultado"
            value={selectedProduct?.name ?? (variant ? 'Seleccionado' : 'Pendiente')}
            detail="Producto o presentación elegida"
            tone="accent"
          />
          <KpiCard
            icon={<NexoIcon name="warehouse" decorative />}
            label="Ubicación"
            value={selectedLocation?.name ?? 'Sin elegir'}
            detail={selectedLocation ? selectedLocation.code : 'Contexto operativo'}
            tone="info"
          />
          <KpiCard
            icon={<NexoIcon name="chart" decorative />}
            label="Movimientos"
            value={String(movements.length)}
            detail="Resultados confirmados"
            tone="success"
          />
        </section>
        <section className="premium-card inventory-query inventory-toolbar">
          <NexoSelect
            className="inventory-select-field"
            label="Producto o presentación"
            value={variant}
            onValueChange={setVariant}
            placeholder="Selecciona un producto"
            searchable
            searchPlaceholder="Buscar por nombre, SKU o presentación…"
            emptyMessage="No encontramos productos con ese nombre."
            emptyAction={<a href="/products">Abrir Productos</a>}
            options={products.flatMap((product) =>
              product.variants.map((item) => {
                const media = product.media?.find((candidate) => candidate.status === 'ACTIVE');
                return {
                  value: item.id,
                  label: `${product.name}${item.name === 'Default' ? '' : ` — ${item.name}`}`,
                  description: item.sku ?? product.sku ?? 'Sin SKU comercial',
                  metadata: product.category?.name ?? product.type ?? 'Producto',
                  keywords: [
                    product.name,
                    item.name,
                    item.sku ?? '',
                    product.sku ?? '',
                    product.category?.name ?? '',
                    ...(product.barcodes ?? []).map((barcode) => barcode.value),
                  ],
                  icon: <NexoIcon name="package" decorative />,
                  ...(media
                    ? {
                        image: String(
                          browserReachableUrl(
                            `${api}/v1/organizations/${org}/products/${product.id}/media/${media.id}`,
                          ),
                        ),
                      }
                    : {}),
                  badge:
                    product.status === 'ACTIVE' && product.type === 'PHYSICAL'
                      ? 'Inventariable'
                      : 'No disponible',
                  disabled: product.status !== 'ACTIVE' || product.type !== 'PHYSICAL',
                };
              }),
            )}
          />
          <NexoSelect
            className="inventory-select-field"
            label="Ubicación de inventario"
            value={location}
            onValueChange={setLocation}
            placeholder="Selecciona una ubicación"
            searchable={locations.length > 8}
            searchPlaceholder="Buscar ubicación…"
            emptyMessage="Todavía no hay ubicaciones disponibles."
            emptyAction={<a href="/control-plane/inventory-locations">Crear ubicación</a>}
            options={locations.map((item) => ({
              value: item.id,
              label: item.name,
              description: `${item.code} · ${item.type}`,
              keywords: [item.name, item.code, item.type],
              icon: <NexoIcon name="warehouse" decorative />,
              disabled: !item.active,
            }))}
          />
          <div className="inventory-query__action">
            <span aria-hidden="true">Acción</span>
            <Button disabled={!variant || !location} onClick={() => void load()}>
              Consultar existencias
            </Button>
          </div>
        </section>
        {error && (
          <div className="human-empty" role="status">
            <strong>Necesitamos un poco más de información</strong>
            <p>{error}</p>
            <a href="/products">Abrir Productos</a>
          </div>
        )}
        <section className="inventory-workspace">
          <article
            ref={availabilityRef}
            className={`premium-card inventory-availability${highlighted ? ' is-highlighted' : ''}`}
            tabIndex={-1}
            aria-busy={loading}
          >
            <header>
              <div>
                <p className="overline">DISPONIBILIDAD</p>
                <h2>Saldo por estado</h2>
              </div>
              <span className="inventory-state">Dato autoritativo</span>
            </header>
            {loading ? (
              <div
                className="inventory-facts inventory-facts--skeleton"
                aria-label="Consultando saldos"
              >
                {[0, 1, 2, 3].map((item) => (
                  <div className="nexo-skeleton" key={item} aria-hidden="true" />
                ))}
              </div>
            ) : availability ? (
              <dl className="inventory-facts">
                {inventoryFacts(availability).map(([label, value]) => (
                  <div key={label} data-state={inventoryTone(label)}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                    <small>{inventoryDescription(label)}</small>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="human-empty">
                <strong>Selecciona producto y ubicación</strong>
                <p>
                  En mano es el total físico; Disponible descuenta reservas; Reservado está
                  comprometido para operaciones pendientes.
                </p>
              </div>
            )}
          </article>
          <article className="premium-card inventory-movements">
            <header>
              <div>
                <p className="overline">TRAZABILIDAD</p>
                <h2>Movimientos recientes</h2>
              </div>
            </header>
            {movements.length ? (
              <ol>
                {movements.slice(0, 8).map((movement, index) => (
                  <li key={index}>
                    <span aria-hidden="true">↗</span>
                    <div>
                      <strong>Movimiento confirmado</strong>
                      <small>{movementSummary(movement)}</small>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="human-empty">
                <strong>No hay movimientos todavía</strong>
                <p>La actividad aparecerá al registrar operaciones autorizadas.</p>
              </div>
            )}
          </article>
        </section>
      </main>
    </NexoAppShell>
  );
}

function inventoryTone(label: string) {
  if (label === 'Disponible' || label === 'En existencia') return 'success';
  if (label === 'Dañado' || label === 'En cuarentena') return 'danger';
  if (label === 'Reservado' || label === 'Comprometido') return 'warning';
  return 'info';
}

function inventoryDescription(label: string) {
  const descriptions: Record<string, string> = {
    'En existencia': 'Total físico confirmado en esta ubicación.',
    Disponible: 'Unidades listas para vender o utilizar.',
    Reservado: 'Apartado para operaciones todavía pendientes.',
    Comprometido: 'Confirmado para una operación en curso.',
    'En tránsito': 'Unidades que están cambiando de ubicación.',
    Dañado: 'Unidades separadas por daño.',
    'En cuarentena': 'Unidades pendientes de revisión.',
  };
  return descriptions[label] ?? 'Saldo confirmado para este estado.';
}

function inventoryFacts(value: Record<string, unknown>): [string, string][] {
  const labels: Record<string, string> = {
    onHand: 'En existencia',
    available: 'Disponible',
    reserved: 'Reservado',
    committed: 'Comprometido',
    inTransit: 'En tránsito',
    damaged: 'Dañado',
    quarantine: 'En cuarentena',
  };
  const facts = Object.entries(value)
    .filter(([, item]) => ['string', 'number', 'bigint'].includes(typeof item))
    .slice(0, 8);
  return facts.length
    ? facts.map(([key, item]) => [labels[key] ?? 'Estado confirmado', String(item)])
    : [['Estado', 'Sin cantidades disponibles']];
}

function movementSummary(value: unknown) {
  if (!value || typeof value !== 'object') return 'Movimiento registrado por Inventory.';
  const record = value as Record<string, unknown>;
  const quantity =
    typeof record.quantity === 'number' || typeof record.quantity === 'string'
      ? String(record.quantity)
      : '';
  return quantity
    ? `${quantity} unidades · Consulta el detalle autorizado.`
    : 'Consulta el detalle autorizado.';
}
