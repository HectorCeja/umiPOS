'use client';
import {
  Button,
  MutationButton,
  NexoDestructiveButton,
  NexoSelect,
  RolePicker,
  SaveStatus,
  TextField,
  type MutationState,
} from '@nexo/ui';
import { useEffect, useState, type FormEvent } from 'react';
import { NexoAppShell } from './global-shell';
import { apiFetch } from '../lib/api-client';
import { useActiveOrganization } from './active-organization';
import { branchPresets } from './business-presets';

type Surface = 'onboarding' | 'organizations' | 'branches' | 'invitations' | 'settings';
const api = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const copy: Record<Surface, { eyebrow: string; title: string; description: string }> = {
  onboarding: {
    eyebrow: 'Configuración inicial',
    title: 'Configura tu negocio',
    description: 'Continúa el recorrido guiado desde la entrada principal.',
  },
  organizations: {
    eyebrow: 'Negocio',
    title: 'Tu negocio',
    description: 'Estado general de la organización.',
  },
  branches: {
    eyebrow: 'Sucursales',
    title: 'Tus puntos de operación',
    description: 'Cada sucursal conserva su contexto operativo.',
  },
  invitations: {
    eyebrow: 'Equipo',
    title: 'Personas y acceso',
    description: 'Invita a tu equipo con el rol y la sucursal correctos.',
  },
  settings: {
    eyebrow: 'Configuración',
    title: 'Datos del negocio',
    description: 'Edita la presentación y configuración regional.',
  },
};
interface Organization {
  name: string;
  defaultLocale: string;
  defaultCurrency: string;
  timeZone: string;
  countryCode?: string;
  legalTaxId?: string | null;
  version: number;
}
interface Branch {
  id: string;
  name: string;
  code: string;
  timeZone: string;
  status: string;
  version: number;
}
interface Invitation {
  id: string;
  email: string;
  roleKey: string;
  accessScope: string;
  status: string;
  expiresAt: string;
  version: number;
}
export function ControlPlaneShell({ surface }: { surface: Surface }) {
  const active: 'team' | 'settings' = surface === 'invitations' ? 'team' : 'settings';
  const c = copy[surface];
  return (
    <NexoAppShell active={active}>
      <main className="settings-surface control-premium">
        <nav className="section-nav" aria-label="Configuración del negocio">
          <a
            href="/control-plane/organizations"
            aria-current={surface === 'organizations' ? 'page' : undefined}
          >
            Negocio
          </a>
          <a
            href="/control-plane/branches"
            aria-current={surface === 'branches' ? 'page' : undefined}
          >
            Sucursales
          </a>
          <a
            href="/control-plane/invitations"
            aria-current={surface === 'invitations' ? 'page' : undefined}
          >
            Equipo
          </a>
          <a
            href="/control-plane/settings"
            aria-current={surface === 'settings' ? 'page' : undefined}
          >
            Preferencias
          </a>
          <a href="/control-plane/inventory-locations">Ubicaciones</a>
        </nav>
        <header>
          <p className="overline">{c.eyebrow}</p>
          <h1>{c.title}</h1>
          <p>{c.description}</p>
        </header>
        {surface === 'onboarding' ? (
          <div className="human-empty">
            <strong>El onboarding vive en la entrada principal</strong>
            <p>Regresa a Inicio para continuar o reiniciar la configuración guiada.</p>
            <a href="/">Ir a Inicio</a>
          </div>
        ) : (
          <Administration surface={surface} />
        )}
      </main>
    </NexoAppShell>
  );
}
function Administration({ surface }: { surface: Exclude<Surface, 'onboarding'> }) {
  const activeContext = useActiveOrganization();
  const org = activeContext.organization?.id ?? '';
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchName, setBranchName] = useState('Sucursal principal');
  const [branchCode, setBranchCode] = useState('PRINCIPAL');
  const [editingBranchId, setEditingBranchId] = useState('');
  const [name, setName] = useState('');
  const [locale, setLocale] = useState('es-MX');
  const [currency, setCurrency] = useState('MXN');
  const [zone, setZone] = useState('America/Mazatlan');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('CASHIER');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [notice, setNotice] = useState('');
  const [mutationState, setMutationState] = useState<MutationState>('idle');
  useEffect(() => {
    if (!org) return;
    void Promise.all([
      apiFetch(`${api}/v1/organizations/${org}`, { credentials: 'include' }),
      apiFetch(`${api}/v1/organizations/${org}/branches`, { credentials: 'include' }),
      apiFetch(`${api}/v1/organizations/${org}/invitations`, { credentials: 'include' }),
    ]).then(async ([o, b, i]) => {
      if (o.ok) {
        const value = (await o.json()) as Organization;
        setOrganization(value);
        setName(value.name);
        setLocale(value.defaultLocale);
        setCurrency(value.defaultCurrency);
        setZone(value.timeZone);
      }
      if (b.ok) setBranches((await b.json()) as Branch[]);
      if (i.ok) setInvitations((await i.json()) as Invitation[]);
    });
  }, [org]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!organization) {
      setMutationState('error');
      return;
    }
    const values = new FormData(e.currentTarget as HTMLFormElement);
    const formString = (key: string, fallback: string) => {
      const value = values.get(key);
      return typeof value === 'string' ? value : fallback;
    };
    const submittedName = formString('organizationName', name).trim();
    const submittedLocale = formString('locale', locale);
    const submittedCurrency = formString('currency', currency);
    const submittedZone = formString('timeZone', zone);
    setMutationState('saving');
    const response = await apiFetch(`${api}/v1/organizations/${org}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
      body: JSON.stringify({
        name: submittedName,
        defaultLocale: submittedLocale,
        defaultCurrency: submittedCurrency,
        timeZone: submittedZone,
        countryCode: 'MX',
        version: organization.version,
      }),
    });
    setMutationState(response.ok ? 'success' : 'error');
    setNotice(
      response.ok
        ? 'Configuración actualizada. El nombre, la moneda y la zona horaria ya identifican a tu negocio.'
        : 'No pudimos guardar los cambios. Conservamos tus datos para que puedas intentarlo de nuevo.',
    );
    if (response.ok) {
      const updated = (await response.json()) as Organization;
      setOrganization(updated);
      setName(updated.name);
      setLocale(updated.defaultLocale);
      setCurrency(updated.defaultCurrency);
      setZone(updated.timeZone);
    }
  }
  async function invite(e: FormEvent) {
    e.preventDefault();
    setMutationState('saving');
    const response = await apiFetch(`${api}/v1/organizations/${org}/invitations`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
      body: JSON.stringify({ email, roleKey: role, accessScope: 'ALL_BRANCHES', branchIds: [] }),
    });
    setNotice(
      response.ok
        ? `Invitación enviada a ${email}. Podrás seguir su estado en Invitaciones pendientes.`
        : 'No pudimos enviar la invitación. Revisa permisos y correo.',
    );
    setMutationState(response.ok ? 'success' : 'error');
    if (response.ok) {
      const invitation = (await response.json()) as Invitation;
      setInvitations((current) => [
        invitation,
        ...current.filter((item) => item.id !== invitation.id),
      ]);
      setEmail('');
    }
  }
  async function invitationAction(invitation: Invitation, action: 'resend' | 'revoke') {
    setMutationState('saving');
    const response = await apiFetch(
      `${api}/v1/organizations/${org}/invitations/${invitation.id}${action === 'revoke' ? `?version=${String(invitation.version)}` : '/resend'}`,
      {
        method: action === 'revoke' ? 'DELETE' : 'POST',
        headers: { 'x-csrf-token': csrf() },
      },
    );
    if (!response.ok) {
      setMutationState(response.status === 409 ? 'conflict' : 'error');
      setNotice('La invitación cambió. Actualiza la lista e intenta de nuevo.');
      return;
    }
    if (action === 'revoke') {
      const updated = (await response.json()) as Invitation;
      setInvitations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(`Acceso pendiente de ${invitation.email} revocado.`);
    } else {
      const updated = (await response.json()) as Invitation;
      setInvitations((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice(`Invitación reenviada a ${invitation.email}.`);
    }
    setMutationState('success');
  }
  async function saveBranch(event: FormEvent) {
    event.preventDefault();
    const current = branches.find((branch) => branch.id === editingBranchId);
    setMutationState('saving');
    setNotice('');
    const response = await apiFetch(
      `${api}/v1/organizations/${org}/branches${current ? `/${current.id}` : ''}`,
      {
        method: current ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-csrf-token': csrf() },
        body: JSON.stringify({
          name: branchName.trim(),
          code: branchCode
            .trim()
            .toUpperCase()
            .replaceAll(/[^A-Z0-9_-]/g, '_'),
          timeZone: zone,
          locale,
          currency,
          ...(current ? { version: current.version } : {}),
        }),
      },
    );
    if (!response.ok) {
      setMutationState(response.status === 409 ? 'conflict' : 'error');
      setNotice(
        response.status === 409
          ? 'La sucursal cambió mientras la editabas. Actualiza e intenta de nuevo.'
          : 'No pudimos guardar la sucursal. Revisa nombre, código y permisos.',
      );
      return;
    }
    const saved = (await response.json()) as Branch;
    setBranches((values) =>
      current
        ? values.map((branch) => (branch.id === saved.id ? saved : branch))
        : [...values, saved],
    );
    setEditingBranchId('');
    setBranchName('Sucursal principal');
    setBranchCode('PRINCIPAL');
    setMutationState('success');
    setNotice(
      current ? 'Sucursal actualizada.' : 'Sucursal creada. Ya puedes seleccionarla en NEXO.',
    );
  }
  async function setBranchArchived(branch: Branch, archived: boolean) {
    setMutationState('saving');
    const response = await apiFetch(
      `${api}/v1/organizations/${org}/branches/${branch.id}${archived ? `?version=${String(branch.version)}` : '/restore'}`,
      {
        method: archived ? 'DELETE' : 'POST',
        credentials: 'include',
        headers: {
          'x-csrf-token': csrf(),
          ...(archived ? {} : { 'content-type': 'application/json' }),
        },
        ...(archived ? {} : { body: JSON.stringify({ version: branch.version }) }),
      },
    );
    if (!response.ok) {
      setMutationState(response.status === 409 ? 'conflict' : 'error');
      setNotice('No pudimos cambiar el estado de la sucursal. Conservamos la lista actual.');
      return;
    }
    const updated = (await response.json()) as Branch;
    setBranches((values) => values.map((item) => (item.id === branch.id ? updated : item)));
    setMutationState('success');
    setNotice(archived ? 'Sucursal archivada.' : 'Sucursal restaurada y disponible nuevamente.');
  }
  if (!organization) {
    return (
      <div className="panel human-empty" role="status" aria-live="polite">
        <strong>Cargando contexto autorizado…</strong>
        <p>Estamos validando tu organización, sucursales y permisos.</p>
      </div>
    );
  }
  if (surface === 'organizations')
    return (
      <div className="cards">
        <article>
          <p className="eyebrow">Estado</p>
          <h2>Configuración disponible</h2>
          <p>{branches.filter((x) => x.status === 'ACTIVE').length} sucursales activas</p>
        </article>
        <article>
          <p className="eyebrow">Próximo paso</p>
          <h2>Prepara tu catálogo</h2>
          <a href="/products">Abrir Productos</a>
        </article>
      </div>
    );
  if (surface === 'branches')
    return (
      <div className="branch-management">
        <form className="panel form-grid" onSubmit={(event) => void saveBranch(event)}>
          <NexoSelect
            label="Nombre de la sucursal"
            value={branchName}
            onValueChange={setBranchName}
            options={branchPresets.map((preset) => ({ value: preset, label: preset }))}
            searchable
            allowCustom
            required
          />
          <TextField
            label="Código"
            value={branchCode}
            onChange={(event) => {
              setBranchCode(event.currentTarget.value);
            }}
            help="Referencia corta para reportes y operación."
            required
          />
          <SaveStatus state={mutationState} {...(notice ? { message: notice } : {})} />
          <div className="inline-actions">
            <MutationButton
              type="submit"
              state={mutationState}
              disabled={!branchName.trim() || !branchCode.trim()}
            >
              {editingBranchId ? 'Guardar sucursal' : 'Crear sucursal'}
            </MutationButton>
            {editingBranchId && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingBranchId('');
                  setBranchName('Sucursal principal');
                  setBranchCode('PRINCIPAL');
                }}
              >
                Cancelar edición
              </Button>
            )}
          </div>
        </form>
        <section className="panel table branch-list" aria-label="Sucursales del negocio">
          {branches.map((branch) => (
            <article key={branch.id}>
              <div>
                <strong>{branch.name === 'Main Branch' ? 'Centro' : branch.name}</strong>
                <span>
                  {branch.code} · {branch.timeZone} ·{' '}
                  {branch.status === 'ACTIVE' ? 'Activa' : 'Archivada'}
                </span>
              </div>
              <div className="inline-actions">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingBranchId(branch.id);
                    setBranchName(branch.name);
                    setBranchCode(branch.code);
                    setMutationState('idle');
                    setNotice('');
                  }}
                >
                  Editar
                </Button>
                {branch.status === 'ACTIVE' ? (
                  <NexoDestructiveButton
                    type="button"
                    onClick={() => void setBranchArchived(branch, true)}
                  >
                    Archivar
                  </NexoDestructiveButton>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void setBranchArchived(branch, false)}
                  >
                    Restaurar
                  </Button>
                )}
              </div>
            </article>
          ))}
        </section>
      </div>
    );
  if (surface === 'invitations')
    return (
      <div className="team-management">
        <form className="panel form-grid team-invitation-form" onSubmit={(e) => void invite(e)}>
          <TextField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
            }}
            help="La persona recibirá acceso sólo al aceptar."
            required
          />
          <label>
            Rol
            <RolePicker value={role} onChange={setRole} />
          </label>
          <div className="wide notice">
            La invitación usa todas las sucursales; el acceso puede restringirse después desde tu
            configuración de equipo.
          </div>
          <SaveStatus state={mutationState} {...(notice ? { message: notice } : {})} />
          <MutationButton type="submit" state={mutationState}>
            Enviar invitación
          </MutationButton>
        </form>
        <section className="panel invitation-list" aria-labelledby="pending-invitations-title">
          <h2 id="pending-invitations-title">Invitaciones</h2>
          {invitations.length === 0 ? (
            <div className="human-empty">
              <strong>Tu equipo empieza aquí</strong>
              <p>Envía la primera invitación para asignar un rol y dar acceso al negocio.</p>
            </div>
          ) : (
            invitations.map((invitation) => (
              <article key={invitation.id}>
                <div>
                  <strong>{invitation.email}</strong>
                  <span>
                    {roleName(invitation.roleKey)} ·{' '}
                    {invitation.accessScope === 'ALL_BRANCHES'
                      ? 'Todas las sucursales'
                      : 'Sucursales asignadas'}
                  </span>
                </div>
                <span className="status-chip">{invitationStatus(invitation.status)}</span>
                <small>Expira {new Date(invitation.expiresAt).toLocaleString('es-MX')}</small>
                {invitation.status === 'PENDING' && (
                  <div className="inline-actions">
                    <button
                      type="button"
                      onClick={() => void invitationAction(invitation, 'resend')}
                    >
                      Reenviar
                    </button>
                    <button
                      type="button"
                      onClick={() => void invitationAction(invitation, 'revoke')}
                    >
                      Revocar
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    );
  return (
    <form className="panel form-grid" onSubmit={(e) => void save(e)}>
      <TextField
        label="Nombre comercial"
        name="organizationName"
        value={name}
        onChange={(e) => {
          setName(e.currentTarget.value);
        }}
        required
      />
      <NexoSelect
        label="Moneda"
        name="currency"
        value={currency}
        onValueChange={setCurrency}
        options={[
          { value: 'MXN', label: 'Peso mexicano (MXN)' },
          { value: 'USD', label: 'Dólar (USD)' },
        ]}
      />
      <NexoSelect
        label="Idioma"
        name="locale"
        value={locale}
        onValueChange={setLocale}
        options={[
          { value: 'es-MX', label: 'Español (México)' },
          { value: 'en-US', label: 'English (United States)' },
        ]}
      />
      <NexoSelect
        label="Zona horaria"
        name="timeZone"
        value={zone}
        onValueChange={setZone}
        options={[
          { value: 'America/Mazatlan', label: 'Mazatlán' },
          { value: 'America/Mexico_City', label: 'Ciudad de México' },
          { value: 'America/Tijuana', label: 'Tijuana' },
        ]}
      />
      <SaveStatus state={mutationState} {...(notice ? { message: notice } : {})} />
      <MutationButton type="submit" state={mutationState} disabled={!organization}>
        Guardar cambios
      </MutationButton>
    </form>
  );
}
function roleName(role: string) {
  return (
    (
      {
        OWNER: 'Propietario',
        ADMINISTRATOR: 'Administrador',
        SUPERVISOR: 'Supervisor',
        CASHIER: 'Cajero',
        READ_ONLY: 'Solo lectura',
      } as Record<string, string>
    )[role] ?? role
  );
}
function invitationStatus(status: string) {
  return (
    (
      {
        PENDING: 'Pendiente',
        ACCEPTED: 'Aceptada',
        EXPIRED: 'Expirada',
        REVOKED: 'Revocada',
      } as Record<string, string>
    )[status] ?? status
  );
}
function csrf() {
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((x) => x.startsWith('nexo_csrf='))
      ?.split('=')[1] ?? '',
  );
}
