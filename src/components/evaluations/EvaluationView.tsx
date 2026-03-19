import React, { useState, useEffect } from 'react';
import {
  Plus,
  Target,
  Copy,
  Printer,
  FileText,
  ChevronDown,
  GripVertical,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
  BookOpen,
  Sparkles,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AISuggestedObjective, ObjectiveTemplate, NineBoxRating } from '@/types';
import { Card, Button, Modal, EmptyState, ConfirmDialog, Select, TextArea, EvaluationStatusBadge, DictationButton } from '@/components/common';
import { BackButton } from '@/components/layout';
import { ObjectiveCard } from './ObjectiveCard';
import { AIAssistant } from './AIAssistant';
import { InterviewGuideModal } from './InterviewGuideModal';
import { AIReviewModal } from './AIReviewModal';
import { useNavigation, useEmployees, useSemesters, useTemplates, useConfirmDialog, useUser, useToast } from '@/hooks';
import { printExport } from '@/services/excel';
import { fetchCompany } from '@/services/supabase-data';
import type { Company } from '@/types';
import { colors } from '@/constants/colors';
import { isEvaluationReadOnly } from '@/utils/helpers';
import { canSubmitEvaluation, canValidateEvaluation, canViewNineBoxRatings, canViewBilanManager, canViewInterviewGuide } from '@/utils/permissions';
import { NINE_BOX_CONFIG } from '@/constants/config';

// ============================================
// Composant EvaluationView (Vue principale d'évaluation)
// ============================================

