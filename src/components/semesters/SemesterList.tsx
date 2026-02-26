import React, { useState } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { Button, EmptyState, ConfirmDialog } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { SemesterCard } from './SemesterCard';
import { SemesterForm } from './SemesterForm';
import { useApp, useConfirmDialog } from '@/hooks';
import { colors } from '@/constants/colors';

// ============================================
// Composant SemesterList (Vue Semestres)
// ============================================

export const SemesterList: React.FC = () => {
  const {
    semesters,
    evaluations,
    addSemester,
    deleteSemester,
    setViewingSemester,
    setCurrentView,
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const { dialog, confirm, close } = useConfirmDialog();

  // Grouper les semestres par année
  const semestersByYear = semesters.reduce((acc, sem) => {
    if (!acc[sem.year]) acc[sem.year] = [];
    acc[sem.year].push(sem);
    return acc;
  }, {} as Record<number, typeof semesters>);

  const handleAddSemester = async (data: { year: number; semester: 'S1' | 'S2' }) => {
    await addSemester(data);
    setShowAddForm(false);
  };

  const handleDeleteSemester = (id: string) => {
    confirm('Supprimer ce semestre et toutes les évaluations associées ?', async () => {
      await deleteSemester(id);
      close();
    });
  };

  const handleViewSemester = (semester: typeof semesters[0]) => {
    setViewingSemester(semester);
    setCurrentView('semester-team');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent Review"
        action={
          <Button
            variant="primary"
            icon={<Plus size={20} />}
            onClick={() => setShowAddForm(true)}
          >
            Nouveau Semestre
          </Button>
        }
      />

      {/* Add Form */}
      {showAddForm && (
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
              {sems.map((sem) => (
                <SemesterCard
                  key={sem.id}
                  semester={sem}
                  evaluationCount={evaluations.filter((e) => e.semesterId === sem.id).length}
                  onClick={() => handleViewSemester(sem)}
                  onDelete={() => handleDeleteSemester(sem.id)}
                />
              ))}
            </div>
          </div>
        ))}

      {/* Empty State */}
      {semesters.length === 0 && !showAddForm && (
        <EmptyState icon={Calendar} message="Aucun semestre créé." />
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
