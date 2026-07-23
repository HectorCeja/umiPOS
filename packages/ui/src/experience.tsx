'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { NexoIcon } from './iconography.js';
import {
  artworkBackground,
  artworkForLivingScene,
  artworkForSource,
  preloadLivingSceneArtwork,
  type LivingSceneArtwork,
} from './artwork-registry.js';
import { Button, PremiumToastPortal, type ButtonProps } from './primitives.js';
import { NexoSelect } from './nexo-select.js';

export type MutationState = 'idle' | 'dirty' | 'saving' | 'success' | 'error' | 'conflict';

export type LivingSceneVariant =
  | 'login'
  | 'home'
  | 'dashboard'
  | 'onboarding'
  | 'catalog'
  | 'products'
  | 'inventory'
  | 'sales'
  | 'cash'
  | 'reports'
  | 'team'
  | 'profile'
  | 'settings'
  | 'command'
  | 'focused'
  | 'minimal';
export type LivingSceneQuality = 'high' | 'balanced' | 'reduced' | 'static';

export function LivingScene({
  image,
  children,
  className = '',
  overlay = 'balanced',
  variant = 'dashboard',
  quality = 'balanced',
  motionEnabled = true,
  deterministic = false,
  pauseWhenHidden = true,
  enableParticles = true,
  enableNoise = true,
  enableKenBurns = true,
  authenticatedArtwork,
  artworkIntensity,
  enablePointerParallax = false,
}: {
  image?: string;
  children: ReactNode;
  className?: string;
  overlay?: 'balanced' | 'strong';
  variant?: LivingSceneVariant;
  quality?: LivingSceneQuality;
  motionEnabled?: boolean;
  deterministic?: boolean;
  pauseWhenHidden?: boolean;
  enableParticles?: boolean;
  enableNoise?: boolean;
  enableKenBurns?: boolean;
  authenticatedArtwork?: string;
  artworkIntensity?: number;
  enablePointerParallax?: boolean;
}) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const artworkRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const [queryDeterministic, setQueryDeterministic] = useState(false);
  const registryArtwork = artworkForLivingScene(variant);
  const resolvedArtwork = useMemo<LivingSceneArtwork | null>(() => {
    if (!authenticatedArtwork) return registryArtwork;
    return {
      id: 'woman-pos',
      src: authenticatedArtwork,
      intensity: artworkIntensity ?? 0.12,
      crop: { desktop: '78% 48%', tablet: '74% 50%', mobile: '68% 50%' },
    };
  }, [authenticatedArtwork, artworkIntensity, registryArtwork]);
  const currentArtworkRef = useRef(resolvedArtwork);
  const [previousArtwork, setPreviousArtwork] = useState<LivingSceneArtwork | null>(null);
  const [artworkTransitioning, setArtworkTransitioning] = useState(false);

  useEffect(() => {
    preloadLivingSceneArtwork();
  }, []);

  useEffect(() => {
    if (!resolvedArtwork) return;
    const previousSource = window.sessionStorage.getItem('nexo.previousArtwork');
    window.sessionStorage.setItem('nexo.previousArtwork', resolvedArtwork.src);
    if (!previousSource || previousSource === resolvedArtwork.src) return;
    const previous = artworkForSource(previousSource);
    if (!previous) return;
    setPreviousArtwork(previous);
    setArtworkTransitioning(true);
    const timer = window.setTimeout(() => {
      setPreviousArtwork(null);
      setArtworkTransitioning(false);
    }, 1600);
    return () => {
      window.clearTimeout(timer);
    };
  }, [resolvedArtwork]);
  useLayoutEffect(() => {
    const artwork = artworkRef.current;
    if (!artwork || !resolvedArtwork) return;
    artwork.style.setProperty('--nexo-authenticated-artwork', artworkBackground(resolvedArtwork));
    artwork.style.setProperty(
      '--nexo-artwork-opacity',
      String(artworkIntensity ?? resolvedArtwork.intensity),
    );
    artwork.style.setProperty('--nexo-artwork-position-desktop', resolvedArtwork.crop.desktop);
    artwork.style.setProperty('--nexo-artwork-position-tablet', resolvedArtwork.crop.tablet);
    artwork.style.setProperty('--nexo-artwork-position-mobile', resolvedArtwork.crop.mobile);
  }, [artworkIntensity, resolvedArtwork]);

  useEffect(() => {
    const activeArtwork = currentArtworkRef.current;
    if (resolvedArtwork?.src === activeArtwork?.src && resolvedArtwork?.id === activeArtwork?.id) {
      currentArtworkRef.current = resolvedArtwork;
      return;
    }
    setPreviousArtwork(activeArtwork);
    currentArtworkRef.current = resolvedArtwork;
    if (resolvedArtwork) window.sessionStorage.setItem('nexo.previousArtwork', resolvedArtwork.src);
    setArtworkTransitioning(true);
    const timer = window.setTimeout(() => {
      setPreviousArtwork(null);
      setArtworkTransitioning(false);
    }, 1600);
    return () => {
      window.clearTimeout(timer);
    };
  }, [resolvedArtwork]);
  useEffect(() => {
    setQueryDeterministic(new URLSearchParams(window.location.search).get('scene') === 'static');
    if (!pauseWhenHidden) return;
    const update = () => {
      setHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      document.removeEventListener('visibilitychange', update);
    };
  }, [pauseWhenHidden]);
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !resolvedArtwork || !enablePointerParallax) return;
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarsePointer =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (reduced || coarsePointer || window.innerWidth <= 1024) return;
    let frame = 0;
    const update = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 8;
        const y = (event.clientY / window.innerHeight - 0.5) * 5;
        scene.style.setProperty('--nexo-artwork-x', `${x.toFixed(2)}px`);
        scene.style.setProperty('--nexo-artwork-y', `${y.toFixed(2)}px`);
      });
    };
    window.addEventListener('pointermove', update, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', update);
    };
  }, [enablePointerParallax, resolvedArtwork]);
  const style = {
    '--nexo-living-image': image ? `url("${image}")` : 'none',
  } as CSSProperties;
  const artworkStyle = {
    '--nexo-previous-authenticated-artwork': previousArtwork
      ? artworkBackground(previousArtwork)
      : 'none',
    '--nexo-previous-artwork-position-desktop': previousArtwork?.crop.desktop ?? '78% 48%',
    '--nexo-previous-artwork-position-tablet': previousArtwork?.crop.tablet ?? '74% 50%',
    '--nexo-previous-artwork-position-mobile': previousArtwork?.crop.mobile ?? '68% 50%',
  } as CSSProperties;
  const particleCount = enableParticles
    ? { high: 22, balanced: 14, reduced: 6, static: 0 }[quality]
    : 0;
  const staticScene =
    deterministic || queryDeterministic || !motionEnabled || quality === 'static' || hidden;
  return (
    <div
      ref={sceneRef}
      className={`nexo-living-scene nexo-living-scene--${overlay} nexo-living-scene--${variant} nexo-living-scene--quality-${quality}${staticScene ? ' is-static' : ''} ${className}`}
      data-deterministic={deterministic || queryDeterministic ? 'true' : 'false'}
      data-scene-variant={variant}
      data-artwork-id={resolvedArtwork?.id ?? 'abstract'}
      style={style}
    >
      {enableKenBurns && <div className="nexo-living-scene__photo" aria-hidden="true" />}
      {resolvedArtwork && (
        <div
          key={resolvedArtwork.src}
          ref={artworkRef}
          className="nexo-living-scene__authenticated-artwork"
          data-transitioning={artworkTransitioning ? 'true' : 'false'}
          style={artworkStyle}
          aria-hidden="true"
        />
      )}
      <div className="nexo-living-scene__aurora" aria-hidden="true">
        <i className="nexo-living-scene__blob nexo-living-scene__blob--violet" />
        <i className="nexo-living-scene__blob nexo-living-scene__blob--blue" />
        <i className="nexo-living-scene__blob nexo-living-scene__blob--cyan" />
        <i className="nexo-living-scene__blob nexo-living-scene__blob--indigo" />
      </div>
      <div className="nexo-living-scene__halos" aria-hidden="true">
        <i />
        <i />
      </div>
      <div className="nexo-living-scene__light-leaks" aria-hidden="true" />
      {resolvedArtwork && <div className="nexo-living-scene__artwork-trails" aria-hidden="true" />}
      <div className="nexo-living-scene__particles" aria-hidden="true">
        {Array.from({ length: particleCount }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      {enableNoise && <div className="nexo-living-scene__noise" aria-hidden="true" />}
      <div className="nexo-living-scene__overlay" aria-hidden="true" />
      <div className="nexo-living-scene__content">{children}</div>
    </div>
  );
}

export function MutationButton({
  state = 'idle',
  children,
  ...props
}: ButtonProps & { state?: MutationState }) {
  return (
    <Button loading={state === 'saving'} {...props}>
      {children}
    </Button>
  );
}

export function SaveStatus({ state, message }: { state: MutationState; message?: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(state !== 'idle' && state !== 'dirty');
  }, [message, state]);
  const copy = {
    idle: '',
    dirty: 'Tienes cambios sin guardar.',
    saving: 'Guardando cambios…',
    success: message ?? 'Cambios guardados.',
    error: message ?? 'No pudimos guardar. Revisa los campos e intenta de nuevo.',
    conflict: message ?? 'Otra persona modificó esta información. Recarga antes de continuar.',
  }[state];
  if (!copy) return null;
  if (state !== 'dirty') {
    if (!visible) return null;
    const tone = state === 'success' ? 'success' : state === 'saving' ? 'info' : 'danger';
    const title =
      state === 'success'
        ? 'Cambios guardados'
        : state === 'saving'
          ? 'Guardando cambios'
          : state === 'conflict'
            ? 'Hay cambios más recientes'
            : 'No pudimos guardar';
    return (
      <PremiumToastPortal
        title={title}
        detail={copy}
        tone={tone}
        duration={state === 'saving' ? 60_000 : 6000}
        onDismiss={() => {
          setVisible(false);
        }}
      />
    );
  }
  return (
    <p className="nexo-save-status nexo-save-status--dirty" role="status" aria-live="polite">
      <span aria-hidden="true">•</span>
      {copy}
    </p>
  );
}

