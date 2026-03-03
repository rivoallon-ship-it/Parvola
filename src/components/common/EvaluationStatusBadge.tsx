import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { EvaluationStatus } from '@/types';
import { getEvaluationStatusLabel } from '@/utils/helpers';
import { cn } from '@/utils/cn';

const evaluationBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium',
  {
    variants: {
      status: {
        not_started: 'bg-gray-100 text-gray-600',
        in_progress: 'bg-blue-100 text-blue-700',
        submitted: 'bg-amber-100 text-amber-700',
        validated: 'bg-emerald-100 text-emerald-700',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const dotColors: Record<EvaluationStatus, string> = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  submitted: 'bg-amber-500',
  validated: 'bg-emerald-500',
};

export interface EvaluationStatusBadgeProps extends VariantProps<typeof evaluationBadgeVariants> {
  status: EvaluationStatus;
  className?: string;
}

export const EvaluationStatusBadge: React.FC<EvaluationStatusBadgeProps> = ({
  status,
  size,
  className,
}) => {
  return (
    <span className={cn(evaluationBadgeVariants({ status, size }), className)}>
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotColors[status])} />
      {getEvaluationStatusLabel(status)}
    </span>
  );
};

export default EvaluationStatusBadge;
