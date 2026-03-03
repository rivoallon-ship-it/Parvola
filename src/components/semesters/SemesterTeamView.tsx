import React, { useState } from 'react';
import { Calendar, Target, ChevronRight, ChevronDown, Users, Building2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee, EvaluationStatus } from '@/types';
import { Card, EmptyState, CampaignStatusBadge, EvaluationStatusBadge } from '@/components/common';
import { CampaignProgressSummary } from './CampaignProgressSummary';
import { BackButton } from '@/components/layout';
import { useNavigation, useEmployees, useSemesters, useOrganization, useUser } from '@/hooks';
import { colors } from '@/constants/colors';
import { getSemesterPeriod, formatDate } from '@/utils/helpers';
import { getEmployeesInScope } from '@/utils/permissions';

// ============================================
// Composant SemesterTeamView (Vue équipe d'un semestre)
// ============================================

// Composant pour une carte employé avec stats d'objectifs
const EmployeeObjectiveCard: React.FC<{
  employee: Employee;
  objectiveCount: number;
  completedCount: number;
  avgProgress: number;
  evaluationStatus: EvaluationStatus;
  disabled?: boolean;
  onClick: () => void;
}> = ({ employee, objectiveCount, completedCount, avgProgress, evaluationStatus, disabled, onClick }) => {
  const { t } = useTranslation();
  const isValidated = evaluationStatus === 'validated';

  return (
    <Card
      hover={!disabled}
      onClick={disabled ? undefined : onClick}
      className={`group relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={isValidated ? { opacity: 0.6, backgroundColor: '#f5f5f5' } : undefined}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{employee.photo}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className="font-bold group-hover:opacity-80"
              style={{ color: colors.btn.primary }}
            >
              {employee.name}
            </h3>
            <EvaluationStatusBadge status={evaluationStatus} size="sm" />
          </div>
          <p className="text-sm text-gray-500 mb-2">{employee.position}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Target size={14} />
            <span>{objectiveCount} {t('semesterTeam.objectives')}</span>
          </div>
          {objectiveCount > 0 && (
            <div className="text-sm" style={{ color: colors.accent }}>
              {completedCount} / {objectiveCount} {t('semesterTeam.completed')}
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
};

export const SemesterTeamView: React.FC = () => {
  const { t } = useTranslation();
  const { viewingSemester, setCurrentView, setViewingSemester, setSelectedEmployee, setSelectedSemester } = useNavigation();
  const { employees: allEmployees } = useEmployees();
  const { evaluations } = useSemesters();
  const { establishments: allEstablishments, teams: allTeams } = useOrganization();
  const { currentUser } = useUser();

  // Scope: filter employees, teams and establishments based on role
  const employees = getEmployeesInScope(currentUser, allEmployees, allTeams);
  const scopedTeamIds = currentUser.role === 'manager' && currentUser.teamIds
    ? new Set(currentUser.teamIds)
    : null;
  const teams = scopedTeamIds
    ? allTeams.filter((t) => scopedTeamIds.has(t.id))
    : allTeams;
  const scopedEstablishmentIds = new Set(
    currentUser.role === 'manager' && currentUser.establishmentId
      ? [currentUser.establishmentId]
      : allEstablishments.map((e) => e.id)
  );
  const establishments = allEstablishments.filter((e) => scopedEstablishmentIds.has(e.id));

  const [expandedEstablishments, setExpandedEstablishments] = useState<Set<string>>(
    new Set(establishments.map((e) => e.id))
  );
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(
    new Set(teams.map((t) => t.id))
  );

  if (!viewingSemester) return null;

  const isDraft = viewingSemester.status === 'draft';
  const semesterEvaluations = evaluations.filter((e) => e.semesterId === viewingSemester.id);

  const handleBack = () => {
    setCurrentView('semesters');
    setViewingSemester(null);
  };

  const handleSelectEmployee = (employee: Employee) => {
    if (isDraft) return;
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
      evaluationStatus: (evaluation?.validationStatus || 'not_started') as EvaluationStatus,
    };
  };

  const getGroupStats = (employeeList: Employee[]) => {
    let totalObjectives = 0;
    let completedObjectives = 0;
    let totalProgress = 0;
    let employeesWithObjectives = 0;

    employeeList.forEach((emp) => {
      const evaluation = evaluations.find(
        (e) => e.employeeId === emp.id && e.semesterId === viewingSemester.id
      );
      if (evaluation) {
        totalObjectives += evaluation.objectives.length;
        completedObjectives += evaluation.objectives.filter((o) => o.status === 'completed').length;

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

    return { totalObjectives, completedObjectives, avgProgress };
  };

  const semesterStats = getGroupStats(employees);
  const unassignedEmployees = employees.filter((e) => !e.establishmentId);

  // Campaign banner config
  const bannerConfig: Record<string, { bg: string; text: string; messageKey: string }> = {
    draft: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', messageKey: 'campaign.draftBanner' },
    active: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', messageKey: 'campaign.activeBanner' },
    closed: { bg: 'bg-gray-100 border-gray-300', text: 'text-gray-700', messageKey: 'campaign.closedBanner' },
  };
  const banner = bannerConfig[viewingSemester.status];

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} label={t('semester.backToSemesters')} />

      {/* Campaign Banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${banner.bg}`}>
        <AlertTriangle size={18} className={banner.text} />
        <span className={`text-sm font-medium ${banner.text}`}>
          {t(banner.messageKey)}
        </span>
      </div>

      {/* Semester Info */}
      <Card>
        <div className="flex items-center gap-4">
          <Calendar style={{ color: colors.accent }} size={40} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold" style={{ color: colors.btn.primary }}>
                {viewingSemester.name}
              </h1>
              <CampaignStatusBadge status={viewingSemester.status} />
            </div>
            <p className="text-gray-500">
              {getSemesterPeriod(viewingSemester.semester)} {viewingSemester.year}
            </p>
            {viewingSemester.closingDeadline && (
              <p className="text-sm text-gray-500 mt-1">
                {t('campaign.deadlineLabel')} {formatDate(viewingSemester.closingDeadline)}
              </p>
            )}
          </div>
          {semesterStats.totalObjectives > 0 && (
            <div className="text-right">
              <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                {semesterStats.completedObjectives}/{semesterStats.totalObjectives} {t('semesterTeam.completed')}
              </h3>
              <p className="text-sm text-gray-500">
                {semesterStats.totalObjectives} {t('semesterTeam.objectives')}
              </p>
            </div>
          )}
        </div>

        {/* Campaign Progress Summary */}
        {viewingSemester.status !== 'draft' && employees.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">{t('campaign.progress')}</p>
            <CampaignProgressSummary
              evaluations={semesterEvaluations}
              totalEmployees={employees.length}
            />
          </div>
        )}
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

            const allEstablishmentEmployees = employees.filter(
              (e) =>
                e.establishmentId === establishment.id ||
                establishmentTeams.some((t) => t.id === e.teamId)
            );

            const establishmentStats = getGroupStats(allEstablishmentEmployees);

            return (
              <div key={establishment.id} className="space-y-2">
                <Card
                  className="cursor-pointer relative"
                  onClick={() => toggleEstablishment(establishment.id)}
                >
                  <div className="flex items-center gap-4">
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
                        {allEstablishmentEmployees.length} {allEstablishmentEmployees.length > 1 ? t('organization.employeeCount_other') : t('organization.employeeCount_one')}
                      </p>
                    </div>
                    {establishmentStats.totalObjectives > 0 && (
                      <>
                        <div className="text-right">
                          <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                            {establishmentStats.completedObjectives}/{establishmentStats.totalObjectives} {t('semesterTeam.completed')}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {establishmentStats.totalObjectives} {t('semesterTeam.objectives')}
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

                {isExpanded && (
                  <div className="ml-8 space-y-3">
                    {establishmentTeams.map((team) => {
                      const teamEmployees = employees.filter((e) => e.teamId === team.id);
                      const isTeamExpanded = expandedTeams.has(team.id);
                      const teamStats = getGroupStats(teamEmployees);

                      return (
                        <div key={team.id} className="space-y-2">
                          <Card
                            className="cursor-pointer bg-gray-50 relative"
                            onClick={() => toggleTeam(team.id)}
                          >
                            <div className="flex items-center gap-4">
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
                                  {teamEmployees.length} {teamEmployees.length > 1 ? t('organization.employeeCount_other') : t('organization.employeeCount_one')}
                                </p>
                              </div>
                              {teamStats.totalObjectives > 0 && (
                                <>
                                  <div className="text-right">
                                    <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                                      {teamStats.completedObjectives}/{teamStats.totalObjectives} {t('semesterTeam.completed')}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {teamStats.totalObjectives} {t('semesterTeam.objectives')}
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
                                    evaluationStatus={stats.evaluationStatus}
                                    disabled={isDraft}
                                    onClick={() => handleSelectEmployee(emp)}
                                  />
                                );
                              })}
                            </div>
                          )}

                          {isTeamExpanded && teamEmployees.length === 0 && (
                            <div className="ml-8 p-3 bg-white rounded-lg border border-dashed border-gray-200 text-center">
                              <p className="text-gray-400 text-sm">{t('semesterTeam.noEmployeesInTeam')}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {rootEmployees.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                          <Users size={16} />
                          <span className="text-sm font-medium">
                            {t('semesterTeam.noTeam')} ({rootEmployees.length})
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
                                evaluationStatus={stats.evaluationStatus}
                                disabled={isDraft}
                                onClick={() => handleSelectEmployee(emp)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {establishmentTeams.length === 0 && rootEmployees.length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                        <p className="text-gray-500 text-sm">{t('semesterTeam.noEmployeesInEstablishment')}</p>
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
            {t('semesterTeam.unassigned')} ({unassignedEmployees.length})
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
                  evaluationStatus={stats.evaluationStatus}
                  disabled={isDraft}
                  onClick={() => handleSelectEmployee(emp)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {employees.length === 0 && (
        <EmptyState icon={Users} message={t('semesterTeam.noEmployees')} />
      )}
    </div>
  );
};

export default SemesterTeamView;
