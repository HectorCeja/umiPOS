import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Badge, Button, Card, MoneyInput, QuantityInput, StatusBadge } from './primitives.js';

export interface DisplayMoney {
  amount: string;
  currency: string;
}
export interface DisplayLine {
  id: string;
  name: string;
  quantity: number;
  unitAmount: DisplayMoney;
  total: DisplayMoney;
}
const money = ({ amount, currency }: DisplayMoney) => `${currency} ${amount}`;
export function POSShell({
  catalog,
  cart,
  status,
}: {
  catalog: ReactNode;
  cart: ReactNode;
  status?: ReactNode;
}) {
  return (
    <div className="nexo-root nexo-pos-shell">
      <main>
        <div className="nexo-toolbar">{status}</div>
        {catalog}
      </main>
      <aside className="nexo-card nexo-cart" aria-label="Venta actual">
        {cart}
      </aside>
    </div>
  );
}
export const ProductGrid = ({ children }: { children: ReactNode }) => (
  <div className="nexo-product-grid">{children}</div>
);
export function ProductCard({
  availability,
  category,
  icon,
  imageAlt,
  imageSrc,
  name,
  onSelect,
  price,
  status,
  typeLabel,
}: {
  availability?: string;
  category?: string;
  icon?: ReactNode;
  imageAlt?: string;
  imageSrc?: string;
  name: string;
  onSelect: () => void;
  price?: DisplayMoney;
  status?: string;
  typeLabel?: string;
}) {
  const hasImage = Boolean(imageSrc);
  const hasVisual = Boolean(imageSrc ?? icon);

  return (
    <button
      type="button"
      className="nexo-card nexo-product-card product-catalog-card"
      data-has-image={hasImage ? 'true' : 'false'}
      onClick={onSelect}
    >
      {hasVisual && (
        <span className="nexo-product-card__media">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={imageAlt ?? name}
              onError={(event) => {
                event.currentTarget.hidden = true;
                event.currentTarget.parentElement?.setAttribute('data-image-failed', 'true');
                event.currentTarget.nextElementSibling?.removeAttribute('hidden');
              }}
            />
          )}
          <span
            className="nexo-product-card__fallback"
            hidden={Boolean(imageSrc)}
            aria-hidden="true"
          >
            {icon}
          </span>
          {imageSrc && (
            <span className="nexo-product-card__type" title={typeLabel} aria-label={typeLabel}>
              {icon}
            </span>
          )}
        </span>
      )}
      <span className="nexo-product-card__content">
        <strong>{name}</strong>
        {Boolean(category ?? price) && (
          <small>{[category, price ? money(price) : ''].filter(Boolean).join(' · ')}</small>
        )}
        {availability && <small>{availability}</small>}
        {status && <span className="nexo-product-card__status">{status}</span>}
      </span>
    </button>
  );
}
export function ProductListItem(props: Parameters<typeof ProductCard>[0]) {
  return <ProductCard {...props} />;
}
export function CategoryRail({
  categories,
  selected,
  onSelect,
}: {
  categories: readonly string[];
  selected?: string;
  onSelect: (category: string) => void;
}) {
  return (
    <nav aria-label="Categorías" className="nexo-cluster">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selected === category ? 'primary' : 'secondary'}
          onClick={() => {
            onSelect(category);
          }}
        >
          {category}
        </Button>
      ))}
    </nav>
  );
}
export function SaleCart({
  children,
  title = 'Venta actual',
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function SaleLine({
  line,
  onQuantityChange,
  onRemove,
}: {
  line: DisplayLine;
  onQuantityChange?: (value: number) => void;
  onRemove?: () => void;
}) {
  return (
    <div className="nexo-sale-line">
      <div>
        <strong>{line.name}</strong>
        <small>{money(line.unitAmount)} c/u</small>
      </div>
      {onQuantityChange ? (
        <QuantityInput value={line.quantity} min={1} onValueChange={onQuantityChange} />
      ) : (
        <span>{line.quantity}</span>
      )}
      <div>
        <strong>{money(line.total)}</strong>
        {onRemove && (
          <Button variant="secondary" onClick={onRemove}>
            Quitar
          </Button>
        )}
      </div>
    </div>
  );
}
export const QuantityEditor = QuantityInput;
export interface SaleTotalsProps {
  subtotal: DisplayMoney;
  discount: DisplayMoney;
  tax: DisplayMoney;
  total: DisplayMoney;
}
export function SaleTotals({ discount, subtotal, tax, total }: SaleTotalsProps) {
  return (
    <dl className="nexo-totals" aria-label="Totales calculados por el servidor">
      <dt>Subtotal</dt>
      <dd>{money(subtotal)}</dd>
      <dt>Descuentos</dt>
      <dd>− {money(discount)}</dd>
      <dt>Impuestos</dt>
      <dd>{money(tax)}</dd>
      <dt className="nexo-total-final">Total</dt>
      <dd className="nexo-total-final">{money(total)}</dd>
    </dl>
  );
}
export const CheckoutSummary = SaleTotals;
export function PaymentMethodCard({
  description,
  label,
  selected,
  onSelect,
}: {
  description: string;
  label: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className="nexo-card nexo-payment-method-card"
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <strong>{label}</strong>
      <span>{description}</span>
    </button>
  );
}
export function CashTenderInput(props: Omit<React.ComponentProps<typeof MoneyInput>, 'label'>) {
  return <MoneyInput label="Efectivo recibido" {...props} />;
}
export function NumericKeypad({ onKey }: { onKey: (key: string) => void }) {
  return (
    <div className="nexo-keypad" role="group" aria-label="Teclado numérico">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '⌫'].map((key) => (
        <Button
          variant="secondary"
          key={key}
          onClick={() => {
            onKey(key);
          }}
        >
          {key}
        </Button>
      ))}
    </div>
  );
}
export function MixedPaymentAllocation({
  allocations,
}: {
  allocations: readonly { id: string; method: string; amount: DisplayMoney; status: string }[];
}) {
  return (
    <ul>
      {allocations.map((allocation) => (
        <li key={allocation.id} className="nexo-cluster">
          <strong>{allocation.method}</strong>
          <span>{money(allocation.amount)}</span>
          <Badge>{allocation.status}</Badge>
        </li>
      ))}
    </ul>
  );
}
export function SuspendedSaleCard({
  folio,
  total,
  onResume,
}: {
  folio: string;
  total: DisplayMoney;
  onResume: () => void;
}) {
  return (
    <Card>
      <strong>Venta {folio}</strong>
      <p>{money(total)}</p>
      <Button onClick={onResume}>Recuperar venta</Button>
    </Card>
  );
}
export function InventoryAvailabilityBadge({
  state,
  quantity,
}: {
  state: 'available' | 'low' | 'unavailable';
  quantity?: string;
}) {
  const tone = state === 'available' ? 'success' : state === 'low' ? 'warning' : 'danger';
  const label =
    state === 'available' ? 'Disponible' : state === 'low' ? 'Pocas unidades' : 'No disponible';
  return (
    <StatusBadge tone={tone}>
      {label}
      {quantity ? ` · ${quantity}` : ''}
    </StatusBadge>
  );
}
export function ReceiptPreview({ children, folio }: { children: ReactNode; folio: string }) {
  return (
    <article className="nexo-card" aria-label={`Vista previa del recibo ${folio}`}>
      <header>
        <strong>NEXO · {folio}</strong>
      </header>
      {children}
    </article>
  );
}
export function ConnectionStatus({ online }: { online: boolean }) {
  return (
    <span className="nexo-connection" role="status" aria-live="polite">
      {online ? 'En línea' : 'Sin conexión · no cierres esta venta'}
    </span>
  );
}
export function SyncQueueIndicator({ pending }: { pending: number }) {
  return (
    <StatusBadge tone={pending ? 'warning' : 'success'}>
      {pending ? `${String(pending)} operaciones pendientes` : 'Todo sincronizado'}
    </StatusBadge>
  );
}
export function SupervisorApprovalPrompt({
  action,
  onRequest,
}: {
  action: string;
  onRequest: () => void;
}) {
  return (
    <Card>
      <h3>Se requiere autorización</h3>
      <p>Un supervisor debe aprobar: {action}.</p>
      <Button onClick={onRequest}>Solicitar autorización</Button>
    </Card>
  );
}
export function BarcodeCaptureField({ onCapture }: { onCapture: (barcode: string) => void }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get('barcode');
        onCapture(typeof value === 'string' ? value : '');
      }}
    >
      <label className="nexo-sr-only" htmlFor="pos-barcode">
        Código de barras
      </label>
      <input
        className="nexo-field"
        id="pos-barcode"
        name="barcode"
        autoComplete="off"
        placeholder="Escanea o busca un producto"
      />
    </form>
  );
}
export function TouchActionButton({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" className={`nexo-touch-action ${className}`} {...props} />;
}
