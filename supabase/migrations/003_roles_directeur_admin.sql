-- =============================================
-- Talent Review — Migration 003: Add new enum values
-- =============================================
-- Must be in its own migration because ALTER TYPE ADD VALUE
-- cannot be used in the same transaction as queries using
-- the new values.
-- =============================================

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'directeur';
