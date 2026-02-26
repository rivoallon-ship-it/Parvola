import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type {
  AppState,
  AppContextType,
  Employee,
  Semester,
  Evaluation,
  EvaluationStatus,
  Position,
  ObjectiveTemplate,
  Establishment,
  Team,
  ViewType,
  NewEmployeeForm,
  NewSemesterForm,
  NewPositionForm,
  NewTemplateForm,
  NewEstablishmentForm,
  NewTeamForm,
  DuplicateConfig,
  Objective,
  NineBoxRating,
} from '@/types';
import { storage } from '@/services/storage';
import { generateId, calculateDeadline } from '@/utils/helpers';
import { OBJECTIVE_CONFIG } from '@/constants/config';

// ============================================
// Context de l'application Talent Review
// ============================================

// ---------- Initial State ----------
const initialState: AppState = {
  employees: [],
  semesters: [],
  evaluations: [],
  positions: [],
  templates: [],
  establishments: [],
  teams: [],
  currentView: 'semesters',
  selectedEmployee: null,
  selectedSemester: null,
  viewingSemester: null,
  searchTerm: '',
  isLoading: true,
};

// ---------- Action Types ----------
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: Partial<AppState> }
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'SET_SEMESTERS'; payload: Semester[] }
  | { type: 'SET_EVALUATIONS'; payload: Evaluation[] }
  | { type: 'SET_POSITIONS'; payload: Position[] }
  | { type: 'SET_TEMPLATES'; payload: ObjectiveTemplate[] }
  | { type: 'SET_ESTABLISHMENTS'; payload: Establishment[] }
  | { type: 'SET_TEAMS'; payload: Team[] }
  | { type: 'SET_CURRENT_VIEW'; payload: ViewType }
  | { type: 'SET_SELECTED_EMPLOYEE'; payload: Employee | null }
  | { type: 'SET_SELECTED_SEMESTER'; payload: Semester | null }
  | { type: 'SET_VIEWING_SEMESTER'; payload: Semester | null }
  | { type: 'SET_SEARCH_TERM'; payload: string };

// ---------- Reducer ----------
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_DATA':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'SET_SEMESTERS':
      return { ...state, semesters: action.payload };
    case 'SET_EVALUATIONS':
      return { ...state, evaluations: action.payload };
    case 'SET_POSITIONS':
      return { ...state, positions: action.payload };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'SET_ESTABLISHMENTS':
      return { ...state, establishments: action.payload };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
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
    default:
      return state;
  }
};

// ---------- Context ----------
const AppContext = createContext<AppContextType | null>(null);

