import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { ObjectiveTemplate } from '@/types';
import { colors } from '@/constants/colors';

// ============================================
// Composant TemplateCard
// ============================================

interface TemplateCardProps {
  template: ObjectiveTemplate;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  index,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: colors.body.bg, border: `1px solid ${colors.card.border}` }}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <span className="font-semibold text-lg" style={{ color: colors.accent }}>
            {index + 1}.
          </span>
          <div>
            <h4 className="font-semibold" style={{ color: colors.btn.primary }}>
              {template.title}
            </h4>
            {template.description && (
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              📅 Échéance: {template.suggestedDeadlineDays} jours
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-amber-600 hover:text-amber-700">
            <Edit2 size={18} />
          </button>
          <button onClick={onDelete} className="text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;
