import React, { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Position, NewPositionForm, AISuggestedTemplate, UserRole } from '@/types';
import { Button, Card, Input, TextArea, Select, EmptyState, ConfirmDialog } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { PositionCard } from './PositionCard';
import { useTemplates, useConfirmDialog, useToast } from '@/hooks';
import { useUser } from '@/hooks';
import { canEditTemplates } from '@/utils/permissions';
import { colors } from '@/constants/colors';

// ============================================
// Composant TemplateList (Vue Templates)
// ============================================

export const TemplateList: React.FC = () => {
  const { t } = useTranslation();
  const { positions, templates, addPosition, updatePosition, deletePosition, addTemplate, updateTemplate, deleteTemplate } = useTemplates();
  const { currentUser } = useUser();
  const toast = useToast();
  const canEdit = canEditTemplates(currentUser.role);

  const ROLE_OPTIONS: Array<{ value: string; label: string }> = [
    { value: 'employee', label: t('user.roleEmployee') },
    { value: 'manager', label: t('user.roleManager') },
    { value: 'directeur', label: t('user.roleDirecteur') },
    { value: 'rh', label: t('user.roleRh') },
    { value: 'admin', label: t('user.roleAdmin') },
  ];

  const [showAddPosition, setShowAddPosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [newPosition, setNewPosition] = useState<NewPositionForm>({ name: '', description: '', role: 'employee' });

  const { dialog, confirm, close } = useConfirmDialog();

  const handleAddPosition = async () => {
    if (!newPosition.name.trim()) return;
    await addPosition(newPosition);
    setNewPosition({ name: '', description: '', role: 'employee' });
    setShowAddPosition(false);
    toast.success(t('toast.positionAdded'));
  };

  const handleUpdatePosition = async () => {
    if (!editingPosition?.name.trim()) return;
    await updatePosition(editingPosition);
    setEditingPosition(null);
    toast.success(t('toast.positionUpdated'));
  };

  const handleDeletePosition = (id: string) => {
    confirm(t('templates.deletePositionConfirm'), async () => {
      await deletePosition(id);
      close();
      toast.success(t('toast.positionDeleted'));
    });
  };

  const handleDeleteTemplate = (id: string) => {
    confirm(t('templates.deleteTemplateConfirm'), async () => {
      await deleteTemplate(id);
      close();
      toast.success(t('toast.templateDeleted'));
    });
  };

  const handleAcceptAITemplate = async (positionId: string, template: AISuggestedTemplate) => {
    await addTemplate({
      positionId,
      title: template.title,
      description: template.description,
      suggestedDeadlineDays: template.suggestedDeadlineDays || 90,
    });
    toast.success(t('toast.templateAdded'));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('templates.title')}
        action={
          canEdit ? (
            <Button
              variant="primary"
              icon={<Plus size={20} />}
              onClick={() => setShowAddPosition(true)}
            >
              {t('templates.newPosition')}
            </Button>
          ) : undefined
        }
      />

      {/* Add Position Form */}
      {canEdit && showAddPosition && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">{t('templates.addPosition')}</h3>
          <div className="space-y-4">
            <Input
              placeholder={t('templates.positionName')}
              value={newPosition.name}
              onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
            />
            <TextArea
              placeholder={t('common.descriptionOptional')}
              value={newPosition.description}
              onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
            />
            <Select
              label={t('templates.positionRole')}
              value={newPosition.role}
              onChange={(e) => setNewPosition({ ...newPosition, role: e.target.value as UserRole })}
              options={ROLE_OPTIONS}
            />
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleAddPosition}>
                {t('common.add')}
              </Button>
              <Button variant="secondary" onClick={() => setShowAddPosition(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Position Form */}
      {canEdit && editingPosition && (
        <Card borderColor={colors.warning}>
          <h3 className="text-lg font-semibold mb-4">{t('templates.editPosition')}</h3>
          <div className="space-y-4">
            <Input
              value={editingPosition.name}
              onChange={(e) => setEditingPosition({ ...editingPosition, name: e.target.value })}
            />
            <TextArea
              value={editingPosition.description || ''}
              onChange={(e) =>
                setEditingPosition({ ...editingPosition, description: e.target.value })
              }
            />
            <Select
              label={t('templates.positionRole')}
              value={editingPosition.role}
              onChange={(e) => setEditingPosition({ ...editingPosition, role: e.target.value as UserRole })}
              options={ROLE_OPTIONS}
            />
            <div className="flex gap-3">
              <Button variant="warning" onClick={handleUpdatePosition}>
                {t('common.save')}
              </Button>
              <Button variant="secondary" onClick={() => setEditingPosition(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Positions List */}
      <div className="space-y-6">
        {positions.map((pos) => (
          <PositionCard
            key={pos.id}
            position={pos}
            templates={templates.filter((t) => t.positionId === pos.id)}
            onEdit={canEdit ? () => setEditingPosition({ ...pos }) : undefined}
            onDelete={canEdit ? () => handleDeletePosition(pos.id) : undefined}
            onAddTemplate={canEdit ? (tmpl) => addTemplate(tmpl) : undefined}
            onEditTemplate={canEdit ? (tmpl) => updateTemplate(tmpl) : undefined}
            onDeleteTemplate={canEdit ? handleDeleteTemplate : undefined}
            onAcceptAITemplate={canEdit ? (tmpl) => handleAcceptAITemplate(pos.id, tmpl) : undefined}
          />
        ))}
      </div>

      {/* Empty State */}
      {positions.length === 0 && !showAddPosition && (
        <EmptyState icon={Briefcase} message={t('templates.noPosition')} />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.show}
        message={dialog.message}
        onConfirm={() => dialog.onConfirm?.()}
        onCancel={close}
      />
    </div>
  );
};

export default TemplateList;
