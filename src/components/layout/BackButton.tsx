import React from 'react';
import { useTranslation } from 'react-i18next';
import { colors } from '@/constants/colors';

// ============================================
// Composant BackButton pour la navigation arrière
// ============================================

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label }) => {
  const { t } = useTranslation();
  const displayLabel = label || t('common.back');
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:opacity-70 transition"
      style={{ color: colors.btn.primary }}
    >
      ← {displayLabel}
    </button>
  );
};

export default BackButton;
