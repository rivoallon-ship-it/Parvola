import React, { useState } from 'react';
import { Building2, ChevronDown, ChevronRight, Edit2, Plus, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Establishment, Team, Employee } from '@/types';
import { Card, Button } from '@/components/common';
import { colors } from '@/constants/colors';
import { TeamCard } from './TeamCard';
import { EmployeeCard, type InvitationStatus } from '@/components/employees/EmployeeCard';

// ============================================
// Carte Établissement (avec équipes et employés imbriqués)
// ============================================

interface EstablishmentCardProps {
  establishment: Establishment;
  teams: Team[];
  employees: Employee[];
  onEdit?: () => void;
  onAddTeam?: () => void;
  onEditTeam?: (team: Team) => void;
  onEditEmployee?: (employee: Employee) => void;
  onViewEmployeeEvaluations: (employee: Employee) => void;
  onDropEmployee?: (employeeId: string, establishmentId: string, teamId?: string) => void;
  getInvitationStatus?: (employee: Employee) => InvitationStatus;
  onResendInvite?: (employee: Employee) => void;
  onSendInvite?: (employee: Employee) => void;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({
  establishment,
  teams,
  employees,
  onEdit,
  onAddTeam,
  onEditTeam,
  onEditEmployee,
  onViewEmployeeEvaluations,
  onDropEmployee,
  getInvitationStatus,
  onResendInvite,
  onSendInvite,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const establishmentTeams = teams.filter((t) => t.establishmentId === establishment.id);

  const rootEmployees = employees.filter(
    (e) => e.establishmentId === establishment.id && !e.teamId
  );

  const teamEmployees = employees.filter((e) =>
    establishmentTeams.some((t) => t.id === e.teamId)
  );

  const teamCount = establishmentTeams.length;
  const totalEmployeeCount = rootEmployees.length + teamEmployees.length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const employeeId = e.dataTransfer.getData('employeeId');
    if (employeeId && onDropEmployee) {
      onDropEmployee(employeeId, establishment.id, undefined);
    }
  };

  return (
    <div className="mb-4">
      <Card
        className={`relative transition-all ${isDragOver ? 'ring-2 ring-offset-2' : ''}`}
        style={isDragOver ? { borderColor: colors.accent } : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            {isExpanded ? (
              <ChevronDown size={20} className="text-gray-500" />
            ) : (
              <ChevronRight size={20} className="text-gray-500" />
            )}
          </button>

          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${colors.accent}20` }}
          >
            <Building2 size={24} style={{ color: colors.accent }} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold" style={{ color: colors.btn.primary }}>
              {establishment.name}
            </h3>
            {establishment.description && (
              <p className="text-sm text-gray-500">{establishment.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {t('organization.teamCount', { count: teamCount })} • {t('organization.employeeCount', { count: totalEmployeeCount })}
            </p>
          </div>

          <div className="flex gap-2">
            {onAddTeam && (
              <Button size="sm" variant="secondary" onClick={onAddTeam}>
                <Plus size={16} className="mr-1" />
                {t('organization.team')}
              </Button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                title={t('organization.editEstablishment')}
              >
                <Edit2 size={18} className="text-gray-500 hover:text-gray-700" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {isExpanded && (
        <div className="ml-8 mt-2 space-y-2">
          {establishmentTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              employees={employees.filter((e) => e.teamId === team.id)}
              onEdit={onEditTeam ? () => onEditTeam(team) : undefined}
              onEditEmployee={onEditEmployee || undefined}
              onViewEmployeeEvaluations={onViewEmployeeEvaluations}
              onDropEmployee={onDropEmployee}
              establishmentId={establishment.id}
              getInvitationStatus={getInvitationStatus}
              onResendInvite={onResendInvite}
              onSendInvite={onSendInvite}
            />
          ))}

          {rootEmployees.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2 text-gray-500">
                <Users size={16} />
                <span className="text-sm font-medium">
                  {t('organization.noTeam')} ({rootEmployees.length})
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {rootEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onEdit={onEditEmployee ? () => onEditEmployee(employee) : undefined}
                    onViewEvaluations={() => onViewEmployeeEvaluations(employee)}
                    draggable
                    invitationStatus={getInvitationStatus?.(employee)}
                    onResendInvite={onResendInvite ? () => onResendInvite(employee) : undefined}
                    onSendInvite={onSendInvite ? () => onSendInvite(employee) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {establishmentTeams.length === 0 && rootEmployees.length === 0 && (
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
              <p className="text-gray-500 text-sm">{t('organization.noTeamInEstablishment')}</p>
              <Button size="sm" variant="secondary" onClick={onAddTeam} className="mt-2">
                <Plus size={16} className="mr-1" />
                {t('organization.createTeam')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EstablishmentCard;
