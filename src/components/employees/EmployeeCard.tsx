import React from 'react';
import { Edit2, GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Employee } from '@/types';
import { Card } from '@/components/common';
import { colors } from '@/constants/colors';

// ============================================
// Composant EmployeeCard
// ============================================

export type InvitationStatus = 'registered' | 'invited' | 'not_invited' | 'no_email';

const STATUS_STYLES: Record<InvitationStatus, { labelKey: string; classes: string }> = {
  registered: { labelKey: 'employees.statusRegistered', classes: 'bg-emerald-100 text-emerald-700' },
  invited: { labelKey: 'employees.statusInvited', classes: 'bg-amber-100 text-amber-700' },
  not_invited: { labelKey: 'employees.statusNotInvited', classes: 'bg-gray-100 text-gray-500' },
  no_email: { labelKey: 'employees.statusNotInvited', classes: 'bg-gray-100 text-gray-400' },
};

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: () => void;
  onViewEvaluations: () => void;
  draggable?: boolean;
  invitationStatus?: InvitationStatus;
  onResendInvite?: () => void;
  onSendInvite?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onEdit,
  onViewEvaluations,
  draggable = false,
  invitationStatus,
  onResendInvite,
  onSendInvite,
}) => {
  const { t } = useTranslation();
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('employeeId', employee.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card
      hover
      onClick={onViewEvaluations}
      className="relative group"
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
    >
      {/* Bouton édition en haut à droite */}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          title={t('employees.editProfile')}
        >
          <Edit2 size={18} className="text-gray-500 hover:text-gray-700" />
        </button>
      )}

      <div className="flex items-center gap-4">
        {/* Grip pour drag & drop */}
        {draggable && (
          <div
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 -ml-2"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical size={20} />
          </div>
        )}

        <div className="text-5xl">{employee.photo}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold" style={{ color: colors.btn.primary }}>
            {employee.name}
          </h3>
          <p className="text-sm text-gray-500">{employee.position}</p>
          {invitationStatus && (
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[invitationStatus].classes}`}
              >
                {t(STATUS_STYLES[invitationStatus].labelKey)}
              </span>
              {invitationStatus === 'invited' && onResendInvite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResendInvite();
                  }}
                  className="text-xs font-medium text-teal-600 hover:underline"
                >
                  {t('employees.resendInvite')}
                </button>
              )}
              {invitationStatus === 'not_invited' && onSendInvite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSendInvite();
                  }}
                  className="text-xs font-medium text-teal-600 hover:underline"
                >
                  {t('employees.sendInvite')}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EmployeeCard;
