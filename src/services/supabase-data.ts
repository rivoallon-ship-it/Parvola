import { supabase } from '@/lib/supabase';
import type {
  Establishment,
  Team,
  Employee,
  Position,
  ObjectiveTemplate,
  Semester,
  Evaluation,
  Objective,
  NewEstablishmentForm,
  NewTeamForm,
  NewEmployeeForm,
  NewPositionForm,
  NewTemplateForm,
  NewSemesterForm,
  NineBoxRating,
  EvaluationStatus,
  ObjectiveStatus,
  CampaignStatus,
  ProfessionalCampaign,
  ProfessionalCampaignStatus,
  ProfessionalInterview,
  ProfessionalInterviewStatus,
  MobilityWish,
  NewProfessionalCampaignForm,
} from '@/types';
import type {
  DbEstablishment,
  DbTeam,
  DbEmployee,
  DbPosition,
  DbObjectiveTemplate,
  DbSemester,
  DbEvaluation,
  DbObjective,
  DbProfessionalCampaign,
  DbProfessionalInterview,
} from '@/lib/database.types';

// ============================================
// Helpers — snake_case ↔ camelCase mapping
// ============================================

function throwIfError<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (result.error) throw new Error(result.error.message);
  if (result.data == null) throw new Error('No data returned');
  return result.data as NonNullable<T>;
}

function throwIfMutationError(result: { error: { message: string } | null }): void {
  if (result.error) throw new Error(result.error.message);
}

// ---------- Establishments ----------

const mapEstablishment = (row: DbEstablishment): Establishment => ({
  id: row.id,
  name: row.name,
  description: row.description,
});

export async function fetchEstablishments(): Promise<Establishment[]> {
  const data = throwIfError(await supabase.from('establishments').select('*').order('name'));
  return data.map(mapEstablishment);
}

export async function insertEstablishment(form: NewEstablishmentForm): Promise<Establishment> {
  const data = throwIfError(
    await supabase.from('establishments').insert({ name: form.name, description: form.description || '' }).select().single()
  );
  return mapEstablishment(data);
}

export async function updateEstablishmentDb(est: Establishment): Promise<void> {
  throwIfMutationError(
    await supabase.from('establishments').update({ name: est.name, description: est.description }).eq('id', est.id)
  );
}

export async function deleteEstablishmentDb(id: string): Promise<void> {
  throwIfMutationError(await supabase.from('establishments').delete().eq('id', id));
}

// ---------- Teams ----------

const mapTeam = (row: DbTeam): Team => ({
  id: row.id,
  establishmentId: row.establishment_id,
  name: row.name,
  description: row.description,
});

export async function fetchTeams(): Promise<Team[]> {
  const data = throwIfError(await supabase.from('teams').select('*').order('name'));
  return data.map(mapTeam);
}

export async function insertTeam(form: NewTeamForm): Promise<Team> {
  const data = throwIfError(
    await supabase.from('teams').insert({
      establishment_id: form.establishmentId,
      name: form.name,
      description: form.description || '',
    }).select().single()
  );
  return mapTeam(data);
}

export async function updateTeamDb(team: Team): Promise<void> {
  throwIfMutationError(
    await supabase.from('teams').update({
      establishment_id: team.establishmentId,
      name: team.name,
      description: team.description,
    }).eq('id', team.id)
  );
}

export async function deleteTeamDb(id: string): Promise<void> {
  throwIfMutationError(await supabase.from('teams').delete().eq('id', id));
}

// ---------- Employees ----------

const mapEmployee = (row: DbEmployee): Employee => ({
  id: row.id,
  name: row.name,
  position: row.position,
  photo: row.photo,
  email: row.email || undefined,
  establishmentId: row.establishment_id || undefined,
  teamId: row.team_id || undefined,
  salary: row.salary || undefined,
  lateCount: row.late_count,
  unjustifiedAbsences: row.unjustified_absences,
  justifiedAbsences: row.justified_absences,
});

export async function fetchEmployees(): Promise<Employee[]> {
  const data = throwIfError(await supabase.from('employees').select('*').order('name'));
  return data.map(mapEmployee);
}

export async function insertEmployee(form: NewEmployeeForm): Promise<Employee> {
  const data = throwIfError(
    await supabase.from('employees').insert({
      name: form.name,
      position: form.position,
      photo: form.photo || '👤',
      email: form.email || null,
      establishment_id: form.establishmentId || null,
      team_id: form.teamId || null,
      salary: form.salary || null,
      late_count: form.lateCount || 0,
      unjustified_absences: form.unjustifiedAbsences || 0,
      justified_absences: form.justifiedAbsences || 0,
    }).select().single()
  );
  return mapEmployee(data);
}

