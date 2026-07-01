-- =============================================
-- Parvola — Migration 011: EPP framework 4/8 years
-- =============================================
-- Regulatory correction of the "entretien professionnel" (EPP) domain.
--
-- Since 31 December 2025 the legal framework is NO LONGER biennial with a
-- 6-year recap. The applicable rules are now:
--   - first interview within the first year following hire,
--   - a professional interview every 4 years,
--   - a recap "état des lieux" every 8 years,
--   - an interview must be offered when the employee returns from certain
--     long absences (maternity/parental/carer leave, sabbatical, extended
--     sick leave, elected mandate, etc.).
--
-- This migration is DOCUMENTATION ONLY: it does not alter any table
-- structure, data, or RLS policy. It records the corrected framework as
-- database metadata (COMMENT ON) so the schema is self-describing and the
-- previous, misleading comments from migration 008 are superseded.
--
-- NOTE: prepared but NOT applied automatically. Push only after explicit
-- confirmation (npx supabase db push).
-- =============================================

COMMENT ON TABLE professional_campaigns IS
  'EPP campaigns (entretien professionnel). Framework since 2025-12-31: first interview within 1 year of hire, then every 4 years, with an 8-year recap ("état des lieux"). Distinct from performance evaluations (no rating, no 9-box).';

COMMENT ON TABLE professional_interviews IS
  'Individual EPP records. Periodicity: 4 years (see column conducted_at); 8-year recap tracked per employee. Also re-triggered on return from long leave.';

COMMENT ON COLUMN professional_interviews.conducted_at IS
  'Date the interview was actually held. Anchor for the next 4-year due date and the 8-year "état des lieux".';

COMMENT ON INDEX idx_professional_interviews_employee_conducted IS
  'Composite index (employee_id, conducted_at) for the chronological per-employee history used by the 8-year "état des lieux" recap.';
