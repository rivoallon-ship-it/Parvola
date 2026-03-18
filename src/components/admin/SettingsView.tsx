import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, Users, Save } from 'lucide-react';
import { Card, Button } from '@/components/common';
import { Input } from '@/components/common/Input';
import { useUser } from '@/hooks';
import { fetchCompany, updateCompany } from '@/services/supabase-data';
import { MemberList } from './MemberList';
import type { Company } from '@/types';

// ============================================
// Vue Parametres (RH uniquement)
// ============================================

type Tab = 'company' | 'members';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>('company');
  const [company, setCompany] = useState<Company | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentUser.companyId) {
      fetchCompany(currentUser.companyId).then((c) => {
        setCompany(c);
        setCompanyName(c.name);
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

  const tabs: Array<{ key: Tab; label: string; icon: React.ElementType }> = [
    { key: 'company', label: t('settings.company'), icon: Building2 },
    { key: 'members', label: t('settings.members'), icon: Users },
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
    </div>
  );
};
