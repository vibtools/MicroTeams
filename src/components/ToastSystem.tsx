import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastSystemProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastSystem({ toasts, onDismiss }: ToastSystemProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        return (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        );
      })}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const bgStyles =
    toast.type === 'success'
      ? 'bg-[#12171F] border-[#22C55E]/40 text-[#E6EDF3]'
      : toast.type === 'error'
      ? 'bg-[#12171F] border-[#EF4444]/40 text-[#E6EDF3]'
      : toast.type === 'warning'
      ? 'bg-[#12171F] border-[#F59E0B]/40 text-[#E6EDF3]'
      : 'bg-[#12171F] border-[#38BDF8]/40 text-[#E6EDF3]';

  const iconEl =
    toast.type === 'success' ? (
      <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
    ) : toast.type === 'error' ? (
      <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
    ) : toast.type === 'warning' ? (
      <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
    ) : (
      <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />
    );

  return (
    <div
      className={`pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-[8px] border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${bgStyles}`}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        {iconEl}
        <span className="text-[12px] font-normal leading-relaxed truncate">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#8B949E] hover:text-[#E6EDF3] p-1 rounded transition-colors cursor-pointer shrink-0"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
