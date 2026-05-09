import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

export async function requireOwner(req: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ownerEmail = Deno.env.get("OWNER_EMAIL")?.trim().toLowerCase();
  const authorization = req.headers.get("authorization") || "";
  const jwt = authorization.replace(/^Bearer\s+/i, "");

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: json({ error: "Missing Supabase Edge Function secrets" }, 500) };
  }

  if (!ownerEmail) {
    return { error: json({ error: "Missing OWNER_EMAIL Edge Function secret" }, 500) };
  }

  if (!jwt) {
    return { error: json({ error: "Owner session is required" }, 401) };
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await admin.auth.getUser(jwt);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) {
    return { error: json({ error: "Invalid owner session" }, 401) };
  }

  if (email !== ownerEmail) {
    return { error: json({ error: "Forbidden" }, 403) };
  }

  return { admin, user: data.user };
}
