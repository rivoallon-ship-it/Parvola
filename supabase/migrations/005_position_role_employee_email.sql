-- =============================================
-- Migration 005: Add role to positions, email to employees
-- =============================================

-- Ajouter le rôle au poste (défaut: employee)
ALTER TABLE positions ADD COLUMN role user_role NOT NULL DEFAULT 'employee';

-- Ajouter l'email à l'employé
ALTER TABLE employees ADD COLUMN email TEXT;
