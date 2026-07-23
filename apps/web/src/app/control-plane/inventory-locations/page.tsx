'use client';
import {
  Button,
  MutationButton,
  NexoDestructiveButton,
  NexoSelect,
  SaveStatus,
  TextField,
  type MutationState,
} from '@nexo/ui';
import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch } from '../../../lib/api-client';
import { useActiveOrganization } from '../../active-organization';
import { NexoAppShell } from '../../global-shell';

const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const presets = [
  'Almacén principal',
  'Mostrador',
  'Bodega',
  'Cocina',
  'Barra',
  'Preparación',
  'Terraza',
  'Exhibición',
  'Devoluciones',
  'Dañados',
];
interface Location {
  id: string;
  branchId: string;
  name: string;
  code: string;
  type: string;
  active: boolean;
}
interface Branch {
  id: string;
  name: string;
  status: string;
}

export default function InventoryLocationsPage() {
  const org = useActiveOrganization().organization?.id ?? '';
  const [locations, setLocations] = useState<Location[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [name, setName] = useState(presets[0] ?? 'Almacén principal');
  const [code, setCode] = useState('ALMACEN-PRINCIPAL');
  const [branchId, setBranchId] = useState('');
  const [type, setType] = useState('WAREHOUSE');
  const [editing, setEditing] = useState('');
  const [state, setState] = useState<MutationState>('idle');
  const [message, setMessage] = useState('');
  async function refresh() {
    const [l, b] = await Promise.all([
      apiFetch(`${api}/v1/organizations/${org}/inventory/locations?includeArchived=true`, {
        credentials: 'include',
      }),
      apiFetch(`${api}/v1/organizations/${org}/branches`, { credentials: 'include' }),
    ]);
    if (l.ok) setLocations((await l.json()) as Location[]);
    if (b.ok) {
      const value = (await b.json()) as Branch[];
      setBranches(value);
      setBranchId((current) => {
        if (current) return current;
        return value.find((item) => item.status === 'ACTIVE')?.id ?? '';
      });
    }
  }
  useEffect(() => {
    if (org) void refresh();
  }, [org]);
  async function save(event: FormEvent) {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (locations.some((item) => item.id !== editing && item.code === normalizedCode)) {
      setState('conflict');
      setMessage('Ya existe una ubicación con ese código. Elige otro para continuar.');
      return;
    }
    setState('saving');
    const response = await apiFetch(
      `${api}/v1/organizations/${org}/inventory/locations${editing ? `/${editing}` : ''}`,
      {
        method: editing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify({
          branchId,
          type,
          code: normalizedCode,
          name: name.trim(),
        }),
      },
    );
    setState(response.ok ? 'success' : response.status === 409 ? 'conflict' : 'error');
    setMessage(
      response.ok
        ? editing
          ? 'Ubicación actualizada.'
          : 'Ubicación creada y disponible en Inventario.'
        : 'No pudimos guardar la ubicación. Revisa nombre, código y sucursal.',
    );
    if (response.ok) {
      setEditing('');
      await refresh();
    }
  }
  async function toggle(item: Location) {
    setState('saving');
    const response = await apiFetch(
      `${api}/v1/organizations/${org}/inventory/locations/${item.id}`,
      {
        method: 'PUT',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify({ active: !item.active }),
      },
    );
    setState(response.ok ? 'success' : 'error');
    setMessage(
      response.ok
        ? item.active
          ? 'Ubicación archivada.'
          : 'Ubicación restaurada.'
        : 'No pudimos cambiar el estado de la ubicación.',
    );
    if (response.ok) await refresh();
  }
  return (
    <NexoAppShell active="settings">
      <main className="settings-surface control-premium inventory-location-settings">
        <nav className="section-nav" aria-label="Configuración del negocio">
          <a href="/control-plane/organizations">Negocio</a>
          <a href="/control-plane/branches">Sucursales</a>
          <a href="/control-plane/inventory-locations" aria-current="page">
            Ubicaciones
          </a>
          <a href="/control-plane/settings">Preferencias</a>
        </nav>
        <header>
          <p className="overline">INVENTARIO</p>
          <h1>Ubicaciones</h1>
          <p>Define dónde se guardan y consultan tus productos.</p>
        </header>
        <section className="premium-card location-editor">
          <form onSubmit={(event) => void save(event)}>
            <NexoSelect
              label="Nombre sugerido"
              value={presets.includes(name) ? name : 'custom'}
              onValueChange={(value) => {
                if (value !== 'custom') {
                  setName(value);
                  setCode(
                    value
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/gu, '')
                      .replace(/\s+/gu, '-')
                      .toUpperCase(),
                  );
                }
              }}
              options={[
                { value: 'custom', label: 'Nombre personalizado' },
                ...presets.map((item) => ({ value: item, label: item })),
              ]}
            />
            <TextField
              label="Nombre"
              value={name}
              onChange={(e) => {
                setName(e.currentTarget.value);
              }}
              required
            />
            <TextField
              label="Código"
              value={code}
              onChange={(e) => {
                setCode(e.currentTarget.value);
              }}
              required
            />
            <NexoSelect
              label="Sucursal"
              value={branchId}
              onValueChange={setBranchId}
              required
              placeholder="Selecciona una sucursal"
              options={branches
                .filter((branch) => branch.status === 'ACTIVE')
                .map((branch) => ({ value: branch.id, label: branch.name }))}
            />
            <NexoSelect
              label="Tipo"
              value={type}
              onValueChange={setType}
              options={[
                { value: 'WAREHOUSE', label: 'Almacén' },
                { value: 'ZONE', label: 'Zona' },
                { value: 'SHELF', label: 'Estante' },
                { value: 'BIN', label: 'Área específica' },
                { value: 'BRANCH', label: 'Sucursal' },
              ]}
            />
            <MutationButton type="submit" state={state} disabled={!branchId}>
              {editing ? 'Guardar cambios' : 'Crear ubicación'}
            </MutationButton>
            <SaveStatus state={state} {...(message ? { message } : {})} />
          </form>
        </section>
        <section className="location-list" aria-label="Ubicaciones registradas">
          {locations.length ? (
            locations.map((item) => (
              <article className="premium-card" key={item.id}>
                <div>
                  <strong>{item.name}</strong>
                  <span>
                    {item.code} · {item.active ? 'Activa' : 'Archivada'}
                  </span>
                </div>
                <div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setEditing(item.id);
                      setName(item.name);
                      setCode(item.code);
                      setBranchId(item.branchId);
                      setType(item.type);
                    }}
                  >
                    Editar
                  </Button>
                  {item.active ? (
                    <NexoDestructiveButton onClick={() => void toggle(item)}>
                      Archivar
                    </NexoDestructiveButton>
                  ) : (
                    <Button variant="secondary" onClick={() => void toggle(item)}>
                      Restaurar
                    </Button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="human-empty">
              <strong>Aún no hay ubicaciones</strong>
              <p>Crea la primera para consultar existencias en Inventario.</p>
            </div>
          )}
        </section>
      </main>
    </NexoAppShell>
  );
}
function csrf() {
  const value = document.cookie
    .split('; ')
    .find((item) => item.startsWith('nexo_csrf='))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : '';
}
