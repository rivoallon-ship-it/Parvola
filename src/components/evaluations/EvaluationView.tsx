import React, { useState } from 'react';
import {
  Plus,
  Target,
  Copy,
  Printer,
  FileText,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import type { Evaluation, AISuggestedObjective, ObjectiveTemplate, EvaluationStatus, NineBoxRating } from '@/types';
import { Card, Button, Modal, EmptyState, ConfirmDialog, Select, TextArea } from '@/components/common';
import { BackButton } from '@/components/layout';
import { ObjectiveCard } from './ObjectiveCard';
import { AIAssistant } from './AIAssistant';
import { useApp, useConfirmDialog } from '@/hooks';
import { printExport } from '@/services/excel';
import { colors } from '@/constants/colors';
import { generateId } from '@/utils/helpers';
import { storage } from '@/services/storage';
import { OBJECTIVE_CONFIG, NINE_BOX_CONFIG } from '@/constants/config';

// ============================================
// Composant EvaluationView (Vue principale d'évaluation)
// ============================================

export const EvaluationView: React.FC = () => {
  const {
    selectedEmployee,
    selectedSemester,
    viewingSemester,
    semesters,
    employees,
    evaluations,
    templates,
    positions,
    addObjective,
    addObjectiveFromTemplate,
    updateObjective,
    deleteObjective,
    reorderObjectives,
    updateEvaluationStatus,
    updateEvaluationBilan,
    updateEvaluationRatings,
    setCurrentView,
    setSelectedEmployee,
    setSelectedSemester,
  } = useApp();

  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [navDragOverIndex, setNavDragOverIndex] = useState<number | null>(null);
  const [duplicateConfig, setDuplicateConfig] = useState({
    targetEmployeeId: '',
    targetSemesterId: '',
    selectedObjectives: [] as string[],
  });

  const { dialog, confirm, close } = useConfirmDialog();

  if (!selectedEmployee) return null;

  // Get current evaluation
  const currentEval = evaluations.find(
    (e) => e.employeeId === selectedEmployee.id && e.semesterId === selectedSemester?.id
  );
  const objectives = currentEval?.objectives || [];
  const isValidated = currentEval?.validationStatus === 'validated';

  // Get templates for employee's position
  const employeePosition = positions.find((p) => p.name === selectedEmployee.position);
  const availableTemplates = employeePosition
    ? templates.filter((t) => t.positionId === employeePosition.id)
    : [];

  const handleBack = () => {
    if (viewingSemester) {
      setCurrentView('semester-team');
    } else {
      setCurrentView('team');
    }
    setSelectedEmployee(null);
    setSelectedSemester(null);
  };

  const handleSemesterChange = (semesterId: string) => {
    const semester = semesters.find((s) => s.id === semesterId);
    setSelectedSemester(semester || null);
  };

  const handleValidationStatusChange = async (status: EvaluationStatus) => {
    if (!selectedEmployee || !selectedSemester) return;
    await updateEvaluationStatus(selectedEmployee.id, selectedSemester.id, status);
  };

  const handleRatingChange = async (field: 'performanceRating' | 'potentialRating', value: string) => {
    if (!selectedEmployee || !selectedSemester) return;
    const numValue = parseInt(value, 10) as NineBoxRating;
    if (!numValue) return;
    const perf = field === 'performanceRating' ? numValue : (currentEval?.performanceRating || numValue);
    const pot = field === 'potentialRating' ? numValue : (currentEval?.potentialRating || numValue);
    await updateEvaluationRatings(selectedEmployee.id, selectedSemester.id, perf, pot);
  };

  const handleBilanChange = async (field: 'bilanManager' | 'bilanEmployee', value: string) => {
    if (!selectedEmployee || !selectedSemester) return;
    await updateEvaluationBilan(selectedEmployee.id, selectedSemester.id, field, value);
  };

  const handleAddObjective = async () => {
    if (!selectedEmployee || !selectedSemester) return;
    await addObjective(selectedEmployee.id, selectedSemester.id);
    setShowAddMenu(false);
  };

  const handleAddFromTemplate = async (template: ObjectiveTemplate) => {
    if (!selectedEmployee || !selectedSemester) return;
    await addObjectiveFromTemplate(template.id);
    setShowTemplateModal(false);
  };

  const handleAcceptAISuggestion = async (suggestion: AISuggestedObjective) => {
    if (!selectedEmployee || !selectedSemester) return;

    const objective = {
      id: generateId(),
      title: suggestion.title,
      description: suggestion.description,
      status: OBJECTIVE_CONFIG.defaultStatus,
      progress: OBJECTIVE_CONFIG.defaultProgress,
      deadline: suggestion.deadline || '',
      comments: '',
      evaluation: '',
    };

    const existing = evaluations.find(
      (e) => e.employeeId === selectedEmployee.id && e.semesterId === selectedSemester.id
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = evaluations.map((e) =>
        e.id === existing.id ? { ...e, objectives: [...e.objectives, objective] } : e
      );
    } else {
      newEvaluations = [
        ...evaluations,
        {
          id: generateId(),
          employeeId: selectedEmployee.id,
          semesterId: selectedSemester.id,
          objectives: [objective],
        },
      ];
    }

    await storage.setEvaluations(newEvaluations);
    setShowAIAssistant(false);
  };

  const handleDeleteObjective = (objId: string) => {
    if (!currentEval) return;
    confirm('Supprimer cet objectif ?', async () => {
      await deleteObjective(currentEval.id, objId);
      close();
    });
  };

  const handleDuplicateObjectives = async () => {
    if (
      !duplicateConfig.targetEmployeeId ||
      !duplicateConfig.targetSemesterId ||
      duplicateConfig.selectedObjectives.length === 0
    ) {
      alert('Sélectionnez un profil, un semestre et au moins un objectif');
      return;
    }

    const selectedObjs = objectives
      .filter((o) => duplicateConfig.selectedObjectives.includes(o.id))
      .map((o) => ({
        ...o,
        id: generateId(),
        progress: 0,
        status: OBJECTIVE_CONFIG.defaultStatus,
        comments: '',
      }));

    const existing = evaluations.find(
      (e) =>
        e.employeeId === duplicateConfig.targetEmployeeId &&
        e.semesterId === duplicateConfig.targetSemesterId
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = evaluations.map((e) =>
        e.id === existing.id ? { ...e, objectives: [...e.objectives, ...selectedObjs] } : e
      );
    } else {
      newEvaluations = [
        ...evaluations,
        {
          id: generateId(),
          employeeId: duplicateConfig.targetEmployeeId,
          semesterId: duplicateConfig.targetSemesterId,
          objectives: selectedObjs,
        },
      ];
    }

    await storage.setEvaluations(newEvaluations);
    setShowDuplicateModal(false);
    alert('Objectifs dupliqués !');
  };

  const handleExport = () => {
    if (!selectedEmployee || !selectedSemester) return;
    printExport({
      employee: selectedEmployee,
      semester: selectedSemester,
      objectives,
      bilanManager: currentEval?.bilanManager,
      bilanEmployee: currentEval?.bilanEmployee,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = async (targetIndex: number) => {
    if (draggedIndex === null || !currentEval) return;
    await reorderObjectives(currentEval.id, draggedIndex, targetIndex);
    setDraggedIndex(null);
    setNavDragOverIndex(null);
  };

  return (
    <div className="space-y-6">
      <BackButton
        onClick={handleBack}
        label={viewingSemester ? 'Retour au semestre' : 'Retour à l\'équipe'}
      />

      {/* Employee Header */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="text-6xl">{selectedEmployee.photo}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold" style={{ color: colors.btn.primary }}>
              {selectedEmployee.name}
            </h1>
            <p className="text-gray-500 text-lg">{selectedEmployee.position}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Select
              value={selectedSemester?.id || ''}
              onChange={(e) => handleSemesterChange(e.target.value)}
              options={[
                { value: '', label: 'Sélectionner un semestre' },
                ...semesters.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            {selectedSemester && (
              <Select
                value={currentEval?.validationStatus || 'in_progress'}
                onChange={(e) => handleValidationStatusChange(e.target.value as EvaluationStatus)}
                options={[
                  { value: 'in_progress', label: 'En cours' },
                  { value: 'validated', label: 'Validé' },
                ]}
              />
            )}
          </div>
        </div>
      </Card>

      {!selectedSemester ? (
        <EmptyState icon={Target} message="Sélectionnez un semestre pour voir les objectifs." />
      ) : (
        <>
          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-end">
            {objectives.length > 0 && (
              <>
                {!isValidated && (
                  <Button
                    variant="secondary"
                    icon={<Copy size={18} />}
                    onClick={() => setShowDuplicateModal(true)}
                  >
                    Dupliquer
                  </Button>
                )}
                <Button variant="secondary" icon={<Printer size={18} />} onClick={handleExport}>
                  Imprimer
                </Button>
              </>
            )}

            {!isValidated && (
              <div className="relative add-objective-menu">
                <Button
                  variant="primary"
                  icon={<Plus size={20} />}
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  Ajouter un objectif
                  <ChevronDown size={16} className="ml-1" />
                </Button>

                {showAddMenu && (
                  <div
                    className="absolute top-full right-0 mt-2 w-64 rounded-lg shadow-lg z-10"
                    style={{ backgroundColor: colors.card.bg, border: `1px solid ${colors.card.border}` }}
                  >
                    <button
                      onClick={handleAddObjective}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b"
                      style={{ borderColor: colors.card.border }}
                    >
                      <Plus size={18} style={{ color: colors.accent }} />
                      <div>
                        <div className="font-medium" style={{ color: colors.btn.primary }}>
                          Objectif vierge
                        </div>
                        <div className="text-xs text-gray-500">Créer de zéro</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowTemplateModal(true);
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b"
                      style={{ borderColor: colors.card.border }}
                    >
                      <FileText size={18} className="text-blue-600" />
                      <div>
                        <div className="font-medium" style={{ color: colors.btn.primary }}>
                          Depuis un template
                        </div>
                        <div className="text-xs text-gray-500">Utiliser un modèle</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowAIAssistant(true);
                        setShowAddMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left rounded-b-lg"
                    >
                      <Target size={18} className="text-purple-600" />
                      <div>
                        <div className="font-medium" style={{ color: colors.btn.primary }}>
                          Assistant IA
                        </div>
                        <div className="text-xs text-gray-500">Générer avec l'IA</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Assistant */}
          {showAIAssistant && (
            <AIAssistant
              employee={selectedEmployee}
              semester={selectedSemester}
              onAcceptObjective={handleAcceptAISuggestion}
              onClose={() => setShowAIAssistant(false)}
            />
          )}

          {/* Objectives List with mini navbar */}
          <div className="flex gap-4">
            {/* Mini navbar */}
            {objectives.length > 0 && (
              <div className="sticky top-4 self-start">
                <div
                  className="rounded-xl p-2"
                  style={{ backgroundColor: colors.card.bg, border: `1px solid ${colors.card.border}` }}
                  onDragLeave={() => setNavDragOverIndex(null)}
                >
                  {objectives.map((obj, index) => (
                    <div key={obj.id} className={index > 0 ? 'mt-2' : ''}>
                      {/* Drop indicator line - before item */}
                      <div
                        className="relative"
                        style={{ height: navDragOverIndex === index && draggedIndex !== index && draggedIndex !== index - 1 ? 2 : 0, transition: 'height 0.15s ease' }}
                      >
                        {navDragOverIndex === index && draggedIndex !== index && draggedIndex !== index - 1 && (
                          <div
                            className="absolute left-1 right-1 top-0 rounded-full"
                            style={{ height: 2, backgroundColor: colors.accent }}
                          />
                        )}
                      </div>
                      <div
                        className="flex items-center gap-1"
                        onDragOver={(e) => {
                          e.preventDefault();
                          setNavDragOverIndex(index);
                        }}
                        onDrop={() => handleDrop(index)}
                      >
                        <button
                          onClick={() => {
                            document.getElementById(`objective-${index}`)?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'center',
                            });
                          }}
                          className="w-8 h-8 rounded-lg text-sm font-bold transition hover:opacity-80"
                          style={{
                            backgroundColor: `${colors.accent}20`,
                            color: colors.accent,
                          }}
                        >
                          {index + 1}
                        </button>
                        {!isValidated && (
                          <div
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnd={() => setNavDragOverIndex(null)}
                            className="cursor-move text-gray-400 hover:text-gray-600 p-0.5"
                          >
                            <GripVertical size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {/* Drop indicator line - after last item */}
                  <div
                    className="relative"
                    style={{ height: navDragOverIndex === objectives.length && draggedIndex !== objectives.length - 1 ? 2 : 0, transition: 'height 0.15s ease' }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setNavDragOverIndex(objectives.length);
                    }}
                    onDrop={() => handleDrop(objectives.length - 1)}
                  >
                    {navDragOverIndex === objectives.length && draggedIndex !== objectives.length - 1 && (
                      <div
                        className="absolute left-1 right-1 top-0 rounded-full"
                        style={{ height: 2, backgroundColor: colors.accent }}
                      />
                    )}
                  </div>
                  {/* Bilan button - no grip, cannot be reordered */}
                  <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${colors.card.border}` }}>
                    <button
                      onClick={() => {
                        document.getElementById('bilan-block')?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                      }}
                      className="w-8 h-8 rounded-lg text-sm font-bold transition hover:opacity-80"
                      style={{
                        backgroundColor: `${colors.btn.primary}20`,
                        color: colors.btn.primary,
                      }}
                    >
                      B
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Objectives */}
            <div className="flex-1 space-y-4">
              {objectives.map((obj, index) => (
                <ObjectiveCard
                  key={obj.id}
                  objective={obj}
                  index={index}
                  evalId={currentEval?.id || ''}
                  onUpdate={(field, value) =>
                    currentEval && updateObjective(currentEval.id, obj.id, field, value)
                  }
                  onDelete={() => handleDeleteObjective(obj.id)}
                  readOnly={isValidated}
                />
              ))}

              {/* 9-Box Rating Block */}
              <Card
                style={{ borderLeftWidth: '4px', borderLeftColor: colors.accent }}
              >
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.btn.primary }}
                >
                  Évaluation 9-Box
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Performance"
                    value={currentEval?.performanceRating?.toString() || ''}
                    onChange={(e) => handleRatingChange('performanceRating', e.target.value)}
                    placeholder="Sélectionner"
                    options={NINE_BOX_CONFIG.performanceLabels.map((label, i) => ({
                      value: String(i + 1),
                      label,
                    }))}
                    disabled={isValidated}
                  />
                  <Select
                    label="Potentiel"
                    value={currentEval?.potentialRating?.toString() || ''}
                    onChange={(e) => handleRatingChange('potentialRating', e.target.value)}
                    placeholder="Sélectionner"
                    options={NINE_BOX_CONFIG.potentialLabels.map((label, i) => ({
                      value: String(i + 1),
                      label,
                    }))}
                    disabled={isValidated}
                  />
                </div>
                {currentEval?.performanceRating && currentEval?.potentialRating && (() => {
                  const key = `${currentEval.performanceRating}-${currentEval.potentialRating}` as keyof typeof NINE_BOX_CONFIG.cells;
                  const cell = NINE_BOX_CONFIG.cells[key];
                  return (
                    <div
                      className="mt-4 px-4 py-3 rounded-xl flex items-center gap-2"
                      style={{ backgroundColor: cell.bg, border: `1px solid ${cell.border}` }}
                    >
                      <span className="text-sm font-semibold" style={{ color: cell.textColor }}>
                        {cell.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        — Performance : {NINE_BOX_CONFIG.performanceLabels[currentEval.performanceRating - 1]}
                        , Potentiel : {NINE_BOX_CONFIG.potentialLabels[currentEval.potentialRating - 1]}
                      </span>
                    </div>
                  );
                })()}
              </Card>

              {/* Bilan Block */}
              <Card
                id="bilan-block"
                style={{ borderLeftWidth: '4px', borderLeftColor: colors.btn.primary }}
              >
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.btn.primary }}
                >
                  Bilan
                </h3>
                <div className="space-y-4">
                  <TextArea
                    label="Commentaire Manager"
                    value={currentEval?.bilanManager || ''}
                    onChange={(e) => handleBilanChange('bilanManager', e.target.value)}
                    placeholder="Bilan du manager..."
                    disabled={isValidated}
                  />
                  <TextArea
                    label="Commentaire Employé"
                    value={currentEval?.bilanEmployee || ''}
                    onChange={(e) => handleBilanChange('bilanEmployee', e.target.value)}
                    placeholder="Bilan de l'employé..."
                    disabled={isValidated}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Empty State */}
          {objectives.length === 0 && !showAIAssistant && (
            <EmptyState icon={Target} message="Aucun objectif défini pour ce semestre." />
          )}
        </>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Choisir un template"
        size="lg"
      >
        {availableTemplates.length > 0 ? (
          <div className="space-y-3">
            {availableTemplates.map((tmpl) => (
              <Card
                key={tmpl.id}
                hover
                onClick={() => handleAddFromTemplate(tmpl)}
                padding="sm"
              >
                <h4 className="font-semibold" style={{ color: colors.btn.primary }}>
                  {tmpl.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{tmpl.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  📅 Échéance: {tmpl.suggestedDeadlineDays} jours
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            message="Aucun template disponible pour ce poste."
          />
        )}
      </Modal>

      {/* Duplicate Modal */}
      <Modal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title="Dupliquer les objectifs"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Employé cible"
            value={duplicateConfig.targetEmployeeId}
            onChange={(e) =>
              setDuplicateConfig({ ...duplicateConfig, targetEmployeeId: e.target.value })
            }
            options={[
              { value: '', label: 'Sélectionner un employé' },
              ...employees.map((e) => ({ value: e.id, label: e.name })),
            ]}
          />

          <Select
            label="Semestre cible"
            value={duplicateConfig.targetSemesterId}
            onChange={(e) =>
              setDuplicateConfig({ ...duplicateConfig, targetSemesterId: e.target.value })
            }
            options={[
              { value: '', label: 'Sélectionner un semestre' },
              ...semesters.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectifs à dupliquer
            </label>
            <div className="space-y-2 max-h-60 overflow-auto">
              {objectives.map((obj) => (
                <label key={obj.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={duplicateConfig.selectedObjectives.includes(obj.id)}
                    onChange={() => {
                      const selected = duplicateConfig.selectedObjectives.includes(obj.id)
                        ? duplicateConfig.selectedObjectives.filter((id) => id !== obj.id)
                        : [...duplicateConfig.selectedObjectives, obj.id];
                      setDuplicateConfig({ ...duplicateConfig, selectedObjectives: selected });
                    }}
                    className="rounded"
                  />
                  <span>{obj.title || 'Sans titre'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDuplicateModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" onClick={handleDuplicateObjectives}>
              Dupliquer
            </Button>
          </div>
        </div>
      </Modal>

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

export default EvaluationView;
