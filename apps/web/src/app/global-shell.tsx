'use client';

import { autoUpdate, flip, offset, shift, size, useFloating } from '@floating-ui/react-dom';
import {
  CommandPalette,
  LivingScene,
  NexoIcon,
  NexoIconButton,
  type LivingSceneVariant,
  type NexoIconName,
} from '@nexo/ui';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import { CurrentScreenHelp } from './contextual-help';
import { NexoWordmark } from './cinematic-experience';
import { createPortal } from 'react-dom';
import {
  apiFetch,
  browserReachableUrl,
  clearBrowserSessionCookies,
  csrfToken,
  refreshSession,
} from '../lib/api-client';
import { useActiveOrganization } from './active-organization';
import { useCanonicalIdentity, type CanonicalIdentity } from './identity-provider';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';
const idleTimeoutMs = Number(process.env.NEXT_PUBLIC_SESSION_IDLE_MS ?? 20 * 60 * 1000);
const idleWarningMs = Number(process.env.NEXT_PUBLIC_SESSION_WARNING_MS ?? 5 * 60 * 1000);

export type NexoShellModule =
  | 'home'
  | 'sales'
  | 'cash'
  | 'products'
  | 'inventory'
  | 'reports'
  | 'team'
  | 'settings'
  | 'help';

type Identity = CanonicalIdentity;

export interface NexoShellBranch {
  id: string;
  name: string;
  status: string;
}

interface NavigationItem {
  id: NexoShellModule | 'customers';
  label: string;
  href: string;
  icon: NexoIconName;
  disabled?: boolean;
}

export const nexoNavigationItems: readonly NavigationItem[] = [
  { id: 'home', label: 'Inicio', href: '/', icon: 'home' },
  { id: 'sales', label: 'Ventas', href: '/sales', icon: 'receipt' },
  { id: 'cash', label: 'Caja', href: '/cash', icon: 'cash-register' },
  { id: 'products', label: 'Productos', href: '/products', icon: 'package' },
  { id: 'inventory', label: 'Inventario', href: '/inventory', icon: 'warehouse' },
  { id: 'customers', label: 'Clientes', href: '#', icon: 'users', disabled: true },
  { id: 'reports', label: 'Reportes', href: '/reports', icon: 'chart' },
  { id: 'team', label: 'Equipo', href: '/control-plane/invitations', icon: 'user-cog' },
  { id: 'settings', label: 'Configuración', href: '/control-plane/settings', icon: 'settings' },
  { id: 'help', label: 'Ayuda', href: '/help', icon: 'life-buoy' },
] as const;

interface NexoAppShellProps {
  active: NexoShellModule;
  children: ReactNode;
  branches?: NexoShellBranch[];
  activeBranchId?: string;
  onBranchChange?: (branchId: string) => void;
  rawContent?: boolean;
}

