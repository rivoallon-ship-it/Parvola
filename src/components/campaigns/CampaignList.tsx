import React, { useState } from 'react';
import { Plus, Calendar, Briefcase, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ConfirmDialog } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { SemesterCard } from '@/components/semesters/SemesterCard';
import { SemesterForm } from '@/components/semesters/SemesterForm';
import { ProfessionalCampaignCard } from '@/components/professional-interviews/ProfessionalCampaignCard';
import { ProfessionalCampaignForm } from '@/components/professional-interviews/ProfessionalCampaignForm';
import { useNavigation, useSemesters, useProfessionalInterviews, useEmployees, useUser, useConfirmDialog, useToast, useOrganization } from '@/hooks';
import { canCreateCampaign, canDeleteCampaign, canPublishCampaign, canCloseCampaign, getEmployeesInScope } from '@/utils/permissions';
import { colors } from '@/constants/colors';

type FilterType = 'all' | 'talent-review' | 'professional';
type NewCampaignType = 'talent-review' | 'professional' | null;

export const CampaignList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewingSemester, setViewingProfessionalCampaign, setCurrentView } = useNavigation();
  const { semesters, evaluations, addSemester, deleteSemester, publishCampaign, closeCampaign } = useSemesters();
  const {
    professionalCampaigns,
    professionalInterviews,
    addProfessionalCampaign,
    deleteProfessionalCampaign,
    publishProfessionalCampaign,
    closeProfessionalCampaign,
  } = useProfessionalInterviews();
  const { employees } = useEmployees();
  const { teams } = useOrganization();
  const { currentUser } = useUser();
  const toast = useToast();
  const { dialog, confirm, close } = useConfirmDialog();

  const [filter, setFilter] = useState<FilterType>('all');
  const [choosingType, setChoosingType] = useState(false);
  const [newCampaignType, setNewCampaignType] = useState<NewCampaignType>(null);

  const role = currentUser.role;
  const scopedEmployees = getEmployeesInScope(currentUser, employees, teams);
  const scopedEmployeeIds = new Set(scopedEmployees.map((e) => e.id));

  const visibleSemesters = (role === 'manager' || role === 'directeur')
    ? semesters.filter((s) => s.status !== 'draft')
    : semesters;

  const visibleProCampaigns = (role === 'manager' || role === 'directeur')
    ? professionalCampaigns.filter((c) => c.status !== 'draft')
    : professionalCampaigns;

  const allYears = new Set<number>([
    ...visibleSemesters.map((s) => s.year),
    ...visibleProCampaigns.map((c) => c.year),
  ]);

  // Semester handlers
  const handleAddSemester = async (data: Parameters<typeof addSemester>[0]) => {
    await addSemester(data);
    setNewCampaignType(null);
    toast.success(t('toast.semesterAdded'));
  };

  const handleDeleteSemester = (id: string) => {
    confirm(t('semester.deleteConfirm'), async () => {
      await deleteSemester(id);
      close();
      toast.success(t('toast.semesterDeleted'));
    });
  };

  const handlePublishSemester = (id: string) => {
    confirm(t('campaign.publishConfirm'), async () => {
      await publishCampaign(id);
      close();
      toast.success(t('toast.campaignPublished'));
    });
  };

  const handleCloseSemester = (id: string) => {
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

  // Pro campaign handlers
  const handleAddPro = async (form: Parameters<typeof addProfessionalCampaign>[0]) => {
    try {
      await addProfessionalCampaign(form);
      setNewCampaignType(null);
      toast.success(t('toast.professionalCampaignAdded'));
    } catch {
      toast.error(t('toast.genericError'));
    }
  };

  const handleDeletePro = (id: string) => {
    confirm(t('professionalCampaign.deleteConfirm'), async () => {
      await deleteProfessionalCampaign(id);
      close();
      toast.success(t('toast.professionalCampaignDeleted'));
    });
  };

  const handlePublishPro = (id: string) => {
    confirm(t('campaign.publishConfirm'), async () => {
      await publishProfessionalCampaign(id);
      close();
      toast.success(t('toast.campaignPublished'));
    });
  };

  const handleClosePro = (id: string) => {
    confirm(t('campaign.closeConfirm'), async () => {
      await closeProfessionalCampaign(id);
      close();
      toast.success(t('toast.campaignClosed'));
    });
  };

  const handleViewPro = (campaign: typeof professionalCampaigns[0]) => {
    setViewingProfessionalCampaign(campaign);
    setCurrentView('professional-team');
  };

  const handleNewCampaign = () => setChoosingType(true);

  const selectType = (type: 'talent-review' | 'professional') => {
    setChoosingType(false);
    setNewCampaignType(type);
  };

  const isEmpty = visibleSemesters.length === 0 && visibleProCampaigns.length === 0;
  const showEmpty = isEmpty && !newCampaignType;

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: t('campaigns.filterAll') },
    { key: 'talent-review', label: t('campaigns.filterTalentReview') },
    { key: 'professional', label: t('campaigns.filterProfessional') },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('campaigns.title')}
        action={
          canCreateCampaign(role) ? (
            <Button variant="primary" icon={<Plus size={20} />} onClick={handleNewCampaign}>
              {t('campaigns.new')}
            </Button>
          ) : undefined
        }
      />

      {/* Type chooser modal */}
      {choosingType && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">{t('campaigns.chooseType')}</h2>
              <button onClick={() => setChoosingType(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => selectType('talent-review')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition group"
              >
                <Calendar size={32} className="text-gray-400 group-hover:text-teal-600" />
                <span className="font-medium text-gray-700 group-hover:text-teal-700 text-center text-sm">
                  {t('campaigns.typeTalentReview')}
                </span>
              </button>
              <button
                onClick={() => selectType('professional')}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-teal-500 hover:bg-teal-50 transition group"
              >
                <Briefcase size={32} className="text-gray-400 group-hover:text-teal-600" />
                <span className="font-medium text-gray-700 group-hover:text-teal-700 text-center text-sm">
                  {t('campaigns.typeProfessional')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline form for new campaign */}
      {newCampaignType === 'talent-review' && (
        <SemesterForm onSubmit={handleAddSemester} onCancel={() => setNewCampaignType(null)} />
      )}
      {newCampaignType === 'professional' && (
        <ProfessionalCampaignForm onSubmit={handleAddPro} onCancel={() => setNewCampaignType(null)} />
      )}

      {/* Filter tabs */}
      {!isEmpty && (
        <div className="flex gap-1 border-b border-gray-200">
          {filterTabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-4 py-2 text-sm font-medium transition border-b-2 -mb-px"
              style={{
                borderColor: filter === key ? colors.accent : 'transparent',
                color: filter === key ? colors.accent : '#6b7280',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Campaigns by year */}
      {Array.from(allYears)
        .sort((a, b) => b - a)
        .map((year) => {
          const yearSemesters = filter !== 'professional'
            ? visibleSemesters.filter((s) => s.year === year)
            : [];
          const yearPro = filter !== 'talent-review'
            ? visibleProCampaigns.filter((c) => c.year === year)
            : [];

          if (yearSemesters.length === 0 && yearPro.length === 0) return null;

          return (
            <div key={year} className="space-y-3">
              <h2 className="text-xl font-semibold" style={{ color: colors.btn.primary }}>
                {year}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {yearSemesters.map((sem) => {
                  const semEvals = (role === 'manager' || role === 'directeur')
                    ? evaluations.filter((e) => e.semesterId === sem.id && scopedEmployeeIds.has(e.employeeId))
                    : evaluations.filter((e) => e.semesterId === sem.id);
                  return (
                    <div key={sem.id} className="relative">
                      <span className="absolute top-3 right-10 z-10 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-100 text-violet-700">
                        {t('campaigns.typeTalentReview')}
                      </span>
                      <SemesterCard
                        semester={sem}
                        evaluationCount={semEvals.length}
                        evaluations={semEvals}
                        totalEmployees={scopedEmployees.length}
                        onClick={() => handleViewSemester(sem)}
                        onDelete={canDeleteCampaign(role) ? () => handleDeleteSemester(sem.id) : undefined}
                        onPublish={canPublishCampaign(role) ? () => handlePublishSemester(sem.id) : undefined}
                        onClose={canCloseCampaign(role) ? () => handleCloseSemester(sem.id) : undefined}
                      />
                    </div>
                  );
                })}
                {yearPro.map((campaign) => {
                  const campaignInterviews = professionalInterviews.filter((i) => i.campaignId === campaign.id);
                  return (
                    <div key={campaign.id} className="relative">
                      <span className="absolute top-3 right-10 z-10 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {t('campaigns.typeProfessional')}
                      </span>
                      <ProfessionalCampaignCard
                        campaign={campaign}
                        interviews={campaignInterviews}
                        totalEmployees={scopedEmployees.length}
                        onClick={() => handleViewPro(campaign)}
                        onDelete={canDeleteCampaign(role) ? () => handleDeletePro(campaign.id) : undefined}
                        onPublish={canPublishCampaign(role) ? () => handlePublishPro(campaign.id) : undefined}
                        onClose={canCloseCampaign(role) ? () => handleClosePro(campaign.id) : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

      {showEmpty && <EmptyState icon={Calendar} message={t('campaigns.none')} />}

      <ConfirmDialog
        isOpen={dialog.show}
        message={dialog.message}
        onConfirm={() => dialog.onConfirm?.()}
        onCancel={close}
      />
    </div>
  );
};

export default CampaignList;
