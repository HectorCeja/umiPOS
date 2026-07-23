'use client';

import { autoUpdate, offset, shift, size, useFloating } from '@floating-ui/react-dom';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { NexoIcon } from './iconography.js';

export interface NexoSelectOption {
  value: string;
  label: string;
  description?: string;
  metadata?: string;
  keywords?: string[];
  group?: string;
  icon?: ReactNode;
  image?: string;
  badge?: string;
  disabled?: boolean;
}

export interface NexoSelectProps {
  label: string;
  options: readonly NexoSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  searchable?: boolean;
  allowCustom?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyAction?: ReactNode;
  loading?: boolean;
  error?: string;
  retry?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  'aria-label'?: string;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase();
}

export function NexoSelect({
  label,
  options,
  value,
  defaultValue = '',
  onValueChange,
  id: givenId,
  name,
  placeholder = 'Selecciona una opción',
  searchable = false,
  allowCustom = false,
  searchPlaceholder = 'Buscar…',
  emptyMessage = 'No encontramos opciones.',
  emptyAction,
  loading = false,
  error,
  retry,
  disabled = false,
  readOnly = false,
  required = false,
  className = '',
  'aria-label': ariaLabel,
}: NexoSelectProps) {
  const generatedId = useId();
  const id = givenId ?? `nexo-select-${generatedId.replace(/:/gu, '')}`;
  const listboxId = `${id}-listbox`;
  const errorId = `${id}-error`;
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  const selectedValue = value ?? internalValue;
  const selected =
    options.find((option) => option.value === selectedValue) ??
    (allowCustom && selectedValue ? { value: selectedValue, label: selectedValue } : undefined);
  const filtered = useMemo(() => {
    const needle = normalize(query.trim());
    if (!needle) return [...options];
    return options.filter((option) =>
      normalize(
        [option.label, option.description, option.metadata, ...(option.keywords ?? [])]
          .filter(Boolean)
          .join(' '),
      ).includes(needle),
    );
  }, [options, query]);
  const virtualized = filtered.length > 120;
  const rowHeight = 48;
  const windowSize = 80;
  const virtualStart = virtualized
    ? Math.max(0, Math.min(filtered.length - windowSize, Math.floor(scrollTop / rowHeight) - 10))
    : 0;
  const rendered = virtualized ? filtered.slice(virtualStart, virtualStart + windowSize) : filtered;
  const { refs, floatingStyles, placement } = useFloating({
    placement: 'bottom-start',
    strategy: 'fixed',
    whileElementsMounted: autoUpdate,
    middleware: [
      // The popup is a physical continuation of the trigger. Keep positioning
      // on this Floating UI layer and visual motion on a child surface.
      offset(0),
      shift({ padding: 12 }),
      size({
        padding: 12,
        apply({ availableHeight, availableWidth, rects, elements }) {
          Object.assign(elements.floating.style, {
            '--nexo-select-trigger-width': `${String(rects.reference.width)}px`,
            '--nexo-select-available-height': `${String(Math.max(96, availableHeight))}px`,
            '--nexo-select-available-width': `${String(availableWidth)}px`,
            width: `${String(Math.min(Math.max(rects.reference.width, 320), availableWidth))}px`,
            minWidth: `${String(Math.min(rects.reference.width, availableWidth))}px`,
            maxWidth: `${String(availableWidth)}px`,
            maxHeight: `${String(Math.min(416, Math.max(96, availableHeight)))}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => {
    refs.setReference(triggerRef.current);
  }, [refs]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const currentIndex = options.findIndex((option) => option.value === selectedValue);
    const firstEnabledIndex = options.findIndex((option) => !option.disabled);
    const selectedIndex = currentIndex >= 0 ? currentIndex : Math.max(0, firstEnabledIndex);
    setActiveIndex(selectedIndex);
    activeIndexRef.current = selectedIndex;
    window.requestAnimationFrame(() => {
      if (searchable) searchRef.current?.focus({ preventScroll: true });
      else viewportRef.current?.focus({ preventScroll: true });
    });
    const close = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !refs.floating.current?.contains(target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      setOpen(false);
      window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', closeOnEscape, true);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', closeOnEscape, true);
    };
  }, [open, options, refs.floating, searchable, selectedValue]);

  useEffect(() => {
    const form = triggerRef.current?.closest('form');
    if (!form || value !== undefined) return;
    const reset = () => {
      setInternalValue(defaultValue);
      setQuery('');
      setOpen(false);
    };
    form.addEventListener('reset', reset);
    return () => {
      form.removeEventListener('reset', reset);
    };
  }, [defaultValue, value]);

  function commit(option: NexoSelectOption) {
    if (option.disabled) return;
    if (value === undefined) setInternalValue(option.value);
    onValueChange?.(option.value);
    setOpen(false);
    setQuery('');
    window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  }

  function navigate(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Enter') {
      const option = filtered[activeIndexRef.current];
      if (option) commit(option);
      else if (allowCustom && query.trim()) commit({ value: query.trim(), label: query.trim() });
      return;
    }
    const enabledIndexes = filtered.flatMap((option, index) => (option.disabled ? [] : [index]));
    const currentEnabledPosition = enabledIndexes.indexOf(activeIndexRef.current);
    const next =
      event.key === 'Home'
        ? (enabledIndexes[0] ?? 0)
        : event.key === 'End'
          ? (enabledIndexes.at(-1) ?? 0)
          : (enabledIndexes[
              Math.max(
                0,
                Math.min(
                  enabledIndexes.length - 1,
                  (currentEnabledPosition < 0 ? 0 : currentEnabledPosition) +
                    (event.key === 'ArrowDown' ? 1 : -1),
                ),
              )
            ] ?? 0);
    setActiveIndex(next);
    activeIndexRef.current = next;
    if (virtualized && viewportRef.current) viewportRef.current.scrollTop = next * rowHeight;
    else
      document
        .getElementById(`${listboxId}-option-${String(next)}`)
        ?.scrollIntoView({ block: 'nearest' });
  }

  const blocked = disabled || readOnly || loading;
  return (
    <div className={`nexo-select-root ${className}`} data-state={open ? 'open' : 'closed'}>
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <label className="nexo-select-label" id={`${id}-label`} htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="nexo-select-trigger"
        role="combobox"
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel ? undefined : `${id}-label`}
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={open ? `${listboxId}-option-${String(activeIndex)}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        data-value={selectedValue}
        disabled={blocked}
        title={selected?.label ?? placeholder}
        onClick={() => {
          setOpen((current) => !current);
        }}
        onKeyDown={(event) => {
          if (open) {
            navigate(event);
            return;
          }
          if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={`nexo-select-trigger__value${selected ? '' : ' is-placeholder'}`}>
          {selected?.icon && <span className="nexo-select-option__visual">{selected.icon}</span>}
          <span>{selected?.label ?? placeholder}</span>
        </span>
        {loading ? (
          <span className="nexo-select-spinner" role="status" aria-label="Cargando opciones" />
        ) : (
          <NexoIcon name="chevron-down" decorative />
        )}
      </button>
      {error && (
        <span id={errorId} className="nexo-error">
          {error}
        </span>
      )}
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="nexo-select-positioner"
            data-side={placement.startsWith('top') ? 'top' : 'bottom'}
          >
            <div className="nexo-select-content" role="region" aria-label={`${label}: opciones`}>
              {searchable && (
                <div className="nexo-select-search">
                  <NexoIcon name="search" decorative />
                  <input
                    ref={searchRef}
                    value={query}
                    placeholder={searchPlaceholder}
                    aria-label={`Buscar en ${label}`}
                    role="searchbox"
                    aria-controls={listboxId}
                    aria-activedescendant={`${listboxId}-option-${String(activeIndex)}`}
                    onChange={(event) => {
                      setQuery(event.currentTarget.value);
                      setActiveIndex(0);
                      activeIndexRef.current = 0;
                    }}
                    onKeyDown={navigate}
                  />
                </div>
              )}
              <div className="nexo-sr-only" role="status" aria-live="polite">
                {loading ? 'Cargando opciones' : `${String(filtered.length)} opciones disponibles`}
              </div>
              <div
                ref={viewportRef}
                id={listboxId}
                className="nexo-select-viewport"
                role="listbox"
                aria-labelledby={`${id}-label`}
                tabIndex={searchable ? -1 : 0}
                onKeyDown={navigate}
                onScroll={(event) => {
                  setScrollTop(event.currentTarget.scrollTop);
                }}
              >
                {loading ? (
                  <NexoSelectLoading />
                ) : error && retry ? (
                  <div className="nexo-select-state" role="alert">
                    <strong>No pudimos cargar las opciones</strong>
                    <span>{error}</span>
                    <button type="button" onClick={retry}>
                      Intentar de nuevo
                    </button>
                  </div>
                ) : rendered.length ? (
                  <>
                    {virtualized && (
                      <div style={{ height: virtualStart * rowHeight }} aria-hidden />
                    )}
                    {rendered.map((option, renderedIndex) => {
                      const index = virtualStart + renderedIndex;
                      const previous = filtered[index - 1];
                      return (
                        <div key={option.value}>
                          {option.group && option.group !== previous?.group && (
                            <div className="nexo-select-group-label" role="presentation">
                              {option.group}
                            </div>
                          )}
                          <button
                            id={`${listboxId}-option-${String(index)}`}
                            type="button"
                            className="nexo-select-option"
                            role="option"
                            aria-selected={option.value === selectedValue}
                            aria-disabled={option.disabled}
                            aria-posinset={index + 1}
                            aria-setsize={filtered.length}
                            data-active={index === activeIndex}
                            disabled={option.disabled}
                            onPointerMove={() => {
                              setActiveIndex(index);
                            }}
                            onClick={() => {
                              commit(option);
                            }}
                          >
                            {(Boolean(option.image) || Boolean(option.icon)) && (
                              <span className="nexo-select-option__visual">
                                {option.image ? <img src={option.image} alt="" /> : option.icon}
                              </span>
                            )}
                            <span className="nexo-select-option__copy">
                              <strong>{option.label}</strong>
                              {(Boolean(option.description) || Boolean(option.metadata)) && (
                                <small>{option.description ?? option.metadata}</small>
                              )}
                            </span>
                            {option.badge && (
                              <span className="nexo-select-option__badge">{option.badge}</span>
                            )}
                            {option.value === selectedValue && <NexoIcon name="check" decorative />}
                          </button>
                        </div>
                      );
                    })}
                    {virtualized && (
                      <div
                        style={{
                          height:
                            Math.max(0, filtered.length - virtualStart - rendered.length) *
                            rowHeight,
                        }}
                        aria-hidden
                      />
                    )}
                  </>
                ) : allowCustom && query.trim() ? (
                  <button
                    id={`${listboxId}-option-custom`}
                    type="button"
                    className="nexo-select-option nexo-select-option--custom"
                    role="option"
                    aria-selected="false"
                    onClick={() => {
                      commit({ value: query.trim(), label: query.trim() });
                    }}
                  >
                    <span className="nexo-select-option__copy">
                      <strong>Usar “{query.trim()}”</strong>
                      <small>Valor personalizado</small>
                    </span>
                  </button>
                ) : (
                  <NexoSelectEmpty message={emptyMessage}>{emptyAction}</NexoSelectEmpty>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function NexoSelectEmpty({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="nexo-select-state">
      <NexoIcon name="search" decorative />
      <strong>{message}</strong>
      {children}
    </div>
  );
}

export function NexoSelectLoading() {
  return (
    <div className="nexo-select-loading" role="status" aria-label="Cargando opciones">
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
