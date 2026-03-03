import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Evaluation, EvaluationStatus } from '@/types';
import { cn } from '@/utils/cn';

interface CampaignProgressSummaryProps {
  evaluations: Evaluation[];
  totalEmployees: number;
  compact?: boolean;
}

const statusSegments: { key: EvaluationStatus; color: string; labelKey: string }[] = [
  { key: 'validated', color: 'bg-emerald-500', labelKey: 'evaluationStatus.validated' },
  { key: 'submitted', color: 'bg-amber-500', labelKey: 'evaluationStatus.submitted' },
  { key: 'in_progress', color: 'bg-blue-500', labelKey: 'evaluationStatus.inProgress' },
  { key: 'not_started', color: 'bg-gray-300', labelKey: 'evaluationStatus.notStarted' },
];

export const CampaignProgressSummary: React.FC<CampaignProgressSummaryProps> = ({
  evaluations,
  totalEmployees,
  compact = false,
}) => {
  const { t } = useTranslation();

  const counts: Record<EvaluationStatus, number> = {
    not_started: 0,
    in_progress: 0,
    submitted: 0,
    validated: 0,
  };

  for (const ev of evaluations) {
    const status = ev.validationStatus || 'not_started';
    counts[status]++;
  }

  // Employees without any evaluation record count as not_started
  const evaluatedCount = evaluations.length;
  counts.not_started += Math.max(0, totalEmployees - evaluatedCount);

  const total = totalEmployees || 1;

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          {statusSegments.map(({ key, color }) => {
            const pct = (counts[key] / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={key}
                className={cn('h-full transition-all', color)}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        {statusSegments.map(({ key, color }) => {
          const pct = (counts[key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={key}
              className={cn('h-full transition-all', color)}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
        {statusSegments.map(({ key, color, labelKey }) => (
          <span key={key} className="inline-flex items-center gap-1.5">
            <span className={cn('inline-block h-2 w-2 rounded-full', color)} />
            {t(labelKey)}: {counts[key]}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CampaignProgressSummary;
