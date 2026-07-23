import { useId, useState, type ReactNode } from 'react';
import { Button, Card, SearchInput } from './primitives.js';
import { NexoIcon } from './iconography.js';
import { Dialog } from './overlays.js';

export function Tabs({
  items,
}: {
  items: readonly { id: string; label: string; content: ReactNode }[];
}) {
  const [active, setActive] = useState(items[0]?.id);
  return (
    <div>
      <div className="nexo-tabs" role="tablist">
        {items.map((item) => (
          <button
            className="nexo-tab"
            type="button"
            role="tab"
            key={item.id}
            id={`${item.id}-tab`}
            aria-selected={active === item.id}
            aria-controls={`${item.id}-panel`}
            tabIndex={active === item.id ? 0 : -1}
            onClick={() => {
              setActive(item.id);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          role="tabpanel"
          key={item.id}
          id={`${item.id}-panel`}
          aria-labelledby={`${item.id}-tab`}
          hidden={active !== item.id}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
export function Accordion({ items }: { items: readonly { title: string; content: ReactNode }[] }) {
  return (
    <div>
      {items.map((item) => (
        <details key={item.title}>
          <summary>{item.title}</summary>
          <div className="nexo-card">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
export function Breadcrumbs({ items }: { items: readonly { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Ruta">
      <ol className="nexo-cluster">
        {items.map((item, index) => (
          <li key={item.label}>
            {item.href && index < items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <span aria-current={index === items.length - 1 ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export function Pagination({
  current,
  total,
  onPageChange,
}: {
  current: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Paginación" className="nexo-cluster">
      <Button
        variant="secondary"
        disabled={current <= 1}
        onClick={() => {
          onPageChange(current - 1);
        }}
      >
        Anterior
      </Button>
      <span>
        Página {current} de {total}
      </span>
      <Button
        variant="secondary"
        disabled={current >= total}
        onClick={() => {
          onPageChange(current + 1);
        }}
      >
        Siguiente
      </Button>
    </nav>
  );
}
export function CommandPalette({
  commands,
  open,
  onClose,
}: {
  commands: readonly {
    id: string;
    label: string;
    description?: string;
    group?: string;
    icon?: ReactNode;
    shortcut?: string;
    onSelect: () => void;
  }[];
  open: boolean;
  onClose: () => void;
}) {
  const id = useId();
  const [query, setQuery] = useState('');
  const filtered = commands.filter((command) =>
    command.label.toLocaleLowerCase('es-MX').includes(query.toLocaleLowerCase('es-MX')),
  );
  const groups = filtered.reduce<Map<string, typeof filtered>>((result, command) => {
    const group = command.group ?? 'Sugerencias';
    result.set(group, [...(result.get(group) ?? []), command]);
    return result;
  }, new Map());
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Explora NEXO"
      description="Busca páginas y acciones disponibles en tu sucursal."
      className="nexo-command-palette"
    >
      <SearchInput
        id={id}
        label="Buscar acciones"
        value={query}
        autoFocus
        onChange={(event) => {
          setQuery(event.currentTarget.value);
        }}
      />
      <Card role="listbox" aria-label="Resultados" className="nexo-command-results">
        {filtered.length === 0 && (
          <div className="nexo-command-empty">
            <strong>No encontramos coincidencias</strong>
            <span>Prueba con Ventas, Caja, Productos o Configuración.</span>
          </div>
        )}
        {[...groups].map(([group, entries]) => (
          <section key={group} aria-label={group}>
            <p>{group}</p>
            {entries.map((command) => (
              <Button
                key={command.id}
                variant="secondary"
                role="option"
                onClick={() => {
                  command.onSelect();
                  onClose();
                }}
              >
                <span className="nexo-command-icon" aria-hidden="true">
                  {command.icon ?? <NexoIcon name="search" decorative />}
                </span>
                <span>
                  <strong>{command.label}</strong>
                  {command.description && <small>{command.description}</small>}
                </span>
                {command.shortcut && <kbd>{command.shortcut}</kbd>}
              </Button>
            ))}
          </section>
        ))}
      </Card>
    </Dialog>
  );
}