export const EvaluationView: React.FC = () => {
  const { t } = useTranslation();
  const { selectedEmployee, selectedSemester, viewingSemester, setCurrentView, setSelectedEmployee, setSelectedSemester } = useNavigation();
  const { employees } = useEmployees();
  const { semesters, evaluations, addObjective, addObjectiveWithData, addObjectiveFromTemplate, updateObjective, deleteObjective, reorderObjectives, duplicateObjectives, updateEvaluationBilan, updateEvaluationRatings, submitEvaluation, validateEvaluation } = useSemesters();
  const { templates, positions } = useTemplates();
  const { currentUser } = useUser();
  const toast = useToast();
  const userRole = currentUser.role;

  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (currentUser.companyId) {
      fetchCompany(currentUser.companyId).then(setCompany);
    }
  }, [currentUser.companyId]);

  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showInterviewGuide, setShowInterviewGuide] = useState(false);
  const [showAIReview, setShowAIReview] = useState(false);
  const [aiReviewBlocking, setAIReviewBlocking] = useState(false);
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

  // Campaign & evaluation status
  const campaignStatus = selectedSemester?.status || 'draft';
  const evalStatus = currentEval?.validationStatus || 'not_started';
  const isEmployee = userRole === 'employee';
  const readOnly = isEmployee || isEvaluationReadOnly(campaignStatus, evalStatus);
  const showSubmit = canSubmitEvaluation(userRole, campaignStatus, evalStatus);
  const showValidate = canValidateEvaluation(userRole, campaignStatus, evalStatus);
  const showNineBox = canViewNineBoxRatings(userRole);
  const showBilan = canViewBilanManager(userRole);

  // Filter: exclude draft semesters from the selector
  const selectableSemesters = semesters.filter((s) => s.status !== 'draft');

  // Get templates for employee's position
  const employeePosition = positions.find((p) => p.name === selectedEmployee.position);
  const availableTemplates = employeePosition
    ? templates.filter((t) => t.positionId === employeePosition.id)
    : [];

  const handleBack = () => {
    if (isEmployee) {
      setCurrentView('my-evaluations');
    } else if (viewingSemester) {
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
    setAIReviewBlocking(false);
  };

  const handleSubmit = () => {
    if (!selectedEmployee || !selectedSemester) return;
    confirm(t('evaluation.submitConfirm'), async () => {
      await submitEvaluation(selectedEmployee.id, selectedSemester.id);
      close();
      toast.success(t('toast.evaluationSubmitted'));
    });
  };

  const handleValidate = () => {
    if (!selectedEmployee || !selectedSemester) return;
    confirm(t('evaluation.validateConfirm'), async () => {
      await validateEvaluation(selectedEmployee.id, selectedSemester.id);
      close();
      toast.success(t('toast.evaluationValidated'));
    });
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

  const handleApplyCorrection = (fieldId: string, original: string, suggested: string) => {
    if (!selectedEmployee || !selectedSemester || !currentEval) return;

    if (fieldId === 'bilanManager' || fieldId === 'bilanEmployee') {
      const currentValue = currentEval[fieldId] || '';
      const newValue = currentValue.replace(original, suggested);
      handleBilanChange(fieldId, newValue);
    } else if (fieldId.startsWith('objective-')) {
      const parts = fieldId.split('-');
      const fieldName = parts[parts.length - 1];
      const objId = parts.slice(1, -1).join('-');
      const obj = currentEval.objectives.find(o => o.id === objId);
      if (obj && (fieldName === 'title' || fieldName === 'description' || fieldName === 'evaluation' || fieldName === 'comments')) {
        const currentValue = obj[fieldName] || '';
        const newValue = currentValue.replace(original, suggested);
        updateObjective(currentEval.id, objId, fieldName, newValue);
      }
    }
  };

  const handleReviewComplete = (unresolvedCriticalCount: number) => {
    setAIReviewBlocking(unresolvedCriticalCount > 0);
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

    await addObjectiveWithData(selectedEmployee.id, selectedSemester.id, {
      title: suggestion.title,
      description: suggestion.description,
      deadline: suggestion.deadline || '',
    });
    setShowAIAssistant(false);
  };

  const handleDeleteObjective = (objId: string) => {
    if (!currentEval) return;
    confirm(t('evaluation.deleteObjectiveConfirm'), async () => {
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
      toast.warning(t('toast.selectProfileAndSemester'));
      return;
    }

    await duplicateObjectives(duplicateConfig);
    setShowDuplicateModal(false);
    toast.success(t('toast.objectivesDuplicated'));
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
        label={viewingSemester ? t('evaluation.backToSemester') : t('evaluation.backToTeam')}
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
          <div className="flex flex-col gap-2 items-end">
            <Select
              value={selectedSemester?.id || ''}
              onChange={(e) => handleSemesterChange(e.target.value)}
              options={[
                { value: '', label: t('evaluation.selectSemester') },
                ...selectableSemesters.map((s) => ({ value: s.id, label: s.name })),
              ]}
            />
            {selectedSemester && (
              <div className="flex items-center gap-2">
                <EvaluationStatusBadge status={evalStatus} />
                {showSubmit && (
                  <>
                    <Button variant="secondary" size="sm" onClick={() => setShowAIReview(true)}>
                      <Shield size={14} className="mr-1" />
                      {t('aiReview.button')}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSubmit}
                      disabled={aiReviewBlocking}
                      title={aiReviewBlocking ? t('aiReview.submitBlocked') : undefined}
                    >
                      <Send size={14} className="mr-1" />
                      {t('evaluation.submit')}
                    </Button>
                  </>
                )}
                {showValidate && (
                  <Button variant="primary" size="sm" onClick={handleValidate}>
                    <CheckCircle size={14} className="mr-1" />
                    {t('evaluation.validate')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Employee Info Panel - Attendance & Compensation */}
      {(selectedEmployee.salary !== undefined ||
        selectedEmployee.lateCount !== undefined ||
        selectedEmployee.unjustifiedAbsences !== undefined ||
        selectedEmployee.justifiedAbsences !== undefined) && (
        <Card>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            {t('employeeInfo.attendanceTitle')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {selectedEmployee.salary !== undefined && (
              <div className="text-center p-3 rounded-lg bg-emerald-50">
                <p className="text-xs text-gray-500 mb-1">{t('employeeInfo.salary')}</p>
                <p className="text-lg font-bold text-emerald-700">
                  {selectedEmployee.salary.toLocaleString('fr-FR')} EUR
                </p>
              </div>
            )}
            {selectedEmployee.lateCount !== undefined && (
              <div className="text-center p-3 rounded-lg bg-amber-50">
                <p className="text-xs text-gray-500 mb-1">{t('employeeInfo.lateCount')}</p>
                <p className="text-lg font-bold text-amber-700">
                  {selectedEmployee.lateCount}
                </p>
              </div>
            )}
            {selectedEmployee.unjustifiedAbsences !== undefined && (
              <div className="text-center p-3 rounded-lg bg-red-50">
                <p className="text-xs text-gray-500 mb-1">{t('employeeInfo.unjustifiedAbsences')}</p>
                <p className="text-lg font-bold text-red-700">
                  {selectedEmployee.unjustifiedAbsences}
                </p>
              </div>
            )}
            {selectedEmployee.justifiedAbsences !== undefined && (
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <p className="text-xs text-gray-500 mb-1">{t('employeeInfo.justifiedAbsences')}</p>
                <p className="text-lg font-bold text-blue-700">
                  {selectedEmployee.justifiedAbsences}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Status Banners */}
      {selectedSemester && evalStatus === 'submitted' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-amber-50 border-amber-200">
          <AlertTriangle size={18} className="text-amber-700" />
          <span className="text-sm font-medium text-amber-700">{t('evaluation.submittedBanner')}</span>
        </div>
      )}
      {selectedSemester && evalStatus === 'validated' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-emerald-50 border-emerald-200">
          <CheckCircle size={18} className="text-emerald-700" />
          <span className="text-sm font-medium text-emerald-700">{t('evaluation.validatedBanner')}</span>
        </div>
      )}
      {selectedSemester && campaignStatus === 'closed' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-gray-100 border-gray-300">
          <AlertTriangle size={18} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-700">{t('campaign.closedBanner')}</span>
        </div>
      )}
      {isEmployee && selectedSemester && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-blue-50 border-blue-200">
          <Info size={18} className="text-blue-700" />
          <span className="text-sm font-medium text-blue-700">{t('employee.readOnlyNotice')}</span>
        </div>
      )}
      {aiReviewBlocking && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-red-50 border-red-200">
          <ShieldAlert size={18} className="text-red-700" />
          <span className="text-sm font-medium text-red-700">{t('aiReview.criticalAlertBanner')}</span>
          <Button variant="danger" size="sm" onClick={() => setShowAIReview(true)} className="ml-auto">
            {t('aiReview.reviewAlerts')}
          </Button>
        </div>
      )}

      {!selectedSemester ? (
        <EmptyState icon={Target} message={t('evaluation.selectSemesterHint')} />
      ) : (
        <>
          {/* AI Interview Guide CTA */}
          {canViewInterviewGuide(userRole) && (
            <button
              onClick={() => setShowInterviewGuide(true)}
              className="w-full group relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-5 text-left transition-all hover:shadow-lg hover:border-purple-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-3 shadow-md">
                  <Sparkles size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{t('interviewGuide.ctaTitle')}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{t('interviewGuide.ctaDescription')}</p>
                </div>
                <div className="flex-shrink-0 self-center">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm group-hover:shadow-md transition-shadow">
                    <BookOpen size={14} />
                    {t('interviewGuide.ctaButton')}
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 items-center justify-end">
            {objectives.length > 0 && (
              <>
                {!readOnly && (
                  <Button
                    variant="secondary"
                    icon={<Copy size={18} />}
                    onClick={() => setShowDuplicateModal(true)}
                  >
                    {t('common.duplicate')}
                  </Button>
                )}
                <Button variant="secondary" icon={<Printer size={18} />} onClick={handleExport}>
                  {t('common.print')}
                </Button>
              </>
            )}

            {!readOnly && (
              <div className="relative add-objective-menu">
                <Button
                  variant="primary"
                  icon={<Plus size={20} />}
                  onClick={() => setShowAddMenu(!showAddMenu)}
                >
                  {t('evaluation.addObjective')}
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
                          {t('evaluation.blankObjective')}
                        </div>
                        <div className="text-xs text-gray-500">{t('evaluation.createFromScratch')}</div>
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
                          {t('evaluation.fromTemplate')}
                        </div>
                        <div className="text-xs text-gray-500">{t('evaluation.useTemplate')}</div>
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
                          {t('evaluation.aiAssistant')}
                        </div>
                        <div className="text-xs text-gray-500">{t('evaluation.generateWithAI')}</div>
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
              companyContext={company?.aiPrompts?.objectivesContext}
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
                        {!readOnly && (
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
                  {showBilan && (
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
                  )}
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
                  readOnly={readOnly}
                />
              ))}

              {/* 9-Box Rating Block (hidden for employee) */}
              {showNineBox && (
                <Card
                  style={{ borderLeftWidth: '4px', borderLeftColor: colors.accent }}
                >
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.btn.primary }}
                  >
                    {t('evaluation.nineBoxTitle')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label={t('evaluation.performance')}
                      value={currentEval?.performanceRating?.toString() || ''}
                      onChange={(e) => handleRatingChange('performanceRating', e.target.value)}
                      placeholder={t('common.select')}
                      options={NINE_BOX_CONFIG.performanceLabelKeys.map((labelKey, i) => ({
                        value: String(i + 1),
                        label: t(labelKey),
                      }))}
                      disabled={readOnly}
                    />
                    <Select
                      label={t('evaluation.potential')}
                      value={currentEval?.potentialRating?.toString() || ''}
                      onChange={(e) => handleRatingChange('potentialRating', e.target.value)}
                      placeholder={t('common.select')}
                      options={NINE_BOX_CONFIG.potentialLabelKeys.map((labelKey, i) => ({
                        value: String(i + 1),
                        label: t(labelKey),
                      }))}
                      disabled={readOnly}
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
                          {t(cell.labelKey)}
                        </span>
                        <span className="text-xs text-gray-500">
                          — {t('evaluation.performance')} : {t(NINE_BOX_CONFIG.performanceLabelKeys[currentEval.performanceRating - 1])}
                          , {t('evaluation.potential')} : {t(NINE_BOX_CONFIG.potentialLabelKeys[currentEval.potentialRating - 1])}
                        </span>
                      </div>
                    );
                  })()}
                </Card>
              )}

              {/* Bilan Block */}
              {showBilan && (
                <Card
                  id="bilan-block"
                  style={{ borderLeftWidth: '4px', borderLeftColor: colors.btn.primary }}
                >
                  <h3
                    className="text-xl font-bold mb-4"
                    style={{ color: colors.btn.primary }}
                  >
                    {t('evaluation.bilan')}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-sm font-medium text-gray-700">{t('evaluation.managerComment')}</label>
                        {!readOnly && (
                          <DictationButton
                            onResult={(text) => handleBilanChange('bilanManager', text)}
                            disabled={readOnly}
                            existingText={currentEval?.bilanManager || ''}
                          />
                        )}
                      </div>
                      <TextArea
                        value={currentEval?.bilanManager || ''}
                        onChange={(e) => handleBilanChange('bilanManager', e.target.value)}
                        placeholder={t('evaluation.managerPlaceholder')}
                        disabled={readOnly}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="block text-sm font-medium text-gray-700">{t('evaluation.employeeComment')}</label>
                        {!readOnly && (
                          <DictationButton
                            onResult={(text) => handleBilanChange('bilanEmployee', text)}
                            disabled={readOnly}
                            existingText={currentEval?.bilanEmployee || ''}
                          />
                        )}
                      </div>
                      <TextArea
                        value={currentEval?.bilanEmployee || ''}
                        onChange={(e) => handleBilanChange('bilanEmployee', e.target.value)}
                        placeholder={t('evaluation.employeePlaceholder')}
                        disabled={readOnly}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Empty State */}
          {objectives.length === 0 && !showAIAssistant && (
            <EmptyState icon={Target} message={t('evaluation.noObjectives')} />
          )}
        </>
      )}

      {/* Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title={t('evaluation.chooseTemplate')}
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
                  {t('ai.deadlineLabel')} {tmpl.suggestedDeadlineDays} jours
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            message={t('evaluation.noTemplateForPosition')}
          />
        )}
      </Modal>

      {/* Duplicate Modal */}
      <Modal
        isOpen={showDuplicateModal}
        onClose={() => setShowDuplicateModal(false)}
        title={t('evaluation.duplicateObjectives')}
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label={t('evaluation.targetEmployee')}
            value={duplicateConfig.targetEmployeeId}
            onChange={(e) =>
              setDuplicateConfig({ ...duplicateConfig, targetEmployeeId: e.target.value })
            }
            options={[
              { value: '', label: t('evaluation.selectEmployee') },
              ...employees.map((e) => ({ value: e.id, label: e.name })),
            ]}
          />

          <Select
            label={t('evaluation.targetSemester')}
            value={duplicateConfig.targetSemesterId}
            onChange={(e) =>
              setDuplicateConfig({ ...duplicateConfig, targetSemesterId: e.target.value })
            }
            options={[
              { value: '', label: t('evaluation.selectSemester') },
              ...selectableSemesters.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('evaluation.objectivesToDuplicate')}
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
                  <span>{obj.title || t('common.noTitle')}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowDuplicateModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleDuplicateObjectives}>
              {t('common.duplicate')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Interview Guide Modal */}
      <InterviewGuideModal
        isOpen={showInterviewGuide}
        onClose={() => setShowInterviewGuide(false)}
        employee={selectedEmployee}
        semester={selectedSemester}
        evaluation={currentEval || null}
      />

      {/* AI Review Modal */}
      {currentEval && (
        <AIReviewModal
          isOpen={showAIReview}
          onClose={() => setShowAIReview(false)}
          employee={selectedEmployee}
          semester={selectedSemester}
          evaluation={currentEval}
          onApplyCorrection={handleApplyCorrection}
          onReviewComplete={handleReviewComplete}
        />
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

export default EvaluationView;
