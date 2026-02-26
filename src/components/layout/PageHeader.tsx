import React from 'react';
import { colors } from '@/constants/colors';

// ============================================
// Composant PageHeader pour les titres de page
// ============================================

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  backButton?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, action, backButton }) => {
  return (
    <div className="space-y-4">
      {backButton && <div>{backButton}</div>}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold" style={{ color: colors.btn.primary }}>
          {title}
        </h1>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;
