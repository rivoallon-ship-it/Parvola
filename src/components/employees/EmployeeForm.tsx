import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Employee, NewEmployeeForm, Team, Establishment, Position } from '@/types';
import { Card, Button, Input, Select } from '@/components/common';
import { colors } from '@/constants/colors';

// ============================================
// Composant EmployeeForm
// ============================================

interface EmployeeFormProps {
  employee?: Employee;
  teams?: Team[];
  establishments?: Establishment[];
  positions?: Position[];
  defaultEstablishmentId?: string;
  onSubmit: (data: NewEmployeeForm | Employee) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing?: boolean;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  teams = [],
  establishments = [],
  positions = [],
  defaultEstablishmentId,
  onSubmit,
  onCancel,
  onDelete,
  isEditing = false,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<NewEmployeeForm>({
    name: employee?.name || '',
    position: employee?.position || '',
    photo: employee?.photo || '',
    establishmentId: employee?.establishmentId || defaultEstablishmentId || '',
    teamId: employee?.teamId || '',
    salary: employee?.salary,
    lateCount: employee?.lateCount,
    unjustifiedAbsences: employee?.unjustifiedAbsences,
    justifiedAbsences: employee?.justifiedAbsences,
  });

  // Quand une équipe est sélectionnée, mettre à jour l'établissement automatiquement
  useEffect(() => {
    if (form.teamId) {
      const team = teams.find((t) => t.id === form.teamId);
      if (team && team.establishmentId !== form.establishmentId) {
        setForm((prev) => ({ ...prev, establishmentId: team.establishmentId }));
      }
    }
  }, [form.teamId, teams]);

  // Options établissements
  const establishmentOptions = establishments.map((est) => ({
    value: est.id,
    label: est.name,
  }));

  // Options équipes filtrées par établissement sélectionné
  const filteredTeams = form.establishmentId
    ? teams.filter((t) => t.establishmentId === form.establishmentId)
    : teams;

  const teamOptions = filteredTeams.map((team) => ({
    value: team.id,
    label: team.name,
  }));

  const handleEstablishmentChange = (establishmentId: string) => {
    // Réinitialiser l'équipe si elle n'appartient pas au nouvel établissement
    const currentTeam = teams.find((t) => t.id === form.teamId);
    const shouldResetTeam = currentTeam && currentTeam.establishmentId !== establishmentId;

    setForm({
      ...form,
      establishmentId: establishmentId || undefined,
      teamId: shouldResetTeam ? undefined : form.teamId,
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (isEditing && employee) {
      onSubmit({ ...employee, ...form });
    } else {
      onSubmit(form);
    }
  };

  return (
    <Card borderColor={isEditing ? colors.warning : undefined}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">
          {isEditing ? t('employeeForm.editTitle') : t('employeeForm.addTitle')}
        </h3>
        {isEditing && onDelete && (
          <Button variant="danger" onClick={onDelete}>
            {t('common.delete')}
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder={t('employeeForm.fullName')}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {positions.length > 0 ? (
          <Select
            label={t('employeeForm.position')}
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            options={positions.map((p) => ({ value: p.name, label: p.name }))}
            placeholder={t('employeeForm.selectPosition')}
          />
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            {t('employeeForm.createPositionFirst')}
          </div>
        )}
        <Input
          type="text"
          placeholder={t('employeeForm.photo')}
          value={form.photo}
          onChange={(e) => setForm({ ...form, photo: e.target.value })}
        />
        {establishments.length > 0 && (
          <Select
            label={t('employeeForm.establishment')}
            value={form.establishmentId || ''}
            onChange={(e) => handleEstablishmentChange(e.target.value)}
            options={establishmentOptions}
            placeholder={t('employeeForm.noEstablishment')}
          />
        )}
        {form.establishmentId && teamOptions.length > 0 && (
          <Select
            label={t('employeeForm.team')}
            value={form.teamId || ''}
            onChange={(e) => setForm({ ...form, teamId: e.target.value || undefined })}
            options={teamOptions}
            placeholder={t('employeeForm.rootEstablishment')}
          />
        )}
        {/* Assiduité et rémunération */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            {t('employeeInfo.attendanceTitle')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder={t('employeeForm.salaryPlaceholder')}
              label={t('employeeForm.salary')}
              value={form.salary ?? ''}
              onChange={(e) => setForm({ ...form, salary: e.target.value ? Number(e.target.value) : undefined })}
              min={0}
            />
            <Input
              type="number"
              placeholder={t('employeeForm.lateCountPlaceholder')}
              label={t('employeeForm.lateCount')}
              value={form.lateCount ?? ''}
              onChange={(e) => setForm({ ...form, lateCount: e.target.value ? Number(e.target.value) : undefined })}
              min={0}
            />
            <Input
              type="number"
              placeholder={t('employeeForm.unjustifiedAbsencesPlaceholder')}
              label={t('employeeForm.unjustifiedAbsences')}
              value={form.unjustifiedAbsences ?? ''}
              onChange={(e) => setForm({ ...form, unjustifiedAbsences: e.target.value ? Number(e.target.value) : undefined })}
              min={0}
            />
            <Input
              type="number"
              placeholder={t('employeeForm.justifiedAbsencesPlaceholder')}
              label={t('employeeForm.justifiedAbsences')}
              value={form.justifiedAbsences ?? ''}
              onChange={(e) => setForm({ ...form, justifiedAbsences: e.target.value ? Number(e.target.value) : undefined })}
              min={0}
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant={isEditing ? 'warning' : 'primary'} onClick={handleSubmit}>
            {isEditing ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeForm;
