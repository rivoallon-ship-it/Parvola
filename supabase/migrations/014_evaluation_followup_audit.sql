-- =============================================
-- Parvola — Migration 014: Talent Review follow-up & audit (Lot C)
-- =============================================
-- Adds RH follow-up + minimal audit to the performance evaluation domain
-- (Talent Review), WITHOUT touching the EPP domain:
--   1. Reminder tracking — last_reminder_at / reminder_count trace the manual
--      reminders sent by RH for late evaluations. The app sets
--      last_reminder_at; reminder_count is incremented server-side.
--   2. Validation audit — validated_by / validated_at are stamped
--      server-side (auth.uid()) when an evaluation transitions to 'validated'.
--      The frontend is never trusted to fill them.
--
-- Anti-forgery: validated_by, validated_at and reminder_count are writable
-- ONLY by the trigger below — client-supplied values are discarded.
--
-- NOTE: prepared but NOT applied automatically. Push only after explicit
-- confirmation. The reminder-tracking WRITE is gated behind
-- TALENT_REVIEW_CONFIG.reminderTrackingEnabled (src/constants/config.ts):
-- leave it false until this migration is live. Reading the columns is
-- tolerant (select '*' returns them only once they exist).
-- =============================================

ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS last_reminder_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reminder_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS validated_by UUID,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;

COMMENT ON COLUMN evaluations.last_reminder_at IS
  'When RH last reminded about this late evaluation (manual reminder).';
COMMENT ON COLUMN evaluations.reminder_count IS
  'Number of reminders sent; incremented server-side by trigger.';
COMMENT ON COLUMN evaluations.validated_by IS
  'auth.uid() of the validator, stamped server-side on the transition to validated.';
COMMENT ON COLUMN evaluations.validated_at IS
  'When the evaluation was validated (stamped server-side).';

-- Backfill validated_at for rows already validated (best available evidence:
-- the row's last update). validated_by stays NULL (author unknown historically).
UPDATE evaluations
SET validated_at = updated_at
WHERE validation_status = 'validated'
  AND validated_at IS NULL;

CREATE OR REPLACE FUNCTION evaluation_audit_before_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Anti-forgery: these columns are written only here.
  NEW.validated_by   := OLD.validated_by;
  NEW.validated_at   := OLD.validated_at;
  NEW.reminder_count := OLD.reminder_count;

  -- Validation audit on the transition to 'validated'.
  IF NEW.validation_status = 'validated'
     AND OLD.validation_status IS DISTINCT FROM 'validated' THEN
    NEW.validated_by := auth.uid();
    NEW.validated_at := now();
  END IF;

  -- Reminder counter: the app sets last_reminder_at = now(); count here.
  IF NEW.last_reminder_at IS DISTINCT FROM OLD.last_reminder_at
     AND NEW.last_reminder_at IS NOT NULL THEN
    NEW.reminder_count := OLD.reminder_count + 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_evaluation_audit_before_update ON evaluations;
CREATE TRIGGER trg_evaluation_audit_before_update
  BEFORE UPDATE ON evaluations
  FOR EACH ROW EXECUTE FUNCTION evaluation_audit_before_update();
