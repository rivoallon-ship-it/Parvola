import React from 'react';
import { Briefcase, ChevronRight, CalendarClock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, EmptyState, CampaignStatusBadge } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { useNavigation, useProfessionalInterviews, useEmployees, useUser } from '@/hooks';
import { colors } from '@/constants/colors';
import { formatDate, getNextProfessionalInterviewDueDate } from '@/utils/helpers';

export const MyProfessionalInterviewsView: React.FC = () => {
  const { t } = useTranslation();
  const { setCurrentView, setViewingProfessionalCampaign, setViewingProfessionalInterview, setSelectedEmployee } = useNavigation();
  const { currentUser } = useUser();
  const { professionalCampaigns, professionalInterviews } = useProfessionalInterviews();
  const { employees } = useEmployees();

  const employee = employees.find((e) => e.id === currentUser.employeeId);

  const myInterviews = professionalInterviews
    .filter((i) => i.employeeId === currentUser.employeeId)
    .map((i) => {
      const campaign = professionalCampaigns.find((c) => c.id === i.campaignId);
      return { interview: i, campaign };
    })
    .filter((item) => item.campaign && item.campaign.status !== 'draft')
    .sort((a, b) => (b.campaign?.year ?? 0) - (a.campaign?.year ?? 0));

  const handleOpen = (campaignId: string, interviewId: string) => {
    const campaign = professionalCampaigns.find((c) => c.id === campaignId);
    const interview = professionalInterviews.find((i) => i.id === interviewId);
    if (!campaign || !interview || !employee) return;
    setViewingProfessionalCampaign(campaign);
    setViewingProfessionalInterview(interview);
    setSelectedEmployee(employee);
    setCurrentView('professional-interview');
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('professionalInterview.myTitle')} />

      {employee && (
        <Card>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{employee.photo}</span>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">{employee.name}</h2>
              <p className="text-gray-500">{employee.position}</p>
            </div>
            {(() => {
              // Prochaine échéance théorique (périodicité 4 ans, ou 1re année
              // après l'embauche si aucun entretien mené).
              const lastConductedAt = myInterviews
                .map(({ interview }) => interview.conductedAt)
                .filter((d): d is string => !!d)
                .sort()
                .pop();
              const nextDue = getNextProfessionalInterviewDueDate(lastConductedAt, employee.hireDate);
              if (!nextDue) return null;
              return (
                <div className="text-right">
                  <p className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <CalendarClock size={14} />
                    {t('professionalHistory.nextDue')}
                  </p>
                  <p className="text-sm font-semibold text-gray-800">{formatDate(nextDue)}</p>
                </div>
              );
            })()}
          </div>
        </Card>
      )}

      {myInterviews.length === 0 ? (
        <EmptyState icon={Briefcase} message={t('professionalInterview.myEmpty')} />
      ) : (
        <div className="space-y-3">
          {myInterviews.map(({ interview, campaign }) => {
            if (!campaign) return null;
            return (
              <Card key={interview.id}>
                <button
                  onClick={() => handleOpen(campaign.id, interview.id)}
                  className="w-full flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-800 group-hover:text-teal-700 transition">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CampaignStatusBadge status={campaign.status} />
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
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-teal-600 transition" style={{ color: colors.accent }} />
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyProfessionalInterviewsView;
