import React, { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import type { Position, NewPositionForm, AISuggestedTemplate } from '@/types';
import { Button, Card, Input, TextArea, EmptyState, ConfirmDialog } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { PositionCard } from './PositionCard';
import { useApp, useConfirmDialog } from '@/hooks';
import { colors } from '@/constants/colors';

// ============================================
// Composant TemplateList (Vue Templates)
// ============================================

export const TemplateList: React.FC = () => {
  const {
    positions,
    templates,
    addPosition,
    updatePosition,
    deletePosition,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  } = useApp();

  const [showAddPosition, setShowAddPosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [newPosition, setNewPosition] = useState<NewPositionForm>({ name: '', description: '' });

  const { dialog, confirm, close } = useConfirmDialog();

  const handleAddPosition = async () => {
    if (!newPosition.name.trim()) return;
    await addPosition(newPosition);
    setNewPosition({ name: '', description: '' });
    setShowAddPosition(false);
  };

  const handleUpdatePosition = async () => {
    if (!editingPosition?.name.trim()) return;
    await updatePosition(editingPosition);
    setEditingPosition(null);
  };

  const handleDeletePosition = (id: string) => {
    confirm('Supprimer ce poste et tous ses templates ?', async () => {
      await deletePosition(id);
      close();
    });
  };

  const handleDeleteTemplate = (id: string) => {
    confirm('Supprimer ce template ?', async () => {
      await deleteTemplate(id);
      close();
    });
  };

  const handleAcceptAITemplate = async (positionId: string, template: AISuggestedTemplate) => {
    await addTemplate({
      positionId,
      title: template.title,
      description: template.description,
      suggestedDeadlineDays: template.suggestedDeadlineDays || 90,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des postes"
        action={
          <Button
            variant="primary"
            icon={<Plus size={20} />}
            onClick={() => setShowAddPosition(true)}
          >
            Nouveau Poste
          </Button>
        }
      />

      {/* Add Position Form */}
      {showAddPosition && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Ajouter un poste</h3>
          <div className="space-y-4">
            <Input
              placeholder="Nom du poste"
              value={newPosition.name}
              onChange={(e) => setNewPosition({ ...newPosition, name: e.target.value })}
            />
            <TextArea
              placeholder="Description (optionnel)"
              value={newPosition.description}
              onChange={(e) => setNewPosition({ ...newPosition, description: e.target.value })}
            />
            <div className="flex gap-3">
              <Button variant="primary" onClick={handleAddPosition}>
                Ajouter
              </Button>
              <Button variant="secondary" onClick={() => setShowAddPosition(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Position Form */}
      {editingPosition && (
        <Card borderColor={colors.warning}>
          <h3 className="text-lg font-semibold mb-4">Modifier le poste</h3>
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
            <div className="flex gap-3">
              <Button variant="warning" onClick={handleUpdatePosition}>
                Sauvegarder
              </Button>
              <Button variant="secondary" onClick={() => setEditingPosition(null)}>
                Annuler
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
            onEdit={() => setEditingPosition({ ...pos })}
            onDelete={() => handleDeletePosition(pos.id)}
            onAddTemplate={(tmpl) => addTemplate(tmpl)}
            onEditTemplate={(tmpl) => updateTemplate(tmpl)}
            onDeleteTemplate={handleDeleteTemplate}
            onAcceptAITemplate={(tmpl) => handleAcceptAITemplate(pos.id, tmpl)}
          />
        ))}
      </div>

      {/* Empty State */}
      {positions.length === 0 && !showAddPosition && (
        <EmptyState icon={Briefcase} message="Aucun poste créé." />
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
