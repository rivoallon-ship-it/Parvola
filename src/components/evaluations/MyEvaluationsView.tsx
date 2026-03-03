import React from 'react';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, EmptyState, EvaluationStatusBadge, CampaignStatusBadge } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { useNavigation, useSemesters, useEmployees, useUser } from '@/hooks';

// ============================================
// Vue "Mes évaluations" pour le rôle Employé
// ============================================

export const MyEvaluationsView: React.FC = () => {
  const { t } = useTranslation();
  const { setCurrentView, setSelectedEmployee, setSelectedSemester } = useNavigation();
  const { currentUser } = useUser();
  const { semesters, evaluations } = useSemesters();
  const { employees } = useEmployees();

  const employee = employees.find((e) => e.id === currentUser.employeeId);

  // Get evaluations for the current employee user
  const myEvaluations = evaluations
    .filter((ev) => ev.employeeId === currentUser.employeeId)
    .map((ev) => {
      const semester = semesters.find((s) => s.id === ev.semesterId);
      return { evaluation: ev, semester };
    })
    .filter((item) => item.semester && item.semester.status !== 'draft')
    .sort((a, b) => {
      if (!a.semester || !b.semester) return 0;
      if (b.semester.year !== a.semester.year) return b.semester.year - a.semester.year;
      return b.semester.semester.localeCompare(a.semester.semester);
    });

  const handleViewEvaluation = (semesterId: string) => {
    if (!employee) return;
    const semester = semesters.find((s) => s.id === semesterId);
    if (!semester) return;
    setSelectedEmployee(employee);
    setSelectedSemester(semester);
    setCurrentView('evaluation');
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('employee.myEvaluationsTitle')} />

      {employee && (
        <Card>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{employee.photo}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{employee.name}</h2>
              <p className="text-gray-500">{employee.position}</p>
            </div>
          </div>
        </Card>
      )}

      {myEvaluations.length === 0 ? (
        <EmptyState icon={ClipboardList} message={t('employee.myEvaluationsEmpty')} />
      ) : (
        <div className="space-y-3">
          {myEvaluations.map(({ evaluation, semester }) => {
            if (!semester) return null;
            const objectiveCount = evaluation.objectives.length;
            const completedCount = evaluation.objectives.filter((o) => o.status === 'completed').length;

            return (
              <Card key={evaluation.id}>
                <button
                  onClick={() => handleViewEvaluation(semester.id)}
                  className="w-full flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 transition">
                        {semester.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CampaignStatusBadge status={semester.status} />
                        <EvaluationStatusBadge status={evaluation.validationStatus || 'not_started'} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {completedCount}/{objectiveCount} {t('evaluation.objectives', { count: objectiveCount })}
                    </span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-600 transition" />
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyEvaluationsView;
