/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Missing Supabase server secrets", { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase
    .from("social_accounts")
    .select("platform, scope, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const seen = new Set<string>();
  const connections = (data ?? [])
    .filter((row) => {
      if (seen.has(row.platform)) return false;
      seen.add(row.platform);
      return true;
    })
    .map((row) => ({
      platform: row.platform,
      connected: true,
      scope: row.scope,
      updated_at: row.updated_at,
    }));

  return new Response(JSON.stringify({ connections }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
