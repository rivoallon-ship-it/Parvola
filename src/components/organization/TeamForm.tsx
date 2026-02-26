import React, { useState } from 'react';
import type { Team, NewTeamForm, Establishment } from '@/types';
import { Button, Input, TextArea, Select } from '@/components/common';

// ============================================
// Formulaire Équipe
// ============================================

interface TeamFormProps {
  team?: Team;
  establishments: Establishment[];
  defaultEstablishmentId?: string;
  onSubmit: (data: NewTeamForm | Team) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  establishments,
  defaultEstablishmentId,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
}) => {
  const [form, setForm] = useState<NewTeamForm>({
    establishmentId: team?.establishmentId || defaultEstablishmentId || '',
    name: team?.name || '',
    description: team?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.establishmentId) return;

    if (isEditing && team) {
      onSubmit({ ...team, ...form });
    } else {
      onSubmit(form);
    }
  };

  const establishmentOptions = establishments.map((est) => ({
    value: est.id,
    label: est.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Établissement"
        value={form.establishmentId}
        onChange={(e) => setForm({ ...form, establishmentId: e.target.value })}
        options={establishmentOptions}
        placeholder="Sélectionner un établissement"
        required
      />
      <Input
        label="Nom de l'équipe"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Ex: Équipe commerciale, Support technique..."
        required
      />
      <TextArea
        label="Description (optionnel)"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description de l'équipe..."
        rows={3}
      />
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary">
          {isEditing ? 'Enregistrer' : 'Créer'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        {isEditing && onDelete && (
          <Button type="button" variant="danger" onClick={onDelete} className="ml-auto">
            Supprimer
          </Button>
        )}
      </div>
    </form>
  );
};

export default TeamForm;
