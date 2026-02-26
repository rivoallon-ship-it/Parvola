import React, { useState, useEffect } from 'react';
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
  const [form, setForm] = useState<NewEmployeeForm>({
    name: employee?.name || '',
    position: employee?.position || '',
    photo: employee?.photo || '',
    establishmentId: employee?.establishmentId || defaultEstablishmentId || '',
    teamId: employee?.teamId || '',
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
          {isEditing ? "Modifier l'employé" : 'Ajouter un employé'}
        </h3>
        {isEditing && onDelete && (
          <Button variant="danger" onClick={onDelete}>
            Supprimer
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Nom complet"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        {positions.length > 0 ? (
          <Select
            label="Poste"
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            options={positions.map((p) => ({ value: p.name, label: p.name }))}
            placeholder="Sélectionner un poste"
          />
        ) : (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
            Veuillez créer un poste dans la section "Poste" avant d'ajouter un employé.
          </div>
        )}
        <Input
          type="text"
          placeholder="Photo (emoji)"
          value={form.photo}
          onChange={(e) => setForm({ ...form, photo: e.target.value })}
        />
        {establishments.length > 0 && (
          <Select
            label="Établissement"
            value={form.establishmentId || ''}
            onChange={(e) => handleEstablishmentChange(e.target.value)}
            options={establishmentOptions}
            placeholder="Sans établissement"
          />
        )}
        {form.establishmentId && teamOptions.length > 0 && (
          <Select
            label="Équipe"
            value={form.teamId || ''}
            onChange={(e) => setForm({ ...form, teamId: e.target.value || undefined })}
            options={teamOptions}
            placeholder="À la racine de l'établissement"
          />
        )}
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
          <Button variant={isEditing ? 'warning' : 'primary'} onClick={handleSubmit}>
            {isEditing ? 'Sauvegarder' : 'Ajouter'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeForm;
