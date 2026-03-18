-- =============================================
-- Talent Review — Migration 002: Multi-Tenant
-- =============================================
-- Adds company_id to all tables, rewrites RLS
-- policies for tenant isolation, creates auto-fill
-- triggers, and adds company signup support.
-- =============================================

-- =============================================
-- 1. Create companies table
-- =============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  logo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_owner ON companies(owner_id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. Create default company for existing data
-- =============================================
INSERT INTO companies (id, name, slug, owner_id)
VALUES (
  '00000000-0000-4000-b000-000000000001',
  'Sushi Neko',
  'sushineko',
  (SELECT id FROM profiles WHERE role = 'rh' LIMIT 1)
);

-- =============================================
-- 3. Add company_id columns (NULLABLE first)
-- =============================================
ALTER TABLE profiles ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE establishments ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE teams ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE employees ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE positions ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE objective_templates ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE semesters ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE evaluations ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE objectives ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- =============================================
-- 4. Backfill all existing data
-- =============================================
UPDATE profiles SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE establishments SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE teams SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE employees SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE positions SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE objective_templates SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE semesters SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE evaluations SET company_id = '00000000-0000-4000-b000-000000000001';
UPDATE objectives SET company_id = '00000000-0000-4000-b000-000000000001';

-- =============================================
-- 5. Set NOT NULL constraints
-- =============================================
ALTER TABLE profiles ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE establishments ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE teams ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE employees ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE positions ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE objective_templates ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE semesters ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE evaluations ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE objectives ALTER COLUMN company_id SET NOT NULL;

-- =============================================
-- 6. Create indexes on company_id
-- =============================================
CREATE INDEX idx_profiles_company ON profiles(company_id);
CREATE INDEX idx_establishments_company ON establishments(company_id);
CREATE INDEX idx_teams_company ON teams(company_id);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_positions_company ON positions(company_id);
CREATE INDEX idx_objective_templates_company ON objective_templates(company_id);
CREATE INDEX idx_semesters_company ON semesters(company_id);
CREATE INDEX idx_evaluations_company ON evaluations(company_id);
CREATE INDEX idx_objectives_company ON objectives(company_id);

-- =============================================
-- 7. New RLS helper function
-- =============================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid()
$$;

-- =============================================
-- 8. Auto-fill company_id trigger
-- =============================================
CREATE OR REPLACE FUNCTION set_company_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.company_id IS NULL THEN
    NEW.company_id := (SELECT company_id FROM profiles WHERE id = auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_company_id_establishments BEFORE INSERT ON establishments FOR EACH ROW EXECUTE FUNCTION set_company_id();
CREATE TRIGGER set_company_id_teams BEFORE INSERT ON teams FOR EACH ROW EXECUTE FUNCTION set_company_id();
CREATE TRIGGER set_company_id_employees BEFORE INSERT ON employees FOR EACH ROW EXECUTE FUNCTION set_company_id();
CREATE TRIGGER set_company_id_positions BEFORE INSERT ON positions FOR EACH ROW EXECUTE FUNCTION set_company_id();
CREATE TRIGGER set_company_id_objective_templates BEFORE INSERT ON objective_templates FOR EACH ROW EXECUTE FUNCTION set_company_id();
CREATE TRIGGER set_company_id_semesters BEFORE INSERT ON semesters FOR EACH ROW EXECUTE FUNCTION set_company_id();
CREATE TRIGGER set_company_id_evaluations BEFORE INSERT ON evaluations FOR EACH ROW EXECUTE FUNCTION set_company_id();
CREATE TRIGGER set_company_id_objectives BEFORE INSERT ON objectives FOR EACH ROW EXECUTE FUNCTION set_company_id();

-- =============================================
-- 9. Drop ALL old RLS policies
-- =============================================

-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile (name and photo only)" ON profiles;

-- Establishments
DROP POLICY IF EXISTS "Authenticated can read establishments" ON establishments;
DROP POLICY IF EXISTS "RH can insert establishments" ON establishments;
DROP POLICY IF EXISTS "RH can update establishments" ON establishments;
DROP POLICY IF EXISTS "RH can delete establishments" ON establishments;

-- Teams
DROP POLICY IF EXISTS "Authenticated can read teams" ON teams;
DROP POLICY IF EXISTS "RH can insert teams" ON teams;
DROP POLICY IF EXISTS "RH can update teams" ON teams;
DROP POLICY IF EXISTS "RH can delete teams" ON teams;

-- Employees
DROP POLICY IF EXISTS "RH can see all employees" ON employees;
DROP POLICY IF EXISTS "Manager can see scoped employees" ON employees;
DROP POLICY IF EXISTS "Employee can see self" ON employees;
DROP POLICY IF EXISTS "RH can insert employees" ON employees;
DROP POLICY IF EXISTS "RH can update employees" ON employees;
DROP POLICY IF EXISTS "RH can delete employees" ON employees;

-- Positions
DROP POLICY IF EXISTS "Authenticated can read positions" ON positions;
DROP POLICY IF EXISTS "RH can insert positions" ON positions;
DROP POLICY IF EXISTS "RH can update positions" ON positions;
DROP POLICY IF EXISTS "RH can delete positions" ON positions;

-- Objective Templates
DROP POLICY IF EXISTS "Authenticated can read templates" ON objective_templates;
DROP POLICY IF EXISTS "RH can insert templates" ON objective_templates;
DROP POLICY IF EXISTS "RH can update templates" ON objective_templates;
DROP POLICY IF EXISTS "RH can delete templates" ON objective_templates;

-- Semesters
DROP POLICY IF EXISTS "Authenticated can read semesters" ON semesters;
DROP POLICY IF EXISTS "RH can insert semesters" ON semesters;
DROP POLICY IF EXISTS "RH can update semesters" ON semesters;
DROP POLICY IF EXISTS "RH can delete semesters" ON semesters;

-- Evaluations
DROP POLICY IF EXISTS "RH can see all evaluations" ON evaluations;
DROP POLICY IF EXISTS "Manager can see scoped evaluations" ON evaluations;
DROP POLICY IF EXISTS "Employee can see own evaluations" ON evaluations;
DROP POLICY IF EXISTS "RH can manage evaluations" ON evaluations;
DROP POLICY IF EXISTS "RH can update evaluations" ON evaluations;
DROP POLICY IF EXISTS "RH can delete evaluations" ON evaluations;
DROP POLICY IF EXISTS "Manager can insert scoped evaluations" ON evaluations;
DROP POLICY IF EXISTS "Manager can update scoped evaluations" ON evaluations;

-- Objectives
DROP POLICY IF EXISTS "Users can see objectives for visible evaluations" ON objectives;
DROP POLICY IF EXISTS "RH can manage objectives" ON objectives;
DROP POLICY IF EXISTS "RH and Manager can update objectives" ON objectives;
DROP POLICY IF EXISTS "RH and Manager can delete objectives" ON objectives;

-- =============================================
-- 10. Create new RLS policies with company_id
-- =============================================

-- ---------- Companies ----------
CREATE POLICY "Users can read own company"
  ON companies FOR SELECT TO authenticated
  USING (id = get_user_company_id());

CREATE POLICY "RH can update own company"
  ON companies FOR UPDATE TO authenticated
  USING (id = get_user_company_id() AND get_user_role() = 'rh');

-- ---------- Profiles ----------
CREATE POLICY "Users can read profiles in company"
  ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (company_id = get_user_company_id() AND get_user_role() = 'rh')
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND company_id = get_user_company_id()
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
    AND team_ids = (SELECT p.team_ids FROM profiles p WHERE p.id = auth.uid())
    AND establishment_id IS NOT DISTINCT FROM (SELECT p.establishment_id FROM profiles p WHERE p.id = auth.uid())
    AND employee_id IS NOT DISTINCT FROM (SELECT p.employee_id FROM profiles p WHERE p.id = auth.uid())
  );

-- ---------- Establishments ----------
CREATE POLICY "Users can read establishments in company"
  ON establishments FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "RH can insert establishments"
  ON establishments FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update establishments"
  ON establishments FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete establishments"
  ON establishments FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

-- ---------- Teams ----------
CREATE POLICY "Users can read teams in company"
  ON teams FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "RH can insert teams"
  ON teams FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update teams"
  ON teams FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete teams"
  ON teams FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

-- ---------- Employees ----------
CREATE POLICY "RH can see all employees in company"
  ON employees FOR SELECT
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "Manager can see scoped employees in company"
  ON employees FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'manager'
    AND (
      team_id = ANY(get_user_team_ids())
      OR (team_id IS NULL AND establishment_id = get_user_establishment_id())
    )
  );

