import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { CampaignStatus } from '@/types';
import { getCampaignStatusLabel } from '@/utils/helpers';
import { cn } from '@/utils/cn';

const campaignBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium',
  {
    variants: {
      status: {
        draft: 'bg-amber-100 text-amber-700',
        active: 'bg-blue-100 text-blue-700',
        closed: 'bg-gray-200 text-gray-600',
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

const dotColors: Record<CampaignStatus, string> = {
  draft: 'bg-amber-500',
  active: 'bg-blue-500',
  closed: 'bg-gray-400',
};

export interface CampaignStatusBadgeProps extends VariantProps<typeof campaignBadgeVariants> {
  status: CampaignStatus;
  className?: string;
}

export const CampaignStatusBadge: React.FC<CampaignStatusBadgeProps> = ({
  status,
  size,
  className,
}) => {
  return (
    <span className={cn(campaignBadgeVariants({ status, size }), className)}>
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotColors[status])} />
      {getCampaignStatusLabel(status)}
    </span>
  );
};

export default CampaignStatusBadge;