export async function insertEmployees(forms: Omit<Employee, 'id'>[], establishmentId?: string): Promise<Employee[]> {
  const rows = forms.map((f) => ({
    name: f.name,
    position: f.position,
    photo: f.photo || '👤',
    email: f.email || null,
    establishment_id: establishmentId || f.establishmentId || null,
    team_id: f.teamId || null,
    salary: f.salary || null,
    late_count: f.lateCount || 0,
    unjustified_absences: f.unjustifiedAbsences || 0,
    justified_absences: f.justifiedAbsences || 0,
  }));
  const data = throwIfError(await supabase.from('employees').insert(rows).select());
  return data.map(mapEmployee);
}

export async function updateEmployeeDb(emp: Employee): Promise<void> {
  throwIfMutationError(
    await supabase.from('employees').update({
      name: emp.name,
      position: emp.position,
      photo: emp.photo,
      email: emp.email || null,
      establishment_id: emp.establishmentId || null,
      team_id: emp.teamId || null,
      salary: emp.salary || null,
      late_count: emp.lateCount || 0,
      unjustified_absences: emp.unjustifiedAbsences || 0,
      justified_absences: emp.justifiedAbsences || 0,
    }).eq('id', emp.id)
  );
}

export async function deleteEmployeeDb(id: string): Promise<void> {
  throwIfMutationError(await supabase.from('employees').delete().eq('id', id));
}

// ---------- Positions ----------

const mapPosition = (row: DbPosition): Position => ({
  id: row.id,
  name: row.name,
  description: row.description,
  role: row.role,
});

export async function fetchPositions(): Promise<Position[]> {
  const data = throwIfError(await supabase.from('positions').select('*').order('name'));
  return data.map(mapPosition);
}

export async function insertPosition(form: NewPositionForm): Promise<Position> {
  const data = throwIfError(
    await supabase.from('positions').insert({ name: form.name, description: form.description || '', role: form.role }).select().single()
  );
  return mapPosition(data);
}

export async function updatePositionDb(pos: Position): Promise<void> {
  throwIfMutationError(
    await supabase.from('positions').update({ name: pos.name, description: pos.description, role: pos.role }).eq('id', pos.id)
  );
}

export async function deletePositionDb(id: string): Promise<void> {
  throwIfMutationError(await supabase.from('positions').delete().eq('id', id));
}

// ---------- Objective Templates ----------

const mapTemplate = (row: DbObjectiveTemplate): ObjectiveTemplate => ({
  id: row.id,
  positionId: row.position_id,
  title: row.title,
  description: row.description,
  suggestedDeadlineDays: row.suggested_deadline_days,
});

export async function fetchTemplates(): Promise<ObjectiveTemplate[]> {
  const data = throwIfError(await supabase.from('objective_templates').select('*').order('title'));
  return data.map(mapTemplate);
}

export async function insertTemplate(form: NewTemplateForm): Promise<ObjectiveTemplate> {
  const data = throwIfError(
    await supabase.from('objective_templates').insert({
      position_id: form.positionId,
      title: form.title,
      description: form.description || '',
      suggested_deadline_days: form.suggestedDeadlineDays,
    }).select().single()
  );
  return mapTemplate(data);
}

export async function updateTemplateDb(tmpl: ObjectiveTemplate): Promise<void> {
  throwIfMutationError(
    await supabase.from('objective_templates').update({
      position_id: tmpl.positionId,
      title: tmpl.title,
      description: tmpl.description,
      suggested_deadline_days: tmpl.suggestedDeadlineDays,
    }).eq('id', tmpl.id)
  );
}

export async function deleteTemplateDb(id: string): Promise<void> {
  throwIfMutationError(await supabase.from('objective_templates').delete().eq('id', id));
}

// ---------- Semesters ----------

const mapSemester = (row: DbSemester): Semester => ({
  id: row.id,
  year: row.year,
  semester: row.semester as 'S1' | 'S2',
  name: row.name,
  status: row.status as CampaignStatus,
  closingDeadline: row.closing_deadline || undefined,
});

export async function fetchSemesters(): Promise<Semester[]> {
  const data = throwIfError(await supabase.from('semesters').select('*').order('year', { ascending: false }).order('semester', { ascending: false }));
  return data.map(mapSemester);
}

