import type { CompanySignupForm } from '@/types';

// ============================================
// Service d'inscription entreprise
// ============================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export async function signupCompany(
  form: CompanySignupForm
): Promise<{ companyId: string; userId: string }> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/signup-company`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyName: form.companyName,
      slug: form.slug,
      email: form.email,
      password: form.password,
      userName: form.userName,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: 'Signup failed' }));
    throw new Error(data.error || 'Signup failed');
  }

  return response.json();
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  // We'll use a simple approach: try to query via the public API
  // Since companies table has RLS, we need a different approach
  // For now, the signup-company function will return 409 if slug is taken
  // This is a lightweight client-side helper that could be extended later
  return slug.length >= 3;
}
