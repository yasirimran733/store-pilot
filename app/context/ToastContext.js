'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, toasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts } = useContext(ToastContext);
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-24 right-6 z-[60] flex flex-col gap-2 max-w-sm pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-xl px-4 py-3 shadow-lg border animate-toast-in ${
            t.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : t.type === 'coupon'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-slate-900 text-white border-slate-700'
          }`}
        >
          <p className="text-sm font-medium">{t.message}</p>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
