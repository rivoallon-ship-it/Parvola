import React from 'react';
import type { Employee, NineBoxRating, Evaluation } from '@/types';
import { NINE_BOX_CONFIG } from '@/constants/config';
import { colors } from '@/constants/colors';
import { NineBoxCell } from './NineBoxCell';

interface NineBoxGridProps {
  employees: Employee[];
  evaluations: Evaluation[];
  semesterId: string;
  onDrop: (employeeId: string, performance: NineBoxRating, potential: NineBoxRating) => void;
  onEmployeeClick: (employee: Employee) => void;
}

export const NineBoxGrid: React.FC<NineBoxGridProps> = ({
  employees,
  evaluations,
  semesterId,
  onDrop,
  onEmployeeClick,
}) => {
  const getEmployeesInCell = (performance: NineBoxRating, potential: NineBoxRating): Employee[] => {
    return employees.filter((emp) => {
      const evaluation = evaluations.find(
        (ev) => ev.employeeId === emp.id && ev.semesterId === semesterId
      );
      return (
        evaluation?.performanceRating === performance &&
        evaluation?.potentialRating === potential
      );
    });
  };

  // Grid rows: potential 3 (top) → 1 (bottom), columns: performance 1 (left) → 3 (right)
  const potentialLevels: NineBoxRating[] = [3, 2, 1];
  const performanceLevels: NineBoxRating[] = [1, 2, 3];

  return (
    <div className="flex gap-3">
      {/* Y-axis label */}
      <div className="flex flex-col items-center justify-center shrink-0" style={{ width: 28 }}>
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            color: colors.btn.primary,
          }}
        >
          Potentiel
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {/* Y-axis level labels + Grid */}
        {potentialLevels.map((potential) => (
          <div key={potential} className="flex gap-2 items-stretch">
            {/* Y-axis tick label */}
            <div className="flex items-center justify-end shrink-0" style={{ width: 52 }}>
              <span className="text-[11px] font-medium text-gray-500">
                {NINE_BOX_CONFIG.potentialLabels[potential - 1]}
              </span>
            </div>

            {/* Cells row */}
            <div className="flex-1 grid grid-cols-3 gap-2">
              {performanceLevels.map((performance) => (
                <NineBoxCell
                  key={`${performance}-${potential}`}
                  performance={performance}
                  potential={potential}
                  employees={getEmployeesInCell(performance, potential)}
                  onDrop={onDrop}
                  onEmployeeClick={onEmployeeClick}
                />
              ))}
            </div>
          </div>
        ))}

        {/* X-axis labels */}
        <div className="flex gap-2">
          <div style={{ width: 52 }} className="shrink-0" />
          <div className="flex-1 grid grid-cols-3 gap-2">
            {performanceLevels.map((level) => (
              <div key={level} className="text-center">
                <span className="text-[11px] font-medium text-gray-500">
                  {NINE_BOX_CONFIG.performanceLabels[level - 1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* X-axis title */}
        <div className="flex gap-2">
          <div style={{ width: 52 }} className="shrink-0" />
          <div className="flex-1 text-center">
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: colors.btn.primary }}
            >
              Performance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NineBoxGrid;