export function NexoAppShell({
  active,
  children,
  branches: suppliedBranches,
  activeBranchId,
  onBranchChange,
  rawContent = false,
}: NexoAppShellProps) {
  const activeContext = useActiveOrganization();
  const { identity, updateIdentity } = useCanonicalIdentity();
  const [sessionState, setSessionState] = useState<'loading' | 'authenticated' | 'error'>(
    'loading',
  );
  const [roleLabel, setRoleLabel] = useState('Miembro');
  const [accountOpen, setAccountOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState<'organization' | 'branch' | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const idleDeadline = useRef(Date.now() + idleTimeoutMs);
  const [idleRemainingMs, setIdleRemainingMs] = useState(idleTimeoutMs);
  const contextMenuId = useId();
  const accountMenuId = useId();
  const accountRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const contextTriggerRef = useRef<HTMLElement | null>(null);
  const mobileNavRef = useRef<HTMLElement>(null);
  const mobileNavTriggerRef = useRef<HTMLButtonElement>(null);
  const { refs, floatingStyles, placement, isPositioned } = useFloating({
    open: contextOpen !== null,
    placement: 'bottom-start',
    strategy: 'fixed',
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({ fallbackPlacements: ['bottom-end', 'top-start', 'top-end'], padding: 12 }),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${String(Math.max(rects.reference.width, 288))}px`,
            maxHeight: `${String(Math.max(180, Math.min(360, availableHeight)))}px`,
          });
        },
      }),
    ],
  });
  const organization = activeContext.organization;
  const branches = suppliedBranches ?? activeContext.branches;
  const visibleBranches = useMemo(
    () => [
      ...new Map(
        branches
          .filter((branch) => branch.status === 'ACTIVE')
          .map((branch) => [branch.id, branch]),
      ).values(),
    ],
    [branches],
  );
  const selectedBranchId = activeBranchId ?? activeContext.branch?.id ?? '';
  const activeBranchName = friendlyBranch(
    visibleBranches.find((branch) => branch.id === selectedBranchId)?.name ?? 'Centro',
  );

  useEffect(() => {
    localStorage.setItem('nexo-theme', 'dark');
    applyTheme('dark');
    void (async () => {
      try {
        const response = await apiFetch(`${apiBase}/v1/identity`);
        if (response.status === 401) {
          const returnTo = `${window.location.pathname}${window.location.search}`;
          window.location.assign(`/?returnTo=${encodeURIComponent(returnTo)}`);
          return;
        }
        if (!response.ok) {
          setSessionState('error');
          return;
        }
        const resolvedIdentity = (await response.json()) as Identity;
        updateIdentity(resolvedIdentity);
        setSessionState('authenticated');
      } catch {
        setSessionState('error');
      }
    })();
  }, [suppliedBranches, updateIdentity]);

  useEffect(() => {
    const organizationId = activeContext.organization?.id;
    const selected = selectedBranchId;
    if (!organizationId) return;
    void apiFetch(
      `${apiBase}/v1/organizations/${organizationId}/authorization/context${selected ? `?branchId=${encodeURIComponent(selected)}` : ''}`,
    )
      .then(async (response) => {
        if (!response.ok) return;
        const context = (await response.json()) as { roles?: string[] };
        setRoleLabel(context.roles?.length ? context.roles.map(roleName).join(', ') : 'Miembro');
      })
      .catch(() => undefined);
  }, [activeContext.organization?.id, selectedBranchId]);

  useEffect(() => {
    const activity = () => {
      if (Date.now() < idleDeadline.current - idleWarningMs) {
        idleDeadline.current = Date.now() + idleTimeoutMs;
      }
    };
    const events: (keyof WindowEventMap)[] = ['pointerdown', 'keydown', 'scroll'];
    for (const event of events) window.addEventListener(event, activity, { passive: true });
    const timer = window.setInterval(() => {
      const remaining = idleDeadline.current - Date.now();
      setIdleRemainingMs(Math.max(0, remaining));
      if (remaining <= 0) void logout(window.location.pathname + window.location.search);
    }, 1000);
    return () => {
      window.clearInterval(timer);
      for (const event of events) window.removeEventListener(event, activity);
    };
  }, []);

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen(true);
      }
      if (event.key === 'Escape') {
        if (accountOpen) accountTriggerRef.current?.focus();
        if (contextOpen) contextTriggerRef.current?.focus();
        setAccountOpen(false);
        setContextOpen(null);
      }
    };
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (accountOpen && !accountRef.current?.contains(target)) {
        setAccountOpen(false);
        accountTriggerRef.current?.focus();
      }
      if (
        contextOpen &&
        !refs.floating.current?.contains(target) &&
        !(refs.reference.current instanceof Node && refs.reference.current.contains(target))
      ) {
        setContextOpen(null);
      }
    };
    window.addEventListener('keydown', keyboard);
    document.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('keydown', keyboard);
      document.removeEventListener('pointerdown', outside);
    };
  }, [accountOpen, contextOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const navigation = mobileNavRef.current;
    const focusable = () =>
      Array.from(
        navigation?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? [],
      ).filter((element) => element.offsetParent !== null);
    focusable()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileNavOpen(false);
        mobileNavTriggerRef.current?.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = focusable();
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', keyboard);
    };
  }, [mobileNavOpen]);

  const selectBranch = (id: string) => {
    if (onBranchChange) onBranchChange(id);
    else activeContext.selectBranch(id);
    setContextOpen(null);
  };
  const toggleContext = (kind: 'organization' | 'branch', element: HTMLElement) => {
    contextTriggerRef.current = element;
    refs.setReference(element);
    setContextOpen((open) => (open === kind ? null : kind));
  };
  if (sessionState === 'error') {
    return (
      <main className="splash-screen" role="alert">
        No pudimos validar tu sesión. Recarga para intentar de nuevo.
      </main>
    );
  }
  if (sessionState === 'loading' || !identity) {
    return (
      <main className="splash-screen" aria-live="polite">
        Validando tu sesión…
      </main>
    );
  }
  const displayName = identity.displayName;
  const organizationName = organization?.name ?? 'Organización';
  const organizationInitials = initials(organizationName);

  return (
    <LivingScene
      variant={sceneFor(active)}
      quality={active === 'reports' ? 'high' : active === 'inventory' ? 'reduced' : 'balanced'}
      deterministic={process.env.NODE_ENV === 'test'}
      enableKenBurns={false}
      enablePointerParallax
      className={`home-living-scene module-living-scene module-living-scene--${active}`}
    >
      <div
        className={`product-shell${active === 'home' ? '' : ' unified-shell'}`}
        data-nexo-app-shell="canonical"
      >
        <a className="nexo-skip-link" href="#main-content">
          Saltar al contenido
        </a>
        <aside
          ref={mobileNavRef}
          className={`product-sidebar${mobileNavOpen ? ' is-open' : ''}`}
          aria-label="Navegación de NEXO"
        >
          <NexoIconButton
            className="mobile-nav-close"
            label="Cerrar navegación"
            onClick={() => {
              setMobileNavOpen(false);
              mobileNavTriggerRef.current?.focus();
            }}
          >
            <NexoIcon name="close" decorative />
          </NexoIconButton>
          <a className="product-brand" href="/" aria-label="NEXO, inicio">
            <NexoWordmark compact />
          </a>
          <button
            className={`business-switcher context-selector${contextOpen === 'branch' ? ' is-open' : ''}`}
            type="button"
            aria-label="Cambiar organización o sucursal"
            aria-expanded={contextOpen === 'branch'}
            aria-haspopup="menu"
            aria-controls={contextOpen === 'branch' ? contextMenuId : undefined}
            onClick={(event) => {
              toggleContext('branch', event.currentTarget);
            }}
            onKeyDown={(event) => {
              focusOpenMenu(event, contextMenuId);
            }}
          >
            <span className="business-logo">{organizationInitials}</span>
            <span className="context-selector__copy">
              <strong>{organizationName}</strong>
              <small>{activeBranchName}</small>
            </span>
            <ContextChevron />
          </button>
          <nav aria-label="Navegación principal" className="product-nav">
            <p>Espacio de trabajo</p>
            {nexoNavigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={active === item.id ? 'active' : item.disabled ? 'disabled' : ''}
                aria-current={active === item.id ? 'page' : undefined}
                aria-disabled={item.disabled ?? undefined}
                onClick={(event) => {
                  if (item.disabled) event.preventDefault();
                  else setMobileNavOpen(false);
                }}
              >
                <NexoIcon name={item.icon} decorative />
                <span>{item.label}</span>
                {item.disabled && <small>Próximamente</small>}
              </a>
            ))}
          </nav>
          <div className="sidebar-support">
            <span className="online-dot" />
            <span>
              <strong>Todo funciona correctamente</strong>
              <small>Servicios en línea</small>
            </span>
          </div>
          <button className="sidebar-logout" type="button" onClick={() => void logout()}>
            <NexoIcon name="log-out" decorative /> Cerrar sesión
          </button>
        </aside>
        {mobileNavOpen && (
          <button
            type="button"
            className="mobile-nav-scrim"
            aria-label="Cerrar navegación"
            onClick={() => {
              setMobileNavOpen(false);
              mobileNavTriggerRef.current?.focus();
            }}
          />
        )}
        <header className="product-topbar" data-nexo-toast-safe-area>
          <NexoIconButton
            ref={mobileNavTriggerRef}
            className="mobile-nav-trigger"
            label="Abrir navegación"
            aria-expanded={mobileNavOpen}
            onClick={() => {
              setMobileNavOpen(true);
            }}
          >
            <NexoIcon name="menu" decorative />
          </NexoIconButton>
          <button
            className="global-search"
            aria-label="Abrir búsqueda global"
            onClick={() => {
              setPaletteOpen(true);
            }}
          >
            <NexoIcon name="search" decorative />
            <span>Buscar en NEXO</span>
            <kbd>⌘ K</kbd>
          </button>
          <div className="home-context-controls" aria-label="Contexto del negocio">
            <button
              type="button"
              className={`context-selector${contextOpen === 'organization' ? ' is-open' : ''}`}
              aria-label={`Organización activa: ${organizationName}`}
              aria-expanded={contextOpen === 'organization'}
              aria-haspopup="menu"
              aria-controls={contextOpen === 'organization' ? contextMenuId : undefined}
              title={organizationName}
              onClick={(event) => {
                toggleContext('organization', event.currentTarget);
              }}
              onKeyDown={(event) => {
                focusOpenMenu(event, contextMenuId);
              }}
            >
              <ContextIcon type="organization" />
              <span className="context-selector__copy">
                <strong>{organizationName}</strong>
              </span>
              <ContextChevron />
            </button>
            <button
              type="button"
              className={`context-selector${contextOpen === 'branch' ? ' is-open' : ''}`}
              aria-label={`Sucursal activa: ${activeBranchName}`}
              aria-expanded={contextOpen === 'branch'}
              aria-haspopup="menu"
              aria-controls={contextOpen === 'branch' ? contextMenuId : undefined}
              title={activeBranchName}
              onClick={(event) => {
                toggleContext('branch', event.currentTarget);
              }}
              onKeyDown={(event) => {
                focusOpenMenu(event, contextMenuId);
              }}
            >
              <ContextIcon type="branch" />
              <span className="context-selector__copy">
                <strong>{activeBranchName}</strong>
              </span>
              <ContextChevron />
            </button>
          </div>
          <div className="topbar-actions" ref={accountRef}>
            <button
              ref={accountTriggerRef}
              className="profile-trigger"
              aria-label={`Abrir menú de usuario de ${displayName}`}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-controls={accountOpen ? accountMenuId : undefined}
              onClick={() => {
                setAccountOpen((open) => !open);
              }}
              onKeyDown={(event) => {
                focusOpenMenu(event, accountMenuId);
              }}
            >
              <Avatar name={displayName} url={identity.avatarUrl} />
              <span>
                <strong>{displayName}</strong>
                <small>{roleLabel}</small>
              </span>
              <NexoIcon name="chevron-down" decorative />
            </button>
            {accountOpen && <AccountMenu id={accountMenuId} identity={identity} />}
          </div>
        </header>
        {rawContent ? (
          children
        ) : (
          <main
            className="unified-content"
            id="main-content"
            tabIndex={0}
            aria-label="Contenido de la ruta"
          >
            {children}
          </main>
        )}
        <CurrentScreenHelp />
        <CommandPalette
          open={paletteOpen}
          onClose={() => {
            setPaletteOpen(false);
          }}
          commands={nexoNavigationItems
            .filter((item) => !item.disabled)
            .map((item) => ({
              id: item.id,
              label: item.label,
              description: commandDescription(item.id as NexoShellModule),
              group:
                item.id === 'help' || item.id === 'settings' ? 'Cuenta y soporte' : 'Navegación',
              icon: <NexoIcon name={item.icon} decorative />,
              onSelect: () => {
                window.location.assign(item.href);
              },
            }))}
        />
        {contextOpen && typeof document !== 'undefined'
          ? createPortal(
              contextOpen === 'branch' ? (
                <BranchMenu
                  id={contextMenuId}
                  floatingRef={refs.setFloating}
                  floatingStyles={floatingStyles}
                  positioned={isPositioned}
                  placement={placement}
                  branches={visibleBranches}
                  organizationName={organizationName}
                  selectedId={selectedBranchId}
                  onSelect={selectBranch}
                />
              ) : (
                <OrganizationMenu
                  id={contextMenuId}
                  floatingRef={refs.setFloating}
                  floatingStyles={floatingStyles}
                  positioned={isPositioned}
                  placement={placement}
                  organizations={activeContext.organizations}
                  selectedId={activeContext.organization?.id ?? ''}
                  onSelect={activeContext.selectOrganization}
                  onClose={() => {
                    setContextOpen(null);
                    contextTriggerRef.current?.focus();
                  }}
                />
              ),
              document.body,
            )
          : null}
        {idleRemainingMs > 0 && idleRemainingMs <= idleWarningMs && (
          <div className="session-warning-backdrop">
            <section
              className="session-warning-dialog"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="session-warning-title"
              aria-describedby="session-warning-description"
            >
              <h2 id="session-warning-title">Tu sesión está por expirar por inactividad.</h2>
              <p id="session-warning-description">
                Se cerrará en {formatRemaining(idleRemainingMs)}. Las operaciones pendientes no se
                enviarán automáticamente.
              </p>
              <div className="session-warning-actions">
                <button
                  type="button"
                  autoFocus
                  onClick={() => {
                    void (async () => {
                      if (await refreshSession()) {
                        idleDeadline.current = Date.now() + idleTimeoutMs;
                        setIdleRemainingMs(idleTimeoutMs);
                      }
                    })();
                  }}
                >
                  Mantener sesión
                </button>
                <button type="button" onClick={() => void logout()}>
                  Cerrar sesión
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </LivingScene>
  );
}

function BranchMenu({
  id,
  floatingRef,
  floatingStyles,
  positioned,
  placement,
  branches,
  organizationName,
  selectedId,
  onSelect,
}: {
  id: string;
  floatingRef: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
  positioned: boolean;
  placement: string;
  branches: NexoShellBranch[];
  organizationName: string;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      id={id}
      ref={floatingRef}
      className="context-menu"
      aria-label="Sucursales disponibles"
      role="menu"
      data-placement={placement}
      style={{ ...floatingStyles, visibility: positioned ? 'visible' : 'hidden' }}
      onKeyDown={floatingMenuKeyboard}
    >
      <strong>{organizationName}</strong>
      {branches.map((branch) => (
        <button
          type="button"
          key={branch.id}
          role="menuitemradio"
          aria-checked={branch.id === selectedId}
          aria-current={branch.id === selectedId ? 'true' : undefined}
          onClick={() => {
            onSelect(branch.id);
          }}
        >
          <span>{friendlyBranch(branch.name)}</span>
          {branch.id === selectedId && <span aria-hidden="true">✓</span>}
        </button>
      ))}
      <a href="/control-plane/branches" role="menuitem">
        Administrar sucursales
      </a>
    </div>
  );
}

function OrganizationMenu({
  id,
  floatingRef,
  floatingStyles,
  positioned,
  placement,
  organizations,
  selectedId,
  onSelect,
  onClose,
}: {
  id: string;
  floatingRef: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
  positioned: boolean;
  placement: string;
  organizations: { id: string; name: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      id={id}
      ref={floatingRef}
      className="context-menu"
      role="menu"
      aria-label="Negocios disponibles"
      data-placement={placement}
      style={{ ...floatingStyles, visibility: positioned ? 'visible' : 'hidden' }}
      onKeyDown={floatingMenuKeyboard}
    >
      <strong>Negocio activo</strong>
      {organizations.map((organization) => (
        <button
          type="button"
          role="menuitemradio"
          aria-checked={organization.id === selectedId}
          key={organization.id}
          onClick={() => {
            if (organization.id === selectedId) onClose();
            else onSelect(organization.id);
          }}
        >
          <span>{organization.name}</span>
          {organization.id === selectedId && <span aria-hidden="true">✓</span>}
        </button>
      ))}
      <a href="/control-plane/organizations" role="menuitem">
        Administrar negocios
      </a>
    </div>
  );
}

function AccountMenu({ id, identity }: { id: string; identity: Identity }) {
  return (
    <div
      id={id}
      className="account-menu unified-account-menu"
      role="menu"
      aria-label="Menú de usuario"
      onKeyDown={floatingMenuKeyboard}
    >
      <div role="none">
        <Avatar name={identity.displayName} url={identity.avatarUrl} large />
        <span>
          <strong>{identity.displayName}</strong>
          <small>{identity.email}</small>
        </span>
      </div>
      <hr />
      <a href="/settings/profile" role="menuitem">
        Perfil
      </a>
      <a href="/help" role="menuitem">
        Centro de ayuda
      </a>
      <button className="account-logout" role="menuitem" onClick={() => void logout()}>
        Cerrar sesión
      </button>
    </div>
  );
}

function floatingMenuKeyboard(event: ReactKeyboardEvent<HTMLElement>) {
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]'),
  ).filter((item) => !item.hasAttribute('disabled'));
  if (items.length === 0) return;
  event.preventDefault();
  const current = items.indexOf(document.activeElement as HTMLElement);
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? items.length - 1
        : event.key === 'ArrowDown'
          ? (current + 1) % items.length
          : (current - 1 + items.length) % items.length;
  items[next]?.focus();
}

function focusOpenMenu(event: ReactKeyboardEvent<HTMLElement>, menuId: string) {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  event.preventDefault();
  requestAnimationFrame(() => {
    const items = document
      .getElementById(menuId)
      ?.querySelectorAll<HTMLElement>('[role^="menuitem"]');
    const item =
      !items || items.length === 0
        ? undefined
        : event.key === 'ArrowUp'
          ? items.item(items.length - 1)
          : items.item(0);
    item?.focus();
  });
}

function ContextIcon({ type }: { type: 'organization' | 'branch' }) {
  return type === 'organization' ? (
    <svg className="context-selector__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V8l8-4 8 4v12M8 20v-6h8v6M8 9h.01M12 9h.01M16 9h.01" />
    </svg>
  ) : (
    <svg className="context-selector__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function ContextChevron() {
  return (
    <svg className="context-selector__chevron" viewBox="0 0 20 20" aria-hidden="true">
      <path d="m6 8 4 4 4-4" />
    </svg>
  );
}

function friendlyBranch(value: string) {
  return value === 'Main Branch' ? 'Centro' : value;
}
function roleName(value: string) {
  return (
    (
      {
        OWNER: 'Propietario',
        ADMIN: 'Administrador',
        SUPERVISOR: 'Supervisor',
        CASHIER: 'Cajero',
        EMPLOYEE: 'Empleado',
        ACCOUNTANT: 'Contador',
      } as Record<string, string>
    )[value] ?? value
  );
}
function sceneFor(module: NexoShellModule): LivingSceneVariant {
  return module === 'help' ? 'minimal' : module;
}
function initials(value: string) {
  const result = value
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return result.length > 0 ? result : 'HC';
}
function Avatar({
  name,
  url,
  large = false,
}: {
  name: string;
  url: string | null | undefined;
  large?: boolean;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retry, setRetry] = useState(0);
  const retryTimer = useRef<number | null>(null);
  useEffect(() => {
    setImageLoaded(false);
    setRetry(0);
    return () => {
      if (retryTimer.current !== null) window.clearTimeout(retryTimer.current);
    };
  }, [url]);
  const reachableUrl = url ? browserReachableUrl(url).toString() : url;
  const source =
    reachableUrl && retry > 0
      ? `${reachableUrl}${reachableUrl.includes('?') ? '&' : '?'}avatarRetry=${String(retry)}`
      : reachableUrl;
  return (
    <span className={`avatar${large ? ' large' : ''}`}>
      <span className="avatar__fallback" aria-hidden="true">
        {initials(name)}
      </span>
      {url ? (
        <img
          key={source}
          src={source ?? undefined}
          alt=""
          className={imageLoaded ? 'is-loaded' : ''}
          ref={(node) => {
            if (node?.complete && node.naturalWidth > 0) setImageLoaded(true);
          }}
          onLoad={() => {
            setImageLoaded(true);
          }}
          onError={() => {
            setImageLoaded(false);
            if (retry < 3) {
              retryTimer.current = window.setTimeout(
                () => {
                  setRetry((current) => current + 1);
                },
                300 * (retry + 1),
              );
            }
          }}
        />
      ) : null}
    </span>
  );
}
function applyTheme(value: 'dark') {
  document.documentElement.dataset.theme = value;
  document.documentElement.style.colorScheme = value;
}
function commandDescription(module: NexoShellModule) {
  const descriptions: Record<NexoShellModule, string> = {
    home: 'Resumen de tu negocio y actividad reciente',
    sales: 'Consulta ventas, devoluciones y recibos',
    cash: 'Revisa sesiones, efectivo y movimientos',
    products: 'Administra tu catálogo comercial',
    inventory: 'Consulta existencias y movimientos',
    reports: 'Indicadores y análisis autorizados',
    team: 'Gestiona integrantes y accesos',
    settings: 'Configura tu negocio y preferencias',
    help: 'Encuentra respuestas y diagnóstico seguro',
  };
  return descriptions[module];
}
async function logout(returnTo = '') {
  const response = await apiFetch(`${apiBase}/v1/auth/logout`, {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken() },
  });
  // Consume the 204 transport before navigating. Chromium otherwise reports a
  // successful logout as aborted when the document unloads immediately.
  await response.text();
  await clearBrowserSessionCookies();
  await new Promise((resolve) => window.setTimeout(resolve, 50));
  window.location.assign(returnTo ? `/?returnTo=${encodeURIComponent(returnTo)}` : '/');
}
function formatRemaining(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, '0')}`;
}