export async function insertSemester(form: NewSemesterForm): Promise<Semester> {
  const name = `${form.semester} ${form.year}`;
  const data = throwIfError(
    await supabase.from('semesters').insert({
      year: form.year,
      semester: form.semester,
      name,
      status: 'draft',
      closing_deadline: form.closingDeadline || null,
    }).select().single()
  );
  return mapSemester(data);
}

export async function updateSemesterDb(sem: Semester): Promise<void> {
  throwIfMutationError(
    await supabase.from('semesters').update({
      year: sem.year,
      semester: sem.semester,
      name: sem.name,
      status: sem.status,
      closing_deadline: sem.closingDeadline || null,
    }).eq('id', sem.id)
  );
}

export async function deleteSemesterDb(id: string): Promise<void> {
  // CASCADE deletes evaluations + objectives automatically
  throwIfMutationError(await supabase.from('semesters').delete().eq('id', id));
}

// ---------- Evaluations + Objectives ----------

const mapObjective = (row: DbObjective): Objective => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status as ObjectiveStatus,
  progress: row.progress,
  deadline: row.deadline || '',
  comments: row.comments,
  evaluation: row.evaluation_note,
});

const mapEvaluation = (row: DbEvaluation & { objectives: DbObjective[] }): Evaluation => ({
  id: row.id,
  employeeId: row.employee_id,
  semesterId: row.semester_id,
  validationStatus: row.validation_status as EvaluationStatus,
  bilanManager: row.bilan_manager || undefined,
  bilanEmployee: row.bilan_employee || undefined,
  performanceRating: row.performance_rating as NineBoxRating | undefined,
  potentialRating: row.potential_rating as NineBoxRating | undefined,
  objectives: (row.objectives || [])
    .sort((a, b) => a.order_index - b.order_index)
    .map(mapObjective),
});

export async function fetchEvaluations(): Promise<Evaluation[]> {
  const data = throwIfError(
    await supabase.from('evaluations').select('*, objectives(*)').order('created_at')
  );
  return data.map(mapEvaluation);
}

export async function insertEvaluation(data: {
  employeeId: string;
  semesterId: string;
  validationStatus?: EvaluationStatus;
}): Promise<Evaluation> {
  const row = throwIfError(
    await supabase.from('evaluations').insert({
      employee_id: data.employeeId,
      semester_id: data.semesterId,
      validation_status: data.validationStatus || 'not_started',
    }).select('*, objectives(*)').single()
  );
  return mapEvaluation(row);
}

export async function updateEvaluationDb(
  id: string,
  fields: Partial<{
    validationStatus: EvaluationStatus;
    bilanManager: string;
    bilanEmployee: string;
    performanceRating: NineBoxRating;
    potentialRating: NineBoxRating;
  }>
): Promise<void> {
  const update: Record<string, unknown> = {};
  if (fields.validationStatus !== undefined) update.validation_status = fields.validationStatus;
  if (fields.bilanManager !== undefined) update.bilan_manager = fields.bilanManager;
  if (fields.bilanEmployee !== undefined) update.bilan_employee = fields.bilanEmployee;
  if (fields.performanceRating !== undefined) update.performance_rating = fields.performanceRating;
  if (fields.potentialRating !== undefined) update.potential_rating = fields.potentialRating;
  throwIfMutationError(await supabase.from('evaluations').update(update).eq('id', id));
}

export async function insertObjectiveDb(
  evaluationId: string,
  data: Partial<Objective>,
  orderIndex: number
): Promise<Objective> {
  const row = throwIfError(
    await supabase.from('objectives').insert({
      evaluation_id: evaluationId,
      title: data.title || '',
      description: data.description || '',
      status: (data.status || 'not_started') as string,
      progress: data.progress || 0,
      deadline: data.deadline || null,
      comments: data.comments || '',
      evaluation_note: data.evaluation || '',
      order_index: orderIndex,
    }).select().single()
  );
  return mapObjective(row);
}

export async function updateObjectiveDb(
  objId: string,
  field: keyof Objective,
  value: string | number
): Promise<void> {
  const columnMap: Record<keyof Objective, string> = {
    id: 'id',
    title: 'title',
    description: 'description',
    status: 'status',
    progress: 'progress',
    deadline: 'deadline',
    comments: 'comments',
    evaluation: 'evaluation_note',
  };
  const column = columnMap[field];
  if (!column || column === 'id') return;
  throwIfMutationError(await supabase.from('objectives').update({ [column]: value }).eq('id', objId));
}

