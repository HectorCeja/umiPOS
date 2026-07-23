import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  type DialogHTMLAttributes,
  type ReactNode,
} from 'react';
import { IconButton } from './primitives.js';
import { NexoIcon } from './iconography.js';

export interface DialogProps extends DialogHTMLAttributes<HTMLDialogElement> {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  actions?: ReactNode;
}
export const Dialog = forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  { actions, children, description, onClose, open, title, className = '', ...props },
  forwardedRef,
) {
  const localRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = localRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      window.requestAnimationFrame(() => {
        dialog
          .querySelector<HTMLElement>(
            '[autofocus], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])',
          )
          ?.focus();
      });
    }
    if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [open]);
  const setRef = (node: HTMLDialogElement | null) => {
    localRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  return (
    <dialog
      ref={setRef}
      className={`nexo-dialog ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      {...props}
    >
      <div className="nexo-dialog__header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </div>
        <IconButton className="nexo-dialog__close" label={`Cerrar ${title}`} onClick={onClose}>
          <NexoIcon name="close" decorative />
        </IconButton>
      </div>
      <div className="nexo-dialog__body">{children}</div>
      {actions && <div className="nexo-dialog__actions">{actions}</div>}
    </dialog>
  );
});
export const AlertDialog = Dialog;
export function Drawer(props: DialogProps) {
  return <Dialog {...props} className={`nexo-sheet ${props.className ?? ''}`} />;
}
export const Sheet = Drawer;
export function BottomSheet(props: DialogProps) {
  return <Dialog {...props} className={`nexo-bottom-sheet ${props.className ?? ''}`} />;
}
