import type { ReactNode, TableHTMLAttributes } from 'react';
import { EmptyState } from './primitives.js';

export function Table(props: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="nexo-table-wrap">
      <table className="nexo-table" {...props} />
    </div>
  );
}
export const DataTable = Table;
export function KpiCard({
  detail,
  icon,
  label,
  tone = 'info',
  value,
}: {
  detail: string;
  icon?: ReactNode;
  label: string;
  tone?: 'success' | 'info' | 'warning' | 'accent';
  value?: string;
}) {
  return (
    <article
      className="nexo-kpi-card premium-card metric-card"
      aria-label={`${label}: ${value ?? 'Cargando'}`}
    >
      {icon && <span className={`metric-icon ${tone}`}>{icon}</span>}
      <div>
        <span>{label}</span>
        {value ? <strong>{value}</strong> : <span className="nexo-skeleton metric-skeleton" />}
        <small>{detail}</small>
      </div>
    </article>
  );
}
export function List({
  items,
  label,
}: {
  items: readonly { id: string; content: ReactNode }[];
  label: string;
}) {
  return items.length ? (
    <ul aria-label={label}>
      {items.map((item) => (
        <li key={item.id}>{item.content}</li>
      ))}
    </ul>
  ) : (
    <EmptyState
      title="No hay elementos"
      description="Cuando agregues información, aparecerá aquí."
    />
  );
}
