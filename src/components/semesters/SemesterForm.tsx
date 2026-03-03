import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { NewSemesterForm } from '@/types';
import { Card, Button, Select, Input } from '@/components/common';

// ============================================
// Composant SemesterForm
// ============================================

interface SemesterFormProps {
  onSubmit: (data: NewSemesterForm) => void;
  onCancel: () => void;
}

export const SemesterForm: React.FC<SemesterFormProps> = ({ onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<NewSemesterForm>({
    year: new Date().getFullYear(),
    semester: 'S1',
  });

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">{t('semester.add')}</h3>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Select
            value={form.semester}
            onChange={(e) => setForm({ ...form, semester: e.target.value as 'S1' | 'S2' })}
            options={[
              { value: 'S1', label: 'S1' },
              { value: 'S2', label: 'S2' },
            ]}
          />
          <Input
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || new Date().getFullYear() })}
            className="w-32"
          />
          <div className="flex flex-col">
            <label className="text-xs text-gray-500 mb-1">{t('campaign.closingDeadline')}</label>
            <Input
              type="date"
              value={form.closingDeadline || ''}
              onChange={(e) => setForm({ ...form, closingDeadline: e.target.value || undefined })}
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">{t('campaign.createdAsDraft')}</p>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSubmit}>
            {t('common.add')}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SemesterForm;
