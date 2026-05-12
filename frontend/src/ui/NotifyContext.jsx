import {
    createContext,
    useCallback,
    useContext,
    useState,
} from "react";
import { createPortal } from "react-dom";

const NotifyContext = createContext(null);

function genId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function NotifyProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [dialog, setDialog] = useState(null);

    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((t) => t.id !== id));
    }, []);

    /**
     * @param {string} message
     * @param {{ variant?: 'success'|'error'|'warning'|'info', title?: string, duration?: number }} [opts]
     */
    const toast = useCallback(
        (message, opts = {}) => {
            const id = genId();
            const variant = opts.variant || "info";
            const duration =
                opts.duration ?? (variant === "error" ? 6500 : variant === "warning" ? 5200 : 4200);

            setToasts((list) => [...list, { id, message, variant, title: opts.title }]);

            window.setTimeout(() => dismiss(id), duration);
        },
        [dismiss]
    );

    /**
     * @param {{ title?: string, message: string, confirmLabel?: string, cancelLabel?: string, danger?: boolean }} opts
     * @returns {Promise<boolean>}
     */
    const confirm = useCallback((opts) => {
        return new Promise((resolve) => {
            setDialog({
                title: opts.title || "Confirmar",
                message: opts.message,
                confirmLabel: opts.confirmLabel || "Confirmar",
                cancelLabel: opts.cancelLabel || "Cancelar",
                danger: !!opts.danger,
                resolve: (v) => {
                    setDialog(null);
                    resolve(v);
                },
            });
        });
    }, []);

    const portal =
        typeof document !== "undefined"
            ? createPortal(
                  <>
                      <div className="toast-stack" aria-live="polite">
                          {toasts.map((t) => (
                              <div
                                  key={t.id}
                                  className={`toast toast--${t.variant}`}
                                  role="status"
                              >
                                  <div className="toast-accent" aria-hidden />
                                  <div className="toast-inner">
                                      {t.title ? (
                                          <div className="toast-title">{t.title}</div>
                                      ) : null}
                                      <div className="toast-msg">{t.message}</div>
                                  </div>
                                  <button
                                      type="button"
                                      className="toast-close"
                                      aria-label="Fechar"
                                      onClick={() => dismiss(t.id)}
                                  >
                                      ×
                                  </button>
                              </div>
                          ))}
                      </div>

                      {dialog ? (
                          <div
                              className="confirm-backdrop"
                              role="presentation"
                              onClick={() => dialog.resolve(false)}
                          >
                              <div
                                  className="confirm-dialog"
                                  role="alertdialog"
                                  aria-modal="true"
                                  aria-labelledby="confirm-dialog-title"
                                  aria-describedby="confirm-dialog-desc"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                      if (e.key === "Escape") dialog.resolve(false);
                                  }}
                              >
                                  <h2 id="confirm-dialog-title" className="confirm-title">
                                      {dialog.title}
                                  </h2>
                                  <p id="confirm-dialog-desc" className="confirm-msg">
                                      {dialog.message}
                                  </p>
                                  <div className="confirm-actions">
                                      <button
                                          type="button"
                                          className="confirm-btn confirm-btn--ghost"
                                          onClick={() => dialog.resolve(false)}
                                      >
                                          {dialog.cancelLabel}
                                      </button>
                                      <button
                                          type="button"
                                          className={
                                              dialog.danger
                                                  ? "confirm-btn confirm-btn--danger"
                                                  : "confirm-btn confirm-btn--primary"
                                          }
                                          onClick={() => dialog.resolve(true)}
                                      >
                                          {dialog.confirmLabel}
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ) : null}
                  </>,
                  document.body
              )
            : null;

    return (
        <NotifyContext.Provider value={{ toast, confirm }}>
            {children}
            {portal}
        </NotifyContext.Provider>
    );
}

export function useNotify() {
    const ctx = useContext(NotifyContext);
    if (!ctx) {
        throw new Error("useNotify deve ser usado dentro de NotifyProvider");
    }
    return ctx;
}
