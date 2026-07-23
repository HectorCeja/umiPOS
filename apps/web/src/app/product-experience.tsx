'use client';

import {
  Button,
  FileUpload,
  ProductGalleryPicker,
  RolePicker,
  SaveStatus,
  ScheduleEditor,
  TextField,
  LivingScene,
  KpiCard,
  NexoIcon,
  NexoSelect,
  type DaySchedule,
  type MutationState,
} from '@nexo/ui';
import { useEffect, useState, type FormEvent } from 'react';
import {
  AnimatedProgress,
  EditorialHeadline,
  GlassPanel,
  NexoWordmark,
} from './cinematic-experience';
import { NexoAppShell } from './global-shell';
import { apiFetch, browserUuid, clearBrowserSessionCookies } from '../lib/api-client';
import { ContextualHelp } from './contextual-help';
import { categoryPresets, cashPointPresets, inventoryLocationPresets } from './business-presets';
import { resolveActiveOrganization } from './active-organization';
import { ProductIcon, productIconChoices, resolveProductIcon } from './product-icon-registry';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

interface Identity {
  displayName: string;
  email: string;
  avatarUrl?: string | null;
}
interface Overview {
  statuses?: { status: string; _count: { _all: number } }[];
  pendingOutbox?: number;
  soldAmountMinor?: string;
}
interface OnboardingState {
  status: 'DRAFT' | 'COMPLETED';
  currentStep: number;
  version: number;
  businessType: string | null;
  templateKey: string | null;
  answers: Record<string, unknown>;
}
interface Branch {
  id: string;
  name: string;
  status: string;
}

export function ProductExperience() {
  const [state, setState] = useState<
    'restoring' | 'signed-out' | 'routing' | 'onboarding' | 'ready' | 'no-access'
  >('restoring');
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [organizationId, setOrganizationId] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState('');

  const loadWorkspace = async (currentIdentity: Identity) => {
    setIdentity(currentIdentity);
    setState('routing');
    const resolved = await resolveActiveOrganization();
    const activeOrganization = resolved.organization;
    if (!activeOrganization) {
      setState('no-access');
      return;
    }
    setOrganizationId(activeOrganization.id);
    const [onboardingResponse, branchesResponse] = await Promise.all([
      apiFetch(`${apiBase}/v1/organizations/${activeOrganization.id}/onboarding`, {
        credentials: 'include',
        cache: 'no-store',
      }),
      apiFetch(`${apiBase}/v1/organizations/${activeOrganization.id}/branches`, {
        credentials: 'include',
      }),
    ]);
    if (onboardingResponse.status === 401) {
      setState('signed-out');
      return;
    }
    if (onboardingResponse.status === 403 || onboardingResponse.status === 404) {
      setState('no-access');
      return;
    }
    const onboardingValue = (await onboardingResponse.json()) as OnboardingState;
    setOnboarding(onboardingValue);
    if (branchesResponse.ok) {
      const values = (await branchesResponse.json()) as Branch[];
      setBranches(values.filter((branch) => branch.status === 'ACTIVE'));
      if (values[0]) setActiveBranch(values[0].id);
    }
    setState(onboardingValue.status === 'COMPLETED' ? 'ready' : 'onboarding');
  };
  useEffect(() => {
    // A renewable browser session always carries the readable CSRF companion
    // cookie. Do not probe protected identity/refresh endpoints for a genuine
    // signed-out visitor; that produced noisy 401s before rendering Login.
    if (!csrfToken()) {
      setState('signed-out');
      return;
    }
    void apiFetch(`${apiBase}/v1/identity`, { credentials: 'include' }).then(async (response) => {
      if (!response.ok) {
        setState('signed-out');
        return;
      }
      await loadWorkspace((await response.json()) as Identity);
    });
  }, []);
  useEffect(() => {
    if (state !== 'ready' || !organizationId || !activeBranch) return;
    const url = `${apiBase}/v1/organizations/${organizationId}/sales-administration/overview?branchId=${activeBranch}`;
    void apiFetch(url, { credentials: 'include' }).then(async (response) => {
      if (response.ok) setOverview((await response.json()) as Overview);
    });
  }, [activeBranch, organizationId, state]);

  if (state === 'restoring' || state === 'routing') return <Splash />;
  if (state === 'signed-out')
    return (
      <Login
        onSuccess={(value) => {
          void loadWorkspace(value).then(() => {
            const returnTo = new URLSearchParams(window.location.search).get('returnTo');
            if (returnTo?.startsWith('/') && !returnTo.startsWith('//')) {
              window.location.assign(returnTo);
            }
          });
        }}
      />
    );
  if (state === 'no-access') return <NoAccess identity={identity} />;
  if (state === 'onboarding' && onboarding)
    return (
      <GuidedOnboarding
        organizationId={organizationId}
        identity={identity}
        state={onboarding}
        onUpdate={setOnboarding}
        onComplete={() => {
          setState('ready');
        }}
      />
    );

  const displayName = identity?.displayName ?? 'Usuario';
  const firstName = displayName.split(' ')[0];
  const activeBranchName = friendlyBranch(
    branches.find((branch) => branch.id === activeBranch)?.name ?? 'Centro',
  );
  const count = (status: string) =>
    overview?.statuses?.find((item) => item.status === status)?._count._all ?? 0;
  return (
    <NexoAppShell
      active="home"
      branches={branches}
      activeBranchId={activeBranch}
      onBranchChange={setActiveBranch}
      rawContent
    >
      <main id="main-content" className="product-main">
        <section className="hero-row">
          <div>
            <p className="home-greeting">Buenos días,</p>
            <h1 aria-label={`Buenos días, ${firstName ?? 'Usuario'}`}>
              {firstName ?? 'Usuario'}
              <span aria-hidden="true">.</span>
            </h1>
            <p>Aquí tienes un resumen de tu negocio.</p>
          </div>
          <blockquote className="home-editorial-message" data-editorial-reveal>
            “Enfócate en el cliente.
            <br />
            NEXO ordena el resto.”
          </blockquote>
        </section>

        <section className="metric-grid" aria-label="Resumen del día">
          <KpiCard
            icon={<NexoIcon name="receipt" decorative />}
            label="Ventas Hoy"
            value={overview ? `$${money(overview.soldAmountMinor)}` : 'Preparando ventas…'}
            detail={`${String(count('COMPLETED'))} completadas`}
            tone="success"
          />
          <KpiCard
            icon={<NexoIcon name="chart" decorative />}
            label="Ingresos"
            value={overview ? `$${money(overview.soldAmountMinor)}` : 'Calculando ingresos…'}
            detail="Ventas confirmadas"
            tone="info"
          />
          <KpiCard
            icon={<NexoIcon name="receipt" decorative />}
            label="Ticket Promedio"
            value={
              overview && count('COMPLETED') > 0
                ? `$${money(String(Number(overview.soldAmountMinor ?? 0) / count('COMPLETED')))}`
                : 'Sin ventas'
            }
            detail="Por operación completada"
            tone="success"
          />
          <KpiCard
            icon={<NexoIcon name="cash-register" decorative />}
            label="Caja"
            value={overview ? 'En línea' : 'Verificando caja…'}
            detail={`Sucursal ${activeBranchName}`}
            tone="accent"
          />
          <KpiCard
            icon={<NexoIcon name="chart" decorative />}
            label="Actualizaciones"
            value={overview ? String(overview.pendingOutbox ?? 0) : 'Sincronizando operación…'}
            detail="Cambios por confirmar"
            tone="warning"
          />
        </section>

        <section className="home-operations-grid">
          <article className="premium-card home-sales-overview">
            <div className="card-heading">
              <div>
                <h2>Ventas</h2>
                <strong>
                  {overview ? `$${money(overview.soldAmountMinor)}` : 'Actualizando ventas…'}
                </strong>
                <small>Ventas confirmadas en el periodo actual</small>
              </div>
              <a href="/sales">Ver ventas</a>
            </div>
            <div
              className="home-chart no-series"
              role="img"
              aria-label={`Ventas confirmadas: ${overview ? `$${money(overview.soldAmountMinor)}` : 'cargando'}`}
            >
              <span className="home-chart__line" />
              <div>
                <span>Lun</span>
                <span>Mar</span>
                <span>Mié</span>
                <span>Jue</span>
                <span>Vie</span>
                <span>Sáb</span>
                <span>Dom</span>
              </div>
              <p>La serie diaria aparecerá cuando exista un desglose temporal autorizado.</p>
            </div>
          </article>
          <article className="premium-card home-activity-panel">
            <div className="card-heading">
              <h2>Actividad Reciente</h2>
              <a href="/sales/history">Ver todo</a>
            </div>
            <div className="home-activity-item">
              <span>
                <NexoIcon name="check" decorative />
              </span>
              <span>
                <strong>Ventas procesadas</strong>
                <small>{String(count('COMPLETED'))} operaciones completadas</small>
              </span>
              <time>Hoy</time>
            </div>
            <div className="home-activity-item">
              <span>
                <NexoIcon name="cash-register" decorative />
              </span>
              <span>
                <strong>Estado de caja</strong>
                <small>Consulta el resumen de la sucursal</small>
              </span>
              <time>Ahora</time>
            </div>
            <div className="home-activity-item">
              <span>
                <NexoIcon name="warehouse" decorative />
              </span>
              <span>
                <strong>Inventario conectado</strong>
                <small>Disponibilidad y movimientos</small>
              </span>
              <time>En línea</time>
            </div>
          </article>
          <div className="home-side-stack">
            <article className="premium-card home-alerts">
              <div className="card-heading">
                <h2>Alertas de Inventario</h2>
                <a href="/inventory">Ver todo</a>
              </div>
              <div className="home-honest-empty">
                <span>
                  <NexoIcon name="check" decorative />
                </span>
                <p>
                  <strong>Sin alertas críticas</strong>
                  <small>Las alertas aparecerán aquí cuando requieran atención.</small>
                </p>
              </div>
            </article>
            <article className="premium-card home-goal">
              <div className="card-heading">
                <h2>Objetivos del día</h2>
                <a href="/control-plane/settings">Configurar</a>
              </div>
              <div>
                <span className="goal-ring">○</span>
                <p>
                  <strong>Define una meta de ventas</strong>
                  <small>Agrega un objetivo para seguir el progreso diario.</small>
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="premium-card home-quick-actions" aria-labelledby="quick-actions-title">
          <h2 id="quick-actions-title">Acciones Rápidas</h2>
          <div>
            <a href="/sales/history">
              <span>
                <NexoIcon name="search" decorative />
              </span>
              <span>
                <strong>Buscar venta</strong>
                <small>Abrir historial</small>
              </span>
            </a>
            <a href="/products">
              <span>
                <NexoIcon name="package" decorative />
              </span>
              <span>
                <strong>Agregar producto</strong>
                <small>Nuevo al catálogo</small>
              </span>
            </a>
            <a href="/inventory">
              <span>
                <NexoIcon name="warehouse" decorative />
              </span>
              <span>
                <strong>Ajustar inventario</strong>
                <small>Actualizar stock</small>
              </span>
            </a>
            <a href="/sales">
              <span>
                <NexoIcon name="chart" decorative />
              </span>
              <span>
                <strong>Reporte de ventas</strong>
                <small>Ver resumen</small>
              </span>
            </a>
            <a href="/cash">
              <span>
                <NexoIcon name="cash-register" decorative />
              </span>
              <span>
                <strong>Administrar caja</strong>
                <small>Sesión y cierre</small>
              </span>
            </a>
          </div>
        </section>
      </main>
    </NexoAppShell>
  );
}

