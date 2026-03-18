-- =============================================
-- Talent Review — Schema initial
-- =============================================

-- Custom enums
CREATE TYPE user_role AS ENUM ('rh', 'manager', 'employee');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE evaluation_status AS ENUM ('not_started', 'in_progress', 'submitted', 'validated');
CREATE TYPE objective_status AS ENUM ('not_started', 'in_progress', 'completed', 'blocked');

-- =============================================
-- Establishments
-- =============================================
CREATE TABLE establishments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Teams
-- =============================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Positions
-- =============================================
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Employees
-- =============================================
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo TEXT NOT NULL DEFAULT '👤',
  establishment_id UUID REFERENCES establishments(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  salary NUMERIC,
  late_count INTEGER DEFAULT 0,
  unjustified_absences INTEGER DEFAULT 0,
  justified_absences INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Objective Templates
-- =============================================
CREATE TABLE objective_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  suggested_deadline_days INTEGER NOT NULL DEFAULT 90,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Semesters (Campaigns)
-- =============================================
CREATE TABLE semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  semester TEXT NOT NULL CHECK (semester IN ('S1', 'S2')),
  name TEXT NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  closing_deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Evaluations
-- =============================================
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  validation_status evaluation_status DEFAULT 'not_started',
  bilan_manager TEXT,
  bilan_employee TEXT,
  performance_rating SMALLINT CHECK (performance_rating BETWEEN 1 AND 3),
  potential_rating SMALLINT CHECK (potential_rating BETWEEN 1 AND 3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, semester_id)
);

-- =============================================
-- Objectives (separate table for fine-grained CRUD)
-- =============================================
CREATE TABLE objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  status objective_status NOT NULL DEFAULT 'not_started',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  deadline DATE,
  comments TEXT NOT NULL DEFAULT '',
  evaluation_note TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Profiles (extends auth.users)
-- =============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  photo TEXT NOT NULL DEFAULT '👤',
  role user_role NOT NULL DEFAULT 'employee',
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  team_ids UUID[] DEFAULT '{}',
  establishment_id UUID REFERENCES establishments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_teams_establishment ON teams(establishment_id);
CREATE INDEX idx_employees_establishment ON employees(establishment_id);
CREATE INDEX idx_employees_team ON employees(team_id);
CREATE INDEX idx_evaluations_employee ON evaluations(employee_id);
CREATE INDEX idx_evaluations_semester ON evaluations(semester_id);
CREATE INDEX idx_evaluations_employee_semester ON evaluations(employee_id, semester_id);
CREATE INDEX idx_objectives_evaluation ON objectives(evaluation_id);
CREATE INDEX idx_objective_templates_position ON objective_templates(position_id);

-- =============================================
-- RLS Helper Functions
-- =============================================
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_user_team_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(team_ids, '{}') FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_user_establishment_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT establishment_id FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION get_user_employee_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT employee_id FROM profiles WHERE id = auth.uid()
$$;

-- NOTE: No trigger on auth.users — profile creation is handled by the
-- invite-user Edge Function (admin API + INSERT into profiles).
-- A trigger here was causing GoTrue 500 errors ("Database error creating new user").

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE objectives ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies — Profiles
-- =============================================
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR get_user_role() = 'rh');

-- Users can only update their own name and photo.
-- role, team_ids, establishment_id, employee_id are managed by RH via service_role.
CREATE POLICY "Users can update own profile (name and photo only)"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
    AND team_ids = (SELECT p.team_ids FROM profiles p WHERE p.id = auth.uid())
    AND establishment_id IS NOT DISTINCT FROM (SELECT p.establishment_id FROM profiles p WHERE p.id = auth.uid())
    AND employee_id IS NOT DISTINCT FROM (SELECT p.employee_id FROM profiles p WHERE p.id = auth.uid())
  );

-- =============================================
-- RLS Policies — Establishments (everyone reads, RH writes)
-- =============================================
CREATE POLICY "Authenticated can read establishments"
  ON establishments FOR SELECT TO authenticated USING (true);

CREATE POLICY "RH can insert establishments"
  ON establishments FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'rh');

CREATE POLICY "RH can update establishments"
  ON establishments FOR UPDATE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "RH can delete establishments"
  ON establishments FOR DELETE TO authenticated USING (get_user_role() = 'rh');

-- =============================================
-- RLS Policies — Teams (everyone reads, RH writes)
-- =============================================
CREATE POLICY "Authenticated can read teams"
  ON teams FOR SELECT TO authenticated USING (true);

CREATE POLICY "RH can insert teams"
  ON teams FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'rh');

CREATE POLICY "RH can update teams"
  ON teams FOR UPDATE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "RH can delete teams"
  ON teams FOR DELETE TO authenticated USING (get_user_role() = 'rh');

-- =============================================
-- RLS Policies — Employees (scoped visibility)
-- =============================================
CREATE POLICY "RH can see all employees"
  ON employees FOR SELECT USING (get_user_role() = 'rh');

CREATE POLICY "Manager can see scoped employees"
  ON employees FOR SELECT USING (
    get_user_role() = 'manager' AND (
      team_id = ANY(get_user_team_ids())
      OR (team_id IS NULL AND establishment_id = get_user_establishment_id())
    )
  );

CREATE POLICY "Employee can see self"
  ON employees FOR SELECT USING (
    get_user_role() = 'employee' AND id = get_user_employee_id()
  );

CREATE POLICY "RH can insert employees"
  ON employees FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'rh');

CREATE POLICY "RH can update employees"
  ON employees FOR UPDATE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "RH can delete employees"
  ON employees FOR DELETE TO authenticated USING (get_user_role() = 'rh');

-- =============================================
-- RLS Policies — Positions (everyone reads, RH writes)
-- =============================================
CREATE POLICY "Authenticated can read positions"
  ON positions FOR SELECT TO authenticated USING (true);

CREATE POLICY "RH can insert positions"
  ON positions FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'rh');

CREATE POLICY "RH can update positions"
  ON positions FOR UPDATE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "RH can delete positions"
  ON positions FOR DELETE TO authenticated USING (get_user_role() = 'rh');

-- =============================================
-- RLS Policies — Objective Templates (everyone reads, RH writes)
-- =============================================
CREATE POLICY "Authenticated can read templates"
  ON objective_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "RH can insert templates"
  ON objective_templates FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'rh');

CREATE POLICY "RH can update templates"
  ON objective_templates FOR UPDATE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "RH can delete templates"
  ON objective_templates FOR DELETE TO authenticated USING (get_user_role() = 'rh');

-- =============================================
-- RLS Policies — Semesters (everyone reads, RH writes)
-- =============================================
CREATE POLICY "Authenticated can read semesters"
  ON semesters FOR SELECT TO authenticated USING (true);

CREATE POLICY "RH can insert semesters"
  ON semesters FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'rh');

CREATE POLICY "RH can update semesters"
  ON semesters FOR UPDATE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "RH can delete semesters"
  ON semesters FOR DELETE TO authenticated USING (get_user_role() = 'rh');

-- =============================================
-- RLS Policies — Evaluations (scoped)
-- =============================================
CREATE POLICY "RH can see all evaluations"
  ON evaluations FOR SELECT USING (get_user_role() = 'rh');

CREATE POLICY "Manager can see scoped evaluations"
  ON evaluations FOR SELECT USING (
    get_user_role() = 'manager' AND
    employee_id IN (
      SELECT id FROM employees
      WHERE team_id = ANY(get_user_team_ids())
         OR (team_id IS NULL AND establishment_id = get_user_establishment_id())
    )
  );

CREATE POLICY "Employee can see own evaluations"
  ON evaluations FOR SELECT USING (
    get_user_role() = 'employee' AND employee_id = get_user_employee_id()
  );

CREATE POLICY "RH can manage evaluations"
  ON evaluations FOR INSERT TO authenticated WITH CHECK (get_user_role() = 'rh');

CREATE POLICY "RH can update evaluations"
  ON evaluations FOR UPDATE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "RH can delete evaluations"
  ON evaluations FOR DELETE TO authenticated USING (get_user_role() = 'rh');

CREATE POLICY "Manager can insert scoped evaluations"
  ON evaluations FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'manager' AND
    employee_id IN (
      SELECT id FROM employees
      WHERE team_id = ANY(get_user_team_ids())
         OR (team_id IS NULL AND establishment_id = get_user_establishment_id())
    )
  );

-- Manager can update scoped evaluations but CANNOT:
-- - set validation_status to 'validated' (RH-only action)
-- - reassign employee_id or semester_id
CREATE POLICY "Manager can update scoped evaluations"
  ON evaluations FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'manager' AND
    employee_id IN (
      SELECT id FROM employees
      WHERE team_id = ANY(get_user_team_ids())
         OR (team_id IS NULL AND establishment_id = get_user_establishment_id())
    )
  )
  WITH CHECK (
    validation_status IS DISTINCT FROM 'validated'::evaluation_status
    AND employee_id IN (
      SELECT id FROM employees
      WHERE team_id = ANY(get_user_team_ids())
         OR (team_id IS NULL AND establishment_id = get_user_establishment_id())
    )
  );

-- =============================================
-- RLS Policies — Objectives (via evaluation visibility)
-- =============================================
CREATE POLICY "Users can see objectives for visible evaluations"
  ON objectives FOR SELECT USING (
    evaluation_id IN (SELECT id FROM evaluations)
  );

CREATE POLICY "RH can manage objectives"
  ON objectives FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('rh', 'manager') AND evaluation_id IN (SELECT id FROM evaluations));

CREATE POLICY "RH and Manager can update objectives"
  ON objectives FOR UPDATE TO authenticated
  USING (get_user_role() IN ('rh', 'manager') AND evaluation_id IN (SELECT id FROM evaluations));

CREATE POLICY "RH and Manager can delete objectives"
  ON objectives FOR DELETE TO authenticated
  USING (get_user_role() IN ('rh', 'manager') AND evaluation_id IN (SELECT id FROM evaluations));