CREATE POLICY "Employee can see self in company"
  ON employees FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'employee'
    AND id = get_user_employee_id()
  );

CREATE POLICY "RH can insert employees"
  ON employees FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update employees"
  ON employees FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete employees"
  ON employees FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

-- ---------- Positions ----------
CREATE POLICY "Users can read positions in company"
  ON positions FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "RH can insert positions"
  ON positions FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update positions"
  ON positions FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete positions"
  ON positions FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

-- ---------- Objective Templates ----------
CREATE POLICY "Users can read templates in company"
  ON objective_templates FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "RH can insert templates"
  ON objective_templates FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update templates"
  ON objective_templates FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete templates"
  ON objective_templates FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

-- ---------- Semesters ----------
CREATE POLICY "Users can read semesters in company"
  ON semesters FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "RH can insert semesters"
  ON semesters FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update semesters"
  ON semesters FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete semesters"
  ON semesters FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

-- ---------- Evaluations ----------
CREATE POLICY "RH can see all evaluations in company"
  ON evaluations FOR SELECT
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "Manager can see scoped evaluations in company"
  ON evaluations FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'manager'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND (team_id = ANY(get_user_team_ids())
             OR (team_id IS NULL AND establishment_id = get_user_establishment_id()))
    )
  );

