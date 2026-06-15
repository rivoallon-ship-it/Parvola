import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ============================================
// Edge Function: signup-company
// Creates a new company + admin (RH) account
// Public endpoint (no auth required)
// ============================================

const ALLOWED_ORIGINS = [
  "https://parvola.vercel.app",
  "https://talent-review-eta.vercel.app",
  "https://talent-review.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    /^https:\/\/[\w-]+-rivoallon-ship-it\.vercel\.app$/.test(origin) ||
    /^https:\/\/parvola-[\w-]+\.vercel\.app$/.test(origin) ||
    /^https:\/\/talent-review-[\w-]+\.vercel\.app$/.test(origin);
  if (!allowed) {
    return null; // Origin not allowed
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Simple IP-based rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function jsonError(message: string, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (!cors) {
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405, cors);
  }

  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!checkRateLimit(ip)) {
      return jsonError("Too many signups. Try again later.", 429, cors);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return jsonError("Service misconfigured", 500, cors);
    }

    // Parse body
    const body = await req.json();
    const { companyName, slug, email, password, userName } = body;

    // Validate inputs
    if (!companyName || !slug || !email || !password || !userName) {
      return jsonError("All fields are required: companyName, slug, email, password, userName", 400, cors);
    }

    if (typeof companyName !== "string" || companyName.trim().length < 2 || companyName.length > 200) {
      return jsonError("Company name must be between 2 and 200 characters", 400, cors);
    }

    if (typeof slug !== "string" || !SLUG_REGEX.test(slug)) {
      return jsonError("Invalid slug format. Use 3-50 lowercase letters, numbers, and hyphens.", 400, cors);
    }

    if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
      return jsonError("Invalid email format", 400, cors);
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return jsonError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400, cors);
    }

    if (typeof userName !== "string" || userName.trim().length < 1 || userName.length > 200) {
      return jsonError("Invalid name", 400, cors);
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Check slug uniqueness
    const { data: existingCompany } = await adminClient
      .from("companies")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existingCompany) {
      return jsonError("This company identifier is already taken", 409, cors);
    }

    // Create auth user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: userName },
    });

    if (createError) {
      console.error("User creation failed:", createError.message);
      if (createError.message.includes("already been registered")) {
        return jsonError("This email is already registered", 409, cors);
      }
      return jsonError("Failed to create account", 400, cors);
    }

    // Create company
    const { data: company, error: companyError } = await adminClient
      .from("companies")
      .insert({
        name: companyName.trim(),
        slug,
        owner_id: newUser.user.id,
      })
      .select()
      .single();

    if (companyError) {
      console.error("Company creation failed:", companyError.message);
      // Rollback: delete the auth user
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return jsonError("Failed to create company", 500, cors);
    }

    // Create profile
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: newUser.user.id,
      name: userName.trim(),
      photo: "👤",
      role: "admin",
      company_id: company.id,
      team_ids: [],
    });

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
      // Rollback: delete company and auth user
      await adminClient.from("companies").delete().eq("id", company.id);
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return jsonError("Failed to create user profile", 500, cors);
    }

    return new Response(
      JSON.stringify({
        companyId: company.id,
        userId: newUser.user.id,
      }),
      {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("signup-company error:", (err as Error).message);
    return jsonError("Internal server error", 500, cors);
  }
});
