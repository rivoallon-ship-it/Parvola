-- =============================================
-- Talent Review — Migration 008: Professional Interviews
-- =============================================
-- Adds the "entretien professionnel" (EPP) domain, a French legal
-- career interview distinct from the existing performance evaluation
-- workflow (semesters/evaluations).
--
-- NOTE (regulatory correction): the periodicity described in earlier
-- versions of this file (biennial + 6-year recap) is OBSOLETE since
-- 2025-12-31. The current framework is: first interview within 1 year,
-- then every 4 years, with an 8-year "état des lieux" recap. The corrected
-- framework is recorded as metadata in migration 011. The schema below is
-- periodicity-agnostic and remains valid.
-- =============================================

-- =============================================
-- 1. Enums
-- =============================================
CREATE TYPE professional_campaign_status AS ENUM ('draft', 'active', 'closed');
CREATE TYPE professional_interview_status AS ENUM ('scheduled', 'in_progress', 'completed');
CREATE TYPE professional_mobility_wish AS ENUM ('none', 'internal', 'external', 'geographic');

-- =============================================
-- 2. professional_campaigns
-- =============================================
CREATE TABLE professional_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  status professional_campaign_status NOT NULL DEFAULT 'draft',
  scheduled_from DATE,
  scheduled_to DATE,
  closing_deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_professional_campaigns_company ON professional_campaigns(company_id);
CREATE INDEX idx_professional_campaigns_year ON professional_campaigns(year);

ALTER TABLE professional_campaigns ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_company_id_professional_campaigns
  BEFORE INSERT ON professional_campaigns
  FOR EACH ROW EXECUTE FUNCTION set_company_id();

-- =============================================
-- 3. professional_interviews
-- =============================================
CREATE TABLE professional_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES professional_campaigns(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status professional_interview_status NOT NULL DEFAULT 'scheduled',

  -- Scheduling / traceability
  scheduled_at DATE,
  conducted_at DATE,

  -- Legal content sections
  career_review TEXT NOT NULL DEFAULT '',
  skills_acquired TEXT NOT NULL DEFAULT '',
  evolution_mobility professional_mobility_wish NOT NULL DEFAULT 'none',
  evolution_notes TEXT NOT NULL DEFAULT '',
  training_wishes TEXT NOT NULL DEFAULT '',
  conclusions TEXT NOT NULL DEFAULT '',
  employee_comment TEXT NOT NULL DEFAULT '',
  manager_comment TEXT NOT NULL DEFAULT '',

  -- Logical signatures
  employee_signed_at TIMESTAMPTZ,
  manager_signed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(campaign_id, employee_id)
);

CREATE INDEX idx_professional_interviews_company ON professional_interviews(company_id);
CREATE INDEX idx_professional_interviews_campaign ON professional_interviews(campaign_id);
CREATE INDEX idx_professional_interviews_employee ON professional_interviews(employee_id);
-- Composite index for the per-employee chronological history (used by the
-- 8-year "état des lieux" recap — see migration 011)
CREATE INDEX idx_professional_interviews_employee_conducted ON professional_interviews(employee_id, conducted_at);

ALTER TABLE professional_interviews ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER set_company_id_professional_interviews
  BEFORE INSERT ON professional_interviews
  FOR EACH ROW EXECUTE FUNCTION set_company_id();

-- =============================================
-- 4. RLS — professional_campaigns
-- =============================================
CREATE POLICY "Users can read professional campaigns in company"
  ON professional_campaigns FOR SELECT TO authenticated
  USING (company_id = get_user_company_id());

CREATE POLICY "RH can insert professional campaigns"
  ON professional_campaigns FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update professional campaigns"
  ON professional_campaigns FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete professional campaigns"
  ON professional_campaigns FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

-- =============================================
-- 5. RLS — professional_interviews (scoped like evaluations)
-- =============================================
CREATE POLICY "RH can see all professional interviews in company"
  ON professional_interviews FOR SELECT
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "Manager can see scoped professional interviews in company"
  ON professional_interviews FOR SELECT
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

CREATE POLICY "Employee can see own professional interviews"
  ON professional_interviews FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'employee'
    AND employee_id = get_user_employee_id()
  );

CREATE POLICY "RH can insert professional interviews"
  ON professional_interviews FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can update professional interviews"
  ON professional_interviews FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "RH can delete professional interviews"
  ON professional_interviews FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND get_user_role() = 'rh');

CREATE POLICY "Manager can insert scoped professional interviews"
  ON professional_interviews FOR INSERT TO authenticated
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

CREATE POLICY "Manager can update scoped professional interviews"
  ON professional_interviews FOR UPDATE TO authenticated
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
