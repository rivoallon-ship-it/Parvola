import React, { useState, useMemo } from 'react';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee, NineBoxRating } from '@/types';
import { useEmployees, useSemesters, useOrganization, useUser } from '@/hooks';
import { getEmployeesInScope } from '@/utils/permissions';
import { colors } from '@/constants/colors';
import { PageHeader } from '@/components/layout';
import { Card, EmptyState, Select } from '@/components/common';
import { NineBoxGrid } from './NineBoxGrid';
import { NineBoxEmployeeChip } from './NineBoxEmployeeChip';
import { NineBoxEmployeeModal } from './NineBoxEmployeeModal';

export const NineBoxView: React.FC = () => {
  const { t } = useTranslation();
  const { employees } = useEmployees();
  const { semesters, evaluations, updateEvaluationRatings } = useSemesters();
  const { establishments, teams } = useOrganization();
  const { currentUser } = useUser();
  const isManager = currentUser.role === 'manager';

  // Scope employees based on user role
  const scopedEmployees = useMemo(
    () => getEmployeesInScope(currentUser, employees, teams),
    [currentUser, employees, teams]
  );

  // Scope establishments and teams for manager
  const scopedEstablishments = useMemo(() => {
    if (!isManager) return establishments;
    return establishments.filter((est) => est.id === currentUser.establishmentId);
  }, [establishments, isManager, currentUser.establishmentId]);

  const scopedTeams = useMemo(() => {
    if (!isManager || !currentUser.teamIds) return teams;
    return teams.filter((t) => currentUser.teamIds!.includes(t.id));
  }, [teams, isManager, currentUser.teamIds]);

  const [selectedSemesterId, setSelectedSemesterId] = useState('');
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [modalEmployee, setModalEmployee] = useState<Employee | null>(null);

  // Sorted semesters (newest first)
  const sortedSemesters = useMemo(
    () =>
      [...semesters].sort((a, b) => {
        if (b.year !== a.year) return b.year - a.year;
        return b.semester.localeCompare(a.semester);
      }),
    [semesters]
  );

  // Chained filters
  const filteredTeams = useMemo(() => {
    if (!selectedEstablishmentId) return scopedTeams;
    return scopedTeams.filter((t) => t.establishmentId === selectedEstablishmentId);
  }, [scopedTeams, selectedEstablishmentId]);

  const filteredEmployees = useMemo(() => {
    let result = scopedEmployees;
    if (selectedEstablishmentId) {
      const teamIds = filteredTeams.map((t) => t.id);
      result = result.filter(
        (e) => e.establishmentId === selectedEstablishmentId || (e.teamId && teamIds.includes(e.teamId))
      );
    }
    if (selectedTeamId) {
      result = result.filter((e) => e.teamId === selectedTeamId);
    }
    if (selectedPosition) {
      result = result.filter((e) => e.position === selectedPosition);
    }
    return result;
  }, [scopedEmployees, selectedEstablishmentId, selectedTeamId, selectedPosition, filteredTeams]);

  // Unique positions for filter
  const positions = useMemo(
    () => [...new Set(scopedEmployees.map((e) => e.position).filter(Boolean))].sort(),
    [scopedEmployees]
  );

  // Unpositioned employees (no ratings for selected semester)
  const unpositionedEmployees = useMemo(() => {
    if (!selectedSemesterId) return [];
    return filteredEmployees.filter((emp) => {
      const evaluation = evaluations.find(
        (ev) => ev.employeeId === emp.id && ev.semesterId === selectedSemesterId
      );
      return !evaluation?.performanceRating || !evaluation?.potentialRating;
    });
  }, [filteredEmployees, evaluations, selectedSemesterId]);

  // Positioned employees count
  const positionedCount = filteredEmployees.length - unpositionedEmployees.length;

  const handleDrop = async (employeeId: string, performance: NineBoxRating, potential: NineBoxRating) => {
    if (!selectedSemesterId) return;
    await updateEvaluationRatings(employeeId, selectedSemesterId, performance, potential);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setModalEmployee(employee);
  };

  const modalEvaluation = modalEmployee
    ? evaluations.find(
        (ev) => ev.employeeId === modalEmployee.id && ev.semesterId === selectedSemesterId
      ) || null
    : null;

  // Reset dependent filters when parent changes
  const handleEstablishmentChange = (value: string) => {
    setSelectedEstablishmentId(value);
    setSelectedTeamId('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('nineBox.title')} />

      {/* Filters */}
      <Card padding="md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label={t('nineBox.semester')}
            placeholder={t('nineBox.selectSemester')}
            value={selectedSemesterId}
            onChange={(e) => setSelectedSemesterId(e.target.value)}
            options={sortedSemesters.map((s) => ({ value: s.id, label: s.name }))}
          />

          <Select
            label={t('nineBox.establishment')}
            placeholder={t('common.all')}
            value={selectedEstablishmentId}
            onChange={(e) => handleEstablishmentChange(e.target.value)}
            options={scopedEstablishments.map((est) => ({ value: est.id, label: est.name }))}
          />

          <Select
            label={t('nineBox.team')}
            placeholder={t('common.allFeminine')}
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            options={filteredTeams.map((t) => ({ value: t.id, label: t.name }))}
          />

          <Select
            label={t('nineBox.position')}
            placeholder={t('common.all')}
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            options={positions.map((pos) => ({ value: pos, label: pos }))}
          />
        </div>
      </Card>

      {!selectedSemesterId ? (
        <EmptyState
          icon={Users}
          message={t('nineBox.selectSemesterHint')}
        />
      ) : (
        <>
          {/* Stats */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={14} />
            <span>
              <strong style={{ color: colors.btn.primary }}>{positionedCount}</strong>{' '}
              {t('nineBox.positionedCount', { count: positionedCount })} /{' '}
              {filteredEmployees.length} {t('nineBox.total')}
            </span>
          </div>

          {/* 9-Box Grid */}
          <Card padding="lg">
            <NineBoxGrid
              employees={filteredEmployees}
              evaluations={evaluations}
              semesterId={selectedSemesterId}
              onDrop={handleDrop}
              onEmployeeClick={handleEmployeeClick}
            />
          </Card>

          {/* Unpositioned employees */}
          {unpositionedEmployees.length > 0 && (
            <Card padding="md">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: colors.btn.primary }}
              >
                {t('nineBox.unpositioned')} ({unpositionedEmployees.length})
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {t('nineBox.dragHint')}
              </p>
              <div className="flex flex-wrap gap-2">
                {unpositionedEmployees.map((emp) => (
                  <NineBoxEmployeeChip
                    key={emp.id}
                    employee={emp}
                    onClick={() => handleEmployeeClick(emp)}
                  />
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Employee detail modal */}
      <NineBoxEmployeeModal
        employee={modalEmployee}
        evaluation={modalEvaluation}
        isOpen={!!modalEmployee}
        onClose={() => setModalEmployee(null)}
      />
    </div>
  );
};

export default NineBoxView;
