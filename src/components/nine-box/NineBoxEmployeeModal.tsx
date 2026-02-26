import React from 'react';
import type { Employee, Evaluation } from '@/types';
import { Modal, ProgressBar, StatusBadge, Button } from '@/components/common';
import { NINE_BOX_CONFIG } from '@/constants/config';
import { colors } from '@/constants/colors';
import { useApp } from '@/hooks';

interface NineBoxEmployeeModalProps {
  employee: Employee | null;
  evaluation: Evaluation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NineBoxEmployeeModal: React.FC<NineBoxEmployeeModalProps> = ({
  employee,
  evaluation,
  isOpen,
  onClose,
}) => {
  const {
    establishments,
    teams,
    setSelectedEmployee,
    setSelectedSemester,
    setCurrentView,
    semesters,
  } = useApp();

  if (!employee) return null;

  const establishment = establishments.find((e) => e.id === employee.establishmentId);
  const team = teams.find((t) => t.id === employee.teamId);

  const objectives = evaluation?.objectives || [];
  const avgProgress =
    objectives.length > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)
      : 0;

  const perfLabel = evaluation?.performanceRating
    ? NINE_BOX_CONFIG.performanceLabels[evaluation.performanceRating - 1]
    : '—';
  const potLabel = evaluation?.potentialRating
    ? NINE_BOX_CONFIG.potentialLabels[evaluation.potentialRating - 1]
    : '—';

  const cellKey = evaluation?.performanceRating && evaluation?.potentialRating
    ? (`${evaluation.performanceRating}-${evaluation.potentialRating}` as keyof typeof NINE_BOX_CONFIG.cells)
    : null;
  const cellConfig = cellKey ? NINE_BOX_CONFIG.cells[cellKey] : null;

  const handleViewEvaluation = () => {
    const semester = semesters.find((s) => s.id === evaluation?.semesterId);
    if (semester) {
      setSelectedEmployee(employee);
      setSelectedSemester(semester);
      setCurrentView('evaluation');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={employee.name} size="lg">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center gap-4">
          <span className="text-4xl">{employee.photo}</span>
          <div>
            <h3 className="text-lg font-bold" style={{ color: colors.btn.primary }}>
              {employee.name}
            </h3>
            <p className="text-sm text-gray-500">{employee.position}</p>
            {(establishment || team) && (
              <p className="text-xs text-gray-400">
                {establishment?.name}
                {team ? ` · ${team.name}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* 9-Box Position */}
        {cellConfig && (
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ backgroundColor: cellConfig.bg, border: `1px solid ${cellConfig.border}` }}
          >
            <span
              className="text-sm font-semibold"
              style={{ color: cellConfig.textColor }}
            >
              {cellConfig.label}
            </span>
            <span className="text-xs text-gray-500">
              Performance : {perfLabel} · Potentiel : {potLabel}
            </span>
          </div>
        )}

        {/* Progress */}
        {objectives.length > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2" style={{ color: colors.btn.primary }}>
              <span className="font-medium">Progression globale</span>
              <span>{avgProgress}%</span>
            </div>
            <ProgressBar value={avgProgress} size="sm" />
          </div>
        )}

        {/* Objectives summary */}
        {objectives.length > 0 ? (
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: colors.btn.primary }}>
              Objectifs ({objectives.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: colors.body.bg }}
                >
                  <span className="text-sm truncate mr-3" style={{ color: colors.btn.primary }}>
                    {obj.title || 'Sans titre'}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500">{obj.progress}%</span>
                    <StatusBadge status={obj.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Aucun objectif défini pour ce semestre.</p>
        )}

        {/* Action */}
        {evaluation && (
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleViewEvaluation}>
              Voir l'évaluation complète
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default NineBoxEmployeeModal;
