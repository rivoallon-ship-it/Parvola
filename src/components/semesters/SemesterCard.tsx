import React from 'react';
import { Calendar, ChevronRight, Trash2 } from 'lucide-react';
import type { Semester } from '@/types';
import { Card } from '@/components/common';
import { colors } from '@/constants/colors';
import { getSemesterPeriod } from '@/utils/helpers';

// ============================================
// Composant SemesterCard
// ============================================

interface SemesterCardProps {
  semester: Semester;
  evaluationCount: number;
  onClick: () => void;
  onDelete: () => void;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  evaluationCount,
  onClick,
  onDelete,
}) => {
  return (
    <Card hover className="group">
      <div className="flex justify-between items-start mb-4">
        <div onClick={onClick} className="flex-1 cursor-pointer">
          <h3
            className="text-xl font-bold group-hover:opacity-80"
            style={{ color: colors.btn.primary }}
          >
            {semester.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {evaluationCount} évaluation(s)
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>
      <div onClick={onClick} className="flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar size={16} />
          <span className="text-sm">{getSemesterPeriod(semester.semester)}</span>
        </div>
        <ChevronRight style={{ color: colors.accent }} size={20} />
      </div>
    </Card>
  );
};

export default SemesterCard;
