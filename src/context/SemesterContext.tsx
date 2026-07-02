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
import {
  insertSemester,
  updateSemesterDb,
  deleteSemesterDb,
  insertEvaluation,
  updateEvaluationDb,
  insertObjectiveDb,
  insertObjectivesBatch,
  updateObjectiveDb,
  deleteObjectiveDb,
  reorderObjectivesDb,
  signEvaluationAsEmployee,
  markEvaluationReminded,
} from '@/services/supabase-data';
import { calculateDeadline } from '@/utils/helpers';
import { OBJECTIVE_CONFIG } from '@/constants/config';

type Action =
  | { type: 'SET_SEMESTERS'; payload: Semester[] }
  | { type: 'ADD_SEMESTER'; payload: Semester }
  | { type: 'UPDATE_SEMESTER'; payload: Semester }
  | { type: 'REMOVE_SEMESTER'; payload: string }
  | { type: 'SET_EVALUATIONS'; payload: Evaluation[] }
  | { type: 'ADD_EVALUATION'; payload: Evaluation }
  | { type: 'UPDATE_EVALUATION'; payload: { id: string; changes: Partial<Evaluation> } }
  | { type: 'REMOVE_EVALUATIONS_BY_SEMESTER'; payload: string }
  | { type: 'ADD_OBJECTIVE'; payload: { evalId: string; objective: Objective } }
  | { type: 'ADD_OBJECTIVES'; payload: { evalId: string; objectives: Objective[] } }
  | { type: 'UPDATE_OBJECTIVE'; payload: { evalId: string; objId: string; field: keyof Objective; value: string | number } }
  | { type: 'REMOVE_OBJECTIVE'; payload: { evalId: string; objId: string } }
  | { type: 'REORDER_OBJECTIVES'; payload: { evalId: string; fromIdx: number; toIdx: number } };

