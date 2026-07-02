-- =============================================
-- Parvola — Migration 013: Employee hire date (Lot B)
-- =============================================
-- Adds employees.hire_date (nullable). The EPP legal framework anchors two
-- deadlines on the hire date:
--   - first professional interview within 1 year of hire,
--   - the 8-year "état des lieux" recap.
-- Without it, only the 4-year cadence (from the last conducted interview)
-- can be computed. The column is nullable: HR fills it progressively, and
-- the UI shows "non renseignée" when absent.
--
-- NOTE: prepared but NOT applied automatically. Push only after explicit
-- confirmation. The frontend only reads/writes this column when
-- EMPLOYEE_CONFIG.hireDateEnabled is true (src/constants/config.ts) — flip
-- it right after applying this migration.
-- =============================================

ALTER TABLE employees ADD COLUMN IF NOT EXISTS hire_date DATE;

COMMENT ON COLUMN employees.hire_date IS
  'Hire date. Anchors the EPP first-interview deadline (1 year) and the 8-year "état des lieux" (see PROFESSIONAL_INTERVIEW_CONFIG in the frontend).';
