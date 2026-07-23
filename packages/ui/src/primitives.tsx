import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { createPortal } from 'react-dom';
import { NexoIcon } from './iconography.js';
import { NexoSelect, type NexoSelectProps } from './nexo-select.js';

export type Tone = 'success' | 'warning' | 'danger' | 'info';
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'neutral'
  | 'warning'
  | 'destructive'
  | 'critical'
  | 'danger'
  | 'success';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = '',
    disabled,
    loading = false,
    loadingLabel = 'Procesando…',
    type = 'button',
    variant = 'primary',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`nexo-button nexo-button--${variant} ${className}`}
      disabled={Boolean(disabled) || loading}
      aria-busy={loading ? true : undefined}
      {...props}
    >
      {loading ? (
        <span className="nexo-button__loading" role="status" aria-live="polite">
          <span className="nexo-button__loading-dot" aria-hidden="true" />
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
});

export type NexoDestructiveButtonProps = Omit<ButtonProps, 'variant'>;
export const NexoDestructiveButton = forwardRef<HTMLButtonElement, NexoDestructiveButtonProps>(
  function NexoDestructiveButton({ children, className = '', ...props }, ref) {
    return (
      <Button
        ref={ref}
        variant="destructive"
        className={`nexo-destructive-button ${className}`}
        {...props}
      >
        <NexoIcon name="archive" decorative />
        <span>{children}</span>
      </Button>
    );
  },
);

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className = '', children, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`nexo-icon-button ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
});
/** Authoritative alias for every icon-only action across NEXO. */
export const NexoIconButton = IconButton;

export interface NexoBrandProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'full' | 'compact' | 'mark';
  tone?: 'light' | 'dark';
}

/** The only code-owned NEXO wordmark. Product surfaces select a variant; they never redraw it. */
export function NexoBrand({
  className = '',
  tone = 'light',
  variant = 'full',
  ...props
}: NexoBrandProps) {
  return (
    <span
      className={`nexo-brand nexo-brand--${variant} nexo-brand--${tone} ${className}`}
      role="img"
      aria-label="NEXO"
      data-nexo-brand="authoritative"
      {...props}
    >
      {variant === 'mark' ? (
        <b aria-hidden="true">X</b>
      ) : (
        <>
          <span aria-hidden="true">NE</span>
          <b aria-hidden="true">X</b>
          <span aria-hidden="true">O</span>
        </>
      )}
    </span>
  );
}

export function Link({ className = '', ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a className={`nexo-link ${className}`} {...props} />;
}
export const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="nexo-label" {...props} />
);
export const FieldError = ({ children, id }: { children: ReactNode; id?: string }) => (
  <span className="nexo-error" id={id} role="alert">
    {children}
  </span>
);

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string | undefined;
  help?: string | undefined;
  htmlFor?: string | undefined;
  required?: boolean | undefined;
}
export function FormField({ children, error, help, htmlFor, label, required }: FormFieldProps) {
  return (
    <div className="nexo-field-wrap">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? ' *' : ''}
      </Label>
      {children}
      {help && <span className="nexo-help">{help}</span>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
  help?: string;
}
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { error, help, id: givenId, label, required, ...props },
  ref,
) {
  const generated = useId();
  const id = givenId ?? generated;
  const errorId = `${id}-error`;
  return (
    <FormField label={label} htmlFor={id} help={help} error={error} required={required}>
      <input
        ref={ref}
        id={id}
        className="nexo-field"
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
    </FormField>
  );
});
export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }
>(function TextArea({ error, id: givenId, label, ...props }, ref) {
  const id = givenId ?? useId();
  return (
    <FormField label={label} htmlFor={id} error={error}>
      <textarea
        ref={ref}
        id={id}
        className="nexo-textarea"
        aria-invalid={Boolean(error)}
        {...props}
      />
    </FormField>
  );
});
export const NumberInput = forwardRef<HTMLInputElement, TextFieldProps>(
  function NumberInput(props, ref) {
    return <TextField ref={ref} inputMode="decimal" type="number" {...props} />;
  },
);
export const MoneyInput = forwardRef<HTMLInputElement, TextFieldProps & { currency?: string }>(
  function MoneyInput({ currency = 'MXN', ...props }, ref) {
    return (
      <TextField
        ref={ref}
        inputMode="decimal"
        type="text"
        help={props.help ?? `Importe en ${currency}; el servidor confirma el total.`}
        {...props}
      />
    );
  },
);
export const SearchInput = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'type'>>(
  function SearchInput(props, ref) {
    return <TextField ref={ref} type="search" enterKeyHint="search" {...props} />;
  },
);
export const BarcodeInput = forwardRef<HTMLInputElement, Omit<TextFieldProps, 'type'>>(
  function BarcodeInput(props, ref) {
    return <TextField ref={ref} type="text" inputMode="none" autoComplete="off" {...props} />;
  },
);

export interface QuantityInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
}
export function QuantityInput({
  label = 'Cantidad',
  max,
  min = 0,
  onValueChange,
  value,
  ...props
}: QuantityInputProps) {
  const clamp = (next: number) => Math.min(max ?? Number.MAX_SAFE_INTEGER, Math.max(min, next));
  return (
    <div className="nexo-cluster" role="group" aria-label={label}>
      <IconButton
        label="Disminuir cantidad"
        onClick={() => {
          onValueChange(clamp(value - 1));
        }}
      >
        −
      </IconButton>
      <input
        className="nexo-field"
        style={{ width: '5rem', textAlign: 'center' }}
        aria-label={label}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => {
          onValueChange(clamp(Number(event.currentTarget.value)));
        }}
        {...props}
      />
      <IconButton
        label="Aumentar cantidad"
        onClick={() => {
          onValueChange(clamp(value + 1));
        }}
      >
        +
      </IconButton>
    </div>
  );
}

export type SelectProps = NexoSelectProps;
export function Select(props: SelectProps) {
  return <NexoSelect {...props} />;
}
export function Combobox(props: SelectProps) {
  return <NexoSelect {...props} searchable />;
}
export function MultiSelect(props: SelectProps) {
  return <NexoSelect {...props} searchable />;
}
export function Checkbox({
  children,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className="nexo-check">
      <input type="checkbox" {...props} />
      {children}
    </label>
  );
}
export function Switch({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="nexo-check">
      <input type="checkbox" role="switch" {...props} />
      {label}
    </label>
  );
}
export function RadioGroup({
  legend,
  name,
  options,
}: {
  legend: string;
  name: string;
  options: readonly { label: string; value: string }[];
}) {
  return (
    <fieldset>
      <legend className="nexo-label">{legend}</legend>
      {options.map((option) => (
        <label className="nexo-check" key={option.value}>
          <input type="radio" name={name} value={option.value} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
export const DatePicker = (props: Omit<TextFieldProps, 'type'>) => (
  <TextField type="date" {...props} />
);
export const TimePicker = (props: Omit<TextFieldProps, 'type'>) => (
  <TextField type="time" {...props} />
);

export const Card = ({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`nexo-card ${className}`} {...props} />
);
export const Badge = ({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={`nexo-badge ${className}`} {...props} />
);
export function StatusBadge({ children, tone = 'info' }: { children: ReactNode; tone?: Tone }) {
  return <Badge className={`nexo-status--${tone}`}>{children}</Badge>;
}
export function Avatar({ alt, src, fallback }: { alt: string; src?: string; fallback: string }) {
  return src ? (
    <img className="nexo-avatar" src={src} alt={alt} width="40" height="40" />
  ) : (
    <span className="nexo-avatar nexo-avatar--fallback" role="img" aria-label={alt}>
      {fallback}
    </span>
  );
}
export function Alert({
  children,
  title,
  tone = 'info',
}: {
  children: ReactNode;
  title: string;
  tone?: Tone;
}) {
  return (
    <div
      className={`nexo-alert nexo-status--${tone}`}
      role={tone === 'danger' ? 'alert' : 'status'}
    >
      <strong>{title}</strong>
      <div>{children}</div>
    </div>
  );
}
export function EmptyState({
  action,
  description,
  illustration,
  secondaryAction,
  title,
}: {
  action?: ReactNode;
  description: string;
  illustration?: ReactNode;
  secondaryAction?: ReactNode;
  title: string;
}) {
  return (
    <Card className="nexo-empty-state">
      {illustration && (
        <div className="nexo-empty-state__illustration" aria-hidden="true">
          {illustration}
        </div>
      )}
      <h2>{title}</h2>
      <p>{description}</p>
      {(action ?? secondaryAction) && (
        <div className="nexo-empty-state__actions">
          {action}
          {secondaryAction}
        </div>
      )}
    </Card>
  );
}
export type SkeletonVariant =
  | 'dashboard'
  | 'card'
  | 'product'
  | 'inventory'
  | 'sale'
  | 'cash'
  | 'team'
  | 'settings'
  | 'profile'
  | 'table'
  | 'search';
export const Skeleton = ({
  label = 'Preparando contenido',
  variant = 'card',
}: {
  label?: string;
  variant?: SkeletonVariant;
}) => (
  <div className={`nexo-skeleton nexo-skeleton--${variant}`} role="status" aria-live="polite">
    <span className="nexo-sr-only">{label}</span>
  </div>
);
export const Spinner = ({ label = 'Preparando contenido' }: { label?: string }) => (
  <span className="nexo-spinner" role="status">
    <span className="nexo-sr-only">{label}</span>
  </span>
);
export const Progress = ({ label, value }: { label: string; value?: number }) => (
  <progress aria-label={label} value={value} max={100} />
);
export const ShortcutHint = ({ keys }: { keys: string }) => <kbd>{keys}</kbd>;
export const OfflineIndicator = ({ offline = true }: { offline?: boolean }) => (
  <span className="nexo-connection" role="status" aria-live="polite">
    {offline ? 'Sin conexión · tus datos siguen seguros' : 'En línea'}
  </span>
);
export const SyncStatus = ({ pending = 0 }: { pending?: number }) => (
  <span className="nexo-status--info" role="status" aria-live="polite">
    {pending ? `${String(pending)} cambios por sincronizar` : 'Sincronizado'}
  </span>
);
export function PermissionGuard({
  allowed,
  children,
  fallback = null,
}: {
  allowed: boolean;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return <>{allowed ? children : fallback}</>;
}
export function ErrorBoundarySurface({
  action,
  detail,
  title,
}: {
  action?: ReactNode;
  detail: string;
  title: string;
}) {
  return (
    <Alert title={title} tone="danger">
      <p>{detail}</p>
      {action}
    </Alert>
  );
}
export const Tooltip = ({ children, text }: { children: ReactNode; text: string }) => (
  <span className="nexo-tooltip" data-tooltip={text} tabIndex={0} aria-label={text}>
    {children}
  </span>
);
export const Popover = ({ children, summary }: { children: ReactNode; summary: ReactNode }) => (
  <details className="nexo-popover">
    <summary className="nexo-popover__trigger">{summary}</summary>
    <Card className="nexo-popover__surface">{children}</Card>
  </details>
);
export const DropdownMenu = Popover;
export const ContextMenu = Popover;
export const Toast = ({ children, tone = 'info' }: { children: ReactNode; tone?: Tone }) => (
  <div
    className={`nexo-toast nexo-toast--${tone}`}
    role={tone === 'danger' ? 'alert' : 'status'}
    aria-live="polite"
  >
    <span className="nexo-toast__icon">
      <NexoIcon
        name={tone === 'success' ? 'check' : tone === 'danger' ? 'close' : 'life-buoy'}
        decorative
      />
    </span>
    <div>{children}</div>
  </div>
);

export function PremiumToast({
  title,
  detail,
  action,
  tone = 'info',
  onDismiss,
  duration = 4000,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
  tone?: Tone;
  onDismiss: () => void;
  duration?: number;
}) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration);
  const started = useRef(Date.now());
  useEffect(() => {
    remaining.current = duration;
    started.current = Date.now();
  }, [detail, duration, title]);
  useEffect(() => {
    if (paused) {
      remaining.current -= Date.now() - started.current;
      return;
    }
    started.current = Date.now();
    const timer = window.setTimeout(onDismiss, Math.max(remaining.current, 0));
    return () => {
      window.clearTimeout(timer);
    };
  }, [detail, duration, onDismiss, paused, title]);
  return (
    <div
      className={`nexo-toast nexo-toast--${tone} nexo-premium-toast`}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={tone === 'danger' ? 'assertive' : 'polite'}
      onMouseEnter={() => {
        setPaused(true);
      }}
      onMouseLeave={() => {
        setPaused(false);
      }}
      onFocus={() => {
        setPaused(true);
      }}
      onBlur={() => {
        setPaused(false);
      }}
    >
      <span className="nexo-toast__icon">
        <NexoIcon
          name={tone === 'success' ? 'check' : tone === 'danger' ? 'close' : 'life-buoy'}
          decorative
        />
      </span>
      <div className="nexo-toast__copy">
        <strong>{title}</strong>
        <p>{detail}</p>
        {action && <div className="nexo-toast__action">{action}</div>}
      </div>
      <NexoIconButton
        className="nexo-overlay-close nexo-toast__close"
        label="Cerrar notificación"
        onClick={onDismiss}
      >
        <NexoIcon name="close" decorative />
      </NexoIconButton>
    </div>
  );
}

export function PremiumToastPortal({
  label,
  ...toast
}: Parameters<typeof PremiumToast>[0] & { label?: string }) {
  const [provider, setProvider] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let root = document.getElementById('nexo-toast-provider');
    if (!root) {
      root = document.createElement('div');
      root.id = 'nexo-toast-provider';
      root.className = 'nexo-toast-region';
      root.setAttribute('popover', 'manual');
      root.setAttribute('aria-label', label ?? 'Notificaciones');
      document.body.append(root);
    }
    installToastSafeArea(root);
    if (!root.matches(':popover-open')) {
      root.showPopover();
    }
    setProvider(root);
  }, [label]);
  if (!provider) return null;
  const officialDuration = (toast.duration ?? 0) >= 60_000 ? (toast.duration ?? 60_000) : 4000;
  return createPortal(<PremiumToast {...toast} duration={officialDuration} />, provider);
}
export const Banner = Alert;

const toastSafeAreaRoots = new WeakSet<HTMLElement>();
function installToastSafeArea(root: HTMLElement) {
  if (toastSafeAreaRoots.has(root)) return;
  toastSafeAreaRoots.add(root);
  let anchor: HTMLElement | null = null;
  const update = () => {
    const next = document.querySelector<HTMLElement>('[data-nexo-toast-safe-area]');
    if (next !== anchor) {
      observer.disconnect();
      anchor = next;
      if (anchor) observer.observe(anchor);
    }
    const bottom = anchor?.getBoundingClientRect().bottom ?? 0;
    root.style.setProperty('--nexo-toast-safe-top', `${String(Math.max(0, bottom))}px`);
  };
  const observer = new ResizeObserver(update);
  const mutations = new MutationObserver(update);
  mutations.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}
