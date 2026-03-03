import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Employee, NineBoxRating } from '@/types';
import { NINE_BOX_CONFIG } from '@/constants/config';
import { NineBoxEmployeeChip } from './NineBoxEmployeeChip';

interface NineBoxCellProps {
  performance: NineBoxRating;
  potential: NineBoxRating;
  employees: Employee[];
  onDrop: (employeeId: string, performance: NineBoxRating, potential: NineBoxRating) => void;
  onEmployeeClick: (employee: Employee) => void;
}

export const NineBoxCell: React.FC<NineBoxCellProps> = ({
  performance,
  potential,
  employees,
  onDrop,
  onEmployeeClick,
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const cellKey = `${performance}-${potential}` as keyof typeof NINE_BOX_CONFIG.cells;
  const cellConfig = NINE_BOX_CONFIG.cells[cellKey];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const employeeId = e.dataTransfer.getData('employeeId');
    if (employeeId) {
      onDrop(employeeId, performance, potential);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="rounded-xl p-2 min-h-[120px] flex flex-col transition-all"
      style={{
        backgroundColor: cellConfig.bg,
        border: `2px ${isDragOver ? 'dashed' : 'solid'} ${isDragOver ? cellConfig.textColor : cellConfig.border}`,
        opacity: isDragOver ? 0.85 : 1,
        transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: cellConfig.textColor }}
        >
          {t(cellConfig.labelKey)}
        </span>
        {employees.length > 0 && (
          <span
            className="text-[10px] font-medium rounded-full px-1.5 py-0.5"
            style={{
              backgroundColor: cellConfig.border,
              color: cellConfig.textColor,
            }}
          >
            {employees.length}
          </span>
        )}
      </div>

      {/* Employee chips */}
      <div className="flex flex-wrap gap-1 flex-1">
        {employees.map((emp) => (
          <NineBoxEmployeeChip
            key={emp.id}
            employee={emp}
            onClick={() => onEmployeeClick(emp)}
          />
        ))}
      </div>
    </div>
  );
};

export default NineBoxCell;
