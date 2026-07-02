// ============================================
// Types de la base de données Supabase (snake_case)
// Générés manuellement depuis 001_initial_schema.sql
// ============================================

export type DbUserRole = 'admin' | 'rh' | 'directeur' | 'manager' | 'employee';
export type DbCampaignStatus = 'draft' | 'active' | 'closed';
export type DbEvaluationStatus = 'not_started' | 'in_progress' | 'submitted' | 'validated';
export type DbObjectiveStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';
export type DbProfessionalCampaignStatus = 'draft' | 'active' | 'closed';
export type DbProfessionalInterviewStatus = 'scheduled' | 'in_progress' | 'completed';
export type DbProfessionalMobilityWish = 'none' | 'internal' | 'external' | 'geographic';

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
  role: DbUserRole;
  created_at: string;
  updated_at: string;
}

export interface DbEmployee {
  id: string;
  name: string;
  position: string;
  photo: string;
  email: string | null;
  establishment_id: string | null;
  team_id: string | null;
  salary: number | null;
  late_count: number;
  unjustified_absences: number;
  justified_absences: number;
  // Lot B — nécessite la migration 013 ; absent en attendant
  hire_date?: string | null;
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
  employee_signed_at: string | null;
  manager_signed_at: string | null;
  employee_signature: string | null;
  employee_signature_name: string | null;
  manager_signature: string | null;
  manager_signature_name: string | null;
  // Lot C — nécessite la migration 014 ; absents en attendant
  last_reminder_at?: string | null;
  reminder_count?: number | null;
  validated_by?: string | null;
  validated_at?: string | null;
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
  company_id: string;
  employee_id: string | null;
  team_ids: string[];
  establishment_id: string | null;
  establishment_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface DbCompany {
  id: string;
  name: string;
  slug: string;
  owner_id: string | null;
  logo: string;
  ai_prompts: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfessionalCampaign {
  id: string;
  company_id: string;
  year: number;
  name: string;
  status: DbProfessionalCampaignStatus;
  scheduled_from: string | null;
  scheduled_to: string | null;
  closing_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfessionalInterview {
  id: string;
  company_id: string;
  campaign_id: string;
  employee_id: string;
  status: DbProfessionalInterviewStatus;
  scheduled_at: string | null;
  conducted_at: string | null;
  career_review: string;
  skills_acquired: string;
  evolution_mobility: DbProfessionalMobilityWish;
  evolution_notes: string;
  training_wishes: string;
  conclusions: string;
  employee_comment: string;
  manager_comment: string;
  employee_signed_at: string | null;
  manager_signed_at: string | null;
  employee_signature: string | null;
  employee_signature_name: string | null;
  manager_signature: string | null;
  manager_signature_name: string | null;
  // Lot A — preuve, remise & audit (migration 012 ; nullable en attendant)
  signed_snapshot?: Record<string, unknown> | null;
  delivered_at?: string | null;
  delivered_by?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}
