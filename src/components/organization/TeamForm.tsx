import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        label={t('organization.establishment')}
        value={form.establishmentId}
        onChange={(e) => setForm({ ...form, establishmentId: e.target.value })}
        options={establishmentOptions}
        placeholder={t('organization.selectEstablishment')}
        required
      />
      <Input
        label={t('organization.teamName')}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder={t('organization.teamPlaceholder')}
        required
      />
      <TextArea
        label={t('organization.descriptionOptional')}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder={t('organization.teamDescPlaceholder')}
        rows={3}
      />
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant="primary">
          {isEditing ? t('common.save') : t('common.create')}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        {isEditing && onDelete && (
          <Button type="button" variant="danger" onClick={onDelete} className="ml-auto">
            {t('common.delete')}
          </Button>
        )}
      </div>
    </form>
  );
};

export default TeamForm;
