import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ConfirmDialog } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { SemesterCard } from './SemesterCard';
import { SemesterForm } from './SemesterForm';
import { useNavigation, useSemesters, useEmployees, useUser, useConfirmDialog, useToast } from '@/hooks';
import { useOrganization } from '@/hooks';
import { canCreateCampaign, canDeleteCampaign, canPublishCampaign as canPublish, canCloseCampaign as canClose, getEmployeesInScope } from '@/utils/permissions';
import { colors } from '@/constants/colors';

// ============================================
// Composant SemesterList (Vue Semestres)
// ============================================

export const SemesterList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewingSemester, setCurrentView } = useNavigation();
  const { semesters, evaluations, addSemester, deleteSemester, publishCampaign, closeCampaign } = useSemesters();
  const { employees } = useEmployees();
  const { currentUser } = useUser();
  const { teams } = useOrganization();

  const toast = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const { dialog, confirm, close } = useConfirmDialog();

  const role = currentUser.role;
  const scopedEmployees = getEmployeesInScope(currentUser, employees, teams);
  const scopedEmployeeIds = new Set(scopedEmployees.map((e) => e.id));

  // Manager/Directeur: only show non-draft semesters
  const visibleSemesters = (role === 'manager' || role === 'directeur')
    ? semesters.filter((sem) => {
        if (sem.status === 'draft') return false;
        return true;
      })
    : semesters;

  // Grouper les semestres par année
  const semestersByYear = visibleSemesters.reduce((acc, sem) => {
    if (!acc[sem.year]) acc[sem.year] = [];
    acc[sem.year].push(sem);
    return acc;
  }, {} as Record<number, typeof visibleSemesters>);

  const handleAddSemester = async (data: { year: number; semester: 'S1' | 'S2'; closingDeadline?: string }) => {
    await addSemester(data);
    setShowAddForm(false);
    toast.success(t('toast.semesterAdded'));
  };

  const handleDeleteSemester = (id: string) => {
    confirm(t('semester.deleteConfirm'), async () => {
      await deleteSemester(id);
      close();
      toast.success(t('toast.semesterDeleted'));
    });
  };

  const handlePublish = (id: string) => {
    confirm(t('campaign.publishConfirm'), async () => {
      await publishCampaign(id);
      close();
      toast.success(t('toast.campaignPublished'));
    });
  };

  const handleClose = (id: string) => {
    confirm(t('campaign.closeConfirm'), async () => {
      await closeCampaign(id);
      close();
      toast.success(t('toast.campaignClosed'));
    });
  };

  const handleViewSemester = (semester: typeof semesters[0]) => {
    setViewingSemester(semester);
    setCurrentView('semester-team');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('semester.title')}
        action={
          canCreateCampaign(role) ? (
            <Button
              variant="primary"
              icon={<Plus size={20} />}
              onClick={() => setShowAddForm(true)}
            >
              {t('semester.new')}
            </Button>
          ) : undefined
        }
      />

      {/* Add Form */}
      {showAddForm && canCreateCampaign(role) && (
        <SemesterForm
          onSubmit={handleAddSemester}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Semesters by Year */}
      {Object.entries(semestersByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, sems]) => (
          <div key={year} className="space-y-3">
            <h2 className="text-xl font-semibold" style={{ color: colors.btn.primary }}>
              {year}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sems.map((sem) => {
                const semEvaluations = (role === 'manager' || role === 'directeur')
                  ? evaluations.filter((e) => e.semesterId === sem.id && scopedEmployeeIds.has(e.employeeId))
                  : evaluations.filter((e) => e.semesterId === sem.id);
                return (
                  <SemesterCard
                    key={sem.id}
                    semester={sem}
                    evaluationCount={semEvaluations.length}
                    evaluations={semEvaluations}
                    totalEmployees={scopedEmployees.length}
                    onClick={() => handleViewSemester(sem)}
                    onDelete={canDeleteCampaign(role) ? () => handleDeleteSemester(sem.id) : undefined}
                    onPublish={canPublish(role) ? () => handlePublish(sem.id) : undefined}
                    onClose={canClose(role) ? () => handleClose(sem.id) : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}

      {/* Empty State */}
      {visibleSemesters.length === 0 && !showAddForm && (
        <EmptyState icon={Calendar} message={t('semester.none')} />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialog.show}
        message={dialog.message}
        onConfirm={() => dialog.onConfirm?.()}
        onCancel={close}
      />
    </div>
  );
};

export default SemesterList;
