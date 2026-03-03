import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type {
  SemesterContextType,
  SemesterState,
  Semester,
  Evaluation,
  EvaluationStatus,
  Objective,
  NewSemesterForm,
  DuplicateConfig,
  NineBoxRating,
  Employee,
  ObjectiveTemplate,
} from '@/types';
import { storage } from '@/services/storage';
import { generateId, calculateDeadline } from '@/utils/helpers';
import { OBJECTIVE_CONFIG } from '@/constants/config';

type Action =
  | { type: 'SET_SEMESTERS'; payload: Semester[] }
  | { type: 'SET_EVALUATIONS'; payload: Evaluation[] };

const reducer = (state: SemesterState, action: Action): SemesterState => {
  switch (action.type) {
    case 'SET_SEMESTERS':
      return { ...state, semesters: action.payload };
    case 'SET_EVALUATIONS':
      return { ...state, evaluations: action.payload };
    default:
      return state;
  }
};

const SemesterContext = createContext<SemesterContextType | null>(null);

interface SemesterProviderProps {
  children: React.ReactNode;
  initialSemesters?: Semester[];
  initialEvaluations?: Evaluation[];
  getSelectedEmployee?: () => Employee | null;
  getSelectedSemester?: () => Semester | null;
  getTemplates?: () => ObjectiveTemplate[];
}

