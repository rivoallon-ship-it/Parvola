import React from 'react';
import { Users, Briefcase, CheckCircle2, Clock, Circle, History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee, ProfessionalInterview } from '@/types';
import { Card, EmptyState, CampaignStatusBadge } from '@/components/common';
import { BackButton } from '@/components/layout';
import { useNavigation, useProfessionalInterviews, useEmployees, useOrganization, useUser } from '@/hooks';
import { getEmployeesInScope } from '@/utils/permissions';
import { colors } from '@/constants/colors';
import { formatDate } from '@/utils/helpers';

const InterviewStatusIcon: React.FC<{ status: ProfessionalInterview['status'] }> = ({ status }) => {
  if (status === 'completed') return <CheckCircle2 size={18} className="text-green-500" />;
  if (status === 'in_progress') return <Clock size={18} className="text-blue-500" />;
  return <Circle size={18} className="text-gray-300" />;
};

export const ProfessionalTeamView: React.FC = () => {
  const { t } = useTranslation();
  const {
    viewingProfessionalCampaign,
    setCurrentView,
    setViewingProfessionalCampaign,
    setViewingProfessionalInterview,
    setSelectedEmployee,
  } = useNavigation();
  const { professionalInterviews, addProfessionalInterview } = useProfessionalInterviews();
  const { employees: allEmployees } = useEmployees();
  const { teams } = useOrganization();
  const { currentUser } = useUser();

  if (!viewingProfessionalCampaign) return null;

  const campaign = viewingProfessionalCampaign;
  const employees = getEmployeesInScope(currentUser, allEmployees, teams);
  const campaignInterviews = professionalInterviews.filter((i) => i.campaignId === campaign.id);

  const getInterview = (employeeId: string) =>
    campaignInterviews.find((i) => i.employeeId === employeeId);

  const completedCount = campaignInterviews.filter((i) => i.status === 'completed').length;

  const handleBack = () => {
    setCurrentView('professional-campaigns');
    setViewingProfessionalCampaign(null);
  };

  const handleOpenInterview = async (employee: Employee) => {
    if (campaign.status === 'draft') return;
    setSelectedEmployee(employee);
    let interview = getInterview(employee.id);
    if (!interview) {
      interview = await addProfessionalInterview(campaign.id, employee.id);
    }
    setViewingProfessionalInterview(interview);
    setCurrentView('professional-interview');
  };

  const handleOpenHistory = (employee: Employee) => {
    setSelectedEmployee(employee);
    setCurrentView('professional-history');
  };

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} label={t('professionalCampaign.backToCampaigns')} />

      <Card>
        <div className="flex items-center gap-4">
          <Briefcase style={{ color: colors.accent }} size={40} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold" style={{ color: colors.btn.primary }}>
                {campaign.name}
              </h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            {campaign.scheduledFrom && (
              <p className="text-gray-500 text-sm">
                {formatDate(campaign.scheduledFrom)}
                {campaign.scheduledTo && ` → ${formatDate(campaign.scheduledTo)}`}
              </p>
            )}
            {campaign.closingDeadline && (
              <p className="text-sm text-gray-500 mt-1">
                {t('campaign.deadlineLabel')} {formatDate(campaign.closingDeadline)}
              </p>
            )}
          </div>
          {employees.length > 0 && (
            <div className="text-right">
              <h3 className="text-xl font-bold" style={{ color: colors.accent }}>
                {completedCount}/{employees.length}
              </h3>
              <p className="text-sm text-gray-500">{t('professionalCampaign.completedInterviews')}</p>
            </div>
          )}
        </div>
      </Card>

      {employees.length === 0 ? (
        <EmptyState icon={Users} message={t('semesterTeam.noEmployees')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {employees.map((emp) => {
            const interview = getInterview(emp.id);
            const isDraft = campaign.status === 'draft';
            return (
              <Card
                key={emp.id}
                hover={!isDraft}
                onClick={isDraft ? undefined : () => handleOpenInterview(emp)}
                className={`group ${isDraft ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{emp.photo}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate group-hover:opacity-80" style={{ color: colors.btn.primary }}>
                        {emp.name}
                      </h3>
                      {interview && <InterviewStatusIcon status={interview.status} />}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{emp.position}</p>
                    {interview?.scheduledAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t('professionalInterview.scheduledAt')} {formatDate(interview.scheduledAt)}
                      </p>
                    )}
                    {!interview && !isDraft && (
                      <p className="text-xs text-gray-400 mt-1">{t('professionalInterview.notStarted')}</p>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenHistory(emp); }}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-teal-700 hover:text-teal-900"
                    >
                      <History size={14} />
                      {t('professionalHistory.open')}
                    </button>
                  </div>
                  {interview && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={
                        interview.status === 'completed'
                          ? { backgroundColor: '#d1fae5', color: '#065f46' }
                          : interview.status === 'in_progress'
                          ? { backgroundColor: '#dbeafe', color: '#1e40af' }
                          : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                      }
                    >
                      {t(`professionalInterview.status.${interview.status}`)}
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfessionalTeamView;
