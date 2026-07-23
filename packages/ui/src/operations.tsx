'use client';

import type { ReactNode } from 'react';
import { Button } from './primitives.js';

export type NexoDensity = 'comfortable' | 'compact';

export interface NexoColumn<Row> {
  id: string;
  label: string;
  numeric?: boolean;
  render: (row: Row) => ReactNode;
}

export function NexoDataTable<Row>({
  caption,
  columns,
  rows,
  rowKey,
  density = 'comfortable',
  empty,
}: {
  caption: string;
  columns: NexoColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  density?: NexoDensity;
  empty?: ReactNode;
}) {
  if (!rows.length && empty) return <>{empty}</>;
  return (
    <div
      className={`nexo-data-table nexo-data-table--${density}`}
      role="region"
      aria-label={caption}
      tabIndex={0}
    >
      <table>
        <caption className="nexo-sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.id} scope="col" className={column.numeric ? 'is-numeric' : ''}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.id} className={column.numeric ? 'is-numeric' : ''}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function NexoToolbar({
  children,
  label = 'Herramientas',
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <div className="nexo-operational-toolbar" role="toolbar" aria-label={label}>
      {children}
    </div>
  );
}

export function NexoSegmentedControl({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset className="nexo-segmented">
      <legend className="nexo-sr-only">{label}</legend>
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          aria-pressed={value === option.value}
          onClick={() => {
            onChange(option.value);
          }}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

export function NexoStatusDot({
  tone = 'neutral',
  label,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  label: string;
}) {
  return (
    <span className={`nexo-status-dot nexo-status-dot--${tone}`}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}

export function NexoStockLevelIndicator({
  available,
  minimum,
}: {
  available: number;
  minimum: number;
}) {
  const tone = available <= 0 ? 'danger' : available <= minimum ? 'warning' : 'success';
  const label =
    available <= 0 ? 'Agotado' : available <= minimum ? 'Existencia baja' : 'Disponible';
  return <NexoStatusDot tone={tone} label={`${label}: ${String(available)}`} />;
}

export function NexoInlineNotice({
  title,
  children,
  tone = 'info',
}: {
  title: string;
  children: ReactNode;
  tone?: 'info' | 'success' | 'warning' | 'danger';
}) {
  return (
    <aside
      className={`nexo-inline-notice nexo-inline-notice--${tone}`}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}

export function NexoPagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav className="nexo-pagination" aria-label="Paginación">
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={() => {
          onChange(page - 1);
        }}
      >
        Anterior
      </Button>
      <span>
        Página {page} de {pages}
      </span>
      <Button
        variant="secondary"
        disabled={page >= pages}
        onClick={() => {
          onChange(page + 1);
        }}
      >
        Siguiente
      </Button>
    </nav>
  );
}

export const NexoShortcutBadge = ({ children }: { children: ReactNode }) => (
  <kbd className="nexo-shortcut-badge">{children}</kbd>
);
export const NexoPageTransition = ({ children }: { children: ReactNode }) => (
  <div className="nexo-page-transition">{children}</div>
);
