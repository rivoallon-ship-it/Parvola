import React, { useState, useEffect } from 'react';
import { CheckCircle2, Info, Lock, Printer, PackageCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ProfessionalInterview, MobilityWish } from '@/types';
import { Card, Button, TextArea, CampaignStatusBadge, SignaturePad } from '@/components/common';
import { BackButton } from '@/components/layout';
import { useNavigation, useProfessionalInterviews, useUser, useToast } from '@/hooks';
import { colors } from '@/constants/colors';
import { PROFESSIONAL_INTERVIEW_CONFIG } from '@/constants/config';
import { isProfessionalInterviewLocked, formatDate } from '@/utils/helpers';
import { printProfessionalInterviewReport } from '@/services/professional-interview-export';

const MOBILITY_OPTIONS: MobilityWish[] = ['none', 'internal', 'external', 'geographic'];

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-base font-semibold mb-3 pb-2 border-b border-gray-100" style={{ color: colors.btn.primary }}>
    {children}
  </h3>
);

const SectionHelp: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-lg bg-teal-50 border border-teal-100 text-sm text-teal-900">
    <Info size={16} className="mt-0.5 flex-shrink-0 text-teal-600" />
    <p>{children}</p>
  </div>
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
  const { professionalInterviews, updateProfessionalInterview, signProfessionalInterview, deliverProfessionalInterview } = useProfessionalInterviews();
  const { currentUser } = useUser();
  const toast = useToast();

  const [form, setForm] = useState<Partial<ProfessionalInterview>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [delivering, setDelivering] = useState(false);

  // Derive from live list so signature updates re-render immediately.
  const interview = professionalInterviews.find((i) => i.id === viewingProfessionalInterview?.id) ?? viewingProfessionalInterview;
  const campaign = viewingProfessionalCampaign;
  const isEmployee = currentUser.role === 'employee';
  // Verrouillage post-signature : une fois doublement signé, l'entretien est
  // en lecture seule même si la campagne est encore active (règle de preuve).
  const locked = interview ? isProfessionalInterviewLocked(interview) : false;
  const isReadOnly = campaign?.status === 'closed' || locked;

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

  const saveErrorToast = (err: unknown) => {
    toast.error(
      err instanceof Error && err.message === 'professionalInterview.lockedError'
        ? t('professionalInterview.lockedError')
        : t('toast.genericError')
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const status: ProfessionalInterview['status'] =
        interview.status === 'scheduled' ? 'in_progress' : interview.status;
      await updateProfessionalInterview(interview.id, { ...form, status });
      setDirty(false);
    } catch (err) {
      saveErrorToast(err);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await updateProfessionalInterview(interview.id, { ...form, status: 'completed' });
      setDirty(false);
    } catch (err) {
      saveErrorToast(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSign = async (by: 'employee' | 'manager', signature: string, name: string) => {
    await signProfessionalInterview(interview.id, by, signature, name);
    toast.success(t('toast.interviewSigned'));
  };

  const handlePrintReport = () => {
    if (!interview || !campaign || !selectedEmployee) return;
    printProfessionalInterviewReport({ interview, employee: selectedEmployee, campaign });
  };

  const handleDeliver = async () => {
    setDelivering(true);
    try {
      await deliverProfessionalInterview(interview.id);
      toast.success(t('toast.professionalInterviewDelivered'));
    } catch {
      toast.error(t('toast.genericError'));
    } finally {
      setDelivering(false);
    }
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

      {locked ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800">
          <Lock size={18} className="flex-shrink-0" />
          <span className="text-sm font-medium">{t('professionalInterview.lockedBanner')}</span>
        </div>
      ) : campaign.status === 'closed' ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-gray-100 border-gray-300 text-gray-700">
          <span className="text-sm font-medium">{t('campaign.closedBanner')}</span>
        </div>
      ) : null}

      {/* Section 1 : Bilan du parcours */}
      <Card>
        <SectionTitle>{t('professionalInterview.section.careerReview')}</SectionTitle>
        <SectionHelp>{t('professionalInterview.help.careerReview')}</SectionHelp>
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
        <SectionHelp>{t('professionalInterview.help.evolution')}</SectionHelp>
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
        <SectionHelp>{t('professionalInterview.help.training')}</SectionHelp>
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
        <SectionHelp>{t('professionalInterview.help.conclusions')}</SectionHelp>
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
        <SectionHelp>{t('professionalInterview.help.comments')}</SectionHelp>
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
        <SectionHelp>{t('professionalInterview.help.signatures')}</SectionHelp>
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

      {/* Compte-rendu & remise au salarié */}
      <Card>
        <SectionTitle>{t('professionalReport.title')}</SectionTitle>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={handlePrintReport}>
            <Printer size={16} className="mr-1" />
            {t('professionalReport.print')}
          </Button>

          {/* La date de remise s'affiche dès qu'elle existe ; l'action de
              remise est masquée tant que la migration 012 (colonnes
              delivered_*) n'est pas appliquée — voir deliveryTrackingEnabled. */}
          {!isEmployee && (
            interview.deliveredAt ? (
              <span className="inline-flex items-center gap-2 text-sm text-emerald-700">
                <PackageCheck size={16} />
                {t('professionalReport.deliveredOn')} {formatDate(interview.deliveredAt)}
              </span>
            ) : !PROFESSIONAL_INTERVIEW_CONFIG.deliveryTrackingEnabled ? null : locked ? (
              <Button variant="primary" onClick={handleDeliver} disabled={delivering}>
                <PackageCheck size={16} className="mr-1" />
                {delivering ? t('common.loading') : t('professionalReport.markDelivered')}
              </Button>
            ) : (
              <span className="text-sm text-gray-400">{t('professionalReport.deliverAfterSignature')}</span>
            )
          )}
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
