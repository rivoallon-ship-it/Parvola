import React, { useState, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Toast as ToastType } from '@/types';

const toastVariants = cva(
  'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border min-w-[320px] max-w-[420px] pointer-events-auto',
  {
    variants: {
      variant: {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        warning: 'bg-amber-50 border-amber-200 text-amber-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  warning: 'text-amber-600',
  info: 'text-blue-600',
};

interface ToastItemProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = iconMap[toast.variant];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(toast.id), 200);
  };

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      const exitTimer = setTimeout(() => setIsExiting(true), duration - 200);
      const removeTimer = setTimeout(() => onClose(toast.id), duration);
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [toast.duration, toast.id, onClose]);

  return (
    <div
      className={cn(
        toastVariants({ variant: toast.variant }),
        isExiting ? 'animate-toast-out' : 'animate-toast-in'
      )}
      role="alert"
    >
      <Icon size={20} className={cn('flex-shrink-0', iconColorMap[toast.variant])} />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};