export function VisualChoiceCard({
  selected,
  icon,
  title,
  description,
  meta,
  onSelect,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  meta?: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" className="nexo-choice-card" aria-pressed={selected} onClick={onSelect}>
      <span className="nexo-choice-card__icon" aria-hidden="true">
        {icon}
      </span>
      <span>
        <strong>{title}</strong>
        <small>{description}</small>
        {meta && <em>{meta}</em>}
      </span>
      <span className="nexo-choice-card__check" aria-hidden="true">
        {selected ? '✓' : ''}
      </span>
    </button>
  );
}

export interface DaySchedule {
  id: string;
  label: string;
  enabled: boolean;
  allDay: boolean;
  intervals: { open: string; close: string }[];
}

function TimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [hour = '00', minute = '00'] = value.split(':');
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
  return (
    <fieldset className="nexo-time-picker" aria-label={label}>
      <legend>{label}</legend>
      <NexoSelect
        label="Hora"
        aria-label={`${label}: hora`}
        value={hour}
        onValueChange={(next) => {
          onChange(`${next}:${minute}`);
        }}
        options={hours.map((option) => ({ label: option, value: option }))}
      />
      <span aria-hidden="true">:</span>
      <NexoSelect
        label="Minutos"
        aria-label={`${label}: minutos`}
        value={minute}
        onValueChange={(next) => {
          onChange(`${hour}:${next}`);
        }}
        options={minutes.map((option) => ({ label: option, value: option }))}
      />
    </fieldset>
  );
}

