import React, { useState } from 'react';
import { Briefcase, Edit2, Trash2, Plus, ChevronDown, FileText, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Position, ObjectiveTemplate, NewTemplateForm, AISuggestedTemplate, UserRole } from '@/types';
import { Card, Button, Input, TextArea, EmptyState } from '@/components/common';
import { TemplateCard } from './TemplateCard';
import { TemplateAIAssistant } from './TemplateAIAssistant';
import { colors } from '@/constants/colors';

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  admin: { bg: '#EDE9FE', text: '#5B21B6' },
  rh: { bg: '#DBEAFE', text: '#1E40AF' },
  directeur: { bg: '#CFFAFE', text: '#155E75' },
  manager: { bg: '#FEF3C7', text: '#92400E' },
  employee: { bg: '#D1FAE5', text: '#065F46' },
};

// ============================================
// Composant PositionCard (carte de poste avec templates)
// ============================================

interface PositionCardProps {
  position: Position;
  templates: ObjectiveTemplate[];
  onEdit?: () => void;
  onDelete?: () => void;
  onAddTemplate?: (template: NewTemplateForm) => void;
  onEditTemplate?: (template: ObjectiveTemplate) => void;
  onDeleteTemplate?: (id: string) => void;
  onAcceptAITemplate?: (template: AISuggestedTemplate) => void;
}

export const PositionCard: React.FC<PositionCardProps> = ({
  position,
  templates,
  onEdit,
  onDelete,
  onAddTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onAcceptAITemplate,
}) => {
  const { t } = useTranslation();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ObjectiveTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<NewTemplateForm>({
    positionId: position.id,
    title: '',
    description: '',
    suggestedDeadlineDays: 90,
  });

  const handleAddTemplate = () => {
    if (!newTemplate.title.trim()) return;
    onAddTemplate?.(newTemplate);
    setNewTemplate({
      positionId: position.id,
      title: '',
      description: '',
      suggestedDeadlineDays: 90,
    });
    setShowAddForm(false);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate?.title.trim()) return;
    onEditTemplate?.(editingTemplate);
    setEditingTemplate(null);
  };

  return (
    <Card>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Briefcase style={{ color: colors.accent }} size={28} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold" style={{ color: colors.btn.primary }}>
                {position.name}
              </h2>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: ROLE_COLORS[position.role]?.bg || ROLE_COLORS.employee.bg,
                  color: ROLE_COLORS[position.role]?.text || ROLE_COLORS.employee.text,
                }}
              >
                {t(`user.role${position.role.charAt(0).toUpperCase()}${position.role.slice(1)}`)}
              </span>
            </div>
            {position.description && (
              <p className="text-sm text-gray-600 mt-1">{position.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">{templates.length} {t('templates.templateCount')}</p>
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button onClick={onEdit} className="text-amber-600 hover:text-amber-700">
                <Edit2 size={20} />
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="text-red-500 hover:text-red-700">
                <Trash2 size={20} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Template Menu */}
      {onAddTemplate && <div className="relative add-template-menu mb-4">
        <Button
          variant="accent"
          icon={<Plus size={18} />}
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          {t('templates.addTemplate')}
          <ChevronDown size={16} className="ml-1" />
        </Button>

        {showAddMenu && (
          <div
            className="absolute top-full left-0 mt-2 w-64 rounded-lg shadow-lg z-10"
            style={{ backgroundColor: colors.card.bg, border: `1px solid ${colors.card.border}` }}
          >
            <button
              onClick={() => {
                setShowAddForm(true);
                setShowAddMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b"
              style={{ borderColor: colors.card.border }}
            >
              <Plus size={18} style={{ color: colors.accent }} />
              <div>
                <div className="font-medium" style={{ color: colors.btn.primary }}>
                  {t('templates.blankTemplate')}
                </div>
                <div className="text-xs text-gray-500">{t('templates.createFromScratch')}</div>
              </div>
            </button>
            <button
              onClick={() => {
                setShowAIAssistant(true);
                setShowAddMenu(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left rounded-b-lg"
            >
              <Target size={18} className="text-purple-600" />
              <div>
                <div className="font-medium" style={{ color: colors.btn.primary }}>
                  {t('templates.aiAssistant')}
                </div>
                <div className="text-xs text-gray-500">{t('templates.generateWithAI')}</div>
              </div>
            </button>
          </div>
        )}
      </div>}

      {/* AI Assistant */}
      {onAddTemplate && showAIAssistant && (
        <TemplateAIAssistant
          position={position}
          onAcceptTemplate={onAcceptAITemplate!}
          onClose={() => setShowAIAssistant(false)}
        />
      )}

      {/* Add Form */}
      {showAddForm && (
        <div
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: colors.accentLight, border: `1px solid ${colors.accent}40` }}
        >
          <h4 className="font-semibold mb-3">{t('templates.newTemplate')}</h4>
          <div className="space-y-3">
            <Input
              placeholder={t('templates.templateTitle')}
              value={newTemplate.title}
              onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
            />
            <TextArea
              placeholder={t('templates.templateDescription')}
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            />
            <Input
              type="number"
              label={t('templates.suggestedDeadline')}
              min={1}
              value={newTemplate.suggestedDeadlineDays}
              onChange={(e) =>
                setNewTemplate({
                  ...newTemplate,
                  suggestedDeadlineDays: parseInt(e.target.value) || 90,
                })
              }
            />
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleAddTemplate}>
                {t('common.add')}
              </Button>
              <Button variant="secondary" onClick={() => setShowAddForm(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form */}
      {editingTemplate && (
        <div
          className="p-4 rounded-lg mb-4"
          style={{ backgroundColor: '#FEF3C7', border: `1px solid ${colors.warning}` }}
        >
          <h4 className="font-semibold mb-3">{t('templates.editTemplate')}</h4>
          <div className="space-y-3">
            <Input
              value={editingTemplate.title}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
            />
            <TextArea
              value={editingTemplate.description || ''}
              onChange={(e) =>
                setEditingTemplate({ ...editingTemplate, description: e.target.value })
              }
            />
            <Input
              type="number"
              label={t('templates.suggestedDeadline')}
              min={1}
              value={editingTemplate.suggestedDeadlineDays}
              onChange={(e) =>
                setEditingTemplate({
                  ...editingTemplate,
                  suggestedDeadlineDays: parseInt(e.target.value) || 90,
                })
              }
            />
            <div className="flex gap-3">
              <Button variant="warning" onClick={handleUpdateTemplate}>
                {t('common.save')}
              </Button>
              <Button variant="secondary" onClick={() => setEditingTemplate(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Templates List */}
      <div className="space-y-3">
        {templates.map((tmpl, index) => (
          <TemplateCard
            key={tmpl.id}
            template={tmpl}
            index={index}
            onEdit={onEditTemplate ? () => setEditingTemplate({ ...tmpl }) : undefined}
            onDelete={onDeleteTemplate ? () => onDeleteTemplate(tmpl.id) : undefined}
          />
        ))}
        {templates.length === 0 && !showAddForm && (
          <EmptyState icon={FileText} message={t('templates.noTemplate')} />
        )}
      </div>
    </Card>
  );
};

export default PositionCard;
