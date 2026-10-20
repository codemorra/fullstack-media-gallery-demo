/**
 * Shared native dialog for image previews and short media forms.
 */

import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  isBusy?: boolean;
  wide?: boolean;
};

/**
 * Opens a modal dialog with native focus trapping and Escape handling.
 * Mount this component only while the dialog should be open.
 *
 * @param props - The dialog content, dismissal callback, and display settings.
 * @param props.title - The visible heading and accessible name of the dialog.
 * @param props.children - The form, image, or confirmation shown inside.
 * @param props.onClose - Requests dismissal when no operation is pending.
 * @param props.isBusy - Prevents dismissal during a pending API request.
 * @param props.wide - Allows extra space for an uncropped image preview.
 * @returns A labelled dialog that prevents dismissal while a request is pending.
 */
function Modal({
  title,
  children,
  onClose,
  isBusy = false,
  wide = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    dialog?.showModal();
    dialog?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      // Wait for card removal before choosing where to return keyboard focus.
      queueMicrotask(() => {
        if (document.querySelector('dialog[open]')) return;
        if (trigger instanceof HTMLElement && trigger.isConnected) {
          trigger.focus();
        } else {
          document.getElementById('main-content')?.focus();
        }
      });
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={`modal ${wide ? 'max-w-5xl' : 'max-w-lg'}`}
      aria-labelledby={titleId}
      aria-busy={isBusy}
      onCancel={(event) => {
        event.preventDefault();
        if (!isBusy) onClose();
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
        <h2
          id={titleId}
          className="min-w-0 text-lg font-semibold wrap-anywhere"
        >
          {title}
        </h2>
        <button
          className="button button-ghost size-10 shrink-0 p-0"
          type="button"
          aria-label="Close dialog"
          disabled={isBusy}
          onClick={onClose}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </dialog>
  );
}

export default Modal;
