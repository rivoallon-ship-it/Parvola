import React, { useState } from 'react';
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Objective, ObjectiveStatus } from '@/types';
import { Card, Input, TextArea, Select, StatusBadge, DictationButton } from '@/components/common';
import { colors } from '@/constants/colors';

// ============================================
// Composant ObjectiveCard
// ============================================

interface ObjectiveCardProps {
  objective: Objective;
  index: number;
  evalId: string;
  onUpdate: (field: keyof Objective, value: string | number) => void;
  onDelete: () => void;
  readOnly?: boolean;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({
  objective,
  index,
  onUpdate,
  onDelete,
  readOnly = false,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(!objective.title && !readOnly);

  const statusOptions = [
    { value: 'not_started', label: t('status.notStarted') },
    { value: 'in_progress', label: t('status.inProgress') },
    { value: 'completed', label: t('status.completed') },
    { value: 'blocked', label: t('status.blocked') },
  ];

  return (
    <Card
      id={`objective-${index}`}
      className="relative"
      style={{ borderLeftWidth: '4px', borderLeftColor: colors.accent }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className="text-2xl font-bold"
          style={{ color: colors.accent }}
        >
          {index + 1}.
        </span>

        <div className="flex-1">
          {isEditing && !readOnly ? (
            <Input
              value={objective.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              placeholder={t('objective.title')}
              className="font-semibold"
            />
          ) : (
            <h3
              className={`font-semibold ${!readOnly ? 'cursor-pointer hover:opacity-80' : ''}`}
              style={{ color: colors.btn.primary }}
              onClick={() => !readOnly && setIsEditing(true)}
            >
              {objective.title || t('common.noTitle')}
            </h3>
          )}
        </div>

        <StatusBadge status={objective.status} />

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {!readOnly && (
          <>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-amber-600 hover:text-amber-700"
            >
              <Edit2 size={18} />
            </button>

            <button
              onClick={onDelete}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="space-y-4 pl-9">
          {/* Description */}
          {isEditing && !readOnly ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">{t('objective.description')}</label>
                <DictationButton
                  onResult={(text) => onUpdate('description', text)}
                  existingText={objective.description}
                />
              </div>
              <TextArea
                value={objective.description}
                onChange={(e) => onUpdate('description', e.target.value)}
                placeholder={t('objective.descriptionPlaceholder')}
              />
            </div>
          ) : objective.description ? (
            <p className="text-gray-600">{objective.description}</p>
          ) : null}

          {/* Progress and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('objective.progression')} ({objective.progress}%)
              </label>
              <div
                className={`relative w-full h-4 rounded-full ${!readOnly ? 'cursor-pointer' : ''}`}
                style={{ backgroundColor: '#6C6C6C', border: '1px solid #6C6C6C' }}
                onClick={(e) => {
                  if (readOnly) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                  onUpdate('progress', Math.max(0, Math.min(100, percent)));
                }}
                onMouseDown={(e) => {
                  if (readOnly) return;
                  const bar = e.currentTarget;
                  const move = (ev: MouseEvent) => {
                    const rect = bar.getBoundingClientRect();
                    const percent = Math.round(((ev.clientX - rect.left) / rect.width) * 100);
                    onUpdate('progress', Math.max(0, Math.min(100, percent)));
                  };
                  const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                  };
                  document.addEventListener('mousemove', move);
                  document.addEventListener('mouseup', up);
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ width: `${objective.progress}%`, backgroundColor: '#1BFFB6' }}
                />
                {!readOnly && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full shadow-md"
                    style={{
                      left: `calc(${objective.progress}% - 10px)`,
                      backgroundColor: '#1BFFB6',
                      border: '2px solid #6C6C6C',
                    }}
                  />
                )}
              </div>
            </div>

            <Select
              label={t('objective.status')}
              value={objective.status}
              onChange={(e) => onUpdate('status', e.target.value as ObjectiveStatus)}
              options={statusOptions}
              disabled={readOnly}
            />

            <Input
              type="date"
              label={t('objective.deadline')}
              value={objective.deadline}
              onChange={(e) => onUpdate('deadline', e.target.value)}
              disabled={readOnly}
            />
          </div>

          {/* Evaluation */}
          {isEditing && !readOnly ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">{t('objective.evaluation')}</label>
                <DictationButton
                  onResult={(text) => onUpdate('evaluation', text)}
                  existingText={objective.evaluation || ''}
                />
              </div>
              <TextArea
                value={objective.evaluation || ''}
                onChange={(e) => onUpdate('evaluation', e.target.value)}
                placeholder={t('objective.descriptionPlaceholder')}
              />
            </div>
          ) : objective.evaluation ? (
            <div className="rounded-lg p-3" style={{ backgroundColor: `${colors.accent}10` }}>
              <p className="text-sm text-gray-700">
                <span className="font-medium" style={{ color: colors.accent }}>{t('objective.evaluationColon')}</span> {objective.evaluation}
              </p>
            </div>
          ) : null}

          {/* Comments */}
          {isEditing && !readOnly && (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium text-gray-700">{t('objective.comments')}</label>
                <DictationButton
                  onResult={(text) => onUpdate('comments', text)}
                  existingText={objective.comments}
                />
              </div>
              <TextArea
                value={objective.comments}
                onChange={(e) => onUpdate('comments', e.target.value)}
                placeholder={t('objective.commentsPlaceholder')}
              />
            </div>
          )}

          {(!isEditing || readOnly) && objective.comments && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t('objective.comments')}:</span> {objective.comments}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ObjectiveCard;
