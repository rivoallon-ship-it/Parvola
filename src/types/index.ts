// ============================================
// Types principaux de l'application Talent Review
// ============================================

// ---------- Statuts ----------
export type ObjectiveStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type EvaluationStatus = 'in_progress' | 'validated';

export type ViewType = 'semesters' | 'semester-team' | 'team' | 'templates' | 'evaluation' | 'nine-box';

// ---------- 9-Box ----------
export type NineBoxRating = 1 | 2 | 3;

// ---------- Organisation ----------
export interface Establishment {
  id: string;
  name: string;
  description: string;
}

export interface Team {
  id: string;
  establishmentId: string;
  name: string;
  description: string;
}

// ---------- Entités ----------
export interface Employee {
  id: string;
  name: string;
  position: string;
  photo: string;
  establishmentId?: string;
  teamId?: string;
}

export interface Semester {
  id: string;
  year: number;
  semester: 'S1' | 'S2';
  name: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  status: ObjectiveStatus;
  progress: number;
  deadline: string;
  comments: string;
  evaluation: string;
}

export interface Evaluation {
  id: string;
  employeeId: string;
  semesterId: string;
  objectives: Objective[];
  validationStatus?: EvaluationStatus;
  bilanManager?: string;
  bilanEmployee?: string;
  performanceRating?: NineBoxRating;
  potentialRating?: NineBoxRating;
}

export interface Position {
  id: string;
  name: string;
  description: string;
}

export interface ObjectiveTemplate {
  id: string;
  positionId: string;
  title: string;
  description: string;
  suggestedDeadlineDays: number;
}

// ---------- Formulaires ----------
export interface NewEstablishmentForm {
  name: string;
  description: string;
}

export interface NewTeamForm {
  establishmentId: string;
  name: string;
  description: string;
}

export interface NewEmployeeForm {
  name: string;
  position: string;
  photo: string;
  establishmentId?: string;
  teamId?: string;
}

export interface NewSemesterForm {
  year: number;
  semester: 'S1' | 'S2';
}

export interface NewPositionForm {
  name: string;
  description: string;
}

export interface NewTemplateForm {
  positionId: string;
  title: string;
  description: string;
  suggestedDeadlineDays: number;
}

export interface DuplicateConfig {
  targetEmployeeId: string;
  targetSemesterId: string;
  selectedObjectives: string[];
}

// ---------- Dialogues ----------
export interface ConfirmDialog {
  show: boolean;
  message: string;
  onConfirm: (() => void) | null;
}

// ---------- IA ----------
export interface AISuggestedObjective {
  title: string;
  description: string;
  deadline?: string;
}

export interface AISuggestedTemplate {
  title: string;
  description: string;
  suggestedDeadlineDays?: number;
}

// ---------- Storage ----------
export type StorageKey = 'employees' | 'semesters' | 'evaluations' | 'positions' | 'templates' | 'establishments' | 'teams';

export interface StorageData {
  employees: Employee[];
  semesters: Semester[];
  evaluations: Evaluation[];
  positions: Position[];
  templates: ObjectiveTemplate[];
  establishments: Establishment[];
  teams: Team[];
}

// ---------- Context State ----------
export interface AppState {
  employees: Employee[];
  semesters: Semester[];
  evaluations: Evaluation[];
  positions: Position[];
  templates: ObjectiveTemplate[];
  establishments: Establishment[];
  teams: Team[];
  currentView: ViewType;
  selectedEmployee: Employee | null;
  selectedSemester: Semester | null;
  viewingSemester: Semester | null;
  searchTerm: string;
  isLoading: boolean;
}

export interface AppActions {
  // Establishments
  addEstablishment: (establishment: NewEstablishmentForm) => Promise<void>;
  updateEstablishment: (establishment: Establishment) => Promise<void>;
  deleteEstablishment: (id: string) => Promise<void>;

  // Teams
  addTeam: (team: NewTeamForm) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;

  // Employees
  addEmployee: (employee: NewEmployeeForm) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  importEmployees: (employees: Omit<Employee, 'id'>[], establishmentId?: string) => Promise<void>;

  // Semesters
  addSemester: (semester: NewSemesterForm) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;

  // Evaluations & Objectives
  addObjective: (employeeId: string, semesterId: string) => Promise<void>;
  addObjectiveFromTemplate: (templateId: string) => Promise<void>;
  updateObjective: (evalId: string, objId: string, field: keyof Objective, value: string | number) => Promise<void>;
  deleteObjective: (evalId: string, objId: string) => Promise<void>;
  reorderObjectives: (evalId: string, fromIdx: number, toIdx: number) => Promise<void>;
  duplicateObjectives: (config: DuplicateConfig) => Promise<void>;
  updateEvaluationStatus: (employeeId: string, semesterId: string, status: EvaluationStatus) => Promise<void>;
  updateEvaluationBilan: (employeeId: string, semesterId: string, field: 'bilanManager' | 'bilanEmployee', value: string) => Promise<void>;
  updateEvaluationRatings: (employeeId: string, semesterId: string, performanceRating: NineBoxRating, potentialRating: NineBoxRating) => Promise<void>;

  // Positions
  addPosition: (position: NewPositionForm) => Promise<void>;
  updatePosition: (position: Position) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;

  // Templates
  addTemplate: (template: NewTemplateForm) => Promise<void>;
  updateTemplate: (template: ObjectiveTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Navigation
  setCurrentView: (view: ViewType) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedSemester: (semester: Semester | null) => void;
  setViewingSemester: (semester: Semester | null) => void;
  setSearchTerm: (term: string) => void;

  // Data
  refreshData: () => Promise<void>;
}

export type AppContextType = AppState & AppActions;
