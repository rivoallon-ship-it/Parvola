// Captures the auth "type" from the URL hash synchronously at module load,
// BEFORE supabase-js processes and clears the hash (detectSessionInUrl).
//
// When an admin invites a user, Supabase sends a link that redirects back to
// the app with `#access_token=...&type=invite`. We need to know it was an
// invite (or a password recovery) so we can show the onboarding / set-password
// screen instead of dropping the user straight into the app with no password.
//
// IMPORTANT: this module must be imported before '@/lib/supabase' so it reads
// the hash first. It is imported as the very first line of main.tsx.

function parseAuthType(): string | null {
  if (typeof window === 'undefined' || !window.location.hash) return null;
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return params.get('type');
}

export const initialAuthType = parseAuthType();

/** True when the user landed via an invitation or a password-reset link. */
export const arrivedViaInvite =
  initialAuthType === 'invite' || initialAuthType === 'recovery';
