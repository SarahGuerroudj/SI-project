import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000); // Auto dismiss after 5s
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Inline styles for drop-down animation to avoid requiring global CSS changes */}
      <style>{`
        @keyframes drop-down {
          from { transform: translateY(-16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .toast-drop {
          animation: drop-down 320ms cubic-bezier(.22,.9,.32,1) both;
        }
      `}</style>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[70] flex flex-col items-center gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-drop pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl border flex items-start gap-3 ${
              toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-green-500 text-slate-900 dark:text-white' :
              toast.type === 'error' ? 'bg-white dark:bg-slate-900 border-red-500 text-slate-900 dark:text-white' :
              toast.type === 'warning' ? 'bg-white dark:bg-slate-900 border-amber-500 text-slate-900 dark:text-white' :
              'bg-white dark:bg-slate-900 border-blue-500 text-slate-900 dark:text-white'
            }`}
          >
            <div className={`mt-0.5 ${
                 toast.type === 'success' ? 'text-green-500' :
               toast.type === 'error' ? 'text-red-500' :
               toast.type === 'warning' ? 'text-amber-500' :
               'text-blue-500'
            }`}>
              {toast.type === 'success' && <CheckCircle size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'warning' && <AlertTriangle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm capitalize mb-0.5">{toast.type}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-tight">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