export const SemesterProvider: React.FC<SemesterProviderProps> = ({
  children,
  initialSemesters,
  initialEvaluations,
  getSelectedEmployee,
  getSelectedSemester,
  getTemplates,
}) => {
  const [state, dispatch] = useReducer(reducer, {
    semesters: initialSemesters || [],
    evaluations: initialEvaluations || [],
  });

  const setEvaluations = useCallback((evaluations: Evaluation[]) => {
    dispatch({ type: 'SET_EVALUATIONS', payload: evaluations });
  }, []);

  const addSemester = useCallback(async (form: NewSemesterForm) => {
    const semester: Semester = {
      id: generateId(),
      year: form.year,
      semester: form.semester,
      name: `${form.semester} ${form.year}`,
      status: 'draft',
      closingDeadline: form.closingDeadline || undefined,
    };
    const newSemesters = [...state.semesters, semester];
    await storage.setSemesters(newSemesters);
    dispatch({ type: 'SET_SEMESTERS', payload: newSemesters });
  }, [state.semesters]);

  const updateSemester = useCallback(async (updated: Semester) => {
    const newSemesters = state.semesters.map((s) =>
      s.id === updated.id ? updated : s
    );
    await storage.setSemesters(newSemesters);
    dispatch({ type: 'SET_SEMESTERS', payload: newSemesters });
  }, [state.semesters]);

  const publishCampaign = useCallback(async (semesterId: string) => {
    const newSemesters = state.semesters.map((s) =>
      s.id === semesterId && s.status === 'draft'
        ? { ...s, status: 'active' as const }
        : s
    );
    await storage.setSemesters(newSemesters);
    dispatch({ type: 'SET_SEMESTERS', payload: newSemesters });
  }, [state.semesters]);

  const closeCampaign = useCallback(async (semesterId: string) => {
    const newSemesters = state.semesters.map((s) =>
      s.id === semesterId && s.status === 'active'
        ? { ...s, status: 'closed' as const }
        : s
    );
    await storage.setSemesters(newSemesters);
    dispatch({ type: 'SET_SEMESTERS', payload: newSemesters });
  }, [state.semesters]);

  const deleteSemester = useCallback(async (id: string) => {
    const newSemesters = state.semesters.filter((s) => s.id !== id);
    const newEvaluations = state.evaluations.filter((e) => e.semesterId !== id);
    await Promise.all([
      storage.setSemesters(newSemesters),
      storage.setEvaluations(newEvaluations),
    ]);
    dispatch({ type: 'SET_SEMESTERS', payload: newSemesters });
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.semesters, state.evaluations]);

  const addObjective = useCallback(async (employeeId: string, semesterId: string) => {
    const objective: Objective = {
      id: generateId(),
      title: '',
      description: '',
      status: OBJECTIVE_CONFIG.defaultStatus,
      progress: OBJECTIVE_CONFIG.defaultProgress,
      deadline: '',
      comments: '',
      evaluation: '',
    };

    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = state.evaluations.map((e) =>
        e.id === existing.id
          ? {
              ...e,
              objectives: [...e.objectives, objective],
              validationStatus: (!e.validationStatus || e.validationStatus === 'not_started')
                ? 'in_progress' as const
                : e.validationStatus,
            }
          : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId,
        semesterId,
        objectives: [objective],
        validationStatus: 'in_progress',
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const addObjectiveFromTemplate = useCallback(async (templateId: string) => {
    const selectedEmployee = getSelectedEmployee?.();
    const selectedSemester = getSelectedSemester?.();
    const templates = getTemplates?.() || [];

    if (!selectedEmployee || !selectedSemester) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const objective: Objective = {
      id: generateId(),
      title: template.title,
      description: template.description,
      status: OBJECTIVE_CONFIG.defaultStatus,
      progress: OBJECTIVE_CONFIG.defaultProgress,
      deadline: calculateDeadline(template.suggestedDeadlineDays),
      comments: '',
      evaluation: '',
    };

    const existing = state.evaluations.find(
      (e) => e.employeeId === selectedEmployee.id && e.semesterId === selectedSemester.id
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = state.evaluations.map((e) =>
        e.id === existing.id
          ? {
              ...e,
              objectives: [...e.objectives, objective],
              validationStatus: (!e.validationStatus || e.validationStatus === 'not_started')
                ? 'in_progress' as const
                : e.validationStatus,
            }
          : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId: selectedEmployee.id,
        semesterId: selectedSemester.id,
        objectives: [objective],
        validationStatus: 'in_progress',
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations, getSelectedEmployee, getSelectedSemester, getTemplates]);

  const updateObjective = useCallback(async (
    evalId: string,
    objId: string,
    field: keyof Objective,
    value: string | number
  ) => {
    const newEvaluations = state.evaluations.map((e) =>
      e.id === evalId
        ? {
            ...e,
            objectives: e.objectives.map((o) =>
              o.id === objId ? { ...o, [field]: value } : o
            ),
          }
        : e
    );
    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const deleteObjective = useCallback(async (evalId: string, objId: string) => {
    const newEvaluations = state.evaluations.map((e) =>
      e.id === evalId
        ? { ...e, objectives: e.objectives.filter((o) => o.id !== objId) }
        : e
    );
    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const reorderObjectives = useCallback(async (evalId: string, fromIdx: number, toIdx: number) => {
    const newEvaluations = state.evaluations.map((e) => {
      if (e.id === evalId) {
        const objectives = [...e.objectives];
        const [removed] = objectives.splice(fromIdx, 1);
        objectives.splice(toIdx, 0, removed);
        return { ...e, objectives };
      }
      return e;
    });
    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const duplicateObjectives = useCallback(async (config: DuplicateConfig) => {
    const selectedEmployee = getSelectedEmployee?.();
    const selectedSemester = getSelectedSemester?.();

    const currentEval = state.evaluations.find(
      (e) =>
        e.employeeId === selectedEmployee?.id &&
        e.semesterId === selectedSemester?.id
    );
    if (!currentEval) return;

    const selectedObjs = currentEval.objectives
      .filter((o) => config.selectedObjectives.includes(o.id))
      .map((o) => ({
        ...o,
        id: generateId(),
        progress: 0,
        status: OBJECTIVE_CONFIG.defaultStatus,
        comments: '',
        evaluation: '',
      }));

    const existing = state.evaluations.find(
      (e) =>
        e.employeeId === config.targetEmployeeId &&
        e.semesterId === config.targetSemesterId
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = state.evaluations.map((e) =>
        e.id === existing.id
          ? { ...e, objectives: [...e.objectives, ...selectedObjs] }
          : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId: config.targetEmployeeId,
        semesterId: config.targetSemesterId,
        objectives: selectedObjs,
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations, getSelectedEmployee, getSelectedSemester]);

  const updateEvaluationStatus = useCallback(async (
    employeeId: string,
    semesterId: string,
    status: EvaluationStatus
  ) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = state.evaluations.map((e) =>
        e.id === existing.id ? { ...e, validationStatus: status } : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId,
        semesterId,
        objectives: [],
        validationStatus: status,
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const submitEvaluation = useCallback(async (employeeId: string, semesterId: string) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );
    if (!existing || existing.validationStatus !== 'in_progress') return;

    const newEvaluations = state.evaluations.map((e) =>
      e.id === existing.id ? { ...e, validationStatus: 'submitted' as const } : e
    );
    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const validateEvaluation = useCallback(async (employeeId: string, semesterId: string) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );
    if (!existing || existing.validationStatus !== 'submitted') return;

    const newEvaluations = state.evaluations.map((e) =>
      e.id === existing.id ? { ...e, validationStatus: 'validated' as const } : e
    );
    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const updateEvaluationBilan = useCallback(async (
    employeeId: string,
    semesterId: string,
    field: 'bilanManager' | 'bilanEmployee',
    value: string
  ) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = state.evaluations.map((e) =>
        e.id === existing.id ? { ...e, [field]: value } : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId,
        semesterId,
        objectives: [],
        [field]: value,
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const updateEvaluationRatings = useCallback(async (
    employeeId: string,
    semesterId: string,
    performanceRating: NineBoxRating,
    potentialRating: NineBoxRating
  ) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = state.evaluations.map((e) =>
        e.id === existing.id ? { ...e, performanceRating, potentialRating } : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId,
        semesterId,
        objectives: [],
        performanceRating,
        potentialRating,
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const value: SemesterContextType = {
    ...state,
    addSemester,
    updateSemester,
    deleteSemester,
    publishCampaign,
    closeCampaign,
    addObjective,
    addObjectiveFromTemplate,
    updateObjective,
    deleteObjective,
    reorderObjectives,
    duplicateObjectives,
    updateEvaluationStatus,
    submitEvaluation,
    validateEvaluation,
    updateEvaluationBilan,
    updateEvaluationRatings,
    setEvaluations,
  };

  return <SemesterContext.Provider value={value}>{children}</SemesterContext.Provider>;
};

export const useSemesterContext = (): SemesterContextType => {
  const context = useContext(SemesterContext);
  if (!context) {
    throw new Error('useSemesterContext must be used within a SemesterProvider');
  }
  return context;
};
