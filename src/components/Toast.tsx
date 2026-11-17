import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

export interface ToastOptions {
  message: ReactNode;
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** Millisekunden, Standard 4000. */
  duration?: number;
}

interface ToastItem extends ToastOptions { id: number }

const ToastContext = createContext<((t: ToastOptions) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);

  const show = useCallback((t: ToastOptions) => {
    counter.current += 1;
    const id = counter.current;
    setItems((xs) => [...xs.slice(-2), { ...t, id }]);
    window.setTimeout(() => dismiss(id), t.duration ?? 4000);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="cui-toast-region" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="cui-toast">
            {t.icon && <Icon name={t.icon} />}
            <span>{t.message}</span>
            {t.actionLabel && (
              <button
                type="button"
                className="cui-btn cui-btn--plain cui-btn--sm"
                onClick={() => { t.onAction?.(); dismiss(t.id); }}
              >
                {t.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** const toast = useToast(); toast({ message: "Gespeichert", icon: "check" }) */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast muss innerhalb von <ToastProvider> verwendet werden.");
  return ctx;
}
