import React, { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, ConfirmDialog } from '@/components/common';
import { PageHeader } from '@/components/layout';
import { ProfessionalCampaignCard } from './ProfessionalCampaignCard';
import { ProfessionalCampaignForm } from './ProfessionalCampaignForm';
import { useNavigation, useProfessionalInterviews, useEmployees, useUser, useConfirmDialog, useToast, useOrganization } from '@/hooks';
import { canCreateCampaign, canDeleteCampaign, canPublishCampaign, canCloseCampaign, getEmployeesInScope } from '@/utils/permissions';

export const ProfessionalCampaignList: React.FC = () => {
  const { t } = useTranslation();
  const { setViewingProfessionalCampaign, setCurrentView } = useNavigation();
  const { professionalCampaigns, professionalInterviews, addProfessionalCampaign, deleteProfessionalCampaign, publishProfessionalCampaign, closeProfessionalCampaign } = useProfessionalInterviews();
  const { employees } = useEmployees();
  const { teams } = useOrganization();
  const { currentUser } = useUser();
  const toast = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const { dialog, confirm, close } = useConfirmDialog();

  const role = currentUser.role;
  const scopedEmployees = getEmployeesInScope(currentUser, employees, teams);

  const visibleCampaigns = (role === 'manager' || role === 'directeur')
    ? professionalCampaigns.filter((c) => c.status !== 'draft')
    : professionalCampaigns;

  const campaignsByYear = visibleCampaigns.reduce((acc, c) => {
    if (!acc[c.year]) acc[c.year] = [];
    acc[c.year].push(c);
    return acc;
  }, {} as Record<number, typeof visibleCampaigns>);

  const handleAdd = async (form: Parameters<typeof addProfessionalCampaign>[0]) => {
    try {
      await addProfessionalCampaign(form);
      setShowAddForm(false);
      toast.success(t('toast.professionalCampaignAdded'));
    } catch {
      toast.error(t('toast.genericError'));
    }
  };

  const handleDelete = (id: string) => {
    confirm(t('professionalCampaign.deleteConfirm'), async () => {
      await deleteProfessionalCampaign(id);
      close();
      toast.success(t('toast.professionalCampaignDeleted'));
    });
  };

  const handlePublish = (id: string) => {
    confirm(t('campaign.publishConfirm'), async () => {
      await publishProfessionalCampaign(id);
      close();
      toast.success(t('toast.campaignPublished'));
    });
  };

  const handleClose = (id: string) => {
    confirm(t('campaign.closeConfirm'), async () => {
      await closeProfessionalCampaign(id);
      close();
      toast.success(t('toast.campaignClosed'));
    });
  };

  const handleView = (campaign: typeof professionalCampaigns[0]) => {
    setViewingProfessionalCampaign(campaign);
    setCurrentView('professional-team');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('professionalCampaign.title')}
        action={
          canCreateCampaign(role) ? (
            <Button variant="primary" icon={<Plus size={20} />} onClick={() => setShowAddForm(true)}>
              {t('professionalCampaign.new')}
            </Button>
          ) : undefined
        }
      />

      {showAddForm && canCreateCampaign(role) && (
        <ProfessionalCampaignForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} />
      )}

      {Object.entries(campaignsByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, campaigns]) => (
          <div key={year} className="space-y-3">
            <h2 className="text-xl font-semibold text-teal-700">{year}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((campaign) => {
                const campaignInterviews = professionalInterviews.filter((i) => i.campaignId === campaign.id);
                return (
                  <ProfessionalCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    interviews={campaignInterviews}
                    totalEmployees={scopedEmployees.length}
                    onClick={() => handleView(campaign)}
                    onDelete={canDeleteCampaign(role) ? () => handleDelete(campaign.id) : undefined}
                    onPublish={canPublishCampaign(role) ? () => handlePublish(campaign.id) : undefined}
                    onClose={canCloseCampaign(role) ? () => handleClose(campaign.id) : undefined}
                  />
                );
              })}
            </div>
          </div>
        ))}

      {visibleCampaigns.length === 0 && !showAddForm && (
        <EmptyState icon={Briefcase} message={t('professionalCampaign.none')} />
      )}

      <ConfirmDialog
        isOpen={dialog.show}
        message={dialog.message}
        onConfirm={() => dialog.onConfirm?.()}
        onCancel={close}
      />
    </div>
  );
};

export default ProfessionalCampaignList;
