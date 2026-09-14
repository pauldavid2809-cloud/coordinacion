import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-slideUp max-w-sm">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 ${
        type === 'error'
          ? 'bg-rose-900 text-white border-rose-700'
          : 'bg-slate-900 text-white border-amber-500/40'
      }`}>
        {type === 'error' ? (
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        )}
        <p className="text-xs font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
