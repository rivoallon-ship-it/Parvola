import React from 'react';
import { colors } from '@/constants/colors';

// ============================================
// Composant BackButton pour la navigation arrière
// ============================================

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = 'Retour' }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 hover:opacity-70 transition"
      style={{ color: colors.btn.primary }}
    >
      ← {label}
    </button>
  );
};

export default BackButton;
