import React from 'react';
import { Calendar, ChevronRight, Trash2, Send, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Semester, Evaluation } from '@/types';
import { Card, Button, CampaignStatusBadge } from '@/components/common';
import { CampaignProgressSummary } from './CampaignProgressSummary';
import { colors } from '@/constants/colors';
import { getSemesterPeriod, formatDate } from '@/utils/helpers';

// ============================================
// Composant SemesterCard
// ============================================

interface SemesterCardProps {
  semester: Semester;
  evaluationCount: number;
  evaluations: Evaluation[];
  totalEmployees: number;
  onClick: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onClose?: () => void;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  evaluationCount,
  evaluations,
  totalEmployees,
  onClick,
  onDelete,
  onPublish,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Card hover className="group">
      <div className="flex justify-between items-start mb-3">
        <div onClick={onClick} className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="text-xl font-bold group-hover:opacity-80"
              style={{ color: colors.btn.primary }}
            >
              {semester.name}
            </h3>
            <CampaignStatusBadge status={semester.status} size="sm" />
          </div>
          <p className="text-sm text-gray-500">
            {evaluationCount} {t('semester.evaluationCount')}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Progress bar (active/closed campaigns only) */}
      {semester.status !== 'draft' && totalEmployees > 0 && (
        <div className="mb-3">
          <CampaignProgressSummary
            evaluations={evaluations}
            totalEmployees={totalEmployees}
            compact
          />
        </div>
      )}

      <div onClick={onClick} className="flex items-center justify-between cursor-pointer">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} />
            <span className="text-sm">{getSemesterPeriod(semester.semester)}</span>
          </div>
          {semester.closingDeadline && (
            <span className="text-xs text-gray-500">
              {t('campaign.deadlineLabel')} {formatDate(semester.closingDeadline)}
            </span>
          )}
        </div>
        <ChevronRight style={{ color: colors.accent }} size={20} />
      </div>

      {/* Action buttons */}
      {(semester.status === 'draft' || semester.status === 'active') && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          {semester.status === 'draft' && onPublish && (
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPublish();
              }}
            >
              <Send size={14} className="mr-1" />
              {t('campaign.publish')}
            </Button>
          )}
          {semester.status === 'active' && onClose && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <Lock size={14} className="mr-1" />
              {t('campaign.close')}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default SemesterCard;
