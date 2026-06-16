import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { EmployeeContextType, EmployeeState, Employee, NewEmployeeForm } from '@/types';
import {
  insertEmployee,
  insertEmployees,
  updateEmployeeDb,
  deleteEmployeeDb,
} from '@/services/supabase-data';

type Action =
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'ADD_EMPLOYEE'; payload: Employee }
  | { type: 'ADD_EMPLOYEES'; payload: Employee[] }
  | { type: 'UPDATE_EMPLOYEE'; payload: Employee }
  | { type: 'REMOVE_EMPLOYEE'; payload: string };

const reducer = (state: EmployeeState, action: Action): EmployeeState => {
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'ADD_EMPLOYEE':
      return { ...state, employees: [...state.employees, action.payload] };
    case 'ADD_EMPLOYEES':
      return { ...state, employees: [...state.employees, ...action.payload] };
    case 'UPDATE_EMPLOYEE':
      return { ...state, employees: state.employees.map((e) => e.id === action.payload.id ? action.payload : e) };
    case 'REMOVE_EMPLOYEE':
      return { ...state, employees: state.employees.filter((e) => e.id !== action.payload) };
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
    const employee = await insertEmployee(form);
    dispatch({ type: 'ADD_EMPLOYEE', payload: employee });
  }, []);

  const updateEmployee = useCallback(async (employee: Employee) => {
    await updateEmployeeDb(employee);
    dispatch({ type: 'UPDATE_EMPLOYEE', payload: employee });
  }, []);

  const deleteEmployee = useCallback(async (id: string) => {
    // CASCADE in DB handles evaluations + objectives automatically
    await deleteEmployeeDb(id);
    dispatch({ type: 'REMOVE_EMPLOYEE', payload: id });
  }, []);

  const importEmployees = useCallback(async (imported: Omit<Employee, 'id'>[], establishmentId?: string): Promise<Employee[]> => {
    const created = await insertEmployees(imported, establishmentId);
    dispatch({ type: 'ADD_EMPLOYEES', payload: created });
    return created;
  }, []);

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