CREATE POLICY "Employee can see own evaluations in company"
  ON evaluations FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'employee'
    AND employee_id = get_user_employee_id()
  );

CREATE POLICY "RH can manage evaluations"
  ON evaluations FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update evaluations"
  ON evaluations FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete evaluations"
  ON evaluations FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "Manager can insert scoped evaluations"
  ON evaluations FOR INSERT TO authenticated
  WITH CHECK (
    company_id = get_user_company_id()
    AND get_user_role() = 'manager'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND (team_id = ANY(get_user_team_ids())
             OR (team_id IS NULL AND establishment_id = get_user_establishment_id()))
    )
  );

CREATE POLICY "Manager can update scoped evaluations"
  ON evaluations FOR UPDATE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'manager'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND (team_id = ANY(get_user_team_ids())
             OR (team_id IS NULL AND establishment_id = get_user_establishment_id()))
    )
  )
  WITH CHECK (
    validation_status IS DISTINCT FROM 'validated'::evaluation_status
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND (team_id = ANY(get_user_team_ids())
             OR (team_id IS NULL AND establishment_id = get_user_establishment_id()))
    )
  );

-- ---------- Objectives ----------
CREATE POLICY "Users can see objectives for visible evaluations"
  ON objectives FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND evaluation_id IN (SELECT id FROM evaluations)
  );

CREATE POLICY "RH and Manager can insert objectives"
  ON objectives FOR INSERT TO authenticated
  WITH CHECK (
    company_id = get_user_company_id()
    AND get_user_role() IN ('rh', 'manager')
    AND evaluation_id IN (SELECT id FROM evaluations)
  );

CREATE POLICY "RH and Manager can update objectives"
  ON objectives FOR UPDATE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND get_user_role() IN ('rh', 'manager')
    AND evaluation_id IN (SELECT id FROM evaluations)
  );

CREATE POLICY "RH and Manager can delete objectives"
  ON objectives FOR DELETE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND get_user_role() IN ('rh', 'manager')
    AND evaluation_id IN (SELECT id FROM evaluations)
  );

-- =============================================
-- 11. Invitations table
-- =============================================
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'employee',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(company_id, email)
);

CREATE INDEX idx_invitations_company ON invitations(company_id);
CREATE INDEX idx_invitations_email ON invitations(email);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RH can manage invitations in company"
  ON invitations FOR ALL TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');
