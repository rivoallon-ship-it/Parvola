-- Security hardening: restrict INSERT/DELETE on companies table
-- Companies should only be created via the signup-company Edge Function (service_role)
-- Companies should never be deleted by regular users

CREATE POLICY "No direct company creation"
  ON companies FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No direct company deletion"
  ON companies FOR DELETE TO authenticated
  USING (false);

-- Also restrict admin role assignment: only admin can update to admin/rh roles
-- (invite-user Edge Function already validates this, but add DB-level safety)
