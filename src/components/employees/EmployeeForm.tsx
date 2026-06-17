import React, { useState, useEffect } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee, NewEmployeeForm, Team, Establishment, Position } from '@/types';
import { Card, Button, Input, Select } from '@/components/common';
import { useUser } from '@/hooks';
import { canInviteUsers } from '@/utils/permissions';
import { fetchProfileByEmployeeId, sendEmployeeInvitation } from '@/services/supabase-data';
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
  /** Render without the outer Card wrapper (e.g. when placed inside a Modal). */
  bare?: boolean;
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
  bare = false,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const showInvite = canInviteUsers(currentUser.role);

  // Split the stored full name into first / last name for editing.
  const splitName = (full: string): { first: string; last: string } => {
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { first: '', last: '' };
    if (parts.length === 1) return { first: parts[0], last: '' };
    return { first: parts[0], last: parts.slice(1).join(' ') };
  };

  const initialName = splitName(employee?.name || '');
  const [firstName, setFirstName] = useState(initialName.first);
  const [lastName, setLastName] = useState(initialName.last);

  const [form, setForm] = useState<NewEmployeeForm>({
    name: employee?.name || '',
    position: employee?.position || '',
    photo: employee?.photo || '',
    email: employee?.email || '',
    establishmentId: employee?.establishmentId || defaultEstablishmentId || '',
    teamId: employee?.teamId || '',
  });

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'sent' | 'already'>('idle');
  const [inviteError, setInviteError] = useState('');

  // Check if employee already has a linked profile
  useEffect(() => {
    if (isEditing && employee?.id) {
      fetchProfileByEmployeeId(employee.id).then((profile) => {
        if (profile) setInviteStatus('already');
      });
    }
  }, [isEditing, employee?.id]);

  const handleSendInvite = async () => {
    if (!employee || !form.email) return;
    setInviteStatus('loading');
    setInviteError('');
    try {
      // Derive role from position
      const pos = positions.find((p) => p.name === form.position);
      const role = pos?.role || 'employee';
      await sendEmployeeInvitation(form.email, fullName || employee.name, role, employee.id);
      setInviteStatus('sent');
    } catch (err) {
      setInviteError((err as Error).message);
      setInviteStatus('idle');
    }
  };

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
    if (!fullName) return;
    const payload = { ...form, name: fullName };
    if (isEditing && employee) {
      onSubmit({ ...employee, ...payload });
    } else {
      onSubmit(payload);
    }
  };

  const formContent = (
    <>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            label={t('employeeForm.firstName')}
            placeholder={t('employeeForm.firstName')}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            type="text"
            label={t('employeeForm.lastName')}
            placeholder={t('employeeForm.lastName')}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
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
        <Input
          type="email"
          label={t('employeeForm.email')}
          placeholder="email@example.com"
          value={form.email || ''}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        {/* Invite button — only in edit mode with email */}
        {isEditing && employee && form.email && showInvite && (
          <div className="flex items-center gap-3">
            {inviteStatus === 'already' ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check size={16} />
                {t('employeeForm.alreadyInvited')}
              </span>
            ) : inviteStatus === 'sent' ? (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <Check size={16} />
                {t('employeeForm.inviteSent')}
              </span>
            ) : (
              <Button
                variant="accent"
                icon={inviteStatus === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                onClick={handleSendInvite}
                disabled={inviteStatus === 'loading'}
              >
                {t('employeeForm.sendInvite')}
              </Button>
            )}
            {inviteError && (
              <span className="text-sm text-red-500">{inviteError}</span>
            )}
          </div>
        )}
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
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant={isEditing ? 'warning' : 'primary'} onClick={handleSubmit}>
            {isEditing ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </div>
    </>
  );

  if (bare) {
    return formContent;
  }

  return (
    <Card borderColor={isEditing ? colors.warning : undefined}>
      {formContent}
    </Card>
  );
};

export default EmployeeForm;
