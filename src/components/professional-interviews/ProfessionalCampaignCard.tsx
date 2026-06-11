import React from 'react';
import { ChevronRight, Trash2, Send, Lock, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfessionalCampaign, ProfessionalInterview } from '@/types';
import { Card, Button, CampaignStatusBadge } from '@/components/common';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/helpers';

interface Props {
  campaign: ProfessionalCampaign;
  interviews: ProfessionalInterview[];
  totalEmployees: number;
  onClick: () => void;
  onDelete?: () => void;
  onPublish?: () => void;
  onClose?: () => void;
}

export const ProfessionalCampaignCard: React.FC<Props> = ({
  campaign,
  interviews,
  totalEmployees,
  onClick,
  onDelete,
  onPublish,
  onClose,
}) => {
  const { t } = useTranslation();
  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const progressPct = totalEmployees > 0 ? Math.round((completedCount / totalEmployees) * 100) : 0;

  return (
    <Card hover className="group">
      <div className="flex justify-between items-start mb-3">
        <div onClick={onClick} className="flex-1 cursor-pointer">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold group-hover:opacity-80" style={{ color: colors.btn.primary }}>
              {campaign.name}
            </h3>
            <CampaignStatusBadge status={campaign.status} size="sm" />
          </div>
          <p className="text-sm text-gray-500">
            {interviews.length} {t('professionalCampaign.interviewCount')}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {campaign.status !== 'draft' && totalEmployees > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{t('professionalCampaign.completed')}</span>
            <span>{completedCount}/{totalEmployees}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: colors.accent }}
            />
          </div>
        </div>
      )}

      <div onClick={onClick} className="flex items-center justify-between cursor-pointer">
        <div className="flex flex-col gap-1">
          {(campaign.scheduledFrom || campaign.scheduledTo) && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span className="text-sm">
                {campaign.scheduledFrom && formatDate(campaign.scheduledFrom)}
                {campaign.scheduledFrom && campaign.scheduledTo && ' → '}
                {campaign.scheduledTo && formatDate(campaign.scheduledTo)}
              </span>
            </div>
          )}
          {campaign.closingDeadline && (
            <span className="text-xs text-gray-500">
              {t('campaign.deadlineLabel')} {formatDate(campaign.closingDeadline)}
            </span>
          )}
        </div>
        <ChevronRight style={{ color: colors.accent }} size={20} />
      </div>

      {(campaign.status === 'draft' || campaign.status === 'active') && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
          {campaign.status === 'draft' && onPublish && (
            <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onPublish(); }}>
              <Send size={14} className="mr-1" />
              {t('campaign.publish')}
            </Button>
          )}
          {campaign.status === 'active' && onClose && (
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onClose(); }}>
              <Lock size={14} className="mr-1" />
              {t('campaign.close')}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default ProfessionalCampaignCard;