// ---------- Provider ----------
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await storage.loadAll();
      dispatch({ type: 'SET_DATA', payload: data });
    };
    loadData();
  }, []);

  // ---------- Employee Actions ----------
  const addEmployee = useCallback(async (form: NewEmployeeForm) => {
    const employee: Employee = {
      id: generateId(),
      name: form.name,
      position: form.position,
      photo: form.photo || '👤',
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
    const newEvaluations = state.evaluations.filter((e) => e.employeeId !== id);
    await Promise.all([
      storage.setEmployees(newEmployees),
      storage.setEvaluations(newEvaluations),
    ]);
    dispatch({ type: 'SET_EMPLOYEES', payload: newEmployees });
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.employees, state.evaluations]);

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

  // ---------- Semester Actions ----------
  const addSemester = useCallback(async (form: NewSemesterForm) => {
    const semester: Semester = {
      id: generateId(),
      year: form.year,
      semester: form.semester,
      name: `${form.semester} ${form.year}`,
    };
    const newSemesters = [...state.semesters, semester];
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

  // ---------- Objective Actions ----------
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
        e.id === existing.id ? { ...e, objectives: [...e.objectives, objective] } : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId,
        semesterId,
        objectives: [objective],
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations]);

  const addObjectiveFromTemplate = useCallback(async (templateId: string) => {
    if (!state.selectedEmployee || !state.selectedSemester) return;

    const template = state.templates.find((t) => t.id === templateId);
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
      (e) =>
        e.employeeId === state.selectedEmployee!.id &&
        e.semesterId === state.selectedSemester!.id
    );

    let newEvaluations: Evaluation[];
    if (existing) {
      newEvaluations = state.evaluations.map((e) =>
        e.id === existing.id ? { ...e, objectives: [...e.objectives, objective] } : e
      );
    } else {
      const newEval: Evaluation = {
        id: generateId(),
        employeeId: state.selectedEmployee!.id,
        semesterId: state.selectedSemester!.id,
        objectives: [objective],
      };
      newEvaluations = [...state.evaluations, newEval];
    }

    await storage.setEvaluations(newEvaluations);
    dispatch({ type: 'SET_EVALUATIONS', payload: newEvaluations });
  }, [state.evaluations, state.selectedEmployee, state.selectedSemester, state.templates]);

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
    const currentEval = state.evaluations.find(
      (e) =>
        e.employeeId === state.selectedEmployee?.id &&
        e.semesterId === state.selectedSemester?.id
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
  }, [state.evaluations, state.selectedEmployee, state.selectedSemester]);

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

  // ---------- Position Actions ----------
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

  // ---------- Template Actions ----------
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

  // ---------- Establishment Actions ----------
  const addEstablishment = useCallback(async (form: NewEstablishmentForm) => {
    const establishment: Establishment = {
      id: generateId(),
      name: form.name,
      description: form.description || '',
    };
    const newEstablishments = [...state.establishments, establishment];
    await storage.setEstablishments(newEstablishments);
    dispatch({ type: 'SET_ESTABLISHMENTS', payload: newEstablishments });
  }, [state.establishments]);

  const updateEstablishment = useCallback(async (establishment: Establishment) => {
    const newEstablishments = state.establishments.map((e) =>
      e.id === establishment.id ? establishment : e
    );
    await storage.setEstablishments(newEstablishments);
    dispatch({ type: 'SET_ESTABLISHMENTS', payload: newEstablishments });
  }, [state.establishments]);

  const deleteEstablishment = useCallback(async (id: string) => {
    const newEstablishments = state.establishments.filter((e) => e.id !== id);
    // Supprimer aussi les équipes liées à cet établissement
    const newTeams = state.teams.filter((t) => t.establishmentId !== id);
    // Réinitialiser teamId des employés des équipes supprimées
    const deletedTeamIds = state.teams
      .filter((t) => t.establishmentId === id)
      .map((t) => t.id);
    const newEmployees = state.employees.map((emp) =>
      emp.teamId && deletedTeamIds.includes(emp.teamId)
        ? { ...emp, teamId: undefined }
        : emp
    );
    await Promise.all([
      storage.setEstablishments(newEstablishments),
      storage.setTeams(newTeams),
      storage.setEmployees(newEmployees),
    ]);
    dispatch({ type: 'SET_ESTABLISHMENTS', payload: newEstablishments });
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
    dispatch({ type: 'SET_EMPLOYEES', payload: newEmployees });
  }, [state.establishments, state.teams, state.employees]);

  // ---------- Team Actions ----------
  const addTeam = useCallback(async (form: NewTeamForm) => {
    const team: Team = {
      id: generateId(),
      establishmentId: form.establishmentId,
      name: form.name,
      description: form.description || '',
    };
    const newTeams = [...state.teams, team];
    await storage.setTeams(newTeams);
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
  }, [state.teams]);

  const updateTeam = useCallback(async (team: Team) => {
    const newTeams = state.teams.map((t) => (t.id === team.id ? team : t));
    await storage.setTeams(newTeams);
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
  }, [state.teams]);

  const deleteTeam = useCallback(async (id: string) => {
    const newTeams = state.teams.filter((t) => t.id !== id);
    // Réinitialiser teamId des employés de cette équipe
    const newEmployees = state.employees.map((emp) =>
      emp.teamId === id ? { ...emp, teamId: undefined } : emp
    );
    await Promise.all([
      storage.setTeams(newTeams),
      storage.setEmployees(newEmployees),
    ]);
    dispatch({ type: 'SET_TEAMS', payload: newTeams });
    dispatch({ type: 'SET_EMPLOYEES', payload: newEmployees });
  }, [state.teams, state.employees]);

  // ---------- Navigation Actions ----------
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

  // ---------- Refresh Data ----------
  const refreshData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const data = await storage.loadAll();
    dispatch({ type: 'SET_DATA', payload: data });
  }, []);

  // ---------- Context Value ----------
  const value: AppContextType = {
    ...state,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    importEmployees,
    addSemester,
    deleteSemester,
    addObjective,
    addObjectiveFromTemplate,
    updateObjective,
    deleteObjective,
    reorderObjectives,
    duplicateObjectives,
    updateEvaluationStatus,
    updateEvaluationBilan,
    updateEvaluationRatings,
    addPosition,
    updatePosition,
    deletePosition,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    addEstablishment,
    updateEstablishment,
    deleteEstablishment,
    addTeam,
    updateTeam,
    deleteTeam,
    setCurrentView,
    setSelectedEmployee,
    setSelectedSemester,
    setViewingSemester,
    setSearchTerm,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// ---------- Hook ----------
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
