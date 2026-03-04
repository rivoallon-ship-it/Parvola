// ============================================
// Types principaux de l'application Talent Review
// ============================================

// ---------- Statuts ----------
export type ObjectiveStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type CampaignStatus = 'draft' | 'active' | 'closed';

export type EvaluationStatus = 'not_started' | 'in_progress' | 'submitted' | 'validated';

export type ViewType = 'semesters' | 'semester-team' | 'team' | 'templates' | 'evaluation' | 'nine-box' | 'my-evaluations';

// ---------- Utilisateurs & Rôles ----------
export type UserRole = 'rh' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  photo: string;
  role: UserRole;
  employeeId?: string;
  teamIds?: string[];
  establishmentId?: string;
}

export interface UserState {
  currentUser: User | null;
  isAuthLoading: boolean;
}

export interface UserActions {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export type UserContextType = UserState & UserActions;

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
  salary?: number;
  lateCount?: number;
  unjustifiedAbsences?: number;
  justifiedAbsences?: number;
}

export interface Semester {
  id: string;
  year: number;
  semester: 'S1' | 'S2';
  name: string;
  status: CampaignStatus;
  closingDeadline?: string;
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
  salary?: number;
  lateCount?: number;
  unjustifiedAbsences?: number;
  justifiedAbsences?: number;
}

export interface NewSemesterForm {
  year: number;
  semester: 'S1' | 'S2';
  closingDeadline?: string;
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

export interface InterviewGuide {
  discussionPoints: string;
  questions: string;
  semesterReview: string;
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

// ---------- Context Types par domaine ----------

// Navigation
export interface NavigationState {
  currentView: ViewType;
  selectedEmployee: Employee | null;
  selectedSemester: Semester | null;
  viewingSemester: Semester | null;
  searchTerm: string;
  isLoading: boolean;
}

export interface NavigationActions {
  setCurrentView: (view: ViewType) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedSemester: (semester: Semester | null) => void;
  setViewingSemester: (semester: Semester | null) => void;
  setSearchTerm: (term: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export type NavigationContextType = NavigationState & NavigationActions;

// Employees
export interface EmployeeState {
  employees: Employee[];
}

export interface EmployeeActions {
  addEmployee: (employee: NewEmployeeForm) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  importEmployees: (employees: Omit<Employee, 'id'>[], establishmentId?: string) => Promise<void>;
  setEmployees: (employees: Employee[]) => void;
}

export type EmployeeContextType = EmployeeState & EmployeeActions;

// Organization
export interface OrganizationState {
  establishments: Establishment[];
  teams: Team[];
}

export interface OrganizationActions {
  addEstablishment: (establishment: NewEstablishmentForm) => Promise<void>;
  updateEstablishment: (establishment: Establishment) => Promise<void>;
  deleteEstablishment: (id: string) => Promise<void>;
  addTeam: (team: NewTeamForm) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
}

export type OrganizationContextType = OrganizationState & OrganizationActions;

// Semesters & Evaluations
export interface SemesterState {
  semesters: Semester[];
  evaluations: Evaluation[];
}

export interface SemesterActions {
  addSemester: (semester: NewSemesterForm) => Promise<void>;
  updateSemester: (semester: Semester) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  publishCampaign: (semesterId: string) => Promise<void>;
  closeCampaign: (semesterId: string) => Promise<void>;
  addObjective: (employeeId: string, semesterId: string) => Promise<void>;
  addObjectiveWithData: (employeeId: string, semesterId: string, data: Partial<Objective>) => Promise<void>;
  addObjectiveFromTemplate: (templateId: string) => Promise<void>;
  updateObjective: (evalId: string, objId: string, field: keyof Objective, value: string | number) => Promise<void>;
  deleteObjective: (evalId: string, objId: string) => Promise<void>;
  reorderObjectives: (evalId: string, fromIdx: number, toIdx: number) => Promise<void>;
  duplicateObjectives: (config: DuplicateConfig) => Promise<void>;
  updateEvaluationStatus: (employeeId: string, semesterId: string, status: EvaluationStatus) => Promise<void>;
  submitEvaluation: (employeeId: string, semesterId: string) => Promise<void>;
  validateEvaluation: (employeeId: string, semesterId: string) => Promise<void>;
  updateEvaluationBilan: (employeeId: string, semesterId: string, field: 'bilanManager' | 'bilanEmployee', value: string) => Promise<void>;
  updateEvaluationRatings: (employeeId: string, semesterId: string, performanceRating: NineBoxRating, potentialRating: NineBoxRating) => Promise<void>;
  setEvaluations: (evaluations: Evaluation[]) => void;
}

export type SemesterContextType = SemesterState & SemesterActions;

// Templates & Positions
export interface TemplateState {
  positions: Position[];
  templates: ObjectiveTemplate[];
}

export interface TemplateActions {
  addPosition: (position: NewPositionForm) => Promise<void>;
  updatePosition: (position: Position) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
  addTemplate: (template: NewTemplateForm) => Promise<void>;
  updateTemplate: (template: ObjectiveTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export type TemplateContextType = TemplateState & TemplateActions;

// ---------- Combined (compat) ----------
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
  addEstablishment: (establishment: NewEstablishmentForm) => Promise<void>;
  updateEstablishment: (establishment: Establishment) => Promise<void>;
  deleteEstablishment: (id: string) => Promise<void>;
  addTeam: (team: NewTeamForm) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addEmployee: (employee: NewEmployeeForm) => Promise<void>;
  updateEmployee: (employee: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  importEmployees: (employees: Omit<Employee, 'id'>[], establishmentId?: string) => Promise<void>;
  addSemester: (semester: NewSemesterForm) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  addObjective: (employeeId: string, semesterId: string) => Promise<void>;
  addObjectiveWithData: (employeeId: string, semesterId: string, data: Partial<Objective>) => Promise<void>;
  addObjectiveFromTemplate: (templateId: string) => Promise<void>;
  updateObjective: (evalId: string, objId: string, field: keyof Objective, value: string | number) => Promise<void>;
  deleteObjective: (evalId: string, objId: string) => Promise<void>;
  reorderObjectives: (evalId: string, fromIdx: number, toIdx: number) => Promise<void>;
  duplicateObjectives: (config: DuplicateConfig) => Promise<void>;
  updateEvaluationStatus: (employeeId: string, semesterId: string, status: EvaluationStatus) => Promise<void>;
  updateEvaluationBilan: (employeeId: string, semesterId: string, field: 'bilanManager' | 'bilanEmployee', value: string) => Promise<void>;
  updateEvaluationRatings: (employeeId: string, semesterId: string, performanceRating: NineBoxRating, potentialRating: NineBoxRating) => Promise<void>;
  addPosition: (position: NewPositionForm) => Promise<void>;
  updatePosition: (position: Position) => Promise<void>;
  deletePosition: (id: string) => Promise<void>;
  addTemplate: (template: NewTemplateForm) => Promise<void>;
  updateTemplate: (template: ObjectiveTemplate) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setCurrentView: (view: ViewType) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedSemester: (semester: Semester | null) => void;
  setViewingSemester: (semester: Semester | null) => void;
  setSearchTerm: (term: string) => void;
  refreshData: () => Promise<void>;
}

export type AppContextType = AppState & AppActions;
