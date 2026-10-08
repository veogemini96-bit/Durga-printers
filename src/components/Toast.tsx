import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border pointer-events-auto animate-slide-in ${
              toast.type === 'success'
                ? 'bg-white border-green-200'
                : toast.type === 'error'
                ? 'bg-white border-red-200'
                : 'bg-white border-blue-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
            {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
            <p className="flex-1 text-sm font-medium text-gray-800">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
