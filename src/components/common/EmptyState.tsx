import React from 'react';
import type { LucideIcon } from 'lucide-react';

// ============================================
// Composant EmptyState pour les listes vides
// ============================================

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message, action }) => {
  return (
    <div className="text-center py-12 text-gray-500">
      <Icon size={48} className="mx-auto mb-4 opacity-50" />
      <p>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
