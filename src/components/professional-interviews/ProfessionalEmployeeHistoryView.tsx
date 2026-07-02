import React from 'react';
import { Briefcase, CalendarClock, CalendarCheck, ChevronRight, History, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfessionalInterview } from '@/types';
import { Card, EmptyState, CampaignStatusBadge } from '@/components/common';
import { BackButton } from '@/components/layout';
import { useNavigation, useProfessionalInterviews, useUser } from '@/hooks';
import { colors } from '@/constants/colors';
import {
  formatDate,
  isProfessionalInterviewSigned,
  getNextProfessionalInterviewDueDate,
  getNextProfessionalStateOfPlayDueDate,
} from '@/utils/helpers';

// ============================================
// Historique EPP d'un salarié (écran dédié, hors domaine évaluation)
// ============================================
// Chronologie des entretiens professionnels d'un salarié + échéances
// théoriques du cadre légal : prochain entretien (4 ans, ancré sur le
// dernier entretien mené ou l'embauche) et état des lieux récapitulatif
// (8 ans, ancré sur l'embauche).

const DueDateLine: React.FC<{
  icon: React.ReactNode;
  label: string;
  date: string | null;
  missingLabel: string;
}> = ({ icon, label, date, missingLabel }) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const overdue = !!date && date < today;

  return (
    <div className="flex items-center gap-3">
      <span className="text-gray-400">{icon}</span>
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      {date ? (
        <span className={`text-sm font-semibold ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
          {formatDate(date)}
          {overdue && (
            <span className="inline-flex items-center gap-1 ml-2 text-xs font-medium text-red-600">
              <AlertTriangle size={14} />
              {t('professionalHistory.overdue')}
            </span>
          )}
        </span>
      ) : (
        <span className="text-sm text-gray-400">{missingLabel}</span>
      )}
    </div>
  );
};

const interviewStatusBadge = (interview: ProfessionalInterview, label: string) => {
  const signed = isProfessionalInterviewSigned(interview);
  const style = signed
    ? { backgroundColor: '#d1fae5', color: '#065f46' }
    : interview.status === 'completed'
    ? { backgroundColor: '#d1fae5', color: '#065f46' }
    : interview.status === 'in_progress'
    ? { backgroundColor: '#dbeafe', color: '#1e40af' }
    : { backgroundColor: '#f3f4f6', color: '#6b7280' };
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={style}>
      {label}
    </span>
  );
};

export const ProfessionalEmployeeHistoryView: React.FC = () => {
  const { t } = useTranslation();
  const {
    selectedEmployee,
    viewingProfessionalCampaign,
    setCurrentView,
    setViewingProfessionalCampaign,
    setViewingProfessionalInterview,
  } = useNavigation();
  const { professionalCampaigns, professionalInterviews } = useProfessionalInterviews();
  const { currentUser } = useUser();

  if (!selectedEmployee || currentUser.role === 'employee') return null;

  const employee = selectedEmployee;

  const history = professionalInterviews
    .filter((i) => i.employeeId === employee.id)
    .map((interview) => ({
      interview,
      campaign: professionalCampaigns.find((c) => c.id === interview.campaignId),
    }))
    .sort((a, b) => {
      const dateA = a.interview.conductedAt || `${a.campaign?.year ?? 0}`;
      const dateB = b.interview.conductedAt || `${b.campaign?.year ?? 0}`;
      return dateB.localeCompare(dateA);
    });

  // Échéance 4 ans ancrée sur le dernier entretien réellement mené.
  const lastConductedAt = history
    .map(({ interview }) => interview.conductedAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop();

  const nextInterviewDue = getNextProfessionalInterviewDueDate(lastConductedAt, employee.hireDate);
  const stateOfPlayDue = getNextProfessionalStateOfPlayDueDate(employee.hireDate);

  const handleBack = () => {
    setCurrentView(viewingProfessionalCampaign ? 'professional-team' : 'professional-campaigns');
  };

  const handleOpen = (interview: ProfessionalInterview) => {
    const campaign = professionalCampaigns.find((c) => c.id === interview.campaignId);
    if (!campaign) return;
    setViewingProfessionalCampaign(campaign);
    setViewingProfessionalInterview(interview);
    setCurrentView('professional-interview');
  };

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} label={t('professionalCampaign.backToCampaigns')} />

      {/* En-tête salarié */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{employee.photo}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <History style={{ color: colors.accent }} size={22} />
              <h1 className="text-2xl font-bold" style={{ color: colors.btn.primary }}>
                {t('professionalHistory.title')}
              </h1>
            </div>
            <p className="text-gray-700 font-medium">{employee.name}</p>
            <p className="text-sm text-gray-500">{employee.position}</p>
            <p className="text-sm text-gray-500 mt-1">
              {t('professionalHistory.hireDate')} :{' '}
              {employee.hireDate ? formatDate(employee.hireDate) : t('professionalHistory.hireDateMissing')}
            </p>
          </div>
        </div>
      </Card>

      {/* Échéances théoriques (cadre 4 ans / 8 ans) */}
      <Card>
        <h2 className="text-base font-semibold mb-4" style={{ color: colors.btn.primary }}>
          {t('professionalHistory.deadlines')}
        </h2>
        <div className="space-y-3">
          <DueDateLine
            icon={<CalendarCheck size={18} />}
            label={t('professionalHistory.lastInterview')}
            date={lastConductedAt || null}
            missingLabel={t('professionalHistory.noInterviewYet')}
          />
          <DueDateLine
            icon={<CalendarClock size={18} />}
            label={t('professionalHistory.nextDue')}
            date={nextInterviewDue}
            missingLabel={t('professionalHistory.hireDateMissing')}
          />
          <DueDateLine
            icon={<CalendarClock size={18} />}
            label={t('professionalHistory.stateOfPlayDue')}
            date={stateOfPlayDue}
            missingLabel={t('professionalHistory.hireDateMissing')}
          />
        </div>
      </Card>

      {/* Chronologie */}
      {history.length === 0 ? (
        <EmptyState icon={Briefcase} message={t('professionalHistory.none')} />
      ) : (
        <div className="space-y-3">
          {history.map(({ interview, campaign }) => {
            const signed = isProfessionalInterviewSigned(interview);
            const statusLabel = signed
              ? t('professionalInterview.status.signed')
              : t(`professionalInterview.status.${interview.status}`);
            return (
              <Card key={interview.id}>
                <button
                  onClick={() => handleOpen(interview)}
                  className="w-full flex items-center justify-between gap-4 group text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800 group-hover:opacity-80 truncate">
                        {campaign?.name || t('professionalHistory.unknownCampaign')}
                      </h3>
                      {campaign && <CampaignStatusBadge status={campaign.status} size="sm" />}
                      {interviewStatusBadge(interview, statusLabel)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                      <span>
                        {interview.conductedAt
                          ? `${t('professionalReport.heldOn')} ${formatDate(interview.conductedAt)}`
                          : t('professionalHistory.noDate')}
                      </span>
                      {signed && interview.managerSignedAt && (
                        <span>
                          {t('professionalInterview.signedOn')} {formatDate(interview.managerSignedAt)}
                        </span>
                      )}
                      {interview.deliveredAt && (
                        <span>
                          {t('professionalReport.deliveredOn')} {formatDate(interview.deliveredAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight style={{ color: colors.accent }} size={18} />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfessionalEmployeeHistoryView;
