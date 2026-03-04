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
} from '@/types';
import type {
  DbEstablishment,
  DbTeam,
  DbEmployee,
  DbObjectiveTemplate,
  DbSemester,
  DbEvaluation,
  DbObjective,
} from '@/lib/database.types';

// ============================================
// Helpers — snake_case ↔ camelCase mapping
// ============================================

function throwIfError<T>(result: { data: T; error: { message: string } | null }): NonNullable<T> {
  if (result.error) throw new Error(result.error.message);
  if (result.data == null) throw new Error('No data returned');
  return result.data as NonNullable<T>;
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
  throwIfError(
    await supabase.from('establishments').update({ name: est.name, description: est.description }).eq('id', est.id)
  );
}

export async function deleteEstablishmentDb(id: string): Promise<void> {
  throwIfError(await supabase.from('establishments').delete().eq('id', id));
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
  throwIfError(
    await supabase.from('teams').update({
      establishment_id: team.establishmentId,
      name: team.name,
      description: team.description,
    }).eq('id', team.id)
  );
}

export async function deleteTeamDb(id: string): Promise<void> {
  throwIfError(await supabase.from('teams').delete().eq('id', id));
}

// ---------- Employees ----------

const mapEmployee = (row: DbEmployee): Employee => ({
  id: row.id,
  name: row.name,
  position: row.position,
  photo: row.photo,
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
  throwIfError(
    await supabase.from('employees').update({
      name: emp.name,
      position: emp.position,
      photo: emp.photo,
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
  throwIfError(await supabase.from('employees').delete().eq('id', id));
}

// ---------- Positions ----------

const mapPosition = (row: { id: string; name: string; description: string }): Position => ({
  id: row.id,
  name: row.name,
  description: row.description,
});

export async function fetchPositions(): Promise<Position[]> {
  const data = throwIfError(await supabase.from('positions').select('*').order('name'));
  return data.map(mapPosition);
}

export async function insertPosition(form: NewPositionForm): Promise<Position> {
  const data = throwIfError(
    await supabase.from('positions').insert({ name: form.name, description: form.description || '' }).select().single()
  );
  return mapPosition(data);
}

export async function updatePositionDb(pos: Position): Promise<void> {
  throwIfError(
    await supabase.from('positions').update({ name: pos.name, description: pos.description }).eq('id', pos.id)
  );
}

export async function deletePositionDb(id: string): Promise<void> {
  throwIfError(await supabase.from('positions').delete().eq('id', id));
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
  throwIfError(
    await supabase.from('objective_templates').update({
      position_id: tmpl.positionId,
      title: tmpl.title,
      description: tmpl.description,
      suggested_deadline_days: tmpl.suggestedDeadlineDays,
    }).eq('id', tmpl.id)
  );
}

export async function deleteTemplateDb(id: string): Promise<void> {
  throwIfError(await supabase.from('objective_templates').delete().eq('id', id));
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
  throwIfError(
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
  throwIfError(await supabase.from('semesters').delete().eq('id', id));
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
  throwIfError(await supabase.from('evaluations').update(update).eq('id', id));
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
  throwIfError(await supabase.from('objectives').update({ [column]: value }).eq('id', objId));
}

export async function deleteObjectiveDb(objId: string): Promise<void> {
  throwIfError(await supabase.from('objectives').delete().eq('id', objId));
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

// ---------- Profiles ----------

export async function fetchProfile(userId: string) {
  const data = throwIfError(
    await supabase.from('profiles').select('*').eq('id', userId).single()
  );
  return data;
}

// ---------- Bulk fetch for initial load ----------

export async function fetchAllData() {
  const [establishments, teams, employees, positions, templates, semesters, evaluations] = await Promise.all([
    fetchEstablishments(),
    fetchTeams(),
    fetchEmployees(),
    fetchPositions(),
    fetchTemplates(),
    fetchSemesters(),
    fetchEvaluations(),
  ]);
  return { establishments, teams, employees, positions, templates, semesters, evaluations };
}
