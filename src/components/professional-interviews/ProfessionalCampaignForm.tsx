import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input } from '@/components/common';
import type { NewProfessionalCampaignForm } from '@/types';

interface Props {
  onSubmit: (form: NewProfessionalCampaignForm) => Promise<void>;
  onCancel: () => void;
}

export const ProfessionalCampaignForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState<NewProfessionalCampaignForm>({
    year: currentYear,
    name: '',
    scheduledFrom: '',
    scheduledTo: '',
    closingDeadline: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        name: form.name || undefined,
        scheduledFrom: form.scheduledFrom || undefined,
        scheduledTo: form.scheduledTo || undefined,
        closingDeadline: form.closingDeadline || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="font-semibold text-gray-700">{t('professionalCampaign.new')}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={t('professionalCampaign.year')}
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            required
          />
          <Input
            label={t('professionalCampaign.nameOptional')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={t('professionalCampaign.namePlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label={t('professionalCampaign.scheduledFrom')}
            type="date"
            value={form.scheduledFrom}
            onChange={(e) => setForm({ ...form, scheduledFrom: e.target.value })}
          />
          <Input
            label={t('professionalCampaign.scheduledTo')}
            type="date"
            value={form.scheduledTo}
            onChange={(e) => setForm({ ...form, scheduledTo: e.target.value })}
          />
          <Input
            label={t('professionalCampaign.closingDeadline')}
            type="date"
            value={form.closingDeadline}
            onChange={(e) => setForm({ ...form, closingDeadline: e.target.value })}
          />
        </div>

        <p className="text-xs text-gray-400">{t('campaign.createdAsDraft')}</p>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? t('common.loading') : t('common.create')}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default ProfessionalCampaignForm;
