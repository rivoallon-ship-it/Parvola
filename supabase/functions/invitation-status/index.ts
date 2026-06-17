import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://parvola.vercel.app",
  "https://talent-review-eta.vercel.app",
  "https://talent-review.vercel.app",
  "http://localhost:3000",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") || "";
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return null;
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
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

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profiles, error: profilesError } = await adminClient
      .from("profiles")
      .select("id, employee_id")
      .eq("company_id", callerProfile.company_id)
      .not("employee_id", "is", null);

    if (profilesError) {
      console.error("Failed to fetch profiles:", profilesError.message);
      return new Response(JSON.stringify({ error: "Failed to fetch profiles" }), {
        status: 500,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const result: Record<string, "registered" | "invited"> = {};

    if (profiles && profiles.length > 0) {
      // Look up each user's sign-in state via the admin API.
      const lookups = await Promise.all(
        profiles.map((p) => adminClient.auth.admin.getUserById(p.id))
      );
      profiles.forEach((p, idx) => {
        const lastSignInAt = lookups[idx].data?.user?.last_sign_in_at;
        result[p.employee_id as string] = lastSignInAt ? "registered" : "invited";
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("invitation-status error:", (err as Error).message);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