export async function deleteObjectiveDb(objId: string): Promise<void> {
  throwIfMutationError(await supabase.from('objectives').delete().eq('id', objId));
}

export async function reorderObjectivesDb(evaluationId: string, objectiveIds: string[]): Promise<void> {
  // Update order_index for each objective
  const updates = objectiveIds.map((id, index) =>
    supabase.from('objectives').update({ order_index: index }).eq('id', id).eq('evaluation_id', evaluationId)
  );
  await Promise.all(updates);
}

export async function insertObjectivesBatch(
  evaluationId: string,
  objectives: Partial<Objective>[],
  startIndex: number
): Promise<Objective[]> {
  const rows = objectives.map((o, i) => ({
    evaluation_id: evaluationId,
    title: o.title || '',
    description: o.description || '',
    status: (o.status || 'not_started') as string,
    progress: o.progress || 0,
    deadline: o.deadline || null,
    comments: o.comments || '',
    evaluation_note: o.evaluation || '',
    order_index: startIndex + i,
  }));
  const data = throwIfError(await supabase.from('objectives').insert(rows).select());
  return data.sort((a: DbObjective, b: DbObjective) => a.order_index - b.order_index).map(mapObjective);
}

// ---------- Professional Campaigns ----------

const mapProfessionalCampaign = (row: DbProfessionalCampaign): ProfessionalCampaign => ({
  id: row.id,
  year: row.year,
  name: row.name,
  status: row.status as ProfessionalCampaignStatus,
  scheduledFrom: row.scheduled_from || undefined,
  scheduledTo: row.scheduled_to || undefined,
  closingDeadline: row.closing_deadline || undefined,
});

export async function fetchProfessionalCampaigns(): Promise<ProfessionalCampaign[]> {
  const data = throwIfError(
    await supabase.from('professional_campaigns').select('*').order('year', { ascending: false })
  );
  return data.map(mapProfessionalCampaign);
}

export async function insertProfessionalCampaign(form: NewProfessionalCampaignForm): Promise<ProfessionalCampaign> {
  const name = form.name || `Entretiens professionnels ${form.year}`;
  const data = throwIfError(
    await supabase.from('professional_campaigns').insert({
      year: form.year,
      name,
      status: 'draft',
      scheduled_from: form.scheduledFrom || null,
      scheduled_to: form.scheduledTo || null,
      closing_deadline: form.closingDeadline || null,
    }).select().single()
  );
  return mapProfessionalCampaign(data);
}

export async function updateProfessionalCampaignDb(campaign: ProfessionalCampaign): Promise<void> {
  throwIfMutationError(
    await supabase.from('professional_campaigns').update({
      year: campaign.year,
      name: campaign.name,
      status: campaign.status,
      scheduled_from: campaign.scheduledFrom || null,
      scheduled_to: campaign.scheduledTo || null,
      closing_deadline: campaign.closingDeadline || null,
    }).eq('id', campaign.id)
  );
}

export async function deleteProfessionalCampaignDb(id: string): Promise<void> {
  throwIfMutationError(await supabase.from('professional_campaigns').delete().eq('id', id));
}

// ---------- Professional Interviews ----------

const mapProfessionalInterview = (row: DbProfessionalInterview): ProfessionalInterview => ({
  id: row.id,
  campaignId: row.campaign_id,
  employeeId: row.employee_id,
  status: row.status as ProfessionalInterviewStatus,
  scheduledAt: row.scheduled_at || undefined,
  conductedAt: row.conducted_at || undefined,
  careerReview: row.career_review,
  skillsAcquired: row.skills_acquired,
  evolutionMobility: row.evolution_mobility as MobilityWish,
  evolutionNotes: row.evolution_notes,
  trainingWishes: row.training_wishes,
  conclusions: row.conclusions,
  employeeComment: row.employee_comment,
  managerComment: row.manager_comment,
  employeeSignedAt: row.employee_signed_at || undefined,
  managerSignedAt: row.manager_signed_at || undefined,
});

export async function fetchProfessionalInterviews(): Promise<ProfessionalInterview[]> {
  const data = throwIfError(
    await supabase.from('professional_interviews').select('*').order('created_at')
  );
  return data.map(mapProfessionalInterview);
}

export async function insertProfessionalInterview(data: {
  campaignId: string;
  employeeId: string;
}): Promise<ProfessionalInterview> {
  const row = throwIfError(
    await supabase.from('professional_interviews').insert({
      campaign_id: data.campaignId,
      employee_id: data.employeeId,
      status: 'scheduled',
    }).select().single()
  );
  return mapProfessionalInterview(row);
}

