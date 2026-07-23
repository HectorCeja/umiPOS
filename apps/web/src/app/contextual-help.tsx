'use client';

import { Button, Dialog, EmptyState, NexoIcon, NexoIconButton, type NexoIconName } from '@nexo/ui';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export const helpPrefix = 'nexo.help.v2.';
const historyKey = `${helpPrefix}history`;

export const screenEmotionTargets = {
  dashboard: 'Control',
  sales: 'Velocidad',
  cash: 'Seguridad',
  inventory: 'Orden',
  products: 'Creatividad',
  team: 'Colaboración',
  settings: 'Confianza',
  profile: 'Identidad',
  onboarding: 'Ilusión',
  login: 'Bienvenida',
} as const;

export interface ScreenGuide {
  title: string;
  eyebrow: string;
  body: string;
  first: string;
  next: string;
  icon: NexoIconName;
  terms?: readonly string[];
}

export const defaultScreenGuide: ScreenGuide = {
  title: 'Tu negocio, de un vistazo',
  eyebrow: 'INICIO',
  body: 'Los indicadores resumen ventas confirmadas y el estado operativo de la sucursal activa.',
  first: 'Revisa primero las alertas y después las acciones rápidas.',
  next: 'Abre Ventas para consultar el detalle del periodo.',
  icon: 'home',
  terms: ['Sucursal', 'Ventas confirmadas'],
};

export const screenGuides: Record<string, ScreenGuide> = {
  '/': defaultScreenGuide,
  '/sales': {
    title: 'Cada venta cuenta una historia',
    eyebrow: 'VENTAS',
    body: 'Busca por folio, revisa el estado y usa únicamente las acciones disponibles en ese momento.',
    first: 'Selecciona una venta para ver productos, pago e historial.',
    next: 'Abre el recibo o resuelve la acción recomendada.',
    icon: 'receipt',
    terms: ['Venta suspendida', 'Recibo regenerado'],
  },
  '/cash': {
    title: 'Control claro de cada turno',
    eyebrow: 'CAJA',
    body: 'Un punto de cobro agrupa la operación; el cajón conserva el efectivo y cada turno abre una sesión.',
    first: 'Selecciona el punto de cobro y el cajón antes de abrir.',
    next: 'Registra el fondo inicial y comienza a vender.',
    icon: 'cash-register',
    terms: ['Punto de cobro', 'Fondo inicial', 'Diferencia'],
  },
  '/products': {
    title: 'Construye un catálogo fácil de vender',
    eyebrow: 'PRODUCTOS',
    body: 'Producto es lo que vendes; presentación describe tamaño o sabor y SKU es su referencia interna.',
    first: 'Crea el producto con nombre, precio e imagen.',
    next: 'Agrega existencias para dejarlo listo para vender.',
    icon: 'package',
    terms: ['Producto o presentación', 'SKU', 'Categoría'],
  },
  '/inventory': {
    title: 'Conoce lo que realmente puedes vender',
    eyebrow: 'INVENTARIO',
    body: 'En mano es el total físico; disponible descuenta lo reservado para otras operaciones.',
    first: 'Selecciona un producto y una ubicación.',
    next: 'Consulta el saldo y revisa sus movimientos.',
    icon: 'warehouse',
    terms: ['En mano', 'Disponible', 'Reservado', 'Ubicación'],
  },
  '/reports': {
    title: 'Convierte actividad en decisiones',
    eyebrow: 'REPORTES',
    body: 'Los resultados usan únicamente ventas confirmadas del periodo y sucursal seleccionados.',
    first: 'Confirma el periodo de análisis.',
    next: 'Compara ventas, ingresos y ticket promedio.',
    icon: 'chart',
    terms: ['Ticket promedio', 'Periodo'],
  },
  '/control-plane/settings': {
    title: 'Haz que NEXO hable como tu negocio',
    eyebrow: 'CONFIGURACIÓN',
    body: 'Organización, moneda e idioma afectan al negocio completo; tu perfil sigue siendo personal.',
    first: 'Revisa primero nombre, moneda y zona horaria.',
    next: 'Guarda y confirma el cambio en el encabezado.',
    icon: 'settings',
    terms: ['Organización', 'Zona horaria'],
  },
  '/control-plane/organizations': {
    title: 'Organiza cada espacio de trabajo',
    eyebrow: 'ORGANIZACIONES',
    body: 'La organización representa el negocio y reúne sucursales, equipo y configuración.',
    first: 'Confirma la organización activa.',
    next: 'Selecciona la sucursal donde trabajarás.',
    icon: 'settings',
    terms: ['Organización', 'Membership'],
  },
  '/control-plane/branches': {
    title: 'Cada ubicación, en su contexto',
    eyebrow: 'SUCURSALES',
    body: 'Una sucursal separa caja, inventario y ventas de cada ubicación operativa.',
    first: 'Selecciona la sucursal activa.',
    next: 'Verifica su caja e inventario.',
    icon: 'warehouse',
    terms: ['Sucursal', 'Alcance'],
  },
  '/control-plane/onboarding': {
    title: 'Configura hoy. Ajusta cuando quieras.',
    eyebrow: 'CONFIGURACIÓN INICIAL',
    body: 'El recorrido prepara negocio, sucursal, horario, catálogo, caja y equipo sin ocultar decisiones.',
    first: 'Completa el paso visible; NEXO guarda tu avance.',
    next: 'Continúa hasta ver el resumen final.',
    icon: 'check',
    terms: ['Negocio', 'Sucursal', 'Catálogo'],
  },
  '/settings/profile': {
    title: 'Tu identidad en todo NEXO',
    eyebrow: 'PERFIL',
    body: 'Tu nombre y avatar son personales y aparecen en navegación, actividad y equipo.',
    first: 'Revisa cómo te verá tu equipo.',
    next: 'Guarda y confirma el avatar en el encabezado.',
    icon: 'users',
    terms: ['Identidad personal', 'Avatar'],
  },
  '/control-plane/invitations': {
    title: 'Invita con claridad y control',
    eyebrow: 'EQUIPO',
    body: 'Una invitación asigna rol y sucursales; la persona crea o conecta su propia cuenta.',
    first: 'Escribe el correo y elige el rol adecuado.',
    next: 'Revisa la invitación pendiente y su vencimiento.',
    icon: 'user-cog',
    terms: ['Miembro', 'Rol', 'Alcance de sucursal'],
  },
  '/help': {
    title: 'Aprende NEXO a tu ritmo',
    eyebrow: 'CENTRO DE AYUDA',
    body: 'Busca una guía, consulta términos o vuelve a abrir cualquier recorrido.',
    first: 'Busca la tarea que quieres completar.',
    next: 'Abre la guía del módulo y vuelve al trabajo.',
    icon: 'life-buoy',
    terms: ['Guía', 'Recorrido'],
  },
};

