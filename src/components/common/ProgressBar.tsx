import React from 'react';
import { colors } from '@/constants/colors';

// ============================================
// Composant ProgressBar réutilisable
// ============================================

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  size = 'md',
  color = colors.accent,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progression</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${sizeClasses[size]}`}
        style={{ backgroundColor: colors.card.border }}
      >
        <div
          className={`h-full rounded-full transition-all duration-300`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
