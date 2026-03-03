import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { EmployeeContextType, EmployeeState, Employee, NewEmployeeForm } from '@/types';
import { storage } from '@/services/storage';
import { generateId } from '@/utils/helpers';

type Action =
  | { type: 'SET_EMPLOYEES'; payload: Employee[] };

const reducer = (state: EmployeeState, action: Action): EmployeeState => {
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    default:
      return state;
  }
};

const EmployeeContext = createContext<EmployeeContextType | null>(null);

interface EmployeeProviderProps {
  children: React.ReactNode;
  initialEmployees?: Employee[];
}

export const EmployeeProvider: React.FC<EmployeeProviderProps> = ({ children, initialEmployees }) => {
  const [state, dispatch] = useReducer(reducer, {
    employees: initialEmployees || [],
  });

  const setEmployees = useCallback((employees: Employee[]) => {
    dispatch({ type: 'SET_EMPLOYEES', payload: employees });
  }, []);

  const addEmployee = useCallback(async (form: NewEmployeeForm) => {
    const employee: Employee = {
      id: generateId(),
      name: form.name,
      position: form.position,
      photo: form.photo || '👤',
      establishmentId: form.establishmentId,
      teamId: form.teamId,
      salary: form.salary,
      lateCount: form.lateCount,
      unjustifiedAbsences: form.unjustifiedAbsences,
      justifiedAbsences: form.justifiedAbsences,
    };
    const newEmployees = [...state.employees, employee];
    await storage.setEmployees(newEmployees);
    dispatch({ type: 'SET_EMPLOYEES', payload: newEmployees });
  }, [state.employees]);

  const updateEmployee = useCallback(async (employee: Employee) => {
    const newEmployees = state.employees.map((e) => (e.id === employee.id ? employee : e));
    await storage.setEmployees(newEmployees);
    dispatch({ type: 'SET_EMPLOYEES', payload: newEmployees });
  }, [state.employees]);

  const deleteEmployee = useCallback(async (id: string) => {
    const newEmployees = state.employees.filter((e) => e.id !== id);
    // Also clean up evaluations for this employee
    const evaluations = await storage.getEvaluations();
    if (evaluations) {
      const newEvaluations = evaluations.filter((e) => e.employeeId !== id);
      await storage.setEvaluations(newEvaluations);
    }
    await storage.setEmployees(newEmployees);
    dispatch({ type: 'SET_EMPLOYEES', payload: newEmployees });
  }, [state.employees]);

  const importEmployees = useCallback(async (imported: Omit<Employee, 'id'>[], establishmentId?: string) => {
    const newEmployees = imported.map((emp) => ({
      ...emp,
      id: generateId(),
      establishmentId: establishmentId || emp.establishmentId,
    }));
    const allEmployees = [...state.employees, ...newEmployees];
    await storage.setEmployees(allEmployees);
    dispatch({ type: 'SET_EMPLOYEES', payload: allEmployees });
  }, [state.employees]);

  const value: EmployeeContextType = {
    ...state,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    setEmployees,
  };

  return <EmployeeContext.Provider value={value}>{children}</EmployeeContext.Provider>;
};

export const useEmployeeContext = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployeeContext must be used within an EmployeeProvider');
  }
  return context;
};