function remember(screen: string, state: 'seen' | 'completed') {
  localStorage.setItem(`${helpPrefix}${screen}`, state);
  const history = JSON.parse(localStorage.getItem(historyKey) ?? '[]') as string[];
  localStorage.setItem(
    historyKey,
    JSON.stringify([screen, ...history.filter((item) => item !== screen)].slice(0, 12)),
  );
}

export function ContextualHelp({
  screen,
  title,
  eyebrow = 'GUÍA DE NEXO',
  children,
  publicOnly = false,
}: {
  screen: string;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  publicOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(10_000);
  const started = useRef(0);
  useEffect(() => {
    setOpen(!localStorage.getItem(`${helpPrefix}${screen}`));
  }, [screen]);
  useEffect(() => {
    if (!open || paused) return;
    started.current = Date.now();
    const timer = window.setTimeout(() => {
      remember(screen, 'seen');
      setOpen(false);
      remaining.current = 10_000;
    }, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - started.current));
    };
  }, [open, paused, screen]);
  const dismiss = () => {
    remember(screen, 'seen');
    remaining.current = 10_000;
    setOpen(false);
  };
  return (
    <aside className="contextual-help" aria-label={`Ayuda de ${title}`}>
      <button
        type="button"
        className="contextual-help__trigger"
        aria-expanded={open}
        onClick={() => {
          remaining.current = 10_000;
          setOpen(true);
        }}
      >
        <NexoIcon name="life-buoy" decorative />
        <span>Ver guía</span>
      </button>
      {open && (
        <section
          className="contextual-help__panel"
          role="status"
          aria-live="polite"
          onMouseEnter={() => {
            setPaused(true);
          }}
          onMouseLeave={() => {
            setPaused(false);
          }}
          onFocusCapture={() => {
            setPaused(true);
          }}
          onBlurCapture={() => {
            setPaused(false);
          }}
        >
          <header>
            <span className="contextual-help__icon">
              <NexoIcon name="life-buoy" decorative />
            </span>
            <div>
              <small>{eyebrow}</small>
              <strong>{title}</strong>
            </div>
            <NexoIconButton
              className="nexo-overlay-close"
              label={`Cerrar ayuda de ${title}`}
              onClick={dismiss}
            >
              <NexoIcon name="close" decorative />
            </NexoIconButton>
          </header>
          <div className="contextual-help__content">{children}</div>
          <footer>
            <span>Se ocultará cuando termines de leer</span>
            {!publicOnly && <a href="/help">Abrir Centro de ayuda</a>}
          </footer>
        </section>
      )}
    </aside>
  );
}

export function ScreenIntroduction({ guide }: { guide: ScreenGuide }) {
  return (
    <div className="screen-introduction">
      <span>
        <NexoIcon name={guide.icon} decorative />
      </span>
      <div>
        <small>{guide.eyebrow}</small>
        <h2>{guide.title}</h2>
        <p>{guide.body}</p>
      </div>
    </div>
  );
}

export function FeatureSpotlight({
  title,
  children,
  icon = 'check',
}: {
  title: string;
  children: ReactNode;
  icon?: NexoIconName;
}) {
  return (
    <aside className="experience-spotlight">
      <NexoIcon name={icon} decorative />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </aside>
  );
}

