-- =============================================
-- Talent Review — Migration 004: 5-Tier Role System
-- =============================================
-- Adds establishment_ids column for directeur scope,
-- creates helper functions, and rewrites all RLS policies.
-- =============================================

-- =============================================
-- 1. Add establishment_ids column to profiles
-- =============================================
ALTER TABLE profiles ADD COLUMN establishment_ids UUID[] DEFAULT '{}';
CREATE INDEX idx_profiles_establishment_ids ON profiles USING GIN (establishment_ids);

-- =============================================
-- 2. New RLS helper functions
-- =============================================

-- Get establishment_ids array for directeur scope
CREATE OR REPLACE FUNCTION get_user_establishment_ids()
RETURNS UUID[]
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(establishment_ids, '{}') FROM profiles WHERE id = auth.uid()
$$;

-- Role grouping: admin or rh (full company access)
CREATE OR REPLACE FUNCTION is_full_access_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT get_user_role() IN ('admin', 'rh')
$$;

-- Role grouping: admin, rh, directeur, or manager (can evaluate)
CREATE OR REPLACE FUNCTION is_evaluator_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT get_user_role() IN ('admin', 'rh', 'directeur', 'manager')
$$;

-- =============================================
-- 3. Migrate existing company owners to admin
-- =============================================
UPDATE profiles SET role = 'admin'
WHERE id IN (SELECT owner_id FROM companies WHERE owner_id IS NOT NULL);

-- =============================================
-- 4. Drop ALL existing RLS policies
-- =============================================

-- Companies
DROP POLICY IF EXISTS "Users can read own company" ON companies;
DROP POLICY IF EXISTS "RH can update own company" ON companies;

-- Profiles
DROP POLICY IF EXISTS "Users can read profiles in company" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Establishments
DROP POLICY IF EXISTS "Users can read establishments in company" ON establishments;
DROP POLICY IF EXISTS "RH can insert establishments" ON establishments;
DROP POLICY IF EXISTS "RH can update establishments" ON establishments;
DROP POLICY IF EXISTS "RH can delete establishments" ON establishments;

-- Teams
DROP POLICY IF EXISTS "Users can read teams in company" ON teams;
DROP POLICY IF EXISTS "RH can insert teams" ON teams;
DROP POLICY IF EXISTS "RH can update teams" ON teams;
DROP POLICY IF EXISTS "RH can delete teams" ON teams;

-- Employees
DROP POLICY IF EXISTS "RH can see all employees in company" ON employees;
DROP POLICY IF EXISTS "Manager can see scoped employees in company" ON employees;
DROP POLICY IF EXISTS "Employee can see self in company" ON employees;
DROP POLICY IF EXISTS "RH can insert employees" ON employees;
DROP POLICY IF EXISTS "RH can update employees" ON employees;
DROP POLICY IF EXISTS "RH can delete employees" ON employees;

-- Positions
DROP POLICY IF EXISTS "Users can read positions in company" ON positions;
DROP POLICY IF EXISTS "RH can insert positions" ON positions;
DROP POLICY IF EXISTS "RH can update positions" ON positions;
DROP POLICY IF EXISTS "RH can delete positions" ON positions;

-- Objective Templates
DROP POLICY IF EXISTS "Users can read templates in company" ON objective_templates;
DROP POLICY IF EXISTS "RH can insert templates" ON objective_templates;
DROP POLICY IF EXISTS "RH can update templates" ON objective_templates;
DROP POLICY IF EXISTS "RH can delete templates" ON objective_templates;

-- Semesters
DROP POLICY IF EXISTS "Users can read semesters in company" ON semesters;
DROP POLICY IF EXISTS "RH can insert semesters" ON semesters;
DROP POLICY IF EXISTS "RH can update semesters" ON semesters;
DROP POLICY IF EXISTS "RH can delete semesters" ON semesters;

-- Evaluations
DROP POLICY IF EXISTS "RH can see all evaluations in company" ON evaluations;
DROP POLICY IF EXISTS "Manager can see scoped evaluations in company" ON evaluations;
DROP POLICY IF EXISTS "Employee can see own evaluations in company" ON evaluations;
DROP POLICY IF EXISTS "RH can manage evaluations" ON evaluations;
DROP POLICY IF EXISTS "RH can update evaluations" ON evaluations;
DROP POLICY IF EXISTS "RH can delete evaluations" ON evaluations;
DROP POLICY IF EXISTS "Manager can insert scoped evaluations" ON evaluations;
DROP POLICY IF EXISTS "Manager can update scoped evaluations" ON evaluations;

