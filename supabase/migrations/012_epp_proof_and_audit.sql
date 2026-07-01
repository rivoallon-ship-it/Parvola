-- =============================================
-- Parvola — Migration 012: EPP proof, lock, delivery & audit (Lot A)
-- =============================================
-- Reinforces the professional interview (EPP) domain as legal proof:
--   1. Post-signature lock — once BOTH parties have signed, the content
--      becomes immutable at the DATABASE level (not only in the React UI),
--      regardless of whether the campaign is still active.
--   2. Signed snapshot — an immutable JSONB copy of the final content is
--      frozen server-side at the exact moment of the second signature. The
--      printable report is built from this snapshot, never from mutable
--      fields.
--   3. Delivery tracking — delivered_at / delivered_by record the handover
--      of the report to the employee, SEPARATELY from the signature.
--   4. Minimal audit — created_by / updated_by are stamped server-side from
--      auth.uid(); the frontend is never trusted to fill them.
--
-- NOTE: prepared but NOT applied automatically. Push only after explicit
-- confirmation (npx supabase db push). The frontend degrades gracefully
-- until then: lock is also enforced in the service/UI layer from the
-- existing signature timestamps, and the report falls back to live fields
-- when signed_snapshot is absent.
-- =============================================

-- =============================================
-- 1. Columns
-- =============================================
-- created_by / updated_by / delivered_by hold auth.uid(); kept as plain UUID
-- (no FK) to keep this audit layer decoupled and apply-safe.
ALTER TABLE professional_interviews
  ADD COLUMN IF NOT EXISTS signed_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_by UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS updated_by UUID;

COMMENT ON COLUMN professional_interviews.signed_snapshot IS
  'Immutable JSONB copy of the final EPP content, frozen server-side at the second signature. Source of truth for the printable report / legal proof.';
COMMENT ON COLUMN professional_interviews.delivered_at IS
  'When the report was handed to the employee (distinct from signature).';
COMMENT ON COLUMN professional_interviews.delivered_by IS
  'auth.uid() of the user who recorded the handover.';
COMMENT ON COLUMN professional_interviews.created_by IS
  'auth.uid() of the creator (stamped server-side).';
COMMENT ON COLUMN professional_interviews.updated_by IS
  'auth.uid() of the last writer (stamped server-side).';

-- =============================================
-- 2. Audit on INSERT
-- =============================================
CREATE OR REPLACE FUNCTION professional_interview_audit_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.created_by := auth.uid();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_professional_interview_audit_insert ON professional_interviews;
CREATE TRIGGER trg_professional_interview_audit_insert
  BEFORE INSERT ON professional_interviews
  FOR EACH ROW EXECUTE FUNCTION professional_interview_audit_insert();

-- =============================================
-- 3. Lock + snapshot + audit on UPDATE
-- =============================================
-- Fires for BOTH the manager's direct UPDATE and the employee's
-- SECURITY DEFINER signing RPC (which performs an UPDATE), so the snapshot
-- freezes whichever party signs second.
CREATE OR REPLACE FUNCTION professional_interview_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  was_locked BOOLEAN := OLD.signed_snapshot IS NOT NULL;
  now_double_signed BOOLEAN :=
    NEW.employee_signed_at IS NOT NULL AND NEW.manager_signed_at IS NOT NULL;
BEGIN
  -- Server-side audit
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();

  -- Stamp who recorded the handover, the first time delivered_at is set
  IF NEW.delivered_at IS NOT NULL AND OLD.delivered_at IS NULL THEN
    NEW.delivered_by := auth.uid();
  END IF;

  -- Immutability: once locked, only delivery fields may change
  IF was_locked THEN
    IF NEW.career_review          IS DISTINCT FROM OLD.career_review
       OR NEW.skills_acquired      IS DISTINCT FROM OLD.skills_acquired
       OR NEW.evolution_mobility   IS DISTINCT FROM OLD.evolution_mobility
       OR NEW.evolution_notes      IS DISTINCT FROM OLD.evolution_notes
       OR NEW.training_wishes      IS DISTINCT FROM OLD.training_wishes
       OR NEW.conclusions          IS DISTINCT FROM OLD.conclusions
       OR NEW.employee_comment     IS DISTINCT FROM OLD.employee_comment
       OR NEW.manager_comment      IS DISTINCT FROM OLD.manager_comment
       OR NEW.status               IS DISTINCT FROM OLD.status
       OR NEW.scheduled_at         IS DISTINCT FROM OLD.scheduled_at
       OR NEW.conducted_at         IS DISTINCT FROM OLD.conducted_at
       OR NEW.employee_signed_at   IS DISTINCT FROM OLD.employee_signed_at
       OR NEW.manager_signed_at    IS DISTINCT FROM OLD.manager_signed_at
       OR NEW.employee_signature   IS DISTINCT FROM OLD.employee_signature
       OR NEW.employee_signature_name IS DISTINCT FROM OLD.employee_signature_name
       OR NEW.manager_signature    IS DISTINCT FROM OLD.manager_signature
       OR NEW.manager_signature_name  IS DISTINCT FROM OLD.manager_signature_name
       OR NEW.signed_snapshot      IS DISTINCT FROM OLD.signed_snapshot
    THEN
      RAISE EXCEPTION
        'Professional interview % is signed and locked; only delivery can be recorded.', OLD.id
        USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  -- Freeze the immutable snapshot at the moment of the second signature
  IF now_double_signed AND OLD.signed_snapshot IS NULL THEN
    NEW.signed_snapshot := jsonb_build_object(
      'version', 1,
      'frozenAt', now(),
      'careerReview', NEW.career_review,
      'skillsAcquired', NEW.skills_acquired,
      'evolutionMobility', NEW.evolution_mobility::text,
      'evolutionNotes', NEW.evolution_notes,
      'trainingWishes', NEW.training_wishes,
      'conclusions', NEW.conclusions,
      'employeeComment', NEW.employee_comment,
      'managerComment', NEW.manager_comment,
      'employeeSignedAt', NEW.employee_signed_at,
      'managerSignedAt', NEW.manager_signed_at,
      'employeeSignatureName', NEW.employee_signature_name,
      'managerSignatureName', NEW.manager_signature_name
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_professional_interview_before_update ON professional_interviews;
CREATE TRIGGER trg_professional_interview_before_update
  BEFORE UPDATE ON professional_interviews
  FOR EACH ROW EXECUTE FUNCTION professional_interview_before_update();
