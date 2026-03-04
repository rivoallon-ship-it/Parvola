// ============================================
// Types de la base de données Supabase (snake_case)
// Générés manuellement depuis 001_initial_schema.sql
// ============================================

export type DbUserRole = 'rh' | 'manager' | 'employee';
export type DbCampaignStatus = 'draft' | 'active' | 'closed';
export type DbEvaluationStatus = 'not_started' | 'in_progress' | 'submitted' | 'validated';
export type DbObjectiveStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

export interface DbEstablishment {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DbTeam {
  id: string;
  establishment_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DbPosition {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DbEmployee {
  id: string;
  name: string;
  position: string;
  photo: string;
  establishment_id: string | null;
  team_id: string | null;
  salary: number | null;
  late_count: number;
  unjustified_absences: number;
  justified_absences: number;
  created_at: string;
  updated_at: string;
}

export interface DbObjectiveTemplate {
  id: string;
  position_id: string;
  title: string;
  description: string;
  suggested_deadline_days: number;
  created_at: string;
  updated_at: string;
}

export interface DbSemester {
  id: string;
  year: number;
  semester: string;
  name: string;
  status: DbCampaignStatus;
  closing_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEvaluation {
  id: string;
  employee_id: string;
  semester_id: string;
  validation_status: DbEvaluationStatus;
  bilan_manager: string | null;
  bilan_employee: string | null;
  performance_rating: number | null;
  potential_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbObjective {
  id: string;
  evaluation_id: string;
  title: string;
  description: string;
  status: DbObjectiveStatus;
  progress: number;
  deadline: string | null;
  comments: string;
  evaluation_note: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  name: string;
  photo: string;
  role: DbUserRole;
  employee_id: string | null;
  team_ids: string[];
  establishment_id: string | null;
  created_at: string;
  updated_at: string;
}
