import React, { useState } from 'react';
import { AlertTriangle, Bell, ChevronRight, Download, Filter, Mail, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee, EvaluationStatus } from '@/types';
import { Card, Button, EmptyState, EvaluationStatusBadge, CampaignStatusBadge } from '@/components/common';
import { CampaignProgressSummary } from './CampaignProgressSummary';
import { BackButton } from '@/components/layout';
import { useNavigation, useEmployees, useSemesters, useOrganization, useUser, useToast } from '@/hooks';
import { getEmployeesInScope } from '@/utils/permissions';
import { getEvaluationStatusLabel, formatDate } from '@/utils/helpers';
import { printCampaignSummary, type CampaignSummaryRow } from '@/services/excel';
import { colors } from '@/constants/colors';

// ============================================
// Suivi RH d'une campagne (retardataires, relances, export) — Lot C
// ============================================
// Écran de pilotage RH d'une campagne d'évaluation : liste des salariés en
// retard (évaluation non validée), relance manuelle par e-mail (mailto) avec
// traçabilité, et export d'une synthèse d'avancement. Domaine Talent Review
// uniquement — aucune interaction avec les EPP.

const PENDING_STATUSES: EvaluationStatus[] = ['not_started', 'in_progress', 'submitted'];

export const CampaignFollowUpView: React.FC = () => {
  const { t } = useTranslation();
  const { viewingSemester, setCurrentView, setSelectedEmployee, setSelectedSemester } = useNavigation();
  const { employees: allEmployees } = useEmployees();
  const { evaluations, remindEvaluation } = useSemesters();
  const { establishments, teams } = useOrganization();
  const { currentUser } = useUser();
  const toast = useToast();

  const [onlyLate, setOnlyLate] = useState(true);
  const [reminding, setReminding] = useState<string | null>(null);

  if (!viewingSemester) return null;
  const semester = viewingSemester;

  const employees = getEmployeesInScope(currentUser, allEmployees, teams);

  const deadlinePassed = !!semester.closingDeadline && semester.closingDeadline < new Date().toISOString().split('T')[0];

  const getEval = (employeeId: string) =>
    evaluations.find((e) => e.employeeId === employeeId && e.semesterId === semester.id);

  const rowFor = (emp: Employee) => {
    const evaluation = getEval(emp.id);
    const status = (evaluation?.validationStatus || 'not_started') as EvaluationStatus;
    const objectives = evaluation?.objectives || [];
    const active = objectives.filter((o) => o.status === 'in_progress' || o.status === 'completed');
    const avgProgress = active.length > 0
      ? Math.round(active.reduce((sum, o) => sum + o.progress, 0) / active.length)
      : 0;
    return {
      employee: emp,
      evaluation,
      status,
      objectiveCount: objectives.length,
      avgProgress,
      establishmentName: establishments.find((e) => e.id === emp.establishmentId)?.name || '—',
      teamName: teams.find((tm) => tm.id === emp.teamId)?.name || '—',
      isLate: PENDING_STATUSES.includes(status),
    };
  };

  const allRows = employees.map(rowFor).sort((a, b) => {
    // Retardataires d'abord, puis par statut croissant vers validé
    const order: Record<EvaluationStatus, number> = { not_started: 0, in_progress: 1, submitted: 2, validated: 3 };
    return order[a.status] - order[b.status] || a.employee.name.localeCompare(b.employee.name);
  });

  const counts: Record<EvaluationStatus, number> = { not_started: 0, in_progress: 0, submitted: 0, validated: 0 };
  allRows.forEach((r) => { counts[r.status]++; });

  const lateCount = allRows.filter((r) => r.isLate).length;
  const visibleRows = onlyLate ? allRows.filter((r) => r.isLate) : allRows;

  const handleBack = () => setCurrentView('semester-team');

  const handleOpen = (emp: Employee) => {
    setSelectedEmployee(emp);
    setSelectedSemester(semester);
    setCurrentView('evaluation');
  };

  const handleRemind = async (emp: Employee, evaluationId?: string) => {
    if (!emp.email) {
      toast.error(t('campaignFollowUp.noEmail'));
      return;
    }
    setReminding(emp.id);
    try {
      // 1. Ouvre le client mail avec un message pré-rempli (aucune infra serveur).
      const subject = t('campaignFollowUp.mailSubject', { campaign: semester.name });
      const body = t('campaignFollowUp.mailBody', { name: emp.name, campaign: semester.name });
      window.open(`mailto:${encodeURIComponent(emp.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      // 2. Trace la relance si une évaluation existe (sinon rien à horodater).
      if (evaluationId) {
        await remindEvaluation(evaluationId);
      }
      toast.success(t('campaignFollowUp.reminderSent'));
    } catch {
      toast.error(t('toast.genericError'));
    } finally {
      setReminding(null);
    }
  };

  const handleExport = () => {
    const rows: CampaignSummaryRow[] = allRows.map((r) => ({
      employeeName: r.employee.name,
      position: r.employee.position,
      establishmentName: r.establishmentName,
      teamName: r.teamName,
      status: r.status,
      statusLabel: getEvaluationStatusLabel(r.status),
      objectiveCount: r.objectiveCount,
      avgProgress: r.avgProgress,
      lastReminderAt: r.evaluation?.lastReminderAt,
    }));
    printCampaignSummary({ semester, rows, counts, generatedAt: new Date().toISOString() });
  };

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} label={t('campaignFollowUp.backToTeam')} />

      {/* En-tête */}
      <Card>
        <div className="flex items-center gap-4">
          <Bell style={{ color: colors.accent }} size={36} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold" style={{ color: colors.btn.primary }}>
                {t('campaignFollowUp.title')}
              </h1>
              <CampaignStatusBadge status={semester.status} />
            </div>
            <p className="text-gray-500">{semester.name}</p>
            {semester.closingDeadline && (
              <p className={`text-sm mt-1 ${deadlinePassed ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                {t('campaign.deadlineLabel')} {formatDate(semester.closingDeadline)}
                {deadlinePassed && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <AlertTriangle size={14} /> {t('campaignFollowUp.deadlinePassed')}
                  </span>
                )}
              </p>
            )}
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download size={16} className="mr-1" />
            {t('campaignFollowUp.export')}
          </Button>
        </div>

        {employees.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <CampaignProgressSummary evaluations={evaluations.filter((e) => e.semesterId === semester.id)} totalEmployees={employees.length} />
          </div>
        )}
      </Card>

      {/* Filtre retardataires */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {onlyLate ? t('campaignFollowUp.lateList') : t('campaignFollowUp.allList')}
          <span className="ml-2 text-sm font-normal text-gray-500">
            {onlyLate ? `${lateCount}` : `${allRows.length}`}
          </span>
        </h2>
        <button
          onClick={() => setOnlyLate((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900"
        >
          <Filter size={15} />
          {onlyLate ? t('campaignFollowUp.showAll') : t('campaignFollowUp.showLateOnly')}
        </button>
      </div>

      {visibleRows.length === 0 ? (
        <EmptyState icon={Users} message={onlyLate ? t('campaignFollowUp.noLate') : t('semesterTeam.noEmployees')} />
      ) : (
        <div className="space-y-2">
          {visibleRows.map((r) => (
            <Card key={r.employee.id}>
              <div className="flex items-center gap-4">
                <span className="text-3xl">{r.employee.photo}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{r.employee.name}</h3>
                    <EvaluationStatusBadge status={r.status} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {r.employee.position} · {r.establishmentName}
                    {r.teamName !== '—' && ` · ${r.teamName}`}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-gray-500">
                    <span>{r.objectiveCount} {t('semesterTeam.objectives')}{r.objectiveCount > 0 ? ` · ${r.avgProgress}%` : ''}</span>
                    {r.evaluation?.lastReminderAt && (
                      <span>{t('campaignFollowUp.lastReminder')} {formatDate(r.evaluation.lastReminderAt)}</span>
                    )}
                  </div>
                </div>
                {r.isLate && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemind(r.employee, r.evaluation?.id)}
                    disabled={reminding === r.employee.id || !r.employee.email}
                    title={!r.employee.email ? t('campaignFollowUp.noEmail') : undefined}
                  >
                    <Mail size={14} className="mr-1" />
                    {t('campaignFollowUp.remind')}
                  </Button>
                )}
                <button onClick={() => handleOpen(r.employee)} className="text-gray-400 hover:text-teal-600">
                  <ChevronRight size={18} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignFollowUpView;
