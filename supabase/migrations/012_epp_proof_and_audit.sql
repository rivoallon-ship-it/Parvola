-- =============================================
-- Parvola — Migration 012: EPP proof, lock, delivery & audit (Lot A)
-- =============================================
-- Reinforces the professional interview (EPP) domain as legal proof:
--   1. Post-signature lock — once BOTH parties have signed, the content
--      becomes immutable at the DATABASE level (not only in the React UI),
--      regardless of whether the campaign is still active. The lock is
--      derived from the signature timestamps themselves, NOT from the
--      presence of the snapshot, so rows signed before this migration are
--      locked too.
--   2. Signed snapshot — an immutable JSONB copy of the final content is
--      frozen server-side at the exact moment of the second signature. The
--      printable report is built from this snapshot, never from mutable
--      fields. Rows already double-signed before this migration are
--      BACKFILLED (flagged "backfilled": true).
--   3. Delivery tracking — delivered_at / delivered_by record the handover
--      of the report to the employee, SEPARATELY from the signature.
--      Delivery can only be recorded once the interview is double-signed,
--      and is one-shot (cannot be cleared or moved afterwards).
--   4. Minimal audit — created_by / updated_by are stamped server-side from
--      auth.uid(); the frontend is never trusted to fill them.
--   5. Anti-forgery — signed_snapshot, created_by, delivered_by (and
--      created_at) are writable ONLY by the triggers below: any
--      client-supplied value on INSERT or UPDATE is discarded.
--
-- Amended after the Lot A audit (P1-1 lock basis + backfill, P1-2 protected
-- columns, P2 snapshot content / delivery-requires-signature / employee
-- re-sign guard).
--
-- NOTE: prepared but NOT applied automatically. Push only after explicit
-- confirmation (npx supabase db push). The frontend degrades gracefully
-- until then: lock is also enforced in the service/UI layer from the
-- existing signature timestamps, the report falls back to live fields when
-- signed_snapshot is absent, and the delivery action stays hidden behind
-- PROFESSIONAL_INTERVIEW_CONFIG.deliveryTrackingEnabled (src/constants/
-- config.ts) until this migration is live.
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
  'Immutable JSONB copy of the final EPP content, frozen server-side at the second signature (or backfilled for rows signed before migration 012). Source of truth for the printable report / legal proof. Written only by triggers.';
COMMENT ON COLUMN professional_interviews.delivered_at IS
  'When the report was handed to the employee (distinct from signature). Only recordable after double signature; one-shot.';
COMMENT ON COLUMN professional_interviews.delivered_by IS
  'auth.uid() of the user who recorded the handover. Written only by triggers.';
COMMENT ON COLUMN professional_interviews.created_by IS
  'auth.uid() of the creator (stamped server-side, immutable afterwards).';
COMMENT ON COLUMN professional_interviews.updated_by IS
  'auth.uid() of the last writer (stamped server-side).';

-- =============================================
-- 2. Snapshot builder (single definition, used by trigger AND backfill)
-- =============================================
CREATE OR REPLACE FUNCTION build_professional_interview_snapshot(
  pi professional_interviews,
  p_frozen_at TIMESTAMPTZ,
  p_backfilled BOOLEAN
)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT jsonb_build_object(
    'version', 1,
    'frozenAt', p_frozen_at,
    'backfilled', p_backfilled,
    'employeeId', pi.employee_id,
    'conductedAt', pi.conducted_at,
    'careerReview', pi.career_review,
    'skillsAcquired', pi.skills_acquired,
    'evolutionMobility', pi.evolution_mobility::text,
    'evolutionNotes', pi.evolution_notes,
    'trainingWishes', pi.training_wishes,
    'conclusions', pi.conclusions,
    'employeeComment', pi.employee_comment,
    'managerComment', pi.manager_comment,
    'employeeSignedAt', pi.employee_signed_at,
    'managerSignedAt', pi.manager_signed_at,
    'employeeSignatureName', pi.employee_signature_name,
    'managerSignatureName', pi.manager_signature_name
  );
$$;

-- =============================================
-- 3. Backfill — rows already double-signed BEFORE this migration
-- =============================================
-- Runs before the triggers are created, so it is not subject to the lock.
-- frozenAt = moment of the second signature (best available evidence).
UPDATE professional_interviews
SET signed_snapshot = build_professional_interview_snapshot(
      professional_interviews,
      GREATEST(employee_signed_at, manager_signed_at),
      true
    )
WHERE employee_signed_at IS NOT NULL
  AND manager_signed_at IS NOT NULL
  AND signed_snapshot IS NULL;

-- =============================================
-- 4. Audit + anti-forgery on INSERT
-- =============================================
CREATE OR REPLACE FUNCTION professional_interview_audit_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.created_by := auth.uid();
  NEW.updated_by := auth.uid();
  -- Proof columns can never be planted at creation time.
  NEW.signed_snapshot := NULL;
  NEW.delivered_at := NULL;
  NEW.delivered_by := NULL;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_professional_interview_audit_insert ON professional_interviews;
