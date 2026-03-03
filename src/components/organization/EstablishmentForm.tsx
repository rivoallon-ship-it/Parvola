import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Establishment, NewEstablishmentForm } from '@/types';
import { Button, Input, TextArea } from '@/components/common';

// ============================================
// Formulaire Établissement
// ============================================

interface EstablishmentFormProps {
  establishment?: Establishment;
  onSubmit: (data: NewEstablishmentForm | Establishment) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

export const EstablishmentForm: React.FC<EstablishmentFormProps> = ({
  establishment,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<NewEstablishmentForm>({
    name: establishment?.name || '',
    description: establishment?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (isEditing && establishment) {
      onSubmit({ ...establishment, ...form });
    } else {
      onSubmit(form);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('organization.establishmentName')}
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder={t('organization.establishmentPlaceholder')}
        required
      />
      <TextArea
        label={t('organization.descriptionOptional')}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder={t('organization.establishmentDescPlaceholder')}
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

export default EstablishmentForm;