export function ScheduleEditor({
  value,
  onChange,
}: {
  value: DaySchedule[];
  onChange: (value: DaySchedule[]) => void;
}) {
  const [expanded, setExpanded] = useState(() => new Set(['mon']));
  const update = (id: string, fn: (day: DaySchedule) => DaySchedule) => {
    onChange(value.map((day) => (day.id === id ? fn(day) : day)));
  };
  const copyWeekdays = () => {
    const monday = value[0];
    if (!monday) return;
    onChange(
      value.map((day, index) =>
        index < 5
          ? {
              ...day,
              enabled: monday.enabled,
              allDay: monday.allDay,
              intervals: monday.intervals.map((x) => ({ ...x })),
            }
          : day,
      ),
    );
  };
  return (
    <div className="nexo-schedule" aria-label="Horarios por día">
      <div className="nexo-schedule__toolbar">
        <div>
          <strong>Semana de operación</strong>
          <small>Configura cada día o copia el horario del lunes.</small>
        </div>
        <Button variant="secondary" onClick={copyWeekdays}>
          Aplicar lunes a viernes
        </Button>
      </div>
      {value.map((day) => (
        <section className="nexo-schedule__day" key={day.id}>
          <header className="nexo-schedule__day-header">
            <label className="nexo-day-toggle">
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={(event) => {
                  const enabled = event.currentTarget.checked;
                  update(day.id, (current) => ({ ...current, enabled }));
                  if (enabled) setExpanded((current) => new Set(current).add(day.id));
                }}
              />
              <span>
                <strong>{day.label}</strong>
                <small>
                  {day.enabled
                    ? day.allDay
                      ? 'Abierto 24 horas'
                      : day.intervals.map((x) => `${x.open} – ${x.close}`).join(' · ')
                    : 'Cerrado'}
                </small>
              </span>
            </label>
            <button
              type="button"
              className="nexo-schedule__expand"
              aria-expanded={expanded.has(day.id)}
              aria-label={`${expanded.has(day.id) ? 'Contraer' : 'Editar'} ${day.label}`}
              onClick={() => {
                setExpanded((current) => {
                  const next = new Set(current);
                  if (next.has(day.id)) next.delete(day.id);
                  else next.add(day.id);
                  return next;
                });
              }}
            >
              {expanded.has(day.id) ? '−' : 'Editar'}
            </button>
          </header>
          {day.enabled && expanded.has(day.id) && (
            <div className="nexo-schedule__editor">
              <label className="nexo-all-day">
                <input
                  type="checkbox"
                  checked={day.allDay}
                  onChange={(event) => {
                    update(day.id, (current) => ({
                      ...current,
                      allDay: event.currentTarget.checked,
                    }));
                  }}
                />
                24 horas
              </label>
              {!day.allDay && (
                <div className="nexo-time-intervals">
                  {day.intervals.map((interval, index) => (
                    <div key={`${day.id}-${String(index)}`}>
                      <TimePicker
                        label="Abre"
                        value={interval.open}
                        onChange={(open) => {
                          update(day.id, (current) => ({
                            ...current,
                            intervals: current.intervals.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, open } : item,
                            ),
                          }));
                        }}
                      />
                      <span aria-hidden="true">→</span>
                      <TimePicker
                        label="Cierra"
                        value={interval.close}
                        onChange={(close) => {
                          update(day.id, (current) => ({
                            ...current,
                            intervals: current.intervals.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, close } : item,
                            ),
                          }));
                        }}
                      />
                      {day.intervals.length > 1 && (
                        <button
                          type="button"
                          aria-label={`Eliminar intervalo de ${day.label}`}
                          onClick={() => {
                            update(day.id, (current) => ({
                              ...current,
                              intervals: current.intervals.filter(
                                (_, itemIndex) => itemIndex !== index,
                              ),
                            }));
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="nexo-add-interval"
                    onClick={() => {
                      update(day.id, (current) => ({
                        ...current,
                        intervals: [...current.intervals, { open: '16:00', close: '20:00' }],
                      }));
                    }}
                  >
                    + Agregar intervalo
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export interface GalleryItem {
  id: string;
  name: string;
  category: string;
  price: string;
  icon: string;
  description: string;
}
export function ProductGalleryPicker({
  items,
  selected,
  onChange,
}: {
  items: GalleryItem[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const categories = ['Todos', ...new Set(items.map((item) => item.category))];
  const visible = items.filter(
    (item) =>
      (category === 'Todos' || item.category === category) &&
      `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
  );
  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);
  };
  return (
    <div className="nexo-gallery-picker">
      <div className="nexo-gallery-picker__toolbar">
        <label>
          Buscar sugerencias
          <input
            type="search"
            value={query}
            placeholder="Ej. latte o panadería"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
          />
        </label>
        <span>
          {selected.length} {selected.length === 1 ? 'seleccionado' : 'seleccionados'}
        </span>
        <button
          type="button"
          onClick={() => {
            onChange(selected.length === items.length ? [] : items.map((item) => item.id));
          }}
        >
          {selected.length === items.length ? 'Limpiar' : 'Seleccionar todos'}
        </button>
      </div>
      <div className="nexo-gallery-picker__filters" aria-label="Filtrar por categoría">
        {categories.map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={category === item}
            onClick={() => {
              setCategory(item);
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="nexo-gallery-grid" role="group" aria-label="Productos sugeridos">
        {visible.map((item) => (
          <button
            type="button"
            key={item.id}
            className="nexo-product-choice"
            aria-pressed={selected.includes(item.id)}
            onClick={() => {
              toggle(item.id);
            }}
          >
            <span className="nexo-product-choice__visual" aria-hidden="true">
              {item.icon}
            </span>
            <span>
              <strong>{item.name}</strong>
              <small>{item.category}</small>
              <em>{item.description}</em>
              <b>${item.price}</b>
            </span>
            <i aria-hidden="true">{selected.includes(item.id) ? '✓' : '+'}</i>
          </button>
        ))}
      </div>
    </div>
  );
}

export function RolePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const roles: [string, string, string, string, ReactNode][] = [
    [
      'ADMIN',
      'Administrador',
      'Configura el negocio y acompaña la operación.',
      'Acceso amplio',
      <NexoIcon name="settings" decorative />,
    ],
    [
      'SUPERVISOR',
      'Supervisor',
      'Aprueba excepciones y coordina una sucursal.',
      'Recomendado',
      <NexoIcon name="user-cog" decorative />,
    ],
    [
      'CASHIER',
      'Cajero',
      'Opera caja desde los clientes autorizados.',
      'Operación',
      <NexoIcon name="cash-register" decorative />,
    ],
    [
      'EMPLOYEE',
      'Empleado',
      'Consulta y ejecuta tareas asignadas.',
      'Acceso limitado',
      <NexoIcon name="users" decorative />,
    ],
  ];
  return (
    <div className="nexo-role-picker" role="radiogroup" aria-label="Rol sugerido">
      {roles.map(([id, title, description, meta, icon]) => (
        <VisualChoiceCard
          key={id}
          selected={value === id}
          icon={icon}
          title={title}
          description={description}
          meta={meta}
          onSelect={() => {
            onChange(id);
          }}
        />
      ))}
      <div className="nexo-custom-role-state">
        <strong>Roles personalizados</strong>
        <span>No disponibles en esta fase.</span>
        <p>
          Authorization utiliza únicamente definiciones versionadas y allowlist. No crearemos
          permisos arbitrarios desde la interfaz.
        </p>
      </div>
    </div>
  );
}

export function FileUpload({
  label,
  help,
  preview,
  onFile,
  onRemove,
  error,
  busy = false,
}: {
  label: string;
  help: string;
  preview?: string;
  onFile: (file: File) => void;
  onRemove?: () => void;
  error?: string;
  busy?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const scrollSnapshot = useRef<
    | {
        x: number;
        y: number;
        containers: { element: HTMLElement; left: number; top: number }[];
      }
    | undefined
  >(undefined);
  const [previewFailed, setPreviewFailed] = useState(false);
  const captureScroll = () => {
    const containers: { element: HTMLElement; left: number; top: number }[] = [];
    let parent = input.current?.parentElement;
    while (parent) {
      if (parent.scrollHeight > parent.clientHeight || parent.scrollWidth > parent.clientWidth) {
        containers.push({ element: parent, left: parent.scrollLeft, top: parent.scrollTop });
      }
      parent = parent.parentElement;
    }
    scrollSnapshot.current = { x: window.scrollX, y: window.scrollY, containers };
  };
  const restoreScroll = useCallback(() => {
    const snapshot = scrollSnapshot.current;
    if (!snapshot) return;
    window.scrollTo({ left: snapshot.x, top: snapshot.y, behavior: 'auto' });
    for (const container of snapshot.containers) {
      container.element.scrollTo({
        left: container.left,
        top: container.top,
        behavior: 'auto',
      });
    }
  }, []);
  useEffect(() => {
    setPreviewFailed(false);
    restoreScroll();
    const frame = window.requestAnimationFrame(restoreScroll);
    const settle = window.setTimeout(restoreScroll, 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, [preview, restoreScroll]);
  return (
    <div className="nexo-file-upload" data-error={error ? 'true' : undefined}>
      <span className="nexo-file-upload__preview">
        {preview && !previewFailed ? (
          <img
            src={preview}
            alt="Vista previa"
            onError={() => {
              setPreviewFailed(true);
            }}
          />
        ) : (
          <NexoIcon name={previewFailed ? 'image' : 'upload'} decorative />
        )}
      </span>
      <span>
        <strong>{label}</strong>
        <small>{help}</small>
        {error && <small role="alert">{error}</small>}
        {busy && <progress className="nexo-file-upload__progress" aria-label="Procesando imagen" />}
        <label
          htmlFor={id}
          onPointerDown={captureScroll}
          onClick={(event) => {
            event.preventDefault();
            captureScroll();
            input.current?.click();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              captureScroll();
              input.current?.click();
            }
          }}
        >
          {busy ? 'Procesando imagen…' : preview ? 'Reemplazar imagen' : 'Elegir archivo'}
        </label>
        {preview && onRemove && (
          <button
            type="button"
            onClick={() => {
              onRemove();
              if (input.current) input.current.value = '';
            }}
          >
            Eliminar imagen
          </button>
        )}
      </span>
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={busy}
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          restoreScroll();
          if (file) onFile(file);
          window.requestAnimationFrame(restoreScroll);
          window.setTimeout(restoreScroll, 120);
        }}
      />
    </div>
  );
}
