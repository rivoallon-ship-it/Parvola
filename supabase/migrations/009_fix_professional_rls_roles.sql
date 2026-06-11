-- =============================================
-- Parvola — Migration 009: Fix professional interviews RLS roles
-- =============================================
-- Migration 008 restricted campaign/interview mutations to the
-- literal role 'rh', omitting 'admin' (which has full access
-- everywhere else via is_full_access_role()) and 'directeur'
-- (establishment-scoped, like on evaluations). Symptom: an admin
-- creating a professional campaign got a silent RLS rejection.
-- =============================================

-- =============================================
-- 1. professional_campaigns — rh → admin/rh
-- =============================================
DROP POLICY "RH can insert professional campaigns" ON professional_campaigns;
DROP POLICY "RH can update professional campaigns" ON professional_campaigns;
DROP POLICY "RH can delete professional campaigns" ON professional_campaigns;

CREATE POLICY "Full access can insert professional campaigns"
  ON professional_campaigns FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update professional campaigns"
  ON professional_campaigns FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete professional campaigns"
  ON professional_campaigns FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- =============================================
-- 2. professional_interviews — rh → admin/rh
-- =============================================
DROP POLICY "RH can see all professional interviews in company" ON professional_interviews;
DROP POLICY "RH can insert professional interviews" ON professional_interviews;
DROP POLICY "RH can update professional interviews" ON professional_interviews;
DROP POLICY "RH can delete professional interviews" ON professional_interviews;

CREATE POLICY "Full access can see all professional interviews in company"
  ON professional_interviews FOR SELECT
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can insert professional interviews"
  ON professional_interviews FOR INSERT TO authenticated
  WITH CHECK (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can update professional interviews"
  ON professional_interviews FOR UPDATE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

CREATE POLICY "Full access can delete professional interviews"
  ON professional_interviews FOR DELETE TO authenticated
  USING (company_id = get_user_company_id() AND is_full_access_role());

-- =============================================
-- 3. professional_interviews — directeur (establishment scope,
--    same pattern as evaluations in migration 004)
-- =============================================
CREATE POLICY "Directeur can see establishment-scoped professional interviews"
  ON professional_interviews FOR SELECT
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'directeur'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND establishment_id = ANY(get_user_establishment_ids())
    )
  );

CREATE POLICY "Directeur can insert establishment-scoped professional interviews"
  ON professional_interviews FOR INSERT TO authenticated
  WITH CHECK (
    company_id = get_user_company_id()
    AND get_user_role() = 'directeur'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND establishment_id = ANY(get_user_establishment_ids())
    )
  );

CREATE POLICY "Directeur can update establishment-scoped professional interviews"
  ON professional_interviews FOR UPDATE TO authenticated
  USING (
    company_id = get_user_company_id()
    AND get_user_role() = 'directeur'
    AND employee_id IN (
      SELECT id FROM employees
      WHERE company_id = get_user_company_id()
        AND establishment_id = ANY(get_user_establishment_ids())
    )
  );
