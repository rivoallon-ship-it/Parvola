import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Security: restrict CORS to known origins
const ALLOWED_ORIGINS = [
  "https://parvola.vercel.app",
  "https://talent-review-eta.vercel.app",
  "https://talent-review.vercel.app",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return null; // Origin not allowed
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

// Dynamic invite permissions based on caller role
function getAllowedInviteRoles(callerRole: string): string[] {
  switch (callerRole) {
    case "admin":
      return ["rh", "directeur", "manager", "employee"];
    case "rh":
      return ["directeur", "manager", "employee"];
    default:
      return [];
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10; // invitations per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  const cors = getCorsHeaders(req);

  if (!cors) {
    return new Response("Forbidden", { status: 403 });
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    // 1. Verify caller is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(JSON.stringify({ error: "Service misconfigured" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 2. Check caller is admin or RH
    const { data: callerProfile } = await callerClient
      .from("profiles")
      .select("role, company_id")
      .eq("id", caller.id)
      .single();

    if (!callerProfile || !["admin", "rh"].includes(callerProfile.role)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 3. Rate limiting
    if (!checkRateLimit(caller.id)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
        status: 429,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 4. Parse and validate request body
    const body = await req.json();
    const { email, name, role, photo, employeeId, teamIds, establishmentId, establishmentIds } = body;

    if (!email || !name || !role) {
      return new Response(JSON.stringify({ error: "email, name, and role are required" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate email format
    if (typeof email !== "string" || !EMAIL_REGEX.test(email) || email.length > 254) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate name
    if (typeof name !== "string" || name.length < 1 || name.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid name" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate role — only allow roles the caller is permitted to invite
    const allowedRoles = getAllowedInviteRoles(callerProfile.role);
    if (!allowedRoles.includes(role)) {
      return new Response(JSON.stringify({ error: `Invalid role. Allowed: ${allowedRoles.join(", ")}` }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate optional UUIDs
    if (employeeId && !UUID_REGEX.test(employeeId)) {
      return new Response(JSON.stringify({ error: "Invalid employeeId format" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (establishmentId && !UUID_REGEX.test(establishmentId)) {
      return new Response(JSON.stringify({ error: "Invalid establishmentId format" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (teamIds && (!Array.isArray(teamIds) || teamIds.some((id: string) => !UUID_REGEX.test(id)))) {
      return new Response(JSON.stringify({ error: "Invalid teamIds format" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    if (establishmentIds && (!Array.isArray(establishmentIds) || establishmentIds.some((id: string) => !UUID_REGEX.test(id)))) {
      return new Response(JSON.stringify({ error: "Invalid establishmentIds format" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Validate photo (optional, limit length)
    const sanitizedPhoto = (typeof photo === "string" && photo.length <= 20) ? photo : "👤";

    // 5. Create user via admin API
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: newUser, error: createError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { name, role, photo: sanitizedPhoto },
    });

    if (createError) {
      console.error("User creation failed:", createError.message);
      return new Response(JSON.stringify({ error: "Failed to create user" }), {
        status: 400,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // 6. Create profile (inherit company_id from caller)
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: newUser.user.id,
      name,
      photo: sanitizedPhoto,
      role,
      employee_id: employeeId || null,
      team_ids: teamIds || [],
      establishment_id: establishmentId || null,
      establishment_ids: establishmentIds || [],
      company_id: callerProfile.company_id,
    });

    if (profileError) {
      console.error("Profile creation failed:", profileError.message);
      // Clean up: delete the auth user since profile creation failed
      await adminClient.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: "Failed to create user profile" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ user: { id: newUser.user.id, email: newUser.user.email } }),
      {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("invite-user error:", (err as Error).message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