export function TipCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <FeatureSpotlight title={title} icon="life-buoy">
      {children}
    </FeatureSpotlight>
  );
}

export function EducationalEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      illustration={<NexoIcon name="inbox" decorative />}
      action={action}
    />
  );
}

export function HelpDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onClose={onClose} title={title} className="experience-help-drawer">
      {children}
    </Dialog>
  );
}

export function SearchHelp({
  value,
  onChange,
  onClear,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <label className="help-search">
      <NexoIcon name="search" decorative />
      <span className="nexo-sr-only">Buscar en el Centro de ayuda</span>
      <input
        type="search"
        value={value}
        placeholder="Busca una tarea o término…"
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
      {value && (
        <button type="button" onClick={onClear}>
          Limpiar
        </button>
      )}
    </label>
  );
}

export function Glossary({ entries }: { entries: readonly (readonly [string, string])[] }) {
  return (
    <dl>
      {entries.map(([term, meaning]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{meaning}</dd>
        </div>
      ))}
    </dl>
  );
}

export function FAQ({ entries }: { entries: readonly (readonly [string, string])[] }) {
  return (
    <>
      {entries.map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
    </>
  );
}

export function ActionExplanation({ children }: { children: ReactNode }) {
  return (
    <p className="action-explanation">
      <NexoIcon name="life-buoy" decorative />
      {children}
    </p>
  );
}
export function DisabledActionReason({ children }: { children: ReactNode }) {
  return (
    <span className="disabled-action-reason" role="note">
      {children}
    </span>
  );
}

export function InteractiveChecklist({ items }: { items: readonly string[] }) {
  const [done, setDone] = useState<string[]>([]);
  return (
    <section className="experience-checklist" aria-label="Pasos recomendados">
      <header>
        <strong>Tu siguiente recorrido</strong>
        <span>
          {done.length}/{items.length}
        </span>
      </header>
      {items.map((item) => (
        <label key={item}>
          <input
            type="checkbox"
            checked={done.includes(item)}
            onChange={() => {
              setDone((value) =>
                value.includes(item) ? value.filter((entry) => entry !== item) : [...value, item],
              );
            }}
          />
          <span>{item}</span>
        </label>
      ))}
    </section>
  );
}

export function GuidedTour({
  steps,
  onComplete,
}: {
  steps: readonly string[];
  onComplete?: () => void;
}) {
  const [step, setStep] = useState(0);
  return (
    <section className="guided-tour" aria-live="polite">
      <small>
        PASO {step + 1} DE {steps.length}
      </small>
      <p>{steps[step]}</p>
      <div>
        <Button
          variant="tertiary"
          disabled={step === 0}
          onClick={() => {
            setStep((value) => Math.max(0, value - 1));
          }}
        >
          Anterior
        </Button>
        <Button
          onClick={() => {
            if (step === steps.length - 1) onComplete?.();
            else setStep((value) => value + 1);
          }}
        >
          {step === steps.length - 1 ? 'Terminar recorrido' : 'Siguiente'}
        </Button>
      </div>
    </section>
  );
}

export function SuccessEducation({
  title,
  nextSteps,
  consequence = 'El cambio ya quedó confirmado y estará disponible al volver a esta pantalla.',
}: {
  title: string;
  nextSteps: readonly string[];
  consequence?: string;
}) {
  return (
    <section className="success-education" role="status" aria-live="polite">
      <span className="success-education__mark">
        <NexoIcon name="check" decorative />
      </span>
      <div>
        <strong>{title}</strong>
        <p>{consequence}</p>
        <small>AHORA PUEDES</small>
        <ul>
          {nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
export function NextStepRecommendation({
  children,
  href,
  label,
}: {
  children: ReactNode;
  href: string;
  label: string;
}) {
  return (
    <aside className="next-step">
      <div>
        <small>SIGUIENTE PASO</small>
        <p>{children}</p>
      </div>
      <a href={href}>{label}</a>
    </aside>
  );
}

export function CurrentScreenHelp() {
  const path = typeof window === 'undefined' ? '/' : window.location.pathname;
  const key =
    Object.keys(screenGuides)
      .sort((a, b) => b.length - a.length)
      .find((item) => path === item || path.startsWith(`${item}/`)) ?? '/';
  const guide = screenGuides[key] ?? defaultScreenGuide;
  return (
    <ContextualHelp screen={key} title={guide.title} eyebrow={guide.eyebrow}>
      <p>{guide.body}</p>
      <ol>
        <li>
          <strong>Empieza aquí:</strong> {guide.first}
        </li>
        <li>
          <strong>Después:</strong> {guide.next}
        </li>
      </ol>
    </ContextualHelp>
  );
}

export function useHelpHistory() {
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    setHistory(JSON.parse(localStorage.getItem(historyKey) ?? '[]') as string[]);
  }, []);
  return useMemo(
    () => history.map((path) => ({ path, guide: screenGuides[path] })).filter((item) => item.guide),
    [history],
  );
}
