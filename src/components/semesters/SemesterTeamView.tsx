import React, { useState } from 'react';
import { Calendar, Target, ChevronRight, ChevronDown, Users, Building2 } from 'lucide-react';
import type { Employee } from '@/types';
import { Card, EmptyState } from '@/components/common';
import { BackButton } from '@/components/layout';
import { useApp } from '@/hooks';
import { colors } from '@/constants/colors';
import { getSemesterPeriod } from '@/utils/helpers';

// ============================================
// Composant SemesterTeamView (Vue équipe d'un semestre)
// ============================================

// Composant pour une carte employé avec stats d'objectifs
const EmployeeObjectiveCard: React.FC<{
  employee: Employee;
  objectiveCount: number;
  completedCount: number;
  avgProgress: number;
  isValidated: boolean;
  onClick: () => void;
}> = ({ employee, objectiveCount, completedCount, avgProgress, isValidated, onClick }) => (
  <Card
    hover
    onClick={onClick}
    className="group relative"
    style={isValidated ? { opacity: 0.6, backgroundColor: '#f5f5f5' } : undefined}
  >
    {isValidated && (
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold"
        style={{ backgroundColor: colors.accent, color: 'white' }}
      >
        Validé
      </div>
    )}
    <div className={`flex items-start gap-4 ${isValidated ? 'pt-6' : ''}`}>
      <div className="text-4xl">{employee.photo}</div>
      <div className="flex-1">
        <h3
          className="font-bold group-hover:opacity-80"
          style={{ color: colors.btn.primary }}
        >
          {employee.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{employee.position}</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Target size={14} />
          <span>{objectiveCount} objectif(s)</span>
        </div>
        {objectiveCount > 0 && (
          <div className="text-sm" style={{ color: colors.accent }}>
            {completedCount} / {objectiveCount} terminé(s)
          </div>
        )}
      </div>
      {objectiveCount > 0 && (
        <h2
          className="text-2xl font-bold self-center"
          style={{ color: colors.accent }}
        >
          {avgProgress}%
        </h2>
      )}
    </div>
  </Card>
);

export const SemesterTeamView: React.FC = () => {
  const {
    viewingSemester,
    employees,
    evaluations,
    establishments,
    teams,
    setCurrentView,
    setViewingSemester,
    setSelectedEmployee,
    setSelectedSemester,
  } = useApp();

  const [expandedEstablishments, setExpandedEstablishments] = useState<Set<string>>(
    new Set(establishments.map((e) => e.id))
  );
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(
    new Set(teams.map((t) => t.id))
  );

  if (!viewingSemester) return null;

  const handleBack = () => {
    setCurrentView('semesters');
    setViewingSemester(null);
  };

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedSemester(viewingSemester);
    setCurrentView('evaluation');
  };

  const toggleEstablishment = (id: string) => {
    setExpandedEstablishments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleTeam = (id: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getEmployeeStats = (emp: Employee) => {
    const evaluation = evaluations.find(
      (e) => e.employeeId === emp.id && e.semesterId === viewingSemester.id
    );
    const activeObjectives = evaluation?.objectives.filter(
      (o) => o.status === 'in_progress' || o.status === 'completed'
    ) || [];
    const avgProgress = activeObjectives.length > 0
      ? Math.round(activeObjectives.reduce((sum, o) => sum + o.progress, 0) / activeObjectives.length)
      : 0;
    return {
      objectiveCount: evaluation?.objectives.length || 0,
      completedCount: evaluation?.objectives.filter((o) => o.status === 'completed').length || 0,
      inProgressCount: evaluation?.objectives.filter((o) => o.status === 'in_progress').length || 0,
      avgProgress,
      isValidated: evaluation?.validationStatus === 'validated',
    };
  };

  // Vérifier si tous les employés d'une liste sont validés
  const areAllEmployeesValidated = (employeeList: Employee[]) => {
    if (employeeList.length === 0) return false;
    return employeeList.every((emp) => {
      const evaluation = evaluations.find(
        (e) => e.employeeId === emp.id && e.semesterId === viewingSemester.id
      );
      return evaluation?.validationStatus === 'validated';
    });
  };

  // Calculer les stats pour un groupe d'employés
  const getGroupStats = (employeeList: Employee[]) => {
    let totalObjectives = 0;
    let completedObjectives = 0;
    let inProgressObjectives = 0;
    let totalProgress = 0;
    let employeesWithObjectives = 0;

    employeeList.forEach((emp) => {
      const evaluation = evaluations.find(
        (e) => e.employeeId === emp.id && e.semesterId === viewingSemester.id
      );
      if (evaluation) {
        totalObjectives += evaluation.objectives.length;
        completedObjectives += evaluation.objectives.filter((o) => o.status === 'completed').length;
        inProgressObjectives += evaluation.objectives.filter((o) => o.status === 'in_progress').length;

        // Calculer la moyenne de progression pour cet employé
        const activeObjectives = evaluation.objectives.filter(
          (o) => o.status === 'in_progress' || o.status === 'completed'
        );
        if (activeObjectives.length > 0) {
          const empProgress = activeObjectives.reduce((sum, o) => sum + o.progress, 0) / activeObjectives.length;
          totalProgress += empProgress;
          employeesWithObjectives++;
        }
      }
    });

    const avgProgress = employeesWithObjectives > 0
      ? Math.round(totalProgress / employeesWithObjectives)
      : 0;

    return { totalObjectives, completedObjectives, inProgressObjectives, avgProgress };
  };

  // Stats globales du semestre
  const semesterStats = getGroupStats(employees);

  // Employés sans établissement
  const unassignedEmployees = employees.filter((e) => !e.establishmentId);

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} label="Retour aux semestres" />

      {/* Semester Info */}
      <Card>
        <div className="flex items-center gap-4">
          <Calendar style={{ color: colors.accent }} size={40} />
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: colors.btn.primary }}>
              {viewingSemester.name}
            </h1>
            <p className="text-gray-500">
              {getSemesterPeriod(viewingSemester.semester)} {viewingSemester.year}
            </p>
          </div>
          {semesterStats.totalObjectives > 0 && (
            <div className="text-right">
              <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                {semesterStats.completedObjectives}/{semesterStats.totalObjectives} terminé(s)
              </h3>
              <p className="text-sm text-gray-500">
                {semesterStats.totalObjectives} objectif(s)
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Establishments hierarchy */}
      {establishments.length > 0 && (
        <div className="space-y-4">
          {establishments.map((establishment) => {
            const establishmentTeams = teams.filter((t) => t.establishmentId === establishment.id);
            const rootEmployees = employees.filter(
              (e) => e.establishmentId === establishment.id && !e.teamId
            );
            const isExpanded = expandedEstablishments.has(establishment.id);

            // Compter tous les employés de l'établissement
            const allEstablishmentEmployees = employees.filter(
              (e) =>
                e.establishmentId === establishment.id ||
                establishmentTeams.some((t) => t.id === e.teamId)
            );

            // Stats de l'établissement
            const establishmentStats = getGroupStats(allEstablishmentEmployees);
            const isEstablishmentValidated = areAllEmployeesValidated(allEstablishmentEmployees);

            return (
              <div key={establishment.id} className="space-y-2">
                {/* Establishment Header */}
                <Card
                  className="cursor-pointer relative"
                  onClick={() => toggleEstablishment(establishment.id)}
                  style={isEstablishmentValidated ? { opacity: 0.6, backgroundColor: '#e5e5e5' } : undefined}
                >
                  {isEstablishmentValidated && (
                    <div
                      className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold z-10"
                      style={{ backgroundColor: colors.accent, color: 'white' }}
                    >
                      Validé
                    </div>
                  )}
                  <div className={`flex items-center gap-4 ${isEstablishmentValidated ? 'pt-6' : ''}`}>
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
                      <p className="text-xs text-gray-400">
                        {allEstablishmentEmployees.length} employé(s)
                      </p>
                    </div>
                    {establishmentStats.totalObjectives > 0 && (
                      <>
                        <div className="text-right">
                          <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                            {establishmentStats.completedObjectives}/{establishmentStats.totalObjectives} terminé(s)
                          </h3>
                          <p className="text-sm text-gray-500">
                            {establishmentStats.totalObjectives} objectif(s)
                          </p>
                        </div>
                        <h2 className="text-2xl font-bold" style={{ color: colors.accent }}>
                          {establishmentStats.avgProgress}%
                        </h2>
                      </>
                    )}
                    <button className="p-1 hover:bg-gray-100 rounded transition">
                      {isExpanded ? (
                        <ChevronDown size={20} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={20} className="text-gray-500" />
                      )}
                    </button>
                  </div>
                </Card>

                {/* Establishment Content */}
                {isExpanded && (
                  <div className="ml-8 space-y-3">
                    {/* Teams */}
                    {establishmentTeams.map((team) => {
                      const teamEmployees = employees.filter((e) => e.teamId === team.id);
                      const isTeamExpanded = expandedTeams.has(team.id);
                      const teamStats = getGroupStats(teamEmployees);
                      const isTeamValidated = areAllEmployeesValidated(teamEmployees);

                      return (
                        <div key={team.id} className="space-y-2">
                          {/* Team Header */}
                          <Card
                            className="cursor-pointer bg-gray-50 relative"
                            onClick={() => toggleTeam(team.id)}
                            style={isTeamValidated ? { opacity: 0.6, backgroundColor: '#e5e5e5' } : undefined}
                          >
                            {isTeamValidated && (
                              <div
                                className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold z-10"
                                style={{ backgroundColor: colors.accent, color: 'white' }}
                              >
                                Validé
                              </div>
                            )}
                            <div className={`flex items-center gap-4 ${isTeamValidated ? 'pt-6' : ''}`}>
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
                                <p className="text-xs text-gray-400">
                                  {teamEmployees.length} employé(s)
                                </p>
                              </div>
                              {teamStats.totalObjectives > 0 && (
                                <>
                                  <div className="text-right">
                                    <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                                      {teamStats.completedObjectives}/{teamStats.totalObjectives} terminé(s)
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {teamStats.totalObjectives} objectif(s)
                                    </p>
                                  </div>
                                  <h2 className="text-2xl font-bold" style={{ color: colors.accent }}>
                                    {teamStats.avgProgress}%
                                  </h2>
                                </>
                              )}
                              <button className="p-1 hover:bg-gray-200 rounded transition">
                                {isTeamExpanded ? (
                                  <ChevronDown size={18} className="text-gray-500" />
                                ) : (
                                  <ChevronRight size={18} className="text-gray-500" />
                                )}
                              </button>
                            </div>
                          </Card>

                          {/* Team Employees */}
                          {isTeamExpanded && teamEmployees.length > 0 && (
                            <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {teamEmployees.map((emp) => {
                                const stats = getEmployeeStats(emp);
                                return (
                                  <EmployeeObjectiveCard
                                    key={emp.id}
                                    employee={emp}
                                    objectiveCount={stats.objectiveCount}
                                    completedCount={stats.completedCount}
                                    avgProgress={stats.avgProgress}
                                    isValidated={stats.isValidated}
                                    onClick={() => handleSelectEmployee(emp)}
                                  />
                                );
                              })}
                            </div>
                          )}

                          {isTeamExpanded && teamEmployees.length === 0 && (
                            <div className="ml-8 p-3 bg-white rounded-lg border border-dashed border-gray-200 text-center">
                              <p className="text-gray-400 text-sm">Aucun employé dans cette équipe</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Root employees (at establishment level) */}
                    {rootEmployees.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                          <Users size={16} />
                          <span className="text-sm font-medium">
                            Sans équipe ({rootEmployees.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {rootEmployees.map((emp) => {
                            const stats = getEmployeeStats(emp);
                            return (
                              <EmployeeObjectiveCard
                                key={emp.id}
                                employee={emp}
                                objectiveCount={stats.objectiveCount}
                                completedCount={stats.completedCount}
                                avgProgress={stats.avgProgress}
                                isValidated={stats.isValidated}
                                onClick={() => handleSelectEmployee(emp)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Empty state for establishment */}
                    {establishmentTeams.length === 0 && rootEmployees.length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                        <p className="text-gray-500 text-sm">Aucun employé dans cet établissement</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned Employees */}
      {unassignedEmployees.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Employés non assignés ({unassignedEmployees.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unassignedEmployees.map((emp) => {
              const stats = getEmployeeStats(emp);
              return (
                <EmployeeObjectiveCard
                  key={emp.id}
                  employee={emp}
                  objectiveCount={stats.objectiveCount}
                  completedCount={stats.completedCount}
                  avgProgress={stats.avgProgress}
                  isValidated={stats.isValidated}
                  onClick={() => handleSelectEmployee(emp)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {employees.length === 0 && (
        <EmptyState icon={Users} message="Aucun employé." />
      )}
    </div>
  );
};

export default SemesterTeamView;
