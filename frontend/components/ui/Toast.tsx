'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle2, Bell, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastData {
  id: string;
  title: string;
  message?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number; // ms, default 4000
}

const VARIANT_STYLES = {
  default: {
    border:  'border-primary/20',
    icon:    Bell,
    iconCls: 'text-primary',
  },
  success: {
    border:  'border-green-200',
    icon:    CheckCircle2,
    iconCls: 'text-green-600',
  },
  error: {
    border:  'border-red-200',
    icon:    AlertCircle,
    iconCls: 'text-red-500',
  },
  warning: {
    border:  'border-amber-200',
    icon:    AlertTriangle,
    iconCls: 'text-amber-500',
  },
  info: {
    border:  'border-blue-200',
    icon:    Info,
    iconCls: 'text-blue-500',
  },
} as const;

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const duration = toast.duration ?? 4000;

  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.id), duration);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss, duration]);

  const style = VARIANT_STYLES[toast.variant ?? 'default'];
  const Icon  = style.icon;

  return (
    <div className={cn(
      'flex w-80 items-start gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-lg',
      'animate-in slide-in-from-right-8 duration-200',
      style.border,
    )}>
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', style.iconCls)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-xs text-muted-foreground">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, addToast, dismiss };
}
