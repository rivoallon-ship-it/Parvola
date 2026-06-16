// ============================================
// Types principaux de l'application Talent Review
// ============================================

// ---------- Statuts ----------
export type ObjectiveStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export type CampaignStatus = 'draft' | 'active' | 'closed';

export type EvaluationStatus = 'not_started' | 'in_progress' | 'submitted' | 'validated';

export type ProfessionalCampaignStatus = 'draft' | 'active' | 'closed';

export type ProfessionalInterviewStatus = 'scheduled' | 'in_progress' | 'completed';

export type MobilityWish = 'none' | 'internal' | 'external' | 'geographic';

export type ViewType = 'semesters' | 'semester-team' | 'team' | 'templates' | 'evaluation' | 'nine-box' | 'my-evaluations' | 'settings' | 'professional-campaigns' | 'professional-team' | 'professional-interview' | 'my-professional-interviews';

// ---------- Utilisateurs & Rôles ----------
export type UserRole = 'admin' | 'rh' | 'directeur' | 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  photo: string;
  role: UserRole;
  companyId: string;
  employeeId?: string;
  teamIds?: string[];
  establishmentId?: string;
  establishmentIds?: string[];
}

export interface UserState {
  currentUser: User | null;
  isAuthLoading: boolean;
}

export interface CompanySignupForm {
  companyName: string;
  slug: string;
  email: string;
  password: string;
  userName: string;
}

export interface AiPrompts {
  objectivesContext?: string;
  templatesContext?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  logo: string;
  aiPrompts?: AiPrompts;
}

export interface CompanyMember {
  id: string;
  name: string;
  photo: string;
  role: UserRole;
  employeeId?: string;
  isOwner: boolean;
  createdAt: string;
}

export interface UserActions {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (form: CompanySignupForm) => Promise<{ companyId: string; userId: string }>;
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
  email?: string;
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
  employeeSignedAt?: string;
  managerSignedAt?: string;
  employeeSignature?: string;
  employeeSignatureName?: string;
  managerSignature?: string;
  managerSignatureName?: string;
}

export interface Position {
  id: string;
  name: string;
  description: string;
  role: UserRole;
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
  email?: string;
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
  role: UserRole;
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

// ---------- IA Review ----------
export type AIReviewSeverity = 'info' | 'warning' | 'critical';

export interface AIReviewCorrection {
  original: string;
  suggested: string;
  reason: string;
}

export interface AIReviewAlert {
  severity: AIReviewSeverity;
  excerpt: string;
  issue: string;
  suggestion: string;
  legalBasis: string;
}

export interface AIReviewFieldResult {
  fieldId: string;
  fieldLabel: string;
  corrections: AIReviewCorrection[];
  suggestions: string[];
  legalAlerts: AIReviewAlert[];
}

export interface AIReviewResult {
  fields: AIReviewFieldResult[];
  summary: { totalCorrections: number; totalSuggestions: number; criticalAlerts: number };
}

// ---------- Entretien Professionnel ----------
export interface ProfessionalCampaign {
  id: string;
  year: number;
  name: string;
  status: ProfessionalCampaignStatus;
  scheduledFrom?: string;
  scheduledTo?: string;
  closingDeadline?: string;
}

export interface ProfessionalInterview {
  id: string;
  campaignId: string;
  employeeId: string;
  status: ProfessionalInterviewStatus;
  scheduledAt?: string;
  conductedAt?: string;
  careerReview: string;
  skillsAcquired: string;
  evolutionMobility: MobilityWish;
  evolutionNotes: string;
  trainingWishes: string;
  conclusions: string;
  employeeComment: string;
  managerComment: string;
  employeeSignedAt?: string;
  managerSignedAt?: string;
  employeeSignature?: string;
  employeeSignatureName?: string;
  managerSignature?: string;
  managerSignatureName?: string;
}

export interface NewProfessionalCampaignForm {
  year: number;
  name?: string;
  scheduledFrom?: string;
  scheduledTo?: string;
  closingDeadline?: string;
}

// ---------- Storage ----------
export type StorageKey = 'employees' | 'semesters' | 'evaluations' | 'positions' | 'templates' | 'establishments' | 'teams' | 'professionalCampaigns' | 'professionalInterviews';

export interface StorageData {
  employees: Employee[];
  semesters: Semester[];
  evaluations: Evaluation[];
  positions: Position[];
  templates: ObjectiveTemplate[];
  establishments: Establishment[];
  teams: Team[];
  professionalCampaigns: ProfessionalCampaign[];
  professionalInterviews: ProfessionalInterview[];
}

// ---------- Context Types par domaine ----------

// Navigation
export interface NavigationState {
  currentView: ViewType;
  selectedEmployee: Employee | null;
  selectedSemester: Semester | null;
  viewingSemester: Semester | null;
  viewingProfessionalCampaign: ProfessionalCampaign | null;
  viewingProfessionalInterview: ProfessionalInterview | null;
  searchTerm: string;
  isLoading: boolean;
}

export interface NavigationActions {
  setCurrentView: (view: ViewType) => void;
  setSelectedEmployee: (employee: Employee | null) => void;
  setSelectedSemester: (semester: Semester | null) => void;
  setViewingSemester: (semester: Semester | null) => void;
  setViewingProfessionalCampaign: (campaign: ProfessionalCampaign | null) => void;
  setViewingProfessionalInterview: (interview: ProfessionalInterview | null) => void;
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
  importEmployees: (employees: Omit<Employee, 'id'>[], establishmentId?: string) => Promise<Employee[]>;
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
  signEvaluation: (employeeId: string, semesterId: string, by: 'employee' | 'manager', signature: string, name: string) => Promise<void>;
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

// Professional Interviews
export interface ProfessionalInterviewState {
  professionalCampaigns: ProfessionalCampaign[];
  professionalInterviews: ProfessionalInterview[];
}

export interface ProfessionalInterviewActions {
  addProfessionalCampaign: (form: NewProfessionalCampaignForm) => Promise<void>;
  updateProfessionalCampaign: (campaign: ProfessionalCampaign) => Promise<void>;
  deleteProfessionalCampaign: (id: string) => Promise<void>;
  publishProfessionalCampaign: (id: string) => Promise<void>;
  closeProfessionalCampaign: (id: string) => Promise<void>;
  addProfessionalInterview: (campaignId: string, employeeId: string) => Promise<ProfessionalInterview>;
  updateProfessionalInterview: (id: string, fields: Partial<ProfessionalInterview>) => Promise<void>;
  deleteProfessionalInterview: (id: string) => Promise<void>;
  signProfessionalInterview: (id: string, by: 'employee' | 'manager', signature: string, name: string) => Promise<void>;
}

export type ProfessionalInterviewContextType = ProfessionalInterviewState & ProfessionalInterviewActions;

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
  importEmployees: (employees: Omit<Employee, 'id'>[], establishmentId?: string) => Promise<Employee[]>;
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

// ---------- Toasts ----------
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}
