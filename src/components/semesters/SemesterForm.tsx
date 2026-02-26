import React, { useState } from 'react';
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
  const [form, setForm] = useState<NewSemesterForm>({
    year: new Date().getFullYear(),
    semester: 'S1',
  });

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">Ajouter un semestre</h3>
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
        <Button variant="primary" onClick={handleSubmit}>
          Ajouter
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </Card>
  );
};

export default SemesterForm;