const onboardingJourney = [
  'Bienvenida',
  'Tu negocio',
  'Tipo de negocio',
  'Región',
  'Sucursal',
  'Horarios',
  'Caja',
  'Catálogo',
  'Inventario',
  'Equipo',
  'Revisión y lanzamiento',
] as const;
const businessTypes = [
  { value: 'COFFEE_SHOP', label: 'Cafetería', icon: '☕' },
  { value: 'RESTAURANT', label: 'Restaurante', icon: '🍽️' },
  { value: 'RETAIL', label: 'Tienda', icon: '🛍️' },
  { value: 'SERVICES', label: 'Servicios', icon: '🧰' },
  { value: 'BARBERSHOP', label: 'Barbería', icon: '✂️' },
  { value: 'SALON', label: 'Salón', icon: '✨' },
  { value: 'GENERAL_COMMERCE', label: 'Comercio general', icon: '📦' },
  { value: 'OTHER', label: 'Otro', icon: '🧩' },
];
const scheduleDays: [string, string][] = [
  ['monday', 'Lunes'],
  ['tuesday', 'Martes'],
  ['wednesday', 'Miércoles'],
  ['thursday', 'Jueves'],
  ['friday', 'Viernes'],
  ['saturday', 'Sábado'],
  ['sunday', 'Domingo'],
];
const defaultSchedule: DaySchedule[] = scheduleDays.map(([id, label], index) => ({
  id,
  label,
  enabled: index < 6,
  allDay: false,
  intervals: [{ open: index < 5 ? '07:00' : '08:00', close: index < 5 ? '21:00' : '16:00' }],
}));
const catalogSuggestions = [
  {
    id: 'espresso',
    name: 'Espresso',
    category: 'Café',
    price: '45',
    icon: '☕',
    description: 'Intenso y directo',
  },
  {
    id: 'americano',
    name: 'Americano',
    category: 'Café',
    price: '52',
    icon: '☕',
    description: 'Clásico de la casa',
  },
  {
    id: 'latte',
    name: 'Latte',
    category: 'Bebidas',
    price: '68',
    icon: '🥛',
    description: 'Suave y cremoso',
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew',
    category: 'Bebidas frías',
    price: '72',
    icon: '🧊',
    description: 'Extracción en frío',
  },
  {
    id: 'croissant',
    name: 'Croissant',
    category: 'Panadería',
    price: '48',
    icon: '🥐',
    description: 'Panadería del día',
  },
  {
    id: 'brownie',
    name: 'Brownie',
    category: 'Postres',
    price: '55',
    icon: '🍫',
    description: 'Chocolate intenso',
  },
];
function templateFor(value: string) {
  return (
    (
      {
        COFFEE_SHOP: 'coffee-shop',
        RESTAURANT: 'restaurant',
        RETAIL: 'retail',
        SERVICES: 'professional-services',
        BARBERSHOP: 'barbershop',
        SALON: 'beauty-salon',
        GENERAL_COMMERCE: 'retail',
        OTHER: 'professional-services',
      } as Record<string, string>
    )[value] ?? 'professional-services'
  );
}
function SelectField({
  label,
  value,
  onChange,
  options,
  id,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  id?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <NexoSelect
      className="select-field"
      {...(id ? { id } : {})}
      label={label}
      required={required}
      {...(error ? { error } : {})}
      value={value}
      onValueChange={onChange}
      options={options.map(([optionValue, name]) => ({ value: optionValue, label: name }))}
    />
  );
}
async function readImage(file: File | undefined, update: (value: string) => void) {
  if (!file) return;
  if (file.size === 0) throw new Error('El archivo está vacío.');
  if (file.size > 1_000_000) throw new Error('La imagen debe pesar menos de 1 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes
    .slice(0, 8)
    .every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  const webp =
    new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP';
  if (!jpeg && !png && !webp) throw new Error('Selecciona una imagen PNG, JPEG o WebP válida.');
  const result = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reject(new Error('No pudimos leer la imagen. Selecciona otro archivo.'));
    };
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('No pudimos crear la vista previa.'));
    };
    reader.readAsDataURL(file);
  });
  update(result);
}

