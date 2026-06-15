-- =============================================
-- Parvola — Migration 010: Handwritten signatures
-- =============================================
-- Adds drawn-signature capture (PNG data URL) + typed signatory name
-- to both professional interviews and annual evaluations.
--
-- Managers / directeurs / RH / admin already hold UPDATE policies on
-- these tables, so they sign via a normal UPDATE. Employees only hold
-- SELECT, so they sign through SECURITY DEFINER RPCs that write ONLY
-- their own signature columns on their own row — never any business
-- field. This also fixes a latent bug where the employee "Sign" button
-- on professional interviews silently failed against RLS.
-- =============================================

-- =============================================
-- 1. Columns
-- =============================================
ALTER TABLE professional_interviews
  ADD COLUMN IF NOT EXISTS employee_signature TEXT,
  ADD COLUMN IF NOT EXISTS employee_signature_name TEXT,
  ADD COLUMN IF NOT EXISTS manager_signature TEXT,
  ADD COLUMN IF NOT EXISTS manager_signature_name TEXT;

-- Evaluations have no signature concept yet: add timestamps too.
ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS employee_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS manager_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS employee_signature TEXT,
  ADD COLUMN IF NOT EXISTS employee_signature_name TEXT,
  ADD COLUMN IF NOT EXISTS manager_signature TEXT,
  ADD COLUMN IF NOT EXISTS manager_signature_name TEXT;

-- =============================================
-- 2. Employee self-signing RPCs (SECURITY DEFINER)
-- =============================================
-- Professional interview
CREATE OR REPLACE FUNCTION sign_professional_interview_as_employee(
  p_id UUID,
  p_signature TEXT,
  p_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE professional_interviews
  SET employee_signature = p_signature,
      employee_signature_name = p_name,
      employee_signed_at = now()
  WHERE id = p_id
    AND company_id = get_user_company_id()
    AND employee_id = get_user_employee_id();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not allowed to sign this professional interview';
  END IF;
END;
$$;

-- Annual evaluation
CREATE OR REPLACE FUNCTION sign_evaluation_as_employee(
  p_id UUID,
  p_signature TEXT,
  p_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE evaluations
  SET employee_signature = p_signature,
      employee_signature_name = p_name,
      employee_signed_at = now()
  WHERE id = p_id
    AND company_id = get_user_company_id()
    AND employee_id = get_user_employee_id();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not allowed to sign this evaluation';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION sign_professional_interview_as_employee(UUID, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION sign_evaluation_as_employee(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION sign_professional_interview_as_employee(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION sign_evaluation_as_employee(UUID, TEXT, TEXT) TO authenticated;
