import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  TemplateContextType,
  TemplateState,
  Position,
  ObjectiveTemplate,
  NewPositionForm,
  NewTemplateForm,
} from '@/types';
import { storage } from '@/services/storage';
import { generateId } from '@/utils/helpers';

type Action =
  | { type: 'SET_POSITIONS'; payload: Position[] }
  | { type: 'SET_TEMPLATES'; payload: ObjectiveTemplate[] };

const reducer = (state: TemplateState, action: Action): TemplateState => {
  switch (action.type) {
    case 'SET_POSITIONS':
      return { ...state, positions: action.payload };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
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
    const position: Position = {
      id: generateId(),
      name: form.name,
      description: form.description,
    };
    const newPositions = [...state.positions, position];
    await storage.setPositions(newPositions);
    dispatch({ type: 'SET_POSITIONS', payload: newPositions });
  }, [state.positions]);

  const updatePosition = useCallback(async (position: Position) => {
    const newPositions = state.positions.map((p) => (p.id === position.id ? position : p));
    await storage.setPositions(newPositions);
    dispatch({ type: 'SET_POSITIONS', payload: newPositions });
  }, [state.positions]);

  const deletePosition = useCallback(async (id: string) => {
    const newPositions = state.positions.filter((p) => p.id !== id);
    const newTemplates = state.templates.filter((t) => t.positionId !== id);
    await Promise.all([
      storage.setPositions(newPositions),
      storage.setTemplates(newTemplates),
    ]);
    dispatch({ type: 'SET_POSITIONS', payload: newPositions });
    dispatch({ type: 'SET_TEMPLATES', payload: newTemplates });
  }, [state.positions, state.templates]);

  const addTemplate = useCallback(async (form: NewTemplateForm) => {
    const template: ObjectiveTemplate = {
      id: generateId(),
      positionId: form.positionId,
      title: form.title,
      description: form.description,
      suggestedDeadlineDays: form.suggestedDeadlineDays,
    };
    const newTemplates = [...state.templates, template];
    await storage.setTemplates(newTemplates);
    dispatch({ type: 'SET_TEMPLATES', payload: newTemplates });
  }, [state.templates]);

  const updateTemplate = useCallback(async (template: ObjectiveTemplate) => {
    const newTemplates = state.templates.map((t) => (t.id === template.id ? template : t));
    await storage.setTemplates(newTemplates);
    dispatch({ type: 'SET_TEMPLATES', payload: newTemplates });
  }, [state.templates]);

  const deleteTemplate = useCallback(async (id: string) => {
    const newTemplates = state.templates.filter((t) => t.id !== id);
    await storage.setTemplates(newTemplates);
    dispatch({ type: 'SET_TEMPLATES', payload: newTemplates });
  }, [state.templates]);

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
