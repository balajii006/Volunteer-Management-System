import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, variant }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setToasts([]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm transition-all duration-200 ease-out ${
              toast.variant === "success"
                ? "bg-slate-800 border-slate-700 text-sky-100"
                : toast.variant === "error"
                ? "bg-rose-900 border-rose-800 text-rose-100"
                : "bg-slate-800 border-slate-700 text-slate-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                className="text-slate-300 hover:text-slate-100"
              >
                <span className="sr-only">Dismiss</span>
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
