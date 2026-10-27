import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'info';
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success' }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-md text-white dark:text-slate-900 text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-300 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-4 h-4 text-teal-400 dark:text-teal-600 shrink-0" aria-hidden="true" />
      )}
      <span className="truncate max-w-xs">{message}</span>
    </div>
  );
};
