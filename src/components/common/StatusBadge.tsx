import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ObjectiveStatus } from '@/types';
import { getStatusLabel } from '@/utils/helpers';
import { cn } from '@/utils/cn';

// ============================================
// Composant StatusBadge avec CVA
// ============================================

const statusBadgeVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-full font-medium',
  {
    variants: {
      status: {
        not_started: 'bg-gray-100 text-gray-700',
        in_progress: 'bg-blue-100 text-blue-700',
        completed: 'bg-emerald-100 text-emerald-700',
        blocked: 'bg-red-100 text-red-700',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px]',
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: ObjectiveStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size,
  className,
}) => {
  return (
    <span className={cn(statusBadgeVariants({ status, size }), className)}>
      {getStatusLabel(status)}
    </span>
  );
};

// Export variants for external use
export { statusBadgeVariants };
export default StatusBadge;
