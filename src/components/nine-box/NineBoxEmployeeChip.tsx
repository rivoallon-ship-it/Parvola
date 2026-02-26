import React from 'react';
import type { Employee } from '@/types';
import { colors } from '@/constants/colors';
import { truncateText } from '@/utils/helpers';

interface NineBoxEmployeeChipProps {
  employee: Employee;
  onClick: () => void;
}

export const NineBoxEmployeeChip: React.FC<NineBoxEmployeeChipProps> = ({
  employee,
  onClick,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('employeeId', employee.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow select-none"
      style={{
        backgroundColor: colors.card.bg,
        border: `1px solid ${colors.card.border}`,
      }}
    >
      <span className="text-sm">{employee.photo}</span>
      <div className="min-w-0">
        <div className="text-xs font-medium truncate" style={{ color: colors.btn.primary }}>
          {truncateText(employee.name, 18)}
        </div>
        {employee.position && (
          <div className="text-[10px] text-gray-500 truncate">
            {truncateText(employee.position, 20)}
          </div>
        )}
      </div>
    </div>
  );
};

export default NineBoxEmployeeChip;