function GuidedOnboarding({
  organizationId,
  identity,
  state,
  onUpdate,
  onComplete,
}: {
  organizationId: string;
  identity: Identity | null;
  state: OnboardingState;
  onUpdate: (state: OnboardingState) => void;
  onComplete: () => void;
}) {
  const initialJourneyStep = Math.min(
    Math.max(
      typeof state.answers.journeyStep === 'number'
        ? state.answers.journeyStep
        : (state.currentStep - 1) * 3,
      0,
    ),
    10,
  );
  const [step, setStep] = useState(initialJourneyStep);
  const [businessName, setBusinessName] = useState(
    typeof state.answers.businessName === 'string' ? state.answers.businessName : '',
  );
  const [branchName, setBranchName] = useState(
    typeof state.answers.branchName === 'string' ? state.answers.branchName : 'Centro',
  );
  const answer = (key: string, fallback: string) =>
    typeof state.answers[key] === 'string' ? String(state.answers[key]) : fallback;
  const [businessType, setBusinessType] = useState(answer('businessType', 'COFFEE_SHOP'));
  const [legalName, setLegalName] = useState(answer('legalName', ''));
  const [phone, setPhone] = useState(answer('phone', ''));
  const [country, setCountry] = useState(answer('country', 'MX'));
  const [currency, setCurrency] = useState(answer('currency', 'MXN'));
  const [locale, setLocale] = useState(answer('locale', 'es-MX'));
  const [timeZone, setTimeZone] = useState(answer('timeZone', 'America/Mazatlan'));
  const [branchCode, setBranchCode] = useState(answer('branchCode', 'CENTRO'));
  const [schedule, setSchedule] = useState<DaySchedule[]>(() => {
    const saved = state.answers.schedule;
    return Array.isArray(saved) ? (saved as DaySchedule[]) : defaultSchedule;
  });
  const [registerName, setRegisterName] = useState(answer('registerName', 'Caja principal'));
  const [registerCode, setRegisterCode] = useState(answer('registerCode', 'CAJA-01'));
  const [openingFloat, setOpeningFloat] = useState(answer('openingFloat', '1000'));
  const [catalogChoice, setCatalogChoice] = useState(answer('catalogChoice', 'template'));
  const [catalogItems, setCatalogItems] = useState(
    answer('catalogItems', 'Espresso, Americano, Latte'),
  );
  const [customProduct, setCustomProduct] = useState(() => {
    const saved = state.answers.customProduct;
    return typeof saved === 'object' && saved
      ? (saved as {
          name?: string;
          description?: string;
          category?: string;
          price?: string;
          icon?: string;
          image?: string;
          sku?: string;
          barcode?: string;
          inventory?: boolean;
          available?: boolean;
        })
      : {
          name: '',
          description: '',
          category: '',
          price: '',
          icon: 'package',
          image: '',
          sku: '',
          barcode: '',
          inventory: false,
          available: true,
        };
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>(() => {
    const saved = state.answers.selectedProducts;
    return Array.isArray(saved) ? (saved as string[]) : ['espresso', 'americano', 'latte'];
  });
  const [inventoryEnabled, setInventoryEnabled] = useState(
    answer('inventoryEnabled', 'true') === 'true',
  );
  const [inventoryLocation, setInventoryLocation] = useState(
    answer('inventoryLocation', 'Almacén Centro'),
  );
  const [teamEmail, setTeamEmail] = useState(answer('teamEmail', ''));
  const [teamRole, setTeamRole] = useState(answer('teamRole', 'SUPERVISOR'));
  const [logo, setLogo] = useState(answer('logoDataUrl', ''));
  const [saving, setSaving] = useState(false);
  const [mutationState, setMutationState] = useState<MutationState>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [productImageError, setProductImageError] = useState('');
  const [productImageBusy, setProductImageBusy] = useState(false);
  const backendStep = Math.min(4, Math.floor(step / 3) + 1);
  const progress = Math.round(((step + 1) / onboardingJourney.length) * 100);

  async function persist(nextStep: number) {
    setSaving(true);
    setMutationState('saving');
    setError('');
    const response = await apiFetch(`${apiBase}/v1/organizations/${organizationId}/onboarding`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify({
        version: state.version,
        currentStep: Math.min(4, Math.floor(nextStep / 3) + 1),
        businessType,
        templateKey: templateFor(businessType),
        answers: {
          ...state.answers,
          businessName,
          branchName,
          businessType,
          legalName,
          phone,
          country,
          locale,
          currency,
          timeZone,
          branchCode,
          openTime: schedule[0]?.intervals[0]?.open ?? '07:00',
          closeTime: schedule[0]?.intervals[0]?.close ?? '21:00',
          weekends: schedule.filter((day) => day.enabled).length,
          schedule,
          registerName,
          registerCode,
          openingFloat,
          catalogChoice,
          catalogItems,
          customProduct,
          selectedProducts,
          inventoryEnabled: String(inventoryEnabled),
          inventoryLocation,
          teamEmail,
          teamRole,
          logoDataUrl: logo,
          journeyStep: nextStep,
        },
      }),
    });
    if (!response.ok) {
      setError(
        response.status === 403
          ? 'Tu cuenta no tiene permiso para configurar este negocio.'
          : 'No pudimos guardar el avance. Tu información sigue en esta pantalla; intenta de nuevo.',
      );
      setSaving(false);
      setMutationState(response.status === 409 ? 'conflict' : 'error');
      return false;
    }
    onUpdate((await response.json()) as OnboardingState);
    setSaving(false);
    setMutationState('success');
    return true;
  }

  async function next() {
    const invalid = validateStep();
    if (invalid) {
      setFieldErrors({ [invalid.id]: invalid.message });
      setError(invalid.message);
      requestAnimationFrame(() => {
        document.getElementById(invalid.id)?.focus({ preventScroll: false });
        document.getElementById(invalid.id)?.scrollIntoView({ block: 'center' });
      });
      return;
    }
    setFieldErrors({});
    const nextStep = Math.min(step + 1, onboardingJourney.length - 1);
    if (!(await persist(nextStep))) return;
    setStep(nextStep);
  }

  function validateStep(): { id: string; message: string } | null {
    if (step === 1 && !businessName.trim())
      return {
        id: 'onboarding-business-name',
        message: 'Escribe el nombre de tu negocio para continuar.',
      };
    if (step === 3 && !country)
      return {
        id: 'onboarding-country',
        message: 'Selecciona el país de tu negocio para continuar.',
      };
    if (step === 3 && !currency)
      return {
        id: 'onboarding-currency',
        message: 'Selecciona la moneda de tu negocio para continuar.',
      };
    if (step === 3 && !locale)
      return {
        id: 'onboarding-locale',
        message: 'Selecciona el idioma de tu equipo para continuar.',
      };
    if (step === 3 && !timeZone)
      return { id: 'onboarding-time-zone', message: 'Selecciona la zona horaria para continuar.' };
    if (step === 4 && !branchName.trim())
      return {
        id: 'onboarding-branch-name',
        message: 'Escribe el nombre de la sucursal principal para continuar.',
      };
    const creatingCustom = catalogChoice === 'empty' || Boolean(customProduct.name?.trim());
    if (step === 7 && creatingCustom && !customProduct.name?.trim())
      return {
        id: 'onboarding-product-name',
        message: 'Escribe el nombre del producto para continuar.',
      };
    if (step === 7 && creatingCustom && !customProduct.category?.trim())
      return {
        id: 'onboarding-product-category',
        message: 'Selecciona o escribe una categoría para continuar.',
      };
    if (step === 7 && creatingCustom && (!customProduct.price || Number(customProduct.price) <= 0))
      return {
        id: 'onboarding-product-price',
        message: 'Confirma un precio mayor a cero para continuar.',
      };
    if (
      step === 7 &&
      catalogChoice === 'template' &&
      selectedProducts.length === 0 &&
      !creatingCustom
    )
      return {
        id: 'custom-product-title',
        message: 'Selecciona al menos un producto o crea uno propio para continuar.',
      };
    return null;
  }

  async function finish() {
    if (backendStep < 4 && !(await persist(10))) return;
    setSaving(true);
    if (!(await provisionCustomProduct())) {
      setSaving(false);
      return;
    }
    const current = backendStep < 4 ? { ...state, version: state.version + 1 } : state;
    const response = await apiFetch(
      `${apiBase}/v1/organizations/${organizationId}/onboarding/complete`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
        body: JSON.stringify({ version: current.version }),
      },
    );
    if (!response.ok) {
      setError('La configuración cambió. Actualiza la página para recuperar el avance guardado.');
      setSaving(false);
      return;
    }
    onComplete();
  }

  async function provisionCustomProduct() {
    if (!customProduct.name?.trim()) return true;
    const lookup = await apiFetch(
      `${apiBase}/v1/organizations/${organizationId}/products?q=${encodeURIComponent(customProduct.sku?.trim() ? customProduct.sku : customProduct.name)}`,
    );
    if (!lookup.ok) {
      setError(
        `No pudimos preparar “${customProduct.name || 'tu producto'}”. Revisa su nombre, precio y categoría; después intenta terminar nuevamente.`,
      );
      return false;
    }
    const existing = (await lookup.json()) as { id: string; name: string; sku?: string | null }[];
    if (
      existing.some(
        (item) =>
          (Boolean(customProduct.sku) && item.sku === customProduct.sku) ||
          normalizeName(item.name) === normalizeName(customProduct.name ?? ''),
      )
    )
      return true;
    let categoryId: string | undefined;
    if (customProduct.category?.trim()) {
      const listed = await apiFetch(
        `${apiBase}/v1/organizations/${organizationId}/product-categories`,
      );
      const categories = listed.ok ? ((await listed.json()) as { id: string; name: string }[]) : [];
      const found = categories.find(
        (item) => normalizeName(item.name) === normalizeName(customProduct.category ?? ''),
      );
      if (found) categoryId = found.id;
      else {
        const createdCategory = await onboardingWrite(
          `/v1/organizations/${organizationId}/product-categories`,
          {
            name: customProduct.category.trim(),
            slug: slugValue(customProduct.category),
          },
        );
        if (!createdCategory.ok) {
          setError('La categoría ya existe o no pudo crearse. Elige una categoría existente.');
          return false;
        }
        categoryId = ((await createdCategory.json()) as { id: string }).id;
      }
    }
    const created = await onboardingWrite(`/v1/organizations/${organizationId}/products`, {
      name: customProduct.name.trim(),
      sku: customProduct.sku?.trim() ? customProduct.sku.trim() : undefined,
      type: 'PHYSICAL',
      description: customProduct.description?.trim() ? customProduct.description.trim() : undefined,
      unitCode: 'H87',
      categoryId,
      iconKey: resolveProductIcon(customProduct.icon),
    });
    if (!created.ok) {
      setError(
        'No pudimos crear el producto. Revisa el nombre y SKU; tu formulario sigue intacto.',
      );
      return false;
    }
    const product = (await created.json()) as { id: string };
    const detailResponse = await apiFetch(
      `${apiBase}/v1/organizations/${organizationId}/products/${product.id}`,
    );
    const detail = (await detailResponse.json()) as {
      version: number;
      variants?: { id: string; isDefault: boolean }[];
    };
    const variant = detail.variants?.find((item) => item.isDefault);
    if (customProduct.price && variant) {
      const priced = await onboardingWrite(
        `/v1/organizations/${organizationId}/products/${product.id}/prices`,
        { variantId: variant.id, amount: customProduct.price, currency, unitCode: 'H87' },
      );
      if (!priced.ok) return onboardingProductFailure('precio');
    }
    if (customProduct.barcode) {
      const coded = await onboardingWrite(
        `/v1/organizations/${organizationId}/products/${product.id}/barcodes`,
        { type: 'INTERNAL', value: customProduct.barcode, isPrimary: true },
      );
      if (!coded.ok) return onboardingProductFailure('código de barras');
    }
    if (customProduct.image) {
      const image = dataUrlFile(customProduct.image, `${slugValue(customProduct.name)}.png`);
      const prepared = await onboardingWrite(
        `/v1/organizations/${organizationId}/products/${product.id}/media/uploads`,
        { contentType: image.type, altText: customProduct.name, fileName: image.name },
      );
      if (!prepared.ok) return onboardingProductFailure('imagen');
      const upload = (await prepared.json()) as {
        id: string;
        uploadUrl: string;
      };
      const sent = await apiFetch(upload.uploadUrl, {
        method: 'PUT',
        headers: { 'content-type': image.type },
        body: image,
      });
      if (!sent.ok) return onboardingProductFailure('imagen');
      await sent.arrayBuffer();
      const completed = await onboardingWrite(
        `/v1/organizations/${organizationId}/products/${product.id}/media/complete`,
        { mediaId: upload.id },
      );
      if (!completed.ok) return onboardingProductFailure('imagen');
    }
    const activated = await onboardingWrite(
      `/v1/organizations/${organizationId}/products/${product.id}/activate`,
      { version: detail.version },
    );
    if (!activated.ok) return onboardingProductFailure('activación');
    return true;
  }

  function onboardingWrite(path: string, body: unknown) {
    return apiFetch(`${apiBase}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-csrf-token': csrfToken() },
      body: JSON.stringify(body),
    });
  }

  function onboardingProductFailure(stage: string) {
    setError(
      `El producto se creó, pero falló su ${stage}. Puedes intentar de nuevo sin perder datos.`,
    );
    return false;
  }

  return (
    <LivingScene
      image={onboardingScene(step)}
      variant="onboarding"
      quality="high"
      className="ambient-experience ambient-experience--onboarding"
    >
      <main className="guided-onboarding" data-step={String(step)}>
        <aside className="onboarding-rail">
          <a className="cinematic-brand" href="/" aria-label="NEXO">
            <NexoWordmark compact />
          </a>
          <button
            className="onboarding-logout"
            type="button"
            onClick={() => void logoutAndReload()}
          >
            Cerrar sesión
          </button>
          <div className="onboarding-progress-copy">
            <span>Tu espacio de trabajo</span>
            <strong>{progress}% listo</strong>
          </div>
          <div
            className="onboarding-progress"
            role="progressbar"
            aria-label="Progreso de configuración"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span style={{ width: `${String(progress)}%` }} />
          </div>
          <ol>
            {onboardingJourney.map((label, index) => (
              <li key={label} className={index === step ? 'current' : index < step ? 'done' : ''}>
                <span>{index < step ? '✓' : String(index + 1)}</span>
                {label}
              </li>
            ))}
          </ol>
          <small>Tu avance se guarda automáticamente.</small>
        </aside>
        <section className="onboarding-stage">
          <header data-nexo-toast-safe-area>
            <span>Hola, {identity?.displayName ?? 'Usuario'}</span>
          </header>
          <div className="onboarding-editorial" aria-hidden="true">
            <span>Bienvenido a tu centro de operaciones.</span>
            <EditorialHeadline>{onboardingTitle(step)}</EditorialHeadline>
            <p>{onboardingDescription(step)}</p>
            <div className="journey-summary">
              {[
                'Negocio',
                'Sucursal',
                'Catálogo',
                'Inventario',
                'Caja',
                'Equipo',
                'Todo listo',
              ].map((label, index) => (
                <span className={index <= Math.floor((step / 10) * 6) ? 'active' : ''} key={label}>
                  <i>{index < 6 ? index + 1 : '✓'}</i>
                  {label}
                </span>
              ))}
            </div>
          </div>
          <GlassPanel className="onboarding-content">
            <div
              className="onboarding-scroll-container"
              tabIndex={0}
              aria-label="Configuración del paso"
            >
              <p className="overline">
                PASO {String(step + 1)} DE {String(onboardingJourney.length)}
              </p>
              <h1>{step === 0 ? 'Bienvenido' : onboardingTitle(step)}</h1>
              <p className="onboarding-lede">
                {step === 0
                  ? 'Comencemos creando tu espacio de trabajo.'
                  : onboardingDescription(step)}
              </p>
              {error && (
                <div className="login-error" role="alert">
                  <strong>Necesitamos revisar este paso</strong>
                  <p>{error}</p>
                  {step === 7 && (
                    <div className="nexo-cluster">
                      <Button
                        variant="secondary"
                        onClick={() => document.getElementById('custom-product-title')?.focus()}
                      >
                        Revisar producto
                      </Button>
                      <Button onClick={() => void finish()}>Intentar de nuevo</Button>
                    </div>
                  )}
                </div>
              )}
              <SaveStatus state={mutationState} />
              {step === 0 && (
                <div className="onboarding-welcome-card">
                  <img src="/brand/nexo-enterprise-still-life-v2.webp" alt="" />
                  <div>
                    <strong>En unos minutos tendrás una base clara para operar.</strong>
                    <span>Te guiaremos sin pedirte códigos ni información técnica.</span>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="editable-step form-grid">
                  <TextField
                    id="onboarding-business-name"
                    label="Nombre comercial"
                    required
                    error={fieldErrors['onboarding-business-name'] ?? ''}
                    value={businessName}
                    onChange={(e) => {
                      setBusinessName(e.currentTarget.value);
                    }}
                    help="Es el nombre que verá tu equipo."
                  />
                  <TextField
                    label="Razón social (opcional)"
                    value={legalName}
                    onChange={(e) => {
                      setLegalName(e.currentTarget.value);
                    }}
                    help="Puedes completarla más adelante."
                  />
                  <TextField
                    label="Teléfono (opcional)"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.currentTarget.value);
                    }}
                    help="Para contacto del negocio."
                  />
                  <FileUpload
                    label="Logo del negocio"
                    help="PNG, JPEG o WebP; máximo 1 MB."
                    preview={logo}
                    onFile={(file) => {
                      void readImage(file, setLogo).catch((cause: unknown) => {
                        setError(
                          cause instanceof Error ? cause.message : 'No pudimos procesar el logo.',
                        );
                      });
                    }}
                    onRemove={() => {
                      setLogo('');
                    }}
                  />
                </div>
              )}
              {step === 2 && (
                <div className="business-type-grid">
                  {businessTypes.map((type) => (
                    <button
                      aria-pressed={businessType === type.value}
                      className={businessType === type.value ? 'selected' : ''}
                      onClick={() => {
                        setBusinessType(type.value);
                      }}
                      type="button"
                      key={type.value}
                    >
                      <span>{type.icon}</span>
                      <strong>{type.label}</strong>
                      <small>
                        {type.value === 'COFFEE_SHOP'
                          ? 'Sugerido para tu ubicación'
                          : 'Plantilla personalizable'}
                      </small>
                    </button>
                  ))}
                </div>
              )}
              {step === 3 && (
                <div className="editable-step form-grid">
                  <SelectField
                    id="onboarding-country"
                    label="País"
                    required
                    error={fieldErrors['onboarding-country'] ?? ''}
                    value={country}
                    onChange={setCountry}
                    options={[
                      ['MX', 'México'],
                      ['US', 'Estados Unidos'],
                      ['CA', 'Canadá'],
                      ['OTHER', 'Otro'],
                    ]}
                  />
                  <SelectField
                    id="onboarding-currency"
                    label="Moneda"
                    required
                    error={fieldErrors['onboarding-currency'] ?? ''}
                    value={currency}
                    onChange={setCurrency}
                    options={[
                      ['MXN', 'MXN — Peso mexicano'],
                      ['USD', 'USD — Dólar'],
                      ['CAD', 'CAD — Dólar canadiense'],
                    ]}
                  />
                  <SelectField
                    id="onboarding-locale"
                    label="Idioma"
                    required
                    error={fieldErrors['onboarding-locale'] ?? ''}
                    value={locale}
                    onChange={setLocale}
                    options={[
                      ['es-MX', 'Español (México)'],
                      ['en-US', 'English (United States)'],
                    ]}
                  />
                  <SelectField
                    id="onboarding-time-zone"
                    label="Zona horaria"
                    required
                    error={fieldErrors['onboarding-time-zone'] ?? ''}
                    value={timeZone}
                    onChange={setTimeZone}
                    options={[
                      ['America/Mazatlan', 'Mazatlán'],
                      ['America/Mexico_City', 'Ciudad de México'],
                      ['America/Tijuana', 'Tijuana'],
                      ['America/Cancun', 'Cancún'],
                    ]}
                  />
                  <p className="field-note">Valores sugeridos para México; puedes cambiarlos.</p>
                </div>
              )}
              {step === 4 && (
                <div className="editable-step form-grid">
                  <TextField
                    id="onboarding-branch-name"
                    label="Nombre de la primera sucursal"
                    required
                    error={fieldErrors['onboarding-branch-name'] ?? ''}
                    value={branchName}
                    onChange={(e) => {
                      setBranchName(e.currentTarget.value);
                    }}
                    help="Podrás agregar más sucursales después."
                  />
                  <TextField
                    label="Código comercial"
                    value={branchCode}
                    onChange={(e) => {
                      setBranchCode(e.currentTarget.value);
                    }}
                    help="Una referencia corta para tu equipo."
                  />
                </div>
              )}
              {step === 5 && (
                <div className="editable-step">
                  <ScheduleEditor value={schedule} onChange={setSchedule} />
                </div>
              )}
              {step === 6 && (
                <div className="editable-step form-grid">
                  <NexoSelect
                    label="Nombre del punto de cobro"
                    value={registerName}
                    onValueChange={setRegisterName}
                    options={cashPointPresets.map((preset) => ({ value: preset, label: preset }))}
                    searchable
                    allowCustom
                  />
                  <TextField
                    label="Código"
                    value={registerCode}
                    onChange={(e) => {
                      setRegisterCode(e.currentTarget.value);
                    }}
                    help="Visible para administradores."
                  />
                  <TextField
                    label="Fondo inicial sugerido"
                    type="number"
                    value={openingFloat}
                    onChange={(e) => {
                      setOpeningFloat(e.currentTarget.value);
                    }}
                    help={`Importe en ${currency}. La caja validará el monto al abrir.`}
                  />
                </div>
              )}
              {step === 7 && (
                <div className="editable-step">
                  <div
                    className="catalog-start-choices"
                    role="radiogroup"
                    aria-label="Cómo comenzar"
                  >
                    {[
                      ['template', 'Explorar sugerencias', 'Elige productos visualmente.'],
                      ['empty', 'Catálogo vacío', 'Crea ahora tu primer producto.'],
                      ['later', 'Continuar después', 'Guarda este paso para más tarde.'],
                    ].map(([value, title, detail]) => (
                      <button
                        type="button"
                        role="radio"
                        aria-checked={catalogChoice === value}
                        className={catalogChoice === value ? 'selected' : ''}
                        key={value}
                        onClick={() => {
                          setCatalogChoice(value ?? 'later');
                        }}
                      >
                        <i aria-hidden="true">
                          {value === 'template' ? '✦' : value === 'empty' ? '＋' : '→'}
                        </i>
                        <strong>{title}</strong>
                        <small>{detail}</small>
                      </button>
                    ))}
                  </div>
                  {catalogChoice === 'template' && (
                    <ProductGalleryPicker
                      items={catalogSuggestions}
                      selected={selectedProducts}
                      onChange={(ids) => {
                        setSelectedProducts(ids);
                        setCatalogItems(
                          catalogSuggestions
                            .filter((item) => ids.includes(item.id))
                            .map((item) => item.name)
                            .join(', '),
                        );
                      }}
                    />
                  )}
                  <section
                    className="onboarding-product-builder"
                    aria-labelledby="custom-product-title"
                  >
                    <div className="product-builder-heading">
                      <span className="product-builder-preview" aria-hidden="true">
                        <ProductIcon value={customProduct.icon} />
                      </span>
                      <div>
                        <p className="overline">PRODUCTO PERSONALIZADO</p>
                        <h2 id="custom-product-title" tabIndex={-1}>
                          {catalogChoice === 'empty'
                            ? 'Crea tu primer producto'
                            : 'Agrega algo propio'}
                        </h2>
                        <p>
                          Construye una tarjeta visual; podrás completar variantes e inventario
                          después.
                        </p>
                      </div>
                    </div>
                    <fieldset className="icon-choice-grid">
                      <legend>Elige una identidad visual</legend>
                      {productIconChoices.map((icon) => (
                        <button
                          type="button"
                          key={icon.id}
                          aria-label={`Usar icono ${icon.label}`}
                          aria-pressed={resolveProductIcon(customProduct.icon) === icon.id}
                          onClick={() => {
                            setCustomProduct((value) => ({ ...value, icon: icon.id }));
                          }}
                        >
                          <ProductIcon value={icon.id} />
                        </button>
                      ))}
                    </fieldset>
                    <div className="product-builder-fields">
                      <FileUpload
                        label="Imagen del producto"
                        help="PNG, JPEG o WebP; máximo 1 MB."
                        preview={customProduct.image ?? ''}
                        busy={productImageBusy}
                        error={productImageError}
                        onFile={(file) => {
                          setProductImageBusy(true);
                          setProductImageError('');
                          void readImage(file, (image) => {
                            setCustomProduct((value) => ({ ...value, image }));
                          })
                            .catch((cause: unknown) => {
                              setProductImageError(
                                cause instanceof Error
                                  ? cause.message
                                  : 'No pudimos procesar la imagen.',
                              );
                            })
                            .finally(() => {
                              setProductImageBusy(false);
                            });
                        }}
                        onRemove={() => {
                          setProductImageError('');
                          setCustomProduct((value) => ({ ...value, image: '' }));
                        }}
                      />
                      <TextField
                        id="onboarding-product-name"
                        label="Nombre"
                        required={catalogChoice === 'empty'}
                        error={fieldErrors['onboarding-product-name'] ?? ''}
                        value={customProduct.name ?? ''}
                        onChange={(event) => {
                          const name = event.currentTarget.value;
                          setCustomProduct((value) => ({ ...value, name }));
                        }}
                        help="Ejemplo: Tisana de la casa."
                      />
                      <NexoSelect
                        id="onboarding-product-category"
                        label="Categoría"
                        required={catalogChoice === 'empty'}
                        error={fieldErrors['onboarding-product-category'] ?? ''}
                        value={customProduct.category ?? ''}
                        onValueChange={(category) => {
                          setCustomProduct((value) => ({ ...value, category }));
                        }}
                        options={categoryPresets.map((preset) => ({
                          value: preset,
                          label: preset,
                        }))}
                        searchable
                        allowCustom
                      />
                      <TextField
                        id="onboarding-product-price"
                        label={`Precio sugerido (${currency})`}
                        type="number"
                        required={catalogChoice === 'empty'}
                        error={fieldErrors['onboarding-product-price'] ?? ''}
                        value={customProduct.price ?? ''}
                        onChange={(event) => {
                          const price = event.currentTarget.value;
                          setCustomProduct((value) => ({ ...value, price }));
                        }}
                        help="Ventas seguirá siendo autoridad del precio final."
                      />
                      <TextField
                        label="Descripción"
                        value={customProduct.description ?? ''}
                        onChange={(event) => {
                          const description = event.currentTarget.value;
                          setCustomProduct((value) => ({ ...value, description }));
                        }}
                        help="Una frase breve para tu equipo."
                      />
                      <TextField
                        label="SKU (opcional)"
                        value={customProduct.sku ?? ''}
                        onChange={(event) => {
                          const sku = event.currentTarget.value;
                          setCustomProduct((value) => ({ ...value, sku }));
                        }}
                        help="Código comercial interno."
                      />
                      <TextField
                        label="Código de barras (opcional)"
                        value={customProduct.barcode ?? ''}
                        onChange={(event) => {
                          const barcode = event.currentTarget.value;
                          setCustomProduct((value) => ({ ...value, barcode }));
                        }}
                        help="Escanéalo o escríbelo."
                      />
                    </div>
                    <div className="product-builder-toggles">
                      <label>
                        <input
                          type="checkbox"
                          checked={customProduct.inventory ?? false}
                          onChange={(event) => {
                            const inventory = event.currentTarget.checked;
                            setCustomProduct((value) => ({ ...value, inventory }));
                          }}
                        />
                        Controlar inventario
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={customProduct.available ?? true}
                          onChange={(event) => {
                            const available = event.currentTarget.checked;
                            setCustomProduct((value) => ({ ...value, available }));
                          }}
                        />
                        Disponible al guardar
                      </label>
                    </div>
                  </section>
                </div>
              )}
              {step === 8 && (
                <div className="editable-step">
                  <label className="choice-toggle">
                    <input
                      type="checkbox"
                      checked={inventoryEnabled}
                      onChange={(e) => {
                        setInventoryEnabled(e.currentTarget.checked);
                      }}
                    />
                    <span>
                      <strong>Controlar inventario</strong>
                      <small>Desactívalo si tu negocio no maneja existencias.</small>
                    </span>
                  </label>
                  {inventoryEnabled && (
                    <>
                      <NexoSelect
                        label="Ubicación inicial"
                        value={inventoryLocation}
                        onValueChange={setInventoryLocation}
                        options={inventoryLocationPresets.map((preset) => ({
                          value: preset,
                          label: preset,
                        }))}
                        searchable
                        allowCustom
                      />
                    </>
                  )}
                </div>
              )}
              {step === 9 && (
                <div className="editable-step form-grid onboarding-team-step">
                  <TextField
                    label="Correo de la persona a invitar (opcional)"
                    type="email"
                    value={teamEmail}
                    onChange={(e) => {
                      setTeamEmail(e.currentTarget.value);
                    }}
                    help="Déjalo vacío para continuar sin invitar."
                  />
                  <RolePicker value={teamRole} onChange={setTeamRole} />
                </div>
              )}
              {step >= 10 && (
                <div className="review-list">
                  {[
                    ['Negocio', businessName, 1],
                    [
                      'Giro',
                      businessTypes.find((x) => x.value === businessType)?.label ?? 'Otro',
                      2,
                    ],
                    ['Región', `${country} · ${currency} · ${locale}`, 3],
                    ['Sucursal', `${branchName} · ${branchCode}`, 4],
                    ['Horarios', scheduleSummary(schedule), 5],
                    ['Caja', `${registerName} · ${currency} ${openingFloat}`, 6],
                    [
                      'Catálogo',
                      catalogChoice === 'template' ? catalogItems : 'Configurar después',
                      7,
                    ],
                    [
                      'Inventario',
                      inventoryEnabled ? inventoryLocation : 'Sin control de existencias',
                      8,
                    ],
                    ['Equipo', teamEmail || 'Invitar después', 9],
                  ].map(([label, value, target]) => (
                    <div className="review-row" key={String(label)}>
                      <span>
                        <small>{label}</small>
                        <strong>{value}</strong>
                      </span>
                      {step === 10 && (
                        <button
                          type="button"
                          onClick={() => {
                            setStep(Number(target));
                          }}
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  ))}
                  <p>
                    La operación diaria de cobro se realizará posteriormente desde UmiPOS. Este
                    panel administra y supervisa tu negocio.
                  </p>
                </div>
              )}
            </div>
            <div className="onboarding-actions">
              <Button
                variant="secondary"
                disabled={step === 0 || saving}
                onClick={() => {
                  setStep(Math.max(0, step - 1));
                }}
              >
                Atrás
              </Button>
              {step < onboardingJourney.length - 1 ? (
                <Button loading={saving} onClick={() => void next()}>
                  {step === 0 ? 'Empezar' : 'Continuar'}
                </Button>
              ) : (
                <Button loading={saving} onClick={() => void finish()}>
                  Entrar a NEXO
                </Button>
              )}
            </div>
            <AnimatedProgress value={step + 1} total={onboardingJourney.length} />
          </GlassPanel>
        </section>
      </main>
      <ContextualHelp screen={`onboarding-${String(step)}`} title="Ayuda de este paso" publicOnly>
        <p>{onboardingDescription(step)} Puedes volver atrás sin perder el avance guardado.</p>
      </ContextualHelp>
    </LivingScene>
  );
}

function onboardingTitle(step: number) {
  return [
    'Construyamos el negocio que imaginas.',
    'Dale identidad a tu negocio.',
    'Cada negocio es diferente. Empecemos por entender el tuyo.',
    'Tu negocio, configurado para trabajar como tú.',
    'Aquí comenzará todo.',
    'Tu negocio tiene su propio ritmo.',
    'Prepara el lugar donde cada venta cobra vida.',
    'Lo que vendes merece verse increíble.',
    'Ten claridad sobre lo que tienes y lo que necesitas.',
    'Las personas que hacen posible tu negocio.',
    'Todo está tomando forma.',
    'Tu negocio está listo. Bienvenido a NEXO.',
  ][step];
}

function onboardingDescription(step: number) {
  return [
    'NEXO conectará ventas, caja e inventario en un espacio sencillo para ti y tu equipo.',
    'Usaremos este nombre en el inicio, reportes y espacios compartidos.',
    'Esto nos permite sugerir una configuración útil sin llenarte de opciones.',
    'Ya elegimos valores adecuados para México. Puedes confirmarlos ahora.',
    'Cada sucursal conserva su propia operación, caja e inventario.',
    'Los horarios ayudan a organizar el día de negocio y los cortes.',
    'Dejaremos preparada la estructura; el cobro operativo llegará con UmiPOS.',
    'Te proponemos categorías iniciales que podrás adaptar después.',
    'Puedes empezar sin inventario y activarlo cuando lo necesites.',
    'Los permisos mantienen cada tarea en las manos correctas.',
    'Confirma que todo tenga sentido antes de aplicar la plantilla.',
    'Tu Home mostrará el estado real y los siguientes pasos de activación.',
  ][step];
}

function onboardingScene(step: number) {
  const scenes = [
    '/cinematic/onboarding-hospitality.webp',
    '/brand/nexo-business-atelier.png',
    '/cinematic/login-hospitality.webp',
    '/cinematic/onboarding-hospitality.webp',
    '/brand/nexo-business-atelier.png',
    '/cinematic/onboarding-hospitality.webp',
    '/cinematic/login-hospitality.webp',
    '/brand/nexo-enterprise-still-life-v2.webp',
    '/brand/nexo-business-atelier.png',
    '/cinematic/login-hospitality.webp',
    '/brand/nexo-enterprise-still-life-v2.webp',
    '/cinematic/onboarding-hospitality.webp',
  ];
  return scenes[step] ?? scenes[0] ?? '/cinematic/onboarding-hospitality.webp';
}

function scheduleSummary(schedule: DaySchedule[]) {
  const open = schedule.filter((day) => day.enabled);
  if (open.length === 0) return 'Todos los días cerrados';
  const first = open[0];
  const interval = first?.intervals[0];
  if (first?.allDay) return `${String(open.length)} días · 24 horas`;
  return `${String(open.length)} días · ${interval?.open ?? 'Sin hora'}–${interval?.close ?? 'Sin hora'}`;
}

function NoAccess({ identity }: { identity: Identity | null }) {
  return (
    <main className="guided-state">
      <span className="product-brand__mark">N</span>
      <p className="overline">ACCESO A TU NEGOCIO</p>
      <h1>Tu cuenta necesita una organización activa</h1>
      <p>
        La sesión de {identity?.email ?? 'esta cuenta'} es válida, pero no encontramos un negocio
        disponible. Pide a un administrador que revise tu invitación o membresía.
      </p>
      <div>
        <Button onClick={() => void logoutAndReload()}>Usar otra cuenta</Button>
        <a href="#help">Obtener ayuda</a>
      </div>
    </main>
  );
}

function Splash() {
  return (
    <main className="splash-screen" aria-live="polite">
      <div className="splash-mark">N</div>
      <div>
        <strong>NEXO</strong>
        <span>Preparando tu espacio de trabajo…</span>
      </div>
    </main>
  );
}

function Login({ onSuccess }: { onSuccess: (identity: Identity) => void }) {
  const [email, setEmail] = useState('alpha.owner@nexo.local');
  const [password, setPassword] = useState('Nexo Test Persona 2026!');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const response = await apiFetch(`${apiBase}/v1/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        deviceFingerprint: `web-${browserUuid()}`,
        deviceName: 'NEXO Web',
      }),
    });
    if (!response.ok) {
      setError('No pudimos iniciar sesión. Revisa tus datos e inténtalo de nuevo.');
      setLoading(false);
      return;
    }
    // Consume the response before a return-path navigation. Otherwise Chromium
    // reports the successful login request as aborted while its body is pending.
    await response.json();
    const identityResponse = await apiFetch(`${apiBase}/v1/identity`, { credentials: 'include' });
    const resolvedIdentity = (await identityResponse.json()) as Identity;
    setLoading(false);
    setSuccess(true);
    window.setTimeout(() => {
      onSuccess(resolvedIdentity);
    }, 180);
  }
  return (
    <LivingScene
      image="/cinematic/login-hospitality.webp"
      className="ambient-experience ambient-experience--login"
      overlay="strong"
    >
      <main className="login-screen">
        <section className="login-story">
          <a className="cinematic-brand" href="/" aria-label="NEXO, inicio">
            <NexoWordmark compact />
          </a>
          <div>
            <EditorialHeadline>
              Vende Mejor.
              <br />
              Crece Más Rápido.
            </EditorialHeadline>
            <p>
              Todo lo que tu negocio necesita para vender, crecer y administrar mejor, en un solo
              lugar.
            </p>
            <div className="login-benefits">
              <span>
                <i>
                  <NexoIcon name="package" decorative />
                </i>
                <b>Multidispositivo</b>
                <small>Administra desde donde estés.</small>
              </span>
              <span>
                <i>
                  <NexoIcon name="check" decorative />
                </i>
                <b>Continuidad preparada</b>
                <small>Diseñado para acompañar tu operación.</small>
              </span>
              <span>
                <i>
                  <NexoIcon name="settings" decorative />
                </i>
                <b>Sincronización segura</b>
                <small>Tu información, siempre protegida.</small>
              </span>
              <span>
                <i>
                  <NexoIcon name="warehouse" decorative />
                </i>
                <b>Inventario actualizado</b>
                <small>Claridad para tomar decisiones.</small>
              </span>
            </div>
          </div>
        </section>
        <section className="login-panel">
          <form
            className={success ? 'is-authenticated' : loading ? 'is-authenticating' : ''}
            onSubmit={(event) => void submit(event)}
          >
            <div className="login-heading">
              <NexoWordmark />
              <h2>Bienvenido de nuevo</h2>
              <span>Inicia sesión para continuar</span>
            </div>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}
            <TextField
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.currentTarget.value);
              }}
              required
            />
            <TextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.currentTarget.value);
              }}
              required
            />
            <label className="show-password">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => {
                  setShowPassword(event.currentTarget.checked);
                }}
              />
              Mostrar contraseña
            </label>
            <div className="login-options">
              <label>
                <input type="checkbox" defaultChecked /> Mantener mi sesión
              </label>
              <button
                type="button"
                onClick={() => {
                  void apiFetch(`${apiBase}/v1/auth/password-reset/request`, {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ email }),
                  }).then(() => {
                    setRecoverySent(true);
                  });
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            {recoverySent && (
              <p className="login-success" role="status">
                Si la cuenta existe, recibirás instrucciones para recuperar el acceso.
              </p>
            )}
            <Button type="submit" loading={loading && !success} disabled={success}>
              {success ? 'Acceso confirmado ✓' : 'Entrar a NEXO'}
            </Button>
            <span className="demo-notice">Entorno de demostración local · Datos ficticios</span>
          </form>
        </section>
      </main>
      <ContextualHelp screen="login" title="Cómo iniciar sesión" publicOnly>
        <p>
          Usa tus credenciales personales. Crear un negocio y aceptar una invitación son recorridos
          diferentes; si tu cuenta está bloqueada, utiliza recuperación o soporte.
        </p>
      </ContextualHelp>
    </LivingScene>
  );
}

function money(value?: string) {
  return (Number(value ?? 0) / 100).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function csrfToken() {
  const value = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('nexo_csrf='))
    ?.split('=')[1];
  return value ? decodeURIComponent(value) : '';
}
function normalizeName(value: string) {
  return value.trim().normalize('NFKC').toLocaleLowerCase('es-MX').replace(/\s+/gu, ' ');
}
function slugValue(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/gu, '-')
      .replace(/^-|-$/gu, '') || 'producto'
  );
}
function dataUrlFile(value: string, fileName: string) {
  const [header = '', encoded = ''] = value.split(',', 2);
  const contentType = /data:([^;]+)/u.exec(header)?.[1] ?? 'image/png';
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new File([bytes], fileName, { type: contentType });
}
async function logoutAndReload() {
  const csrf = csrfToken();
  const response = await apiFetch(`${apiBase}/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    ...(csrf ? { headers: { 'x-csrf-token': csrf } } : {}),
  });
  if (response.status !== 204) throw new Error('No pudimos cerrar la sesión. Intenta de nuevo.');
  await clearBrowserSessionCookies();
  window.location.assign('/login');
}
function friendlyBranch(name: string) {
  return name === 'Main Branch' ? 'Centro' : name;
}
