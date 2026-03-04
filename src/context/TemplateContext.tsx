import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  TemplateContextType,
  TemplateState,
  Position,
  ObjectiveTemplate,
  NewPositionForm,
  NewTemplateForm,
} from '@/types';
import {
  insertPosition,
  updatePositionDb,
  deletePositionDb,
  insertTemplate,
  updateTemplateDb,
  deleteTemplateDb,
} from '@/services/supabase-data';

type Action =
  | { type: 'SET_POSITIONS'; payload: Position[] }
  | { type: 'ADD_POSITION'; payload: Position }
  | { type: 'UPDATE_POSITION'; payload: Position }
  | { type: 'REMOVE_POSITION'; payload: string }
  | { type: 'SET_TEMPLATES'; payload: ObjectiveTemplate[] }
  | { type: 'ADD_TEMPLATE'; payload: ObjectiveTemplate }
  | { type: 'UPDATE_TEMPLATE'; payload: ObjectiveTemplate }
  | { type: 'REMOVE_TEMPLATE'; payload: string }
  | { type: 'REMOVE_TEMPLATES_BY_POSITION'; payload: string };

const reducer = (state: TemplateState, action: Action): TemplateState => {
  switch (action.type) {
    case 'SET_POSITIONS':
      return { ...state, positions: action.payload };
    case 'ADD_POSITION':
      return { ...state, positions: [...state.positions, action.payload] };
    case 'UPDATE_POSITION':
      return { ...state, positions: state.positions.map((p) => p.id === action.payload.id ? action.payload : p) };
    case 'REMOVE_POSITION':
      return { ...state, positions: state.positions.filter((p) => p.id !== action.payload) };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] };
    case 'UPDATE_TEMPLATE':
      return { ...state, templates: state.templates.map((t) => t.id === action.payload.id ? action.payload : t) };
    case 'REMOVE_TEMPLATE':
      return { ...state, templates: state.templates.filter((t) => t.id !== action.payload) };
    case 'REMOVE_TEMPLATES_BY_POSITION':
      return { ...state, templates: state.templates.filter((t) => t.positionId !== action.payload) };
    default:
      return state;
  }
};

const TemplateContext = createContext<TemplateContextType | null>(null);

interface TemplateProviderProps {
  children: React.ReactNode;
  initialPositions?: Position[];
  initialTemplates?: ObjectiveTemplate[];
}

export const TemplateProvider: React.FC<TemplateProviderProps> = ({
  children,
  initialPositions,
  initialTemplates,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    positions: initialPositions || [],
    templates: initialTemplates || [],
  });

  const addPosition = useCallback(async (form: NewPositionForm) => {
    const position = await insertPosition(form);
    dispatch({ type: 'ADD_POSITION', payload: position });
  }, []);

  const updatePosition = useCallback(async (position: Position) => {
    await updatePositionDb(position);
    dispatch({ type: 'UPDATE_POSITION', payload: position });
  }, []);

  const deletePosition = useCallback(async (id: string) => {
    // CASCADE in DB deletes templates automatically
    await deletePositionDb(id);
    dispatch({ type: 'REMOVE_POSITION', payload: id });
    dispatch({ type: 'REMOVE_TEMPLATES_BY_POSITION', payload: id });
  }, []);

  const addTemplate = useCallback(async (form: NewTemplateForm) => {
    const template = await insertTemplate(form);
    dispatch({ type: 'ADD_TEMPLATE', payload: template });
  }, []);

  const updateTemplate = useCallback(async (template: ObjectiveTemplate) => {
    await updateTemplateDb(template);
    dispatch({ type: 'UPDATE_TEMPLATE', payload: template });
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    await deleteTemplateDb(id);
    dispatch({ type: 'REMOVE_TEMPLATE', payload: id });
  }, []);

  const value: TemplateContextType = {
    ...state,
    addPosition,
    updatePosition,
    deletePosition,
    addTemplate,
    updateTemplate,
    deleteTemplate,
  };

  return <TemplateContext.Provider value={value}>{children}</TemplateContext.Provider>;
};

export const useTemplateContext = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplateContext must be used within a TemplateProvider');
  }
  return context;
};