const reducer = (state: SemesterState, action: Action): SemesterState => {
  switch (action.type) {
    case 'SET_SEMESTERS':
      return { ...state, semesters: action.payload };
    case 'ADD_SEMESTER':
      return { ...state, semesters: [...state.semesters, action.payload] };
    case 'UPDATE_SEMESTER':
      return { ...state, semesters: state.semesters.map((s) => s.id === action.payload.id ? action.payload : s) };
    case 'REMOVE_SEMESTER':
      return { ...state, semesters: state.semesters.filter((s) => s.id !== action.payload) };
    case 'SET_EVALUATIONS':
      return { ...state, evaluations: action.payload };
    case 'ADD_EVALUATION':
      return { ...state, evaluations: [...state.evaluations, action.payload] };
    case 'UPDATE_EVALUATION':
      return {
        ...state,
        evaluations: state.evaluations.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.changes } : e
        ),
      };
    case 'REMOVE_EVALUATIONS_BY_SEMESTER':
      return { ...state, evaluations: state.evaluations.filter((e) => e.semesterId !== action.payload) };
    case 'ADD_OBJECTIVE':
      return {
        ...state,
        evaluations: state.evaluations.map((e) =>
          e.id === action.payload.evalId
            ? { ...e, objectives: [...e.objectives, action.payload.objective] }
            : e
        ),
      };
    case 'ADD_OBJECTIVES':
      return {
        ...state,
        evaluations: state.evaluations.map((e) =>
          e.id === action.payload.evalId
            ? { ...e, objectives: [...e.objectives, ...action.payload.objectives] }
            : e
        ),
      };
    case 'UPDATE_OBJECTIVE':
      return {
        ...state,
        evaluations: state.evaluations.map((e) =>
          e.id === action.payload.evalId
            ? {
                ...e,
                objectives: e.objectives.map((o) =>
                  o.id === action.payload.objId ? { ...o, [action.payload.field]: action.payload.value } : o
                ),
              }
            : e
        ),
      };
    case 'REMOVE_OBJECTIVE':
      return {
        ...state,
        evaluations: state.evaluations.map((e) =>
          e.id === action.payload.evalId
            ? { ...e, objectives: e.objectives.filter((o) => o.id !== action.payload.objId) }
            : e
        ),
      };
    case 'REORDER_OBJECTIVES': {
      return {
        ...state,
        evaluations: state.evaluations.map((e) => {
          if (e.id !== action.payload.evalId) return e;
          const objectives = [...e.objectives];
          const [removed] = objectives.splice(action.payload.fromIdx, 1);
          objectives.splice(action.payload.toIdx, 0, removed);
          return { ...e, objectives };
        }),
      };
    }
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

  // Helper: get or create an evaluation for employee+semester
  const getOrCreateEval = useCallback(async (employeeId: string, semesterId: string): Promise<{ eval: Evaluation; isNew: boolean }> => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );
    if (existing) return { eval: existing, isNew: false };

    const newEval = await insertEvaluation({ employeeId, semesterId, validationStatus: 'in_progress' });
    dispatch({ type: 'ADD_EVALUATION', payload: newEval });
    return { eval: newEval, isNew: true };
  }, [state.evaluations]);

  const addSemester = useCallback(async (form: NewSemesterForm) => {
    const semester = await insertSemester(form);
    dispatch({ type: 'ADD_SEMESTER', payload: semester });
  }, []);

  const updateSemester = useCallback(async (updated: Semester) => {
    await updateSemesterDb(updated);
    dispatch({ type: 'UPDATE_SEMESTER', payload: updated });
  }, []);

  const publishCampaign = useCallback(async (semesterId: string) => {
    const sem = state.semesters.find((s) => s.id === semesterId);
    if (!sem || sem.status !== 'draft') return;
    const updated = { ...sem, status: 'active' as const };
    await updateSemesterDb(updated);
    dispatch({ type: 'UPDATE_SEMESTER', payload: updated });
  }, [state.semesters]);

  const closeCampaign = useCallback(async (semesterId: string) => {
    const sem = state.semesters.find((s) => s.id === semesterId);
    if (!sem || sem.status !== 'active') return;
    const updated = { ...sem, status: 'closed' as const };
    await updateSemesterDb(updated);
    dispatch({ type: 'UPDATE_SEMESTER', payload: updated });
  }, [state.semesters]);

  const deleteSemester = useCallback(async (id: string) => {
    // CASCADE in DB handles evaluations + objectives automatically
    await deleteSemesterDb(id);
    dispatch({ type: 'REMOVE_SEMESTER', payload: id });
    dispatch({ type: 'REMOVE_EVALUATIONS_BY_SEMESTER', payload: id });
  }, []);

  const addObjective = useCallback(async (employeeId: string, semesterId: string) => {
    const { eval: evaluation } = await getOrCreateEval(employeeId, semesterId);

    // Auto-upgrade status from not_started
    if (!evaluation.validationStatus || evaluation.validationStatus === 'not_started') {
      await updateEvaluationDb(evaluation.id, { validationStatus: 'in_progress' });
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluation.id, changes: { validationStatus: 'in_progress' } } });
    }

    const objective = await insertObjectiveDb(evaluation.id, {
      title: '',
      description: '',
      status: OBJECTIVE_CONFIG.defaultStatus,
      progress: OBJECTIVE_CONFIG.defaultProgress,
      deadline: '',
      comments: '',
      evaluation: '',
    }, evaluation.objectives.length);

    dispatch({ type: 'ADD_OBJECTIVE', payload: { evalId: evaluation.id, objective } });
  }, [getOrCreateEval]);

  const addObjectiveWithData = useCallback(async (employeeId: string, semesterId: string, data: Partial<Objective>) => {
    const { eval: evaluation } = await getOrCreateEval(employeeId, semesterId);

    if (!evaluation.validationStatus || evaluation.validationStatus === 'not_started') {
      await updateEvaluationDb(evaluation.id, { validationStatus: 'in_progress' });
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluation.id, changes: { validationStatus: 'in_progress' } } });
    }

    const objective = await insertObjectiveDb(evaluation.id, {
      title: data.title || '',
      description: data.description || '',
      status: data.status || OBJECTIVE_CONFIG.defaultStatus,
      progress: data.progress ?? OBJECTIVE_CONFIG.defaultProgress,
      deadline: data.deadline || '',
      comments: data.comments || '',
      evaluation: data.evaluation || '',
    }, evaluation.objectives.length);

    dispatch({ type: 'ADD_OBJECTIVE', payload: { evalId: evaluation.id, objective } });
  }, [getOrCreateEval]);

  const addObjectiveFromTemplate = useCallback(async (templateId: string) => {
    const selectedEmployee = getSelectedEmployee?.();
    const selectedSemester = getSelectedSemester?.();
    const templates = getTemplates?.() || [];

    if (!selectedEmployee || !selectedSemester) return;

    const template = templates.find((t) => t.id === templateId);
    if (!template) return;

    const { eval: evaluation } = await getOrCreateEval(selectedEmployee.id, selectedSemester.id);

    if (!evaluation.validationStatus || evaluation.validationStatus === 'not_started') {
      await updateEvaluationDb(evaluation.id, { validationStatus: 'in_progress' });
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluation.id, changes: { validationStatus: 'in_progress' } } });
    }

    const objective = await insertObjectiveDb(evaluation.id, {
      title: template.title,
      description: template.description,
      status: OBJECTIVE_CONFIG.defaultStatus,
      progress: OBJECTIVE_CONFIG.defaultProgress,
      deadline: calculateDeadline(template.suggestedDeadlineDays),
      comments: '',
      evaluation: '',
    }, evaluation.objectives.length);

    dispatch({ type: 'ADD_OBJECTIVE', payload: { evalId: evaluation.id, objective } });
  }, [getOrCreateEval, getSelectedEmployee, getSelectedSemester, getTemplates]);

  const updateObjective = useCallback(async (
    evalId: string,
    objId: string,
    field: keyof Objective,
    value: string | number
  ) => {
    await updateObjectiveDb(objId, field, value);
    dispatch({ type: 'UPDATE_OBJECTIVE', payload: { evalId, objId, field, value } });
  }, []);

  const deleteObjective = useCallback(async (evalId: string, objId: string) => {
    await deleteObjectiveDb(objId);
    dispatch({ type: 'REMOVE_OBJECTIVE', payload: { evalId, objId } });
  }, []);

  const reorderObjectives = useCallback(async (evalId: string, fromIdx: number, toIdx: number) => {
    // Optimistic update
    dispatch({ type: 'REORDER_OBJECTIVES', payload: { evalId, fromIdx, toIdx } });

    // Compute new order and persist
    const evaluation = state.evaluations.find((e) => e.id === evalId);
    if (!evaluation) return;
    const objectives = [...evaluation.objectives];
    const [removed] = objectives.splice(fromIdx, 1);
    objectives.splice(toIdx, 0, removed);
    await reorderObjectivesDb(evalId, objectives.map((o) => o.id));
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
        title: o.title,
        description: o.description,
        status: OBJECTIVE_CONFIG.defaultStatus,
        progress: 0,
        deadline: o.deadline,
        comments: '',
        evaluation: '',
      }));

    const { eval: targetEval } = await getOrCreateEval(config.targetEmployeeId, config.targetSemesterId);

    const created = await insertObjectivesBatch(
      targetEval.id,
      selectedObjs,
      targetEval.objectives.length
    );

    dispatch({ type: 'ADD_OBJECTIVES', payload: { evalId: targetEval.id, objectives: created } });
  }, [state.evaluations, getOrCreateEval, getSelectedEmployee, getSelectedSemester]);

  const updateEvaluationStatus = useCallback(async (
    employeeId: string,
    semesterId: string,
    status: EvaluationStatus
  ) => {
    const { eval: evaluation, isNew } = await getOrCreateEval(employeeId, semesterId);
    if (!isNew) {
      await updateEvaluationDb(evaluation.id, { validationStatus: status });
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluation.id, changes: { validationStatus: status } } });
    } else {
      await updateEvaluationDb(evaluation.id, { validationStatus: status });
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluation.id, changes: { validationStatus: status } } });
    }
  }, [getOrCreateEval]);

  const submitEvaluation = useCallback(async (employeeId: string, semesterId: string) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );
    if (!existing || existing.validationStatus !== 'in_progress') return;

    await updateEvaluationDb(existing.id, { validationStatus: 'submitted' });
    dispatch({ type: 'UPDATE_EVALUATION', payload: { id: existing.id, changes: { validationStatus: 'submitted' } } });
  }, [state.evaluations]);

  const validateEvaluation = useCallback(async (employeeId: string, semesterId: string) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );
    if (!existing || existing.validationStatus !== 'submitted') return;

    await updateEvaluationDb(existing.id, { validationStatus: 'validated' });
    dispatch({ type: 'UPDATE_EVALUATION', payload: { id: existing.id, changes: { validationStatus: 'validated' } } });
  }, [state.evaluations]);

  const updateEvaluationBilan = useCallback(async (
    employeeId: string,
    semesterId: string,
    field: 'bilanManager' | 'bilanEmployee',
    value: string
  ) => {
    const { eval: evaluation } = await getOrCreateEval(employeeId, semesterId);
    await updateEvaluationDb(evaluation.id, { [field]: value } as Record<string, string>);
    dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluation.id, changes: { [field]: value } } });
  }, [getOrCreateEval]);

  const updateEvaluationRatings = useCallback(async (
    employeeId: string,
    semesterId: string,
    performanceRating: NineBoxRating,
    potentialRating: NineBoxRating
  ) => {
    const { eval: evaluation } = await getOrCreateEval(employeeId, semesterId);
    await updateEvaluationDb(evaluation.id, { performanceRating, potentialRating });
    dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluation.id, changes: { performanceRating, potentialRating } } });
  }, [getOrCreateEval]);

  const signEvaluation = useCallback(async (
    employeeId: string,
    semesterId: string,
    by: 'employee' | 'manager',
    signature: string,
    name: string
  ) => {
    const existing = state.evaluations.find(
      (e) => e.employeeId === employeeId && e.semesterId === semesterId
    );
    if (!existing) return;
    const now = new Date().toISOString();
    if (by === 'employee') {
      // Employees only hold SELECT on evaluations; sign via SECURITY DEFINER RPC.
      await signEvaluationAsEmployee(existing.id, signature, name);
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: existing.id, changes: { employeeSignedAt: now, employeeSignature: signature, employeeSignatureName: name } } });
    } else {
      const changes = { managerSignedAt: now, managerSignature: signature, managerSignatureName: name };
      await updateEvaluationDb(existing.id, changes);
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: existing.id, changes } });
    }
  }, [state.evaluations]);

  const remindEvaluation = useCallback(async (evaluationId: string) => {
    // Trace la relance (le compteur est incrémenté côté serveur). Sans effet
    // en base tant que le flag/migration ne sont pas actifs — l'e-mail de
    // relance (mailto) est déclenché séparément côté UI.
    const remindedAt = await markEvaluationReminded(evaluationId);
    if (remindedAt) {
      dispatch({ type: 'UPDATE_EVALUATION', payload: { id: evaluationId, changes: { lastReminderAt: remindedAt } } });
    }
  }, []);

  const value: SemesterContextType = {
    ...state,
    addSemester,
    updateSemester,
    deleteSemester,
    publishCampaign,
    closeCampaign,
    addObjective,
    addObjectiveWithData,
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
    signEvaluation,
    remindEvaluation,
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
