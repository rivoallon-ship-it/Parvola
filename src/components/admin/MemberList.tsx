import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, Crown } from 'lucide-react';
import { Card, Button } from '@/components/common';
import { fetchCompanyMembers } from '@/services/supabase-data';
import { InviteModal } from './InviteModal';
import type { Company } from '@/types';

// ============================================
// Liste des membres de l'entreprise
// ============================================

interface MemberListProps {
  company: Company;
}

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  admin: { bg: '#EDE9FE', text: '#5B21B6' },
  rh: { bg: '#D1FAE5', text: '#065F46' },
  directeur: { bg: '#CFFAFE', text: '#155E75' },
  manager: { bg: '#DBEAFE', text: '#1E40AF' },
  employee: { bg: '#FEF3C7', text: '#92400E' },
};

interface Member {
  id: string;
  name: string;
  photo: string;
  role: string;
  employeeId?: string;
  createdAt: string;
}

export const MemberList: React.FC<MemberListProps> = ({ company }) => {
  const { t } = useTranslation();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchCompanyMembers();
      setMembers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInviteSuccess = () => {
    setShowInvite(false);
    loadMembers();
  };

  const roleLabel = (role: string) => {
    return t(`user.role${role.charAt(0).toUpperCase() + role.slice(1)}` as string);
  };

  return (
    <>
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">{t('settings.members')}</h3>
              <p className="text-sm text-gray-500">
                {t('settings.memberCount', { count: members.length })}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowInvite(true)}
              icon={<UserPlus size={16} />}
            >
              {t('settings.inviteUser')}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-accent border-t-transparent"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member) => {
                const isOwner = member.id === company.ownerId;
                const colors = ROLE_COLORS[member.role] || ROLE_COLORS.employee;
                return (
                  <div key={member.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{member.photo}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{member.name}</span>
                          {isOwner && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                              <Crown size={10} />
                              {t('settings.owner')}
                            </span>
                          )}
                        </div>
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {roleLabel(member.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      <InviteModal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        onSuccess={handleInviteSuccess}
      />
    </>
  );
};
