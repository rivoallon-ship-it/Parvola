import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { NavigationContextType, NavigationState, ViewType, Employee, Semester } from '@/types';

const initialState: NavigationState = {
  currentView: 'semesters',
  selectedEmployee: null,
  selectedSemester: null,
  viewingSemester: null,
  searchTerm: '',
  isLoading: true,
};

type Action =
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_SELECTED_EMPLOYEE'; payload: Employee | null }
  | { type: 'SET_SELECTED_SEMESTER'; payload: Semester | null }
  | { type: 'SET_VIEWING_SEMESTER'; payload: Semester | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_IS_LOADING'; payload: boolean };

const reducer = (state: NavigationState, action: Action): NavigationState => {
  switch (action.type) {
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_SELECTED_EMPLOYEE':
      return { ...state, selectedEmployee: action.payload };
    case 'SET_SELECTED_SEMESTER':
      return { ...state, selectedSemester: action.payload };
    case 'SET_VIEWING_SEMESTER':
      return { ...state, viewingSemester: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setCurrentView = useCallback((view: ViewType) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  }, []);

  const setSelectedEmployee = useCallback((employee: Employee | null) => {
    dispatch({ type: 'SET_SELECTED_EMPLOYEE', payload: employee });
  }, []);

  const setSelectedSemester = useCallback((semester: Semester | null) => {
    dispatch({ type: 'SET_SELECTED_SEMESTER', payload: semester });
  }, []);

  const setViewingSemester = useCallback((semester: Semester | null) => {
    dispatch({ type: 'SET_VIEWING_SEMESTER', payload: semester });
  }, []);

  const setSearchTerm = useCallback((term: string) => {
    dispatch({ type: 'SET_SEARCH_TERM', payload: term });
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_IS_LOADING', payload: loading });
  }, []);

  const value: NavigationContextType = {
    ...state,
    setCurrentView,
    setSelectedEmployee,
    setSelectedSemester,
    setViewingSemester,
    setSearchTerm,
    setIsLoading,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
};
