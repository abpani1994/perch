import { createContext, useCallback, useContext, useState } from "react";
import { Icon } from "@iconify/react";

const ToastContext = createContext(null);

let idSeq = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message, tone = "success") => {
      const id = ++idSeq;
      setToasts((t) => [...t, { id, message, tone }]);
      setTimeout(() => dismiss(id), 3600);
    },
    [dismiss]
  );

  const icons = {
    success: "ph:check-circle-fill",
    error: "ph:warning-circle-fill",
    info: "ph:info-fill",
  };
  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    info: "var(--accent)",
  };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="card flex items-start gap-3 !p-3.5 shadow-lg"
            style={{ animation: "float 0.01ms" }}
          >
            <Icon icon={icons[t.tone]} width="20" style={{ color: colors[t.tone], flexShrink: 0, marginTop: 1 }} />
            <p className="text-sm leading-snug flex-1" style={{ color: "var(--text-1)" }}>{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-[color:var(--text-2)] hover:text-[color:var(--text-1)]" aria-label="Dismiss">
              <Icon icon="ph:x" width="16" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}