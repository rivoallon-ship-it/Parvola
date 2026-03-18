import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { Modal, Button } from '@/components/common';
import { Input, Select } from '@/components/common/Input';
import { supabase } from '@/lib/supabase';
import { useUser, useOrganization } from '@/hooks';
import { getInvitableRoles } from '@/utils/permissions';
import type { UserRole } from '@/types';

// ============================================
// Modale d'invitation d'un utilisateur
// ============================================

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { currentUser } = useUser();
  const { establishments } = useOrganization();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const invitableRoles = getInvitableRoles(currentUser.role);
  const [role, setRole] = useState<UserRole>(invitableRoles[invitableRoles.length - 1] || 'employee');
  const [selectedEstablishmentIds, setSelectedEstablishmentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setEmail('');
    setName('');
    setRole(invitableRoles[invitableRoles.length - 1] || 'employee');
    setSelectedEstablishmentIds([]);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setError('');
    setLoading(true);

    try {
      const body: Record<string, unknown> = { email, name, role };
      if (role === 'directeur') {
        body.establishmentIds = selectedEstablishmentIds;
      }

      const { data, error: fnError } = await supabase.functions.invoke('invite-user', { body });

      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);

      resetForm();
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      setError(msg || t('settings.inviteError'));
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = invitableRoles.map((r) => ({
    value: r,
    label: t(`settings.role${r.charAt(0).toUpperCase() + r.slice(1)}` as string),
  }));

  const toggleEstablishment = (id: string) => {
    setSelectedEstablishmentIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('settings.inviteUser')} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nouveau@entreprise.fr"
          required
          autoComplete="off"
        />
        <Input
          label={t('auth.yourName')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom complet"
          required
          icon={<UserPlus size={16} />}
        />
        <Select
          label={t('settings.roleLabel')}
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={roleOptions}
        />

        {/* Establishment multi-select for directeur */}
        {role === 'directeur' && establishments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('settings.establishments')}
            </label>
            <div className="border border-gray-200 rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
              {establishments.map((est) => (
                <label key={est.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedEstablishmentIds.includes(est.id)}
                    onChange={() => toggleEstablishment(est.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{est.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-lg p-3 text-sm"
            style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}
          >
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!email || !name}
            icon={<UserPlus size={16} />}
          >
            {t('settings.inviteButton')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
