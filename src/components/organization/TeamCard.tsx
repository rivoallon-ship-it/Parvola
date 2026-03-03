import React, { useState } from 'react';
import { Users, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Team, Employee } from '@/types';
import { Card } from '@/components/common';
import { colors } from '@/constants/colors';
import { EmployeeCard } from '@/components/employees/EmployeeCard';

// ============================================
// Carte Équipe (avec employés imbriqués)
// ============================================

interface TeamCardProps {
  team: Team;
  employees: Employee[];
  onEdit?: () => void;
  onEditEmployee?: (employee: Employee) => void;
  onViewEmployeeEvaluations: (employee: Employee) => void;
  onDropEmployee?: (employeeId: string, establishmentId: string, teamId?: string) => void;
  establishmentId: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  employees,
  onEdit,
  onEditEmployee,
  onViewEmployeeEvaluations,
  onDropEmployee,
  establishmentId,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const employeeCount = employees.length;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const employeeId = e.dataTransfer.getData('employeeId');
    if (employeeId && onDropEmployee) {
      onDropEmployee(employeeId, establishmentId, team.id);
    }
  };

  return (
    <div className="mb-2">
      <Card
        className={`relative bg-gray-50 transition-all ${isDragOver ? 'ring-2 ring-offset-2' : ''}`}
        style={isDragOver ? { borderColor: colors.btn.primary } : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition"
          >
            {isExpanded ? (
              <ChevronDown size={18} className="text-gray-500" />
            ) : (
              <ChevronRight size={18} className="text-gray-500" />
            )}
          </button>

          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${colors.btn.primary}20` }}
          >
            <Users size={20} style={{ color: colors.btn.primary }} />
          </div>

          <div className="flex-1">
            <h4 className="font-semibold" style={{ color: colors.btn.primary }}>
              {team.name}
            </h4>
            {team.description && (
              <p className="text-sm text-gray-500">{team.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {t('organization.employeeCount', { count: employeeCount })}
            </p>
          </div>

          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-full hover:bg-gray-200 transition"
              title={t('organization.editTeam')}
            >
              <Edit2 size={16} className="text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>
      </Card>

      {isExpanded && employees.length > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.id}
              employee={employee}
              onEdit={onEditEmployee ? () => onEditEmployee(employee) : undefined}
              onViewEvaluations={() => onViewEmployeeEvaluations(employee)}
              draggable
            />
          ))}
        </div>
      )}

      {isExpanded && employees.length === 0 && (
        <div
          className={`ml-8 mt-2 p-3 bg-white rounded-lg border border-dashed text-center transition-all ${
            isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
          }`}
        >
          <p className="text-gray-400 text-sm">
            {isDragOver ? t('organization.dropHere') : t('organization.noEmployeeInTeam')}
          </p>
        </div>
      )}
    </div>
  );
};

export default TeamCard;