export async function updateProfessionalInterviewDb(
  id: string,
  fields: Partial<ProfessionalInterview>
): Promise<void> {
  const columnMap: Partial<Record<keyof ProfessionalInterview, string>> = {
    status: 'status',
    scheduledAt: 'scheduled_at',
    conductedAt: 'conducted_at',
    careerReview: 'career_review',
    skillsAcquired: 'skills_acquired',
    evolutionMobility: 'evolution_mobility',
    evolutionNotes: 'evolution_notes',
    trainingWishes: 'training_wishes',
    conclusions: 'conclusions',
    employeeComment: 'employee_comment',
    managerComment: 'manager_comment',
    employeeSignedAt: 'employee_signed_at',
    managerSignedAt: 'manager_signed_at',
  };
  const update: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(columnMap)) {
    const value = fields[key as keyof ProfessionalInterview];
    if (value !== undefined && column) {
      update[column] = value === '' && (key.endsWith('At') || key === 'scheduledAt' || key === 'conductedAt') ? null : value;
    }
  }
  if (Object.keys(update).length === 0) return;
  throwIfMutationError(
    await supabase.from('professional_interviews').update(update).eq('id', id)
  );
}

export async function deleteProfessionalInterviewDb(id: string): Promise<void> {
  throwIfMutationError(await supabase.from('professional_interviews').delete().eq('id', id));
}

// ---------- Profiles ----------

export async function fetchProfile(userId: string) {
  const data = throwIfError(
    await supabase.from('profiles').select('*').eq('id', userId).single()
  );
  return data;
}

// ---------- Company ----------

export async function fetchCompany(companyId: string) {
  const data = throwIfError(
    await supabase.from('companies').select('*').eq('id', companyId).single()
  );
  const aiPromptsRaw = data.ai_prompts as Record<string, string> | null;
  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    ownerId: data.owner_id as string,
    logo: data.logo as string,
    aiPrompts: aiPromptsRaw ? {
      objectivesContext: aiPromptsRaw.objectivesContext,
      templatesContext: aiPromptsRaw.templatesContext,
    } : undefined,
  };
}

export async function updateCompany(companyId: string, updates: { name?: string; logo?: string; aiPrompts?: { objectivesContext?: string; templatesContext?: string } }) {
  const update: Record<string, unknown> = {};
  if (updates.name !== undefined) update.name = updates.name;
  if (updates.logo !== undefined) update.logo = updates.logo;
  if (updates.aiPrompts !== undefined) update.ai_prompts = updates.aiPrompts;
  update.updated_at = new Date().toISOString();
  throwIfMutationError(
    await supabase.from('companies').update(update).eq('id', companyId)
  );
}

export async function fetchCompanyMembers() {
  // RLS ensures only same-company profiles are returned for RH users
  const data = throwIfError(
    await supabase.from('profiles').select('*').order('created_at')
  );
  return data.map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    photo: p.photo as string,
    role: p.role as string,
    employeeId: (p.employee_id as string) || undefined,
    createdAt: p.created_at as string,
  }));
}

export async function updateMemberRole(userId: string, role: 'manager' | 'employee') {
  throwIfMutationError(
    await supabase.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', userId)
  );
}

// ---------- Employee Invitation ----------

export async function fetchProfileByEmployeeId(employeeId: string): Promise<{ id: string } | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('employee_id', employeeId)
    .maybeSingle();
  return data;
}

export async function sendEmployeeInvitation(
  email: string,
  name: string,
  role: string,
  employeeId: string,
): Promise<{ userId: string }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/invite-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email, name, role, employeeId }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to send invitation');
  }

  const result = await res.json();
  return { userId: result.user.id };
}

// ---------- Bulk fetch for initial load ----------

export async function fetchAllData() {
  const [
    establishments,
    teams,
    employees,
    positions,
    templates,
    semesters,
    evaluations,
    professionalCampaigns,
    professionalInterviews,
  ] = await Promise.all([
    fetchEstablishments(),
    fetchTeams(),
    fetchEmployees(),
    fetchPositions(),
    fetchTemplates(),
    fetchSemesters(),
    fetchEvaluations(),
    fetchProfessionalCampaigns(),
    fetchProfessionalInterviews(),
  ]);
  return {
    establishments,
    teams,
    employees,
    positions,
    templates,
    semesters,
    evaluations,
    professionalCampaigns,
    professionalInterviews,
  };
}
