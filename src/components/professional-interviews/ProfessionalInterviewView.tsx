import React, { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfessionalInterview, MobilityWish } from '@/types';
import { Card, Button, TextArea, CampaignStatusBadge, SignaturePad } from '@/components/common';
import { BackButton } from '@/components/layout';
import { useNavigation, useProfessionalInterviews, useUser, useToast } from '@/hooks';
import { colors } from '@/constants/colors';

const MOBILITY_OPTIONS: MobilityWish[] = ['none', 'internal', 'external', 'geographic'];

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-base font-semibold mb-3 pb-2 border-b border-gray-100" style={{ color: colors.btn.primary }}>
    {children}
  </h3>
);

export const ProfessionalInterviewView: React.FC = () => {
  const { t } = useTranslation();
  const {
    viewingProfessionalCampaign,
    viewingProfessionalInterview,
    selectedEmployee,
    setCurrentView,
    setViewingProfessionalInterview,
  } = useNavigation();
  const { professionalInterviews, updateProfessionalInterview, signProfessionalInterview } = useProfessionalInterviews();
  const { currentUser } = useUser();
  const toast = useToast();

  const [form, setForm] = useState<Partial<ProfessionalInterview>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Derive from live list so signature updates re-render immediately.
  const interview = professionalInterviews.find((i) => i.id === viewingProfessionalInterview?.id) ?? viewingProfessionalInterview;
  const campaign = viewingProfessionalCampaign;
  const isReadOnly = campaign?.status === 'closed';
  const isEmployee = currentUser.role === 'employee';

  useEffect(() => {
    if (interview) {
      setForm({
        careerReview: interview.careerReview,
        skillsAcquired: interview.skillsAcquired,
        evolutionMobility: interview.evolutionMobility,
        evolutionNotes: interview.evolutionNotes,
        trainingWishes: interview.trainingWishes,
        conclusions: interview.conclusions,
        employeeComment: interview.employeeComment,
        managerComment: interview.managerComment,
        scheduledAt: interview.scheduledAt,
      });
      setDirty(false);
    }
  }, [interview?.id]);

  if (!interview || !campaign || !selectedEmployee) return null;

  const handleChange = (field: keyof ProfessionalInterview, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const status: ProfessionalInterview['status'] =
        interview.status === 'scheduled' ? 'in_progress' : interview.status;
      await updateProfessionalInterview(interview.id, { ...form, status });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateProfessionalInterview(interview.id, { ...form, status: 'completed' });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async (by: 'employee' | 'manager', signature: string, name: string) => {
    await signProfessionalInterview(interview.id, by, signature, name);
    toast.success(t('toast.interviewSigned'));
  };

  const handleBack = () => {
    setViewingProfessionalInterview(null);
    setCurrentView('professional-team');
  };

  const canSign = interview.status === 'completed';
  const employeeSigned = !!interview.employeeSignedAt;
  const managerSigned = !!interview.managerSignedAt;

  return (
    <div className="space-y-6">
      <BackButton onClick={handleBack} label={t('professionalInterview.backToTeam')} />

      {/* Header */}
      <Card>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{selectedEmployee.photo}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold" style={{ color: colors.btn.primary }}>
                {selectedEmployee.name}
              </h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-gray-500">{selectedEmployee.position}</p>
            <p className="text-sm text-gray-400 mt-1">{campaign.name}</p>
          </div>
          <span
            className="text-sm font-medium px-3 py-1 rounded-full"
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

        {!isEmployee && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t('professionalInterview.scheduledAt')}
            </label>
            <input
              type="date"
              className="text-sm border border-gray-200 rounded px-2 py-1"
              value={form.scheduledAt?.split('T')[0] || ''}
              onChange={(e) => handleChange('scheduledAt', e.target.value)}
              disabled={isReadOnly}
            />
          </div>
        )}
      </Card>

      {isReadOnly && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-gray-100 border-gray-300 text-gray-700">
          <span className="text-sm font-medium">{t('campaign.closedBanner')}</span>
        </div>
      )}

      {/* Section 1 : Bilan du parcours */}
      <Card>
        <SectionTitle>{t('professionalInterview.section.careerReview')}</SectionTitle>
        <div className="space-y-4">
          <TextArea
            label={t('professionalInterview.careerReview')}
            value={form.careerReview || ''}
            onChange={(e) => handleChange('careerReview', e.target.value)}
            rows={4}
            disabled={isReadOnly || isEmployee}
            placeholder={t('professionalInterview.careerReviewPlaceholder')}
          />
          <TextArea
            label={t('professionalInterview.skillsAcquired')}
            value={form.skillsAcquired || ''}
            onChange={(e) => handleChange('skillsAcquired', e.target.value)}
            rows={3}
            disabled={isReadOnly || isEmployee}
            placeholder={t('professionalInterview.skillsAcquiredPlaceholder')}
          />
        </div>
      </Card>

      {/* Section 2 : Évolution & Mobilité */}
      <Card>
        <SectionTitle>{t('professionalInterview.section.evolution')}</SectionTitle>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              {t('professionalInterview.evolutionMobility')}
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={form.evolutionMobility || 'none'}
              onChange={(e) => handleChange('evolutionMobility', e.target.value)}
              disabled={isReadOnly || isEmployee}
            >
              {MOBILITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{t(`professionalInterview.mobility.${opt}`)}</option>
              ))}
            </select>
          </div>
          <TextArea
            label={t('professionalInterview.evolutionNotes')}
            value={form.evolutionNotes || ''}
            onChange={(e) => handleChange('evolutionNotes', e.target.value)}
            rows={3}
            disabled={isReadOnly || isEmployee}
            placeholder={t('professionalInterview.evolutionNotesPlaceholder')}
          />
        </div>
      </Card>

      {/* Section 3 : Formation */}
      <Card>
        <SectionTitle>{t('professionalInterview.section.training')}</SectionTitle>
        <TextArea
          label={t('professionalInterview.trainingWishes')}
          value={form.trainingWishes || ''}
          onChange={(e) => handleChange('trainingWishes', e.target.value)}
          rows={3}
          disabled={isReadOnly || isEmployee}
          placeholder={t('professionalInterview.trainingWishesPlaceholder')}
        />
      </Card>

      {/* Section 4 : Conclusions */}
      <Card>
        <SectionTitle>{t('professionalInterview.section.conclusions')}</SectionTitle>
        <TextArea
          label={t('professionalInterview.conclusions')}
          value={form.conclusions || ''}
          onChange={(e) => handleChange('conclusions', e.target.value)}
          rows={4}
          disabled={isReadOnly || isEmployee}
          placeholder={t('professionalInterview.conclusionsPlaceholder')}
        />
      </Card>

      {/* Section 5 : Commentaires */}
      <Card>
        <SectionTitle>{t('professionalInterview.section.comments')}</SectionTitle>
        <div className="space-y-4">
          {!isEmployee && (
            <TextArea
              label={t('professionalInterview.managerComment')}
              value={form.managerComment || ''}
              onChange={(e) => handleChange('managerComment', e.target.value)}
              rows={3}
              disabled={isReadOnly}
              placeholder={t('professionalInterview.managerCommentPlaceholder')}
            />
          )}
          <TextArea
            label={t('professionalInterview.employeeComment')}
            value={form.employeeComment || ''}
            onChange={(e) => handleChange('employeeComment', e.target.value)}
            rows={3}
            disabled={isReadOnly || !isEmployee}
            placeholder={t('professionalInterview.employeeCommentPlaceholder')}
          />
        </div>
      </Card>

      {/* Section 6 : Signatures */}
      <Card>
        <SectionTitle>{t('professionalInterview.section.signatures')}</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-2">{t('professionalInterview.managerSignature')}</p>
            {managerSigned ? (
              <SignaturePad
                value={interview.managerSignature}
                name={interview.managerSignatureName}
                signedAt={interview.managerSignedAt}
              />
            ) : canSign && !isEmployee && !isReadOnly ? (
              <SignaturePad onSign={(sig, name) => handleSign('manager', sig, name)} />
            ) : (
              <p className="text-xs text-gray-400">{t('professionalInterview.notSigned')}</p>
            )}
          </div>

          <div className="p-4 rounded-lg border border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-2">{t('professionalInterview.employeeSignature')}</p>
            {employeeSigned ? (
              <SignaturePad
                value={interview.employeeSignature}
                name={interview.employeeSignatureName}
                signedAt={interview.employeeSignedAt}
              />
            ) : canSign && isEmployee && !isReadOnly ? (
              <SignaturePad onSign={(sig, name) => handleSign('employee', sig, name)} />
            ) : (
              <p className="text-xs text-gray-400">{t('professionalInterview.notSigned')}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      {!isReadOnly && !isEmployee && (
        <div className="flex gap-3 pb-8">
          {dirty && (
            <Button variant="secondary" onClick={handleSave} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          )}
          {interview.status !== 'completed' && (
            <Button variant="primary" onClick={handleComplete} disabled={saving}>
              <CheckCircle2 size={16} className="mr-1" />
              {t('professionalInterview.complete')}
            </Button>
          )}
        </div>
      )}
      {!isReadOnly && isEmployee && (
        <div className="flex gap-3 pb-8">
          {dirty && (
            <Button variant="secondary" onClick={handleSave} disabled={saving}>
              {saving ? t('common.loading') : t('common.save')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalInterviewView;