-- Objectives
DROP POLICY IF EXISTS "Users can see objectives for visible evaluations" ON objectives;
DROP POLICY IF EXISTS "RH and Manager can insert objectives" ON objectives;
DROP POLICY IF EXISTS "RH and Manager can update objectives" ON objectives;
DROP POLICY IF EXISTS "RH and Manager can delete objectives" ON objectives;

-- Invitations
DROP POLICY IF EXISTS "RH can manage invitations in company" ON invitations;

-- =============================================
-- 5. Create new RLS policies (5-role system)
-- =============================================

-- ---------- Companies ----------
CREATE POLICY "Users can read own company"
  ON companies FOR SELECT TO authenticated
  USING (id = get_user_company_id());

CREATE POLICY "Full access can update own company"
  ON companies FOR UPDATE TO authenticated
  USING (id = get_user_company_id() AND is_full_access_role());

-- ---------- Profiles ----------
CREATE POLICY "Users can read profiles in company"
  ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR (company_id = get_user_company_id() AND is_full_access_role())
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
    AND establishment_ids = (SELECT p.establishment_ids FROM profiles p WHERE p.id = auth.uid())
  );

-- ---------- Establishments ----------
CREATE POLICY "Users can read establishments in company"
  ON establishments FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Full access can insert establishments"
  ON establishments FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update establishments"
  ON establishments FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete establishments"
  ON establishments FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- ---------- Teams ----------
CREATE POLICY "Users can read teams in company"
  ON teams FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Full access can insert teams"
  ON teams FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update teams"
  ON teams FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete teams"
  ON teams FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- ---------- Employees ----------
CREATE POLICY "Full access can see all employees in company"
  ON employees FOR SELECT
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Directeur can see establishment-scoped employees"
  ON employees FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'directeur'
    AND establishment_id = ANY(get_user_establishment_ids())
  );

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

CREATE POLICY "Full access can insert employees"
  ON employees FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update employees"
  ON employees FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete employees"
  ON employees FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- ---------- Positions ----------
CREATE POLICY "Users can read positions in company"
  ON positions FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Full access can insert positions"
  ON positions FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update positions"
  ON positions FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete positions"
  ON positions FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- ---------- Objective Templates ----------
CREATE POLICY "Users can read templates in company"
  ON objective_templates FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Full access can insert templates"
  ON objective_templates FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update templates"
  ON objective_templates FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete templates"
  ON objective_templates FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- ---------- Semesters ----------
CREATE POLICY "Users can read semesters in company"
  ON semesters FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "Full access can insert semesters"
  ON semesters FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update semesters"
  ON semesters FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete semesters"
  ON semesters FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- ---------- Evaluations ----------
CREATE POLICY "Full access can see all evaluations in company"
  ON evaluations FOR SELECT
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Directeur can see establishment-scoped evaluations"
  ON evaluations FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'directeur'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND establishment_id = ANY(get_user_establishment_ids())
    )
  );

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

CREATE POLICY "Full access can insert evaluations"
  ON evaluations FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update evaluations"
  ON evaluations FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete evaluations"
  ON evaluations FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Directeur can insert scoped evaluations"
  ON evaluations FOR INSERT TO authenticated
  WITH CHECK (
    company_id = get_user_company_id()
    AND get_user_role() = 'directeur'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND establishment_id = ANY(get_user_establishment_ids())
    )
  );

CREATE POLICY "Directeur can update scoped evaluations"
  ON evaluations FOR UPDATE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'directeur'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND establishment_id = ANY(get_user_establishment_ids())
    )
  )
  WITH CHECK (
    validation_status IS DISTINCT FROM 'validated'::evaluation_status
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND establishment_id = ANY(get_user_establishment_ids())
    )
  );

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

CREATE POLICY "Evaluators can insert objectives"
  ON objectives FOR INSERT TO authenticated
  WITH CHECK (
    company_id = get_user_company_id()
    AND is_evaluator_role()
    AND evaluation_id IN (SELECT id FROM evaluations)
  );

CREATE POLICY "Evaluators can update objectives"
  ON objectives FOR UPDATE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND is_evaluator_role()
    AND evaluation_id IN (SELECT id FROM evaluations)
  );

CREATE POLICY "Evaluators can delete objectives"
  ON objectives FOR DELETE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND is_evaluator_role()
    AND evaluation_id IN (SELECT id FROM evaluations)
  );

-- ---------- Invitations ----------
CREATE POLICY "Full access can manage invitations in company"
  ON invitations FOR ALL TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());
