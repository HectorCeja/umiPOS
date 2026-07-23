import type { HTMLAttributes, ReactNode } from 'react';
import { Badge, Button, Card, Select, StatusBadge, type Tone } from './primitives.js';
import { Table } from './data.js';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  current?: boolean;
}
export function Sidebar({
  items,
  title = 'NEXO',
}: {
  items: readonly NavigationItem[];
  title?: string;
}) {
  return (
    <aside className="nexo-sidebar" aria-label="Navegación principal">
      <strong>{title}</strong>
      <nav>
        <ul className="nexo-nav-list">
          {items.map((item) => (
            <li key={item.id}>
              <a
                className="nexo-nav-link"
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
              >
                <span className="nexo-sidebar__label">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
export function Topbar({ actions, context }: { actions?: ReactNode; context: ReactNode }) {
  return (
    <header className="nexo-topbar">
      <div>{context}</div>
      <div className="nexo-cluster">{actions}</div>
    </header>
  );
}
export function AppShell({
  children,
  items,
  topbar,
}: {
  children: ReactNode;
  items: readonly NavigationItem[];
  topbar: ReactNode;
}) {
  return (
    <div className="nexo-root nexo-app-shell" tabIndex={-1}>
      <a className="nexo-skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <Sidebar items={items} />
      <Topbar context={topbar} />
      <main className="nexo-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
export function MobileNavigation({ items }: { items: readonly NavigationItem[] }) {
  return (
    <nav aria-label="Navegación móvil">
      <ul className="nexo-cluster">
        {items.slice(0, 5).map((item) => (
          <li key={item.id}>
            <a href={item.href} aria-current={item.current ? 'page' : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
export const NavigationRail = Sidebar;
export function PageHeader({
  actions,
  description,
  title,
}: {
  actions?: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <header className="nexo-page-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="nexo-cluster">{actions}</div>}
    </header>
  );
}
export const Toolbar = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className="nexo-toolbar" role="toolbar" {...props}>
    {children}
  </div>
);
export const FilterBar = Toolbar;
export const SearchToolbar = Toolbar;
export const DataGrid = Table;
export function EntityList({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section aria-label={label} className="nexo-stack">
      {children}
    </section>
  );
}
export const DetailPanel = Card;
export function FormSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <section className="nexo-card">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <div className="nexo-stack">{children}</div>
    </section>
  );
}
export const SettingsSection = FormSection;
export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <Card>
      <span className="nexo-help">{label}</span>
      <div className="nexo-total-final">{value}</div>
      {detail && <small>{detail}</small>}
    </Card>
  );
}
export function ActivityFeed({
  events,
}: {
  events: readonly { id: string; title: string; detail: string }[];
}) {
  return (
    <ol>
      {events.map((event) => (
        <li key={event.id}>
          <strong>{event.title}</strong>
          <p>{event.detail}</p>
        </li>
      ))}
    </ol>
  );
}
export const AuditTimeline = ActivityFeed;
export function BranchSelector({
  options,
  value,
  onChange,
}: {
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select label="Sucursal activa" options={options} value={value} onValueChange={onChange} />
  );
}
export function OrganizationSelector(props: Parameters<typeof BranchSelector>[0]) {
  return (
    <Select
      label="Organización activa"
      options={props.options}
      value={props.value}
      onValueChange={props.onChange}
    />
  );
}
export function FeatureStatus({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <StatusBadge tone={enabled ? 'success' : 'warning'}>
      {label}: {enabled ? 'Activa' : 'No disponible'}
    </StatusBadge>
  );
}
export function PermissionMatrix({
  rows,
}: {
  rows: readonly { permission: string; scope: string; status: string }[];
}) {
  return (
    <Table>
      <thead>
        <tr>
          <th>Permiso</th>
          <th>Alcance</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.permission}>
            <td>{row.permission}</td>
            <td>{row.scope}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
export function ConfirmationFlow({
  action,
  danger = false,
  detail,
  onConfirm,
}: {
  action: string;
  danger?: boolean;
  detail: string;
  onConfirm: () => void;
}) {
  return (
    <Card>
      <strong>{action}</strong>
      <p>{detail}</p>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
        Confirmar
      </Button>
    </Card>
  );
}
export function BulkActionBar({ count, children }: { count: number; children: ReactNode }) {
  return (
    <div className="nexo-toolbar" role="toolbar" aria-label="Acciones masivas">
      <Badge>{count} seleccionados</Badge>
      {children}
    </div>
  );
}
export function ImportStatus({ label, tone = 'info' }: { label: string; tone?: Tone }) {
  return <StatusBadge tone={tone}>Importación: {label}</StatusBadge>;
}
export function ExportStatus({ label, tone = 'info' }: { label: string; tone?: Tone }) {
  return <StatusBadge tone={tone}>Exportación: {label}</StatusBadge>;
}
