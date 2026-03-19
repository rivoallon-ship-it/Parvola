import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Users, Save, Sparkles } from 'lucide-react';
import { Card, Button, TextArea } from '@/components/common';
import { Input } from '@/components/common/Input';
import { useUser, useToast } from '@/hooks';
import { fetchCompany, updateCompany } from '@/services/supabase-data';
import { MemberList } from './MemberList';
import type { Company } from '@/types';

// ============================================
// Vue Parametres (RH uniquement)
// ============================================

type Tab = 'company' | 'members' | 'ai';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // AI prompts state
  const [objectivesContext, setObjectivesContext] = useState('');
  const [templatesContext, setTemplatesContext] = useState('');
  const [savingAi, setSavingAi] = useState(false);
  const [savedAi, setSavedAi] = useState(false);

  useEffect(() => {
    if (currentUser.companyId) {
      fetchCompany(currentUser.companyId).then((c) => {
        setCompany(c);
        setCompanyName(c.name);
        setObjectivesContext(c.aiPrompts?.objectivesContext || '');
        setTemplatesContext(c.aiPrompts?.templatesContext || '');
      });
    }
  }, [currentUser.companyId]);

  const handleSaveCompany = async () => {
    if (!company || !companyName.trim()) return;
    setSaving(true);
    try {
      await updateCompany(company.id, { name: companyName.trim() });
      setCompany({ ...company, name: companyName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAiPrompts = async () => {
    if (!company) return;
    setSavingAi(true);
    try {
      const aiPrompts = {
        objectivesContext: objectivesContext.trim(),
        templatesContext: templatesContext.trim(),
      };
      await updateCompany(company.id, { aiPrompts });
      setCompany({ ...company, aiPrompts });
      setSavedAi(true);
      setTimeout(() => setSavedAi(false), 2000);
      toast.success(t('toast.settingsSaved'));
    } finally {
      setSavingAi(false);
    }
  };

  const aiPromptsChanged =
    objectivesContext.trim() !== (company?.aiPrompts?.objectivesContext || '') ||
    templatesContext.trim() !== (company?.aiPrompts?.templatesContext || '');

  const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
    { key: 'company', label: t('settings.company'), icon: Building2 },
    { key: 'members', label: t('settings.members'), icon: Users },
    { key: 'ai', label: t('settings.ai'), icon: Sparkles },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Company tab */}
      {activeTab === 'company' && company && (
        <Card>
          <div className="space-y-4 max-w-lg">
            <Input
              label={t('settings.companyName')}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              icon={<Building2 size={16} />}
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">{t('settings.companySlug')}</label>
              <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                {company.slug}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleSaveCompany}
              loading={saving}
              disabled={!companyName.trim() || companyName.trim() === company.name}
              icon={saved ? undefined : <Save size={16} />}
            >
              {saved ? t('settings.saved') : t('settings.saveChanges')}
            </Button>
          </div>
        </Card>
      )}

      {/* Members tab */}
      {activeTab === 'members' && company && (
        <MemberList company={company} />
      )}

      {/* AI tab */}
      {activeTab === 'ai' && company && (
        <Card>
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('settings.ai')}</h3>
              <p className="text-sm text-gray-500">{t('settings.aiDescription')}</p>
            </div>

            {/* Objectives context */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('settings.aiObjectivesContext')}
              </label>
              <TextArea
                value={objectivesContext}
                onChange={(e) => setObjectivesContext(e.target.value)}
                placeholder={t('settings.aiObjectivesPlaceholder')}
                rows={4}
              />
              <p className="text-xs text-gray-400">{t('settings.aiObjectivesHelp')}</p>
            </div>

            {/* Templates context */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('settings.aiTemplatesContext')}
              </label>
              <TextArea
                value={templatesContext}
                onChange={(e) => setTemplatesContext(e.target.value)}
                placeholder={t('settings.aiTemplatesPlaceholder')}
                rows={4}
              />
              <p className="text-xs text-gray-400">{t('settings.aiTemplatesHelp')}</p>
            </div>

            <Button
              variant="primary"
              onClick={handleSaveAiPrompts}
              loading={savingAi}
              disabled={!aiPromptsChanged}
              icon={savedAi ? undefined : <Save size={16} />}
            >
              {savedAi ? t('settings.saved') : t('settings.saveChanges')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