CREATE TRIGGER trg_professional_interview_audit_insert
  BEFORE INSERT ON professional_interviews
  FOR EACH ROW EXECUTE FUNCTION professional_interview_audit_insert();

-- =============================================
-- 5. Lock + snapshot + delivery + audit on UPDATE
-- =============================================
-- Fires for BOTH the manager's direct UPDATE and the employee's
-- SECURITY DEFINER signing RPC (which performs an UPDATE), so the snapshot
-- freezes whichever party signs second.
CREATE OR REPLACE FUNCTION professional_interview_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  -- Lock derives from the SIGNATURES, not from the snapshot: rows signed
  -- before this migration are locked too (audit finding P1-1).
  was_locked BOOLEAN :=
    OLD.employee_signed_at IS NOT NULL AND OLD.manager_signed_at IS NOT NULL;
  now_double_signed BOOLEAN;
BEGIN
  -- Anti-forgery (audit finding P1-2): these columns are written ONLY by
  -- this trigger — any client-supplied value is discarded.
  NEW.signed_snapshot := OLD.signed_snapshot;
  NEW.created_by      := OLD.created_by;
  NEW.created_at      := OLD.created_at;
  NEW.delivered_by    := OLD.delivered_by;

  -- Server-side audit
  NEW.updated_by := auth.uid();
  NEW.updated_at := now();

  IF was_locked THEN
    -- Immutability: once double-signed, no content, scheduling, status or
    -- signature field may change.
    IF NEW.career_review             IS DISTINCT FROM OLD.career_review
       OR NEW.skills_acquired         IS DISTINCT FROM OLD.skills_acquired
       OR NEW.evolution_mobility      IS DISTINCT FROM OLD.evolution_mobility
       OR NEW.evolution_notes         IS DISTINCT FROM OLD.evolution_notes
       OR NEW.training_wishes         IS DISTINCT FROM OLD.training_wishes
       OR NEW.conclusions             IS DISTINCT FROM OLD.conclusions
       OR NEW.employee_comment        IS DISTINCT FROM OLD.employee_comment
       OR NEW.manager_comment         IS DISTINCT FROM OLD.manager_comment
       OR NEW.status                  IS DISTINCT FROM OLD.status
       OR NEW.scheduled_at            IS DISTINCT FROM OLD.scheduled_at
       OR NEW.conducted_at            IS DISTINCT FROM OLD.conducted_at
       OR NEW.employee_signed_at      IS DISTINCT FROM OLD.employee_signed_at
       OR NEW.manager_signed_at       IS DISTINCT FROM OLD.manager_signed_at
       OR NEW.employee_signature      IS DISTINCT FROM OLD.employee_signature
       OR NEW.employee_signature_name IS DISTINCT FROM OLD.employee_signature_name
       OR NEW.manager_signature       IS DISTINCT FROM OLD.manager_signature
       OR NEW.manager_signature_name  IS DISTINCT FROM OLD.manager_signature_name
    THEN
      RAISE EXCEPTION
        'Professional interview % is signed and locked; only delivery can be recorded.', OLD.id
        USING ERRCODE = 'check_violation';
    END IF;

    -- Delivery: one-shot. Stamp who recorded it; refuse any later change.
    IF OLD.delivered_at IS NULL AND NEW.delivered_at IS NOT NULL THEN
      NEW.delivered_by := auth.uid();
    ELSIF NEW.delivered_at IS DISTINCT FROM OLD.delivered_at THEN
      RAISE EXCEPTION
        'Delivery of professional interview % is already recorded and cannot be changed.', OLD.id
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  -- Not locked yet: delivery cannot precede the double signature (one hands
  -- over a SIGNED report).
  IF NEW.delivered_at IS DISTINCT FROM OLD.delivered_at THEN
    RAISE EXCEPTION
      'Cannot record delivery of professional interview % before both signatures.', OLD.id
      USING ERRCODE = 'check_violation';
  END IF;

  -- Freeze the immutable snapshot at the moment of the second signature.
  now_double_signed :=
    NEW.employee_signed_at IS NOT NULL AND NEW.manager_signed_at IS NOT NULL;
  IF now_double_signed THEN
    NEW.signed_snapshot := build_professional_interview_snapshot(NEW, now(), false);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_professional_interview_before_update ON professional_interviews;
CREATE TRIGGER trg_professional_interview_before_update
  BEFORE UPDATE ON professional_interviews
  FOR EACH ROW EXECUTE FUNCTION professional_interview_before_update();

-- =============================================
-- 6. Employee signing RPC — no re-signing (audit finding P2-1)
-- =============================================
-- Same definition as migration 010, plus the employee_signed_at IS NULL
-- guard: once signed, the employee's signature cannot be overwritten.
-- (Grants from migration 010 are preserved by CREATE OR REPLACE.)
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
    AND employee_id = get_user_employee_id()
    AND employee_signed_at IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not allowed to sign this professional interview (or already signed)';
  END IF;
END;
$$;
